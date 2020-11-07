/*
 * © InfoSplatch
 * princesses-cb.fserv.fr
 */

// modules require
const log = require('cozy-logger').namespace('Linky-logs')
const sqlite3 = require('sqlite3').verbose()
const openSqlite = require('sqlite').open
const moment = require('moment')

// local require
const enedisConnect = require('./enedis_connect')

// config require
const config = require('../../var/config.json')

// init var
//https://github.com/JoshuaWise/better-sqlite3/blob/HEAD/docs/api.md
let db
let influxDb
let refreshInProgress

async function refresh(dbFilePath) {
    if (refreshInProgress) {
        log('warn', `Refresh already started`)
    }

    refreshInProgress = true

    const startTime = moment()

    log('info', `Init refresh at ${startTime.format('DD/MM/YYYY HH:mm:ss')}`)

    // open db
    if (db === undefined) {
        await openDb(dbFilePath)
    }

    // open influx db
    if (influxDb === undefined) {
        await initInfluxdb(config.influxDb)
    }

    const sessionValid = await enedisConnect.connect(config.enedis)

    if (sessionValid === false) {
        log('info', `Connection failure, can not continue`)
        return
    }

    const dataEnergy = await enedisConnect.getEnergy()
    const dataPower = await enedisConnect.getPower()

    Promise.all([
        saveEnergy(db, dataEnergy, 'day'),
        saveEnergy(db, dataEnergy, 'week'),
        saveEnergy(db, dataEnergy, 'month'),
        saveEnergy(db, dataEnergy, 'year'),
        savePower(db, dataPower),

        saveEnergyToInfluxdb(dataEnergy),
        savePowerToInfluxdb(dataPower)
    ]).then(() => {
        log(
            'info',
            `End refresh after ${moment().diff(startTime, 'seconds')} seconds`
        )
        refreshInProgress = false
    })
}

async function rectifyUtcTz(dateStr) {
    // Fucking Enedis website not update anything between summer or winter
    // France, winter : UTC+1
    // France, summer : UTC+2
    // Always they give time with UTC+2
    // Then add 1 hour and change to UTC+1 in winter

    const date = moment(dateStr)

    if (!date.isDST() && dateStr.substr(-5) === '+0200') {
        date.add(1, 'hour')
    }

    return date.format('YYYY-MM-DDTHH:mm:ss.SSSZZ')
}

async function saveEnergy(db, data, type) {
    log(
        'info',
        `Save energy (${type}) at ${moment().format('DD/MM/YYYY HH:mm:ss')}`
    )

    // Can use : INSERT OR REPLACE
    let action = 'REPLACE'
    if (type === 'day') {
        action = 'IGNORE'
    }
    let stmt = await db.prepare(
        `INSERT OR ${action} INTO ${type} (time, label, lowercase_label, value, date_start, date_end) VALUES (?, ?, ?, ?, ?, ?)`
    )

    for (let energy of data[type]) {
        if (isNaN(energy.value)) continue

        const [dateStartRectified, dateEndRectified] = await Promise.all([
            rectifyUtcTz(energy.date_start),
            rectifyUtcTz(energy.date_end)
        ])

        await stmt.run(
            dateStartRectified,
            energy.label,
            energy.lowercase_label,
            energy.value,
            dateStartRectified,
            dateEndRectified
        )
    }

    await stmt.finalize()

    log(
        'info',
        `End of save energy (${type}) at ${moment().format(
            'DD/MM/YYYY HH:mm:ss'
        )}`
    )
}

async function savePower(db, data) {
    log('info', `Save power at ${moment().format('DD/MM/YYYY HH:mm:ss')}`)

    let stmt = await db.prepare(
        'INSERT OR IGNORE INTO power (time, value) VALUES (?, ?)'
    )

    for (let power of data) {
        if (isNaN(power.value)) continue

        const powerTime = await rectifyUtcTz(power.time)

        await stmt.run(powerTime, power.value)
    }

    await stmt.finalize()

    log(
        'info',
        `End of save power at ${moment().format('DD/MM/YYYY HH:mm:ss')}`
    )
}

async function openDb(dbFilePath) {
    db = await openSqlite({
        filename: dbFilePath,
        driver: sqlite3.Database
    }).catch(err => {
        log('error', `SQLite Error : ${err}`)
        return
    })

    for (let dataType of ['day', 'week', 'month', 'year']) {
        await db.run(
            'CREATE TABLE IF NOT EXISTS "' +
                dataType +
                '" (' +
                '"time" TIMESTAMP NOT NULL PRIMARY KEY UNIQUE,' +
                '"label" TEXT NOT NULL,' +
                '"lowercase_label" TEXT NOT NULL,' +
                '"value" TEXT NOT NULL,' +
                '"date_start" TEXT NOT NULL,' +
                '"date_end" TEXT NOT NULL' +
                ');'
        )
    }

    await db.run(
        'CREATE TABLE IF NOT EXISTS "power" (' +
            '"time" TIMESTAMP NOT NULL PRIMARY KEY UNIQUE,' +
            '"value" TEXT NOT NULL' +
            ');'
    )

    return db
}

async function saveEnergyToInfluxdb(data) {
    // check if influxdb is enabled
    if (influxDb === null) {
        return null
    }

    log(
        'info',
        `Save energy (day) to InfluxDb at ${moment().format(
            'DD/MM/YYYY HH:mm:ss'
        )}`
    )

    const pointsArray = []

    for (let energy of data['day']) {
        if (isNaN(energy.value)) continue

        pointsArray.push({
            fields: { value: energy.value },
            timestamp: moment(energy.date_start).toDate()
        })
    }

    await influxDb
        .writeMeasurement('energy', pointsArray)
        .catch(err => log('error', `Error with InfluxDb : ${err}`))

    log(
        'info',
        `End of save energy (day) to InfluxDb at ${moment().format(
            'DD/MM/YYYY HH:mm:ss'
        )}`
    )
}

async function savePowerToInfluxdb(data) {
    // check if influxdb is enabled
    if (influxDb === null) {
        return null
    }

    log(
        'info',
        `Save power to InfluxDb at ${moment().format('DD/MM/YYYY HH:mm:ss')}`
    )

    const pointsArray = []

    for (let power of data) {
        if (isNaN(power.value)) continue

        pointsArray.push({
            fields: { value: power.value },
            timestamp: moment(power.time).toDate()
        })
    }

    await influxDb
        .writeMeasurement('power', pointsArray)
        .catch(err => log('error', `Error with InfluxDb : ${err}`))

    log(
        'info',
        `End of save power to InfluxDb at ${moment().format(
            'DD/MM/YYYY HH:mm:ss'
        )}`
    )
}

async function initInfluxdb(config) {
    if (config.enabled === false) {
        influxDb = null
        return null
    }

    //https://node-influx.github.io/class/src/index.js~InfluxDB.html
    const Influx = require('influx')
    influxDb = new Influx.InfluxDB({
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        database: config.database
    })
}

// Export
module.exports = {
    refresh
}

/*
 * © InfoSplatch
 * princesses-cb.fserv.fr
 */

// modules require
const log = require('cozy-logger').namespace('Linky-logs')
const sqlite3 = require('sqlite3').verbose()
const openSqlite = require('sqlite').open
const cron = require('node-cron')
const moment = require('moment')

// local require
const enedisGetData = require('./enedis_get_data')

// config require
const config = require('../../var/config.json')

// db
const dbFilePath = './data/linky_logs.db'

// init local vars
let db

async function init() {
    // open db
    db = await openSqlite({
        filename: dbFilePath,
        driver: sqlite3.Database
    }).catch(err => {
        log('error', `SQLite Error : ${err}`, 'EnedisApi')
    })

    cron.schedule(config.cron, () => {
        log('info', `Cron refresh`, 'EnedisApi')
        enedisGetData.refresh(dbFilePath)
    })
}

async function addApiRoutes(app) {
    log('info', `Add routes for Api`, 'EnedisApi')

    app.get('/api/:name', showData)
    app.get('/api/:name/:dateStart', showData)
    app.get('/api/:name/:dateStart/:dateEnd', showData)
}

async function showData(req, res) {
    log(
        'info',
        `showData() [name#${req.params.name}, dateStart#${req.params.dateStart}, dateEnd#${req.params.dateEnd}]`,
        'EnedisApi'
    )

    const startShowData = moment()

    // get types wanted
    let type = req.params.name.split('-')

    // parse and update date
    if (req.params.dateStart === undefined) {
        // we take all data inside db
        req.params.dateStart = '1990-10-30'
        req.params.dateEnd = undefined // for now
    } else {
        if (req.params.dateEnd === undefined) {
            req.params.dateEnd = req.params.dateStart
        } else {
            if (req.params.dateEnd === 'now') {
                req.params.dateEnd = undefined // for now
            }
        }
    }

    // get date wanted
    const date = {
        format: 'YYYY-MM-DDTHH:mm:ss.SSSZZ',
        // default: before beginning of linky
        start: moment(req.params.dateStart),
        // default : same date start, if now = today
        end: moment(req.params.dateEnd)
    }

    // init json array
    const json = {}
    const promise = []

    // update type if we want all or chart:all
    if (
        type.indexOf('all') > -1 ||
        type.indexOf('full:all') > -1 ||
        type.indexOf('chart:all') > -1 ||
        type.indexOf('chart:all_from_last') > -1
    ) {
        const wantAll = type.indexOf('all') > -1
        const wantAllMore = type.indexOf('full:all') > -1
        const wantAllChart = type.indexOf('chart:all') > -1
        const wantAllChartFromLast = type.indexOf('chart:all_from_last') > -1

        type = []

        if (wantAll) type.push('day', 'week', 'month', 'year', 'power')
        if (wantAllMore)
            type.push('full:day', 'full:week', 'full:month', 'full:year')
        if (wantAllChart)
            type.push(
                'chart:day',
                'chart:week',
                'chart:month',
                'chart:year',
                'chart:power'
            )
        if (wantAllChartFromLast)
            type.push(
                'chart:day_last_week',
                'chart:day_previous_week',
                'chart:day_last_month',
                'chart:day_previous_month',
                'chart:day_last_year',
                'chart:day_previous_year',
                'chart:month_this_year',
                'chart:power_last_day'
            )
    }

    // for every type possible, if wanted then add them :

    if (type.indexOf('full:day') > -1)
        promise.push(getEnergyByDayFull(date, json))
    if (type.indexOf('full:week') > -1)
        promise.push(getEnergyByWeekFull(date, json))
    if (type.indexOf('full:month') > -1)
        promise.push(getEnergyByMonthFull(date, json))
    if (type.indexOf('full:year') > -1)
        promise.push(getEnergyByYearFull(date, json))

    if (type.indexOf('day') > -1) promise.push(getEnergyByDay(date, json))
    if (type.indexOf('week') > -1) promise.push(getEnergyByWeek(date, json))
    if (type.indexOf('month') > -1) promise.push(getEnergyByMonth(date, json))
    if (type.indexOf('year') > -1) promise.push(getEnergyByYear(date, json))
    if (type.indexOf('power') > -1) promise.push(getPowerByHalfHour(date, json))

    if (type.indexOf('chart:day') > -1)
        promise.push(getEnergyByDayChartPoints(date, json))
    if (type.indexOf('chart:day_last_week') > -1) {
        const lastInsertTime = await getTimeLastInsertInsideDb('day')
        const date2 = {
            format: date.format,
            start: moment(lastInsertTime)
                .subtract('1', 'week')
                .add(1, 'day'),
            end: moment(lastInsertTime)
        }
        promise.push(
            getEnergyByDayChartPoints(date2, json, 'chart:day_last_week')
        )
    }
    if (type.indexOf('chart:day_previous_week') > -1) {
        const lastInsertTime = await getTimeLastInsertInsideDb('day')
        const date2 = {
            format: date.format,
            start: moment(lastInsertTime)
                .subtract(2, 'week')
                .add(1, 'day'),
            end: moment(lastInsertTime).subtract(1, 'week')
        }
        promise.push(
            getEnergyByDayChartPoints(date2, json, 'chart:day_previous_week')
        )
    }
    if (type.indexOf('chart:day_last_month') > -1) {
        const lastInsertTime = await getTimeLastInsertInsideDb('day')
        log('critical', lastInsertTime)
        const date2 = {
            format: date.format,
            start: moment(lastInsertTime)
                .subtract('1', 'month')
                .add(1, 'day'),
            end: moment(lastInsertTime)
        }
        log('critical', date2.start.format(date2.format))
        log('critical', date2.end.format(date2.format))
        promise.push(
            getEnergyByDayChartPoints(date2, json, 'chart:day_last_month')
        )
    }
    if (type.indexOf('chart:day_previous_month') > -1) {
        const lastInsertTime = await getTimeLastInsertInsideDb('day')
        const date2 = {
            format: date.format,
            start: moment(lastInsertTime)
                .subtract(2, 'months')
                .add(1, 'day'),
            end: moment(lastInsertTime).subtract(1, 'month')
        }
        promise.push(
            getEnergyByDayChartPoints(date2, json, 'chart:day_previous_month')
        )
    }
    if (type.indexOf('chart:day_last_year') > -1) {
        const lastInsertTime = await getTimeLastInsertInsideDb('day')
        const date2 = {
            format: date.format,
            start: moment(lastInsertTime).subtract(364, 'days'),
            end: moment(lastInsertTime)
        }
        promise.push(
            getEnergyByDayChartPoints(date2, json, 'chart:day_last_year')
        )
    }
    if (type.indexOf('chart:day_previous_year') > -1) {
        const lastInsertTime = await getTimeLastInsertInsideDb('day')
        const date2 = {
            format: date.format,
            start: moment(lastInsertTime).subtract(364 * 2, 'days'),
            end: moment(lastInsertTime).subtract(365, 'days')
        }
        promise.push(
            getEnergyByDayChartPoints(date2, json, 'chart:day_previous_year')
        )
    }
    if (type.indexOf('chart:week') > -1)
        promise.push(getEnergyByWeekChartPoints(date, json))
    if (type.indexOf('chart:month') > -1)
        promise.push(getEnergyByMonthChartPoints(date, json))
    if (type.indexOf('chart:month_this_year') > -1) {
        const lastInsertTime = await getTimeLastInsertInsideDb('month')
        const date2 = {
            format: date.format,
            start: moment(lastInsertTime).startOf('year'),
            end: moment(lastInsertTime).endOf('year')
        }
        promise.push(
            getEnergyByMonthChartPoints(date2, json, 'chart:month_this_year')
        )
    }
    if (type.indexOf('chart:year') > -1)
        promise.push(getEnergyByYearChartPoints(date, json))
    if (type.indexOf('chart:power') > -1)
        promise.push(getPowerByHalfHourChartPoints(date, json))
    if (type.indexOf('chart:power_last_day') > -1) {
        const lastInsertTime = await getTimeLastInsertInsideDb('power')
        const momentLastDay = moment(lastInsertTime).subtract(1, 'day')
        const date2 = {
            format: date.format,
            start: momentLastDay,
            end: momentLastDay
        }
        promise.push(
            getPowerByHalfHourChartPoints(date2, json, 'chart:power_last_day')
        )
    }

    Promise.all(promise).then(() => {
        log(
            'info',
            `End get data, return json to browser (After ${moment().diff(
                startShowData,
                'milliseconds'
            )} milliseconds)`
        )
        res.json(json)
    })
}

async function getEnergyByDayFull(date, json, label = null) {
    return getEnergyByDay(date, json, true, label)
}

async function getEnergyByWeekFull(date, json) {
    return getEnergyByWeek(date, json, true)
}

async function getEnergyByMonthFull(date, json) {
    return getEnergyByMonth(date, json, true)
}

async function getEnergyByYearFull(date, json) {
    return getEnergyByYear(date, json, true)
}

async function getEnergyByDay(date, json, full = false, label = null) {
    const dateStr = {
        start: date.start.startOf('day').format(date.format),
        end: date.end.endOf('day').format(date.format)
    }
    return await getEnergyByType('day', dateStr, json, full, label)
}

async function getEnergyByWeek(date, json, full = false, label = null) {
    const dateStr = {
        start: date.start.startOf('isoWeek').format(date.format),
        end: date.end.endOf('isoWeek').format(date.format)
    }
    return await getEnergyByType('week', dateStr, json, full, label)
}

async function getEnergyByMonth(date, json, full = false, label = null) {
    const dateStr = {
        start: date.start.startOf('month').format('YYYY-MM-DD'),
        end: date.end.endOf('month').format('YYYY-MM-DD')
    }
    return await getEnergyByType('month', dateStr, json, full, label)
}

async function getEnergyByYear(date, json, full = false, label = null) {
    const dateStr = {
        start: date.start.startOf('year').format('YYYY-MM-DD'),
        end: date.end.endOf('year').format('YYYY-MM-DD')
    }
    return await getEnergyByType('year', dateStr, json, full, label)
}

async function getPowerByHalfHour(date, json, full = false, label = null) {
    const dateStr = {
        start: date.start
            .startOf('day')
            .add('1800', 'seconds')
            .format(date.format),
        end: date.end.add('1', 'day').format(date.format)
    }
    return await getEnergyByType('power', dateStr, json, full, label)
}

async function getEnergyByDayChartPoints(date, json, label = null) {
    return getEnergyByDay(date, json, null, label)
}

async function getEnergyByWeekChartPoints(date, json, label = null) {
    return getEnergyByWeek(date, json, null, label)
}

async function getEnergyByMonthChartPoints(date, json, label = null) {
    return getEnergyByMonth(date, json, null, label)
}

async function getEnergyByYearChartPoints(date, json, label = null) {
    return getEnergyByYear(date, json, null, label)
}

async function getPowerByHalfHourChartPoints(date, json, label = null) {
    return getPowerByHalfHour(date, json, null, label)
}

async function getEnergyByType(type, dateStr, json, full, label = null) {
    const data = await getEnergyInsideDb(type, dateStr)

    // chart
    if (full === null) {
        if (label === null) {
            label = 'chart:' + type
        }
        return getEnergyByTypeChartPoints(label, json, data)
    }

    json[(full ? 'full:' : '') + type] = {}

    data.forEach(value => {
        const valueParsedFloat = parseFloat(value.value)
        if (full) {
            json['full:' + type][value.label] = {
                value: valueParsedFloat,
                lowercase_label: value.lowercase_label,
                date_start: value.date_start,
                date_end: value.date_end
            }
        } else {
            if (type === 'power') {
                value.label = value.time
            }
            json[type][value.label] = valueParsedFloat
        }
    })

    return json
}

async function getEnergyByTypeChartPoints(label, json, data) {
    json[label] = []

    data.forEach(value => {
        const valueTime = moment(value.time)
        const valueTimeStr = valueTime.valueOf()
        const valueParsedFloat = parseFloat(value.value)

        json[label].push([
            valueTimeStr,
            valueParsedFloat,
            value.time,
            valueTime.isDST(),
            valueTime.format('dddd DD MMMM HH:mm:ss.SSS Z')
        ])
    })

    return json
}

async function getEnergyInsideDb(type, dateStr) {
    log('info', `Get ${type} from ${dateStr.start} to ${dateStr.end}`)

    let stmt = await db.prepare(
        `SELECT * FROM ${type} WHERE time >= @date_start and time <= @date_end`
    )

    const data = await stmt.all({
        '@date_start': dateStr.start,
        '@date_end': dateStr.end
    })

    await stmt.finalize()

    return data
}

async function getTimeLastInsertInsideDb(table) {
    log('info', `Get last insert time inside ${table}`)

    let stmt = await db.prepare(`SELECT time FROM ${table} ORDER BY time DESC`)

    const data = await stmt.get()

    await stmt.finalize()

    return data.time
}

// Export
module.exports = {
    init,
    addApiRoutes
}

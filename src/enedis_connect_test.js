/*
 * © InfoSplatch
 */

// module require
const log = require('cozy-logger').namespace('EnedisConnectTest')

// local require
const enedisConnect = require('./lib/enedis_connect')

// config require
const config = require('../var/config.json')

async function refresh() {
    const sessionValid = await enedisConnect.connect(config.enedis)

    if (sessionValid === false) {
        log('info', `Connection failure, can not continue`)
        return
    }

    const dataEnergy = await enedisConnect.getEnergy()
    const dataPower = await enedisConnect.getPower()

    log('critical', dataEnergy)
    log('critical', dataPower)
}

refresh()

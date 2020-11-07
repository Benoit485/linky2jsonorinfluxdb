/*
 * © InfoSplatch
 */

// module require
const log = require('cozy-logger').namespace('EnedisGetDataTest')

// local require
const enedisGetData = require('./lib/enedis_get_data')

// db
const dbFilePath = './data/linky_logs.db'

log('info', `Init refresh`)

async function refresh() {
    await enedisGetData.refresh(dbFilePath)
}

refresh()

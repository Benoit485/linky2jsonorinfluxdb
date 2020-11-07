/*
 * © InfoSplatch
 * princesses-cb.fserv.fr
 */

// modules require
const log = require('cozy-logger').namespace('Linky-logs')
const moment = require('moment')

async function rectifyUtcTz(dateStr) {
    // Fucking Enedis website not update anything between summer or winter
    // France, winter : UTC+1
    // France, summer : UTC+2
    // Always they give time with UTC+2
    // Then add 1 hour and change to UTC+1 in winter

    moment.locale('fr')

    const date = moment(dateStr)

    log('info', `dateStr => ${dateStr}`)
    log('info', `dateStr.substr(-5) => ${dateStr.substr(-5)}`)
    log('info', `date.isDST() => ${date.isDST()}`)

    if (!date.isDST() && dateStr.substr(-5) === '+0200') {
        log('info', `add 1 hour`)
        date.add(1, 'hour')
    }

    log('info', `date.format() => ${date.format()}`)
    log('info', `date.format('ZZ') => ${date.format('ZZ')}`)
    log('info', `date.format('LLLL') => ${date.format('LLLL')}`)
    log('info', `date.local().format() => ${date.local().format()}`)
    log('info', `date.local(true).format() => ${date.local(true).format()}`)
    log('info', `date.utc().format() => ${date.utc().format()}`)
    log('info', `date.utc(true).format() => ${date.utc(true).format()}`)

    return date.format()
}

async function refresh() {
    rectifyUtcTz('2020-04-22T00:00:00.000+0200')
}

refresh()

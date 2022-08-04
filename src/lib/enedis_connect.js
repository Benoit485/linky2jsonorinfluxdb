/*
 * © InfoSplatch
 * princesses-cb.fserv.fr
 */

// modules require
const log = require('cozy-logger').namespace('EnedisConnect')
const moment = require('moment')
const requestFactory = require('cozy-konnector-libs/dist/libs/request')

// vars
let requestJson
let av2InterneId
let prmId

// enedis urls
const urlCookie = 'https://mon-compte-particulier.enedis.fr'
const urlEnedisAuthenticate =
    'https://apps.lincs.enedis.fr/authenticate?target=https://mon-compte-particulier.enedis.fr/suivi-de-mesures/'
const urlConnect =
    'https://mon-compte.enedis.fr/auth/json/authenticate?realm=/enedis&forward=true&spEntityID=SP-ODW-PROD&goto=/auth/SSOPOST/metaAlias/enedis/providerIDP?ReqID%#{reqID}%26index%3Dnull%26acsURL%3Dhttps://apps.lincs.enedis.fr/saml/SSO%26spEntityID%3DSP-ODW-PROD%26binding%3Durn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST&AMAuthCookie='
const urlConnect2 =
    'https://mon-compte.enedis.fr/auth/json/authenticate?realm=/enedis&spEntityID=SP-ODW-PROD&goto=/auth/SSOPOST/metaAlias/enedis/providerIDP?ReqID%#{reqID}%26index%3Dnull%26acsURL%3Dhttps://apps.lincs.enedis.fr/saml/SSO%26spEntityID%3DSP-ODW-PROD%26binding%3Durn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST&AMAuthCookie='
const urlAccount = 'https://mon-compte.enedis.fr'
const urlUserInfos = 'https://apps.lincs.enedis.fr/userinfos'
const urlGetPrmsId =
    'https://apps.lincs.enedis.fr/mes-mesures/api/private/v1/personnes/null/prms'
const urlEnergy =
    'https://apps.lincs.enedis.fr/mes-mesures/api/private/v1/personnes/#{@av2_interne_id}/prms/#{@prmId}/donnees-energie?dateDebut=#{begin_date}&dateFin=#{end_date}&mesuretypecode=CONS'
const urlPower =
    'https://apps.lincs.enedis.fr/mes-mesures/api/private/v1/personnes/#{@av2_interne_id}/prms/#{@prmId}/courbe-de-charge?dateDebut=#{begin_date}&dateFin=#{end_date}&mesuretypecode=CONS'

async function connect(authData) {
    log('info', `Connection ...`)

    // account
    const username = authData.username
    const password = authData.password
    const authenticationCookie = authData.cookieInternalAuthId

    // make cookie
    const cookie = requestFactory().cookie(
        `internalAuthId=${authenticationCookie}`
    )
    cookie.domain = 'enedis.fr'
    cookie.path = '/'
    //log('debug', cookie )

    // add cookie
    const jar = requestFactory().jar()
    jar.setCookie(cookie, encodeURI(urlCookie))
    //log('debug', jar.getCookies(encodeURI(urlCookie)) )

    // init request
    const requestDefaultOptions = {
        debug: false,
        cheerio: false,
        json: false,
        jar: jar,
        resolveWithFullResponse: false,
        followRedirect: false,
        followAllRedirects: false
    }
    const requestFull = requestFactory({
        ...requestDefaultOptions,
        resolveWithFullResponse: true
    })
    const requestCheerio = requestFactory({
        ...requestDefaultOptions,
        cheerio: true
    })
    requestJson = requestFactory({
        // requestJson is global for use with getData
        ...requestDefaultOptions,
        json: true
    })

    log('info', `Step 1 : authentification`)
    log('debug', `url: ${urlEnedisAuthenticate}`)
    const $responseAuthenticate = await requestCheerio(
        urlEnedisAuthenticate
    ).catch(response => {
        log(
            'error',
            `{Step 1} Reception error code ${response.statusCode} (Expected : 200)`
        )
    })

    // return when error
    if ($responseAuthenticate === undefined) return false

    log('info', `Reception request SAML`)
    const $form = $responseAuthenticate('form')
    const formFields = $form.serializeArray()
    const samlRequest = formFields.filter(
        field => field.name === 'SAMLRequest'
    )[0].value
    const urlSamlRequest = $form.attr('action')

    log('info', `Step 2 : send SSO SAMLRequest`)
    log('debug', `url: ${urlSamlRequest}`)
    const responseSendedSamlRequest = await requestFull({
        uri: urlSamlRequest,
        method: 'POST',
        form: {
            SAMLRequest: samlRequest
        },
        headers: {
            referer: urlEnedisAuthenticate
        },
        simple: false // for not return reject with promise when statusCode = 302
    }).catch(response => {
        log(
            'error',
            `{Step 2.1} Reception error code ${response.statusCode} (Expected : 302)`
        )
    })

    // return when error
    if (responseSendedSamlRequest === undefined) return false

    // return when error with status code
    if (responseSendedSamlRequest.statusCode !== 302) {
        log(
            'error',
            `{Step 2.2} Reception error code ${responseSendedSamlRequest.statusCode} (Expected : 302)`
        )
        return false
    }

    log('info', `Get the location and the reqId`)
    const reqId = responseSendedSamlRequest.headers.location.match(
        /ReqID%(.*?)%26/
    )[1]
    log('debug', `reqId : ${reqId}`)

    log(
        'info',
        `Step 3 : auth 1 - retrieve the template (thanks to cookie internalAuthId, the user is already set)`
    )
    const urlConnectFormatted = urlConnect.replace('#{reqID}', reqId)
    log('debug', `url: ${urlConnectFormatted}`)
    const jsonAuthDataBasic = await requestJson({
        uri: urlConnectFormatted,
        method: 'POST',
        headers: {
            referer: urlSamlRequest,
            'X-NoSession': true,
            'X-Password': 'anonymous',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Username': 'anonymous'
        }
    }).catch(response => {
        log(
            'error',
            `{Step 3.1} Reception error code ${response.statusCode} (Expected : 200)`
        )
    })

    // return when error
    if (jsonAuthDataBasic === undefined) return false

    // check if username is correct
    if (jsonAuthDataBasic.callbacks[0].input[0].value !== username) {
        log(
            'error',
            `Authentication error, the authentication_cookie is probably wrong`
        )
        return false
    }

    // fill with the password
    jsonAuthDataBasic.callbacks[1].input[0].value = password

    log('info', `Step 3 : auth 2 - send the auth data`)
    const urlConnect2Formatted = urlConnect2.replace('#{reqID}', reqId)
    log('debug', `url: ${urlConnect2Formatted}`)
    const jsonAuthUrlData = await requestJson({
        uri: urlConnect2Formatted,
        method: 'POST',
        headers: {
            referer: urlConnectFormatted,
            'X-NoSession': true,
            'X-Password': 'anonymous',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Username': 'anonymous'
        },
        body: jsonAuthDataBasic,
        json: true //  Automatically stringifies the body to JSON
    }).catch(response => {
        log(
            'error',
            `{Step 3.2} Reception error code ${response.statusCode} (Expected : 200)`
        )
    })

    // return when error
    if (jsonAuthUrlData === undefined) return false

    if (jsonAuthUrlData.tokenId === undefined) {
        log('error', `Password seem wrong (can not connect)`)
        return false
    }

    log('info', `Add the tokenId cookie`)
    const cookieTokenId = requestFactory().cookie(
        `enedisExt=${jsonAuthUrlData.tokenId}`
    )
    cookieTokenId.domain = 'enedis.fr'
    cookieTokenId.path = '/'

    jar.setCookie(cookieTokenId, encodeURI(urlCookie))
    //log('debug', jar.getCookies(encodeURI(urlCookie)) )

    log('info', `Step 4 : retrieve the SAMLresponse`)
    const url2 = urlAccount + jsonAuthUrlData.successUrl
    log('debug', `url: ${url2}`)
    const $response = await requestCheerio({
        uri: url2,
        headers: {
            referer: urlConnect2Formatted
        }
    }).catch(response => {
        log(
            'error',
            `{Step 4} Reception error code ${response.statusCode} (Expected : 200)`
        )
    })

    // return when error
    if ($response === undefined) return false

    const $form2 = $response('form')
    const formFields2 = $form2.serializeArray()
    const samlResponse = formFields2.filter(
        field => field.name === 'SAMLResponse'
    )[0].value
    const urlEndConnect = $response('form').attr('action')

    log('info', `Step 5 : post the SAMLresponse to finish the authentication`)
    log('debug', `url: ${urlEndConnect}`)
    const samlResponseToRequest = await requestFull({
        uri: urlEndConnect,
        method: 'POST',
        headers: {
            referer: jsonAuthUrlData.successUrl
        },
        form: {
            SAMLResponse: samlResponse
        },
        simple: false
    }).catch(response => {
        log(
            'error',
            `{Step 5.1} Reception error code ${response.statusCode} (Expected : 302)`
        )
    })

    // return when error
    if (samlResponseToRequest === undefined) return false

    // return when error with status code
    if (samlResponseToRequest.statusCode !== 302) {
        log(
            'error',
            `{Step 5.2} Reception error code ${samlResponseToRequest.statusCode} (Expected : 302)`
        )
        return false
    }

    // get information
    log('info', `Get userinfos ==> retrieve av2_interne_id`)
    const jsonUserData = await requestJson(urlUserInfos).catch(() => {
        log('error', `Authentication probably failed`)
    })

    // return when error
    if (jsonUserData === undefined) return false

    // set global var for getData
    av2InterneId = jsonUserData.userProperties.av2_interne_id
    log('info', `av2InterneId : ${av2InterneId}`)

    if (av2InterneId === undefined) {
        log('error', `Authentication probably failed`)
        return false
    }

    // get primary keyrmation
    log('info', `Retrieve primary key ==> prmId`)
    const jsonUserData2 = await requestJson(urlGetPrmsId).catch(() => {
        log('error', `Authentication probably failed`)
    })

    // return when error
    if (jsonUserData2 === undefined) return false

    // set global var for getData
    prmId = jsonUserData2[0].prmId
    log('info', `prmId : ${prmId}`)

    if (prmId === undefined) {
        log('error', `Authentication probably failed`)
        return false
    }

    log('info', `Authentication done`)

    return true
}

async function getEnergy() {
    return await getData({
        logFunction: `Get energy from last 3 years`,
        beginDate: moment().subtract(3, 'years'),
        url: urlEnergy,
        type: 'energy',
        transform: transformJsonEnergy
    })
}

async function getPower() {
    return await getData({
        logFunction: `Get power from last 7 days`,
        beginDate: moment().subtract(7, 'days'),
        url: urlPower,
        type: 'power',
        transform: transformJsonPower
    })
}

async function getData(source) {
    log('info', `${source.logFunction}`)

    const endDate = moment()
    const beginDate = source.beginDate

    const formatDate = 'DD-MM-YYYY'
    const endDateStr = endDate.format(formatDate)
    const beginDateStr = beginDate.format(formatDate)

    const url = getUrlFormatted(source.url, beginDateStr, endDateStr)

    log('debug', `url : ${url}`)

    const dataJson = await requestJson(url).catch(response => {
        log(
            'error',
            `Unable to retrieve data (${source.type}). Status Code ${response.statusCode}`
        )
    })

    // if error, return empty object
    if (dataJson === undefined) return {}

    log('debug', dataJson)

    return source.transform(dataJson)
}

function getUrlFormatted(urlSource, beginDateStr, endDateStr) {
    return urlSource
        .replace('#{@av2_interne_id}', av2InterneId)
        .replace('#{@prmId}', prmId)
        .replace('#{begin_date}', beginDateStr)
        .replace('#{end_date}', endDateStr)
}

function transformJsonEnergy(data) {
    const realData = data[1].CONS.aggregats

    return {
        day: parseEnergy(realData.JOUR),
        week: parseEnergy(realData.SEMAINE),
        month: parseEnergy(realData.MOIS),
        year: parseEnergy(realData.ANNEE)
    }
}

function parseEnergy(data) {
    const energy = []

    for (let index in data.labels) {
        const label = data.labels[index]
        const date = data.periodes[index]
        const value = data.datas[index]

        energy.push({
            label,
            value,
            lowercase_label: label.toLowerCase(),
            date_start: date.dateDebut,
            date_end: date.dateFin
        })
    }

    return energy
}

function transformJsonPower(data) {
    const power = []

    for (let index in data[1].CONS.labels) {
        const time = data[1].CONS.labels[index]
        const value = data[1].CONS.data[index]

        power.push({ time, value })
    }

    return power
}

// Export
module.exports = {
    connect,
    getEnergy,
    getPower
}

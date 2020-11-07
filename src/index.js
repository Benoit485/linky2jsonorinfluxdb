/*
 * © InfoSplatch
 */

// listen on ip / port
const listen = {
    ip: '0.0.0.0',
    port: 5254
}

// modules require
const log = require('cozy-logger').namespace('Linky-logs')
const http = require('http')
const express = require('express')
//const bodyParser = require('body-parser')

// local require
const enedis = require('./lib/enedis')

// init framework
const app = express()
//app.use(bodyParser.json()) // support json encoded bodies
//app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

// create server
var server = http.createServer(app)

server.on('connection', client =>
    log('info', `Connection ${client.originalUrl}`)
)

// log connections
app.use('/', function(req, res, next) {
    log('info', `Received request : ${req.originalUrl}`)
    next()
})

// serve public in static mode
app.use('/', express.static('public'))

// enedis init
enedis.init()

// enedis add route to server
enedis.addApiRoutes(app)

// listening
log('info', ` [*] Listening on ${listen.ip}:${listen.port}`)
server.listen(listen.port, listen.ip)

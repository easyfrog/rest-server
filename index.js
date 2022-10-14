// config
var config = require('./config')

// app
var express = require('express')
var app = express()

// express websocket
var ws = require('./src/ws')
ws(app)

// use CORS
var cors = require('cors')
app.use(cors())

// use json
app.use(express.json())

// use static folder
app.use(express.static(__dirname + '/public'));

// routes
var routes = require('./src/routes')
routes(app)

app.listen(config.port, () => {
	console.log('REST server started at', config.port)
})





const express = require('express'),
// ws = require('ws'),
path = require('path'),
fs = require('fs')

// const websocket = new ws.WebSocket('wss://api.lanyard.rest/socket', {})

// var heartInt = 30000

// function heartbeat() {
//     websocket.send(JSON.stringify({op: 3}))

//     setTimeout(() => {
//         heartbeat()
//     }, heartInt);
// }

// websocket.on('message', function mess(buffer, bing) {
//     var data = JSON.parse(buffer)
//     var opc = data.op

//     console.log(data)
    
//     if (opc == 1) {
//         heartint = buffer.heartbeat_interval
//         heartbeat()
//     }
// })

var app = express()

const PORT = process.env.PORT || 8080

const staticpath = path.join(__dirname, (process.env.STATIC_PATH || 'static/'))

app.use(express.static(staticpath))

app.listen(PORT, () => {
    console.log("Violets-Purgatory is now listening on port: " + PORT)
})


const express = require('express'),
    path = require('path'),
    fs = require('fs'),
    pageUpdater = require('./pageUpdater.js'),
    WebSocket = require("ws")

var app = express()

const PORT = process.env.PORT || 8080

const staticpath = path.join(__dirname, 'static')

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))

app.listen(PORT, () => {
    console.log("Violet's Purgatory is now listening on port: " + PORT)
})

var cachePath = path.join(__dirname, 'cached')
var assetPath = path.join(__dirname, "assets")

app.use("/fonts", express.static(path.join(assetPath, "fonts")))
app.use("/cached", express.static(cachePath))
app.use("/imgs", express.static(path.join(assetPath, "Images")))
app.use("/snds", express.static(path.join(assetPath, "Sounds")))

if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath)
} else {
    var files = fs.readdirSync(cachePath)
    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        fs.rmSync(path.join(cachePath, file))
    }
}

app.get("/discHTML", (req, res) => {
    res.send(pageUpdater.getActivities())
})

app.use(pageUpdater.middleWare)

var sockets = []

wsServer = WebSocket.Server;

let server = require('http').createServer()

wsServer = new wsServer({
    server: server,
    perMessageDeflate: false
})

server.on('request', app)

wsServer.on("connection", function connection(socket) {
    socket.on('message', function message(data) {
        data = JSON.parse(data)
        if (data.op == 3) {
            for (let index = 0; index < sockets.length; index++) {
                const socketData = sockets[index];
                if (socketData.socket == socket) {
                    sockets[index].lastPing = Date.now()
                }
            }

            socket.send(`{"op": 3}`)
        }
    })

    socket.send(JSON.stringify(lanyardData))
    socket.send(`{ "op": 1 }`)

    sockets.push({ socket, lastPing: Date.now() })

})


process.on('uncaughtException', (err, origin) => {
    fs.writeSync(
      process.stderr.fd,
      `Caught exception: ${err}\n` +
      `Exception origin: ${origin}`,
    );
  });  
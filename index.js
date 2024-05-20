const express = require('express'),
    path = require('path'),
    fs = require('fs'),
    pageUpdater = require('./pageUpdater.js'),
    WebSocket = require("ws")

var app = express()

const PORT = process.env.PORT || 8080

const staticpath = path.join(__dirname, 'static')
const cachePath = path.join(__dirname, 'cached')
const assetPath = path.join(__dirname, "assets")
const configPath = path.join(__dirname, 'config')

const configFile = path.join(configPath, "config.json")
const announcementFile = path.join(configPath, "announcement.html")

if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath)
}

if (!fs.existsSync(configFile)) {
    fs.writeFileSync(configFile, fs.readFileSync(path.join(assetPath, "defaults/config.json")))
}

if (!fs.existsSync(announcementFile)) {
    fs.writeFileSync(announcementFile, ``)
}

var constants = JSON.parse(fs.readFileSync(path.join(__dirname, 'constants.json')))

app.listen(PORT, () => {
    console.log("Violet's Purgatory is now listening on port: " + PORT)
})

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

process.on('uncaughtException', (err, origin) => {
    fs.writeSync(
      process.stderr.fd,
      `Caught exception: ${err}\n` +
      `Exception origin: ${origin}`,
    );
  });  
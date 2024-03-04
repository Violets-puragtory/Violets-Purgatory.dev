const express = require('express'),
    path = require('path'),
    fs = require('fs'),
    pageUpdater = require('./pageUpdater.js')

var app = express()

const PORT = process.env.PORT || 8080

const staticpath = path.join(__dirname, 'static')

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))

app.listen(PORT, () => {
    console.log("Violet's Purgatory is now listening on port: " + PORT)
})

var cachePath = path.join(staticpath, 'cached')
var fontPath = path.join(staticpath, "fonts")

app.use("/fonts", express.static(fontPath))

if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath)
} else {
    var files = fs.readdirSync(cachePath)
    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        fs.rmSync(path.join(cachePath, file))
    }
}

app.use(pageUpdater.middleWare)
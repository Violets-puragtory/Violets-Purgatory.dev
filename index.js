const express = require('./expressHandler.js'),
    path = require('path'),
    fs = require('fs'),
    WebSocket = require("ws")

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

if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath)
}

if (!fs.existsSync(path.join(cachePath, "emojis"))) {
    fs.mkdirSync(path.join(cachePath, "emojis"))
}

process.on('uncaughtException', (err, origin) => {
    fs.writeSync(
        process.stderr.fd,
        `Caught exception: ${err}\n` +
        `Exception origin: ${origin}`,
    );
});
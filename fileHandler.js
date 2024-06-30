const path = require("path"),
fs = require("fs")

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

if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath)
}

if (!fs.existsSync(path.join(cachePath, "emojis"))) {
    fs.mkdirSync(path.join(cachePath, "emojis"))
}
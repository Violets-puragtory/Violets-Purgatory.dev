const express = require('express'),
    path = require('path'),
    fs = require('fs'),
    pageUpdater = require('./pageUpdater.js'),
    ytjs = require("youtubei.js")

var app = express()

const PORT = process.env.PORT || 8080

const staticpath = path.join(__dirname, 'static')

var mostRecentVideo = undefined
var lanyardData = undefined

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))

var thumborInstances = config.thumborInstances

var thumbCount = 0

function getThumbor() {
    thumbCount += 1
    return thumborInstances[thumbCount % thumborInstances.length] + "unsafe"
}

async function getMostRecentVid() {
    innertube = await ytjs.Innertube.create()
    var video = await (await (await ytjs.Innertube.create()).getChannel('UChcrBJNJLZucy3TPyGyAY2g'))
    video = video.current_tab.content.contents[1].contents[0].content.items[0]

    mostRecentVideo = video.endpoint.payload.videoId
    console.log(mostRecentVideo)
}

getMostRecentVid()

app.listen(PORT, () => {
    console.log("Violet's Purgatory is now listening on port: " + PORT)
})

if (!fs.existsSync(path.join(staticpath, 'cached'))) {
    fs.mkdirSync(path.join(staticpath, 'cached'))
}

var randomQuotes = config.quotes

var commitCount = "300+"

function timeFormatter(seconds) {
    seconds = Math.ceil(seconds)
    var minutes = Math.floor(seconds / 60)

    if (seconds % 60 < 10) {
        return `${minutes}:0${seconds % 60}`
    } else {
        return `${minutes}:${seconds % 60}`
    }

}

function gameTimeFormatter(seconds) {
    seconds = Math.ceil(seconds)
    var minutes = Math.ceil(seconds / 60)
    var hours = Math.floor(minutes / 60)
    if (seconds <= 60) {
        return 'about ' + seconds + ' seconds'
    } else if (minutes < 60) {
        return `${minutes} Minutes`
    }

    return `${hours} hours and ${minutes % 60} minutes`

}

app.use(pageUpdater.middleWare)
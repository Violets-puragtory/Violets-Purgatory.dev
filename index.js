const express = require('express'),
    path = require('path'),
    fs = require('fs'),
    pageUpdater = require('./pageUpdater.js'),
    ytjs = require("youtubei.js")

var app = express()

const PORT = process.env.PORT || 8080

const staticpath = path.join(__dirname, 'static')

var mostRecentVideo = undefined

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))

var thumborInstances = config.thumborInstances

var thumbCount = 0

function getThumbor() {
    thumbCount += 1
    return thumborInstances[thumbCount % thumborInstances.length] + "unsafe"
}

// async function getMostRecentVid() {
//     innertube = await ytjs.Innertube.create()
//     var video = await (await (await ytjs.Innertube.create()).getChannel('UChcrBJNJLZucy3TPyGyAY2g'))
//     video = video.current_tab.content.contents[1].contents[0].content.items[0]

//     mostRecentVideo = video.endpoint.payload.videoId
//     console.log(mostRecentVideo)
// }

// getMostRecentVid()

app.listen(PORT, () => {
    console.log("Violet's Purgatory is now listening on port: " + PORT)
})

var cachePath = path.join(staticpath, 'cached')
var imgPath = path.join(staticpath, 'imgs')

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

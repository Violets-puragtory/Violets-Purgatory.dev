const express = require('express'),
    path = require('path'),
    fs = require('fs'),
    WebSocket = require('ws'),
    minify = require('minify-html'),
    pageUpdater = require('./pageUpdater.js')

var app = express()

const PORT = process.env.PORT || 8080

const staticpath = path.join(__dirname, 'static')
const resourcePath = path.join(__dirname, 'resources')

const mainpage = resourcePath + '/mainPage.html'
var lanyardData = undefined

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))

var thumborInstances = config.thumborInstances

var activityImages = config.activityImages

var highlight = config.highlightedWords

var uptime = Date.now()
var lastLanyardUpdate = Date.now()
var lastPong = Date.now()

var thumbCount = 0

function getThumbor() {
    thumbCount += 1
    return thumborInstances[thumbCount % thumborInstances.length] + "unsafe"
}

app.listen(PORT, () => {
    console.log("Violet's Purgatory is now listening on port: " + PORT)
})

var cachedImages = {}

if (!fs.existsSync(path.join(staticpath, 'cached'))) {
    fs.mkdirSync(path.join(staticpath, 'cached'))
}

var randomQuotes = config.quotes

var commitCount = "300+"

function get_img_url(activity, size = "large_image") {

    if ("assets" in activity) {
        var image = activity.assets[size]

        if (image) {
            if (image.includes("https/")) {
                return decodeURIComponent('https://' + image.substr(image.indexOf('https/') + 6, image.length))
            } else if (image.includes("spotify")) {
                return decodeURIComponent('https://i.scdn.co/image/' + image.substr(image.indexOf('spotify:') + 8, image.length))
            } else {
                return decodeURIComponent(`https://cdn.discordapp.com/app-assets/${activity.application_id}/${image}.png`)
            }
        }
    }

    if (!image) {
        if (activity.name in activityImages) {
            return decodeURIComponent(activityImages[activity.name])
        } else {
            return null
        }
    }
}

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

// Lanyard Stuffs

function socketeer() {
    var lanyard = new WebSocket('https://api.violets-purgatory.dev')
    function ping(dur) {
        lanyard.send(JSON.stringify({
            op: 3
        }))
        setTimeout(() => {
            ping(dur)
            if (Date.now() - lastPong > 120000) {
                console.log("FUCK!")
                lanyard.close()
                socketeer()
            }
        }, dur);
    }

    lanyard.addEventListener("message", async (res) => {
        var data = JSON.parse(res.data)
        if (data.op == 1) {
            ping(30000)
            lastPong = Date.now()
        } else if (data.op == 3) {
            lastPong = Date.now()
        } else if (data.op == 0) {
            lanyardData = data.d
            lastLanyardUpdate = Date.now()

            for (let index = 0; index < lanyardData.activities.length; index++) {
                const activity = lanyardData.activities[index];

                if (get_img_url(activity)) {
                    var url = get_img_url(activity)
                    var fn = Math.ceil(Math.random() * 100_000_000_000).toString()
                    var fp = path.join(__dirname, 'static/cached', fn)

                    if (!cachedImages[url]) {
                        const response = await (await fetch(url)).arrayBuffer()

                        fs.writeFileSync(fp, Buffer.from(response))

                        cachedImages[url] = fn
                    }
                }

                if (get_img_url(activity, "small_image")) {
                    var url = get_img_url(activity, "small_image")
                    var fn = Math.ceil(Math.random() * 100_000_000_000).toString()
                    var fp = path.join(__dirname, 'static/cached', fn)

                    if (!cachedImages[url]) {
                        const response = await (await fetch(url)).arrayBuffer()

                        fs.writeFileSync(fp, Buffer.from(response))

                        cachedImages[url] = fn
                    }
                }
            }

        }
    })
}

socketeer()

// app.get('/index.html', async (req, res) => {
//     console.log(req.params[0])
//     var html = await (pageUpdate(req.params[0]))
//     res.send(minify.minify(html))
// })

app.use((req, res, next) => {
    res.status(404).send(`
        <link rel="stylesheet" href="/style.css">
        <h1>404</h1>
        <p>Uh oh... I think your lost? There's nothing here :P</p>
        `)
})

async function updateCommits() {
    var codebergResponse = await (await fetch(`https://codeberg.org/Bingus_Violet/Violets-Purgatory/src/branch/${process.env.BRANCH || "origin"}`)).text()
    var commits = codebergResponse.substring(0, codebergResponse.indexOf("Commits"))
    commits = commits.substring(commits.lastIndexOf("<b>") + 3, commits.lastIndexOf("</b>"))
    commitCount = commits
}

updateCommits()
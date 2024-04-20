const path = require('path'),
    fs = require('fs'),
    WebSocket = require('ws'),
    minify = require('minify-html'),
    activityToHTML = require("./overcomplicatedStatuses.js"),
    weatherGenerator = require("./weatherGenerator")

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))

var highlightedWords = config.highlightedWords
var quotes = config.quotes
var titles = config.titles

var commitCount = "400+"

var lanyardData = undefined

var uptime = Date.now()

function firstToUpper(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

var thumborURL = "https://thumbor.violets-purgatory.dev/unsafe/"

function converter(html, query) {
    while (html.includes("{PATH_")) {
        var pagePath = html.substring(html.indexOf("{PATH_"))
        pagePath = pagePath.substring(6, pagePath.indexOf('}'))
        
        var stringIndex = `{PATH_${pagePath}}`
        pagePath = pagePath.toLowerCase()

        var pageHTML = fs.readFileSync(path.join(__dirname, 'static', pagePath, 'index.html')).toString()
        pageHTML = pageHTML.substring(pageHTML.indexOf('<main>') + 6, pageHTML.indexOf('</main>'))
        html = html.replace(stringIndex, pageHTML)
    }

    var statusText = ""
    
    if (lanyardData) {
        var statusData = config.discStatuses[lanyardData.discord_status]
        var username = lanyardData.discord_user.username

        if (lanyardData.activities[0] && lanyardData.activities[0].type == 4) {
            var statusText = `<hr><p>${lanyardData.activities[0].state}</p>`
        }
    } else {
        var statusData = config.discStatuses.offline
        var username = "bingus_violet"
    }

    var time = new Date(Date.now())

    var bnchName = "Beta"
    var bnchSub = "beta."

    if (process.env.BRANCH == "dev") {
        bnchName = "Stable"
        bnchSub = ""
    }

    var replacers = {
        "BRANCH_NAME": bnchName,
        "BRANCH_SUB": bnchSub,
        "COMMIT_COUNT": commitCount,
        "RANDOM_QUOTE": quotes[Math.floor(Math.random() * quotes.length)],
        "QUOTE_COUNT": quotes.length,
        "RANDOM_TITLE": titles[Math.floor(Math.random() * titles.length)],
        "DISCORD_STATUS": 
        `<span style="color: ${statusData.color};">${statusData.text}</span>` + 
        `<style>.pfp { border-color: ${statusData.color} }</style>`,
        "UPTIME": uptime,
        "TOPBAR": `<div id="topbar"><h3><a href="/socials">Socials</a></h3></div>`,
        "DISCORD_USER": username,
        "CUSTOM_STATUS": statusText,
        "LATEST_YOUTUBE": "filler"
    }

    var rpTable = Object.keys(replacers)

    for (let index = 0; index < rpTable.length; index++) {
        const text = rpTable[index];
        html = html.replaceAll(`{${text}}`, replacers[text])
    }

    var bodyHTML = html.substring(html.indexOf("<body>") + 6, html.lastIndexOf("</body>"))
    var highTable = Object.keys(highlightedWords)
    for (let index = 0; index < highTable.length; index++) {
        var term = highTable[index];
        var replacement = `<span style="color: ${highlightedWords[term]}">${term}</span>`
        
        bodyHTML = bodyHTML.replaceAll(`{${term}}`, "TEMPORARY_REPLACE")
        bodyHTML = bodyHTML.replaceAll(term, replacement)
        bodyHTML = bodyHTML.replaceAll("TEMPORARY_REPLACE", `${term}`)
    }

    bodyHTML = bodyHTML.replaceAll("{ACTIVITIES}", activityToHTML.activitiesToHTML(lanyardData, cachedImages))

    html = html.substring(0, html.indexOf("<body>")) + bodyHTML + html.substring(html.indexOf("</body>") + 7)

    var weathers = ["rain", "none"]

    var weather = weathers[time.getDate() % weathers.length]

    if (weather == "rain" || "rain" in query || "hardRain" in query) {
        html = html.replaceAll("{WEATHER_MODIFIER}", weatherGenerator.makeRain("hardRain" in query))

        html = html.replaceAll("{WEATHER_TEXT}", `The rain is so pretty... <a href="?hardRain">I wish I saw it more...</a>`)
    } else {
        html = html.replaceAll("{WEATHER_MODIFIER}", "")
        html = html.replaceAll("{WEATHER_TEXT}", "")
    }

    return html
}

module.exports = {
    getActivities: function () {
        return activityToHTML.activitiesToHTML(lanyardData, cachedImages)
    },

    middleWare: function (req, res, next) {

        var filePath = (req.baseUrl + req.path).trim()

        if (!filePath.includes(".")) {
            if (filePath.charAt(filePath.length - 1) != '/') {
                res.redirect(filePath + '/')
                return
            }
            filePath = path.join(filePath, '/index.html')
        }

        filePath = path.join(__dirname, 'static', filePath || 'index.html')
        if (fs.existsSync(filePath)) {
            var data = fs.readFileSync(filePath).toString()
            
            res.contentType(path.basename(filePath))

            // if (req.path.includes(".css")) {
            //    res.setHeader("Content-Type", "text/css")
            // } else if (!req.path.includes(".woff2")) {
            //     data = converter(data, req.query)
            // }

            if (filePath.includes(".html")) {
                data = converter(data, req.query)
            }

            data = minify.minify(data)

            res.send(data)
        } else {
            res.status(404).send(`
            <link rel="stylesheet" href="/style.css">
            <h1>404</h1>
            <p>Uh oh... I think your lost? There's nothing here :P</p>
        `)
        }
    }
}

async function updateCommits() {
    var codebergResponse = await (await fetch(`https://codeberg.org/Bingus_Violet/Violets-Purgatory/src/branch/${process.env.BRANCH || "origin"}`)).text()
    var commits = codebergResponse.substring(0, codebergResponse.indexOf("Commits"))
    commits = commits.substring(commits.lastIndexOf("<b>") + 3, commits.lastIndexOf("</b>"))
    commitCount = commits.toString()
    if (process.env.BRANCH == "dev") {
        commitCount += " | Beta site!"
    }
}

updateCommits()

// Lanyard Stuffs

var lastLanyardUpdate = Date.now()
var lastPong = 0

var activityImages = config.activityImages
var cachedImages = {}

function get_img_url(activity, size = "large_image") {
    if ("assets" in activity) {
        var image = activity.assets[size]

        if (image) {
            if (image.includes("https/")) {
                return decodeURIComponent('https://' + image.substr(image.indexOf('https/') + 6, image.length))
            } else if (image.includes("spotify")) {
                return decodeURIComponent('https://i.scdn.co/image/' + image.substr(image.indexOf('spotify:') + 8, image.length))
            } else {
                return decodeURIComponent('https://cdn.discordapp.com/app-assets/' + activity.application_id + "/" + image + ".png")
            }
        }
    }

    if (!image && size == "large_image") {
        if (activity.name in activityImages) {
            return decodeURIComponent(activityImages[activity.name])
        }
    }
    return null
}


function socketeer() {
    var lanyard = new WebSocket('https://api.violets-purgatory.dev')

    lanyard.on("error", (error) =>{
        console.log(error)
    })

    lanyard.on("close", () => {
        console.log("Connection Closed. Attempting Reconnect in 30 seconds.")
        setTimeout(() => {
            socketeer()
        }, 3000);
    })

    function ping(dur) {
        lanyard.send(JSON.stringify({
            op: 3
        }))
        setTimeout(() => {
            ping(dur)
            if (Date.now() - lastPong > 120000) {
                lanyard.close()
                console.log("Max duration since last pong exceeded- Closing socket.")
            }
        }, dur);
    }

    lanyard.addEventListener("message", async (res) => {
        var data = JSON.parse(res.data)
        // console.log(data.op)
        if (data.op == 1) {
            console.log("Connected to Discord Websocket!")
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
                    var fp = path.join(__dirname, 'cached', fn)

                    if (!cachedImages[url]) {
                        const response = await (await fetch(thumborURL + "128x128/" + url)).arrayBuffer()
                        console.log(thumborURL + url)
                        fs.writeFileSync(fp, Buffer.from(response))

                        cachedImages[url] = fn
                    }
                }

                if (get_img_url(activity, "small_image")) {
                    var url = get_img_url(activity, "small_image")
                    var fn = Math.ceil(Math.random() * 100_000_000_000).toString()
                    var fp = path.join(__dirname, 'cached', fn)

                    if (!cachedImages[url]) {
                        const response = await (await fetch(thumborURL + "64x64/" + url)).arrayBuffer()

                        fs.writeFileSync(fp, Buffer.from(response))

                        cachedImages[url] = fn
                    }
                }
            }

        }
    })
}

socketeer()
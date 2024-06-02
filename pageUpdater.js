const path = require('path'),
    fs = require('fs'),
    WebSocket = require('ws'),
    minify = require('@node-minify/core'),
    uglifyJs = require("@node-minify/uglify-js"),
    htmlMinifier = require("minify-html"),
    activityToHTML = require("./overcomplicatedStatuses.js"),
    randomThemer = require("./randomThemer.js"),
    himalaya = require("himalaya")

var constants = JSON.parse(fs.readFileSync(path.join(__dirname, 'constants.json')))

var highlightedWords = constants.highlightedWords
var quotes = constants.quotes
var titles = constants.titles

var globalSpins = 0

var commitCount = "500+"

var lanyardData = undefined

var uptime = Date.now()

function firstToUpper(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

function timeFormatter(seconds) {
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

function converter(html) {
    var startTime = Date.now()

    html = html

    var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/config.json')))

    var statusText = ""

    if (lanyardData) {
        var statusData = constants.discStatuses[lanyardData.discord_status]
        var username = lanyardData.discord_user.username

        if (lanyardData.activities[0] && lanyardData.activities[0].type == 4) {
            var statusText = `<hr/><p>${lanyardData.activities[0].state}</p>`
        }
    } else {
        var statusData = constants.discStatuses.offline
        var username = "bingus_violet"
    }

    var bnchName = "Beta"
    var bnchSub = "beta."

    if (process.env.BRANCH == "dev") {
        bnchName = "Stable"
        bnchSub = ""
    }

    var replacers = {
        "ALL_KEYWORDS": undefined,
        "ALL_HIGHLIGHTS": Object.keys(highlightedWords).join(", "),
        "BRANCH_NAME": bnchName,
        "BRANCH_SUB": bnchSub,
        "RANDOM_QUOTE": quotes[Math.floor(Math.random() * quotes.length)],
        "COMMIT_COUNT": commitCount,
        "QUOTE_COUNT": quotes.length,
        "RANDOM_TITLE": titles[Math.floor(Math.random() * titles.length)],
        "DISCORD_STATUS":
            `<span style="color: ${statusData.color};" class="statusColor">${statusData.text}</span>` +
            `<style>.pfp { border-color: ${statusData.color} }</style>`,
        "UPTIME": uptime,
        "TOPBAR": `<div id="topbar"><h3><a href="/socials">Socials</a></h3></div>`,
        "DISCORD_USER": username,
        "CUSTOM_STATUS": statusText,
        "SELECTED_VIDEO": () => {
            if (config.dailyVideoURL) {
                return `<h2><hr/>Random video!</h2><p>I would call it random <em>daily</em> video but its not at all daily...</p>
                <br/> 
                <video controls="true" src="${config.dailyVideoURL}"></video>`
            }
            return ``
        },
        "SPINCOUNT": globalSpins,
        "UPTIME": timeFormatter((Date.now() - uptime) / 1000),
        "WEATHER_MODIFIER": randomThemer.returnTheme(),
        "WEATHER_TEXT": "",
        "ANNOUNCEMENT": fs.readFileSync(path.join(__dirname, "config/announcement.html")),
        "CACHED_IMAGES": fs.readdirSync(path.join(__dirname, "cached")).length.toString(),
        "ACTIVITIES": activityToHTML.activitiesToHTML(lanyardData, cachedImages)
    }

    replacers.ALL_KEYWORDS = "{" + Object.keys(replacers).join("}{") + "} "

    while (html.includes("{PATH_")) {
        var pagePath = html.substring(html.indexOf("{PATH_"))
        pagePath = pagePath.substring(6, pagePath.indexOf('}'))

        var stringIndex = `{PATH_${pagePath}}`
        pagePath = pagePath.toLowerCase()

        var pageHTML = fs.readFileSync(path.join(__dirname, 'static', pagePath, 'index.html')).toString()
        pageHTML = pageHTML.substring(pageHTML.indexOf('<main>') + 6, pageHTML.indexOf('</main>'))
        html = html.replaceAll(stringIndex, pageHTML)
    }

    var rpTable = Object.keys(replacers)

    for (let index = 0; index < rpTable.length; index++) {
        const text = rpTable[index];
        html = html.replaceAll(`{${text}}`, replacers[text])
    }
    
    if (html.includes("<body>")) {
        var bodyHTML = htmlMinifier.minify(html.substring(html.indexOf("<body>") + 6, html.lastIndexOf("</body>")))
        var parsedHTML = himalaya.parse(bodyHTML)
    } else {
        var parsedHTML = himalaya.parse(html)
    }

    function highlighter(json) {
        for (var i = 0; i < json.length; i++) {
            var element = json[i]
            if (element.type == "element") {
                if (element.children.length > 0) {
                    element.children = highlighter(element.children)
                }
            } else if (element.type == "text") {
                var highTable = Object.keys(highlightedWords)

                for (let index = 0; index < highTable.length; index++) {
                    var term = highTable[index];
                    var replacement = `<span style="color: ${highlightedWords[term]}">${term}</span>`
            
            
                    element.content = element.content.replaceAll(`{${term}}`, "TEMPORARY_REPLACE")
                    element.content = element.content.replaceAll(term, replacement)
                    element.content = element.content.replaceAll("TEMPORARY_REPLACE", `${term}`)
                }
            }
        }

        return json
    }

    parsedHTML = highlighter(parsedHTML)

    parsedHTML = himalaya.stringify(parsedHTML)

    if (html.includes("<body>")) {
        html = html.substring(0, html.indexOf("<body>")) + parsedHTML + html.substring(html.indexOf("</body>") + 7)
    } else {
        html = parsedHTML
    }

    html = html.replaceAll("{LOAD_TIME}", (Date.now() - startTime).toString() + "ms")

    return html
}

module.exports = {
    getActivities: function () {
        return htmlMinifier.minify(converter(activityToHTML.activitiesToHTML(lanyardData, cachedImages)))
    },

    middleWare: async function (req, res, next) {

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

            if (filePath.includes(".html")) {
                data = converter(data, req.query)

            }

            if (!filePath.includes(".js")) {
                data = htmlMinifier.minify(data)
            } else {
                data = await minify({
                    compressor: uglifyJs,
                    content: data
                })
            }

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
    var siteResponse = await (await fetch(`https://git.violets-purgatory.dev/bingus_violet/violets-purgatory/src/branch/${process.env.BRANCH || "origin"}`)).text()
    var commits = siteResponse.substring(0, siteResponse.indexOf("Commits"))

    commits = commits.substring(commits.lastIndexOf("<b>") + 3, commits.lastIndexOf("</b>"))
    // ^ this works for Forgejo (basically everything i use that isnt Github E.G. Codeberg)

    // commits = commits.substring(commits.lastIndexOf(">") + 1)
    // ^ This works for Github (fuck you Github)

    commitCount = commits.toString()
    if (process.env.BRANCH == "dev") {
        commitCount += " | Beta site"
    }
}

updateCommits()

// Lanyard Stuffs

var lastLanyardUpdate = Date.now()
var lastPong = 0

function socketeer() {
    var lanyard = new WebSocket('https://api.violets-purgatory.dev')

    lanyard.on("error", (error) => {
        console.log(error)
    })

    lanyard.on("close", () => {
        console.log("Connection Closed. Attempting Reconnect in 30 seconds.")
        setTimeout(() => {
            socketeer()
        }, 30000);
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
        } else if (data.op == 4) {
            globalSpins = data.spins
        }
    })
}

socketeer()
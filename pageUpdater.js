const path = require('path'),
    fs = require('fs'),
    minify = require('@node-minify/core'),
    uglifyJs = require("@node-minify/uglify-js"),
    htmlMinifier = require("minify-html"),
    activityToHTML = require("./overcomplicatedStatuses.js"),
    randomThemer = require("./randomThemer.js"),
    himalaya = require("himalaya"),
    glob = require("glob"),
    api = require("./api.js")

var constants = JSON.parse(fs.readFileSync(path.join(__dirname, 'constants.json')))

var highlightedWords = constants.highlightedWords
var quotes = constants.quotes
var titles = constants.titles

var globalSpins = 0

var commitCount = "600+"

var uptime = Date.now()
var lastPregen = 0

var pregenFiles = []

var javascriptCache = {}

var globResult = glob.globSync("**/static/**/*.html", { absolute: true })
for (var i = 0; i < globResult.length; i++) {
    var result = globResult[i]
    pregenFiles.push({
        "absolutePath": result,
        "path": result.substring(result.indexOf("static") + 7),
        "html": undefined
    })
}

(async function() {
    globResult = glob.globSync("**/static/**/*.js", { absolute: true })
    for (var i = 0; i < globResult.length; i++) {
        javascriptCache[globResult[i]] = await minify({
            compressor: uglifyJs,
            content: fs.readFileSync(globResult[i]).toString()
        })
    }
})()

function firstToUpper(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

function makeHtmlSafe(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

function pathReplacer(html) {
    while (html.includes("{PATH_")) {
        var pagePath = html.substring(html.indexOf("{PATH_"))
        pagePath = pagePath.substring(6, pagePath.indexOf('}'))

        var stringIndex = `{PATH_${pagePath}}`
        pagePath = pagePath.toLowerCase()

        var pageHTML = fs.readFileSync(path.join(__dirname, 'static', pagePath, 'index.html')).toString()
        pageHTML = pageHTML.substring(pageHTML.indexOf('<main>') + 6, pageHTML.indexOf('</main>'))
        html = html.replaceAll(stringIndex, pageHTML)
    }
    return html
}

function highlighter(json, full = true) {
    for (var i = 0; i < json.length; i++) {
        var element = json[i]
        if (element.type == "element") {
            if (element.children.length > 0) {
                element.children = highlighter(element.children, full)
            }
        } else if (element.type == "text") {
            var highTable = Object.keys(highlightedWords)

            for (let index = 0; index < highTable.length; index++) {
                var term = highTable[index];
                var termProps = highlightedWords[term]

                var reg = term
                if (termProps.caseInsensitive) {
                    reg = new RegExp(`(${term})`, "gi")
                }

                element.content = element.content.replaceAll(`{${term}}`, "TEMPORARY_REPLACE")
                element.content = element.content.replaceAll(reg, "{TERM" + index + "}")
                element.content = element.content.replaceAll("TEMPORARY_REPLACE", `${term}`)
            }

            if (full) {
                for (let index = 0; index < highTable.length; index++) {
                    var termKey = "{TERM" + index + "}"
                    var termProps = highlightedWords[highTable[index]]
                    while (element.content.includes(termKey)) {
                        var termIndex = element.content.indexOf(termKey)

                        var spanEnd = element.content.indexOf(" ", termIndex)

                        if (spanEnd == -1) {
                            spanEnd = element.content.length
                        }

                        var endContent = element.content.substring(termIndex + termKey.length, spanEnd)

                        var spanStart = element.content.substring(0, termIndex).lastIndexOf(" ") + 1
                        var startContent = element.content.substring(spanStart - 1, termIndex)

                        var style = termProps.style || ""
                        var classes = termProps.classes || ""
                        var link = termProps.link || ""

                        if (termProps.color) {
                            style += `color: ${termProps.color};`
                        }

                        if (termProps.italicized) {
                            style += "font-style: italic;"
                        }

                        if (termProps.outline) {
                            var width = 2
                            // style += `text-shadow: -1px -1px 0 ${termProps.outline}, 1px -1px 0 ${termProps.outline}, -1px 1px 0 ${termProps.outline}, 1px 1px 0 ${termProps.outline};`
                            style += `-webkit-text-stroke: 1px ${termProps.outline};`
                            // ^ Not in use because it looks bad :30
                        }

                        if (termProps.bold) {
                            classes += "bold"
                        }

                        if (style.length > 2) {
                            style = `style="${style}"`
                        }

                        if (classes.length > 2) {
                            classes = `class="${classes}"`
                        }

                        var replacement = `<span ${style} ${classes} ${link}>${startContent + highTable[index] + endContent}</span>`

                        if (link) {
                            replacement = `<a href="${link}">${replacement}</a>`
                        }

                        element.content = element.content.substring(0, spanStart) + replacement + element.content.substring(spanEnd)
                    }
                }

                // element.content = element.content.replaceAll(termKey, replacement)
            }
        }
    }

    return json
}

function converter(html, dynamic = true) {
    var startTime = Date.now()
    var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/config.json')))

    var staticReplacers = {
        "ALL_HIGHLIGHTS": Object.keys(highlightedWords).join(", "),
        "BRANCH_NAME": () => {
            if (process.env.BRANCH == "dev") {
                return "Stable"
            }
            return "Beta"
        },
        "BRANCH_SUB": () => {
            if (process.env.BRANCH == "dev") {
                return ""
            }
            return "beta."
        },
        "COMMIT_COUNT": commitCount,
        "QUOTE_COUNT": quotes.length,
        "DISCORD_STATUS": () => {
            return `<span style="color: ${constants.discStatuses[api.lanyard.discord_status].color};" class="statusColor">${constants.discStatuses[api.lanyard.discord_status].text}</span>` +
                `<style>.pfp { border-color: ${constants.discStatuses[api.lanyard.discord_status].color} }</style>`;

            return "";
        },
        "TOPBAR": `<div id="topbar">
        <h3><a class="chip" href="/">Home</a>
        <a class="chip" href="/socials">Socials</a>
        <a class="chip" href="/stats">Stats</a>
        <a class="chip" href="/faq">Nerd FAQ</a></h3>
        </div>`,
        "CUSTOM_STATUS": () => {
            if (api.lanyard.activities[0] && api.lanyard.activities[0].type == 4) {
                var status = api.lanyard.activities[0]
                var addedHTML = "<hr/><p>"
                if (status.emoji) {
                    if (status.emoji.id) {
                        addedHTML += `<img src="/emojis/${status.emoji.id}" title="${status.emoji.name}" class="emoji"/>`
                    } else {
                        addedHTML += status.emoji.name + " "
                    }
                }

                addedHTML += makeHtmlSafe(status.state)
                addedHTML += "</p>"
                return addedHTML
            }
            return ""
        },
        "SELECTED_VIDEO": () => {
            if (config.dailyVideoURL) {
                return `<h2><hr/>Random video!</h2><p>I would call it random <em>daily</em> video but its not at all daily...</p>
                <br/> 
                <video controls="true" src="${config.dailyVideoURL}"></video>`
            }
            return ``
        },
        "WEATHER_MODIFIER": randomThemer.returnTheme(),
        "WEATHER_TEXT": "",
        "ANNOUNCEMENT": fs.readFileSync(path.join(__dirname, "config/announcement.html")),
        "SOCIALS": () => {
            if (api.lanyard.socials) {
                var socials = api.lanyard.socials
                var html = ""
                var socialsTable = Object.keys(socials)
                for (var i = 0; i < socialsTable.length; i++) {
                    var category = socialsTable[i]
                    var sites = socials[category]
                    var sitesTable = Object.keys(sites)
                    html += `<div class="grid-child"><div><h3>${category}</h3>`
                    for (var x = 0; x < sitesTable.length; x++) {
                        var siteName = sitesTable[x]
                        var siteData = sites[siteName]
                        if (siteData.url) {
                            html += `<a class="chip" href="${siteData.url}">${siteName}: ${siteData.name.replaceAll("Violet", "{Violet}")}</a>`
                        }
                    }
                    html += "</div></div>"
                }
            }
            return html
        },
    }

    var realtimeReplacers = {
        "API_CONNECTED": api.connected.toString(),
        "ACTIVITIES": activityToHTML.activitiesToHTML(api.lanyard),
        "SPINCOUNT": globalSpins,
        "UPTIME": timeFormatter((Date.now() - uptime) / 1000),
        "LAST_LANYARD": timeFormatter((Date.now() - api.lastLanyardUpdate) / 1000),
        "RANDOM_TITLE": titles[Math.floor(Math.random() * titles.length)],
        "RANDOM_QUOTE": quotes[Math.floor(Math.random() * quotes.length)],
        "LAST_PREGEN": timeFormatter((Date.now() - lastPregen) / 1000)
    }

    if (dynamic) {
        var replacers = realtimeReplacers
    } else {
        var replacers = staticReplacers
    }

    html = pathReplacer(html)

    var rpTable = Object.keys(replacers)

    for (let index = 0; index < rpTable.length; index++) {
        const text = rpTable[index];
        if (dynamic) {
            replacers[text] = himalaya.stringify(highlighter(himalaya.parse(replacers[text])))
        }
        html = html.replaceAll(`{${text}}`, replacers[text])
    }

    if (!dynamic) {
        if (html.includes("<body>")) {
            var bodyHTML = htmlMinifier.minify(html.substring(html.indexOf("<body>") + 6, html.lastIndexOf("</body>")))
            var parsedHTML = himalaya.parse(bodyHTML)
        } else {
            var parsedHTML = himalaya.parse(html)
        }

        parsedHTML = highlighter(parsedHTML)

        parsedHTML = himalaya.stringify(parsedHTML)
        if (html.includes("<body>")) {
            parsedHTML = "<body>" + parsedHTML + "</body>"
            html = html.substring(0, html.indexOf("<body>")) + parsedHTML + html.substring(html.indexOf("</body>") + 7)
        } else {
            html = parsedHTML
        }
    }

    if (dynamic) {
        html = html.replaceAll("{LOAD_TIME}", (Date.now() - startTime).toString() + "ms")
    }

    return html
}

module.exports = {
    getActivities: function () {
        return htmlMinifier.minify(converter(activityToHTML.activitiesToHTML(api.lanyard)))
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
                for (var i = 0; i < pregenFiles.length; i++) {
                    if (pregenFiles[i].html && pregenFiles[i].absolutePath == filePath) {
                        data = pregenFiles[i].html
                    }
                }
                data = converter(data, true)
                // console.log(data)

            }

            if (!filePath.includes(".js")) {
                data = htmlMinifier.minify(data)
            } else {
                data = javascriptCache[filePath]
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
    // ^ this works for Forgejo (basically everything i use that isnt Github, E.G. Codeberg)

    // commits = commits.substring(commits.lastIndexOf(">") + 1)
    // ^ This works for Github (fuck you Github)

    commitCount = commits.toString()
    if (process.env.BRANCH == "dev") {
        commitCount += " | Beta site"
    }
}

updateCommits()

// Lanyard Stuffs


function pregenerate() {
    lastPregen = Date.now()
    for (var i = 0; i < pregenFiles.length; i++) {
        var startTime = Date.now()
        pregenFiles[i].html = converter(fs.readFileSync(pregenFiles[i].absolutePath).toString(), false)
        pregenFiles[i].html = pregenFiles[i].html.replaceAll("{PREGEN_TIME}", Date.now() - startTime)
    }
}

pregenerate()

api.events.on("lanyardConnect", pregenerate)

api.events.on("lanyardUpdate", async () => {
    if (!api.lanyard.activityChanged) {
        pregenerate()
    }

    for (var i = 0; i < api.lanyard.activities.length; i++) {
        var activity = api.lanyard.activities[i]
        if (activity.type == 4 && activity.emoji) {

            if (activity.emoji.id) {
                if (activity.emoji.animated) {
                    var emoji = Buffer.from(await (await fetch(`https://cdn.discordapp.com/emojis/${activity.emoji.id}.gif?quality=lossless`)).arrayBuffer())
                } else {
                    var emoji = Buffer.from(await (await fetch(`https://cdn.discordapp.com/emojis/${activity.emoji.id}.png?quality=lossless`)).arrayBuffer())
                }
                fs.writeFileSync(path.join(__dirname, "cached/emojis", activity.emoji.id), emoji)
            }
        }
    }
})
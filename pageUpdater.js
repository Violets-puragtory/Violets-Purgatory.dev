const path = require('path'),
    fs = require('fs')

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))

var highlightedWords = config.highlightedWords
var quotes = config.quotes
var titles = config.titles

var commitCount = "300+"

function makeStars() {
    var html = ""

    for (let index = 0; index < 35; index++) {
        html += `<div class="rainDrop"></div>`
    }
    html += "<style>"
    for (let index = 0; index < 35; index++) {
        html += `
        .rainDrop:nth-of-type(${index + 1}) {
            animation: rainAnim${index} 1s linear;
            animation-iteration-count: infinite;
            animation-delay: ${Math.random() * 15}s;
        }
        `
        var rando = Math.random() * 100
        html += `@keyframes rainAnim${index} {
            0% {
                top: -10vh;
                right: ${rando}vw;
                visibility: visible;
            }
    
            100% {
                top: 110vh;
                right: calc(${rando}vw);
            }
        }`

    }
    html += "</style>"

    return html
}

function converter(html) {
    var highTable = Object.keys(highlightedWords)
    for (let index = 0; index < highTable.length; index++) {
        var term = highTable[index];
        var replacement = `<span style="color: ${highlightedWords[term]}">${term}</span>`
        html = html.replaceAll(term, replacement)
    }

    html = html.replaceAll("{BG_EFFECT}", makeStars())

    html = html.replaceAll("{COMMIT_COUNT}", commitCount)

    html = html.replaceAll("{RANDOM_QUOTE}", quotes[Math.floor(Math.random() * quotes.length)])

    html = html.replaceAll("{QUOTE_COUNT}", quotes.length)

    html = html.replaceAll("{RANDOM_TITLE}", titles[Math.floor(Math.random() * titles.length)])

    return html
}

module.exports = {
    middleWare: function (req, res, next) {

        var filePath = req.baseUrl + req.path
        if (filePath.trim() == "/") {
            filePath = "/index.html"
        }
        filePath = path.join(__dirname, 'static', filePath || 'index.html')
        if (fs.existsSync(filePath)) {
            var data = fs.readFileSync(filePath).toString()
            if (req.path.includes("style.css")) {
                res.setHeader("Content-Type", "text/css")
                res.send(data)
            } else {
                data = converter(data)
                res.send(data)
            }
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
    commitCount = commits
}

updateCommits()
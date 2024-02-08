const path = require('path'),
fs = require('fs')

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))
var highlightedWords = config.highlightedWords

function makeStars() {
    var html = ""

    for (let index = 0; index < 15; index++) {
        html += `<div class="star"></div>`
    }
    html += "<style>"
    for (let index = 0; index < 15; index++) {
        html += `
        .star:nth-of-type(${index + 1}) {
            animation: starAnim${index} ${15 + (Math.random() * 15)}s linear;
            animation-iteration-count: infinite;
            animation-delay: ${-Math.random() * 15}s;
        }
        `
        var rando = Math.random() * 100
        html += `@keyframes starAnim${index} {
            0% {
                top: -10vh;
                right: ${rando}vw;
                visibility: visible;
            }
    
            100% {
                top: 110vh;
                right: calc(${rando}vw + ${5 - (Math.random() * 10)}vw);
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

    return html
}

module.exports = { middleWare: function(req, res, next) {
    
    var filePath = req.baseUrl + req.path
    if (filePath.trim() == "/") {
        filePath = "/index.html"
    }
    filePath = path.join(__dirname, 'static', filePath || 'index.html') 
    var data = fs.readFileSync(filePath).toString()
    if (req.path.includes("style.css")) {
        res.setHeader("Content-Type", "text/css")
        res.send(data)
    } else {
        data = converter(data)
        res.send(data)
    }
}
}
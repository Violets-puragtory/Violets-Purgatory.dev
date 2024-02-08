const path = require('path'),
fs = require('fs')

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))
var highlightedWords = config.highlightedWords

function converter(html) {
    var highTable = Object.keys(highlightedWords)
    for (let index = 0; index < highTable.length; index++) {
        var term = highTable[index];
        var replacement = `<span style="color: ${highlightedWords[term]}">${term}</span>`
        html = html.replaceAll(term, replacement)
    }

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
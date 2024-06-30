const nodeHtmlToImage = require('node-html-to-image'),
api = require("./api.js"),
pageUpdater = require("./pageUpdater.js")
fs = require("fs"),
path = require("path"),
app = require("./expressHandler.js").app

const constants = JSON.parse(fs.readFileSync(path.join(__dirname, "constants.json")))

app.get("/embedImage.png", async (req, res) => {
    var discColors = constants.discStatuses[api.lanyard.discord_status]

    var pregen = pageUpdater.pregen

    var html = "<h2>Not initialized!...</h2>"

    for (var i in pregen) {
        var item = pregen[i]
        if (item.absolutePath.includes("/card/index.html")) {
            html = item.html
        }
    }

    var img = await nodeHtmlToImage({
        html: html,
        transparent: true
        
    })
    
    res.send(img)
}) 

app.get("/embedImage", (req, res) => {
    res.send("<img src='/embedImage.png'> <style>body { background-color:black; } </style>")
})
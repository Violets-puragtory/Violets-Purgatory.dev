const express = require('express'),
    path = require('path'),
    fs = require('fs'),
    pageUpdater = require('./pageUpdater.js')

var app = express()

const PORT = process.env.PORT || 8080

const staticpath = path.join(__dirname, 'static')

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))

app.listen(PORT, () => {
    console.log("Violet's Purgatory is now listening on port: " + PORT)
})

var cachePath = path.join(staticpath, 'cached')
var fontPath = path.join(staticpath, "fonts")

app.use("/fonts", express.static(fontPath))
app.use("/cached", express.static(cachePath))

app.get("/disc", (req, res) => {
    var looping = true

    res.setHeader("X-Accel-Buffering", "no")
    res.write(fs.readFileSync(path.join(__dirname, "resources/disc.html")))

    var iterations = 0
    var lastAct = null

    function loop() {
        var currentAct = pageUpdater.getActivities()
        if (currentAct != lastAct) {
            lastAct = currentAct
            iterations += 1
            res.write(`<div id="loop${iterations}">`)
            res.write(currentAct.substring(currentAct.indexOf("<div")))
            res.write(`</div>`)
            res.write(`<style>#loop${iterations - 1} {display: none;}</style>`)    
        }
        setTimeout(() => {
            loop()
            res.write("")
        }, 5000);
    }
    loop()
})

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
const express = require("express"),
path = require("path")

var app = express()

const PORT = process.env.PORT || 8080

const cachePath = path.join(__dirname, 'cached')
const assetPath = path.join(__dirname, "assets")

app.listen(PORT, () => {
    console.log("Violet's Purgatory is now listening on port: " + PORT)
})

const pageUpdater = require("./pageUpdater.js")

app.use("/fonts", express.static(path.join(assetPath, "fonts")))
app.use("/cached", express.static(cachePath))
app.use("/imgs", express.static(path.join(assetPath, "Images")))
app.use("/snds", express.static(path.join(assetPath, "Sounds")))

app.use("/emojis", express.static(path.join(cachePath, "emojis")))

app.use(pageUpdater.middleWare)

module.exports = {
    app: app
}
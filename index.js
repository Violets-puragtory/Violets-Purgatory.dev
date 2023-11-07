const express = require('express'),
path = require('path')

var app = express()

const PORT = process.env.PORT || 8080

const staticpath = path.join(__dirname, (process.env.STATIC_PATH || 'static/'))

app.use(express.static(staticpath))

app.get("/curl", (req, res) => {
    res.sendFile(path.join(__dirname, "resources/curl"))
})

app.listen(PORT, () => {
    console.log("Violets-Purgatory is now listening on port: " + PORT)
})
const express = require('express'),
path = require('path'),
fs = require('fs')

var app = express()

const PORT = process.env.PORT || 8080

const staticpath = path.join(__dirname, (process.env.STATIC_PATH || 'static/'))

app.use(express.static(staticpath))

app.listen(PORT, () => {
    console.log("Violets-Purgatory is now listening on port: " + PORT)
})


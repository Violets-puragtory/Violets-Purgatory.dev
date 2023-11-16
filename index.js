const express = require('express'),
path = require('path'),
fs = require('fs'),
WebSocket = require('ws')

var app = express()

const PORT = process.env.PORT || 8080

const staticpath = path.join(__dirname, 'static')
const resourcePath = path.join(__dirname, "resources")

const mainpage = resourcePath + '/mainPage.html'
var lanyardData = undefined

var discData = null

app.use(express.static(staticpath))

app.listen(PORT, () => {
    console.log("Violet's Purgatory is now listening on port: " + PORT)
})

app.get("/", (req, res) => {
    var html = fs.readFileSync(mainpage).toString()

    var addedHTML = "<p>"

    if (lanyardData && (lanyardData.spotify != null || lanyardData.activities[0] != undefined)) {
        addedHTML += `Discord Status: ${lanyardData.spotify || '"' + lanyardData.activities[0].state + '"' || ""}`
    }
    
    var statuses = {
        "online": {
            "text": "Online",
            "color": "rgb(100, 255, 100)"
        },
        "dnd": {
            "text": "DND",
            "color": "rgb(255, 100, 100)"
        },
        "idle": {
            "text": "Idle",
            "color": "rgb(255, 255, 75)"
        },
        "offline": {
            "text": "Offline",
            "color": "rgb(125, 125, 125)"
        }
    }
    var statusData = statuses[lanyardData.discord_status]

    addedHTML += `<br><span style="color: ${statusData.color}">${statusData.text}</span>`
    addedHTML += `<style>.pfp { border-color: ${statusData.color} !important }</style>`

    html = html.replace("{LANYARD}", addedHTML + "</p>")

    res.send(html)
})

// Lanyard Stuffs

var lanyard = new WebSocket('wss://api.lanyard.rest/socket')

function beat(dur) {
    lanyard.send(JSON.stringify({
        op: 3
    }))
    setTimeout(() => {
        beat(dur)
    }, dur);
}

lanyard.addEventListener("message", (res)=>{
    var data = JSON.parse(res.data)
    if (data.op == 1) {
        beat(data.d.heartbeat_interval)
        lanyard.send(JSON.stringify({
            op: 2,
            d: {
                subscribe_to_id: "534132311781015564"
            }
        }))
    } else if (data.op == 0) {
        lanyardData = data.d
    } else {
        console.log(data.d)
    }
})
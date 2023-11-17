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

    var addedHTML = ""

    if (lanyardData) {
        for (let index = 0; index < lanyardData.activities.length; index++) {
            const activity = lanyardData.activities[index];
            console.log(activity)
            if (activity.type == 2) {
                addedHTML += `<p class="chip">Listening to on <span style="color: limegreen">${activity.name}</span>: ${activity.details} (by ${activity.state})</p>`
            } else if (activity.type == 4) {
                addedHTML += `<p><em><span style="color: lightgray">"${lanyardData.activities[0].state}"</span> - ${lanyardData.discord_user.display_name} ${new Date(Date.now()).getFullYear()}</em></p>`
            }
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

        addedHTML += `<style>.pfp { border-color: ${statusData.color} !important }</style>`

        console.log(lanyardData.activities)
    }

    html = html.replace("{LANYARD_STATUS}", `<p style="color: ${statusData.color}">${statusData.text}</p>`)

    html = html.replace("{LANYARD}", addedHTML)

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

lanyard.addEventListener("message", (res) => {
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
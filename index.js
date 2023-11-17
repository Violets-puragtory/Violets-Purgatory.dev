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
    
    var html = fs.readFileSync(mainpage).toString()
    
    var checkpoint = ["{LANYARD_STATUS}", "{LANYARD}"]

    function io(numb, end=false) {
        if (end) {
            return html.indexOf(checkpoint[numb]) + checkpoint[numb].length
        }
        return html.indexOf(checkpoint[numb])
    }

    res.write(html.substring(0, io(0)))

    var statusData = statuses[lanyardData.discord_status]

    res.write(`<p style="color: ${statusData.color}">${statusData.text}</p>`)
    res.write(`<style>.pfp { border-color: ${statusData.color} !important }</style>`)

    res.write(html.substring(io(0, true), io(1)))

    if (lanyardData) {
        for (let index = 0; index < lanyardData.activities.length; index++) {
            const activity = lanyardData.activities[index];
            console.log(activity)
            if (activity.type == 2) {
                res.write(`<p class="chip">Listening on <a style="color: limegreen">${activity.name}</a>: ${activity.details} (by ${activity.state})</p>`)
            } else if (activity.type == 4) {
                res.write(`<p><em><span style="color: lightgray">"${lanyardData.activities[0].state}"</span> - ${lanyardData.discord_user.display_name} ${new Date(Date.now()).getFullYear()}</em></p>`)
            }
        }

        console.log(lanyardData.activities)
    }
    console.log(io(checkpoint.length - 1, true))
    res.write(html.substring(io(checkpoint.length - 1, true), html.length) + "<p>Thank you for checking out my website <3</p>", () => {
        res.end()
    })
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
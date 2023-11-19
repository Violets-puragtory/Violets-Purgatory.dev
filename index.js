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

function pageUpdate() {
    console.log("Updating...")
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

    var addedHTML = ""

    if (lanyardData) {
        var statusData = statuses[lanyardData.discord_status]

        addedHTML += `<p style="color: ${statusData.color}">${statusData.text}</p>`
        addedHTML += `<style>.pfp { border-color: ${statusData.color} !important }</style>`
    }

    html = html.replace("{LANYARD_STATUS}", addedHTML)

    addedHTML = ""

    if (lanyardData && lanyardData.activities.length > 0) {
        if (lanyardData.activities[0].type == 4) {
            addedHTML += `<hr><p><em><span style="color: lightgray">"${lanyardData.activities[0].state}"</span> - ${lanyardData.discord_user.display_name} ${new Date(Date.now()).getFullYear()}</em></p>`
        }
    }

    html = html.replace("{LANYARD_QUOTE}", addedHTML)

    addedHTML = ""

    if (lanyardData) {
        for (let index = 0; index < lanyardData.activities.length; index++) {
            const activity = lanyardData.activities[index];
            if (activity.type == 4) {
                addedHTML += `<p><em><span style="color: lightgray">"${lanyardData.activities[0].state}"</span> - ${lanyardData.discord_user.display_name} ${new Date(Date.now()).getFullYear()}</em></p>`
            }
        }
    }

    html = html.replace("{LANYARD_SPOTIFY}", addedHTML)

    addedHTML = ""

    var debounce = false

    if (lanyardData && lanyardData.activities.length > 0) {
        for (let index = 0; index < lanyardData.activities.length; index++) {
            const activity = lanyardData.activities[index];

            console.log(activity)

            if (!debounce && activity.type != 4) {
                addedHTML += `<h2><hr>What I'm up to:</h2><div class="container-fluid row" style="margin: 0; padding: 0; display: flex;">`
                debounce = true
            }
            function get_img() {
                if ("assets" in activity) {
                    var image = undefined
                    if ("large_image" in activity.assets) {
                        image = activity.assets.large_image
                    } else if ("small_image" in activity.assets) {
                        image = activity.assets.small_image
                    }
                    if (image) {
                        if (image.includes("https/")) {
                            return 'https://' + image.substr(image.indexOf('https/') + 6, image.length)
                        } else if (image.includes("spotify")) {
                            return 'https://i.scdn.co/image/' + image.substr(image.indexOf('spotify:') + 8, image.length)
                        }
                    }
                }
            }
            if (activity.type == 2) {
                if (get_img()) {
                    addedHTML += `
                    <div class="chip activity col-md-6 col-xl-4">
                            <img src="${get_img()}">
                            <p>
                                Listening to <span style="color: limegreen;">${activity.name}</span> 
                                <br> Album: "${activity.details}"
                                <br> Artist: "${activity.state}"
                            </p>
                    </div>
                `
                } else {
                    addedHTML += `
                    <div class="chip activity col-md-6 col-xl-4">
                        <p style="width: 100%;">
                            Playing <span style="color: rgb(255, 100, 150);">${activity.name}</span> 
                            <br> ${activity.state}
                            <br> ${activity.details}
                        </p>
                    </div>
                    `
                }
            } else if (activity.type == 0) {
                if (get_img()) {
                    addedHTML += `
                    <div class="chip activity col-md-6 col-xl-4">
                            <img src="${get_img()}">
                            <p>
                                Playing <span style="color: rgb(255, 100, 150);">${activity.name}</span> 
                                <br> ${activity.state}
                            </p>

                    </div>
                `
                } else {
                    addedHTML += `
                    <div class="chip activity col-md-6 col-xl-4">
                        <p>
                            Playing <span style="color: rgb(255, 100, 150);">${activity.name}</span> 
                            <br> ${activity.state}
                            <br> ${activity.details}
                        </p>
                    </div>
                    `
                }
            }
        }
    }

    if (addedHTML) {
        addedHTML += "</div>"
    }

    html = html.replace("{LANYARD_FULL}", addedHTML)

    fs.writeFileSync(path.join(__dirname, 'static/index.html'), html)

    console.log("Updated!")
}

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
        pageUpdate()
    } else {
        console.log(data.d)
    }
})
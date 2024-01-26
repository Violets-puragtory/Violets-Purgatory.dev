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

var thumborInstances = [
    "https://thumbor-production-0e82.up.railway.app/",
    "https://enormous-book-production.up.railway.app/",
    "https://unusual-back-production.up.railway.app/",
    "https://axiomatic-hair-production.up.railway.app/",
]

var thumbCount = 0

function getThumbor() {
    thumbCount += 1
    return thumborInstances[thumbCount % thumborInstances.length] + "unsafe"
}

const activityImages = {
    "ULTRAKILL": "https://fs.violets-purgatory.dev/ULTRAKILL/etc/DiscordIcon.webp"
}

var mastoData = {
    "lastUpdate": 0,
    "HTML": ""
}

app.use(express.static(staticpath))

app.listen(PORT, () => {
    console.log("Violet's Purgatory is now listening on port: " + PORT)
})

function timeFormatter(seconds) {
    seconds = Math.ceil(seconds)
    var minutes = Math.floor(seconds / 60)

    if (seconds % 60 < 10) {
        return `${minutes}:0${seconds % 60}`
    } else {
        return `${minutes}:${seconds % 60}`
    }
    
}

function gameTimeFormatter(seconds) {
    seconds = Math.ceil(seconds)
    var minutes = Math.ceil(seconds / 60)
    var hours = Math.floor(minutes / 60)
    if (seconds < 60) {
        return 'Under a minute ago'
    } else if (minutes < 60) {
        return `${minutes} Minutes`
    }
    
    return `${hours} hours and ${minutes % 60} minutes`
    
}

function pageUpdate() {
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
            var status = lanyardData.activities[0]
            addedHTML += "<hr><p>"
            if (status.emoji) {
                if (status.emoji.id) {
                    addedHTML += `<img class="emoji" src="${getThumbor()}/https://cdn.discordapp.com/emojis/${status.emoji.id}.webp?size=32&quality=lossless"/> `
                } else {
                    addedHTML += status.emoji.name
                }
            }
            if (status.state) {
                addedHTML += `<em><span style="color: lightgray">"`
                addedHTML += (status.state || "")
                addedHTML += `"</span>`
            }
            addedHTML += ` - ${lanyardData.discord_user.display_name} ${new Date(Date.now()).getFullYear()}</em></p>`
        }
    }

    html = html.replace("{LANYARD_QUOTE}", addedHTML)

    addedHTML = ""

    var debounce = false

    if (lanyardData && lanyardData.activities.length > 0) {
        for (let index = 0; index < lanyardData.activities.length; index++) {
            const activity = lanyardData.activities[index];

            var found = false
            for (let index = 0; index < lanyardData.activities.length; index++) {
                const act = lanyardData.activities[index]
                if (act.name == activity.name) {
                    if (Object.keys(act).length > Object.keys(activity).length) {
                        found = true
                    }
                }
            }
            if (found) {
                continue
            }
            
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
                            return decodeURIComponent('https://' + image.substr(image.indexOf('https/') + 6, image.length))
                        } else if (image.includes("spotify")) {
                            return decodeURIComponent('https://i.scdn.co/image/' + image.substr(image.indexOf('spotify:') + 8, image.length))
                        } else {
                            return decodeURIComponent(`https://cdn.discordapp.com/app-assets/${activity.application_id}/${image}.png`)
                        }
                    }
                }

                if (!image) {
                    if (activity.name in activityImages) {
                        return decodeURIComponent(activityImages[activity.name])
                    } else {
                        return decodeURIComponent(`https://cdn.discordapp.com/app-assets/680748054038577165/680775885317472448.png`)
                        // This was supposed to be temporary but it kinda stuck honestly lol (It's an ultrakill icon)
                    }
                }
            }
            function songStats() {
                var html = ``

                if (activity.assets && activity.assets.large_text != activity.details) {
                    html += `
                    <br> Album: ${activity.assets.large_text || " "}
                    <br> Artist: ${activity.state || " "}
                    `
                } else {
                    html += `<br> Artist: ${activity.state || " "}`
                }

                return html
            }
            if (activity.type == 2) {
                var timeLeft = Math.round((activity.timestamps.end - Date.now()) / 1000)
                var currentPercent = (Date.now() - activity.timestamps.start) / (activity.timestamps.end - activity.timestamps.start) * 100
                addedHTML += `
                <div class="chip activity col-md-6 testing">
                    <img src="${getThumbor()}/256x256/${get_img()}" title="${activity.assets.large_text || activity.assets.small_text}">
                        <p>
                            Listening to <span style="color: limegreen;">${activity.name}</span> 
                            <br> Song: ${activity.details || " "}
                            ${songStats()}
                            <br>
                            <span class="lengthBar lengthBar${index}"><span></span></span>
                            ${timeFormatter((activity.timestamps.end - activity.timestamps.start) / 1000)}
                        </p>
                    </div>

                <style>

                .lengthBar${index} > span {
                    animation-name: songSlider${index};
                    animation-duration: ${timeLeft}s;
                    animation-timing-function: linear;
                }

                @keyframes songSlider${index} {
                    0% {
                        width: ${currentPercent}%;
                    }
                    100% {
                        width: 100%;
                    }
                }
                </style>
                `
            } else if (activity.type == 0) {
                    var time = activity.created_at
                    if (activity.timestamps) {
                        time = activity.timestamps.start
                    }
                    if (!activity.assets) {
                        activity.assets = {"large_text": " ", "small_text": " "}
                    }

                    addedHTML += `
                    <div class="chip activity col-md-6 testing">
                            <img src="${getThumbor()}/${get_img()}" title="${activity.assets.large_text || activity.assets.small_text}">
                            <p>
                                Playing <span style="color: rgb(255, 100, 150);">${activity.name}</span> 
                                <br> ${activity.details || activity.assets.large_text || " "}
                                <br> ${activity.state || activity.assets.small_text || " "}
                                <br> ${gameTimeFormatter((Date.now() - time) / 1000)}
                            </p>

                    </div>
                `
            }
        }
    }

    if (addedHTML) {
        addedHTML += "</div>"
    }

    html = html.replace("{LANYARD_FULL}", addedHTML)

    addedHTML = ""

    var socialsHTML = fs.readFileSync(path.join(__dirname, 'static/socials/index.html')).toString()
    addedHTML += socialsHTML.substring(socialsHTML.indexOf("<h1>"), socialsHTML.indexOf("</body>"))

    html = html.replace("{SOCIALS}", addedHTML)

    addedHTML = ""

    // var faqHTML = fs.readFileSync(path.join(__dirname, 'static/faq/index.html')).toString()
    // addedHTML += faqHTML.substring(faqHTML.indexOf("<h1>"), faqHTML.indexOf("</body>"))

    html = html.replace("{FAQ}", ``)

    html = html.replace("{MASTODON_FEED}", mastoData.HTML)

    var now = new Date()
    currentMonth = now.getMonth() + 1

    if ([11, 12].includes(currentMonth)) { // The Below HTML is copy and pasted from that one site :>
        html = html.replace("{SEASONAL_EFFECT}", fs.readFileSync(path.join(__dirname, 'static/snow.html')))
    } else {
        html = html.replace("{SEASONAL_EFFECT}", "")
    }

    html = '<!-- The following code is dynamically generated, I apologize for any formatting errors. Please view the "resources/mainPage.html" on the codeberg repository for something more readable. -->\n' + html

    html = html.replace("{THUMBOR}", getThumbor())

    if (process.env.BRANCH == "dev") {
        html = html.replace("{OPPOSITE_URL}", "www")
        html = html.replace("{OPPOSITE_BRANCH}", "Main")
    } else {
        html = html.replace("{OPPOSITE_URL}", "beta")
        html = html.replace("{OPPOSITE_BRANCH}", "Beta")
    }

    fs.writeFileSync(path.join(__dirname, 'static/index.html'), html)
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
    }
})

pageUpdate()

app.use((req, res, next) => { 
    res.status(404).send(`
        <link rel="stylesheet" href="/style.css">
        <h1>404</h1>
        <p>Uh oh... I think your lost? There's nothing here :P</p>
        `) 
})
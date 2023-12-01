const express = require('express'),
    path = require('path'),
    fs = require('fs'),
    WebSocket = require('ws'),
    xml2json = require('xml2json')

var app = express()

const PORT = process.env.PORT || 8080

const staticpath = path.join(__dirname, 'static')
const resourcePath = path.join(__dirname, "resources")

const mainpage = resourcePath + '/mainPage.html'
var lanyardData = undefined

var discData = null

var mastoData = {
    "lastUpdate": 0,
    "HTML": ""
}

app.use(express.static(staticpath))

app.listen(PORT, () => {
    console.log("Violet's Purgatory is now listening on port: " + PORT)
})

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

            if (!debounce && activity.type != 4) {
                addedHTML += `<h2><hr>What I'm up to:</h2><p>This section is pulled automatically from my discord. If Discord is down, or i'm offline, it won't be here.<br> Huge credit to <a href="https://github.com/Phineas/lanyard/">Phineas' Lanyard</a> for making this possible :D <br>(This is extremely experimental, so PLEASE report any issues on <a href="https://codeberg.org/Bingus_Violet/Violets-Purgatory">Codeberg!</a>)</p><div class="container-fluid row" style="margin: 0; padding: 0; display: flex;">`
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
            }
            if (activity.type == 2) {
                if (get_img()) {
                    addedHTML += `
                    <div class="chip activity col-md-6 testing">
                        <img src="${get_img()}" title="${activity.assets.large_text || activity.assets.small_text}">
                            <p>
                                Listening to <span style="color: limegreen;">${activity.name}</span> 
                                <br> Song: ${activity.details}
                                <br> Album: ${activity.assets.large_text}
                                <br> Artist: ${activity.state}
                            </p>
                    </div>
                `
                } else {
                    addedHTML += `
                    <div class="chip activity col-md-6 testing">
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
                    <div class="chip activity col-md-6 testing">
                            <img src="${get_img()}" title="${activity.assets.large_text || activity.assets.small_text}">
                            <p>
                                Playing <span style="color: rgb(255, 100, 150);">${activity.name}</span> 
                                <br> ${activity.details || activity.assets.large_text}
                                <br> ${activity.state || activity.assets.small_text}
                            </p>

                    </div>
                `
                } else {
                    addedHTML += `
                    <div class="chip activity col-md-6 testing">
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

    addedHTML = ""

    var socialsHTML = fs.readFileSync(path.join(__dirname, 'static/socials/index.html')).toString()
    addedHTML += socialsHTML.substring(socialsHTML.indexOf("<h1>"), socialsHTML.indexOf("</body>"))

    html = html.replace("{SOCIALS}", addedHTML)

    html = html.replace("{MASTODON_FEED}", mastoData.HTML)

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

// Mastodon Updates

function mastoUpdate() {
    fetch("https://tech.lgbt/@bingus_violet.rss")
    .then((data) => {
        return data.text()
    })
    .then((xml) => {
        var data = JSON.parse(xml2json.toJson(xml)).rss.channel
        var posts = data.item

        var newHTML = ``

        for (let index = 0; index < posts.length; index++) {
            const post = posts[index];
            newHTML += `<a href="${post.link}"><div class="post">`
            newHTML += `<img class="minipfp" src="${data.image.url}">`
            newHTML += `<h3 style="display: inline-block; vertical-align: -15%;">` + data.title + `</h3><br>`
            newHTML += post.description
            newHTML += `</a></div><br>`
        }
        console.log(data)

        mastoData.HTML = `<h2><hr>Mastodon Posts: </h2>` + newHTML
        
        pageUpdate()
    })
    setTimeout(()=> {
        mastoUpdate()
    }, 1000 * 60 * 60)
}

mastoUpdate()
const path = require("path"),
fs = require("fs")

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))

var activityImages = config.activityImages

function get_img_url(activity, size = "large_image") {
    if ("assets" in activity) {
        var image = activity.assets[size]

        if (image) {
            if (image.includes("https/")) {
                return decodeURIComponent('https://' + image.substr(image.indexOf('https/') + 6, image.length))
            } else if (image.includes("spotify")) {
                return decodeURIComponent('https://i.scdn.co/image/' + image.substr(image.indexOf('spotify:') + 8, image.length))
            } else {
                return decodeURIComponent('https://cdn.discordapp.com/app-assets/' + activity.application_id + "/" + image + ".png")
            }
        }
    }

    if (!image && size == "large_image") {
        if (activity.name in activityImages) {
            return decodeURIComponent(activityImages[activity.name])
        }
    }
    return null
}

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
    if (seconds <= 60) {
        return 'about ' + seconds + ' seconds'
    } else if (minutes < 60) {
        return `${minutes} Minutes`
    }

    return `${hours} hours and ${minutes % 60} minutes`

}

module.exports = {
    activitiesToHTML: (lanyardData, cachedImages) => {
        var debounce = false
        var addedHTML = ""

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
                    addedHTML += `<h2><hr>What I'm up to:</h2><div class="activity-container">`
                    debounce = true
                }


                function get_img(activity, size = "large_image") {
                    if (cachedImages[get_img_url(activity, size)]) {
                        var fn = cachedImages[get_img_url(activity, size)]
                        var fp = path.join(__dirname, 'static/cached', fn)
                    } else {
                        return '/imgs/notFound.png'
                    }

                    return '/cached/' + fn
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
                    <div class="chip activity grid-child">
                        <img src="${get_img(activity)}" title="${activity.assets.large_text || activity.assets.small_text || activity.state || ""}">
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
                        activity.assets = { "large_text": " ", "small_text": " " }
                    }

                    function smch() {
                        if (get_img_url(activity, "small_image")) {
                            return `<img class="smallimg" src="${get_img(activity, "small_image")}" title="${activity.assets.small_text}">`
                        }
                        return ""
                    }


                    addedHTML += `
                        <div class="chip activity grid-child">
                            <img src="${get_img(activity)}" title="${activity.assets.large_text}">
                            ${smch()}
                            <p>
                                Playing <span style="color: rgb(255, 100, 150);">${activity.name}</span> 
                                <br> ${(activity.details || activity.assets.large_text || " ")}
                                <br> ${(activity.state || activity.assets.small_text || " ")}
                                <br> ${gameTimeFormatter((Date.now() - time) / 1000)}
                            </p>
                        </div>
                    `
                } else if (activity.type != 4) {
                    var time = activity.created_at
                    if (activity.timestamps) {
                        time = activity.timestamps.start
                    }
                    if (!activity.assets) {
                        activity.assets = { "large_text": " ", "small_text": " " }
                    }

                    addedHTML += `
                        <div class="chip activity grid-child">
                            <img src="${get_img(activity)}" title="${activity.assets.large_text || activity.assets.small_text}">
                            <p>
                                <span style="color: rgb(225, 200, 255);">${activity.name}</span> 
                                <br> ${(activity.details || activity.assets.large_text || " ")}
                                <br> ${(activity.state || activity.assets.small_text || " ")}
                                <br> ${gameTimeFormatter((Date.now() - time) / 1000)}
                            </p>
                        </div>
                    `
                }
            }
        }
        return addedHTML + "</div>"
    }
}
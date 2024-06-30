const path = require("path"),
    fs = require("fs")

var constants = JSON.parse(fs.readFileSync(path.join(__dirname, 'constants.json')))

var activityImages = constants.activityImages

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

function makeCompat(string) {
    return string.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

function timeFormatter(seconds) {
    seconds = Math.ceil(seconds / 1000)
    var minutes = Math.floor(seconds / 60)

    if (seconds % 60 < 10) {
        return `${minutes}:0${seconds % 60}`
    } else {
        return `${minutes}:${seconds % 60}`
    }
}

function gameTimeFormatter(seconds) {
    seconds = Math.ceil(seconds / 1000)
    var minutes = Math.ceil(seconds / 60)
    var hours = Math.floor(minutes / 60)
    if (seconds <= 60) {
        return 'about ' + seconds + ' seconds'
    } else if (minutes < 60) {
        return `${minutes} Minutes`
    }

    return `${hours} hours and ${minutes % 60} minutes`

}

function onlyIfExists(string, check) {
    if (check) {
        return string
    } else {
        return ""
    }
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

                function get_img(activity, size = "large_image") {
                    return "https://cache.violets-purgatory.dev/cached/" + get_img_url(activity, size)
                }

                function activityTime() {
                    if (activity.timestamps) {
                        if (activity.timestamps.start) {
                            if (activity.timestamps.end) {
                                var timeLeft = Math.round((activity.timestamps.end - Date.now()) / 1000)
                                var currentPercent = (Date.now() - activity.timestamps.start) / (activity.timestamps.end - activity.timestamps.start) * 100
                                return `
                                <br>
                                <span style="text-align: center;"><span class="lengthBar lengthBar${index}"><span></span></span><span class="durationBarFormatter" data-start="${activity.timestamps.start}" data-end="${activity.timestamps.end}">${timeFormatter((Date.now() - activity.timestamps.start))}/${timeFormatter((activity.timestamps.end - activity.timestamps.start))}</span></span>
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
                            } else {
                                return `
                                <span class="timeEstimate" data-start="${activity.timestamps.start}">${gameTimeFormatter((Date.now() - activity.timestamps.start))}</span>
                                `
                            }
                        } else if (activity.timestamps.end) {
                            return `
                            <span class="endEstimate" data-end="${activity.timestamps.end}">${timeFormatter((activity.timestamps.end - Date.now()))}</span> left
                            `
                        }
                    }
                }

                if (activity.type != 4 && activity.assets) {

                    var time = activity.created_at
                    if (activity.timestamps) {
                        time = activity.timestamps.start
                    }
                    if (!activity.assets) {
                        activity.assets = { "large_text": "", "small_text": "" }
                    }

                    var text1 = onlyIfExists("<br><span style='font-size: 1.3rem;'>" + activity.song + "</span>", activity.song) || activity.details
                    var text2 = onlyIfExists("By: " + activity.artist, activity.artist) || activity.state
                    var text3 = onlyIfExists("On: " + activity.album, activity.album != activity.song && activity.album)

                    addedHTML += `
                        <div class="chip activity grid-child">
                            <img src="${get_img(activity)}" title="${activity.assets.large_text || activity.assets.small_text}">
                            <p style="text-align: left; font-size: 1.15rem;">
                                <span style="font-size: 1.6rem;">${activity.name}</span>
                                ${onlyIfExists("<br>" + text1, text1)}
                                ${onlyIfExists("<br>" + text2, text2)}
                                ${onlyIfExists("<br>" + text3, text3)}
                                ${onlyIfExists("<br>" + activityTime(), activityTime())}
                            </p>
                        </div>
                    `
                }
            }
        }
        if (addedHTML.length > 10) {
            addedHTML = `<h2><hr>What I'm up to:</h2><div class="activity-container">` + addedHTML
            addedHTML += "</div>"
        }
        return addedHTML
    }
}
const discStatuses = {
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
        "text": "",
        "color": "rgb(175, 175, 200)"
    }
}

const spinSpeed = 30
var spinFactor = 3

var date = new Date()

var teto = false

if (date.getDay() == 2) {
    teto = true
} 

var pfp

var music

if (teto) {
    music = new Audio("/snds/Triple Baka.ogg")
} else {
    music = new Audio("/snds/Lotus Waters.ogg")
}

music.loop = true
music.preservesPitch = false

var sock

var spins = 0
var lastSent = 0
var globalSpins = 0

var spinning = false

var firsttimeDebounce = true

var spinWaiting = false

function resetPFP() {
    pfp.src = "https://api.violets-purgatory.dev/v1/pfp?" + new Date().getTime()
}

function lerp(a, b, t) {
    return a * (1 - t) + b * t
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

function timeFormatter(seconds) {
    seconds = Math.ceil(seconds / 1000)
    var minutes = Math.floor(seconds / 60)

    if (seconds % 60 < 10) {
        return `${minutes}:0${seconds % 60}`
    } else {
        return `${minutes}:${seconds % 60}`
    }
}

function spinLoop() {
    spinWaiting = true
    setTimeout(() => {
        spinWaiting = false
        if (spinning) {
            // music.volume = 0.5
            if (music.currentTime > 6.5 && teto) {
                spinFactor = 0.25
            } else {
                spinFactor = 3
            }
            if (!teto) {
                music.playbackRate = lerp(music.playbackRate, 1, 1/spinSpeed)
                music.volume = lerp(music.volume, 0.5, 1/spinSpeed)
            }
            spins += 1/spinSpeed / spinFactor
            if (Math.floor(spins) != lastSent && sock && sock.OPEN) {
                console.log("RAH")
                $(".globalSpins").text(globalSpins + 1)
                lastSent = Math.floor(spins)
                // resetPFP()
                sock.send(`{"op": 4}`)
                if (spins > 1) {
                    $(".spinnyCount").css("display", "block")
                    $(".localSpins").html(lastSent);
                }
            }
        } else {
            if (!teto) {
                music.playbackRate = lerp(music.playbackRate, 0.5, 1/spinSpeed)
                music.volume = lerp(music.volume, -0, 3/spinSpeed)
            } else {
                music.pause()
                music.currentTime = 1.5
            }

            spins = lerp(spins, Math.round(spins), 1 / spinSpeed * 3)
        }
        $(".pfp").css("rotate", (spins * 360) + "deg")
        spinLoop()
    }, 1/spinSpeed * 1000);
}

function secondLoop() {
    $(".durationBarFormatter").each((_, item) => {
        item = $(item)
        item.text(`${timeFormatter((Date.now() - item.attr("data-start")))}/${timeFormatter((item.attr("data-end") - item.attr("data-start")))}`)
    })

    $(".timeEstimate").each((_, item) => {
        item = $(item)
        item.text(gameTimeFormatter(Date.now() - item.attr("data-start")))
    })

    $(".endEstimate").each((_, item) => {
        item = $(item)
        item.text(timeFormatter((item.attr("data-end") - Date.now())))
    })

    setTimeout(() => {
        secondLoop()
    }, 1000);
}

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}

window.onload = function () {
    $("#jsEnabled").text("true")

    pfp = $(".pfp")

    spinLoop()
    secondLoop()

    pfp.on("mousedown", () => {
        // if (!spinWaiting) {
        //     spinLoop();
        // }
        music.play()

        spinning = true

        pfp.css("transition", "")

        pfp.css("scale", "1.1")
    })

    document.body.onmouseup = () => {
        if (music.currentTime != 0) {
            // music.currentTime = 0
            // music.pause()

            // whipLash.currentTime = 0
            // whipLash.play()

            spinning = false

            // pfp.style.transition  = "all 3s cubic-bezier(0.39, 0.575, 0.565, 1)"

            pfp.css("scale", "1")
        }
    }
    socketeer()
}

var lastPong = Date.now()

function ping(dur) {
    sock.send(JSON.stringify({
        op: 3
    }))
    setTimeout(() => {
        ping(dur)
        if (Date.now() - lastPong > 120000) {
            sock.close()
            console.log("Max duration since last pong exceeded- Closing socket.")
        }
    }, dur);
}

function socketeer() {
    sock = new WebSocket('wss://api.violets-purgatory.dev')

    sock.addEventListener("open", () => {
        ping(30000)
    })

    sock.addEventListener("error", (error) => {
        console.log(error)
    })

    sock.addEventListener("close", () => {
        console.log("Connection Closed. Attempting Reconnect in 30 seconds.")
        $("#apiConnected").text("false")
        setTimeout(() => {
            socketeer()
        }, 30000);
    })

    sock.addEventListener("message", async (data) => {
        data = data.data
        data = JSON.parse(data)
        if (data.op == 4) {
            $("#apiConnected").text("true")
            globalSpins = data.spins
            if (firsttimeDebounce == true) {
                firsttimeDebounce = false
                $(".globalSpins").innerHTML = globalSpins + 1;
            } else {
                $(".globalSpins").innerHTML = globalSpins;
            }
        } else if (data.op == 0) {
            var lanyard = data.d
            var statusInfo = discStatuses[lanyard.discord_status]
            var lastStatus = $(".statusColor")

            if (lastStatus.innerHTML != statusInfo.text) {
                lastStatus.innerHTML = statusInfo.text
                lastStatus.css("color", statusInfo.color)

                pfp.css("borderColor", statusInfo.color)

                resetPFP()
            }

            // if (lanyard.activities[0] && lanyard.activities[0].type == 4) {
            //     document.querySelector(".customStatus").innerHTML = `<hr><img src=""><p>${lanyard.activities[0].state}</p>`
            // } else {
            //     document.querySelector(".customStatus").innerHTML = ""
            // }

            var discFetch = await (await fetch("/discHTML")).text()
            $("#activityHtml").html(discFetch)
        } else if (data.op == 3) {
            lastPong = Date.now()
        } else {
            console.log(data)
        }
    })
}
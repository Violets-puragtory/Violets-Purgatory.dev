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

var pfp

var music = new Audio("/snds/Lotus Waters.ogg")
music.preservesPitch = false
music.loop = true
music.playbackRate = 0
// var whipLash = new Audio("/snds/johnny-test-whip-crack.mp3")
// whipLash.volume = 0.25

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

function spinLoop() {
    spinWaiting = true
    setTimeout(() => {
        spinWaiting = false
        if (spinning) {
            music.volume = 0.5
            music.playbackRate = lerp(music.playbackRate, 1, 1/spinSpeed)
            if (spins > 1) {
                document.querySelector(".spinnyCount").style.display = "block"
                document.querySelector(".localSpins").innerHTML = Math.ceil(spins - 1);
            }
            spins += 1/spinSpeed / 3
            document.querySelector(".pfp").style.rotate = (spins * 360) + "deg"
            if (Math.floor(spins) != lastSent && sock && sock.OPEN) {
                document.querySelector(".globalSpins").innerHTML = globalSpins + 1
                lastSent = Math.floor(spins)
                // resetPFP()
                sock.send(`{"op": 4}`)
                console.log("Spin Sent!")
            }
        } else {
            music.playbackRate = lerp(music.playbackRate, 0.5, 1/spinSpeed)
            music.volume = lerp(music.volume, 0, 1/spinSpeed * 4)
        }
        spinLoop()
    }, 1/spinSpeed * 1000);
}

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}

window.onload = function () {
    window.scrollTo(0, 0);

    pfp = document.querySelector(".pfp")

    spinLoop()

    pfp.addEventListener("mousedown", () => {
        // if (!spinWaiting) {
        //     spinLoop();
        // }
        music.play()

        spinning = true

        pfp.style.transition = ""

        pfp.style.scale = "1.1"
    })

    document.body.onmouseup = () => {
        if (music.currentTime != 0) {
            // music.currentTime = 0
            // music.pause()

            // whipLash.currentTime = 0
            // whipLash.play()

            spinning = false

            pfp.style.transition = "all 3s cubic-bezier(0.39, 0.575, 0.565, 1)"

            pfp.style.scale = "1"
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
        setTimeout(() => {
            socketeer()
        }, 30000);
    })

    sock.addEventListener("message", async (data) => {
        data = data.data
        data = JSON.parse(data)
        if (data.op == 4) {
            globalSpins = data.spins
            if (firsttimeDebounce == true) {
                firsttimeDebounce = false
                document.querySelector(".globalSpins").innerHTML = globalSpins + 1;
            } else {
                document.querySelector(".globalSpins").innerHTML = globalSpins;
            }
        } else if (data.op == 0) {
            var lanyard = data.d
            var statusInfo = discStatuses[lanyard.discord_status]
            var lastStatus = document.querySelector(".statusColor")

            if (lastStatus.innerHTML != statusInfo.text) {
                lastStatus.innerHTML = statusInfo.text
                lastStatus.style.color = statusInfo.color

                pfp.style.borderColor = lastStatus.style.color

                resetPFP()
            }

            // if (lanyard.activities[0] && lanyard.activities[0].type == 4) {
            //     document.querySelector(".customStatus").innerHTML = `<hr><img src=""><p>${lanyard.activities[0].state}</p>`
            // } else {
            //     document.querySelector(".customStatus").innerHTML = ""
            // }

            var discFetch = await (await fetch("/discHTML")).text()
            document.querySelector("#activityHtml").innerHTML = discFetch
        } else if (data.op == 3) {
            lastPong = Date.now()
        } else {
            console.log(data)
        }
    })
}
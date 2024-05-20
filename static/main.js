var catsOnMars = new Audio("/snds/cats on mars.mp3")
var whipLash = new Audio("/snds/johnny-test-whip-crack.mp3")
catsOnMars.loop = true
catsOnMars.volume = 0.25
whipLash.volume = 0.25

var sock

var spins = 1
var globalSpins = 0

var firsttimeDebounce = true

var spinWaiting = false

function spinLoop() {
    spinWaiting = true
    setTimeout(() => {
        spinWaiting = false
        var pfp = document.querySelector(".pfp")
        if (!catsOnMars.paused) {
            if (spins > 1) {
                document.querySelector(".spinnyCount").style.display = "block"
                document.querySelector(".localSpins").innerHTML = Math.ceil(spins - 1);
            }
            spins += 0.5
            if (Math.round(spins) == spins && sock && sock.OPEN) {
                document.querySelector(".pfp").src = "https://api.violets-purgatory.dev/v1/pfp?" + new Date().getTime()
                sock.send(`{"op": 4}`)
                console.log("Spin Sent!")
            }
            spinLoop()
        }
    }, 1000);
}

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}

window.onload = function () {
    window.scrollTo(0, 0);

    var pfp = document.querySelector(".pfp")

    pfp.addEventListener("mousedown", () => {
        if (!spinWaiting) {
            spinLoop();
        }
        catsOnMars.play()

        pfp.style.animationName = "spinny"

        pfp.style.scale = "1.1"
    })

    document.body.onmouseup = () => {
        if (catsOnMars.currentTime != 0) {
            catsOnMars.currentTime = 0
            catsOnMars.pause()

            whipLash.currentTime = 0
            whipLash.play()

            pfp.style.animationName = "unset"
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

    sock.addEventListener("message", async(data) => {
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
            var discFetch = await (await fetch("/discHTML")).text()
            document.querySelector("#activityHtml").innerHTML = discFetch
        } else if (data.op == 3) {
            lastPong = Date.now()
        } else {
            console.log(data)
        }
    })
}
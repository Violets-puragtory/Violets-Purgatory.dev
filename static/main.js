var catsOnMars = new Audio("/snds/cats on mars.mp3")
var whipLash = new Audio("/snds/johnny-test-whip-crack.mp3")
catsOnMars.loop = true

var spins = 1

function notif(text) {
    document.body.innerHTML = "apple"
}

function secondLoop() {
    var pfp = document.querySelector(".pfp")
    if (!catsOnMars.paused) {
        spins += 0.5
        document.querySelector(".spinnyCount").innerHTML = `You have spun Violet ${Math.floor(spins)} times!` +  pfp.style.animationDuration
    }

    setTimeout(() => {
        secondLoop()
    }, 1000);
}

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}

window.onload = function () {
    window.scrollTo(0, 0);
    secondLoop()

    var pfp = document.querySelector(".pfp")

    pfp.addEventListener("mousedown", () => {
        catsOnMars.play()

        pfp.style.animationName = "spinny"

        pfp.style.scale = "1.2"
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
}

function socketeer() {
    var lanyard = new WebSocket('wss://api.violets-purgatory.dev')

    lanyard.onerror = (error) => {
        console.log(error)
    }

    lanyard.onclose = () => {
        console.log("Connection Closed. Attempting Reconnect in 30 seconds.")
        setTimeout(() => {
            socketeer()
        }, 3000);
    }

    function ping(dur) {
        lanyard.send(JSON.stringify({
            op: 3
        }))
        setTimeout(() => {
            ping(dur)
            if (Date.now() - lastPong > 120000) {
                lanyard.close()
                console.log("Max duration since last pong exceeded- Closing socket.")
            }
        }, dur);
    }

    lanyard.addEventListener("message", async (res) => {
        var data = JSON.parse(res.data)
        if (data.op == 1) {
            console.log("Connected to Discord Websocket!")
            ping(30000)
            lastPong = Date.now()
        } else if (data.op == 3) {
            lastPong = Date.now()
        }

        var discStatusHTML = await (await fetch("/discHTML")).text();

        var activityDiv = document.querySelector("#activityHTML")
        activityDiv.innerHTML = discStatusHTML
    })
}

socketeer()
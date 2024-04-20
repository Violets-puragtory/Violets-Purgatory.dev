var catsOnMars = new Audio("/snds/cats on mars.mp3")
var whipLash = new Audio("/snds/johnny-test-whip-crack.mp3")
catsOnMars.loop = true

var spins = 1
var globalSpins = 0

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
                document.querySelector(".globalSpins").innerHTML = Math.ceil(spins - 1) + globalSpins; 
            }
            spins += 0.5
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
}

var lastPong = Date.now()

function socketeer() {
    var sock = new WebSocket('wss://beta.violets-purgatory.dev')

    sock.onerror = (error) => {
        console.log(error)
    }

    sock.onclose = () => {
        console.log("Connection Closed. Attempting Reconnect in 30 seconds.")
        setTimeout(() => {
            socketeer()
        }, 3000);
    }

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

    sock.addEventListener("message", async (res) => {
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
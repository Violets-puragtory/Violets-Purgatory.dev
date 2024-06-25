const path = require("path"),
fs = require("fs"),
WebSocket = require('ws'),
EventEmitter = require("events").EventEmitter

const events = new EventEmitter();

const constants = JSON.parse(fs.readFileSync(path.join(__dirname, "constants.json")))

var lastPong = 0

module.exports = {
    "lanyard": constants.fallbackLanyard,
    "connected": false,
    "lastLanyardUpdate": Date.now(),

    "events": events,

    "spins": 0,
}

function socketeer() {
    var lanyard = new WebSocket('https://api.violets-purgatory.dev')

    lanyard.on("error", (error) => {
        console.log(error)
    })

    lanyard.on("close", () => {
        console.log("Connection Closed. Attempting Reconnect in 30 seconds.")
        module.exports.lanyard = constants.fallbackLanyard
        module.exports.connected = false
        setTimeout(() => {
            socketeer()
        }, 30000);
    })

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
        // console.log(data.op)
        if (data.op == 1) {
            console.log("Connected to Discord Websocket!")
            module.exports.connected = true
            ping(30000)
            lastPong = Date.now()
            events.emit("lanyardConnect")
        } else if (data.op == 3) {
            lastPong = Date.now()
        } else if (data.op == 0) {
            module.exports.lanyard = data.d
            module.exports.lastLanyardUpdate = Date.now()
            events.emit("lanyardUpdate")
        } else if (data.op == 4) {
            module.exports.spins = data.spins
        }
    })
}

socketeer()
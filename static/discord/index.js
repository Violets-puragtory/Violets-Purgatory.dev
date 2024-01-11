var lanyard = new WebSocket('wss://api.lanyard.rest/socket')

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
        var lanyardData = data.d
        // $("*").text(JSON.stringify(lanyardData))


        var statusData = statuses[lanyardData.discord_status]

        $("#discStatus").text(statusData.text)
        $("#discStatus").css("color", statusData.color)
        $(".pfp").css("border-color", statusData.color)

        if (lanyardData) {
            for (let index = 0; index < lanyardData.activities.length; index++) {
                const activity = lanyardData.activities[index];
                if (activity.type == 4) {
                    $("#discQuote").html(`<hr><em><span style="color: lightgray">"${lanyardData.activities[0].state}"</span> - ${lanyardData.discord_user.display_name} ${new Date(Date.now()).getFullYear()}</em>`)
                }
            }
        }
    }
})
var statColors = {
    "Do Not Disturb": "rgb(255, 25, 25)",
    "online": "rgb(0, 255, 0)",
    "idle": "rgb(255, 255, 25)",
    "offline": "rgb(150, 150, 150)"
}

fetch('https://api.lanyard.rest/v1/users/534132311781015564', {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
    },
})
   .then(response => response.json())
   .then(response => {
    var userdata = response.data.discord_user
    var statusData = response.data.discord_status

    $("#discUser").text(JSON.stringify(userdata.username).slice(1, -1))
    $("#discStatus").text(JSON.stringify(statusData).charAt(1).toUpperCase() + JSON.stringify(statusData).slice(2, -1))
    $("#discPFP, #discCard").css("border-color", statColors[JSON.stringify(statusData).slice(1, -1)])
    // $("*").text(JSON.stringify(response))
   })
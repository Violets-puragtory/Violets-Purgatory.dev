function rain() {
    var html = ""

    html += `<div class="rainStuff"><div class="rainContainer">`
    html += `<link rel="stylesheet" type="text/css" href="./themes/rain.css">`

    var amount = 7

    for (let index = 0; index < amount; index++) {
        html += `<div class="rainDrop"></div>`
    }
    html += "<style>"
    for (let index = 0; index < amount; index++) {
        html += `
        .rainDrop:nth-of-type(${index + 1}) {
            animation: rainAnim${index} ${(Math.random() * 0.3) + (2)}s linear;
            animation-iteration-count: infinite;
            animation-delay: ${Math.round(Math.random() * 100) / 100}s;
        }
        `
        var randos = []
        for (let index = 0; index < 11; index++) {
            randos.push(Math.round(Math.random() * 100))
        }

        html += `@keyframes rainAnim${index} {    `

        for (let index = 0; index < 5; index++) {
            html += `
        ${index * 3}0% {
            top: 110vh;
            right: ${randos[index]}%;
            visibility: hidden;
        }

        ${index * 3}0.1% {
            top: -10vh;
            right: ${randos[index + 1]}%;
            visibility: hidden;
        }
        ${index * 3}0.2% {
            visibility: visible;
        }
        `
        }
        // console.log(html)
        
        html += `90.3% { visibility: hidden; }`

        html += `}`

    }
    html += "</style>"
    html += "</div></div>"

    return html
}

function night() {

}

var events = [
    rain(),
    "",
]

module.exports = {

    returnTheme: function() {
        var time = new Date()
        return events[time.getUTCDay() % events.length]
    },

}
function rain() {
    var html = ""

    html += `<link rel="stylesheet" type="text/css" href="/themes/rain.css">`
    html += `<div class="rainStuff"><div class="rainContainer">`

    var amount = 7

    for (let index = 0; index < amount; index++) {
        html += `<div class="rainDrop"></div>`
    }
    html += "<style>"
    for (let index = 0; index < amount; index++) {
        html += `
        .rainDrop:nth-of-type(${index + 1}) {
            animation: rainAnim${index} ${((Math.round(Math.random() * 10) / 10) * 0.3) + 0.6}s linear;
            animation-delay: ${Math.round(Math.random() * 200) / 100}s;
            animation-iteration-count: infinite;
            animation-timing-function: cubic-bezier(0.47, 0, 0.745, 0.715);
        }
        `
        
        var pos = 0

        if (index % 2 == 0) {
            pos = Math.random() * 30
        } else {
            pos = (Math.random() * 30) + 70
        }

        pos = Math.round(pos)

        html += `@keyframes rainAnim${index} {    `
            html += `
        0% {
            top: -20vh;
            right: ${pos}%;
            visibility: visible;
        }

        90% {
            top: 110vh;
            right: ${pos}%;
            visibility: visible;
        }
        90.1% {
            visibility: hidden;
        }
        `

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
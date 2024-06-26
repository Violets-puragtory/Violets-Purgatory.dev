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

function purpleMagic() {
    var html = ""

    html += `<link rel="stylesheet" type="text/css" href="/themes/purpleMagic.css">`
    html += `<div class="magicStuff"><div class="magicContainer">`

    var amount = 30

    for (let index = 0; index < amount; index++) {
        html += `<div class="particle"></div>`
    }
    html += "<style>"
    for (let index = 0; index < amount; index++) {
        html += `
        .particle:nth-of-type(${index + 1}) {
            animation: magic${index} ${((Math.round(Math.random() * 10) / 10) * 0.3) + 20}s linear, sway 4s cubic-bezier(0.445, 0.05, 0.55, 0.95) alternate;
            animation-delay: ${Math.round(Math.random() * 100) / 100 * 20}s;
            animation-iteration-count: infinite;

        }
        `
        
        var pos = Math.round(Math.random() * 100)

        html += `@keyframes magic${index} {    `

            html += `
        0% {
            top: 110vh;
            right: ${pos}%;
            visibility: visible;
        }

        90% {
            top: -10vh;
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

function code() {
    return '<link rel="stylesheet" type="text/css" href="/themes/code/style.css"> <script src="/themes/code/script.js"></script>'
}

var events = [
    rain(),
    purpleMagic(),
    code(),
    "",
]

module.exports = {
    returnTheme: function() {
        var time = new Date()
        return events[time.getDate() % events.length]
    },

}
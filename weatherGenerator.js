module.exports = {

    makeRain: function (hardRain) {
        var html = ""

        html += `<div class="rainStuff"><div class="rainContainer">`

        html +=
            `
    <style>
        .rainStuff {
            position: sticky;
            top: 0;
            height: 0;
            z-index: -5;
        }

        .rainContainer {
            height: 100vh;
            width: 100vw;
            top: 0px;
            left: 0px;
            position: absolute;
            overflow: hidden;
        }

        .rainDrop {
            position: absolute;
            width: 5px;
            backdrop-filter: blur(5px);
            background-color: rgba(0, 0, 255, 0.1);
            height: 10vh;
            visibility: hidden;
        }

        body {
            background: linear-gradient(rgb(10, 10, 75), black);
        }
    </style>
    `

        var amount = 12

        var iterationReducer = 3

        if (hardRain) {
            amount = 100
            iterationReducer = 1
        }

        for (let index = 0; index < amount; index++) {
            html += `<div class="rainDrop"></div>`
        }
        html += "<style>"
        for (let index = 0; index < amount; index++) {
            html += `
            .rainDrop:nth-of-type(${index + 1}) {
                animation: rainAnim${index} ${(Math.random() * 0.3) + (5 - iterationReducer)}s linear;
                animation-iteration-count: infinite;
                animation-delay: ${Math.random()}s;
            }
            `
            var randos = []
            for (let index = 0; index < 11; index++) {
                randos.push(Math.random() * 100)
            }

            html += `@keyframes rainAnim${index} {    `

            for (let index = 0; index < (iterationReducer * -3.5) + 14.5; index++) {
                html += `
            ${index * iterationReducer}0% {
                top: 110vh;
                right: ${randos[index]}vw;
                visibility: hidden;
            }
    
            ${index * iterationReducer}0.1% {
                top: -10vh;
                right: ${randos[index + 1]}vw;
                visibility: hidden;
            }
            ${index * iterationReducer}0.2% {
                visibility: visible;
            }
            `
            }
            // console.log(html)

            html += `}`

        }
        html += "</style>"
        html += "</div></div>"

        return html
    }
}
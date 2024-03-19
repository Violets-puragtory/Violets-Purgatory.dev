module.exports = {

    makeRain: function (hardRain) {
        var html = ""

        html += `<div class="rainStuff"><div class="rainContainer">`

        var amount = 10

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
                animation-delay: ${Math.round(Math.random() * 100) / 100}s;
            }
            `
            var randos = []
            for (let index = 0; index < 11; index++) {
                randos.push(Math.round(Math.random() * 100))
            }

            html += `@keyframes rainAnim${index} {    `

            for (let index = 0; index < (iterationReducer * -3.5) + 14.5; index++) {
                html += `
            ${index * iterationReducer}0% {
                top: 110vh;
                right: ${randos[index]}%;
                visibility: hidden;
            }
    
            ${index * iterationReducer}0.1% {
                top: -10vh;
                right: ${randos[index + 1]}%;
                visibility: hidden;
            }
            ${index * iterationReducer}0.2% {
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
}
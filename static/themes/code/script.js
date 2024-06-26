function typeWriter(elem, delay) {
    var elemText = elem.text().split('')
    elem.text('_'.repeat(elemText.length))
    var i = 0
    function nextLetter() {
        console.log(elemText.length - i)
        elem.text(elemText.slice(0, i).join('') + '_'.repeat(elemText.length - i))
        if (i < elemText.length) {
            setTimeout(() => {
                i++
                nextLetter()
            }, 20)
        }
    }
    setTimeout(() => {
        if (elem.text() == '_'.repeat(elemText.length)) {
            nextLetter()
        }
    }, delay);
}

$(document).ready(() => {
    var i = 0
    var arr = $("span").each((_, item) => {
        if ($(item).text().length > 0) {
            i++
            typeWriter($(item), i * 450)
        }
        // $(item).text("APPL")
    })
})
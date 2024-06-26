$(document).ready(() => {
    function particle() {
        var particle = $("<div></div>")
        particle.addClass("particle")
        particle.css("left", (Math.random() * 100).toString() + "%")
        particle.css("visibility", "visible")
        particle.css("top", "100%")
        var anim = "sway 4s infinite cubic-bezier(0.445, 0.05, 0.55, 0.95)"
        if (Math.round(Math.random()) == 1) {
            anim += " alternate"
        } else {
            anim += " alternate-reverse"
        }
        particle.css("animation", anim)

        particle.animate({
            "top": "-5%"
        }, (((Math.round(Math.random() * 10) / 10) * 0.3) + 20) * 1000, () => {
            particle.remove()
        })

        $(".magicContainer").append(particle)
}

    $(".magicContainer > *").remove()

    function loop() {
        particle()
        setTimeout(() => {
            loop()
        }, 1000);
    }
    loop()
})
$(document).ready(() => {
    function particle() {
        var particle = $("<div></div>")
        particle.addClass("rainDrop")
        particle.css("left", (Math.random() * 100).toString() + "%")
        particle.css("visibility", "visible")
        particle.css("top", "-10%")

        particle.animate({
            "top": "110%",
            "easing": "linear"
        }, 600, () => {
            particle.remove()
        })

        $(".rainContainer").append(particle)
}

    $(".rainContainer > *").remove()

    function loop() {
        particle()
        setTimeout(() => {
            loop()
        }, 100 * (Math.random() + 0.25));
    }
    loop()
})
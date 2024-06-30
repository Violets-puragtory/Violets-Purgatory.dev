const PImage = require("pureimage"),
app = require("./expressHandler.js").app

app.get("/embedImage.png", (req, res) => {
    const r = {"x": 500, "y": 300}

    var img = PImage.make(r.x, r.y)

    var ctx = img.getContext("2d")
    ctx.clearRect()
    ctx.fillStyle = "rgb(255, 0, 0)"
    ctx.fillRect(0, 0, 200, 100)

    PImage.encodePNGToStream(img, res)
}) 

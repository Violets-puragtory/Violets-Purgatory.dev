const fs = require("fs")

require("./fileHandler.js")
require('./expressHandler.js')
// require("./imageEmbedder.js")

process.on('uncaughtException', (err, origin) => {
    fs.writeSync(
        process.stderr.fd,
        `Caught exception: ${err}\n` +
        `Exception origin: ${origin}`,
    );
});
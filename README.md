# Violets-Purgatory

Violet's Purgatory is a website filled to the brim with whatever I feel like adding! Currently, the stable version can be found at https://violets-purgatory.dev and the beta (based on the dev branch) can be found at https://beta.violets-purgatory.dev
Although beta probably *isn't* the right term, `dev.violets-purgatory.dev` is just kinda ugly :/

The main web page on the site is dynamically generated. ~~To prevent slow loading times, though, the HTML is generated and outputted into a file when nessacary instead of on request!~~ The website will continiously be actively under development until I die.

I have made sure that as much of the site functions as possible without any modifications from me. The website updates with my Discord information, such as my current activities (games and music), my status, and more.

Currently this is done with the Lanyard API, and as much as I appreciate them for their work, I hope to soon move to a Lanyard instance of our own so that we can spare Phineas (amazing developer of Lanyard) of their resources!

Violet's Purgatory is hosted on Railway right now, but there are plans to move to self-hosting.

We also have an API, which can be located at https://api.violets-purgatory.dev, which is currently very under developed, but will continue to have updates for features I see fit.

## To-do
- [ ] Stop using Lanyard Web Socket Directly and proxy it through the API (Alternatively, self host the Lanyard API)
- [ ] Cut the main CSS file into multiple so that only the nessacary CSS is loaded (Reduces traffic and loading times)
- [x] Add image caching instead of using image proxies (keeps the security benefit and decreases loading times)
- [x] Add code to automatically minify the HTML
- [x] Add random quotes
- [x] Seperate Values from the javascript into their own config for readability
- [x] Add a commit counter
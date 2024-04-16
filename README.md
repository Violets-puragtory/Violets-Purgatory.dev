# Violets-Purgatory

Violet's Purgatory is a website filled to the brim with whatever I feel like adding! Currently, the stable version can be found at https://violets-purgatory.dev and the beta (based on the dev branch) can be found at https://beta.violets-purgatory.dev

We also have an API, which can be located at https://api.violets-purgatory.dev, which is currently very under developed, but will continue to have updates for features I see fit.

# How it works

### The config
Although the code for it isn't nessacarily pretty, theres a few important things to go over with how it works.
The config.json file, soon to be renamed for a local config, contains constants for Violet's Purgatory. In the file, there are lots of important notable features, such as fallback activity images for the Discord Activity section, and words that are automatically highlighted.

### Word highlighting
Word highlighting is a feature that automatically sets the color of certain keywords, including but not limited to Violet being purple, Javascript being yellow, NodeJS being green, and Godot Engine being blue. This is nothing more than a fancy feature to reduce the amount of code required on the site.
These highlighted words ARE case senstive. You may notice certain things such as "Violet" at the top of the card are not highlighted despite being in the words list. To make a word in the highlight list not highlighted, simply add `{}` around it. E.G. for the title of the page, on the site it shows as `Violet`, but in the code is written as `{Violet}` to prevent highlighting.

To add new highlighted words, find the highlighted words section in config.json. The key is the word to highlight, and the value is the color.

### Dynamic HTML
Currently this system is extremely unsophisticated, adding new dynamic HTML isn't as streamlined as it should be. Basically, in the code, is a dictionary that specifies every keyword to look for. Then, it looks for those keywords, and replaces them with HTML.
A good example is the activity system. The keyword for the discord activities is `ACTIVITIES`. So, if you wanted to create another activity section, you would simply put `{ACTIVITIES}` in the HTML code. 

There is also a `{PATH_[html file]}` keyword. Currently, this is not used much, but may be more useful in the future.
On the main page, you can find `{PATH_SOCIALS}`. This effectively "embeds" the socials page on the site. The part of the page that is used is based upon the `main` HTML tag.
For an easy to digest example, look at the socials section on the main page of [Violet's Purgatory](https://violets-purgatory.dev). Afterwards, look at the [*socials page*](https://violets-purgatory.dev/socials). You will notice they're the same, because in the code for the main page, I put {PATH_SOCIALS} which got the page at /socials.

# To-do
- [ ] Add more content to the socials page & make it more easily findable on the site
    - [ ] Pull latest Youtube video & display it
    - [ ] Display current Discord Activities
    - [ ] Display current steam game
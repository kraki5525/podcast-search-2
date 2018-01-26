const {chunk, flatten} = require('lodash');
const axios = require('axios');
const AlphaPage = require('./alphaPage')
const CategoryPage = require('./categoryPage')
const PodcastPage = require('./podcastPage');

async function go(link, action) {
    const response = await axios.get(link);

    return action(response.data);
}

function parseAlpha(html) {
    return new AlphaPage(html);
}

function parseCategory(html) {
    return new CategoryPage(html);
}

function parsePodcast(html) {
    return new PodcastPage(html);
}

async function main() {
    const category = await go('https://itunes.apple.com/us/genre/podcasts-society-culture-history/id1462', parseCategory);
    const alphaPagePromises = category.links
        .map(link => go(link, parseAlpha));
    const alphaPages = await Promise.all(alphaPagePromises);
    const podcastLinksArrays = alphaPages
        .map(alphaPage => alphaPage.links);
    const podcastLinks = flatten(...podcastLinksArrays).slice(0, 10);
    const podcastPagePromises = podcastLinks
        .map(link => go(link, parsePodcast));
    const podcastPages = await Promise.all(podcastPagePromises);

    for (let x of podcastPages) {
        if (x.title === "A.P. Government and Politics") {
            console.log(x);
        }
    }
}

main();
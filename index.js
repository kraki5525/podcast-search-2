const {chunk, flatten} = require('lodash');
const axios = require('axios');
const AlphaPage = require('./alphaPage')
const CategoryPage = require('./categoryPage')
const PodcastPage = require('./podcastPage');
const ProcessQueue = require('./processQueue');

async function go(link, action, queue) {
    const response = await axios.get(link);

    return action(response.data, queue);
}

function parsePodcast(html) {
    return new PodcastPage(html);
}

function parseAlpha(html, queue) {
    const page = new AlphaPage(html);
    for (let link of page.podcastLinks) {
        queue.add({url: link, action: parsePodcast});
    }
}

function parseCategory(html, queue) {
    const page = new CategoryPage(html);
    for (let link of page.alphaLinks) {
        queue.add({url: link, action: parseAlpha});
    }
}

function sleep(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds)
    });
}

async function main() {
    let queue = new ProcessQueue(4);

    queue.add({url: 'https://itunes.apple.com/us/genre/podcasts-society-culture-history/id1462', action: parseCategory})

    for (let pages of queue.get()) {
        console.log(`${new Date(Date.now())} -  ${pages.length}`)
        let promises = pages.map(page => go(page.url, page.action, queue));
        await Promise.all(promises);

        await sleep(5000);
    }

    // const category = await go('https://itunes.apple.com/us/genre/podcasts-society-culture-history/id1462', parseCategory);
    // const alphaPagePromises = category.links
    //     .map(link => go(link, parseAlpha));
    // const alphaPages = await Promise.all(alphaPagePromises);
    // const podcastLinksArrays = alphaPages
    //     .map(alphaPage => alphaPage.links);
    // const podcastLinks = flatten(...podcastLinksArrays).slice(0, 10);
    // const podcastPagePromises = podcastLinks
    //     .map(link => go(link, parsePodcast));
    // const podcastPages = await Promise.all(podcastPagePromises);

    // for (let x of podcastPages) {
    //     if (x.title === "A.P. Government and Politics") {
    //         console.log(x);
    //     }
    // }
}

console.log('start');
main();
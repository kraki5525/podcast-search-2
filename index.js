const axios = require('axios');
const AlphaPage = require('./alphaPage');
const CategoryPage = require('./categoryPage');
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
        setTimeout(resolve, milliseconds);
    });
}

async function main() {
    let queue = new ProcessQueue(4);

    queue.add({url: 'https://itunes.apple.com/us/genre/podcasts-society-culture-history/id1462', action: parseCategory});

    for (let pages of queue.get()) {
        console.log(`${new Date(Date.now())} -  ${pages.length}`);
        let promises = pages.map(page => go(page.url, page.action, queue));
        await Promise.all(promises);

        await sleep(5000);
    }
}

console.log('start');
main();
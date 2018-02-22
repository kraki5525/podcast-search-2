const axios = require('axios');
const loki = require('lokijs');
const deepmerge = require('deepmerge');
const AlphaPage = require('./alphaPage');
const CategoryPage = require('./categoryPage');
const PodcastPage = require('./podcastPage');
const ProcessQueue = require('./processQueue');

const db = new loki('podcast.db');
db.loadDatabase();
const podcasts = db.addCollection('podcasts');

async function go(link, action, queue) {
    const response = await axios.get(link);

    return action(response.data, queue);
}

function parsePodcast(html) {
    let podcast = new PodcastPage(html);
    const dbPodcast = podcasts.find({ podcastItunesLink: podcast.itunesLink});

    console.log(dbPodcast.length);
    if (dbPodcast.length > 0) {
        podcast = deepmerge(dbPodcast[0], podcast);
        podcast.updated = new Date(Date.now());
        podcasts.update(podcast);
    }
    else {
        const date = new Date(Date.now());
        podcast.created = date;
        podcast.updated = date;
        podcasts.insert(podcast);
    }
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
    const queue = new ProcessQueue(4);

    // queue.add({url: 'https://itunes.apple.com/us/genre/podcasts-society-culture-history/id1462', action: parseCategory});
    queue.add({url: 'https://itunes.apple.com/us/genre/podcasts-society-culture-history/id1462?mt=2&letter=Q', action: parseAlpha});

    for (let pages of queue.get()) {
        console.log(`${new Date(Date.now())} -  ${pages.length}`);
        let promises = pages.map(page => go(page.url, page.action, queue));
        await Promise.all(promises);

        await sleep(5000);
    }

    db.saveDatabase();
    db.close();
}

console.log('start');
main();
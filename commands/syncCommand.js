const axios = require('axios');
const loki = require('lokijs');
const lfsa = require('../node_modules/lokijs/src/loki-fs-structured-adapter');
const util = require('util');
const deepmerge = require('deepmerge');
const BuilderFactory = require('../models/builders/builderFactory');
const PodcastPage = require('../models/podcastPage');
const ProcessQueue = require('../processQueue');
const {sleep} = require('../utils');

let podcasts = null;
const builderFactory = new BuilderFactory();
const db = new loki('podcast.db', {
    adapter: new lfsa()
});
const asyncLoadDatabase = util.promisify(db.loadDatabase).bind(db);

async function go(page, queue, messages) {
    const link = page.link;
    const action = page.action;
    const attempts = page.attempts;
    let response;

    messages.notify(`Fetching ${link}, attempt ${attempts}`);
    try {
        response = await axios.get(link);
    }
    catch (error) {
        if (attempts > 3) {
            messages.notify(error);
        }
        else {
            page.attempts = page.attempts + 1;
            queue.add(page);
        }
        return;
    }

    return action(response.data, queue);
}

function storePodcast(podcast) {
    const dbPodcast = podcasts.find({ itunesLink: podcast.itunesLink });

    if (dbPodcast.length > 0) {
        podcast = deepmerge(dbPodcast[0], podcast);
        podcast.updated = new Date(Date.now());
        podcasts.update(podcast);
    }
    else {
        podcasts.insert(podcast);
    }
}

function getAction(url) {
    const builder = builderFactory.create(url);
    return (html, queue) => {
        const page = builder.build(html);
        if (page instanceof PodcastPage) {
            storePodcast(page);
        }
        else {
            for (let link of page.links) {
                queue.add({url: link, action: getAction(link)});
            }
        }
    };
}

class SyncCommand {
    constructor(messages) {
        this.messages = messages;
    }

    async execute(page = 'https://itunes.apple.com/us/genre/podcasts/id26?mt=2') {
        await asyncLoadDatabase({});

        podcasts = db.getCollection('podcasts');
        if (podcasts === null) {
            podcasts = db.addCollection('podcasts');
        }

        const queue = new ProcessQueue(4);

        queue.add({url: page, action: getAction(page), attempts: 1});

        for (let pages of queue.get()) {
            let promises = pages.map(page => go(page.url, page.action, queue, this.messages));
            await Promise.all(promises);

            await sleep(5000);
        }

        db.saveDatabase();
        db.close();
    }
}

module.exports = SyncCommand;
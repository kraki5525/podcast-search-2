const axios = require('axios');
const loki = require('lokijs');
const util = require('util');
const deepmerge = require('deepmerge');
const AlphaPageBuilder = require('./models/builders/alphaPageBuilder');
const CategoryPageBuilder = require('./models/builders/categoryPageBuilder');
const PodcastPageBuilder = require('./models/builders/podcastPageBuilder');
const ProcessQueue = require('./processQueue');
const MessageNotification = require('./messageNotification');
const BaseCommand = require('./baseCommand');

let podcasts = null;
const alphaPageBuilder = new AlphaPageBuilder();
const categoryPageBuilder = new CategoryPageBuilder();
const podcastPageBuilder = new PodcastPageBuilder();
const db = new loki('podcast.db', {});
const asyncLoadDatabase = util.promisify(db.loadDatabase).bind(db);

async function go(link, action, queue, messages) {
    messages.notify(`Fetching ${link}`);
    const response = await axios.get(link);

    return action(response.data, queue);
}

function parsePodcast(html) {
    let podcast = podcastPageBuilder.build(html);
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

function parseAlpha(html, queue) {
    const page = alphaPageBuilder.build(html);
    for (let link of page.links) {
        queue.add({url: link, action: parsePodcast});
    }
}

function parseCategory(html, queue) {
    const page = categoryPageBuilder(html);
    for (let link of page.alphaLinks) {
        queue.add({url: link, action: parseAlpha});
    }
}

function sleep(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
const actions = {
    'alpha': parseAlpha,
    'category': parseCategory,
    'podcast': parsePodcast
};

function getAction(type) {
    const action = actions[type];
    if (!action) {
        throw 'Unknown page type';
    }
    return action;
}

class SyncCommand extends BaseCommand {
    async execute(page, type) {
        await asyncLoadDatabase({});

        podcasts = db.getCollection('podcasts');
        if (podcasts === null) {
            podcasts = db.addCollection('podcasts');
        }

        const queue = new ProcessQueue(4);
        const messages = new MessageNotification();

        queue.add({url: page, action: getAction(type)});

        for (let pages of queue.get()) {
            let promises = pages.map(page => go(page.url, page.action, queue, messages));
            await Promise.all(promises);

            await sleep(5000);
        }

        db.saveDatabase();
        db.close();
    }
}

module.exports = SyncCommand;
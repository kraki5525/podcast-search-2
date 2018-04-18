const axios = require('axios');
const loki = require('lokijs');
const util = require('util');
const deepmerge = require('deepmerge');
const BuilderFactory = require('../models/builder/builderFactory');
const PodcastPage = require('../models/podcastPage');
const ProcessQueue = require('../processQueue');
const MessageNotification = require('../messageNotification');
const BaseCommand = require('./baseCommand');
const {sleep} = require('../utils');

let podcasts = null;
const builderFactory = new BuilderFactory();
const db = new loki('podcast.db', {});
const asyncLoadDatabase = util.promisify(db.loadDatabase).bind(db);

async function go(link, action, queue, messages) {
    messages.notify(`Fetching ${link}`);
    const response = await axios.get(link);

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

class SyncCommand extends BaseCommand {
    async execute(page) {
        await asyncLoadDatabase({});

        podcasts = db.getCollection('podcasts');
        if (podcasts === null) {
            podcasts = db.addCollection('podcasts');
        }

        const queue = new ProcessQueue(4);
        const messages = new MessageNotification();

        queue.add({url: page, action: getAction(page)});

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
const axios = require('axios');
const deepmerge = require('deepmerge');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const util = require('util');

const BuilderFactory = require('../models/builders/builderFactory');
const PodcastPage = require('../models/podcastPage');
const ProcessQueue = require('../services/processQueue');
const {sleepPromise} = require('../services/utils');

const builderFactory = new BuilderFactory();
const fileExists = util.promisify(fs.stat);

let db;

async function go(page, queue, messageNotification) {
    const link = page.url;
    const action = page.action;
    const attempts = page.attempts;
    let response;

    messageNotification.notify(`Fetching ${link}, attempt ${attempts}`);
    try {
        response = await axios.get(link);
    }
    catch (error) {
        if (attempts > 3) {
            messageNotification.notify(error);
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
                queue.add({url: link, action: getAction(link), attempts: 1});
            }
        }
    };
}

async function initializeDatabase() {
    const exists = await fileExists('./podcast.data');
    const promise = new Promise((resolve, reject) => {
        const db = new sqlite3.Database('podcasts.data', (err) => {
            if (err) {
                reject(err);
            }

            if (!exists) {
                db.serialize(() => {
                    db.run('CREATE TABLE podcast(name TEXT, url TEXT)');
                });
            }

            resolve(db);
        });
    });

    return promise;
}

class SyncCommand {
    constructor(messages) {
        this.messages = messages;
    }

    async execute(page) {
        if (!page) {
            throw 'Page is required';
        }

        const messageNotification = this.messages;
        db = await initializeDatabase();

        return;

        // podcasts = db.getCollection('podcasts');
        // if (podcasts === null) {
        //     podcasts = db.addCollection('podcasts');
        // }

        const queue = new ProcessQueue(4);

        queue.add({url: page, action: getAction(page), attempts: 1});

        for (let pages of queue.get()) {
            let promises = pages.map(page => go(page, queue, messageNotification));
            await Promise.all(promises);

            await sleepPromise(5000);
        }

        db.close();
    }
}

module.exports = SyncCommand;
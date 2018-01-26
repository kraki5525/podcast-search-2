const cheerio = require('cheerio');
const reg = /\{.*\}/;

class Episode {
    constructor(adamId, html) {
        const $ = cheerio.load(html);
        const selector = $(`tr[adam-id="${adamId}"]`)
        const descriptionScript = $(`.track-list-inline-details div[adam-id="${adamId}"] script`).get(0).children[0].data;
        const match = reg.exec(descriptionScript);
        let description = null;
        if (match) {
            let jsonString = match[0];
            description = jsonString;
            // let json = JSON.parse(jsonString);
            // description = json.description;
        }

        this.episodeDescription = description;
        this.adamId = adamId;
        this.episodeReleaseDate = selector.find('.release-date .text').text();
        this.episodeTitle = selector.find('.name .text').text();
    }

    get description() {
        return this.episodeDescription;
    }

    get releaseDate() {
        return this.episodeReleaseDate;
    }

    get title() {
        return this.episodeTitle;
    }
}

module.exports = Episode;
const cheerio = require('cheerio');

class Episode {
    constructor(html, adamId) {
        const $ = cheerio.load(html);
        const selector = $(`tr[adam-id="${adamId}"]`)

        this.adamId = adamId;
        // this.episodeDescription = $('.name .text').text();
        this.episodeReleaseDate = $('.release-date .text').text();
        this.episodeTitle = $('.name .text').text();
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
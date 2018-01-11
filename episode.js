const cheerio = require('cheerio');

class Episode {
    constructor(html, adamId) {
        const $ = cheerio.load(html);
        const selector = $(`tr[adam-id="${adamId}"]`)

        this.adamId = adamId;
        this.episodeReleaseDate = selector.find('.release-date .text').text();
        this.episodeTitle = selector.find('.name .text').text();

        var js = $(`div[adam-id="${adamId}"]`).text();
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
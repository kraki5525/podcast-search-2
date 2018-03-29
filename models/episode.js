const cheerio = require('cheerio');
const reg = /\{.*\}/s;

class Episode {
    constructor(adamId, html) {
        const $ = cheerio.load(html);
        const selector = $(`tr[adam-id="${adamId}"]`)
        const descriptionScript = $(`.track-list-inline-details div[adam-id="${adamId}"] script`).get(0).children[0].data;
        const match = reg.exec(descriptionScript);
        let description = null;
        if (match) {
            let jsonString = match[0];
            let json = JSON.parse(jsonString);
            description = json.description;
        }

        this.description = description;
        this.adamId = adamId;
        this.releaseDate = selector.find('.release-date .text').text();
        this.title = selector.find('.name .text').text();
    }
}

module.exports = Episode;
const cheerio = require('cheerio');

class AlphaPage {
    constructor(html) {
        let $ = cheerio.load(html);
        this.links = $('#selectedcontent .column li a')
            .map(function () {
                return $(this).attr('href');
            })
            .get();
    }

    get podcastLinks() {
        return this.links;
    }
}

module.exports = AlphaPage;
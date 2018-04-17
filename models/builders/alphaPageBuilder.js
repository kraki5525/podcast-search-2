const cheerio = require('cheerio');
const AlphaPage = require('../alphaPage');

class AlphaPageBuilder {
    build(html) {
        const $ = cheerio.load(html);
        const alphaPage = new AlphaPage();

        alphaPage.links = $('#selectedcontent .column li a')
            .map(function () {
                return $(this).attr('href');
            })
            .get();

        return alphaPage;
    }
}

module.exports = AlphaPageBuilder;
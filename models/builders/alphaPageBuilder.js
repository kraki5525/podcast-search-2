const cheerio = require('cheerio');
const AlphaPage = require('../alphaPage');

class AlphaPageBuilder {
    build(html) {
        const $ = cheerio.load(html);
        const alphaPage = new AlphaPage();
        const pageLinks = $('ul.paginate')
            .first()
            .find('a')
            .not('.selected')
            .map(function() {
                return $(this).attr('href');
            })
            .get();
        const podcastLinks = $('#selectedcontent .column li a')
            .map(function () {
                return $(this).attr('href');
            })
            .get();

        alphaPage.links = [...pageLinks, ...podcastLinks];

        return alphaPage;
    }
}

module.exports = AlphaPageBuilder;
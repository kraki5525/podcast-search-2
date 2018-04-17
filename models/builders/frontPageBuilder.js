const cheerio = require('cheerio');
const FrontPage = require('../categoryPage');

class FrontPageBuilder {
    build(html) {
        const $ = cheerio.load(html);
        const frontPage = new FrontPage();

        frontPage.links = $('#genre-nav .column>li>a')
            .map(function() {
                return $(this).attr('href');
            })
            .get();

        return frontPage;
    }
}

module.exports = FrontPageBuilder;
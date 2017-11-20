const cheerio = require('cheerio');

class CategoryPage {
    constructor(html) {
        let $ = cheerio.load(html);
        this.links = $('ul.alpha li a')
            .map(function() {
                return $(this).attr('href');
            })
            .get();
    }

    get alphLinks() {
        return this.links;
    }
}

module.exports = CategoryPage;
const cheerio = require('cheerio');
const CategoryPage = require('../categoryPage');

class CategoryPageBuilder {
    build(html) {
        const $ = cheerio.load(html);
        const categoryPage = new CategoryPage();

        categoryPage.links = $('ul.alpha li a')
            .map(function() {
                return $(this).attr('href');
            })
            .get();

        return categoryPage;
    }
}

module.exports = CategoryPageBuilder;
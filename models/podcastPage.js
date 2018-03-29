const cheerio = require('cheerio');
const Episode = require('./episode');

class PodcastPage {
    constructor(html) {
        let $ = cheerio.load(html);

        this.created = null;
        this.updated = null;

        this.author = $('#title .left h2').text();
        this.description = $('.center-stack .product-review p').text();
        this.itunesLink = $('#left-stack .product>a')
            .eq(0)
            .attr('href');
        this.language = $('#left-stack .product .language')
            .get(0)
            .lastChild
            .data;
        this.title = $('#title .left h1').text();
        this.webpage = $('#left-stack .extra-list ul.list li a')
            .eq(0)
            .attr('href');

        this.episodes = $('.center-stack .track-list .tracklist-table tbody tr')
            .map(function () {
                return new Episode($(this).attr('adam-id'), html);
            })
            .get();
    }
}

module.exports = PodcastPage;
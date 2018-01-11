const cheerio = require('cheerio');
const Episode = require('./episode');

class PodcastPage {
    constructor(html) {
        let $ = cheerio.load(html);

        this.podcastAuthor = $('#title .left h2').text();
        this.podcastDescription = $('.center-stack .product-review p').text();
        this.podcastItunesLink = $('#left-stack .product>a')
            .eq(0)
            .attr('href');
        this.podcastLanguage = $('#left-stack .product .language')
            .get(0)
            .lastChild
            .data;
        this.podcastTitle = $('#title .left h1').text();
        this.podcastWebpage = $('#left-stack .extra-list ul.list li a')
            .eq(0)
            .attr('href');

        this.podcastEpisodes = $('.center-stack .track-list .tracklist-table tbody tr')
            .map(function () {
                return new Episode($(this).attr('adam-id'), html);
            })
            .get();
    }

    get author() {
        return this.podcastAuthor;
    }

    get episodes() {
        return this.podcastEpisodes;
    }

    get itunesLink() {
        return this.podcastItunesLink;
    }

    get language() {
        return this.podcastLanguage;
    }

    get title() {
        return this.podcastTitle;
    }

    get webpage() {
        return this.podcastWebpage;
    }
}

module.exports = PodcastPage;
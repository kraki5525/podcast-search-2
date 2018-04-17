const cheerio = require('cheerio');
const PodcastPage = require('../podcastPage');
const Episode = require('../episode');
const reg = /\{.*\}/s;

function parseEpisode($, adamId) {
    const selector = $(`tr[adam-id="${adamId}"]`);
    const descriptionScript = $(`.track-list-inline-details div[adam-id="${adamId}"] script`).get(0).children[0].data;
    const match = reg.exec(descriptionScript);
    let description = null;
    if (match) {
        let jsonString = match[0];
        let json = JSON.parse(jsonString);
        description = json.description;
    }

    const episode = new Episode();

    episode.description = description;
    episode.adamId = adamId;
    episode.releaseDate = selector.find('.release-date .text').text();
    episode.title = selector.find('.name .text').text();

    return episode;
}

class PodcastPageBuilder {
    build(html) {
        const $ = cheerio.load(html);
        const podcast = new PodcastPage();

        podcast.created = null;
        podcast.updated = null;

        podcast.author = $('#title .left h2').text();
        podcast.description = $('.center-stack .product-review p').text();
        podcast.itunesLink = $('#left-stack .product>a')
            .eq(0)
            .attr('href');
        podcast.language = $('#left-stack .product .language')
            .get(0)
            .lastChild
            .data;
        podcast.title = $('#title .left h1').text();
        podcast.webpage = $('#left-stack .extra-list ul.list li a')
            .eq(0)
            .attr('href');

        podcast.episodes = $('.center-stack .track-list .tracklist-table tbody tr')
            .map(function () {
                return parseEpisode($, $(this).attr('adam-id'));
            })
            .get();

        return podcast;
    }
}

module.exports = PodcastPageBuilder;
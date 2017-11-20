const request = require('request-promise-native');
const AlphaPage = require('./alphaPage')
const CategoryPage = require('./categoryPage')

async function go(link, action) {
    const html = await request(link);

    return action(html);
}

function parseAlpha(html) {
    return new AlphaPage(html);
}

function parseCategory(html) {
    return new CategoryPage(html);
}

async function main() {
    const category = await go('https://itunes.apple.com/us/genre/podcasts-society-culture-history/id1462', parseCategory);
    const alphaPagePromises = category.links
                            .map(link => go(link, parseAlpha));
    const alphaPages = await Promise.all(alphaPagePromises);    
    const podcastLinks = alphaPages
                            .map(alphaPage => alphaPage.links);
    console.log(podcastLinks);
}

main();
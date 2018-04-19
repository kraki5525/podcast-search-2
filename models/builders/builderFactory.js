const AlphaPageBuilder = require('./alphaPageBuilder');
const AlphaNumberedBuilder = require('./alphaNumberedPageBuilder');
const CategoryPageBuilder = require('./categoryPageBuilder');
const FrontPageBuilder = require('./frontPageBuilder');
const PodcastPageBuilder = require('./podcastPageBuilder');

class BuilderFactory {
    create(link) {
        if (link.includes('letter') && link.includes('page')) {
            return new AlphaNumberedBuilder();
        }
        if (link.includes('letter')) {
            return new AlphaPageBuilder();
        }
        if (link.includes('id26')) {
            return new FrontPageBuilder();
        }
        if (link.includes('genre')) {
            return new CategoryPageBuilder();
        }
        return new PodcastPageBuilder();
    }
}

module.exports = BuilderFactory;
class PodcastPage {
    constructor() {
        const date = new Date(Date.now());
        this.created = date;
        this.updated = date;
        this.author = '';
        this.category = '';
        this.description = '';
        this.itunesLink = '';
        this.language = '';
        this.title = '';
        this.webpage = '';
        this.episodes = [];
    }
}

module.exports = PodcastPage;
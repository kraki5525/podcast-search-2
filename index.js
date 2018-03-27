const SyncCommand = require('./syncCommand');


async function main() {
    const command = new SyncCommand();
    // await command.execute('https://itunes.apple.com/us/genre/podcasts-society-culture-history/id1462?mt=2&letter=Q', 'Alpha');
    await command.execute('https://itunes.apple.com/us/genre/podcasts-society-culture-history/id1462', 'Category');
}

main();
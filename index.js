const SyncCommand = require('./commands/syncCommand');
const MessageNotification = require('./messageNotification');


async function main() {
    const messageNotification = new MessageNotification();
    const command = new SyncCommand(messageNotification);
    // await command.execute('https://itunes.apple.com/us/genre/podcasts-society-culture-history/id1462?mt=2&letter=B');
    await command.execute('https://itunes.apple.com/us/genre/podcasts-society-culture-history/id1462?mt=2&letter=A&page=2#page');
    // await command.execute('https://itunes.apple.com/us/genre/podcasts-society-culture-history/id1462');
}

main();
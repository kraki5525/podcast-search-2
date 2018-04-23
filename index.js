const program = require('commander');
const SyncCommand = require('./commands/syncCommand');
const MessageNotification = require('./services/messageNotification');
const messageNotification = new MessageNotification();

program
    .command('sync [page]')
    .action(async function(page) {
        //'https://itunes.apple.com/us/genre/podcasts/id26?mt=2'
        const command = new SyncCommand(messageNotification);
        const url = page || 'https://itunes.apple.com/us/genre/podcasts-society-culture-history/id1462?mt=2&letter=X';
        await command.execute(url);
        console.log('done');
    });

program.parse(process.argv);
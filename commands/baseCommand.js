class BaseCommand {
    constructor() {
        throw 'Can\'t create abstract BaseCommand';
    }

    async execute() {
        return null;
    }
}

module.exports = BaseCommand;
function sleepPromise(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

module.exports = {
    sleepPromise: sleepPromise
};
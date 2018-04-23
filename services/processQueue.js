class ProcessQueue {
    constructor(batchSize = 1) {
        this._batchSize = batchSize;
        this._queue = [];
    }

    add(item) {
        this._queue.push(item);
    }

    * get() {
        while (this._queue.length > 0) {
            yield this._queue.splice(0, this._batchSize);
        }
    }
}

module.exports = ProcessQueue;
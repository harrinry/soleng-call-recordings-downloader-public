'use strict'

exports.ProcessedResultsStore = class {
    constructor() {
        this._processed = []
    }

    isResultProcessed(result) {
        return this._processed.indexOf(result) !== -1
    }

    addResultAsProcessed(result) {
        this._processed.push(result)
    }

    removeResultFromProcessed(result) {
        this._processed.splice(this._processed.indexOf(result), 1)
    }
}
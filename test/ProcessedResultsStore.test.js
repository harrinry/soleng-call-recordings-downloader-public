'use strict'

const test = require('tape')
const { ProcessedResultsStore } = require('../lib/ProcessedResultsStore')

test('add&find processed result', t => {

    let processed = new ProcessedResultsStore()
    let exp = true
    let expId = 1

    processed.addResultAsProcessed(expId)
    t.equals(processed.isResultProcessed(expId), exp)
    
    t.equals(processed.isResultProcessed(2), false)
    t.end()
})

test('remove&find processed result', t => {
    let processed = new ProcessedResultsStore()
    let exp = false

    let expId = 1
    processed.addResultAsProcessed(expId)
    t.equals(processed.isResultProcessed(expId), true)
    
    processed.removeResultFromProcessed(expId)
    t.equals(processed.isResultProcessed(expId), exp)
    t.end()
})
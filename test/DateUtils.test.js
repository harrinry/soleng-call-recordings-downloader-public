'use strict'

const test = require('tape')
const DateUtils = require('../lib/DateUtils').DateUtils

test('date formatting', (t) => {

    let year = 2017, month = 8, day = 1

    let formattedDate = DateUtils.formatDate(toDate(year, month, day))
    let expression = /^(\d{4})-(\d{2})-(\d{2})$/

    t.equals(expression.test(formattedDate), true)

    month = 10, day = 10
    formattedDate = DateUtils.formatDate(toDate(year, month, day))
    
    t.equals(expression.test(formattedDate), true)

    t.end()
})

function toDate(year, month, day) {
    let date = new Date()
    date.setUTCDate(day)
    date.setUTCMonth(month)
    date.setUTCFullYear(year)
    return date
}
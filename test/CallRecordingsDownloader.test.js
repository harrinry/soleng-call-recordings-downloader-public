'use strict'

const test = require('tape')
const { CallRecordingsDownloader } = require('../lib/CallRecordingsDownloader')
const { CallRecordingsPageDownloader } = require('../lib/CallRecordingsPageDownloader')
const { CallRecordingFileWriter } = require('../lib/CallRecordingFileWriter')
const { RestRecordingsClient } = require('../lib/RecordingClient')
const { DateUtils }  = require('../lib/DateUtils')
const { TestUtils } = require('./TestUtils')
const winston = require('winston')

let expSecurityToken = 'warden_token'

let expRecordingServerSettings = {
    recordingServer : 'cad',
    basePath : '/'
}

let expStartDate = '2017-08-22'
let expEndDate = '2017-08-22'
let expStartTime = '00:00:00'
let expEndTime = '01:00:00'

let logger = new winston.Logger({
    level: 'info',
    transports: [
        new (winston.transports.Console)({
            json : false
        })
    ]
})

let expRestClient = new RestRecordingsClient(expRecordingServerSettings.recordingServer, expSecurityToken, expRecordingServerSettings.basePath)
let expWriter = new CallRecordingFileWriter(__dirname)
let expPageDownloader = new CallRecordingsPageDownloader(logger, expRestClient, expWriter)

function getResultsStub(total) {
    return {
        list : {
            total : total
        }
    } 
}

test('throw exception when wrong parameters sent on downloadRecordings', (t) => {
    t.plan(3)
    
    try {
        let downloader = new CallRecordingsDownloader(undefined, undefined, undefined)
        t.fail('Should not continue without proper client, logger and save classes defined')
    } catch (e) {
        t.pass()
    }
    
    try {
        let downloader = new CallRecordingsDownloader(expRestClient, undefined, undefined)
        t.fail('Should not continue without proper client, logger and save classes defined')
    } catch (e) {
        t.pass()
    }
    
    try {
        let downloader = new CallRecordingsDownloader(expRestClient, logger, undefined)
        t.fail('Should not continue without proper client, logger and save classes defined')
    } catch (e) {
        t.pass()
    }
    
    t.end()
})

test('calculate number of pages', t => {
    
    let downloader = new CallRecordingsDownloader(expRestClient, logger, expWriter)
    let total = 10
    let pageSize = 5
    let expPageCount = 2 
    
    let results = getResultsStub(total)
    t.equals(downloader._numberOfPages(results, pageSize), expPageCount)
    
    total = 11
    expPageCount = 3
    results = getResultsStub(total)
    t.equals(downloader._numberOfPages(results, pageSize), expPageCount)
    
    t.end()
})

test('calculate date interval for last hour', t=> {
    
    let downloader = new CallRecordingsDownloader(expRestClient, logger, expPageDownloader)
    let dates = downloader._calculateDateRangeForLastHour()
    t.equals(dates.startDate.getTime(), dates.endDate.getTime() - 1000*60*60 )
    t.end()
    
})

test('calculate date interval for next 24h', t=> {
    
    let downloader = new CallRecordingsDownloader(expRestClient, logger, expPageDownloader)
    let dates = downloader._calculateDateRangeForNext24Hours()
    t.equals(dates.endDate.getTime(), dates.startDate.getTime() + 1000*60*60*24 )
    t.end()
    
})

test('download', t=> {
    
    t.plan(3)

    testDownloadFn(t)
})

async function testDownloadFn(t){
    
    class TestClient {
        constructor(total){
            this._total = total
        }
        
        getSecuredRecordingsList(startDate, endDate, startTime, endTime){
            return {
                list : {
                    total : this._total
                }
            }
        }
    }
    
    class TestPageDownloader {
        download(startDate, endDate, startTime, endTime, page) {
            return true
        }
    }

    class ErrorTestPageDownloader {
        download(startDate, endDate, startTime, endTime, page) {
            throw new Error('Test error')
        }
    }
    
    //1. Empty list - total equals 0
    let downloader = new CallRecordingsDownloader(new TestClient(0), logger, expPageDownloader)

    try {
        let result = await downloader.downloadRecordingsOfLastHour()
        t.fail('Total equal 0 should throw error')
    } catch (err) {
        t.pass()
    }

    //2. List size equals 200
    downloader = new CallRecordingsDownloader(new TestClient(200), logger, new TestPageDownloader())

    try {
        let result = await downloader.downloadRecordingsOfLastHour()
        t.equals(result, true)
    } catch(err) {
        t.fail()
    }

    //3. Error downloading records
    downloader = new CallRecordingsDownloader(new TestClient(200), logger, new ErrorTestPageDownloader())
    let result = await downloader.downloadRecordingsOfLastHour()
    t.pass(result, false)
}
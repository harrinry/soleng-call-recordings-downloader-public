'use strict'

const test = require('tape')
const { CallRecordingsDownloader } = require('../lib/CallRecordingsDownloader')
const { CallRecordingsPageDownloader } = require('../lib/CallRecordingsPageDownloader')
const { CallRecordingFileWriter } = require('../lib/CallRecordingFileWriter')
const { ProcessedResultsStore } = require('../lib/ProcessedResultsStore')
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

test('download', t=> {
    
    t.plan(18)
    
    testDownloadFn(t)
})

async function testDownloadFn(t){
    
    //1.Error getting list
    class TestClient {
        constructor(total){
            this._total = total
        }
        
        getSecuredRecordingsList(startDate, endDate, startTime, endTime, page){
            throw new Error('Test error')
        }
    }
    
    try {
        let downloader = new CallRecordingsPageDownloader( logger, new TestClient(), expPageDownloader, new ProcessedResultsStore())
        let result = await downloader.download(expStartDate, expEndDate, expStartTime, expEndTime, 0)
        t.fail('should not continue after error')
    } catch(err) {
        t.pass('Should throw error')
        console.log("1")
    }
    
    //2. Make sure the interactions are OK
    class ReturnResultsTestClient {
        constructor(){
            this._downloads = []
        }
        
        getSecuredRecordingsList(startDate, endDate, startTime, endTime, page) {
            return {
                list : {
                    pageResults : [ 
                        { id : "1", destination : "A"},
                        { id : "2", destination : "B"},
                        { id : "3", destination : "C"},
                        { id : "4", destination : "D"},
                        { id : "5", destination : "E"}
                    ]
                }
            }
        }
        
        getSecuredRecordingMediaLink(id) {
            return "link_" + id
        }
        
        secureDownloadRecording(link){
            let result = link + "_stream"
            this._downloads.push(result)
            
            return result
        }
        
        getDownloads() {
            return this._downloads
        }
    }
    
    class TestSaver {
        constructor(){}
        
        save(stream){
            return true
        }
    }
    
    try {
        let testClient = new ReturnResultsTestClient()
        let downloader = new CallRecordingsPageDownloader( logger, testClient, new TestSaver(), new ProcessedResultsStore())
        let result = await downloader.download(expStartDate, expEndDate, expStartTime, expEndTime, 0)
        t.equals(result, true)
        
        t.notEquals(testClient.getDownloads().indexOf('link_1_stream'), -1)
        t.notEquals(testClient.getDownloads().indexOf('link_2_stream'), -1)
        t.notEquals(testClient.getDownloads().indexOf('link_3_stream'), -1)
        t.notEquals(testClient.getDownloads().indexOf('link_4_stream'), -1)
        t.notEquals(testClient.getDownloads().indexOf('link_5_stream'), -1)
        
    } catch (err) {
        console.log(err)
        t.fail('Should not fail with list, link and stream dowloaded and saved')
    }
    
    //3. Skip '*' destinations
    class ReturnResultsToSkipTestClient {
        constructor(){
            this._downloads = []
        }
        
        getSecuredRecordingsList(startDate, endDate, startTime, endTime, page) {
            return {
                list : {
                    pageResults : [ 
                        { id : "6", destination : ["A"]},
                        { id : "7", destination : ["B"]},
                        { id : "8", destination : ["C"]},
                        { id : "9", destination : ["D"]},
                        { id : "10", destination : ["*"]}
                    ]
                }
            }
        }
        
        getSecuredRecordingMediaLink(id) {
            return "link_" + id
        }
        
        secureDownloadRecording(link){
            let result = link + "_stream"
            this._downloads.push(result)
            
            return result
        }
        
        getDownloads() {
            return this._downloads
        }
    }
    
    try {
        let testClient = new ReturnResultsToSkipTestClient()
        let downloader = new CallRecordingsPageDownloader( logger, testClient, new TestSaver(), new ProcessedResultsStore())
        let result = await downloader.download(expStartDate, expEndDate, expStartTime, expEndTime, 0)
        t.equals(result, true)
        
        t.notEquals(testClient.getDownloads().indexOf('link_6_stream'), -1)
        t.notEquals(testClient.getDownloads().indexOf('link_7_stream'), -1)
        t.notEquals(testClient.getDownloads().indexOf('link_8_stream'), -1)
        t.notEquals(testClient.getDownloads().indexOf('link_9_stream'), -1)
        t.equals(testClient.getDownloads().indexOf('link_10_stream'), -1)

    } catch (err) {
        console.log(err)
        t.fail('Should not fail with list, link and stream dowloaded and saved')
    }

    //4. Try to process already processed results
     try {
        let processedResults = new ProcessedResultsStore()
        processedResults.addResultAsProcessed("6")
        processedResults.addResultAsProcessed("7")
        processedResults.addResultAsProcessed("8")
        processedResults.addResultAsProcessed("9")

        let testClient = new ReturnResultsToSkipTestClient()
        let downloader = new CallRecordingsPageDownloader( logger, testClient, new TestSaver(), processedResults)
        let result = await downloader.download(expStartDate, expEndDate, expStartTime, expEndTime, 0)
        t.equals(result, true)
        
        t.equals(testClient.getDownloads().indexOf('link_6_stream'), -1)
        t.equals(testClient.getDownloads().indexOf('link_7_stream'), -1)
        t.equals(testClient.getDownloads().indexOf('link_8_stream'), -1)
        t.equals(testClient.getDownloads().indexOf('link_9_stream'), -1)

    } catch (err) {
        console.log(err)
        t.fail('Should not fail with list, link and stream dowloaded and saved')
    } 


}
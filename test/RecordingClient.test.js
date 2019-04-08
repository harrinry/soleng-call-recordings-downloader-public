'use strict'

const test = require('tape')
const { start, stop } = require('./CallRecordingServer')
const { RestRecordingsClient, RecordingsList} = require('../lib/RecordingClient')
const http = require('http')

const recList_Mock = () => {
    return  JSON.stringify([
        {
            'context': 'tpn', 
            'id': 10000001, 
            'callId': 'c0085a2d44555a407563296a381f4113',
            'linkedId': 'c0085a2d44555a407563296a381f4113',
            'userId': 'guy', 
            'queue': '',
            'source': '613­297­2440',
            'destination': '613­604­9920',
            'direction': 'outbound', 
            'extension': ' tpn', 
            'wrapCode': ' 123', 
            'start': '02/24/2015 14:59', 
            'end': '02/24/2015 14:59', 
            'duration': 30,
            'department': 'default', 
            'location': 'testloc', 
            'media_expired': false, 
            'comments': [
                {   
                    'id': 123, 'seconds': 45, 'text': 'comment',  'user': 'commenter'
                },
                {
                    'id': 124,
                    'seconds': 30, 'text': 'comment again',  'user': "commenter''s wife"
                } 
            ]
        }
    ])
}

const zeroPad = (value) => {
    if ( value >= 10 ){
        return value
    }
    
    return '0' + value
}

let port = 9000
let expHost = '127.0.0.1'
let expBasePath = '/' 
let expSecurityToken = 'aaa'
let expRecordingList = recList_Mock()
let expRecordingCookie = 'recording-cookie'
let expMediaId = 1
let expMediaLink = 'test_file.txt'
let current = Date.now()
let startDate = new Date(current - 1000*60*60)
let endDate = new Date(current)
let startDateString = startDate.getUTCFullYear() + '-' + zeroPad(startDate.getUTCMonth())  + '-' + zeroPad(startDate.getUTCDate())
let endDateString = endDate.getUTCFullYear() + '-' + zeroPad(endDate.getUTCMonth()) + '-' + zeroPad(endDate.getUTCDate())
let startTimeString = zeroPad(startDate.getUTCHours()) + ':' + zeroPad(startDate.getUTCMinutes()) + ':' + zeroPad(startDate.getUTCSeconds())
let endTimeString = zeroPad(endDate.getUTCHours()) + ':' + zeroPad(endDate.getUTCMinutes()) + ':' + zeroPad(endDate.getUTCSeconds())
let expParameters = { dateStart : startDateString, dateEnd : endDateString }

test('create recording list options', (t) => {
    
    //1a. Success
    let client = new RestRecordingsClient(expHost, expSecurityToken, expBasePath)
    
    let expStartDateString = startDateString
    let expEndDateString = endDateString
    let expStartTimeString = startTimeString
    let expEndTimeString = endTimeString
    let expPage = 0
    let expPageSize = 100
    
    let expPath = expBasePath + 'recordings?dateStart=' + expStartDateString + '&dateEnd=' + expEndDateString + '&timeStart=' + expStartTimeString + '&timeEnd=' + expEndTimeString + '&page=' + expPage + '&pageSize=' + expPageSize  
    let expHeaderAccept = '*/*'
    let expHeaderCookie = 'WARDEN_SSO_AUTHORIZATION=' + expSecurityToken
    let expContentType = 'text/plain; charset=utf-8'
    
    let options = client.getRecordingListOptions(expStartDateString, expEndDateString, expStartTimeString, expEndTimeString, expPage, expPageSize)
    
    t.equals(options.host, expHost)
    t.equals(options.path, expPath)
    t.equals(options.headers.accept, expHeaderAccept)
    t.equals(options.headers.cookie, expHeaderCookie)
    t.equals(options.headers['content-type'], expContentType)
    
    
    //1.b Error -invalid dates
    
    try {
        options = client.getRecordingListOptions(undefined, undefined, expStartTimeString, expEndTimeString, expPage, expPageSize)
        t.fail('undefined dates should not be considered')
    } catch(err) {
        t.pass(err)
    }
    
    try {
        options = client.getRecordingListOptions('01-01-2017', '02-01-2017', expStartTimeString, expEndTimeString, expPage, expPageSize)
        t.fail('incorrect formatted dates should not be considered')
    } catch(err) {
        t.pass(err)
    }
    
    try {
        options = client.getRecordingListOptions('1-1-17', '2-1-17', expStartTimeString, expEndTimeString, expPage, expPageSize)
        t.fail('incorrect formatted dates should not be considered')
    } catch(err) {
        t.pass(err)
    }
    
    try {
        options = client.getRecordingListOptions(expStartDateString, expEndDateString, undefined, undefined, expPage, expPageSize)
        t.fail('undefined times should not be considered')
    } catch(err) {
        t.pass(err)
    }
    
    try {
        options = client.getRecordingListOptions(expStartDateString, expEndDateString, '1:1:1', '2:1:1', expPage, expPageSize)
        t.fail('incorrect formatted times should not be considered')
    } catch(err) {
        t.pass(err)
    }
    
    try {
        options = client.getRecordingListOptions(expStartDateString, expEndDateString, expStartTimeString, expEndTimeString, 'a', 'b')
        t.fail('letter page/pageSize should not be considered')
    } catch(err) {
        t.pass(err)
    }
    
    try {
        options = client.getRecordingListOptions(expStartDateString, expEndDateString, expStartTimeString, expEndTimeString, -1, -1000)
        t.fail('negative values should not be considered')
    } catch(err) {
        t.pass(err)
    }
    
    t.end()
})

test('create media link options', (t) => {
    
    //1a. Success
    let client = new RestRecordingsClient(expHost, expSecurityToken, expBasePath)
    
    let expMediaLinkID = 1
    let expPath = expBasePath + 'media/' + expMediaLinkID
    let expHeaderAccept = '*/*'
    let expHeaderCookie = 'WARDEN_SSO_AUTHORIZATION=' + expSecurityToken
    let expContentType = 'text/plain; charset=utf-8'
    
    let options = client.getMediaLinkOptions(expMediaLinkID)
    t.equals(options.host, expHost)
    t.equals(options.path, expPath)
    t.equals(options.headers.accept, expHeaderAccept)
    t.equals(options.headers.cookie, expHeaderCookie)
    t.equals(options.headers['content-type'], expContentType)
    
    //1b. Error
    try{
        options = client.getMediaLinkOptions(undefined)
        t.fail('undefined parameter should not be considered')
    } catch(err) {
        t.pass(err)
    }
    
    t.end()
})

test('get call recordings list', (t) => {

    t.plan(6) // count with validation on server

    start(port, t, expRecordingList, expParameters, expMediaId, expRecordingCookie, expMediaLink, () => {
        let client = new RestRecordingsClient(expHost, expSecurityToken, expBasePath) 
        
        let options = client.getRecordingListOptions(startDateString, endDateString, startTimeString, endTimeString)
        options.port = port
        
        client.getRecordingsList(options, http).then((result) => {
            t.equals(result.cookie[0], expRecordingCookie) //result is an array probably because server implementation
            t.deepEquals(result.list, JSON.parse(expRecordingList))
            
            stop()
            
        }).catch((err) => {            
            t.fail(err)

            stop()
        })
        
    }, expBasePath)
})

test('get empty call recordings list', (t) => {
  t.plan(5);

  start(port, t, "", expParameters, expMediaId, expRecordingCookie, expMediaLink, () => {
    let client = new RestRecordingsClient(expHost, expSecurityToken, expBasePath) 
    
    let options = client.getRecordingListOptions(startDateString, endDateString, startTimeString, endTimeString)
    options.port = port
    
    client.getRecordingsList(options, http).then((result) => {
        t.fail('Should fail when no result available');

        stop();
        
    }).catch((err) => {            
        t.ok('OK, failed with an exception');

        stop();
    });
    
  }, expBasePath);
});


test('get call recording list with no recording cookie', (t) => {

    t.plan(5)

    start(port, t, expRecordingList, expParameters, expMediaId, undefined, expMediaLink, () => {
        let client = new RestRecordingsClient(expHost, expSecurityToken, expBasePath)
        
        let options = client.getRecordingListOptions(startDateString, endDateString, startTimeString, endTimeString)
        options.port = port
        
        client.getRecordingsList(options, http).then((result) => {
            t.fail('Should not receive result when recording cookie is not valid')

            stop()
            
        }).catch((err) => {
            t.pass(err)

            stop()
        })
        
    }, expBasePath)
})

test('get recording media link', (t) => {

    t.plan(2)

    let expMediaId = 1
    let expMediaLink = 'test_link'
    
    start(port, t, expRecordingList, expParameters, expMediaId, expRecordingCookie, expMediaLink, () => {
        let client = new RestRecordingsClient(expHost, expSecurityToken, expBasePath)
        
        let options = client.getMediaLinkOptions(expMediaId)
        options.port = port
        
        client.getRecordingMediaLink(options, http).then( (result) => {
            t.equals(expMediaLink, result)

            stop()
        }).catch((err) => {
            t.fail(err)

            stop()
        })
        
    }, expBasePath)
})

test('get recording file from server', (t) => {
    
    t.plan(1)

    start(port, t, expRecordingList, expParameters, expMediaId, expRecordingCookie, expMediaLink, () => {
        let client = new RestRecordingsClient(expHost, expSecurityToken, expBasePath)
        
        let url = 'http://localhost:' + port + expBasePath + expMediaLink

        client.download(url, http, (res) => {
            let response = ''
            
            res.on('data', (data) => {
                console.log('receiving data ' + data)
                response += data
            })
            
            res.on('end', () => {
                t.equals(response, 'Call Recording test')
                
                stop()
            })
        }, (err) => {
            t.fail(err)
            
            stop()
        })
        
    }, expBasePath)
    
})


test('get recording file from server with no recording link', (t) => {

    t.plan(1)

    start(port, t, expRecordingList, expParameters, expMediaId, expRecordingCookie, expMediaLink, () => {
        let client = new RestRecordingsClient(expHost, expSecurityToken, expBasePath)
        
        let url = 'http://localhost:' + port + expBasePath + expMediaLink

        client.download(undefined, http, (res) => {
            t.fail('Should not be able to download with undefined download link')

            stop()
        }, (err) => {
            t.pass(err)

            stop()
        })
        
    }, expBasePath)
    
}) 
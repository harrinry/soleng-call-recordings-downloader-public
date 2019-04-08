'use strict'

const express = require('express')

const { defaultPage, defaultPageSize} = require('../lib/RecordingClient')
const path = require('path')

let server

const start = (port, t, getRecordingList, getRecordingListParameters, mediaId, recordingCookie, link, callback, basePath = '/') => {
    
    let app = express()

    let getRecordingsListUrl = basePath + 'recordings'
    let mediaIdUrl = basePath + 'media/:resultid'
    let fileNameUrl = basePath + link

    app.get(getRecordingsListUrl, (req, res) => {
        t.equals(req.query.dateStart, getRecordingListParameters.dateStart)
        t.equals(req.query.dateEnd, getRecordingListParameters.dateEnd)
        t.equals(Number(req.query.page) , defaultPage)
        t.equals(Number(req.query.pageSize), defaultPageSize)

        if (recordingCookie){
            res.setHeader('Set-Cookie', recordingCookie)
        }
        
        res.send(getRecordingList)
    })
    
    app.get(mediaIdUrl, (req, res) => {
        t.equals(Number(req.params.resultid), mediaId)

        res.redirect(307, link)
    })
    
    app.get(fileNameUrl, (req, res) => {
        res.sendFile(path.join(path.dirname(__filename), link))
    })
    
    server = app.listen(port, () => {
        console.log('Listening on port ' + port)
        callback()
    })
}

const stop = () => {
    if(server){
        console.log('Shutting server down...')
        server.close()
    }
}

module.exports = {
    start : start,
    stop : stop
}
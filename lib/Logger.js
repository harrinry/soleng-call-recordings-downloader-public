'use strict'

const winston = require('winston')
const path = require('path')

const CALL_RECORDING_DOWNLOADER_LOGFILE = 'call_recording_downloader.log'

let logger

function setup (outputFolder) {
    
    try {
        let file = path.join(outputFolder, CALL_RECORDING_DOWNLOADER_LOGFILE)
        logger = new winston.Logger({
            level: 'info',
            transports: [
                new (winston.transports.Console)({
                    json : false
                }),
                new (winston.transports.File)({ 
                    filename: file,
                    maxsize : 1024*(1024),
                    maxFiles : 1,
                    json : false,
                    tailable : true 
                })
            ]
        });
    } catch(err){
        throw err
    }
    
}

function getLogger(outputFolder) {

    try {
        if(!logger) {
            setup(outputFolder)
        }
    } catch(err) {
        throw err
    }
        
    return logger
}

module.exports = {
    getLogger : getLogger
}

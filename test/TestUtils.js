exports.TestUtils = class TestUtils {

    /** Helper methods  */
    static createGetRecordingsList_stub(result) {
        return function(startDate, endDate, startTime, endTime) {
            return new Promise((resolve, reject) => { resolve( result )})
        }
    }
    
    static createMediaLink_stub(result) {
        return function(client, id) {
            return new Promise((resolve, reject) => { resolve( result )})
        }
    }
    
    static createDownloadRecording_stub(result) {
        return function(client, link) {
            return new Promise((resolve, reject) => { resolve( result )})
        }
    }
    
    static createSaveToDisk_stub(result) {
        return function(response, id, outputFolder) {
            return new Promise((resolve, reject) => { resolve( result )})
        }
    }
    
    static createSaveMetadata_stub(result) {
        return function(result, outputFolder) {
            return new Promise((resolve, reject) => { resolve( result )})
        }
    }
}

'use strict'

exports.CallRecordingsPageDownloader = class CallRecordingsPageDownloader {
  constructor(logger, client, save, processedResultStore) {
    this._logger = logger;
    this._client = client;
    this._save = save;
    this._processedResultsStore = processedResultStore;
  }

  async _downloadRecording(methods, result) {
    let existsAudioFile = await methods._save.checkExistsAudioFile(result.id);
    let existsMetadataFile = await methods._save.checkExistsMetadataFile(result.id);
    let success;

    try {
      if (existsAudioFile) {
        methods._logger.info(`Skipping download of Record ID #${result.id}: already exists!`);
  
        if (!existsMetadataFile) await methods._save.saveMetadataFile(result);
      } else {
        let link = await methods._client.getSecuredRecordingMediaLink(result.id);
        let recording = await methods._client.secureDownloadRecording(link);
  
        if (existsMetadataFile) await methods._save.deleteMetadataFile(result.id);
        await methods._save.save(result, recording);
  
        methods._logger.info(`Record ID #${result.id} downloaded`);
      }

      success = true;
    } catch (e) {
      methods._logger.error(`Record ID #${result.id} not downloaded due to ${e}`);

      success = false;
    }

    return success;
  }

  async download(startDate, endDate, startTime, endTime, page) { 
    let results = [];
    let promises = [];
    
    try {
      let recordingList = await this._client.getSecuredRecordingsList(startDate, endDate, startTime, endTime, page);

      for (let r = 0; r < recordingList.list.pageResults.length ; r++) {
        let result = recordingList.list.pageResults[r];
        
        if(result.destination && result.destination.length > 0 && result.destination[0] === '*') {
            continue;
        } else {
          let methods = {};
          methods._save = this._save;
          methods._logger = this._logger; 
          methods._client = this._client;
          
          this._logger.info(`Downloading Record ID #${result.id}`);

          promises.push(this._downloadRecording(methods, result)); 
        } 
      }

      results = await Promise.all(promises);

    } catch(err) {
        this._logger.error(`Error saving page ${page} ${err}`);
    }

    return results;
  }
}
'use strict'


const auth = require('soleng-warden-client');

const { RestRecordingsClient } = require('./RecordingClient');
const { CallRecordingFileWriter } = require('./CallRecordingFileWriter');
const { CallRecordingsDownloader } = require('./CallRecordingsDownloader');
const { CallRecordingsPageDownloader } = require('./CallRecordingsPageDownloader');
const { ProcessedResultsStore } = require('./ProcessedResultsStore');
const { getLogger } = require('./Logger');

exports.CallRecordingsDownloaderManager = class CallRecordingsDownloaderManager {
  constructor() {}
  
  static async createCallRecordingsDownloader(options) {
    try {
      let logger = getLogger(options.outputFolder);
      let authResponse = await auth.getWardenSecurityToken(options.username, options.password, '', options.auth.wardenServer, options.auth.wardenPort, options.auth.appToken);
      
      let restClient = new RestRecordingsClient(options.recSettings.recordingServer, authResponse.securityToken, options.recSettings.basePath, logger);
      let saver = new CallRecordingFileWriter(options.outputFolder);
      let processedResultsStore = new ProcessedResultsStore();
      let pageDownloader = new CallRecordingsPageDownloader(logger, restClient, saver, processedResultsStore);
      let downloader = new CallRecordingsDownloader(restClient, logger, pageDownloader);

      return downloader;
    } catch(e) {
        throw new Error(`Failed creating a call recording downloader ${e}`);
    }
  }
}
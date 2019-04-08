'use strict'

const { defaultPageSize } = require('./RecordingClient');
const moment = require('moment');

exports.CallRecordingsDownloader = class CallRecordingsDownloader {
  constructor(client, logger, pageDownloader){
    if(!client) throw new Error('No client to use')
    if(!logger) throw new Error('No logging feature defined')
    if(!pageDownloader) throw new Error('No pageDownloader defined')
                
    this._logger = logger
    this._client = client
    this._pageDownloader = pageDownloader
  }
  
  _numberOfPages(results, pageSize) {
    if (!results || !results.list || !results.list.total) {
      this._logger.info('No call recordings to download.');
      return 0;
    }
        
    try {
      let division = results.list.total/pageSize
      return (results.list.total % pageSize) > 0 ? Math.floor(division) + 1 : division
    } catch(err) {
      throw err
    }
  }
  
  async download(startDate, endDate, startTime, endTime) {
    this._logger.info(`Downloading call recordings between ${startDate} ${startTime} (UTC) and  ${endDate} ${endTime} (UTC)`)
    
    let numberOfPages = 0;
    let all = [];
    // let promises = [];

    try {
      let list = await this._client.getSecuredRecordingsList(startDate, endDate, startTime, endTime);
      numberOfPages = this._numberOfPages(list, defaultPageSize);
      
      for( let page = 0; page < numberOfPages; page++ ) {
        this._logger.info(`Processing page ${page + 1}/${numberOfPages}`);
        const results = await this._pageDownloader.download(startDate, endDate, startTime, endTime, page);
        all = all.concat(results);
      }

    } catch(err) {
      throw err
    }

    return all;
  }

  downloadRecordingsSinceTheBegginingOfLastDay() {
    const now = moment();
    const startDate = now.utc();
    const endDate = startDate.clone();
    const startTime = '00:00:00';
    const endTime = '23:59:59';
    startDate.add(-1, 'days');

    return this.download(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), startTime, endTime);
  }

  downloadRecordingsBetweenTwoDatesTimes(startDate, endDate, startTime, endTime) {
    const start = moment(startDate).utc();
    const end = moment(endDate).utc();

    return this.download(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'), startTime, endTime);
  }
}
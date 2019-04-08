# Call Recordings Downloader Tool


## Introduction
This tool enables Fuzers to download a set of call recordings (and the associated metadata) between a temporal period, to their computer filesystem.

__Note__: API was designed to enable querying for recordings between predefined intervals of time. That way, date and time parameters are not bound - this essentially means that the time of the recording is associated to the current day of search and not the entire period of query.

### __DOWNLOAD__

To download call recordings please execute the application using the following syntax:

```./cli.exe download [username] [password] [start-date] [end-date] [start-time] [end-time] [output-folder] ```

Parameters are: 

* username: Fuze username
* password: Fuze password
* start-date: Start day (format, YYYY-MM-DD, where YYYY - year, MM - month and DD - day of the month. e.g. 2019-03-12)
* end-date: End day
* start-time: Start time (format, HH:MM:SS, where HH - Hour of the day , MM: Minute, SS: Second. e.g. 10:53:00)
* end-time : End time ( format HH:MM:SS, where HH -Hour of the day, MM: Minute, SS: Second e.g. 10:54:00)
* output-folder: path to the folder on the user filesystem where all call recordings and metadata files will be stored


## Development
If you want to develop your custom solution using this tool as the base, you need to create a file named 'config.json' under the lib folder with this structure:

```
{
    "authentication-settings" : {
        "wardenServer" : "warden.thinkingphones.com",
        "wardenPort" : "443",
        "appToken" : <app-token>
    },
    "call-recording-settings" : {
        "recordingServer": "ws.thinkingphones.com",
        "basePath": "/services/callrec/",
        "recordingServerPort": "443"
    }
}
```

This file contains two sections: 1) authentication-settings and 2) call-recordings-settings. The first section describes the warden configuration needed to run the tool ( You need to request an app-token from your Fuze representative first! ) and the second one contains the configurations of the Call Recordings API that the tool is using.


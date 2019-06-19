# Call Recordings Downloader Tool

## Introduction
This tool enables Fuzers to download a set of call recordings (and the associated metadata) to their computer filesystem. The tools works on 2 modes - download and update. 
The download mode enables users to download a set of call recordings beloging to a date interval.
The update mode enables users to pull recordings from the back-end using the configured interval parameter.

__Note__: API was designed to enable querying for recordings between predefined intervals of time. That way, date and time parameters are not bound - this essentially means that the time of the recording is associated to the current day of search and not the entire period of query.

## Installation
Users should download the version for their platform. There is a link at the top of this page called 'Release' where all executables are stored, grouped by it's version.

 Currently there are 3 versions available: windows (cli-win.exe),mac (cli-macos) and linux (cli-linux). There is no installation procedure, so users are free to save the file to the desired file system path.
In order to run it on UNIX systems ( Linux / MacOS ), execute permissions must be given to this file. To do this, please open a command line window ( Terminal  app on MacOS, bash/shell on Linux ) and run ```chmod +x [file-name]``` ( file name being the name of the downloaded file).


### __DOWNLOAD__

To download call recordings between two dates, please execute the application using the following syntax:

```./cli-macos download [username] [password] [start-date] [end-date] [start-time] [end-time] [output-folder] ```

Parameters are: 

* username: Fuze username
* password: Fuze password
* start-date: Start day (format, YYYY-MM-DD, where YYYY - year, MM - month and DD - day of the month. e.g. 2019-03-12)
* end-date: End day
* start-time: Start time (format, HH:MM:SS, where HH - Hour of the day , MM: Minute, SS: Second. e.g. 10:53:00)
* end-time : End time ( format HH:MM:SS, where HH -Hour of the day, MM: Minute, SS: Second e.g. 10:54:00)
* output-folder: path to the folder on the user filesystem where all call recordings and metadata files will be stored

__Note__: For the windows version ( cli-win.exe ), make sure to run the app without the beggining '.'. e.g.:

```cli-win.exe download [username] [password] [start-date] [end-date] [start-time] [end-time] [output-folder] ```

### __UPDATE___

To run the application on update mode ( application will check for new call recordings on a pre-specified interval), please use the following syntax:

```./cli-macos update [username] [password] [update-timeout] [output-folder]```

Parameters are:

* username: Fuze username
* password: Fuze password
* update-timeout: frequency ( in seconds ) of the update
* output-folder: path to the folder on the user filesystem where all call recordings and metadata files will be stored

__Note__: For the windows version ( cli-win.exe ), make sure to run the app without the beggining '.'. e.g.:

```cli-win.exe update [username] [password] [update-timeout] [output-folder]```

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


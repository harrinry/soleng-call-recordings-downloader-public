#!/usr/bin/env node

const { CallRecordingsDownloaderManager  } = require('./lib/CallRecordingsDownloaderManager');

const cjson = require('./lib/config.json');
const pjson = require('./package.json');
const fs = require("fs");

require("yargs")
  .usage("Usage: $0 <cmd> [args]")
  .command(
    "download <username> <password> <startDate> <endDate> <startTime> <endTime> <outputFolder>",
    "Bulk download of Call Recordings",
    yargs => {
      yargs.positional("username", {
        type: "string",
        describe: "Fuze username"
      });

      yargs.positional("password", {
        type: "string",
        describe: "Fuze password"
      });

      yargs.positional("startDate", {
        type: "string",
        describe:
          "Start Date in format YYYY-MM-DD (UTC)"
      });

      yargs.positional("endDate", {
        type: "string",
        describe:
          "End Date in format YYYY-MM-DD (UTC)"
      });

      yargs.positional("startTime", {
        type: "string",
        describe:
          "Start time in format HH:mm:ss"
      });

      yargs.positional("endTime", {
        type: "string",
        describe:
          "End time in format HH:mm:ss"
      });

      yargs.positional("outputFolder", {
        type: "string",
        describe:
          "Folder where call recordigs will be stored"
      });
    },
    async function(argv) {
        if (!fs.existsSync(argv.outputFolder)) {
          fs.mkdirSync(argv.outputFolder);
        }

        console.log(`Call Recordings Downloader V${pjson.version}`);

        try {
          
          const downloader = await CallRecordingsDownloaderManager.createCallRecordingsDownloader(
          {
              outputFolder: argv.outputFolder,
              username: argv.username,
              password: argv.password,
              auth: {
                wardenServer: cjson['authentication-settings'].wardenServer,
                wardenPort: cjson['authentication-settings'].wardenPort,
                appToken: cjson['authentication-settings'].appToken,
              },
              recSettings: {
                recordingServer: cjson['call-recording-settings'].recordingServer,
                basePath: cjson['call-recording-settings'].basePath
              },
          });

          await downloader.downloadRecordingsBetweenTwoDatesTimes(argv.startDate, argv.endDate, argv.startTime, argv.endTime);
          
          console.log('Done.');

        } catch (e) {
          console.log(e);
          console.error('Download terminated with errors!')
        }
    })

    .command(
      "update <username> <password> <updateTimeout> <outputFolder>",
      "Update filesystem with recordings from the last 24 hours",
      yargs => {
        yargs.positional("username", {
          type: "string",
          describe: "Fuze username"
        });
  
        yargs.positional("password", {
          type: "string",
          describe: "Fuze password"
        });

        yargs.positional("updateTimeout", {
          type: "string",
          describe: "Timeout value (in secs) that the describe the frequency of when the recordings are downloaded",
        });
  
        yargs.positional("outputFolder", {
          type: "string",
          describe:
            "Folder where call recordigs will be stored"
        });
      },
      async function(argv) {
          if (!fs.existsSync(argv.outputFolder)) {
            fs.mkdirSync(argv.outputFolder);
          }
  
          console.log(`Call Recordings Downloader V${pjson.version}`);
  
          try {
            
            const downloader = await CallRecordingsDownloaderManager.createCallRecordingsDownloader(
            {
                outputFolder: argv.outputFolder,
                username: argv.username,
                password: argv.password,
                auth: {
                  wardenServer: cjson['authentication-settings'].wardenServer,
                  wardenPort: cjson['authentication-settings'].wardenPort,
                  appToken: cjson['authentication-settings'].appToken,
                },
                recSettings: {
                  recordingServer: cjson['call-recording-settings'].recordingServer,
                  basePath: cjson['call-recording-settings'].basePath
                },
            });
  
            const download = async function downloadResults() {
              console.log(`Downloading recordings...`);

              try {
                await downloader.downloadRecordingsSinceTheBegginingOfLastDay();
              } catch (e) { 
                console.log(e);
              } finally {
                setTimeout(download, Number(argv.updateTimeout) * 1000);
              }
            }
          
            download();

          } catch (e) {
            console.log(e);
            console.error('Download terminated with errors!')
          }
      })
  .help().argv;

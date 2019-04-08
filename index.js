'use strict';

require('electron-debug')();

const path = require('path')
const fs = require('fs')
const crypto = require('./lib/CryptoUtils').CryptoUtils
const { app, BrowserWindow, Tray, Menu, ipcMain, shell, dialog, nativeImage } = require('electron');
const { CallRecordingsDownloaderManager } = require('./lib/CallRecordingsDownloaderManager')
const cjson = require('./lib/config.json')
const moment = require('moment');
const pjson = require('./package.json');

const CONFIG_FILE_NAME = 'RecordingDownloaderConfig.json'

let tray = null
let contextMenu
let decryptedPass
let configFile
let downloader

const openFolder = () => {
	let outputFolder = configFile.outputFolder
	
	fs.exists(outputFolder, (exist) => {
		if(exist){
			fs.readdir(outputFolder, (err, files) => {
				if(files.length > 0){
					shell.showItemInFolder(path.join(outputFolder, files[0]))
				}
			})		
		} 
	})
}

async function createTray(){
	tray = new Tray( path.join(__dirname, 'images', 'icon_18_18.png'))
	
	contextMenu = Menu.buildFromTemplate([
		{ label: 'Open Folder', type: 'normal',  click : openFolder },
		{ label: 'Quit', type: 'normal', click : app.quit },
	])
	
	tray.setToolTip('Call Recordings Downloader')
	tray.setContextMenu(contextMenu)
	
	return true
}

ipcMain.on('save-config', (event, arg) => {
	
	let username = arg.username
	let password = arg.password
	let outputFolder = arg.outputFolder
	let updateTimeout = arg.updateTimeout
	
	let userData = app.getPath('userData')
	
	crypto.encrypt(password, (err, encrypted) => {
		console.log(err)
		console.log(encrypted)
		if (!err) {
			let object = {
				username : username,
				password : encrypted,
				outputFolder : outputFolder,
				updateTimeout : updateTimeout 
			}
			
			let fileName = path.join(userData, CONFIG_FILE_NAME)
			
			fs.writeFile(fileName, JSON.stringify(object), (err) => {
				app.relaunch()
				app.quit()
			})
		}
	})
})

ipcMain.on('save-config-error', (event, arg) => {
	let msg = 'The following arguments are invalid : '
	
	for(let a of arg) {
		msg += a + ', '
	}
	
	dialog.showErrorBox('Some fields are invalid', 	msg.slice(0, msg.length-2))
})

ipcMain.on('close-conf-window', (event, arg) => {
	app.quit()
})

app.on('ready', () => {
	let mainWindow = new BrowserWindow( {
		show: false
	})
	
	let configFolder = app.getPath('userData')
	let configFilePath = path.join(configFolder, CONFIG_FILE_NAME)

	fs.exists(configFilePath, async (exists) => {
		if(!exists) {
			let configWindow = new BrowserWindow( 
				{
					width : 600,
					height : 250, 
					center : true,
					resizable : false,
					minimizable : false,
					maximizable : false, 
					closable : true,
					title : 'Initial Configuration'
				}
			)
			
			configWindow.loadURL(`file://${__dirname}/html/config.html`)
		} else {
			
			try {
				configFile = require(configFilePath)
			} catch (err) {
				displayConfigurationFileNotFound(configFilePath, mainWindow)
			}
			
			crypto.decrypt(configFile['password'], async (err, decrypted) => {
				if (err) {
					displayErrorMessageBox(err)
				} else {
				  decryptedPass = decrypted;
				  
				  try {
					console.log('Call Recordings Downloader V' + pjson.version);

				    downloader = await CallRecordingsDownloaderManager
					  .createCallRecordingsDownloader(getOptionsForDownloader(configFile, decryptedPass, cjson));
					
					await createTray();

				    startDownload();
				  } catch (e) {
					console.log(e);
				    displayErrorMessageBox(err)
				  }
				}
			})
		}
	})
});

function getOptionsForDownloader(configFile, decryptedPass, cjson) {
	return {
		username : configFile['username'],
		outputFolder : configFile['outputFolder'], 
		password : decryptedPass,
		auth : cjson['authentication-settings'], 
		recSettings : cjson['call-recording-settings']
	}
}

function displayConfigurationFileNotFound(configFilePath, mainWindow) {
	let result = dialog.showMessageBox(mainWindow,
		{
			type: 'warning',
			title : 'File not found',
			message : `Configuration File '${configFilePath}' not found`,
			buttons : ['OK'],
			icon: nativeImage.createFromPath( path.join(__dirname, 'images', 'icon_128_128.png') )
		} 
	)
	
	if ( result === 0 ) {
		app.quit()
	}
}

function displayErrorMessageBox(err) {
	let result = dialog.showMessageBox(
		{
			type : 'error',
			title : 'Call Recordings Download Failed',
			message : `Call Recordings Download failed with message : ${err}`,
			detail :  err.message,
			buttons : ['OK'],
			icon: nativeImage.createFromPath( path.join(__dirname, 'images', 'icon_128_128.png'))
		},
	)
	
	if ( result === 0) {
		app.quit()
	}
}

const startDownload = async () => {
  try {
	await downloader.downloadRecordingsSinceTheBegginingOfLastDay();
  } catch (e) {
    console.log(e);
  } finally {
	setTimeout(startDownload, configFile['updateTimeout'])
  }
}

if ('dock' in app) app.dock.hide()
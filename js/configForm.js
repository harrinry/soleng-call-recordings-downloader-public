'use strict'

const fs = require('fs')

const { ipcRenderer } = require('electron')

document.getElementById('configFormSubmitButton').onclick = ()  => {
    //TODO: Implement some validation..
    let username = document.getElementById('configFormUsername').value
    let password = document.getElementById('configFormPassword').value
    let outputFolder = document.getElementById('configFormOutputFolder').value

    validateArgs(username, password, outputFolder)
    .then((args) => {
        if(args.length > 0) {
            ipcRenderer.send('save-config-error', args)
        } else {
            let configuration = {
                username : username,
                password : password,
                outputFolder : outputFolder,
                updateTimeout : 60000
            }
            
            ipcRenderer.send('save-config', configuration)
        }
    })
}

document.getElementById('configFormCloseButton').onclick = () => {
    ipcRenderer.send('close-conf-window', 'close')
}

const validateArgs = (username, password, outputFolder) => {
    return new Promise((resolve) => {
        let failedArguments = []
        
        if (!username) {
            failedArguments.push('username')
        }
        
        if(!password) {
            failedArguments.push('password')
        }
        
        if(!outputFolder) {
            failedArguments.push('outputFolder')
            resolve(failedArguments)
        } else {
            fs.exists(outputFolder, (exist) => {
                if(!exist){
                    failedArguments.push('outputFolder')
                }

                resolve(failedArguments)
            })
        }
    })
}
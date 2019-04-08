'use strict'
const crypto = require('crypto')
const PASSWORD = 'p/L2tYqkUjw'

exports.CryptoUtils = class CryptoUtils {

    static encrypt(value, callback, password = PASSWORD) {
        if(!value) {
            callback(new Error('Value to encrypt not provided.'))
        } else {
            let encrypted = ''
            const cipher = crypto.createCipher('aes256', password)
            
            cipher.on('readable', () => {
                const data = cipher.read()
                
                if(data) {
                    encrypted += data.toString('hex')
                }
            })
            
            cipher.on('end',() => {
                callback(undefined, encrypted)
            })

            cipher.write(value)
            cipher.end()
        }
    }
    
    static decrypt(value, callback, password = PASSWORD) {
        if (!value) {
            callback(new Error('Value to decrypt not provided.'))
        } else {
            let decrypted = ''
            const decipher = crypto.createDecipher('aes256', password);

            decipher.on('readable', () => {
                const data = decipher.read();
                if (data) {
                    decrypted += data.toString('utf8');
                }
            });

            decipher.on('end', () => {
                callback(undefined, decrypted);
            });

            decipher.write(value, 'hex')
            decipher.end()
        }
    }
    
}
'use strict'

const test = require('tape')
const CryptoUtils = require('../lib/CryptoUtils').CryptoUtils

let expCipherPassword = 'Think123!'

test('password should be encrypted', (t) => {
    
    t.plan(3)
    
    //1. Validate input on encryption
    CryptoUtils.encrypt(undefined, (err, result) => {
        if (err){
            t.pass(err)       
        } else {
            t.fail('undefined password should not be encrypted')
        }
    })
    
    CryptoUtils.encrypt("", (err, result) => {
        if (err) {
            t.pass(err)
        } else {
            t.fail('empty pass should not be encrypted')
        }
    })
    
    //Enc/Dec one value
    let expPassword = 'password123!'
    let expEncryptedPass = 'f7cee65d0c9a6177222e15e396e6b628'
    
    CryptoUtils.encrypt(expPassword, (err, encrypted) => {
        if (err) {
            t.fail(err)
        } else {
            t.equals(encrypted, expEncryptedPass)
        }
    }, expCipherPassword)
    
})

test('password should be decrypted', (t) => {

    t.plan(3)
    
    let expPassword = 'password123!'
    let encryptedPass = 'f7cee65d0c9a6177222e15e396e6b628'
    
    //2. Validate input on decryption
    CryptoUtils.decrypt(undefined, (err, result) => {
        if(err) {
            t.pass(err)
        } else {
            t.fail('undefined pass should not be decrypted')
        }
    })
    
    CryptoUtils.decrypt("", (err, result) => {
        if(err) {
            t.pass(err)
        } else {
            t.fail('empty pass should not be decrypted')
        }
    })
    
    CryptoUtils.decrypt(encryptedPass, (err, decrypted) => {
        if (err) {
            t.fail(err)
        } else {
            t.equals(decrypted, expPassword)
        }        
    }, expCipherPassword) 

})    
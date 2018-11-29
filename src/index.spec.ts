import { NemoParser } from './index'
import { JSDOM } from 'jsdom'
import { readFileSync, statSync } from 'fs'
import { basename } from 'path'
import { expect } from 'chai'

describe('Loading logfile test',()=>{
    
    it('check functionality test',()=>{
        const jsdom = new JSDOM("<!doctype html><html><body><input type='file' id='fileinput' /></body></html>")
        const {window} = jsdom
        
        const filePath = './server-test/logfiles/scanner.nmf'
        //const { mtimeMs: lastModified, size } = statSync(filePath)
        //const file = new File([''],basename(filePath),)
        const file = new window.File([readFileSync(filePath)],basename(filePath))
        console.log(file)
        //console.log(fileBlob)
        
        const testClass = new NemoParser();
        //expect(testClass.testing()).to.equal(1);
    })
})
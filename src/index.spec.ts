import { NemoParser, LogfileBuffer } from './index'
import { JSDOM } from 'jsdom'
import { readFileSync, readdirSync,writeFileSync, write } from 'fs'
import { basename } from 'path'
import { expect } from 'chai'
import { Parser as Json2csvParser } from 'json2csv'

describe('FILE PARSING TEST',() => {
    it('LOAD TDD SCANNER FILE',()=>{
        const directory = './server-test/bulk_loading';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
            testClass.displayGrid(['LTE_TDD_SCANNER_MEASUREMENT'],{fileBuffer:bufferArray}).subscribe((result)=>{
                //console.log(result)
                for(let i of Object.keys(result)){
                    expect(result[i]['SCANNER_RSRP']).to.be.an('array').lengthOf.gt(0)
                    expect(result[i]['SCANNER_CINR']).to.be.an('array').lengthOf.gt(0)
                    expect(result[i]['SCANNER_RSRQ']).to.be.an('array').lengthOf.gt(0)
                    
                    //checking CH
                    //let RSRP_CH = result[i]['SCANNER_RSRP'].map(entry => entry.CH)
                    //expect(RSRP_CH).to.not.includes.arguments.undefined
                    //let CINR_CH = result[i]['SCANNER_CINR'].map(entry => entry.CH)
                    //expect(CINR_CH).to.not.includes.arguments.undefined
                    //let RSRQ_CH = result[i]['SCANNER_RSRQ'].map(entry => entry.CH)
                    //expect(RSRQ_CH).to.not.includes.arguments.undefined
                }
            })
    })
})

describe('FUNCTIONALITY TEST',()=>{
    
    it('LTE_FDD_SCANNER_MEASUREMENT TEST',()=>{
        //const jsdom = new JSDOM("<!doctype html><html><body><input type='file' id='fileinput' /></body></html>")
        const filePath = './server-test/logfiles/scanner.nmf'
        const fileBuffer = readFileSync(filePath,{encoding:'utf-8'})
        const fileName = basename(filePath)
        const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,fileName)
        
        const testClass = new NemoParser();
        testClass.displayGrid(['LTE_FDD_SCANNER_MEASUREMENT'],{fileBuffer:[logfileBuffer]}).subscribe((result)=>{
            
            for(let i of Object.keys(result)){
                expect(result[i]['SCANNER_RSRP']).to.be.an('array').have.lengthOf(3282)
                let RSRP_AVG = result[i]['SCANNER_RSRP'].reduce((total,current) => {return total + current.RSRP},0) / result[i]['SCANNER_RSRP'].length
                expect(parseFloat(RSRP_AVG.toFixed(5))).to.eql(-63.16795)
                
                expect(result[i]['SCANNER_CINR']).to.be.an('array').have.lengthOf(3282)
                let CINR_AVG = result[i]['SCANNER_CINR'].reduce((total,current) => {return total + current.CINR},0) / result[i]['SCANNER_CINR'].length
                expect(parseFloat(CINR_AVG.toFixed(5))).to.eql(15.39957)
                
                expect(result[i]['SCANNER_RSRQ']).to.be.an('array').have.lengthOf(3282)
                let RSRQ_AVG = result[i]['SCANNER_RSRQ'].reduce((total,current) => {return total + current.RSRQ},0) / result[i]['SCANNER_RSRQ'].length
                expect(parseFloat(RSRQ_AVG.toFixed(5))).to.eql(-9.03419)
            }
            
        })
        //expect(testClass.testing()).to.equal(1);
    })

    it('LTE_TDD_SCANNER_MEASUREMENT TEST',()=>{
        //const jsdom = new JSDOM("<!doctype html><html><body><input type='file' id='fileinput' /></body></html>")
        const filePath = './server-test/logfiles/SCANNER_THAI_FDD.5.nmf'
        const fileBuffer = readFileSync(filePath,{encoding:'utf-8'})
        const fileName = basename(filePath)
        const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,fileName)
        
        const testClass = new NemoParser();
        testClass.displayGrid(['LTE_TDD_SCANNER_MEASUREMENT'],{fileBuffer:[logfileBuffer]}).subscribe((result)=>{
            for(let i of Object.keys(result)){
                //console.log(result[i]['SCANNER_RSRP'][0])
                const json2csvParser  = new Json2csvParser()
                const csv = json2csvParser.parse(result[i]['SCANNER_RSRP'])
                writeFileSync('./server-test/logfiles/TDD_DEBUG.csv',csv)
                //console.log(csv)
                //expect(result[i]['SCANNER_RSRP']).to.be.an('array').have.lengthOf(6875)
                let RSRP_AVG = result[i]['SCANNER_RSRP'].reduce((total,current) => {return total + current.RSRP},0) / result[i]['SCANNER_RSRP'].length
                //expect(parseFloat(RSRP_AVG.toFixed(5))).to.eql(-63.16795)
                
                //expect(result[i]['SCANNER_CINR']).to.be.an('array').have.lengthOf(6875)
                let CINR_AVG = result[i]['SCANNER_CINR'].reduce((total,current) => {return total + current.CINR},0) / result[i]['SCANNER_CINR'].length
                //expect(parseFloat(CINR_AVG.toFixed(5))).to.eql(15.39957)
                
                //expect(result[i]['SCANNER_RSRQ']).to.be.an('array').have.lengthOf(6875)
                let RSRQ_AVG = result[i]['SCANNER_RSRQ'].reduce((total,current) => {return total + current.RSRQ},0) / result[i]['SCANNER_RSRQ'].length
                //expect(parseFloat(RSRQ_AVG.toFixed(5))).to.eql(-9.03419)
            }
            
        })
        //expect(testClass.testing()).to.equal(1);
    })

    it('APPLICATION_THROUGHPUT_DOWNLINK_SINR_FILTER TEST',()=>{
        const filePath = './server-test/logfiles/FDD_DL.1.nmf'
        const fileBuffer = readFileSync(filePath,{encoding:'utf-8'})
        const fileName = basename(filePath)
        const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,fileName)

        const testClass = new NemoParser();
        testClass.displayGrid(['APPLICATION_THROUGHPUT_DOWNLINK_SINR_FILTER'],{fileBuffer:[logfileBuffer]}).subscribe((result)=>{
            for(let i of Object.keys(result)){
                expect(result[i]['DRATE']).to.be.an('array').have.lengthOf(122)
                expect(result[i]['DL_SNR']).to.be.an('array')
            }
            
        })
    })
})
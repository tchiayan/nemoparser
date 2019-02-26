import { NemoParser, LogfileBuffer } from './index'
import { readFileSync, readdirSync,writeFileSync, write } from 'fs'
import { expect } from 'chai'


describe("DEBUG FAIZ PSDL LONG",()=>{
    it('LOAD TDD PSDL FILE | LTE_TDD_UE_MEASUREMENT',()=>{
        const directory = './server-test/logfiles/TDD_PSDL_FAIZ';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['LTE_TDD_UE_MEASUREMENT'],{fileBuffer:bufferArray}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                let result = res.result
                let data = result['LTE_TDD_UE_MEASUREMENT']
                expect(data).to.have.keys(['RSRP_RSRQ','SINR'])
                expect(data['RSRP_RSRQ']).to.be.an('array').have.lengthOf.greaterThan(0)
                expect(data['SINR']).to.be.an('array').have.lengthOf.greaterThan(0)
            }
        })
    })

    it('LOAD TDD PSDL FILE | APPLICATION_THROUGHPUT_DOWNLINK',()=>{
        const directory = './server-test/logfiles/TDD_PSDL_FAIZ';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
            testClass.displayGrid(['APPLICATION_THROUGHPUT_DOWNLINK'],{fileBuffer:bufferArray,nemo_opts:{sinr_value:10}}).subscribe((res)=>{
                //console.log(result)
                if(res.status === "OK"){
                    let result = res.result
                    //console.log(res)
                    for(let i of Object.keys(result)){
                        expect(result[i]).to.have.keys(['DL_TP','DL_TP_SNR'])
                        expect(result[i]['DL_TP']).to.be.an('array').have.lengthOf.greaterThan(0)
                        expect(result[i]['DL_TP_SNR']).to.be.an('array').have.lengthOf(0)
                    }
                }
            })
    })

})

describe('FUNCTION RESPONSE TEST',()=>{
    

    it('PARSING FILE RESPONSE',()=>{
        const directory = './server-test/logfiles/TDD_SCANNER_LOGFILE';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['LTE_TDD_SCANNER_MEASUREMENT'],{fileBuffer:bufferArray}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                expect(res.result).to.be.an('object')
            }else if(res.status === 'PARSING'){
                expect(res.progress).to.be.an('number')
            }else if(res.status === 'CALCULATING'){
                //console.log("CALCULATING")
            }
            
        })
    })
})

describe('FILE PARSING TEST',() => {
    it('LOAD TDD SCANNER FILE | LTE_FDD_SCANNER_MEASUREMENT',()=>{
        const directory = './server-test/logfiles/TDD_SCANNER_LOGFILE';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
            testClass.displayGrid(['LTE_TDD_SCANNER_MEASUREMENT'],{fileBuffer:bufferArray}).subscribe((res)=>{
                //console.log(result)
                if(res.status === "OK"){
                    let result = res.result
                    for(let i of Object.keys(result)){
                        expect(result[i]['SCANNER_RSRP']).to.be.an('array').lengthOf.gt(0)
                        expect(result[i]['SCANNER_CINR']).to.be.an('array').lengthOf.gt(0)
                        expect(result[i]['SCANNER_RSRQ']).to.be.an('array').lengthOf.gt(0)
                    }
                }
                
            })
    })

    it('LOAD TDD PSDL FILE | LTE_TDD_UE_MEASUREMENT',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['LTE_TDD_UE_MEASUREMENT'],{fileBuffer:bufferArray,nemo_opts:{sinr_value:0}}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                let result = res.result
                let data = result['LTE_TDD_UE_MEASUREMENT']
                expect(data).to.have.keys(['RSRP_RSRQ','SINR'])
                expect(data['RSRP_RSRQ']).to.be.an('array').have.lengthOf.greaterThan(0)
                expect(data['SINR']).to.be.an('array').have.lengthOf.greaterThan(0)
            }
        })
    })

    it('LOAD TDD PSDL FILE | APPLICATION_THROUGHPUT_DOWNLINK',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
            testClass.displayGrid(['APPLICATION_THROUGHPUT_DOWNLINK'],{fileBuffer:bufferArray,nemo_opts:{sinr_value:0}}).subscribe((res)=>{
                //console.log(result)
                if(res.status === "OK"){
                    let result = res.result
                    //console.log(res)
                    for(let i of Object.keys(result)){
                        //expect(result[i]['SCANNER_RSRP']).to.be.an('array').lengthOf.gt(0)
                        //expect(result[i]['SCANNER_CINR']).to.be.an('array').lengthOf.gt(0)
                        //expect(result[i]['SCANNER_RSRQ']).to.be.an('array').lengthOf.gt(0)
                        expect(result[i]).to.have.keys(['DL_TP','DL_TP_SNR'])
                        expect(result[i]['DL_TP']).to.be.an('array').have.lengthOf.greaterThan(0)
                        expect(result[i]['DL_TP_SNR']).to.be.an('array').have.lengthOf.greaterThan(0)
                        //console.log(result[i]['DL_TP'][0])
                        //console.log(result[i]['DL_TP_SNR'][0])
                    }
                }
            })
    })

    it('LOAD TDD PSDL FILE | APPLICATION_THROUGHPUT_DOWNLINK_NO_SINR_FILTER',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
            testClass.displayGrid(['APPLICATION_THROUGHPUT_DOWNLINK'],{fileBuffer:bufferArray}).subscribe((res)=>{
                //console.log(result)
                if(res.status === "OK"){
                    let result = res.result
                    //console.log(res)
                    for(let i of Object.keys(result)){
                        expect(result[i]).to.have.keys(['DL_TP']).not.have.key('DL_TP_SNR')
                        expect(result[i]['DL_TP']).to.be.an('array').have.lengthOf.greaterThan(0)
                    }
                }
            })
    })

    it('LOAD TDD PSDL FILE | ATTACH_ATTEMPT',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
            testClass.displayGrid(['ATTACH_ATTEMPT'],{fileBuffer:bufferArray}).subscribe((res)=>{
                //console.log(result)
                if(res.status === "OK"){
                    let result = res.result
                    for(let i of Object.keys(result)){
                        expect(result[i]).to.have.keys(['ATTACH_ATTEMPT'])
                        expect(result[i]['ATTACH_ATTEMPT']).to.be.an('number').greaterThan(0)
                    }
                }
                
            })
    })

    it('LOAD TDD PSDL FILE | FTP_CONNECTION_ATTEMPT',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
            testClass.displayGrid(['FTP_CONNECTION_ATTEMPT'],{fileBuffer:bufferArray}).subscribe((res)=>{
                //console.log(result)
                if(res.status === "OK"){
                    let result = res.result
                    for(let i of Object.keys(result)){
                        expect(result[i]).to.have.keys(['FTP_CONNECT_ATTEMPT'])
                        expect(result[i]['FTP_CONNECT_ATTEMPT']).to.be.an('number').greaterThan(0)
                    }
                }
            })
    })

    it('LOAD TDD PSDL FILE | INTRA_HANDOVER',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['INTRA_HANDOVER'],{fileBuffer:bufferArray}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                let result = res.result
                for(let i of Object.keys(result)){
                    expect(result[i]).to.have.keys(['HANDOVER_SUCCESS','HANDOVER_ATTEMPT'])
                    expect(result[i]['HANDOVER_SUCCESS']).to.be.an('number').greaterThan(0)
                    expect(result[i]['HANDOVER_ATTEMPT']).to.be.an('number').greaterThan(0)
                }
            }
        })
    })

    it('LOAD TDD PSDL FILE | IRAT_HANDOVER',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['IRAT_HANDOVER'],{fileBuffer:bufferArray}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                for(let i of Object.keys(result)){
                    expect(result[i]).to.have.keys(['HANDOVER_SUCCESS','HANDOVER_ATTEMPT'])
                    //expect(result[i]['HANDOVER_SUCCESS']).to.be.an('number').greaterThan(0)
                    //expect(result[i]['HANDOVER_ATTEMPT']).to.be.an('number').greaterThan(0)
                }
            }
        })
    })

    it('LOAD TDD PSDL FILE | PDP_CONTEXT_SETUP',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
            testClass.displayGrid(['PDP_CONTEXT_SETUP'],{fileBuffer:bufferArray}).subscribe((res)=>{
                //console.log(result)
                if(res.status === "OK"){
                    let result = res.result
                    for(let i of Object.keys(result)){
                        expect(result[i]).to.have.keys(['PACKET_DATA_SETUP_ATTEMPT','PACKET_DATA_SETUP_SUCCESS','PACKET_DATA_DROP'])
                        expect(result[i]['PACKET_DATA_DROP']).to.be.an('number')
                        expect(result[i]['PACKET_DATA_SETUP_ATTEMPT']).to.be.an('number').greaterThan(0)
                        expect(result[i]['PACKET_DATA_SETUP_SUCCESS']).to.be.an('number').greaterThan(0)
                    }
                }
            })
    })


    it('LOAD TDD PSDL FILE | DATA_CONNECTION_SETUP',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['DATA_CONNECTION_SETUP'],{fileBuffer:bufferArray}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['DATA_CONNECTION_SETUP']
                expect(data).to.have.keys(['DATA_CONNECT_ATTEMPT','DATA_CONNECT_SUCCESS','DATA_SETUP_TIME'])
                expect(data['DATA_CONNECT_ATTEMPT']).to.be.an('number').greaterThan(0)
                expect(data['DATA_CONNECT_SUCCESS']).to.be.an('number').greaterThan(0)
                expect(data['DATA_SETUP_TIME']).to.be.an('array').have.lengthOf.greaterThan(0)
            }
        })
    })

    it('LOAD TDD PSDL FILE | TRACKING_AREA_UPDATE',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['TRACKING_AREA_UPDATE'],{fileBuffer:bufferArray}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['TRACKING_AREA_UPDATE']
                expect(data).to.have.keys(['TRACKING_AREA_UPDATE_ATTEMPT','TRACKING_AREA_UPDATE_SUCCESS'])
                expect(data['TRACKING_AREA_UPDATE_SUCCESS']).to.be.an('number').greaterThan(0)
                expect(data['TRACKING_AREA_UPDATE_ATTEMPT']).to.be.an('number').greaterThan(0)
            }
        })
    })

    it('LOAD TDD PSDL FILE | PDSCH_BLER',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['PDSCH_BLER'],{fileBuffer:bufferArray}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['PDSCH_BLER']
                expect(data).to.have.keys(['PDSCH_BLER'])
                expect(data['PDSCH_BLER']).to.be.an('array').have.lengthOf.greaterThan(0)
            }
        })
    })

    it('LOAD TDD PSUL FILE | APPLICATION_THROUGHPUT_UPLINK',()=>{
        const directory = './server-test/logfiles/TDD_PSUL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['APPLICATION_THROUGHPUT_UPLINK'],{fileBuffer:bufferArray}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['APPLICATION_THROUGHPUT_UPLINK']
                expect(data).to.have.keys(['UL_TP'])
                expect(data['UL_TP']).to.be.an('array').have.lengthOf.greaterThan(0)
            }
        })
    })

    it('LOAD TDD VOLTE FILE | VOLTE_CALL',()=>{
        const directory = './server-test/logfiles/TDD_VOLTE';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['VOLTE_CALL'],{fileBuffer:bufferArray}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['VOLTE_CALL']
                expect(data).to.have.keys(['VOLTE_CALL_ATTEMPT','VOLTE_CALL_CONNECTED','VOLTE_CALL_DROP'])
                expect(data['VOLTE_CALL_ATTEMPT']).to.be.an('array').have.lengthOf.greaterThan(0)
                expect(data['VOLTE_CALL_CONNECTED']).to.be.an('array').have.lengthOf.greaterThan(0)
                expect(data['VOLTE_CALL_DROP']).to.be.an('array')
            }
        })
    })

    it('LOAD TDD VOLTE FILE | AUDIO_QUALITY_MOS',()=>{
        const directory = './server-test/logfiles/TDD_VOLTE';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['AUDIO_QUALITY_MOS'],{fileBuffer:bufferArray}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['AUDIO_QUALITY_MOS']
                expect(data).to.have.keys(['MOS_QUALITY'])
                expect(data['MOS_QUALITY']).to.be.an('array').have.lengthOf.greaterThan(0)
            }
        })
    })

    it('LOAD TDD_CSFB FILE | CSFB_CALL',()=>{
        const directory = './server-test/logfiles/TDD_CSFB';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['CSFB_CALL'],{fileBuffer:bufferArray}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['CSFB_CALL']
                expect(data).to.have.keys(['CSFB_CALL_ATTEMPT','CSFB_CALL_CONNECTED','CSFB_CALL_DROP'])
                expect(data['CSFB_CALL_ATTEMPT']).to.be.an('array').have.lengthOf.greaterThan(0)
                expect(data['CSFB_CALL_CONNECTED']).to.be.an('array').have.lengthOf.greaterThan(0)
                expect(data['CSFB_CALL_DROP']).to.be.an('array')
            }
        })
    })

})

/*describe('FUNCTIONALITY/KPI TEST',()=>{
    
    it('LTE_FDD_SCANNER_MEASUREMENT TEST',()=>{
        //const jsdom = new JSDOM("<!doctype html><html><body><input type='file' id='fileinput' /></body></html>")
        const filePath = './server-test/logfiles/FDD_SCANNER.1.nmf'
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
        const filePath = './server-test/logfiles/TDD_SCANNER.1.nmf'
        const fileBuffer = readFileSync(filePath,{encoding:'utf-8'})
        const fileName = basename(filePath)
        const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,fileName)
        
        const testClass = new NemoParser();
        testClass.displayGrid(['LTE_TDD_SCANNER_MEASUREMENT'],{fileBuffer:[logfileBuffer]}).subscribe((result)=>{
            for(let i of Object.keys(result)){
                //console.log(result[i]['SCANNER_RSRP'][0])
                //const json2csvParser  = new Json2csvParser()
                //const csv = json2csvParser.parse(result[i]['SCANNER_RSRP'])
                //writeFileSync('./server-test/logfiles/TDD_DEBUG.csv',csv)
                //console.log(csv)
                expect(result[i]['SCANNER_RSRP']).to.be.an('array').have.lengthOf.at.least(1)
                //let RSRP_AVG = result[i]['SCANNER_RSRP'].reduce((total,current) => {return total + current.RSRP},0) / result[i]['SCANNER_RSRP'].length
                //expect(parseFloat(RSRP_AVG.toFixed(5))).to.eql(-63.16795)
                
                expect(result[i]['SCANNER_CINR']).to.be.an('array').have.lengthOf.at.least(1)
                //let CINR_AVG = result[i]['SCANNER_CINR'].reduce((total,current) => {return total + current.CINR},0) / result[i]['SCANNER_CINR'].length
                //expect(parseFloat(CINR_AVG.toFixed(5))).to.eql(15.39957)
                
                expect(result[i]['SCANNER_RSRQ']).to.be.an('array').have.lengthOf.at.least(1)
                //let RSRQ_AVG = result[i]['SCANNER_RSRQ'].reduce((total,current) => {return total + current.RSRQ},0) / result[i]['SCANNER_RSRQ'].length
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
                expect(result[i]['DL_TP']).to.be.an('array').have.lengthOf(122)
                expect(result[i]['DL_TP_SNR']).to.be.an('array')
            }
            
        })
    })
})*/


describe('PREDICTION FILTER CALCULATION TEST',()=>{
    let predictionData = readFileSync('./server-test/prediction/prediction.json',{encoding:'utf-8'})
    it('LOAD TDD SCANNER FILE | LTE_FDD_SCANNER_MEASUREMENT',()=>{
        const directory = './server-test/logfiles/TDD_SCANNER_LOGFILE';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['LTE_TDD_SCANNER_MEASUREMENT'],{fileBuffer:bufferArray,nemo_opts:{
            polygon:JSON.parse(predictionData)
        }}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                let result = res.result
                for(let i of Object.keys(result)){
                    expect(result[i]['SCANNER_RSRP']).to.be.an('array').lengthOf.gt(0)
                    expect(result[i]['SCANNER_CINR']).to.be.an('array').lengthOf.gt(0)
                    expect(result[i]['SCANNER_RSRQ']).to.be.an('array').lengthOf.gt(0)
                }
            }
            
        })
    })

    it('LOAD TDD PSDL FILE | LTE_TDD_UE_MEASUREMENT',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['LTE_TDD_UE_MEASUREMENT'],{fileBuffer:bufferArray,nemo_opts:{sinr_value:0,polygon:JSON.parse(predictionData)}}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                let result = res.result
                let data = result['LTE_TDD_UE_MEASUREMENT']
                expect(data).to.have.keys(['RSRP_RSRQ','SINR'])
                expect(data['RSRP_RSRQ']).to.be.an('array').have.lengthOf.greaterThan(0)
                expect(data['SINR']).to.be.an('array').have.lengthOf.greaterThan(0)
            }
        })
    })

    it('LOAD TDD PSDL FILE | APPLICATION_THROUGHPUT_DOWNLINK_SINR_FILTER',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
            testClass.displayGrid(['APPLICATION_THROUGHPUT_DOWNLINK'],{fileBuffer:bufferArray,nemo_opts:{sinr_value:0,polygon:JSON.parse(predictionData)}}).subscribe((res)=>{
                //console.log(result)
                if(res.status === "OK"){
                    let result = res.result
                    //console.log(res)
                    for(let i of Object.keys(result)){
                        //expect(result[i]['SCANNER_RSRP']).to.be.an('array').lengthOf.gt(0)
                        //expect(result[i]['SCANNER_CINR']).to.be.an('array').lengthOf.gt(0)
                        //expect(result[i]['SCANNER_RSRQ']).to.be.an('array').lengthOf.gt(0)
                        expect(result[i]).to.have.keys(['DL_TP','DL_TP_SNR'])
                        expect(result[i]['DL_TP']).to.be.an('array').have.lengthOf.greaterThan(0)
                        expect(result[i]['DL_TP_SNR']).to.be.an('array').have.lengthOf.greaterThan(0)
                        //console.log(result[i]['DL_TP'][0])
                        //console.log(result[i]['DL_TP_SNR'][0])
                    }
                }
            })
    })

    it('LOAD TDD PSDL FILE | ATTACH_ATTEMPT',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
            testClass.displayGrid(['ATTACH_ATTEMPT'],{fileBuffer:bufferArray,nemo_opts:{
                polygon:JSON.parse(predictionData)
            }}).subscribe((res)=>{
                //console.log(result)
                if(res.status === "OK"){
                    let result = res.result
                    for(let i of Object.keys(result)){
                        expect(result[i]).to.have.keys(['ATTACH_ATTEMPT'])
                        expect(result[i]['ATTACH_ATTEMPT']).to.be.an('number').eq(0)
                    }
                }
                
            })
    })

    it('LOAD TDD PSDL FILE | FTP_CONNECTION_ATTEMPT',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
            testClass.displayGrid(['FTP_CONNECTION_ATTEMPT'],{fileBuffer:bufferArray,nemo_opts:{
                polygon:JSON.parse(predictionData)
            }}).subscribe((res)=>{
                //console.log(result)
                if(res.status === "OK"){
                    let result = res.result
                    for(let i of Object.keys(result)){
                        expect(result[i]).to.have.keys(['FTP_CONNECT_ATTEMPT'])
                        expect(result[i]['FTP_CONNECT_ATTEMPT']).to.be.an('number').eq(0)
                    }
                }
            })
    })

    it('LOAD TDD PSDL FILE | INTRA_HANDOVER',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['INTRA_HANDOVER'],{fileBuffer:bufferArray,nemo_opts:{
            polygon:JSON.parse(predictionData)
        }}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                let result = res.result
                for(let i of Object.keys(result)){
                    expect(result[i]).to.have.keys(['HANDOVER_SUCCESS','HANDOVER_ATTEMPT'])
                    expect(result[i]['HANDOVER_SUCCESS']).to.be.an('number').greaterThan(0)
                    expect(result[i]['HANDOVER_ATTEMPT']).to.be.an('number').greaterThan(0)
                }
            }
        })
    })

    it('LOAD TDD PSDL FILE | IRAT_HANDOVER',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['IRAT_HANDOVER'],{fileBuffer:bufferArray,nemo_opts:{
            polygon:JSON.parse(predictionData)
        }}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                for(let i of Object.keys(result)){
                    expect(result[i]).to.have.keys(['HANDOVER_SUCCESS','HANDOVER_ATTEMPT'])
                    //expect(result[i]['HANDOVER_SUCCESS']).to.be.an('number').greaterThan(0)
                    //expect(result[i]['HANDOVER_ATTEMPT']).to.be.an('number').greaterThan(0)
                }
            }
        })
    })

    it('LOAD TDD PSDL FILE | PDP_CONTEXT_SETUP',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
            testClass.displayGrid(['PDP_CONTEXT_SETUP'],{fileBuffer:bufferArray,nemo_opts:{
                polygon:JSON.parse(predictionData)
            }}).subscribe((res)=>{
                //console.log(result)
                if(res.status === "OK"){
                    let result = res.result
                    for(let i of Object.keys(result)){
                        expect(result[i]).to.have.keys(['PACKET_DATA_SETUP_ATTEMPT','PACKET_DATA_SETUP_SUCCESS','PACKET_DATA_DROP'])
                        expect(result[i]['PACKET_DATA_DROP']).to.be.an('number')
                        expect(result[i]['PACKET_DATA_SETUP_ATTEMPT']).to.be.an('number').eq(0)
                        expect(result[i]['PACKET_DATA_SETUP_SUCCESS']).to.be.an('number').eq(0)
                    }
                }
            })
    })


    it('LOAD TDD PSDL FILE | DATA_CONNECTION_SETUP',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['DATA_CONNECTION_SETUP'],{fileBuffer:bufferArray,nemo_opts:{
            polygon:JSON.parse(predictionData)
        }}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['DATA_CONNECTION_SETUP']
                expect(data).to.have.keys(['DATA_CONNECT_ATTEMPT','DATA_CONNECT_SUCCESS','DATA_SETUP_TIME'])
                expect(data['DATA_CONNECT_ATTEMPT']).to.be.an('number').eq(0)
                expect(data['DATA_CONNECT_SUCCESS']).to.be.an('number').eq(0)
                //expect(data['DATA_SETUP_TIME']).to.be.an('array').have.lengthOf.greaterThan(0)
            }
        })
    })

    it('LOAD TDD PSDL FILE | TRACKING_AREA_UPDATE',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['TRACKING_AREA_UPDATE'],{fileBuffer:bufferArray,nemo_opts:{
            polygon:JSON.parse(predictionData)
        }}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['TRACKING_AREA_UPDATE']
                expect(data).to.have.keys(['TRACKING_AREA_UPDATE_ATTEMPT','TRACKING_AREA_UPDATE_SUCCESS'])
                expect(data['TRACKING_AREA_UPDATE_SUCCESS']).to.be.an('number').eq(0)
                expect(data['TRACKING_AREA_UPDATE_ATTEMPT']).to.be.an('number').eq(0)
            }
        })
    })

    it('LOAD TDD PSDL FILE | PDSCH_BLER',()=>{
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['PDSCH_BLER'],{fileBuffer:bufferArray,nemo_opts:{
            polygon:JSON.parse(predictionData)
        }}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['PDSCH_BLER']
                expect(data).to.have.keys(['PDSCH_BLER'])
                expect(data['PDSCH_BLER']).to.be.an('array').have.lengthOf.greaterThan(0)
            }
        })
    })

    it('LOAD TDD PSUL FILE | APPLICATION_THROUGHPUT_UPLINK',()=>{
        const directory = './server-test/logfiles/TDD_PSUL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['APPLICATION_THROUGHPUT_UPLINK'],{fileBuffer:bufferArray,nemo_opts:{
            polygon:JSON.parse(predictionData)
        }}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['APPLICATION_THROUGHPUT_UPLINK']
                expect(data).to.have.keys(['UL_TP'])
                expect(data['UL_TP']).to.be.an('array').have.lengthOf.greaterThan(0)
            }
        })
    })

    it('LOAD TDD VOLTE FILE | VOLTE_CALL',()=>{
        const directory = './server-test/logfiles/TDD_VOLTE';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['VOLTE_CALL'],{fileBuffer:bufferArray,nemo_opts:{
            polygon:JSON.parse(predictionData)
        }}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['VOLTE_CALL']
                expect(data).to.have.keys(['VOLTE_CALL_ATTEMPT','VOLTE_CALL_CONNECTED','VOLTE_CALL_DROP'])
                expect(data['VOLTE_CALL_ATTEMPT']).to.be.an('array').have.lengthOf.greaterThan(0)
                expect(data['VOLTE_CALL_CONNECTED']).to.be.an('array').have.lengthOf.greaterThan(0)
                expect(data['VOLTE_CALL_DROP']).to.be.an('array')
            }
        })
    })

    it('LOAD TDD VOLTE FILE | AUDIO_QUALITY_MOS',()=>{
        const directory = './server-test/logfiles/TDD_VOLTE';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['AUDIO_QUALITY_MOS'],{fileBuffer:bufferArray,nemo_opts:{
            polygon:JSON.parse(predictionData)
        }}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['AUDIO_QUALITY_MOS']
                expect(data).to.have.keys(['MOS_QUALITY'])
                expect(data['MOS_QUALITY']).to.be.an('array').have.lengthOf.greaterThan(0)
            }
        })
    })

    it('LOAD TDD_CSFB FILE | CSFB_CALL',()=>{
        const directory = './server-test/logfiles/TDD_CSFB';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['CSFB_CALL'],{fileBuffer:bufferArray,nemo_opts:{
            polygon:JSON.parse(predictionData)
        }}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['CSFB_CALL']
                expect(data).to.have.keys(['CSFB_CALL_ATTEMPT','CSFB_CALL_CONNECTED','CSFB_CALL_DROP'])
                expect(data['CSFB_CALL_ATTEMPT']).to.be.an('array').have.lengthOf.greaterThan(0)
                expect(data['CSFB_CALL_CONNECTED']).to.be.an('array').have.lengthOf.greaterThan(0)
                expect(data['CSFB_CALL_DROP']).to.be.an('array')
            }
        })
    })
})


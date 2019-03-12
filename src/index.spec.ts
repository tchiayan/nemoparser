import { NemoParser, LogfileBuffer } from './index'
import { readFileSync, readdirSync,writeFileSync, write, fstat, readFile } from 'fs'
import { expect } from 'chai';
import { NemoGeoJSON } from './shared/nemo_geojson';

const Json2csvParser = require('json2csv').Parser;

function parseDirectoryLogfile(path):LogfileBuffer[]{
    let bufferArray:LogfileBuffer[] = []
    readdirSync(path).forEach(file =>{
        const fileBuffer = readFileSync(`${path}/${file}`,{encoding:'utf-8'})
        const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
        bufferArray.push(logfileBuffer)
    })
    return bufferArray
}

/*describe("UNZIP NEMO File",()=>{
    it('unzip ssv file',async ()=>{
        const zipfile = readFileSync('./server-test/zip/ZIP_LOGFILE.zip')
        let zipper = new NemoFileUnzipper()
        let result = await zipper.unzip(zipfile)
        expect(result).to.be.an('array').have.lengthOf(211)
    })
})*/

describe("CONVERT GEOJSON FEATURE",()=>{
    it('NemoGeoJSON Function Testing',()=>{
        const directory = './server-test/logfiles/FDD_SCANNER';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['LTE_FDD_SCANNER_MEASUREMENT'],{fileBuffer:bufferArray}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                let result = res.result
                let data = result['LTE_FDD_SCANNER_MEASUREMENT']
                //console.log(`RSRP: ${data['SCANNER_RSRP'].length} | CINR: ${data['SCANNER_CINR'].length} | RSRQ: ${data['SCANNER_RSRQ'].length}`)
                let JSONParser = new NemoGeoJSON()
                const featuresCollection = JSONParser.convertToGeoJSON(data['SCANNER_RSRP'])
                const latlngLength = data['SCANNER_RSRP'].length
                expect(featuresCollection).to.have.keys(['type','features'])
                const features = featuresCollection.features
                expect(features).to.be.an('array').have.lengthOf(1)
                const feature = features[0]
                expect(feature).to.have.keys(['type','properties','geometry'])
                const geometry = feature.geometry
                expect(geometry).to.have.keys(['type','coordinates'])
                expect(geometry['coordinates']).to.be.an('array').have.lengthOf(latlngLength)
            }
        })
    })

    it('ConvertToFeaturesCollection Function Testing',()=>{
        const directory = './server-test/logfiles/FDD_SCANNER';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['LTE_FDD_SCANNER_MEASUREMENT'],{fileBuffer:bufferArray}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                let result = res.result
                let data = result['LTE_FDD_SCANNER_MEASUREMENT']
                let layers = testClass.convertToFeaturesCollection(data['SCANNER_RSRP'])
                expect(layers).to.be.an('array').have.lengthOf(4)
            }
        })
    })

    it('ConvertToFeaturesCollection Function Testing With ColorSet',()=>{
        const directory = './server-test/logfiles/FDD_SCANNER';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['LTE_FDD_SCANNER_MEASUREMENT'],{fileBuffer:bufferArray}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                let result = res.result
                let data = result['LTE_FDD_SCANNER_MEASUREMENT']
                let layers = testClass.convertToFeaturesCollection(data['SCANNER_RSRP'],[
                    {
                        color: 'green',
                        field: 'RSRP',
                        condition: {
                            gt: -90
                        }
                    },{
                        color: 'red',
                        field: 'RSRP',
                        condition: {
                            lt: -90
                        }
                    },
                ])
                expect(layers).to.be.an('array').have.lengthOf(4)
                //console.log(layers[0].geojson.features)
            }
        })
    })

    it('FDD PSDL Route Test',()=>{
        const directory = './server-test/logfiles/FDD_LTE_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['LTE_FDD_UE_MEASUREMENT'],{fileBuffer:bufferArray}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                let result = res.result
                let data = result['LTE_FDD_UE_MEASUREMENT']
                let layers = testClass.convertToFeaturesCollection(data['RSRP_RSRQ'])
                expect(layers).to.be.an('array').have.lengthOf(4)
                const geoJSONArray = layers.map(output => output.geojson)
                geoJSONArray.forEach((featureCollection)=>{
                    featureCollection.features.forEach((feature)=>{
                        const coordinate = feature.geometry.coordinates
                        coordinate.forEach(([lon,lat])=>{
                            expect(lon).to.be.an('number').not.eq(0)
                            expect(lat).to.be.an('number').not.eq(0)
                        })
                    })
                })
            }
        })
    })

    it('FDD PSDL Route Test With Color Set',()=>{
        const directory = './server-test/logfiles/FDD_LTE_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['LTE_FDD_UE_MEASUREMENT'],{fileBuffer:bufferArray}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                let result = res.result
                let data = result['LTE_FDD_UE_MEASUREMENT']
                let layers = testClass.convertToFeaturesCollection(data['RSRP_RSRQ'],[
                    {color:'green',field:'RSRP',condition:{gt:-80}},
                    {color:'yellow',field:'RSRP',condition:{lt:-80,gt:-108}},
                    {color:'red',field:'RSRP',condition:{lt:-108}}
                  ])
                expect(layers).to.be.an('array').have.lengthOf(4)
                const geoJSONArray = layers.map(output => output.geojson)
                geoJSONArray.forEach((featureCollection)=>{
                    featureCollection.features.forEach((feature)=>{
                        const coordinate = feature.geometry.coordinates
                        coordinate.forEach(([lon,lat])=>{
                            expect(lon).to.be.an('number').not.eq(0)
                            expect(lat).to.be.an('number').not.eq(0)
                        })
                    })
                })
            }
        })
    })
})

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

describe('UMTS FILE PARSING & KPI CHECK',() => {
    

    it('LOAD UMTS SCANNER FILE | UMTS_SCANNER_MEASUREMENT',()=>{
        const testClass = new NemoParser();
        testClass.displayGrid(['UMTS_SCANNER_MEASUREMENT'],{fileBuffer:parseDirectoryLogfile('./server-test/logfiles/FDD_SCANNER')}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                let result = res.result
                let data = result['UMTS_SCANNER_MEASUREMENT']
                //console.log(`RSCP: ${data['SCANNER_RSCP'].length} | ECNO: ${data['SCANNER_ECNO'].length}`)
                expect(data).to.have.keys(['SCANNER_RSCP','SCANNER_ECNO'])
                expect(data['SCANNER_RSCP']).to.be.an('array').lengthOf(4387)
                expect(data['SCANNER_ECNO']).to.be.an('array').lengthOf(4387)

                
                const RSCP_AVG = parseFloat((data['SCANNER_RSCP'].reduce((acc,cur)=> {return acc + cur.RSCP},0)/data['SCANNER_RSCP'].length).toFixed(3))
                expect(RSCP_AVG).to.be.eq(-59.523)
                const ECNO_AVG = parseFloat((data['SCANNER_ECNO'].reduce((acc,cur)=> {return acc + cur.ECNO},0)/data['SCANNER_ECNO'].length).toFixed(3))
                expect(ECNO_AVG).to.be.eq(-9.274)
            }
        })
    })
    //

    it('LOAD UMTS PSDL FILE | UMTS_UE_MEASUREMENT',()=>{
        const testClass = new NemoParser();
        testClass.displayGrid(['UMTS_UE_MEASUREMENT'],{fileBuffer:parseDirectoryLogfile('./server-test/logfiles/UMTS_PSDL')}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                let result = res.result
                let data = result['UMTS_UE_MEASUREMENT']
            
                expect(data).to.have.keys(['RSCP_ECNO'])
                expect(data['RSCP_ECNO']).to.be.an('array').lengthOf(806)

                const RSCP_AVG = parseFloat((data['RSCP_ECNO'].reduce((acc,cur)=> {return acc + cur.RSCP},0)/data['RSCP_ECNO'].length).toFixed(3))
                expect(RSCP_AVG).to.be.eq(-61.931)
                const ECNO_AVG = parseFloat((data['RSCP_ECNO'].reduce((acc,cur)=> {return acc + cur.ECNO},0)/data['RSCP_ECNO'].length).toFixed(3))
                expect(ECNO_AVG).to.be.eq(-9.981)
            }
        })
    })

    it('LOAD UMTS CALL LONG PSTN FILE | CALL',()=>{
        const testClass = new NemoParser();
        testClass.displayGrid(['CALL'],{fileBuffer:parseDirectoryLogfile('./server-test/logfiles/UMTS_CALL_LONG_PSTN')}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                let result = res.result
                let data = result['CALL']

                expect(data).to.have.keys(['CALL_ATTEMPT','CALL_CONNECTED','CALL_DROP'])
                expect(data['CALL_ATTEMPT']).to.be.an('array').have.lengthOf(4)
                expect(data['CALL_CONNECTED']).to.be.an('array').have.lengthOf(4)
                expect(data['CALL_DROP']).to.be.an('array').have.lengthOf(0)
                const CSBF_ST = parseFloat((data['CALL_CONNECTED'].reduce((acc,cur)=>{return acc + cur.SETUP_TIME},0)/data['CALL_CONNECTED'].length/1000).toFixed(3))
                expect(CSBF_ST).to.be.eq(3.337)
            }
        })
    })

    it('LOAD UMTS CALL LONG PSTN FILE | RLC_BLER',()=>{
        const testClass = new NemoParser();
        testClass.displayGrid(['RLC_BLER'],{fileBuffer:parseDirectoryLogfile('./server-test/logfiles/UMTS_CALL_LONG_PSTN')}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                let result = res.result
                let data = result['RLC_BLER']

                expect(data).to.have.keys(['RLC_BLER'])
                expect(data['RLC_BLER']).to.be.an('array').have.lengthOf(240)
                const CS_BLER_AVG = parseFloat((data['RLC_BLER'].reduce((acc,cur)=>{return acc + cur},0)/data['RLC_BLER'].length).toFixed(3))
                expect(CS_BLER_AVG).to.be.eq(0.242)
            }
        })
    })

    it('LOAD UMTS CALL MOS MTC FILE | AUDIO_QUALITY_MOS',()=>{

        const testClass = new NemoParser();
        testClass.displayGrid(['AUDIO_QUALITY_MOS'],{fileBuffer:parseDirectoryLogfile('./server-test/logfiles/UMTS_CALL_MOC_MOS'),nemo_opts:{vq_type_dl:'any'}}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['AUDIO_QUALITY_MOS']
                expect(data).to.have.keys(['MOS_QUALITY'])
                expect(data['MOS_QUALITY']).to.be.an('array').have.lengthOf(10)
                const MOSAVG = parseFloat((data['MOS_QUALITY'].reduce((acc,cur)=> {return acc + cur},0)/data['MOS_QUALITY'].length).toFixed(3))
                expect(MOSAVG).to.be.eq(3.624)
            }
        })
    })

    it('LOAD UMTS HSDPA | DATA_CONNECTION_SETUP',()=>{

        const testClass = new NemoParser();
        testClass.displayGrid(['DATA_CONNECTION_SETUP'],{fileBuffer:parseDirectoryLogfile('./server-test/logfiles/UMTS_PSDL')}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['DATA_CONNECTION_SETUP']
                expect(data).to.have.keys(['DATA_CONNECT_ATTEMPT','DATA_CONNECT_SUCCESS','DATA_SETUP_TIME'])
                expect(data['DATA_CONNECT_ATTEMPT']).to.be.an('number').eq(8)
                expect(data['DATA_CONNECT_SUCCESS']).to.be.an('number').eq(8)
                expect(data['DATA_SETUP_TIME']).to.be.an('array').have.lengthOf(8)
                const DST_AVG = parseFloat((data['DATA_SETUP_TIME'].reduce((acc,cur)=> {return acc + cur},0)/data['DATA_SETUP_TIME'].length/1000).toFixed(3))
                expect(DST_AVG).to.be.eq(1.826)
            }
        })
    })

    it('LOAD UMTS HSDPA | APPLICATION_THROUGHPUT_DOWNLINK',()=>{
        const testClass = new NemoParser();
        testClass.displayGrid(['APPLICATION_THROUGHPUT_DOWNLINK'],{fileBuffer:parseDirectoryLogfile('./server-test/logfiles/UMTS_PSDL')}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['APPLICATION_THROUGHPUT_DOWNLINK']
                expect(data).to.have.keys(['DL_TP']).not.have.key('DL_TP_SNR')
                expect(data['DL_TP']).to.be.an('array').have.lengthOf(359)
                const DL_AVG = parseFloat((data['DL_TP'].reduce((acc,cur)=> {return acc + cur},0)/data['DL_TP'].length/1000).toFixed(3))
                expect(DL_AVG).to.be.eq(5608.891)
            }
        })
    })

    it('LOAD UMTS HSUPA | APPLICATION_THROUGHPUT_UPLINK',()=>{
        const testClass = new NemoParser();
        testClass.displayGrid(['APPLICATION_THROUGHPUT_UPLINK'],{fileBuffer:parseDirectoryLogfile('./server-test/logfiles/UMTS_PSUL')}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['APPLICATION_THROUGHPUT_UPLINK']
                expect(data).to.have.keys(['UL_TP'])
                expect(data['UL_TP']).to.be.an('array').have.lengthOf(429)
                const DL_AVG = parseFloat((data['UL_TP'].reduce((acc,cur)=> {return acc + cur},0)/data['UL_TP'].length/1000).toFixed(3))
                expect(DL_AVG).to.be.eq(2384.922)
            }
        })
    })

    it('LOAD UMTS FDD_CSFB_MOC | L3_MESSAGE',()=>{
        const testClass = new NemoParser();
        testClass.displayGrid(['L3_MESSAGE'],{fileBuffer:parseDirectoryLogfile('./server-test/logfiles/FDD_CSFB_MOC')}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['L3_MESSAGE']
                expect(data).to.have.keys(['L3_MESSAGE'])
                //console.log(data)
                expect(data['L3_MESSAGE']).to.be.an('array').have.lengthOf.gt(0)
            }
        })
    })
})


describe('LTE FDD FILE PARSING & KPI CHECK',() => {
    it('LOAD FDD SCANNER FILE | LTE_FDD_SCANNER_MEASUREMENT',()=>{
        const directory = './server-test/logfiles/FDD_SCANNER';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['LTE_FDD_SCANNER_MEASUREMENT'],{fileBuffer:bufferArray}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                let result = res.result
                let data = result['LTE_FDD_SCANNER_MEASUREMENT']
                //console.log(`RSRP: ${data['SCANNER_RSRP'].length} | CINR: ${data['SCANNER_CINR'].length} | RSRQ: ${data['SCANNER_RSRQ'].length}`)
                expect(data['SCANNER_RSRP']).to.be.an('array').lengthOf(2187)
                expect(data['SCANNER_CINR']).to.be.an('array').lengthOf(2187)
                expect(data['SCANNER_RSRQ']).to.be.an('array').lengthOf(2187)

                const RSRP_AVG = parseFloat((data['SCANNER_RSRP'].reduce((acc,cur)=> {return acc + cur.RSRP},0)/data['SCANNER_RSRP'].length).toFixed(3))
                expect(RSRP_AVG).to.be.eq(-71.751)
                const CINR_AVG = parseFloat((data['SCANNER_CINR'].reduce((acc,cur)=> {return acc + cur.CINR},0)/data['SCANNER_CINR'].length).toFixed(3))
                expect(CINR_AVG).to.be.eq(9.271)
                const RSRQ_AVG = parseFloat((data['SCANNER_RSRQ'].reduce((acc,cur)=> {return acc + cur.RSRQ},0)/data['SCANNER_RSRQ'].length).toFixed(3))
                expect(RSRQ_AVG).to.be.eq(-12.484)
            }
        })
    })

    it('LOAD FDD SCANNER 2 FILE | LTE_FDD_SCANNER_MEASUREMENT',()=>{
        const directory = './server-test/logfiles/FDD_SCANNER_2';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['LTE_FDD_SCANNER_MEASUREMENT'],{fileBuffer:bufferArray}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                let result = res.result
                let data = result['LTE_FDD_SCANNER_MEASUREMENT']
                //const parser = new Json2csvParser();
                //const csv = parser.parse(data['SCANNER_CINR'])
                //writeFileSync('./server-test/output.csv',csv)
                //console.log(`RSRP: ${data['SCANNER_RSRP'].length} | CINR: ${data['SCANNER_CINR'].length} | RSRQ: ${data['SCANNER_RSRQ'].length}`)
                expect(data['SCANNER_RSRP']).to.be.an('array').lengthOf(1073)
                expect(data['SCANNER_CINR']).to.be.an('array').lengthOf(1073)
                expect(data['SCANNER_RSRQ']).to.be.an('array').lengthOf(1073)

                const RSRP_AVG = parseFloat((data['SCANNER_RSRP'].reduce((acc,cur)=> {return acc + cur.RSRP},0)/data['SCANNER_RSRP'].length).toFixed(3))
                expect(RSRP_AVG).to.be.eq(-67.604)
                const CINR_AVG = parseFloat((data['SCANNER_CINR'].reduce((acc,cur)=> {return acc + cur.CINR},0)/data['SCANNER_CINR'].length).toFixed(3))
                expect(CINR_AVG).to.be.eq(16.447)
                const RSRQ_AVG = parseFloat((data['SCANNER_RSRQ'].reduce((acc,cur)=> {return acc + cur.RSRQ},0)/data['SCANNER_RSRQ'].length).toFixed(3))
                expect(RSRQ_AVG).to.be.eq(-7.948)
            }
        })
    })

    it('LOAD FDD SCANNER 2 FILE | LTE_FDD_SCANNER_MEASUREMENT | Filter Channel 100',()=>{
        const directory = './server-test/logfiles/FDD_SCANNER_2';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['LTE_FDD_SCANNER_MEASUREMENT'],{fileBuffer:bufferArray,nemo_opts:{filter_channel:['125']}}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                let result = res.result
                let data = result['LTE_FDD_SCANNER_MEASUREMENT']
                //console.log(`RSRP: ${data['SCANNER_RSRP'].length} | CINR: ${data['SCANNER_CINR'].length} | RSRQ: ${data['SCANNER_RSRQ'].length}`)
                expect(data['SCANNER_RSRP']).to.be.an('array').lengthOf(68)
                expect(data['SCANNER_CINR']).to.be.an('array').lengthOf(68)
                expect(data['SCANNER_RSRQ']).to.be.an('array').lengthOf(68)

                const RSRP_AVG = parseFloat((data['SCANNER_RSRP'].reduce((acc,cur)=> {return acc + cur.RSRP},0)/data['SCANNER_RSRP'].length).toFixed(3))
                expect(RSRP_AVG).to.be.eq(-96.037)
                const CINR_AVG = parseFloat((data['SCANNER_CINR'].reduce((acc,cur)=> {return acc + cur.CINR},0)/data['SCANNER_CINR'].length).toFixed(3))
                expect(CINR_AVG).to.be.eq(-21.237)
                const RSRQ_AVG = parseFloat((data['SCANNER_RSRQ'].reduce((acc,cur)=> {return acc + cur.RSRQ},0)/data['SCANNER_RSRQ'].length).toFixed(3))
                expect(RSRQ_AVG).to.be.eq(-31.131)
            }
        })
    })

    it('LOAD FDD PSDL FILE | LTE_FDD_UE_MEASUREMENT',()=>{
        const directory = './server-test/logfiles/FDD_LTE_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['LTE_FDD_UE_MEASUREMENT'],{fileBuffer:bufferArray}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['LTE_FDD_UE_MEASUREMENT']
                expect(data).to.have.keys(['RSRP_RSRQ','SINR'])
                expect(data['RSRP_RSRQ']).to.be.an('array').have.lengthOf(893)
                const RSRP_AVG = parseFloat((data['RSRP_RSRQ'].reduce((acc,cur)=> {return acc + cur.RSRP},0)/data['RSRP_RSRQ'].length).toFixed(3))
                const RSRQ_AVG = parseFloat((data['RSRP_RSRQ'].reduce((acc,cur)=> {return acc + cur.RSRQ},0)/data['RSRP_RSRQ'].length).toFixed(3))
                expect(RSRP_AVG).to.eq(-77.629)
                expect(RSRQ_AVG).to.eq(-11.445)
                expect(data['SINR']).to.be.an('array').have.lengthOf(895)
                const SINR_AVG = parseFloat((data['SINR'].reduce((acc,cur)=> {return acc + cur.CINR},0)/data['SINR'].length).toFixed(3))
                expect(SINR_AVG).to.eq(9.564)
            }
        })
    })

    it('LOAD FDD PSDL FILE | APPLICATION_THROUGHPUT_DOWNLINK_NO_SINR_FILTER',()=>{
        const directory = './server-test/logfiles/FDD_LTE_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['APPLICATION_THROUGHPUT_DOWNLINK'],{fileBuffer:bufferArray}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['APPLICATION_THROUGHPUT_DOWNLINK']
                expect(data).to.have.keys(['DL_TP']).not.have.key('DL_TP_SNR')
                expect(data['DL_TP']).to.be.an('array').have.lengthOf(432)
                const DL_AVG = parseFloat((data['DL_TP'].reduce((acc,cur)=> {return acc + cur},0)/data['DL_TP'].length/1000).toFixed(3))
                expect(DL_AVG).to.be.eq(3334.345)
            }
        })
    })

    it('LOAD FDD PSDL FILE | ATTACH_ATTEMPT',()=>{
        const directory = './server-test/logfiles/FDD_LTE_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
            testClass.displayGrid(['ATTACH_ATTEMPT'],{fileBuffer:bufferArray}).subscribe((res)=>{
                if(res.status === "OK"){
                    let result = res.result
                    let data = result['ATTACH_ATTEMPT']
                    expect(data).to.have.keys(['ATTACH_ATTEMPT'])
                    expect(data['ATTACH_ATTEMPT']).to.be.an('number').eq(4)
                }
                
            })
    })

    it('LOAD FDD PSDL FILE | FTP_CONNECTION_ATTEMPT',()=>{
        const directory = './server-test/logfiles/FDD_LTE_PSDL';
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
                    let data = result['FTP_CONNECTION_ATTEMPT']
                    expect(data).to.have.keys(['FTP_CONNECT_ATTEMPT'])
                    expect(data['FTP_CONNECT_ATTEMPT']).to.be.an('number').eq(4)
                }
            })
    })
    
    it('LOAD FDD PSDL FILE | INTRA_HANDOVER',()=>{
        const directory = './server-test/logfiles/FDD_LTE_PSDL';
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
                    expect(result[i]['HANDOVER_SUCCESS']).to.be.an('number').eq(9)
                    expect(result[i]['HANDOVER_ATTEMPT']).to.be.an('number').eq(9)
                }
            }
        })
    })

    it('LOAD FDD PSDL FILE | PDP_CONTEXT_SETUP',()=>{
        const directory = './server-test/logfiles/FDD_LTE_PSDL';
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
                        expect(result[i]['PACKET_DATA_SETUP_ATTEMPT']).to.be.an('number').eq(4)
                        expect(result[i]['PACKET_DATA_SETUP_SUCCESS']).to.be.an('number').eq(4)
                    }
                }
            })
    })

    it('LOAD FDD PSDL FILE | DATA_CONNECTION_SETUP',()=>{
        const directory = './server-test/logfiles/FDD_LTE_PSDL';
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
                expect(data['DATA_CONNECT_ATTEMPT']).to.be.an('number').eq(4)
                expect(data['DATA_CONNECT_SUCCESS']).to.be.an('number').eq(4)
                expect(data['DATA_SETUP_TIME']).to.be.an('array').have.lengthOf(4)
                const DST_AVG = parseFloat((data['DATA_SETUP_TIME'].reduce((acc,cur)=> {return acc + cur},0)/data['DATA_SETUP_TIME'].length/1000).toFixed(3))
                expect(DST_AVG).to.be.eq(0.458)
            }
        })
    })

    it('LOAD FDD PSDL FILE | PDSCH_BLER',()=>{
        const directory = './server-test/logfiles/FDD_LTE_PSDL';
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
                expect(data['PDSCH_BLER']).to.be.an('array').have.lengthOf(883)
                const BLER = parseFloat((data['PDSCH_BLER'].reduce((acc,cur)=> {return acc + cur},0)/data['PDSCH_BLER'].length).toFixed(2))
                expect(BLER).to.be.eq(9.34)
                //expect(DST_AVG).to.be.eq(0.458)
            }
        })
    })

    it('LOAD FDD PSUL FILE | APPLICATION_THROUGHPUT_UPLINK',()=>{
        const directory = './server-test/logfiles/FDD_LTE_PSUL';
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
                expect(data['UL_TP']).to.be.an('array').have.lengthOf(349)
                const UL_AVG = parseFloat((data['UL_TP'].reduce((acc,cur)=> {return acc + cur},0)/data['UL_TP'].length/1000).toFixed(3))
                expect(UL_AVG).to.be.eq(6117.528)
            }
        })
    })

    it('LOAD FDD VOLTE FILE | VOLTE_CALL',()=>{
        const directory = './server-test/logfiles/FDD_VOLTE_MOC';
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
                expect(data['VOLTE_CALL_ATTEMPT']).to.be.an('array').have.lengthOf(10)
                expect(data['VOLTE_CALL_CONNECTED']).to.be.an('array').have.lengthOf(10)
                expect(data['VOLTE_CALL_DROP']).to.be.an('array').have.lengthOf(0)
            }
        })
    })

    it('LOAD FDD VOLTE MOC FILE | AUDIO_QUALITY_MOS',()=>{
        const directory = './server-test/logfiles/FDD_VOLTE_MOC';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['AUDIO_QUALITY_MOS'],{fileBuffer:bufferArray,nemo_opts:{vq_type_dl:'any'}}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['AUDIO_QUALITY_MOS']
                expect(data).to.have.keys(['MOS_QUALITY'])
                expect(data['MOS_QUALITY']).to.be.an('array').have.lengthOf(14)
                const MOSAVG = parseFloat((data['MOS_QUALITY'].reduce((acc,cur)=> {return acc + cur},0)/data['MOS_QUALITY'].length).toFixed(3))
                expect(MOSAVG).to.be.eq(3.811)
            }
        })
    })

    it('LOAD FDD VOLTE MTC FILE | AUDIO_QUALITY_MOS',()=>{
        const directory = './server-test/logfiles/FDD_VOLTE_MTC';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['AUDIO_QUALITY_MOS'],{fileBuffer:bufferArray,nemo_opts:{vq_type_dl:'any'}}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                let data = result['AUDIO_QUALITY_MOS']
                expect(data).to.have.keys(['MOS_QUALITY'])
                expect(data['MOS_QUALITY']).to.be.an('array').have.lengthOf(28)
                const MOSAVG = parseFloat((data['MOS_QUALITY'].reduce((acc,cur)=> {return acc + cur},0)/data['MOS_QUALITY'].length).toFixed(3))
                expect(MOSAVG).to.be.eq(3.839)
            }
        })
    })

    it('LOAD FDD_CSFB MOC FILE | CSFB_CALL',()=>{
        const directory = './server-test/logfiles/FDD_CSFB_MOC';
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
                //console.log(`ATTEMPT: ${data['CSFB_CALL_ATTEMPT'].length} | CONNECTED: ${data['CSFB_CALL_CONNECTED'].length} | DROP: ${data['CSFB_CALL_DROP'].length}`)
                expect(data).to.have.keys(['CSFB_CALL_ATTEMPT','CSFB_CALL_CONNECTED','CSFB_CALL_DROP'])
                expect(data['CSFB_CALL_ATTEMPT']).to.be.an('array').have.lengthOf(4)
                expect(data['CSFB_CALL_CONNECTED']).to.be.an('array').have.lengthOf(4)
                expect(data['CSFB_CALL_DROP']).to.be.an('array').have.lengthOf(0)
                const CSBF_ST = parseFloat((data['CSFB_CALL_CONNECTED'].reduce((acc,cur)=>{return acc + cur.SETUP_TIME},0)/data['CSFB_CALL_CONNECTED'].length/1000).toFixed(3))
                expect(CSBF_ST).to.be.eq(10.285)
            }
        })
    })

    it('LOAD FDD_CSFB MTC FILE | CSFB_CALL',()=>{
        const directory = './server-test/logfiles/FDD_CSFB_MTC';
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
                //console.log(`ATTEMPT: ${data['CSFB_CALL_ATTEMPT'].length} | CONNECTED: ${data['CSFB_CALL_CONNECTED'].length} | DROP: ${data['CSFB_CALL_DROP'].length}`)
                expect(data).to.have.keys(['CSFB_CALL_ATTEMPT','CSFB_CALL_CONNECTED','CSFB_CALL_DROP'])
                expect(data['CSFB_CALL_ATTEMPT']).to.be.an('array').have.lengthOf(5)
                expect(data['CSFB_CALL_CONNECTED']).to.be.an('array').have.lengthOf(5)
                expect(data['CSFB_CALL_DROP']).to.be.an('array').have.lengthOf(0)
                const CSBF_ST = parseFloat((data['CSFB_CALL_CONNECTED'].reduce((acc,cur)=>{return acc + cur.SETUP_TIME},0)/data['CSFB_CALL_CONNECTED'].length/1000).toFixed(3))
                //console.log(data['CSFB_CALL_CONNECTED'].map(entry => entry.SETUP_TIME))
                expect(CSBF_ST).to.be.eq(5.554)
            }
        })
    })
})

describe('DIGI SSV SCANNER TEST',()=>{
    it('LOAD FDD SCANNER FILE | LTE_FDD_SCANNER_MEASUREMENT',()=>{
        const testClass = new NemoParser();
        testClass.displayGrid(['LTE_FDD_SCANNER_MEASUREMENT'],{fileBuffer:parseDirectoryLogfile('./server-test/logfiles/FDD_SCANNER_SSV')}).subscribe((res)=>{
            //console.log(result)
            if(res.status === "OK"){
                let result = res.result
                let data = result['LTE_FDD_SCANNER_MEASUREMENT']
                //console.log(`RSCP: ${data['SCANNER_RSCP'].length} | ECNO: ${data['SCANNER_ECNO'].length}`)
                expect(data).to.have.keys(['SCANNER_RSRP','SCANNER_CINR','SCANNER_RSRQ'])
                //expect(data['SCANNER_RSCP']).to.be.an('array').lengthOf(4387)
                //expect(data['SCANNER_ECNO']).to.be.an('array').lengthOf(4387)

                
                //const RSCP_AVG = parseFloat((data['SCANNER_RSCP'].reduce((acc,cur)=> {return acc + cur.RSCP},0)/data['SCANNER_RSCP'].length).toFixed(3))
                //expect(RSCP_AVG).to.be.eq(-59.523)
                //const ECNO_AVG = parseFloat((data['SCANNER_ECNO'].reduce((acc,cur)=> {return acc + cur.ECNO},0)/data['SCANNER_ECNO'].length).toFixed(3))
                //expect(ECNO_AVG).to.be.eq(-9.274)
            }
        })
    })
})


describe('LTE TDD FILE PARSING & KPI CHECK',() => {
    it('LOAD TDD SCANNER FILE | LTE_TDD_SCANNER_MEASUREMENT',()=>{
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
        const directory = './server-test/logfiles/TDD_PSDL';
        let bufferArray:LogfileBuffer[] = []

        readdirSync(directory).forEach(file =>{
            const fileBuffer = readFileSync(`${directory}/${file}`,{encoding:'utf-8'})
            const logfileBuffer:LogfileBuffer = new LogfileBuffer(fileBuffer,file)
            bufferArray.push(logfileBuffer)
        })

        const testClass = new NemoParser();
        testClass.displayGrid(['APPLICATION_THROUGHPUT_DOWNLINK'],{fileBuffer:bufferArray,nemo_opts:{sinr_value:0}}).subscribe((res)=>{
            if(res.status === "OK"){
                let result = res.result
                for(let i of Object.keys(result)){
                    expect(result[i]).to.have.keys(['DL_TP','DL_TP_SNR'])
                    expect(result[i]['DL_TP']).to.be.an('array').have.lengthOf.greaterThan(0)
                    expect(result[i]['DL_TP_SNR']).to.be.an('array').have.lengthOf.greaterThan(0)
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

describe('DTAC FDD KPI TEST',()=>{
    it('LOAD TDD_CSFB_FULL FILE | CSFB_CALL',()=>{
        const directory = './server-test/logfiles/TDD_CSFB_FULL';
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
                //console.log(`ATTEMPT: ${data['CSFB_CALL_ATTEMPT'].length} | CONNECTED: ${data['CSFB_CALL_CONNECTED'].length} | DROP: ${data['CSFB_CALL_DROP'].length}`)
                expect(data).to.have.keys(['CSFB_CALL_ATTEMPT','CSFB_CALL_CONNECTED','CSFB_CALL_DROP'])
                expect(data['CSFB_CALL_ATTEMPT']).to.be.an('array').have.lengthOf(175)
                expect(data['CSFB_CALL_CONNECTED']).to.be.an('array').have.lengthOf(173)
                expect(data['CSFB_CALL_DROP']).to.be.an('array').have.lengthOf(0)
            }
        })
    })
})

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
                expect(data['CSFB_CALL_ATTEMPT']).to.be.an('array') //.have.lengthOf.greaterThan(0)
                expect(data['CSFB_CALL_CONNECTED']).to.be.an('array') //.have.lengthOf.greaterThan(0)
                expect(data['CSFB_CALL_DROP']).to.be.an('array')
            }
        })
    })
})




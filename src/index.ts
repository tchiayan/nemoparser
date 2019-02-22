import * as DECODER from './shared/nemo_decoder'
import {Observable,Observer, Subscription} from 'rxjs'
import {ParseLogfileStatus} from './model/model'
import {NemoParameterGrid} from './shared/nemo_parameter_grid'
import { readFileSync } from 'fs'

export interface LogfileBuffer {
    data: string,
    filename: string
}

export class LogfileBuffer {
    constructor(data:string,filename:string){
        return {data:data,filename:filename}
    }

    
}

export class NemoParser {
    nemoParamGrid:NemoParameterGrid = new NemoParameterGrid()

    constructor(){
        
    }

    private getInfo(cols: string[], format: any, extras: any = null, skip_null: boolean = true): any {
        let filter:any[] = []
        Object.keys(format.filter).forEach((c)=>{
            const _c = parseInt(c)
            if (!cols[_c]) {
                filter.push(false)
            } else if (typeof format.filter[_c] === 'object') {
                if (!isNaN(parseInt(cols[_c]))) {
                    filter.push(eval(cols[_c] + format.filter[c]['condition']))
                } else {
                    filter.push(false)
                }
            } else {
                filter.push(cols[_c] == format.filter[c])
            }
        })
        if (!filter.includes(false)) {
            let output = {}
            Object.keys(format.output).forEach(function (f) {
                if (f !== 'loop') {
                    if (typeof format.output[f] == 'string') {
                        output[f] = format.output[f]
                    } else {
                        output[f] = cols[format.output[f]]
                    }

                } else {
                    let n, p, s, c
                    if (typeof format.output[f]['n'] == 'object') {
                        // s = starting, p = seperationg,  n = number 
                        let st = format.output[f]['n']['s']
                        let nu = parseInt(cols[format.output[f]['n']['n']])
                        let sp = parseInt(cols[format.output[f]['n']['p']])
                        s = st + nu * sp + 2
                        n = parseInt(cols[st + nu * sp])
                        //console.log(st,nu,sp)
                    } else {
                        n = parseInt(cols[format.output[f]['n']])
                        s = format.output[f]['s']
                    }
                    p = format.output[f]['p']
                    c = format.output[f]['c']
                    output['loop'] = []
                    for (var i = 0; i < n; i++) {
                        var subfield = {}
                        Object.keys(c).forEach(function (field) {
                            var cf = c[field]
                            subfield[field] = cols[s + i * p + cf]
                            //subfield['rsrp'] = ""
                        })
                        if (extras) {
                            Object.assign(subfield, extras)
                            //if(subfield['EARFCN'] != output['EARFCN']) continue;
                        }
                        if (output['TIME'] == "06:27:40.650") console.log(subfield)
                        //check if any value is empty then skip for adding
                        if (skip_null) {
                            if (Object.values(subfield).includes("")) {
                                //console.log(subfield)
                                continue
                            }
                        }

                        output['loop'].push(subfield)
                    }
                }
            })
            return output
        } else {
            return false
        }
    } 

    private parseLogfile(files:FileList,extraction:any):Observable<ParseLogfileStatus>{
        let output = {}
        let filecount = files.length
        return Observable.create((observer:Observer<ParseLogfileStatus>)=>{
            for (let i = 0, f: File; f = files[i]; i++) {
                let reader = new FileReader()
                reader.onload = (log) => {
                    let lines = (reader.result as String).split("\n")
                    let GPS_RESULT = { LAT: 0, LON: 0 }
                    for (let j = 0, r; r = lines[j]; j++) {
                        let columns = r.split(",")
                        //console.log(columns)
                        if (columns[0] == 'GPS') {
                            GPS_RESULT = { LAT: parseFloat(columns[4]), LON: parseFloat(columns[3]) }
                        } else if (columns[0] in extraction) {
                            let result = this.getInfo(columns, extraction[columns[0]], null, false)
                            if (result) {
                                if (columns[0] in output) {
                                    /*if('TIME' in result){
                                        if(result.TIME==output[columns[0]][output[columns[0]].length-1].TIME){
                                            continue
                                        } 
                                    }*/
                                    output[columns[0]].push({ ...result, 'file': f.name, ...GPS_RESULT })
                                } else {
                                    output[columns[0]] = [{ ...result, 'file': f.name, ...GPS_RESULT }]
                                }
                            }
                        }
                    }
                    if (!--filecount) {
                        for (let type in extraction) {
                            if (!(type in output)) {
                                output[type] = []
                            }
                        }
                        observer.next({status:'OK',result:output})
                        observer.complete()
                        //this.workerCtx.postMessage({ status: 'OK', data: output })
                    } else {
                        observer.next({status:'PROGRESS',progress:filecount/files.length})
                        //this.workerCtx.postMessage({ status: 'PROGRESS', value: filecount / files.length })
                    }
                }
                reader.readAsText(f)
                //reader.readAsArrayBuffer(f)
            }
        })
        
    }

    private parseBuffer(buffers:LogfileBuffer[],extraction:any):Observable<ParseLogfileStatus>{
        let output = {}
        let totalBuffer = buffers.length
        let countBuffer = 1
        return Observable.create((observer:Observer<ParseLogfileStatus>)=>{
            for(let _buffer of buffers){
                let lines = _buffer.data.split("\n")
                let GPS_RESULT = { LAT: 0, LON: 0 }
                for (let j = 0, r; r = lines[j]; j++) {
                    let columns = r.split(",")
                    //console.log(columns)
                    if (columns[0] == 'GPS') {
                        GPS_RESULT = { LAT: parseFloat(columns[4]), LON: parseFloat(columns[3]) }
                    } else if (columns[0] in extraction) {
                        let result = this.getInfo(columns, extraction[columns[0]], null, false)
                        if (result) {
                            if (columns[0] in output) {
                                /*if('TIME' in result){
                                    if(result.TIME==output[columns[0]][output[columns[0]].length-1].TIME){
                                        continue
                                    } 
                                }*/
                                output[columns[0]].push({ ...result, 'file': _buffer.filename, ...GPS_RESULT })
                            } else {
                                output[columns[0]] = [{ ...result, 'file': _buffer.filename, ...GPS_RESULT }]
                            }
                        }
                    }
                }
                if (countBuffer === totalBuffer) {
                    for (let type in extraction) {
                        if (!(type in output)) {
                            output[type] = []
                        }
                    }
                    observer.next({status:'OK',result:output})
                    observer.complete()
                    //this.workerCtx.postMessage({ status: 'OK', data: output })
                } else {
                    observer.next({status:'PROGRESS',progress:countBuffer/totalBuffer})
                    //this.workerCtx.postMessage({ status: 'PROGRESS', value: filecount / files.length })
                }
                countBuffer++;
            }
        })
    }

    public displayGrid(nemo_params:string[],option:{fileBuffer?:LogfileBuffer[],files?:FileList}):Observable<any>{
        let extraction = {}
        let function_call:any[] = []
        for(let param of nemo_params){
            switch(param){
                case 'LTE_FDD_SCANNER_MEASUREMENT':
                    if(!('OFDMSCAN' in extraction)) extraction['OFDMSCAN'] = DECODER.LTE_FDD_SCANNER
                    break;

                case 'LTE_TDD_SCANNER_MEASUREMENT':
                    if(!('OFDMSCAN' in extraction)) extraction['OFDMSCAN'] = DECODER.LTE_TDD_SCANNER
                    break;

                case 'APPLICATION_THROUGHPUT_DOWNLINK_SINR_FILTER':
                    if(!('DRATE' in extraction)) extraction['DRATE'] = DECODER.DRATE_DL
                    if(!('CI' in extraction)) extraction['CI'] = DECODER.UE_LTE_CI
                    if(!('DREQ' in extraction)) extraction['DREQ'] = DECODER.UE_DATA_TRANSFER_ATTEMPT
                    if(!('DCOMP' in extraction)) extraction['DCOMP'] = DECODER.UE_DATA_TRANSFER_COMPLETE
                    break;

                case 'APPLICATION_THROUGHPUT_UPLINK':
                    if(!('DRATE' in extraction)) extraction['DRATE'] = DECODER.DRATE_UL
                    if(!('DREQ' in extraction)) extraction['DREQ'] = DECODER.UE_DATA_TRANSFER_ATTEMPT
                    break;

                case 'ATTACH_ATTEMPT':
                    if(!('GAA' in extraction)) extraction['GAA'] = DECODER.UE_GAA_ATTACH_ATTEMPT
                    break;

                case 'FTP_CONNECTION_ATTEMPT':
                    if(!('DAA' in extraction)) extraction['DAA'] = DECODER.UE_DAA
                    break;

                case 'INTRA_HANDOVER':
                    if(!('HOA' in extraction)) extraction['HOA'] = DECODER.UE_HOA
                    if(!('HOS' in extraction)) extraction['HOS'] = DECODER.UE_HOS
                    break;

                case 'IRAT_HANDOVER':
                    if(!('HOA' in extraction)) extraction['HOA'] = DECODER.UE_HOA
                    if(!('HOS' in extraction)) extraction['HOS'] = DECODER.UE_HOS
                    break;

                case 'VOLTE_CALL':
                    if(!('CAA' in extraction)) extraction['CAA'] = DECODER.UE_CAA
                    if(!('CAC' in extraction)) extraction['CAC'] = DECODER.UE_CAC
                    if(!('CAF' in extraction)) extraction['CAF'] = DECODER.UE_CAF
                    if(!('CAD' in extraction)) extraction['CAD'] = DECODER.UE_CAD
                    break;

                case 'CSFB_CALL':
                    if(!('CAA' in extraction)) extraction['CAA'] = DECODER.UE_CAA
                    if(!('CAC' in extraction)) extraction['CAC'] = DECODER.UE_CAC
                    if(!('CAF' in extraction)) extraction['CAF'] = DECODER.UE_CAF
                    if(!('CAD' in extraction)) extraction['CAD'] = DECODER.UE_CAD
                    break;
                
                case 'PDP_CONTEXT_SETUP':
                    if(!('PAA' in extraction)) extraction['PAA'] = DECODER.UE_PAA
                    if(!('PAC' in extraction)) extraction['PAC'] = DECODER.UE_PAC
                    if(!('PAD' in extraction)) extraction['PAD'] = DECODER.UE_PAD 
                    break;

                case 'DATA_CONNECTION_SETUP':
                    if(!('DAA' in extraction)) extraction['DAA'] = DECODER.UE_DAA
                    if(!('DAC' in extraction)) extraction['DAC'] = DECODER.UE_DAC
                    break;

                case 'TRACKING_AREA_UPDATE':
                    if(!('TUA' in extraction)) extraction['TUA'] = DECODER.UE_TUA
                    if(!('TUS' in extraction)) extraction['TUS'] = DECODER.UE_TUS
                    break;
                
                case 'PDSCH_BLER':
                    if(!('PHRATE' in extraction)) extraction['PHRATE'] = DECODER.UE_BLER
                    break;

                case 'AUDIO_QUALITY_MOS':
                    if(!('AQDL' in extraction)) extraction['AQDL'] = DECODER.UE_AUDIO_MOS

            }
        }
        
        return Observable.create((observer)=>{
            let subFunction = (data:ParseLogfileStatus) => {
                //console.log(data)
                if(data.status == 'OK'){
                    observer.next({status:'CALCULATING'})
                    let result = {}
                    for(let param of nemo_params){
                        switch(param){
                            case 'LTE_FDD_SCANNER_MEASUREMENT':
                                result[param] = new NemoParameterGrid().nemo_scanner_measurement(data.result)
                                break;
                            case 'LTE_TDD_SCANNER_MEASUREMENT':
                                result[param] = new NemoParameterGrid().nemo_scanner_measurement(data.result)
                                break;
                            case 'APPLICATION_THROUGHPUT_DOWNLINK_SINR_FILTER':
                                result[param] = new NemoParameterGrid().nemo_application_throughput_downlink_filter_sinr(data.result,0)
                                break;
                            case 'APPLICATION_THROUGHPUT_UPLINK':
                                result[param] = new NemoParameterGrid().nemo_application_throughput_uplink(data.result)
                                break;
                            case 'ATTACH_ATTEMPT':
                                result[param] = new NemoParameterGrid().nemo_attach_attempt(data.result)
                                break;
                            case 'FTP_CONNECTION_ATTEMPT':
                                result[param] = new NemoParameterGrid().nemo_ftp_server_connection_attempt(data.result);
                                break;
                            case 'INTRA_HANDOVER':
                                result[param] = new NemoParameterGrid().nemo_intra_handover(data.result)
                                break;
                            case 'IRAT_HANDOVER':
                                result[param] = new NemoParameterGrid().nemo_irat_handover(data.result)
                                break;
                            case 'VOLTE_CALL':
                                result[param] = new NemoParameterGrid().nemo_volte_call(data.result)
                                break;
                            case 'CSFB_CALL':
                                result[param] = new NemoParameterGrid().nemo_csfb_call(data.result)
                                break;
                            case 'PDP_CONTEXT_SETUP':
                                result[param] = new NemoParameterGrid().nemo_packet_data_setup(data.result)
                                break;
                            case 'DATA_CONNECTION_SETUP':
                                result[param] = new NemoParameterGrid().nemo_data_server_setup(data.result)
                                break;
                            case 'TRACKING_AREA_UPDATE':
                                result[param] = new NemoParameterGrid().nemo_tracking_area_update(data.result)
                                break;
                            case 'PDSCH_BLER':
                                result[param] = new NemoParameterGrid().nemo_pdsch_bler(data.result)
                                break;
                        }
                    }
                    observer.next({status:'OK',result:result})
                    observer.complete()
                }else if(data.status == 'PROGRESS'){
                    observer.next({status:'PARSING',progress:data.progress})
                }else{
                    observer.error()
                    return "ERROR!"
                }
            }
            if(option.fileBuffer){
                this.parseBuffer(option.fileBuffer,extraction).subscribe(subFunction)
            }else if(option.files){
                this.parseLogfile(option.files,extraction).subscribe(subFunction)
            }
        })
        
    }
}
import * as DECODER from './shared/nemo_decoder'
import {Observable,Observer} from 'rxjs'
import {ParseLogfileStatus} from './model/model'
import {NemoParameterGrid} from './shared/nemo_parameter_grid'

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

    public displayGrid(nemo_params:string[],files:FileList):any{
        let extraction = {}
        let function_call:any[] = []
        for(let param of nemo_params){
            switch(param){
                case 'LTE_FDD_SCANNER_MEASUREMENT':
                    extraction['OFDMSCAN'] = DECODER.LTE_FDD_SCANNER
                    function_call.push({
                        TRIGGER:'LTE_FDD_SCANNER_MEASUREMENT',
                        FUNCTION:this.nemoParamGrid.nemo_scanner_measurement
                    })
            }
        }

        this.parseLogfile(files,extraction).subscribe((data:ParseLogfileStatus)=>{
            if(data.status == 'OK'){
                let result = {}
                for(let _f of function_call){
                    result[_f.TRIGGER] = _f.FUNCTION()
                }
                return result
            }else if(data.status == 'PROGRESS'){

            }else{
                return "ERROR!"
            }
        })
    }
}
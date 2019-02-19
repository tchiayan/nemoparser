export class NemoParameterGrid {
    constructor(){}

    private nemo_scanner_field_n_best(data,field:string):any[]{
        let rfield = data.map((entry,index,array)=>{
            //let empty_field = {}
            //empty_field[field] = ''
            
            let top_field = {}
            top_field[field] = ''
            if(entry.loop.length!==0){
                let top_list = entry.loop.filter((meas)=>meas[field] !== '')
                if(top_list.length !==0){
                    let top_meas = top_list.map((meas)=>{
                        let temp = {}
                        temp[field] = parseFloat(meas[field])
                        return temp
                    }).sort((a,b)=>b[field] - a[field])[0]
                    top_field[field] = top_meas[field]
                }
            }
            /*let top_field = entry.loop.length!==0?entry.loop.filter((meas)=>meas[field] !== '')
                .map((meas)=>{
                    let temp = {}
                    temp[field] = parseFloat(meas[field])
                    return temp
                }).sort((a,b)=>b[field] - a[field])[0]:empty_field*/
            return {...top_field,
                TIME:entry.TIME,CH:entry.EARFCN,file:entry.file,LAT:entry.LAT,LON:entry.LON}
        }).map((entry,index,array)=>{ // replace empty value
            if(entry[field] !== ''){
                return entry
            }else{
                let ch = entry.CH
                let i = --index
                while(array[i].CH !== ch){--i;}
                let new_entry = {...entry}
                new_entry[field] = array[i][field]
                return new_entry
            }
            
        }).filter(entry => entry[field] !== "").map((entry,index,array)=>{
            if(index!==array.length-1){
                if(entry.TIME == array[index+1].TIME){
                    if(array[index+1][field] < entry[field])
                    {
                        array[index+1][field] = entry[field];
                        array[index+1].CH = entry.CH
                        array[index+1].LAT = entry.LAT
                        array[index+1].LON = entry.LON
                    }
                } // return duplicated and pass the maxvalue to next duplicated value
            }
            return {...entry,
                duplicate:index!==array.length-1?array[index+1].TIME == entry.TIME:false}
        }).filter(entry => !entry.duplicate).map((entry,index,array)=>{
            let compare = [entry.CH];
            let i = index-1;
            //console.log('current ch: '+array[i].CH)
            while(i!==-1){
                if(compare.includes(array[i].CH)){i++;break;}
                //console.log('push ch:'+array[i].CH)
                compare.push(array[i].CH)
                --i
            }
            i = i!=-1?i:0
            let max = array.slice(i,index+1).reduce((acc,cur)=>{
                if(acc){
                    return cur[field] > acc[field]? cur:acc
                }else{
                    return cur
                }
            },null)
            //console.log(`BEFORE: ${max.TIME} | ${entry.TIME}`)
            max.TIME = entry.TIME
            //console.log(`AFTER: ${max.RSRP} | ${max.TIME} | ${max.CH}`)
            //console.log(max)
            max.LAT = entry.LAT
            //console.log(`${entry.LON}|${entry.LAT}`)
            max.LON = entry.LON
            return {...max}
        })
        
        //console.table(rfield)
        return rfield
    }

    private GetEpochTime(timeString) {
        return Date.parse(`1970-01-01T${timeString}Z`)
    }

    nemo_scanner_measurement(data){
        //console.time("nemo_scanner_measurement")
        //let OFDMSCAN = filter.area?data.OFDMSCAN.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })):data.OFDMSCAN
        if (!data.OFDMSCAN) throw console.error('OFDMSCAN is not decoded while parsing logfile. Consider update decoder field.');
        
        let OFDMSCAN = data.OFDMSCAN

        let files = Array.from(new Set(OFDMSCAN.map(entry => entry.file)))
        let RSRP:any[] = []
        let CINR:any[] = []
        let RSRQ:any[] = []
        for(let file of files){
            let filter_data = data.OFDMSCAN.filter((entry) => entry.file == file)
            RSRP = [...RSRP,...this.nemo_scanner_field_n_best(filter_data,'RSRP')]
            CINR = [...CINR,...this.nemo_scanner_field_n_best(filter_data,'CINR')]
            RSRQ = [...RSRQ,...this.nemo_scanner_field_n_best(filter_data,'RSRQ')]
        }

        //console.timeEnd("nemo_scanner_measurement")
        return {'SCANNER_RSRP':RSRP,'SCANNER_CINR':CINR,'SCANNER_RSRQ':RSRQ}
    }

    nemo_application_throughput_downlink_filter_sinr(data,sinr_value:number){
        //console.time("nemo_application_throughput_downlink_filter_sinr")
        if (!data.DRATE) throw console.error('DRATE is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CI) throw console.error('CI is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.DREQ) throw console.error('DREQ is not decoded while parsing logfile. Consider update decoder field.')

        data.DRATE = data.DRATE.map(entry => { return { ...entry, ETIME: this.GetEpochTime(entry.TIME) } })
        let file_list = Array.from(new Set(data.DRATE.map(entry => entry.file)))
        let temp_DRATE:any = []
        for(let file of file_list){
            let temp_drate = data.DRATE.filter(entry => entry.file == file).sort((a,b)=>a.ETIME - b.ETIME)
            //console.log(temp_drate)
            for (let i = temp_drate.length - 1; i >= 0; i--) {
                if (!(i == 0)) {
                    temp_drate[i].LAT = temp_drate[i - 1].LAT
                    temp_drate[i].LON = temp_drate[i - 1].LON
                    temp_drate[i].TIME = temp_drate[i - 1].TIME
                    temp_drate[i]['duplicate'] = temp_drate[i].ETIME == temp_drate[i - 1].ETIME
                    temp_drate[i].ETIME = this.GetEpochTime(temp_drate[i].TIME)
                } else {
                    let DREQ = data.DREQ.find(entry => entry.file == temp_drate[i].file)
                    temp_drate[i].LAT = DREQ.LAT
                    temp_drate[i].LON = DREQ.LON
                    temp_drate[i].TIME = DREQ.TIME
                    temp_drate[i].ETIME = this.GetEpochTime(temp_drate[i].TIME)
                    temp_drate[i]['duplicate'] = false
                }
            }
            temp_DRATE = [...temp_DRATE, ...temp_drate]
        }       
        data.DRATE = temp_DRATE
        data.DRATE.sort((a, b) => a.ETIME - b.ETIME)
        data.DRATE = data.DRATE.filter(entry => !entry.duplicate)

        //data.DRATE.sort((a, b) => b.ETIME - a.ETIME)
        let DL_SNR:any[] = []
        if(data.CI){
            // attach CINR to dl throughput
            //console.time("nemo_dl_snr_attach")

            //Get file list
            let file_list = Array.from(new Set(data.DRATE.map(entry => entry.file)))

            //Process file
            for(let file of file_list){
                
                var SINR  = data.CI.filter(entry => entry.CELLTYPE === '0' && entry.file === file).map(entry =>{
                    return {TIME:entry.TIME,ETIME:this.GetEpochTime(entry.TIME),file:entry.file,CELLTYPE:entry.CELLTYPE,CINR:parseFloat(entry.CINR)}
                }).sort((a,b)=> a.ETIME - b.ETIME)//.filter(entry => entry.ETIME >= DRATE[0].ETIME - 500)
                //console.log('TEST')
                //console.log("SINR value")
                //console.log(data.CI)
                if(!SINR.find(entry => entry.CINR >= sinr_value)){
                    continue;
                }
                let FIRST_PASS = SINR.find(entry => entry.CINR >= sinr_value).ETIME
                const DRATE = data.DRATE.filter(entry => entry.file === file).sort((a,b) => a.ETIME - b.ETIME).filter(entry => entry.ETIME >= FIRST_PASS)
                SINR = SINR.filter(entry => entry.ETIME >= DRATE[0].ETIME - 500)

                let SINR_CURSOR = 0
                //console.log(DRATE)
                //console.log(`STARTING CURSOR IS ${SINR_CURSOR} | TIME ${SINR[SINR_CURSOR].TIME} | DRATE TIME | ${DRATE[0].TIME} | MEASUREMENT | ${DRATE[0].file}`)
                for(let i = 0; i < DRATE.length-1 ; i++){
                    let DLSNR:any = []
                    let FIRST_ENTRY = true
                    //console.log(`Current DL Time: ${DRATE[i].TIME} [${DRATE[i].ETIME}] | Next DL Time: ${DRATE[i+1].TIME} [${DRATE[i+1].ETIME}] Found table below`)
                    while(DRATE[i+1].ETIME >= SINR[SINR_CURSOR].ETIME){
                        if(DRATE[i].ETIME <= SINR[SINR_CURSOR].ETIME){
                            if(FIRST_ENTRY){
                                if(i==0){
                                    let temp_SINR:any[] = []
                                    let j = 0
                                    while(j !== SINR_CURSOR){
                                        //console.log(`${DRATE[i].ETIME-1000} >= ${SINR[j].ETIME} | ${DRATE[i].ETIME-1000>=SINR[j].ETIME} | ${SINR[j].CINR}`)
                                        temp_SINR.push(SINR[j].CINR)
                                        j++;
                                    }
                                    DLSNR.push(Math.max(...temp_SINR))
                                }else{
                                    
                                    DLSNR.push(SINR[SINR_CURSOR-1].CINR)
                                }
                                
                                FIRST_ENTRY = false
                            }
                            DLSNR.push(SINR[SINR_CURSOR].CINR)
                        }
                        SINR_CURSOR++;
                    }
                    //console.table(DLSNR)
                    //if(DRATE[i].TIME == '11:02:12.434'){console.table(DRATE[i])}
                    if(i==0){
                        DRATE[i]['CINR'] = Math.max(DLSNR[0],DLSNR[DLSNR.length-1])
                        DRATE[i]['CINR_INDEX'] = DLSNR[0] >= sinr_value ? 0 : 1
                    }else{
                        DRATE[i]['CINR'] = Math.max(DLSNR[0],DLSNR[DLSNR.length-1])
                        DRATE[i]['CINR_INDEX'] = DLSNR.indexOf(DRATE[i]['CINR'])
                        
                    }
                    DRATE[i]['INDEX'] = i
                }

                //attach SINR to last DRATE
                let FIRST_ENTRY = true;
                let DLSNR1:any[] = []
                let DCOMP = data.DCOMP.find(entry => entry.file == file)?this.GetEpochTime(data.DCOMP.find(entry => entry.file == file).TIME):SINR[SINR_CURSOR].ETIME + 2000
                //console.table(DCOMP)
                while(SINR_CURSOR < SINR.length){
                    if((DRATE[DRATE.length-1].ETIME <= SINR[SINR_CURSOR].ETIME) && (SINR[SINR_CURSOR].ETIME <= DCOMP)){
                        if(FIRST_ENTRY){
                            DLSNR1.push(SINR[SINR_CURSOR-1].CINR)
                            FIRST_ENTRY = false;
                        }
                        //console.log(`${SINR[SINR_CURSOR].CINR}|${SINR[SINR_CURSOR].TIME}|${DRATE[DRATE.length-1].TIME}`)
                        DLSNR1.push(SINR[SINR_CURSOR].CINR)
                    }
                    SINR_CURSOR++;
                }
                //console.table(DLSNR1)
                DRATE[DRATE.length-1]['CINR'] = Math.max(DLSNR1[0],DLSNR1[DLSNR1.length-1])
                DRATE[DRATE.length-1]['CINR_INDEX'] = DLSNR1.indexOf(DRATE[DRATE.length-1]['CINR'])
                //DL_SNR = [...DL_SNR, ...DRATE.filter(x => x.CINR >= 10).filter((x,i) => !(i===0 && x.CINR_INDEX !==0))]
                DL_SNR = [...DL_SNR, ...DRATE.filter(x=> x.CINR >= sinr_value)]
                //console.log(DL_SNR)
                //DL_SNR = [...DL_SNR, ...DRATE]
            }

            //console.log(`Current DL Time: ${entry.TIME} [${entry.ETIME}] | Next DL Time: ${array[index+1].TIME} [${array[index+1].ETIME}] Found table below`)
            //console.table(CINR)

            //console.timeEnd("nemo_dl_snr_attach")
        }

        //let DL = filter.area ? data.DRATE.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : data.DRATE
        let DL = data.DRATE
        //console.log(DL_SNR)
        //DL_SNR = filter.area ? DL_SNR.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : DL_SNR
        //console.table(DL_SNR.filter(x => x.CINR >= 10 && !(x.INDEX===0 && x.CINR_INDEX ===0 )))
        //console.table(DL_SNR)
        DL_SNR = DL_SNR.map(x => {return {CINR:x.CINR,DL:parseInt(x.DL),TIME:x.TIME}})
        DL = DL.map(x => parseInt(x.DL))
        
        //console.log(`${DL_SNR.filter(x => x.DL >= 60000000).length}/${DL_SNR.length}`)
        //console.log(`${DL_SNR.filter(x => x.DL >= 60000000 && x.CINR >= 10).length}/${DL_SNR.filter(x => x.CINR >= 10).length}`)
        
        //padl max
        //let psdlmax = (Math.max(...DL) / 1000000).toFixed(2) + "Mbps"
        //let psdlavedl = (DL.filter(x => x >= 100000000).length / DL.length * 100).toFixed(2) + "%"

        //console.timeEnd('nemo_application_throughput_downlink_filter_sinr')
        return { DRATE:DL, DL_SNR:DL_SNR }
    }

    
}

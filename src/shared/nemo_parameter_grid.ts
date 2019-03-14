import * as turf from '@turf/turf'
//import { polygon } from '@turf/turf';

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
            }else{
                /*if(index - CH_COUNT >= 0){
                    if(array[index-CH_COUNT].loop.length !== 0){
                        let top_list = array[index-CH_COUNT].loop.filter((meas)=>meas[field] !== '')
                        if(top_list.length !==0){
                            let top_meas = top_list.map((meas)=>{
                                let temp = {}
                                temp[field] = parseFloat(meas[field])
                                return temp
                            }).sort((a,b)=>b[field] - a[field])[0]
                            top_field[field] = top_meas[field]
                        }
                    }else{
                        console.log(`Empty loop: ${entry.EARFCN} FILE: ${entry.file}`)
                    }
                }else{
                    console.log(`No early loop: ${entry.EARFCN} FILE: ${entry.file}`)
                }*/
            }
            return {...top_field,
                TIME:entry.TIME,CH:entry.EARFCN,FILE:entry.file,LAT:entry.LAT,LON:entry.LON}
        })
        
        const CH_COUNT = Array.from(new Set(data.map(entry => entry.EARFCN))).length
        //console.log(Array.from(new Set(data.map(entry => entry.EARFCN))))
        //console.log(CH_COUNT)

        rfield = CH_COUNT === 1? rfield: rfield.map((entry,index,array)=>{ // replace empty value
            if(entry[field] !== ''){
                return entry
            }else{
                let ch = entry.CH
                let i = --index
                //console.log(`${array.length}|${i}|File:${entry.FILE}`)
                if(i < 0) return entry
                while(array[i].CH !== ch && i >= 0){--i;if(i < 0) break;}
                if(i < 0) return entry
                let new_entry = {...entry}
                new_entry[field] = array[i][field]
                return new_entry
            }
        })
        
        rfield = rfield.filter(entry => entry[field] !== "").map((entry,index,array)=>{
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

    nemo_lte_scanner_measurement(data,opts:any){
        //console.time("nemo_scanner_measurement")
        
        if (!data.OFDMSCAN) throw console.error('OFDMSCAN is not decoded while parsing logfile. Consider update decoder field.');
        
        let OFDMSCAN = data.OFDMSCAN
        
        let files = Array.from(new Set(OFDMSCAN.map(entry => entry.file)))
        let RSRP:{RSRP:number,TIME:string,CH:string,FILE:string,LAT:number,LON:number,duplicate:boolean}[] = []
        let CINR:{CINR:number,TIME:string,CH:string,FILE:string,LAT:number,LON:number,duplicate:boolean}[] = []
        let RSRQ:{RSRQ:number,TIME:string,CH:string,FILE:string,LAT:number,LON:number,duplicate:boolean}[] = []
        for(let file of files){
            let filter_data = data.OFDMSCAN.filter((entry) => entry.file == file)

            /* filter channel */
            filter_data = ('filter_channel' in opts)? filter_data.filter((entry)=>opts.filter_channel.includes(entry.EARFCN)) : filter_data

            RSRP = [...RSRP,...this.nemo_scanner_field_n_best(filter_data,'RSRP')]
            CINR = [...CINR,...this.nemo_scanner_field_n_best(filter_data,'CINR')]
            RSRQ = [...RSRQ,...this.nemo_scanner_field_n_best(filter_data,'RSRQ')]
        }

        RSRP = ('polygon' in opts)?RSRP.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: true })):RSRP
        CINR = ('polygon' in opts)?CINR.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: true })):CINR
        RSRQ = ('polygon' in opts)?RSRQ.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: true })):RSRQ

        //console.timeEnd("nemo_scanner_measurement")
        return {'SCANNER_RSRP':RSRP,'SCANNER_CINR':CINR,'SCANNER_RSRQ':RSRQ}
    }

    nemo_umts_scanner_measurement(data,opts:any){
        //console.time("nemo_scanner_measurement")
        
        if (!data.PILOTSCAN) throw console.error('PILOTSCAN is not decoded while parsing logfile. Consider update decoder field.');
        
        let PILOTSCAN = data.PILOTSCAN
        
        let files = Array.from(new Set(PILOTSCAN.map(entry => entry.file)))
        let RSCP:any[] = []
        let ECNO:any[] = []
        for(let file of files){
            let filter_data = data.PILOTSCAN.filter((entry) => entry.file == file)

            /* filter channel */
            filter_data = ('filter_channel' in opts)? filter_data.filter((entry)=>opts.filter_channel.includes(entry.EARFCN)) : filter_data

            RSCP = [...RSCP,...this.nemo_scanner_field_n_best(filter_data,'RSCP')]
            ECNO = [...ECNO,...this.nemo_scanner_field_n_best(filter_data,'ECNO')]
        }

        RSCP = ('polygon' in opts)?RSCP.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: true })):RSCP
        ECNO = ('polygon' in opts)?ECNO.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: true })):ECNO

        //console.timeEnd("nemo_scanner_measurement")
        return {'SCANNER_RSCP':RSCP,'SCANNER_ECNO':ECNO}
    }

    nemo_application_throughput_downlink_filter_sinr(data,opts:any){

        //console.time("nemo_application_throughput_downlink_filter_sinr")
        if (!data.DRATE) throw console.error('DRATE is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CI) throw console.error('CI is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.DREQ) throw console.error('DREQ is not decoded while parsing logfile. Consider update decoder field.')
        if (!data.DCOMP) throw console.error('DCOMP is not decoded while parsing logfile. Consider update decoder field.')

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
        let extras_result: any = {}
        if(data.CI && ('sinr_value' in opts)){
            let sinr_value:number = opts.sinr_value;
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
                //console.log(SINR.find(entry => entry.CINR >= sinr_value))
                let FIRST_PASS = SINR.find(entry => entry.CINR >= sinr_value).ETIME
                //console.log(FIRST_PASS)
                const DRATE = data.DRATE.filter(entry => entry.file === file).sort((a,b) => a.ETIME - b.ETIME).filter(entry => entry.ETIME >= FIRST_PASS)
                //console.log(DRATE[0])
                if(DRATE.length === 0){
                    continue;
                }
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

        let DL = ('polygon' in opts) ? data.DRATE.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false })) : data.DRATE
        DL_SNR = ('polygon' in opts) ? DL_SNR.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false })) : DL_SNR
        //console.table(DL_SNR.filter(x => x.CINR >= 10 && !(x.INDEX===0 && x.CINR_INDEX ===0 )))
        //console.table(DL_SNR)
        if(('sinr_value' in opts)){
            DL_SNR = DL_SNR.map(x => {return {CINR:x.CINR,DL:parseInt(x.DL),TIME:x.TIME}})
            extras_result['DL_TP_SNR'] = DL_SNR
        }
        
        DL = DL.map(x => parseInt(x.DL))
        let DL_TP_LOC = DL.map((entry)=>{
            return {DL:parseInt(entry.DL),TIME:entry.TIME,LAT:entry.LAT,LON:entry.LON,FILE:entry.file}
        })
        //console.log(`${DL_SNR.filter(x => x.DL >= 60000000).length}/${DL_SNR.length}`)
        //console.log(`${DL_SNR.filter(x => x.DL >= 60000000 && x.CINR >= 10).length}/${DL_SNR.filter(x => x.CINR >= 10).length}`)
        
        //padl max
        //let psdlmax = (Math.max(...DL) / 1000000).toFixed(2) + "Mbps"
        //let psdlavedl = (DL.filter(x => x >= 100000000).length / DL.length * 100).toFixed(2) + "%"

        //console.timeEnd('nemo_application_throughput_downlink_filter_sinr')
        return { DL_TP:DL,DL_TP_LOC:DL_TP_LOC, ...extras_result }
    }

    nemo_application_throughput_uplink(data, opts:any) {
        //shift time location
        //console.time("shiftLoc")
        if (!data.DRATE) throw console.error('DRATE is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.DREQ) throw console.error('DREQ is not decoded while parsing logfile. Consider update decoder field.');

        data.DRATE = data.DRATE.map(entry => { return { ...entry, ETIME: this.GetEpochTime(entry.TIME) } })

        let file_list = Array.from(new Set(data.DRATE.map(entry => entry.file)))
        let temp_DRATE:any[] = []
        for(let file of file_list){
            let temp_drate = data.DRATE.filter(entry => entry.file == file).sort((a,b)=>a.ETIME - b.ETIME)
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
                    //console.table(temp_drate[i])
                }
            }
            temp_DRATE = [...temp_DRATE, ...temp_drate]
        }       
        data.DRATE = temp_DRATE
        data.DRATE.sort((a, b) => a.ETIME - b.ETIME)
        data.DRATE = data.DRATE.filter(entry => !entry.duplicate)
        //console.timeEnd("shiftLoc")

        //console.time("nemo_application_throughput_uplink")
        //let UL = filter.area ? data.DRATE.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : data.DRATE
        let UL = data.DRATE
        if(opts){  
            UL = ('polygon' in opts)?data.DRATE.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false })):data.DRATE
        }
        
        UL = UL.map(x => parseInt(x.UL))

        //padl max
        //let psdlmax = (Math.max(...DL) / 1000000).toFixed(2) + "Mbps"
        //let psdlavedl = (DL.filter(x => x >= 100000000).length / DL.length * 100).toFixed(2) + "%"
        //console.timeEnd("nemo_application_throughput_uplink")

        return {UL_TP:  UL}
    }

    nemo_attach_attempt(data, opts: any) {
        
        if (!data.GAA) throw console.error('GAA is not decoded while parsing logfile. Consider update decoder field.');

        //let GAA = filter.area ? data.GAA.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : data.GAA
        //let GAA = data.GAA 
        let GAA = ('polygon' in opts)?data.GAA.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false })):data.GAA

        return { ATTACH_ATTEMPT : GAA.length }
    }

    nemo_ftp_server_connection_attempt(data, opts:any){

        if (!data.DAA) throw console.error('DAA is not decoded while parsing logfile. Consider update decoder field.');

        //let DAA = filter.area ? data.DAA.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]),filter.area, {ignoreBoundary:false})) : data.DAA
        //let DAA = data.DAA
        let DAA = ('polygon' in opts)?data.DAA.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false })):data.DAA

        return { FTP_CONNECT_ATTEMPT: DAA.length }
    }

    nemo_intra_handover(data, opts: any): any {
        //console.time("nemo_intra_handover")
        if (!data.HOA) throw console.error('HOA is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.HOS) throw console.error('HOS is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.HOF) throw console.error('HOF is not decoded while parsing logfile. Consider update decoder field. ')

        let intra_handover_attempt = data.HOA.filter(entry => ['901', '902', '903'].includes(entry.HO_TYPE))

        //filter HOA within the polygon if any
        //if (filter.area) {
        //    intra_handover_attempt = intra_handover_attempt.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false }))
        //}
        if ('polygon' in opts) {
            intra_handover_attempt = intra_handover_attempt.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }))
        }

        let intra_handover_failure = data.HOF.filter((entry) => {
            return intra_handover_attempt.find((hoa_entry) => {
                return hoa_entry.file == entry.file && hoa_entry.HO_CONTEXT.trim() == entry.HO_CONTEXT.trim()
            })
        }).map((entry)=>{
            return {FILE:entry.file,LAT:entry.LAT,LON:entry.LON}
        })

        if ('polygon' in opts) {
            intra_handover_failure = intra_handover_failure.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }))
        }

        let intra_handover_success = data.HOS.filter((entry) => {
            return intra_handover_attempt.find((hoa_entry) => {
                return hoa_entry.file == entry.file && hoa_entry.HO_CONTEXT.trim() == entry.HO_CONTEXT.trim()
            })
        }).map((entry)=>{
            return {FILE:entry.file,LAT:entry.LAT,LON:entry.LON}
        })
        
        //if (filter.area) {
        //    intra_handover_success = intra_handover_success.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false }))
            //warning - attempt in polygon but success not within the polygon will cause incorrect kpi
        //}

        if ('polygon' in opts) {
            intra_handover_success = intra_handover_success.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }))
            //warning - attempt in polygon but success not within the polygon will cause incorrect kpi
        }

        intra_handover_attempt = intra_handover_attempt.map((entry)=>{
            return {FILE:entry.file,LAT:entry.LAT,LON:entry.LON}
        })
        
        return {    
            HANDOVER_SUCCESS: intra_handover_success.length, 
            HANDOVER_ATTEMPT: intra_handover_attempt.length,
            HO_ATTEMPT:intra_handover_attempt,
            HO_FAIL:intra_handover_failure,
            HO_SUCCESS:intra_handover_success
        }
    }

    nemo_irat_handover(data, opts: any): any {

        if (!data.HOA) throw console.error('HOA is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.HOS) throw console.error('HOS is not decoded while parsing logfile. Consider update decoder field.');

        let irat_handover_attempt = data.HOA.filter(entry => ['904'].includes(entry.HO_TYPE))

        //filter HOA within the polygon if any
        if ('polygon' in opts) {
            irat_handover_attempt = irat_handover_attempt.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }))
        }
        //if (filter.area) {
        //    irat_handover_attempt = irat_handover_attempt.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false }))
        //} Deprecated

        let irat_handover_success = data.HOS.filter((entry) => {
            return irat_handover_attempt.find((hoa_entry) => {
                return hoa_entry.file == entry.file && hoa_entry.HO_CONTEXT.trim() == entry.HO_CONTEXT.trim()
            })
        })
        
        //if (filter.area) {
        //    irat_handover_success = irat_handover_success.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false }))
            //warning - attempt in polygon but success not within the polygon will cause incorrect kpi
        //} Deprecated

        if (opts.polygon) {
            irat_handover_success = irat_handover_success.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }))
            //warning - attempt in polygon but success not within the polygon will cause incorrect kpi
        }


        return { HANDOVER_SUCCESS: irat_handover_success.length, HANDOVER_ATTEMPT: irat_handover_attempt.length }
    }

    nemo_volte_call(data,opts:any){

        if (!data.CAA) throw console.error('CAA is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CAC) throw console.error('CAC is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CAF) throw console.error('CAF is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CAD) throw console.error('CAD is not decoded while parsing logfile. Consider update decoder field.');


        let volte_call_attempt = data.CAA.map(entry => {
            let terminated_call = data.CAC.find(call => call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file)
            if(!terminated_call){
                terminated_call = data.CAF.find(call => call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file)
            }
            return {...entry,terminated:terminated_call}
        }).filter(entry =>{ 
            //console.table(entry)
            if(!entry.terminated){
                console.warn(`terminating call not found possiblity logfile error FILE:${entry.file}`)
                return false
            }else if(!(entry.terminated.CALL_TYPE == '14')){
                return false
            }

            if('FAIL' in entry.terminated){
                if(entry.terminated.FAIL == '5'){return false}
            }
            return true
        })

        //volte_call_attempt = filter.area? volte_call_attempt.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : volte_call_attempt
        volte_call_attempt = ('polygon' in opts) ? volte_call_attempt.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon , { ignoreBoundary: false })) : volte_call_attempt
        
        let volte_call_connected = data.CAC.filter(entry => entry.CALL_TYPE == '14' && entry.CALL_STATUS == "3").map(entry => {
            let start_time = this.GetEpochTime(data.CAA.find(call => call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file).TIME)
            let end_time = this.GetEpochTime(entry.TIME)
            return {...entry,SETUP_TIME:end_time-start_time}
        })
        
        //volte_call_connected = filter.area? volte_call_connected.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]), filter.area, {ignoreBoundary:false})) : volte_call_connected
        volte_call_connected = ('polygon' in opts)? volte_call_connected.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]), opts.polygon , {ignoreBoundary:false})) : volte_call_connected


        let volte_call_drop = data.CAD.filter(entry => entry.DROP_REASON != "1")
        
        //volte_call_drop = filter.area? volte_call_drop.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]), filter.area, {ignoreBoundary:false})) : volte_call_drop
        volte_call_drop = ('polygon' in opts) ? volte_call_drop.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]), opts.polygon , {ignoreBoundary:false})) : volte_call_drop
        
        return {
            VOLTE_CALL_ATTEMPT:volte_call_attempt,
            VOLTE_CALL_CONNECTED:volte_call_connected,
            VOLTE_CALL_DROP:volte_call_drop}
    }

    nemo_csfb_call(data,opts:any){

        if (!data.CAA) throw console.error('CAA is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CAC) throw console.error('CAC is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CAF) throw console.error('CAF is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CAD) throw console.error('CAF is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.L3SM) throw console.error('L3SM is not decoded while parsing logfile. Consider update decoder field.');

        //console.time("nemo_csfb_call")
        let csfb_call_attempt = data.CAA.map(entry => {
            //console.log(data.CAC.filter(call => call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file))
            let terminated_call = data.CAC.find(call => call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file && call.CALL_STATUS === '2')
            if(!terminated_call){
                terminated_call = data.CAF.find(call => call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file)
            }
            return {...entry,terminated:terminated_call}
        }).filter(entry =>{ 
            //console.table(entry)
            if(!entry.terminated){
                //console.warn(`terminating call not found possiblity logfile error FILE:${entry.file}`)
                return false
            }else if(!(entry.terminated.CALL_TYPE == '1')){
                return false
            }
            if('FAIL' in entry.terminated){
                if(entry.terminated.FAIL == '5' || entry.terminated.FAIL == '1' || entry.terminated.FAIL == '2'){return false}
            }
            return true
        }).filter((entry) =>{ // filter only LTE system at start of the call
            if(entry.MEAS_SYSTEM === '7' || entry.MEAS_SYSTEM === '8'){
                return true
            }else{
                return false
            }
        })

        //csfb_call_attempt = filter.area? csfb_call_attempt.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : csfb_call_attempt
        csfb_call_attempt = ('polygon' in opts) ? csfb_call_attempt.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false })) : csfb_call_attempt
        
        
        let csfb_call_connected = data.CAC.filter(entry => entry.CALL_TYPE == '1' && entry.CALL_STATUS == "3").filter((entry)=>{
            let CAA = data.CAA.find(call => call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file)
            if(CAA.MEAS_SYSTEM === '7' || CAA.MEAS_SYSTEM === '8'){
                return true
            }else{
                return false
            }
        }).map(entry => {
            // call setup calculation for MTC is different from MOC
            // csfb_setup_time = CAC - 'CS_SERVICE_NOTIFICATION'  # if L3SM "CS_SERVICE_NOTIFICATION" exist
            // --- else ---
            // csfb_setup_time = CAC - CAA
            const CAA = data.CAA.find(call => call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file)
            const LAST_CAA = [...data.CAC]
                .sort((a,b)=>{return  this.GetEpochTime(a.TIME)- this.GetEpochTime(b.TIME)}) // descending sort time latest time first 
                .find(call => this.GetEpochTime(call.TIME) <= this.GetEpochTime(CAA.TIME) && call.file == entry.file )
            let L3SM = null
            if(!LAST_CAA){
                L3SM = data.L3SM.filter(l3=>l3.file == entry.file)
                    .find(l3 => (l3.MESSAGE === '"CS_SERVICE_NOTIFICATION"') && this.GetEpochTime(CAA.TIME) >= this.GetEpochTime(l3.TIME))
            }else{
                L3SM = data.L3SM.filter(l3=>l3.file == entry.file)
                    .find(l3 => (l3.MESSAGE === '"CS_SERVICE_NOTIFICATION"') && this.GetEpochTime(CAA.TIME) >= this.GetEpochTime(l3.TIME) && this.GetEpochTime(LAST_CAA.TIME) <= this.GetEpochTime(l3.TIME))
            }
            let start_time = L3SM? this.GetEpochTime(L3SM.TIME) :this.GetEpochTime(data.CAA.find(call => call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file).TIME)
            let end_time = this.GetEpochTime(entry.TIME)
            return {...entry,SETUP_TIME:end_time-start_time}
        })
        
        //csfb_call_connected = filter.area? csfb_call_connected.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]), filter.area, {ignoreBoundary:false})) : csfb_call_connected
        csfb_call_connected = ('polygon' in opts)? csfb_call_connected.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]), opts.polygon, {ignoreBoundary:false})) : csfb_call_connected
        
        let csfb_call_drop = data.CAD.filter(entry => entry.DROP_REASON != "1" && entry.DROP_REASON != "2")
        //csfb_call_drop = filter.area? csfb_call_drop.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]), filter.area, {ignoreBoundary:false})) : csfb_call_drop
        csfb_call_drop = ('polygon' in opts)? csfb_call_drop.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]), opts.polygon, {ignoreBoundary:false})) : csfb_call_drop
        
        return {CSFB_CALL_ATTEMPT:csfb_call_attempt,CSFB_CALL_CONNECTED:csfb_call_connected,CSFB_CALL_DROP:csfb_call_drop}
    }

    nemo_call(data,opts:any){

        if (!data.CAA) throw console.error('CAA is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CAC) throw console.error('CAC is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CAF) throw console.error('CAF is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CAD) throw console.error('CAF is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.L3SM) throw console.error('L3SM is not decoded while parsing logfile. Consider update decoder field.');

        //console.time("nemo_csfb_call")
        let call_attempt = data.CAA.map(entry => {
            //console.log(data.CAC.filter(call => call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file))
            let terminated_call = data.CAC.find(call => call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file && call.CALL_STATUS === '2')
            if(!terminated_call){
                terminated_call = data.CAF.find(call => call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file)
            }
            return {...entry,terminated:terminated_call}
        }).filter(entry =>{ 
            //console.table(entry)
            if(!entry.terminated){
                //console.warn(`terminating call not found possiblity logfile error FILE:${entry.file}`)
                return false
            }else if(!(entry.terminated.CALL_TYPE == '1')){
                //console.warn(`terminting call is not a voice call type`)
                return false
            }
            if('FAIL' in entry.terminated){
                //console.warn(`call fail detected`)
                if(entry.terminated.FAIL == '5' || entry.terminated.FAIL == '1' || entry.terminated.FAIL == '2'){return false}
            }
            return true
        })/*.filter((entry) =>{ // filter only LTE system at start of the call
            if(entry.MEAS_SYSTEM === '7' || entry.MEAS_SYSTEM === '8'){
                return true
            }else{
                return false
            }
        })*/

        //csfb_call_attempt = filter.area? csfb_call_attempt.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : csfb_call_attempt
        call_attempt = ('polygon' in opts) ? call_attempt.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false })) : call_attempt
        
        
        let call_connected = data.CAC.filter(entry => entry.CALL_TYPE == '1' && entry.CALL_STATUS == "3").map(entry => {
            // call setup calculation for MTC is different from MOC
            // csfb_setup_time = CAC - 'CS_SERVICE_NOTIFICATION'  # if L3SM "CS_SERVICE_NOTIFICATION" exist
            // --- else ---
            // csfb_setup_time = CAC - CAA
            const CAA = data.CAA.find(call => call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file)
            const LAST_CAA = [...data.CAC]
                .sort((a,b)=>{return  this.GetEpochTime(a.TIME)- this.GetEpochTime(b.TIME)}) // descending sort time latest time first 
                .find(call => this.GetEpochTime(call.TIME) <= this.GetEpochTime(CAA.TIME) && call.file == entry.file )
            let L3SM = null
            if(!LAST_CAA){
                L3SM = data.L3SM.filter(l3=>l3.file == entry.file)
                    .find(l3 => (l3.MESSAGE === '"CS_SERVICE_NOTIFICATION"') && this.GetEpochTime(CAA.TIME) >= this.GetEpochTime(l3.TIME))
            }else{
                L3SM = data.L3SM.filter(l3=>l3.file == entry.file)
                    .find(l3 => (l3.MESSAGE === '"CS_SERVICE_NOTIFICATION"') && this.GetEpochTime(CAA.TIME) >= this.GetEpochTime(l3.TIME) && this.GetEpochTime(LAST_CAA.TIME) <= this.GetEpochTime(l3.TIME))
            }
            let start_time = L3SM? this.GetEpochTime(L3SM.TIME) :this.GetEpochTime(data.CAA.find(call => call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file).TIME)
            let end_time = this.GetEpochTime(entry.TIME)
            return {...entry,SETUP_TIME:end_time-start_time}
        })
        
        //csfb_call_connected = filter.area? csfb_call_connected.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]), filter.area, {ignoreBoundary:false})) : csfb_call_connected
        call_connected = ('polygon' in opts)? call_connected.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]), opts.polygon, {ignoreBoundary:false})) : call_connected
        
        let call_drop = data.CAD.filter(entry => entry.DROP_REASON != "1" && entry.DROP_REASON != "2")
        //csfb_call_drop = filter.area? csfb_call_drop.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]), filter.area, {ignoreBoundary:false})) : csfb_call_drop
        call_drop = ('polygon' in opts)? call_drop.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]), opts.polygon, {ignoreBoundary:false})) : call_drop
        
        return {CALL_ATTEMPT:call_attempt,CALL_CONNECTED:call_connected,CALL_DROP:call_drop}
    }

    nemo_packet_data_setup(data, opts: any) {
        
        if (!data.PAA) throw console.error('PAA is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.PAC) throw console.error('PAC is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.PAD) throw console.error('PAD is not decoded while parsing logfile. Consider update decoder field.');

        //let PAA = filter.area ? data.PAA.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : data.PAA
        //let PAA = data.PAA
        let PAA = ('polygon' in opts) ? data.PAA.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false })) : data.PAA
        
        let PAC = data.PAC.filter((entry) => {
            return PAA.find((paa_entry) => paa_entry.PACKET_SESSION_CONTEXT == entry.PACKET_SESSION_CONTEXT && paa_entry.file == entry.file && entry.PACKET_STATE == '2')
        })

        let PAD = data.PAD.filter((entry) => {
            return PAA.find(paa_entry => paa_entry.PACKET_SESSION_CONTEXT = entry.PACKET_SESSION_CONTEXT && paa_entry.file == entry.file && entry.DEACT_STATUS != "1")
        })

        if('polygon' in opts){
            PAC = PAC.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }))
            PAD = PAD.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }))
        }
        //if (filter.area) {
        //    PAC = PAC.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false }))
        //    PAD = PAD.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false }))
        //}

        return { PACKET_DATA_SETUP_ATTEMPT: PAA.length, PACKET_DATA_SETUP_SUCCESS: PAC.length, PACKET_DATA_DROP: PAD.length }
    }

    nemo_data_server_setup(data, opts: any) {

        if (!data.DAA) throw console.error('DAA is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.DAC) throw console.error('DAC is not decoded while parsing logfile. Consider update decoder field.');

        //let DAA = filter.area ? data.DAA.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : data.DAA
        //let DAA = data.DAA
        let DAA = ('polygon' in opts) ? data.DAA.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false })) : data.DAA
        
        let DAC = data.DAC.filter((entry) => {
            return DAA.find(daa_entry => daa_entry.DATA_CONTEXT == entry.DATA_CONTEXT && daa_entry.file == entry.file)
        })

        let DATA_SETUP_TIME = DAC.reduce((acc, cur) => {
            let end = this.GetEpochTime(cur.TIME)
            let start = this.GetEpochTime(DAA.find((entry) => entry.DATA_CONTEXT == cur.DATA_CONTEXT && entry.file == cur.file).TIME)
            return [...acc, end - start]
        }, [])

        if ('polygon' in opts) {
            DAC = DAC.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }))
        }

        return { DATA_CONNECT_ATTEMPT: DAA.length, DATA_CONNECT_SUCCESS: DAC.length, DATA_SETUP_TIME: DATA_SETUP_TIME }
    }

    nemo_tracking_area_update(data, opts: any) {
        
        if (!data.TUA) throw console.error('TUA is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.TUS) throw console.error('TUS is not decoded while parsing logfile. Consider update decoder field.');

        //let TUA = filter.area ? data.TUA.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : data.TUA
        //let TUA = data.TUA
        let TUA = ('polygon' in opts)? data.TUA.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false })) : data.TUA
        
        let TUS = data.TUS.filter((entry) => {
            return TUA.find(tua_entry => tua_entry.TAU_CONTEXT == entry.TAU_CONTEXT && tua_entry.file == entry.file)
        })

        //if (filter.area) {
        //    TUS = TUS.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false }))
        //}
        if ('polygon' in opts) {
            TUS = TUS.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }))
        }

        return { TRACKING_AREA_UPDATE_ATTEMPT: TUA.length, TRACKING_AREA_UPDATE_SUCCESS: TUS.length }
    }

    nemo_pdsch_bler(data, opts: any) {

        if (!data.PHRATE) throw console.error('PHRATE is not decoded while parsing logfile. Consider update decoder field.');

        let PHRATE = data.PHRATE.filter(entry => entry.BLER != '' && entry.CELLTYPE == '0')

        if ('polygon' in opts) {
            PHRATE = PHRATE.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }))
        }

        //if (filter.area) {
        //    PHRATE = PHRATE.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false }))
        //}

        return { PDSCH_BLER: PHRATE.filter(entry=> entry.CELLTYPE == "0" && entry.BLER != '').map(x => parseFloat(x.BLER)) }
    }
    
    nemo_mos_quality(data,opts:any){
        
        if (!data.AQDL) throw console.error('AQDL is not decoded while parsing logfile. Consider update decoder field.');

        //let AQDL = filter.area? data.AQDL.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : data.AQDL
        //let AQDL = data.AQDL
        let AQDL = ('polygon' in opts)? data.AQDL.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false })) : data.AQDL
        
        //console.table(AQDL)
        
        if(('vq_type_dl' in opts)){ // by default mos audio filter any
            if(opts.vq_type_dl === 'PESQ_NB'){ //filter PESQ NB
                AQDL = AQDL.filter(entry => entry.AUDIOTYPE == '2')
            }else if(opts.vq_type_dl === 'POLQA_NB'){ //filter POQLA NB
                AQDL = AQDL.filter(entry => entry.AUDIOTYPE == '7')
            }
        }
        
        return {MOS_QUALITY:AQDL.map(entry => parseFloat(entry.MOS))}
    }

    nemo_ue_measurement(data,opts:any){
        //console.time("nemo_cell_measurement")
        //let RSRP_RSRQ = data.CELLMEAS
        if (!data.CELLMEAS) throw console.error('CELLMEAS is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CI) throw console.error('CI is not decoded while parsing logfile. Consider update decoder field.');

        let RSRP_RSRQ = data.CELLMEAS.flatMap((entry) => {
            return entry.loop.map((meas) => { return { RSRP: parseFloat(meas.RSRP), RSRQ: parseFloat(meas.RSRQ), CELLTYPE: meas.CELLTYPE, LAT: entry.LAT, LON: entry.LON, CHANNEL: entry.EARFCN, TIME: entry.TIME, FILE: entry.file } })
        }).filter(entry => entry.CELLTYPE == "0")

        let CINR = data.CI.filter(entry => entry.CINR !== '' && entry.CELLTYPE == '0').map((entry)=>{
            return {CINR:parseFloat(entry.CINR), CELLTYPE: entry.CELLTYPE, LAT: entry.LAT, LON: entry.LON, CHANNEL: entry.EARFCN, TIME: entry.TIME, FILE: entry.file}
        })

        if ('polygon' in opts) {
            RSRP_RSRQ = RSRP_RSRQ.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }))
            CINR = CINR.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }))
        }

        //console.log(RSRP_RSRQ.length,CINR.length)
        //console.timeEnd("nemo_cell_measurement")
        return { "RSRP_RSRQ" : RSRP_RSRQ, "SINR": CINR }
    }

    nemo_ue_measurement_umts(data,opts:any){
        if (!data.CELLMEAS) throw console.error('CELLMEAS is not decoded while parsing logfile. Consider update decoder field.');

        let RSCP_ECNO = data.CELLMEAS.reduce((acc,cur) => {
            //Best active set
            let BEST_ECNO_SET  = cur.loop.filter(meas => meas.CELLTYPE == '0' && meas.ECNO !== '')
            let BEST_ECNO = Math.max(...BEST_ECNO_SET.map(meas => parseFloat(meas.ECNO)))
            let BEST_ECNO_CH = BEST_ECNO_SET.find(meas => meas.ECNO == BEST_ECNO)
            BEST_ECNO_CH = BEST_ECNO_CH? BEST_ECNO_CH.CH : ''
            let BEST_ACTIVE_SET = cur.loop.filter(meas => meas.CELLTYPE == '0').find(meas => meas.ECNO == BEST_ECNO)
            let BEST_RSCP  = BEST_ACTIVE_SET? parseFloat(BEST_ACTIVE_SET.RSCP) : null
            return [...acc, {RSCP:BEST_RSCP,ECNO:BEST_ECNO,LAT: cur.LAT, LON: cur.LON, CHANNEL: BEST_ECNO_CH, TIME: cur.TIME, FILE: cur.file}]
          },[]).filter(entry => entry.RSCP !== null)

        if ('polygon' in opts) {
            RSCP_ECNO = RSCP_ECNO.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }))
        }

        return { "RSCP_ECNO" : RSCP_ECNO }
    }

    nemo_rlc_bler(data,opts:any){
        if (!data.RLCBLER) throw console.error('RLCBLER is not decoded while parsing logfile. Consider update decoder field.');

        let RLCBLER = data.RLCBLER.filter(entry => entry.BLER !== '').map(entry => parseFloat(entry.BLER))

        return {"RLC_BLER":RLCBLER}
    }

    nemo_l3_message(data, opts:any){
        if (!data.L3SM) throw console.error('L3SM is not decoded while parsing logfile. Consider update decoder field.');

        //console.log(data.L3SM)
        const L3SM = data.L3SM.map((entry)=>{
            return {
                FILE:entry.file,
                TIME:entry.TIME,
                ETIME:this.GetEpochTime(entry.TIME),
                MESSAGE:entry.MESSAGE.replace(/"|\r|\n/g,""),
                SYSTEM:entry.MEAS_SYSTEM
            }
        })

        return {"L3_MESSAGE":L3SM}
    }

    nemo_sip_message(data, opts:any){
        if (!data.SIPSM) throw console.error('SIPSM is not decoded while parsing logfile. Consider update decoder field.');

        //console.log(data.L3SM)
        const SIPSM = data.SIPSM.map((entry)=>{
            return {
                FILE:entry.file,
                TIME:entry.TIME,
                ETIME:this.GetEpochTime(entry.TIME),
                MESSAGE:entry.MESSAGE.replace(/"|\r|\n/g,""),
                SYSTEM:entry.MEAS_SYSTEM,
                DIRECTION:entry.SIP_DIR
            }
        })

        return {"SIP_MESSAGE":SIPSM}
    }
}

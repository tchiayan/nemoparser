export class NemoParameterGrid {
    constructor(){}

    public nemo_scanner_measurement(data){
        console.time("nemo_scanner_measurement")
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

        console.timeEnd("nemo_scanner_measurement")
        return {'SCANNER_RSRP':RSRP,'SCANNER_CINR':CINR,'SCANNER_RSRQ':RSRQ}
    }

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
}
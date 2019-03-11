import { parse } from "path";
import { cpus } from "os";

export class NemoFile {
    private fileProperties:any = {SYSTEM:[]}
    private location:{lat:number,lng:number}[] = []
    constructor(data:Buffer){
        const data_utf8_line = data.toString('utf-8').split("\n")
        for(let i=0; i<data_utf8_line.length; i++){
            const cols = data_utf8_line[i].split(",")

            if(cols[0] === '#DT'){
                this.fileProperties['DEVICETYPE'] = parseInt(cols[3]) === 1? 'UE' : 'SCANNER'
            }
            
            if(cols[0] === 'CELLMEAS'){
                if(cols[3] === '1'){
                    if(!this.fileProperties.SYSTEM.includes("GSM")){
                        this.fileProperties.SYSTEM.push("GSM")
                    }
                }else if(cols[3] === '5'){
                    if(!this.fileProperties.SYSTEM.includes("UMTS FDD")){
                        this.fileProperties.SYSTEM.push("UMTS FDD")
                    }
                }else if(cols[3] === '7'){
                    if(!this.fileProperties.SYSTEM.includes("LTE FDD")){
                        this.fileProperties.SYSTEM.push("LTE FDD")
                    }
                }else if(cols[3] === '8'){
                    if(!this.fileProperties.SYSTEM.includes("LTE TDD")){
                        this.fileProperties.SYSTEM.push("LTE TDD")
                    }
                }
            }

            if(cols[0] === 'DREQ'){
                if(cols[5] === '3'){
                    this.fileProperties['FTP'] = cols[6] === '1'? 'UPLINK': 'DOWNLINK'
                }
            }

            if(cols[0] === 'L3SM' && cols[5] == '"ATTACH_REQUEST"'){
                this.fileProperties['NETWORK_SETUP'] = cols[3]
            }

            if(cols[0] == 'SIPREGC'){
                this.fileProperties['SIP'] = "ACTIVATED"
            }

            if(cols[0] === 'CAA'){
                this.fileProperties['CALL'] = cols[6] === '1'? 'ORIGINATING': 'TERMINATING'
            }

            if(cols[0] === 'GPS'){
                this.location.push({lat:parseFloat(cols[4]),lng:parseFloat(cols[3])})
            }

            if(cols[0] === 'CHI'){
                if(cols[3]=== '7' || cols[3] === '8'){
                    if(parseInt(cols[18])>0){
                        this.fileProperties['CA'] = parseInt(cols[18])
                    }
                }
            }

            if(cols[0] === '#START'){
                const DT_DATE = cols[3].replace(/"|\r/g,"").split(".")
                this.fileProperties['TIME'] = {
                    DATE: `${DT_DATE[2]}${DT_DATE[1]}${DT_DATE[0]}`
                }
                //console.log(cols[3].replace(/"|\r/g,"").replace(/\./g,"/"))
            }
        }

        //determine logfile static / mobility
        const lat = this.location.map(x => x.lat)
        const lng = this.location.map(x => x.lng)
        
        const yDif = Math.max(...lat)-Math.min(...lat)
        const xDif = Math.max(...lng)-Math.min(...lng)
        if(yDif < 0.0005 && xDif < 0.0005){
            this.fileProperties['MOBILITY'] = "STATIC"
        }else{
            this.fileProperties['MOBILITY'] = "MOBILITY"
        }
    }

    getFileProperties():any{
        return this.fileProperties
    }


    grouping():string{
        let group_name:string = `${this.fileProperties.TIME.DATE}_${this.fileProperties.MOBILITY}_${this.fileProperties.SYSTEM.join("|")}`

        if(this.fileProperties.FTP){
            group_name += this.fileProperties.FTP === "DOWNLINK" ? "_DL": "_UL"
        }

        if(this.fileProperties.CALL){
            group_name += this.fileProperties.CALL === "ORIGINATING" ? "_CALL_MOC": "_CALL_MTC"
        }
        return group_name
    }
}
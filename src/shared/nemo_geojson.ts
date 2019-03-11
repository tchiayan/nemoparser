
export class NemoGeoJSON {
    constructor(){

    } 

    private GetEpochTime(timeString) {
        return Date.parse(`1970-01-01T${timeString}Z`)
    }

    private colorCheck(data, ranges):string{
        const range = ranges.find((range)=>{
            //console.log(range)
            const value = data[range.field]
            if('eq' in range.condition){
                //console.log('eq in range')
                if(value  === range.condition.eq){
                    return true
                }else{
                    return false
                }
            }else if('gt' in range.condition){
                //console.log('gt in range')
                //console.log(`${value} >= ${range.condition.gt}`)
                if(value  >= range.condition.gt){
                    if('lt' in range){
                        if(value  <= range.condition.lt){
                            return true
                        }else{
                            return false
                        }
                    }
                    return true
                }else{
                    return false
                }
            }else if('lt' in range.condition){
                //console.log('lt in range')
                if(value  <= range.condition.lt){
                    if('gt' in range){
                        if(value  >= range.condition.gt){
                            return true
                        }else{
                            return false
                        }
                    }
                    return true
                }else{
                    return false
                }
            }else{
                //console.log('no range')
                return false
            }
        })
        //console.log(range)
        return range? range.color : null
    }

    
    public convertToGeoJSON(data:any[],condition?){
        for(let i=0; i< data.length; i++){
            const keys:string[] = Object.keys(data[i])
            if(!keys.includes('TIME')){
                console.warn(`Missing time information`)
            }else{
                data['ETIME'] = this.GetEpochTime(data[i])
            }

            if(!(keys.includes('LAT') && keys.includes('LON'))){
                console.warn(`No lat lng info`)
            }
        }
        data.sort((a,b)=>a.ETIME - b.ETIME)
        let lonLat:any[] = []
        let features:any[] = []
        let previousColor = ''
        for(let i=0; i < data.length-1; i++){
            const color= condition? this.colorCheck(data[i],condition):null
            if(data[i].LON === 0 || data[i].LAT === 0){
                continue
            }
            if(color){
                //console.log(color)
                if(i === 0){
                    //console.log("Color not yet set, starting latlon list")
                    previousColor = color
                    lonLat.push([data[i].LON, data[i].LAT])
                    lonLat.push([data[i+1].LON, data[i].LAT])
                }else if(i === data.length-2){
                    //console.log("Ending Line")
                    lonLat.push([data[i+1].LON, data[i+1].LAT])
                    features.push({
                        type: 'Feature',
                        properties:{color:color},
                        geometry: {
                            type: 'LineString',
                            coordinates:lonLat
                        }
                    })
                    lonLat = []
                }else if(previousColor === color){
                    //console.log("Color not change, push to original latlon list")
                    lonLat.push([data[i+1].LON, data[i+1].LAT])
                }else{
                    //console.log("Color changed")
                    features.push({
                        type: 'Feature',
                        properties:{color:previousColor},
                        geometry: {
                            type: 'LineString',
                            coordinates:lonLat
                        }
                    })
                    lonLat = [data[i+1].LON, data[i].LAT]
                    previousColor = color
                }
            }else{
                
                if(i === data.length-2){
                    lonLat.push([data[i+1].LON, data[i+1].LAT])
                    features.push({
                        type: 'Feature',
                        properties:{},
                        geometry: {
                            type: 'LineString',
                            coordinates:lonLat
                        }
                    })
                    lonLat = []
                }else if(i === 0){
                    lonLat.push([data[i].LON, data[i].LAT])
                }
                lonLat.push([data[i+1].LON, data[i+1].LAT])
            }
        }

        return {
            type:'FeatureCollection',
            features:features
        }
    }
}
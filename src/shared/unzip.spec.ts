import { unzip } from './unzip'
import { readFileSync } from 'fs'
import { expect } from 'chai';
import { NemoFile } from './nemo_file';
describe('Unzip file testing',()=>{
    const data = readFileSync('./server-test/zip/ZIP_LOGFILE.zip')
    
    it('unzip file',()=>{
        unzip(data).then((result)=>{
            expect(result).to.be.an('array').have.lengthOf(211)
            result.forEach(({data,filename})=>{
                const file = new NemoFile(data)
                //console.log(`${filename} => ${file.grouping()}`)
                console.log(filename)
                console.log(file.getFileProperties())
            })
        })
    })
})

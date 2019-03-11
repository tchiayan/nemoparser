import { pathToFileURL } from "url";
import { url } from "inspector";

const decompress = require('decompress');

export async function unzip(filepath):Promise<{data:Buffer,filename:string}[]>{
    let result = await decompress(filepath)
    return result.filter((output:{data:Buffer,mode:number,mtime:string,path:string,type:string})=>{
        return output.path.slice(output.path.length-4) === ".nmf"
    }).map((output:{data:Buffer,mode:number,mtime:string,path:string,type:string})=>{
        //const filenameWithExtension = output.path.split("/").pop();
        const filenameWithExtension = output.path.replace(/^.*[\\\/]/, '');
        //console.log(filenameWithExtension)
        return {data:output.data,filename:filenameWithExtension}
    })
} 
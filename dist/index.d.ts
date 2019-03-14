import { Observable } from 'rxjs';
import { NemoParameterGrid } from './shared/nemo_parameter_grid';
export interface LogfileBuffer {
    data: string;
    filename: string;
}
export declare class LogfileBuffer {
    constructor(data: string, filename: string);
}
export declare class NemoParser {
    nemoParamGrid: NemoParameterGrid;
    constructor();
    private getInfo;
    private parseLogfile;
    private parseBuffer;
    displayGrid(nemo_params: string[], option: {
        nemo_opts?: any;
        fileBuffer?: LogfileBuffer[];
        files?: FileList;
    }): Observable<any>;
    convertToFeaturesCollection(data: any[], lineString?: boolean, ranges?: any[]): {
        geojson: {
            type: string;
            features: any[];
        };
        file: any;
    }[];
}
export declare class NemoFileReader {
    constructor();
    parse(data: any): any;
}

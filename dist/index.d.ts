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
        fileBuffer?: LogfileBuffer[];
        files?: FileList;
    }): Observable<any>;
}

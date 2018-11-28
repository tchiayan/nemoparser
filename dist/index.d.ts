import { NemoParameterGrid } from './shared/nemo_parameter_grid';
export declare class NemoParser {
    private nemoParamGrid;
    constructor(nemoParamGrid: NemoParameterGrid);
    private getInfo;
    private parseLogfile;
    displayGrid(nemo_params: string[], files: FileList): any;
}

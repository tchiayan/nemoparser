export declare class NemoParameterGrid {
    constructor();
    nemo_scanner_measurement(data: any): {
        'SCANNER_RSRP': any[];
        'SCANNER_CINR': any[];
        'SCANNER_RSRQ': any[];
    };
    nemo_scanner_field_n_best(data: any, field: string): any[];
}

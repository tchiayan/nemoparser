export declare const LTE_FDD_SCANNER: {
    filter: {
        0: string;
        3: string;
        6: string;
        10: {
            condition: string;
        };
    };
    output: {
        'SYSTEM': string;
        'DEVICE': string;
        'TIME': number;
        'EARFCN': number;
        loop: {
            n: number;
            p: number;
            s: number;
            c: {
                'PCI': number;
                'RSRP': number;
                'CINR': number;
                'RSRQ': number;
            };
        };
    };
};
export declare const LTE_TDD_SCANNER: {
    filter: {
        0: string;
        3: string;
        6: string;
        10: {
            condition: string;
        };
    };
    output: {
        'SYSTEM': string;
        'DEVICE': string;
        'TIME': number;
        'EARFCN': number;
        loop: {
            n: number;
            p: number;
            s: number;
            c: {
                'PCI': number;
                'RSRP': number;
                'CINR': number;
                'RSRQ': number;
            };
        };
    };
};
export declare const UMTS_SCANNER: {
    filter: {
        0: string;
        3: string;
    };
    output: {
        'SYSTEM': string;
        'DEVICE': string;
        'TIME': number;
        'EARFCN': number;
        loop: {
            n: number;
            p: number;
            s: number;
            c: {
                'PCI': number;
                'RSRP': number;
                'CINR': number;
            };
        };
    };
};

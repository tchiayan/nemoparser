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
export declare const DRATE_DL: {
    filter: {
        0: string;
    };
    output: {
        'TIME': number;
        'DATA_TRANSFER_CONTEXT': number;
        'PROTOCOL': number;
        'DL': number;
    };
};
export declare const DRATE_UL: {
    filter: {
        0: string;
    };
    output: {
        'DATA_TRANSFER_CONTEXT': number;
        'PROTOCOL': number;
        'UL': number;
    };
};
export declare const UE_LTE_CI: {
    filter: {
        0: string;
    };
    output: {
        'TIME': number;
        'CINR': number;
        "CELLTYPE": number;
    };
};
export declare const UE_LTE_FDD_CI: {
    filter: {
        0: string;
        3: string;
    };
    output: {
        'TIME': number;
        'CINR': number;
        "CELLTYPE": number;
    };
};
export declare const UE_DATA_TRANSFER_ATTEMPT: {
    filter: {
        0: string;
    };
    output: {
        'TIME': number;
        'PROTOCOL': number;
        'DIR': number;
    };
};
export declare const UE_DATA_TRANSFER_COMPLETE: {
    filter: {
        0: string;
    };
    output: {
        'TIME': number;
    };
};
export declare const UE_GAA_ATTACH_ATTEMPT: {
    filter: {
        0: string;
    };
    output: {
        'TIME': number;
        'ATTACH_CONTEXT': number;
        'MEAS_SYSTEM': number;
    };
};
export declare const UE_AUDIO_MOS: {
    filter: {
        0: string;
    };
    output: {
        'AUDIOTYPE': number;
        'MOS': number;
    };
};
export declare const UE_BLER: {
    filter: {
        0: string;
        4: string;
    };
    output: {
        'BLER': number;
        'CELLTYPE': number;
    };
};
export declare const UE_TUA: {
    filter: {
        0: string;
    };
    output: {
        'TIME': number;
        'TAU_CONTEXT': number;
        'MEAS_SYSTEM': number;
        'TAU_TYPE': number;
    };
};
export declare const UE_TUS: {
    filter: {
        0: string;
    };
    output: {
        'TIME': number;
        'TAU_CONTEXT': number;
    };
};
export declare const UE_DAA: {
    filter: {
        0: string;
    };
    output: {
        'DATA_CONTEXT': number;
        'TIME': number;
        'PROTOCOL': number;
    };
};
export declare const UE_DAC: {
    filter: {
        0: string;
    };
    output: {
        'DATA_CONTEXT': number;
        'TIME': number;
        'PROTOCOL': number;
    };
};
export declare const UE_PAA: {
    filter: {
        0: string;
    };
    output: {
        'TIME': number;
        'PACKET_SESSION_CONTEXT': number;
        'MEAS_SYSTEM': number;
    };
};
export declare const UE_PAC: {
    filter: {
        0: string;
    };
    output: {
        'TIME': number;
        'PACKET_SESSION_CONTEXT': number;
        'MEAS_SYSTEM': number;
        'PACKET_STATE': number;
    };
};
export declare const UE_PAD: {
    filter: {
        0: string;
    };
    output: {
        'TIME': number;
        'PACKET_SESSION_CONTEXT': number;
        'MEAS_SYSTEM': number;
        'DEACT_STATUS': number;
    };
};
export declare const UE_HOA: {
    filter: {
        0: string;
    };
    output: {
        'TIME': number;
        'HO_CONTEXT': number;
        'HO_TYPE': number;
    };
};
export declare const UE_HOS: {
    filter: {
        0: string;
    };
    output: {
        'TIME': number;
        'HO_CONTEXT': number;
    };
};
export declare const UE_CAA: {
    filter: {
        0: string;
    };
    output: {
        'TIME': number;
        'CALL_CONTEXT': number;
        'MEAS_SYSTEM': number;
        'CALL_TYPE': number;
    };
};
export declare const UE_CAC: {
    filter: {
        0: string;
    };
    output: {
        'TIME': number;
        'CALL_CONTEXT': number;
        'MEAS_SYSTEM': number;
        'CALL_TYPE': number;
        'CALL_STATUS': number;
    };
};
export declare const UE_CAF: {
    filter: {
        0: string;
    };
    output: {
        'TIME': number;
        'CALL_CONTEXT': number;
        'MEAS_SYSTEM': number;
        'CALL_TYPE': number;
        'FAIL': number;
    };
};
export declare const UE_CAD: {
    filter: {
        0: string;
    };
    output: {
        'TIME': number;
        'CALL_CONTEXT': number;
        'MEAS_SYSTEM': number;
        'CALL_TYPE': number;
        'DROP_REASON': number;
    };
};
export declare const UE_LTE_TDD_CELLMEAS: {
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
                'RSRQ': number;
                'EARFCN': number;
                'CELLTYPE': number;
            };
        };
    };
};
export declare const UE_LTE_TDD_CI: {
    filter: {
        0: string;
        3: string;
    };
    output: {
        'TIME': number;
        'CINR': number;
        "CELLTYPE": number;
    };
};

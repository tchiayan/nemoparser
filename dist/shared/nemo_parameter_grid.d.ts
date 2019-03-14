export declare class NemoParameterGrid {
    constructor();
    private nemo_scanner_field_n_best(data, field);
    private GetEpochTime(timeString);
    nemo_lte_scanner_measurement(data: any, opts: any): {
        'SCANNER_RSRP': {
            RSRP: number;
            TIME: string;
            CH: string;
            FILE: string;
            LAT: number;
            LON: number;
            duplicate: boolean;
        }[];
        'SCANNER_CINR': {
            CINR: number;
            TIME: string;
            CH: string;
            FILE: string;
            LAT: number;
            LON: number;
            duplicate: boolean;
        }[];
        'SCANNER_RSRQ': {
            RSRQ: number;
            TIME: string;
            CH: string;
            FILE: string;
            LAT: number;
            LON: number;
            duplicate: boolean;
        }[];
    };
    nemo_umts_scanner_measurement(data: any, opts: any): {
        'SCANNER_RSCP': any[];
        'SCANNER_ECNO': any[];
    };
    nemo_application_throughput_downlink_filter_sinr(data: any, opts: any): any;
    nemo_application_throughput_uplink(data: any, opts: any): {
        UL_TP: any;
    };
    nemo_attach_attempt(data: any, opts: any): {
        ATTACH_ATTEMPT: any;
    };
    nemo_ftp_server_connection_attempt(data: any, opts: any): {
        FTP_CONNECT_ATTEMPT: any;
    };
    nemo_intra_handover(data: any, opts: any): any;
    nemo_irat_handover(data: any, opts: any): any;
    nemo_volte_call(data: any, opts: any): {
        VOLTE_CALL_ATTEMPT: any;
        VOLTE_CALL_CONNECTED: any;
        VOLTE_CALL_DROP: any;
    };
    nemo_csfb_call(data: any, opts: any): {
        CSFB_CALL_ATTEMPT: any;
        CSFB_CALL_CONNECTED: any;
        CSFB_CALL_DROP: any;
    };
    nemo_call(data: any, opts: any): {
        CALL_ATTEMPT: any;
        CALL_CONNECTED: any;
        CALL_DROP: any;
    };
    nemo_packet_data_setup(data: any, opts: any): {
        PACKET_DATA_SETUP_ATTEMPT: any;
        PACKET_DATA_SETUP_SUCCESS: any;
        PACKET_DATA_DROP: any;
    };
    nemo_data_server_setup(data: any, opts: any): {
        DATA_CONNECT_ATTEMPT: any;
        DATA_CONNECT_SUCCESS: any;
        DATA_SETUP_TIME: any;
    };
    nemo_tracking_area_update(data: any, opts: any): {
        TRACKING_AREA_UPDATE_ATTEMPT: any;
        TRACKING_AREA_UPDATE_SUCCESS: any;
    };
    nemo_pdsch_bler(data: any, opts: any): {
        PDSCH_BLER: any;
    };
    nemo_mos_quality(data: any, opts: any): {
        MOS_QUALITY: any;
    };
    nemo_ue_measurement(data: any, opts: any): {
        "RSRP_RSRQ": any;
        "SINR": any;
    };
    nemo_ue_measurement_umts(data: any, opts: any): {
        "RSCP_ECNO": any;
    };
    nemo_rlc_bler(data: any, opts: any): {
        "RLC_BLER": any;
    };
    nemo_l3_message(data: any, opts: any): {
        "L3_MESSAGE": any;
    };
    nemo_sip_message(data: any, opts: any): {
        "SIP_MESSAGE": any;
    };
}

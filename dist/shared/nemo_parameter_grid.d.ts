export declare class NemoParameterGrid {
    constructor();
    private nemo_scanner_field_n_best;
    private GetEpochTime;
    nemo_scanner_measurement(data: any): {
        'SCANNER_RSRP': any[];
        'SCANNER_CINR': any[];
        'SCANNER_RSRQ': any[];
    };
    nemo_application_throughput_downlink_filter_sinr(data: any, sinr_value: number): {
        DL_TP: any;
        DL_TP_SNR: any[];
    };
    nemo_application_throughput_uplink(data: any, filter?: any): {
        UL_TP: any;
    };
    nemo_attach_attempt(data: any, filter?: any): {
        ATTACH_ATTEMPT: any;
    };
    nemo_ftp_server_connection_attempt(data: any, filter?: any): {
        FTP_CONNECT_ATTEMPT: any;
    };
    nemo_intra_handover(data: any, filter?: any): any;
    nemo_irat_handover(data: any, filter?: any): any;
    nemo_volte_call(data: any, filter?: any): {
        VOLTE_CALL_ATTEMPT: any;
        VOLTE_CALL_CONNECTED: any;
        VOLTE_CALL_DROP: any;
    };
    nemo_csfb_call(data: any, filter?: any): {
        CSFB_CALL_ATTEMPT: any;
        CSFB_CALL_CONNECTED: any;
        CSFB_CALL_DROP: any;
    };
    nemo_packet_data_setup(data: any, filter?: any): {
        PACKET_DATA_SETUP_ATTEMPT: any;
        PACKET_DATA_SETUP_SUCCESS: any;
        PACKET_DATA_DROP: any;
    };
    nemo_data_server_setup(data: any, filter?: any): {
        DATA_CONNECT_ATTEMPT: any;
        DATA_CONNECT_SUCCESS: any;
        DATA_SETUP_TIME: any;
    };
    nemo_tracking_area_update(data: any, filter?: any): {
        TRACKING_AREA_UPDATE_ATTEMPT: any;
        TRACKING_AREA_UPDATE_SUCCESS: any;
    };
    nemo_pdsch_bler(data: any, filter?: any): {
        PDSCH_BLER: any;
    };
    nemo_mos_quality(data: any, filter?: any): {
        AQDL: any;
    };
}

# nemoparser

Class NemoParser
- Function

> displayGrid (NemoParameter|Array[String], opts) : Observer
    *For NemoParameter options, refer to Nemo Parameter Section

    opts parameters:
    > fileBuffer|Array[LogfileBuffer]
    > files | FileList


Class LogfileBuffer
> Constructor (fileBuffer|FileString, filename|string)

Nemo Parameter
- LTE_FDD_SCANNER_MEASUREMENT
    
    DisplayGrid return result format as follow:
    ```
    {
        SCANNER_RSRP:Array[]{
            RSRP | float,
            TIME | string,
            CH | string,
            file | string,
            LAT | float (degree),
            LON | float (degree),
            duplicate | boolean
        },
        SCANNER_CINR:Array[]{
            CINR | float,
            TIME | string,
            CH | string,
            file | string,
            LAT | float (degree),
            LON | float (degree),
            duplicate | boolean
        },
        SCANNER_RSRQ:Array[]{
            RSRQ | float,
            TIME | string,
            CH | string,
            file | string,
            LAT | float (degree),
            LON | float (degree),
            duplicate | boolean
        }
    }
    ```

- LTE_TDD_SCANNER_MEASUREMENT

    DisplayGrid return result format as follow:
    {
        SCANNER_RSRP:Array[]{
            RSRP | float,
            TIME | string,
            CH | string,
            file | string,
            LAT | float (degree),
            LON | float (degree),
            duplicate | boolean
        },
        SCANNER_CINR:Array[]{
            CINR | float,
            TIME | string,
            CH | string,
            file | string,
            LAT | float (degree),
            LON | float (degree),
            duplicate | boolean
        },
        SCANNER_RSRQ:Array[]{
            RSRQ | float,
            TIME | string,
            CH | string,
            file | string,
            LAT | float (degree),
            LON | float (degree),
            duplicate | boolean
        }
    }

- APPLICATION_THROUGHPUT_DOWNLINK_SINR_FILTER
    
    DisplayGrid return result format as follow: 
    {
        DL_TP:Array[]number,    # Array of DL throughput with no SNR filter
        DL_TP_SNR:Arrray[]{     # Array of DL throughput with SNR >= threshold
            CINR | float
            DL | integer
            TIME | string
        }
    }

- APPLICATION_THROUGHPUT_UPLINK

    DisplayGrid return result format as follow:
    {
        UL_TP | Array[]number
    }
    
- ATTACH_ATTEMPT

    DisplayGrid return result format as follow:
    {
        ATTACH_ATTEMPT | number     # number of attach attempt from UE
    }

- FTP_CONNECTION_ATTEMPT

    DisplayGrid return result format as follow:
    {
        FTP_CONNECT_ATTEMPT | number    # number of ftp attempt transfer from UE
    }

- INTRA_HANDOVER

    DisplayGrid return result format as follow:
    {
        HANDOVER_SUCCESS | number,   # number of handover success from UE
        HANDOVER_ATTEMPT | number,   # number of handover attempt from UE
    }

- IRAT_HANDOVER

    DisplayGrid return result format as follow:
    {
        HANDOVER_SUCCESS | number,   # number of handover success from UE
        HANDOVER_ATTEMPT | number,   # number of handover attempt from UE
    }
    
- VOLTE_CALL

    DisplayGrid return result format as follow:
    {
        VOLTE_CALL_ATTEMPT:Array[]{
            TIME | string,
            CALL_CONTEXT | string, 
            MEAS_SYSTEM | string, 
            CALL_TYPE | string,
            file | string,
            LAT | float,
            LON | float
            terminated: {
                TIME | string, 
                CALL_CONTEXT | string,
                MEAS_SYSTEM | string,
                CALL_STATUS | string,
                file | string,
                LAT | float,
                LON | float,
            }
        },
        VOLTE_CALL_CONNECTED:Array[]{
            TIME | string,
            CALL_CONTEXT | string,
            MEAS_SYSTEM | string,
            CALL_TYPE | string,
            CALL_STATUS | string, 
            file | string,
            LAT | float,
            LON | float,
            SETUP_TIME | integer    # in miliseconds
        },
        VOLTE_CALL_DROP:Array[]{
            TIME | string,
            CALL_CONTEXT | string,
            MEAS_SYSTEM | string,
            CALL_TYPE | string,
            DROP_REASON | string
        }
    }
- CSFB_CALL

    DisplayGrid return result format as follow:
    {
        CSFB_CALL_ATTEMPT:Array[]{
            TIME | string,
            CALL_CONTEXT | string, 
            MEAS_SYSTEM | string, 
            CALL_TYPE | string,
            file | string,
            LAT | float,
            LON | float
            terminated: {
                TIME | string, 
                CALL_CONTEXT | string,
                MEAS_SYSTEM | string,
                CALL_STATUS | string,
                file | string,
                LAT | float,
                LON | float,
            }
        },
        CSFB_CALL_CONNECTED:Array[]{
            TIME | string,
            CALL_CONTEXT | string,
            MEAS_SYSTEM | string,
            CALL_TYPE | string,
            CALL_STATUS | string, 
            file | string,
            LAT | float,
            LON | float,
            SETUP_TIME | integer    # in miliseconds
        },
        CSFB_CALL_DROP:Array[]{
            TIME | string,
            CALL_CONTEXT | string,
            MEAS_SYSTEM | string,
            CALL_TYPE | string,
            DROP_REASON | string
        }
    }

- PDP_CONTEXT_SETUP

    DisplayGrid return result format as follow:
    {
        PACKET_DATA_DROP | number,
        PACKET_DATA_SETUP_ATTEMPT | number,
        PACKET_DATA_SETUP_SUCCESS | number,
    }

- DATA_CONNECTION_SETUP

    DisplayGrid return result format as follow:
    {
        DATA_CONNECT_ATTEMPT | number, 
        DATA_CONNECT_SUCCESS | number,
        DATA_SETUP_TIME | Array[]number     # UE Data Setup Time in milisecond
    }

- TRACKING_AREA_UPDATE

    DisplayGrid return result format as follow:
    {
        TRACKING_AREA_UPDATE_SUCCESS | number, 
        TRACKING_AREA_UPDATE_ATTEMPT | number,
    }

- PDSCH_BLER
    
    DisplayGrid return result format as follow:
    {
        PDSCH_BLER | Array[]number 
    }

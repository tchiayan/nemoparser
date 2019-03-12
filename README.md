# nemoparser

Class NemoParser
- Function

> displayGrid (NemoParameter|Array[String], opts) : Observer
    *For NemoParameter options, refer to Nemo Parameter Section

    opts parameters:
    > fileBuffer|Array[LogfileBuffer]
    > files | FileList
    > nemoOptionalParameter | any

> convertToFeaturesCollection(data|Array[Object], ColorSet?|Array[Object])

    Return
    ```
    {
        geojson: GeoJSON | FeatureCollection,
        file: filename | string
    }
    ```


Class LogfileBuffer
> Constructor (fileBuffer|FileString, filename|string)

Nemo Parameter
- LTE_FDD_SCANNER_MEASUREMENT
    
    Optional Parameter: 
    ```
    {
        polygon: geoJSON, \\filter area
        filter_channel?: Array[] string \\filter scanning channel 
    }
    ```

    DisplayGrid return result format as follow:
    ```
    {
        SCANNER_RSRP:Array[]{
            RSRP | float,
            TIME | string,
            CH | string,
            FILE | string,
            LAT | float (degree),
            LON | float (degree),
            duplicate | boolean
        },
        SCANNER_CINR:Array[]{
            CINR | float,
            TIME | string,
            CH | string,
            FILE | string,
            LAT | float (degree),
            LON | float (degree),
            duplicate | boolean
        },
        SCANNER_RSRQ:Array[]{
            RSRQ | float,
            TIME | string,
            CH | string,
            FILE | string,
            LAT | float (degree),
            LON | float (degree),
            duplicate | boolean
        }
    }
    ```

- LTE_TDD_SCANNER_MEASUREMENT

    Optional Parameter: 
    ```
    {
        polygon: geoJSON | JSON, \\filter area
        filter_channel?: Array[] string \\filter scanning channel
    }
    ```

    DisplayGrid return result format as follow:
    ```
    {
        SCANNER_RSRP:Array[]{
            RSRP | float,
            TIME | string,
            CH | string,
            FILE | string,
            LAT | float (degree),
            LON | float (degree),
            duplicate | boolean
        },
        SCANNER_CINR:Array[]{
            CINR | float,
            TIME | string,
            CH | string,
            FILE | string,
            LAT | float (degree),
            LON | float (degree),
            duplicate | boolean
        },
        SCANNER_RSRQ:Array[]{
            RSRQ | float,
            TIME | string,
            CH | string,
            FILE | string,
            LAT | float (degree),
            LON | float (degree),
            duplicate | boolean
        }
    }
    ```

- UMTS_SCANNER_MEASUREMENT

    Optional Parameter: 
    ```
    {
        polygon: geoJSON | JSON, \\filter area
        filter_channel?: Array[] string \\filter scanning channel
    }
    ```

    DisplayGrid return result format as follow:
    ```
    {
        SCANNER_RSCP:Array[]{
            RSCP | float,
            TIME | string,
            CH | string,
            FILE | string,
            LAT | float (degree),
            LON | float (degree),
            duplicate | boolean
        },
        SCANNER_ECNO:Array[]{
            ECNO | float,
            TIME | string,
            CH | string,
            FILE | string,
            LAT | float (degree),
            LON | float (degree),
            duplicate | boolean
        }
    }
    ```

- APPLICATION_THROUGHPUT_DOWNLINK
    
    Optional Parameter: 
    ```
    {
        polygon: geoJSON, //filter area
        sinr_value?: number, //filter dl throughput sample that SNR > sinr_value
    }
    ```

    DisplayGrid return result format as follow: 
    ```
    {
        DL_TP:Array[]number,    # Array of DL throughput with no SNR filter
        DL_TP_SNR:Arrray[]{     # Array of DL throughput with SNR >= threshold
            CINR | float
            DL | integer
            TIME | string
        }
    }
    ```

- APPLICATION_THROUGHPUT_UPLINK

    Optional Parameter: 
    ```
    {
        polygon: geoJSON \\filter area
    }
    ```

    DisplayGrid return result format as follow:
    ```
    {
        UL_TP | Array[]number
    }
    ```
    
- ATTACH_ATTEMPT

    Optional Parameter: 
    ```
    {
        polygon: geoJSON \\filter area
    }
    ```

    DisplayGrid return result format as follow:
    ```
    {
        ATTACH_ATTEMPT | number     # number of attach attempt from UE
    }
    ```

- FTP_CONNECTION_ATTEMPT

    Optional Parameter: 
    ```
    {
        polygon: geoJSON \\filter area
    }
    ```

    DisplayGrid return result format as follow:
    ```
    {
        FTP_CONNECT_ATTEMPT | number    # number of ftp attempt transfer from UE
    }
    ```

- INTRA_HANDOVER

    Optional Parameter: 
    ```
    {
        polygon: geoJSON \\filter area
    }
    ```

    DisplayGrid return result format as follow:
    ```
    {
        HANDOVER_SUCCESS | number,   # number of handover success from UE
        HANDOVER_ATTEMPT | number,   # number of handover attempt from UE
    }
    ```

- IRAT_HANDOVER

    Optional Parameter: 
    ```
    {
        polygon: geoJSON \\filter area
    }
    ```

    DisplayGrid return result format as follow:
    ```
    {
        HANDOVER_SUCCESS | number,   # number of handover success from UE
        HANDOVER_ATTEMPT | number,   # number of handover attempt from UE
    }
    ```
    
- VOLTE_CALL

    Optional Parameter: 
    ```
    {
        polygon: geoJSON \\filter area
    }
    ```

    DisplayGrid return result format as follow:
    ```
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
    ```

- CSFB_CALL

    Optional Parameter: 
    ```
    {
        polygon: geoJSON \\filter area
    }
    ```

    DisplayGrid return result format as follow:
    ```
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
            SETUP_TIME | integer    # in miliseconds, setup time from call attempt to call connected
        },
        CSFB_CALL_DROP:Array[]{
            TIME | string,
            CALL_CONTEXT | string,
            MEAS_SYSTEM | string,
            CALL_TYPE | string,
            DROP_REASON | string
        }
    }
    ```

- PDP_CONTEXT_SETUP

    Optional Parameter: 
    ```
    {
        polygon: geoJSON \\filter area
    }
    ```

    DisplayGrid return result format as follow:
    ```
    {
        PACKET_DATA_DROP | number,
        PACKET_DATA_SETUP_ATTEMPT | number,
        PACKET_DATA_SETUP_SUCCESS | number,
    }
    ```

- DATA_CONNECTION_SETUP

    Optional Parameter: 
    ```
    {
        polygon: geoJSON \\filter area
    }
    ```

    DisplayGrid return result format as follow:
    ```
    {
        DATA_CONNECT_ATTEMPT | number, 
        DATA_CONNECT_SUCCESS | number,
        DATA_SETUP_TIME | Array[]number     # UE Data Setup Time in milisecond
    }
    ```

- TRACKING_AREA_UPDATE

    Optional Parameter: 
    ```
    {
        polygon: geoJSON \\filter area
    }
    ```

    DisplayGrid return result format as follow:
    ```
    {
        TRACKING_AREA_UPDATE_SUCCESS | number, 
        TRACKING_AREA_UPDATE_ATTEMPT | number,
    }
    ```

- PDSCH_BLER
    
    Optional Parameter: 
    ```
    {
        polygon: geoJSON \\filter area
    }
    ```

    DisplayGrid return result format as follow:
    ```
    {
        PDSCH_BLER | Array[]number (float)
    }
    ```

- LTE_FDD_UE_MEASUREMENT
    
    Optional Parameter: 
    ```
    {
        polygon: geoJSON \\filter area
    }
    ```

    DisplayGrid return result format as follow:
    ```
    {
        RSRP_RSRQ: Array[]{
            RSRP: float,
            RSRQ: float, 
            CELLTYPE: string,
            LAT: float, // degree
            LON: float, // degree
            CHANNEL: string,
            TIME: string,
            FILE: string,
        },
        SINR: Array[]{
            TIME: string,
            CINR: float,
            CELLTYPE: string,
            file: string,
            LAT: float, // degree
            LON: float, // degree
        }
    }
    ```

- LTE_TDD_UE_MEASUREMENT
    
    Optional Parameter: 
    ```
    {
        polygon: geoJSON \\filter area
    }
    ```

    DisplayGrid return result format as follow:
    ```
    {
        RSRP_RSRQ: Array[]{
            RSRP: float,
            RSRQ: float, 
            CELLTYPE: string,
            LAT: float, // degree
            LON: float, // degree
            CHANNEL: string,
            TIME: string,
            FILE: string,
        },
        SINR:{
            TIME: string,
            CINR: float,
            CELLTYPE: string,
            file: string,
            LAT: float, // degree
            LON: float, // degree
        }
    }
    ```

- UMTS_UE_MEASUREMENT
 
    Optional Parameter: 
    ```
    {
        polygon: geoJSON \\filter area
    }
    ```

    DisplayGrid return result format as follow:
    ```
    {
        RSCP_ECNO: Array[]{
            RSCP: float,
            ECNO: float, 
            LAT: float, // degree
            LON: float, // degree
            CHANNEL: string,
            TIME: string,
            FILE: string,
        }
    }
    ```

- AUDIO_QUALITY_MOS
    
    Optional Parameter: 
    ```
    {
        polygon: geoJSON, \\filter area
        vq_type_dl?: string ('PESQ_NB' or 'POLQA_NB' or 'any' ) \\ optional, if no specified, any is used
    }
    ```

    DisplayGrid return result format as follow:
    ```
    {
        MOS_QUALITY: Array[]number
    }
    ```

- RLC_BLER

    DisplayGrid return result format as follow:
    ```
    {
        RLC_BLER: Array[]number (float)
    }
    ```

- L3_MESSAGE

    DisplayGrid return result format as follow:
    ```
    {
        L3_MESSAGE: Array[]{
            FILE: string,
            TIME: string,
            ETIME: number,
            MESSAGE: string,
            SYSTEM: string, // Refer to nemo measurement system format
        }
    }
    ```
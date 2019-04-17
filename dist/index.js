"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var DECODER = require("./shared/nemo_decoder");
var rxjs_1 = require("rxjs");
var nemo_parameter_grid_1 = require("./shared/nemo_parameter_grid");
var nemo_geojson_1 = require("./shared/nemo_geojson");
var nemo_file_1 = require("./shared/nemo_file");
var LogfileBuffer = /** @class */ (function () {
    function LogfileBuffer(data, filename) {
        return { data: data, filename: filename };
    }
    return LogfileBuffer;
}());
exports.LogfileBuffer = LogfileBuffer;
var NemoParser = /** @class */ (function () {
    function NemoParser() {
        this.nemoParamGrid = new nemo_parameter_grid_1.NemoParameterGrid();
    }
    NemoParser.prototype.getInfo = function (cols, format, extras, skip_null) {
        if (extras === void 0) { extras = null; }
        if (skip_null === void 0) { skip_null = true; }
        var filter = [];
        Object.keys(format.filter).forEach(function (c) {
            var _c = parseInt(c);
            if (!cols[_c]) {
                filter.push(false);
            }
            else if (typeof format.filter[_c] === 'object') {
                if (!isNaN(parseInt(cols[_c]))) {
                    filter.push(eval(cols[_c] + format.filter[c]['condition']));
                }
                else {
                    filter.push(false);
                }
            }
            else {
                filter.push(cols[_c] == format.filter[c]);
            }
        });
        if (!filter.includes(false)) {
            var output_1 = {};
            Object.keys(format.output).forEach(function (f) {
                if (f !== 'loop') {
                    if (typeof format.output[f] == 'string') {
                        output_1[f] = format.output[f];
                    }
                    else {
                        output_1[f] = cols[format.output[f]];
                    }
                }
                else {
                    var n = void 0, p_1, s_1, c_1;
                    if (typeof format.output[f]['n'] == 'object') {
                        // s = starting, p = seperationg,  n = number 
                        var oc = format.output[f]['n']['oc'] ? parseInt(cols[format.output[f]['n']['oc']]) : 0;
                        var st = format.output[f]['n']['s'] + oc;
                        var nu = parseInt(cols[format.output[f]['n']['n']]);
                        var sp = parseInt(cols[format.output[f]['n']['p']]);
                        s_1 = st + nu * sp + 2;
                        n = parseInt(cols[st + nu * sp]);
                        //console.log(st,nu,sp)
                    }
                    else {
                        if (format.output[f]['oc']) {
                            var oc = parseInt(cols[format.output[f]['oc']]);
                            s_1 = format.output[f]['s'] + oc + 2;
                            n = parseInt(cols[format.output[f]['n'] + oc]);
                        }
                        else {
                            n = parseInt(cols[format.output[f]['n']]);
                            s_1 = format.output[f]['s'];
                        }
                    }
                    p_1 = format.output[f]['p'];
                    c_1 = format.output[f]['c'];
                    output_1['loop'] = [];
                    for (var i = 0; i < n; i++) {
                        var subfield = {};
                        Object.keys(c_1).forEach(function (field) {
                            var cf = c_1[field];
                            subfield[field] = cols[s_1 + i * p_1 + cf];
                            //subfield['rsrp'] = ""
                        });
                        if (extras) {
                            Object.assign(subfield, extras);
                            //if(subfield['EARFCN'] != output['EARFCN']) continue;
                        }
                        if (output_1['TIME'] == "06:27:40.650")
                            console.log(subfield);
                        //check if any value is empty then skip for adding
                        if (skip_null) {
                            if (Object.values(subfield).includes("")) {
                                //console.log(subfield)
                                continue;
                            }
                        }
                        output_1['loop'].push(subfield);
                    }
                }
            });
            return output_1;
        }
        else {
            return false;
        }
    };
    NemoParser.prototype.parseLogfile = function (files, extraction) {
        var _this = this;
        var output = {};
        var filecount = files.length;
        return rxjs_1.Observable.create(function (observer) {
            var _loop_1 = function (i, f) {
                var reader = new FileReader();
                reader.onload = function (log) {
                    var lines = reader.result.split("\n");
                    if (!(lines[lines.length - 2].split(",")[0] === '#HASH' || lines[lines.length - 1].split(",")[0] === '#HASH')) {
                        console.warn("File invalid:", f.name);
                    }
                    var GPS_RESULT = { LAT: 0, LON: 0 };
                    for (var j = 0, r = void 0; r = lines[j]; j++) {
                        var columns = r.split(",");
                        //console.log(columns)
                        if (columns[0] == 'GPS') {
                            GPS_RESULT = { LAT: parseFloat(columns[4]), LON: parseFloat(columns[3]) };
                        }
                        else if (columns[0] in extraction) {
                            var result = _this.getInfo(columns, extraction[columns[0]], null, false);
                            if (result) {
                                if (columns[0] in output) {
                                    /*if('TIME' in result){
                                        if(result.TIME==output[columns[0]][output[columns[0]].length-1].TIME){
                                            continue
                                        }
                                    }*/
                                    output[columns[0]].push(__assign({}, result, { 'file': f.name }, GPS_RESULT));
                                }
                                else {
                                    output[columns[0]] = [__assign({}, result, { 'file': f.name }, GPS_RESULT)];
                                }
                            }
                        }
                    }
                    if (!--filecount) {
                        for (var type in extraction) {
                            if (!(type in output)) {
                                output[type] = [];
                            }
                        }
                        observer.next({ status: 'OK', result: output });
                        observer.complete();
                        //this.workerCtx.postMessage({ status: 'OK', data: output })
                    }
                    else {
                        observer.next({ status: 'PROGRESS', progress: filecount / files.length });
                        //this.workerCtx.postMessage({ status: 'PROGRESS', value: filecount / files.length })
                    }
                };
                reader.readAsText(f);
                //reader.readAsArrayBuffer(f)
            };
            for (var i = 0, f = void 0; f = files[i]; i++) {
                _loop_1(i, f);
            }
        });
    };
    NemoParser.prototype.parseBuffer = function (buffers, extraction) {
        var _this = this;
        var output = {};
        var totalBuffer = buffers.length;
        var countBuffer = 1;
        return rxjs_1.Observable.create(function (observer) {
            for (var _i = 0, buffers_1 = buffers; _i < buffers_1.length; _i++) {
                var _buffer = buffers_1[_i];
                var lines = _buffer.data.split("\n");
                var GPS_RESULT = { LAT: 0, LON: 0 };
                if (!(lines[lines.length - 2].split(",")[0] === '#HASH' || lines[lines.length - 1].split(",")[0] === '#HASH')) {
                    //console.warn("File invalid:", _buffer.filename)
                }
                for (var j = 0, r = void 0; r = lines[j]; j++) {
                    var columns = r.split(",");
                    //console.log(columns)
                    if (columns[0] == 'GPS') {
                        GPS_RESULT = { LAT: parseFloat(columns[4]), LON: parseFloat(columns[3]) };
                    }
                    else if (columns[0] in extraction) {
                        var result = _this.getInfo(columns, extraction[columns[0]], null, false);
                        if (result) {
                            if (columns[0] in output) {
                                /*if('TIME' in result){
                                    if(result.TIME==output[columns[0]][output[columns[0]].length-1].TIME){
                                        continue
                                    }
                                }*/
                                output[columns[0]].push(__assign({}, result, { 'file': _buffer.filename }, GPS_RESULT));
                            }
                            else {
                                output[columns[0]] = [__assign({}, result, { 'file': _buffer.filename }, GPS_RESULT)];
                            }
                        }
                    }
                }
                if (countBuffer === totalBuffer) {
                    for (var type in extraction) {
                        if (!(type in output)) {
                            output[type] = [];
                        }
                    }
                    observer.next({ status: 'OK', result: output });
                    observer.complete();
                    //this.workerCtx.postMessage({ status: 'OK', data: output })
                }
                else {
                    observer.next({ status: 'PROGRESS', progress: countBuffer / totalBuffer });
                    //this.workerCtx.postMessage({ status: 'PROGRESS', value: filecount / files.length })
                }
                countBuffer++;
            }
        });
    };
    NemoParser.prototype.displayGrid = function (nemo_params, option) {
        var _this = this;
        var extraction = {};
        var function_call = [];
        for (var _i = 0, nemo_params_1 = nemo_params; _i < nemo_params_1.length; _i++) {
            var param = nemo_params_1[_i];
            switch (param) {
                case 'LTE_FDD_SCANNER_MEASUREMENT':
                    if (!('OFDMSCAN' in extraction))
                        extraction['OFDMSCAN'] = DECODER.LTE_FDD_SCANNER;
                    break;
                case 'LTE_TDD_SCANNER_MEASUREMENT':
                    if (!('OFDMSCAN' in extraction))
                        extraction['OFDMSCAN'] = DECODER.LTE_TDD_SCANNER;
                    break;
                case 'UMTS_SCANNER_MEASUREMENT':
                    if (!('PILOTSCAN' in extraction))
                        extraction['PILOTSCAN'] = DECODER.UMTS_SCANNER;
                    break;
                case 'LTE_TDD_UE_MEASUREMENT':
                    if (!('CELLMEAS' in extraction))
                        extraction['CELLMEAS'] = DECODER.UE_LTE_TDD_CELLMEAS;
                    if (!('CI' in extraction))
                        extraction['CI'] = DECODER.UE_LTE_TDD_CI;
                    break;
                case 'LTE_FDD_UE_MEASUREMENT':
                    if (!('CELLMEAS' in extraction))
                        extraction['CELLMEAS'] = DECODER.UE_LTE_FDD_CELLMEAS;
                    if (!('CI' in extraction))
                        extraction['CI'] = DECODER.UE_LTE_FDD_CI;
                    break;
                case 'UMTS_UE_MEASUREMENT':
                    if (!('CELLMEAS' in extraction))
                        extraction['CELLMEAS'] = DECODER.UE_UMTS_CELLMEAS;
                    break;
                case 'APPLICATION_THROUGHPUT_DOWNLINK':
                    if (!('DRATE' in extraction))
                        extraction['DRATE'] = DECODER.DRATE_DL;
                    if (!('CI' in extraction))
                        extraction['CI'] = DECODER.UE_LTE_CI;
                    if (!('DREQ' in extraction))
                        extraction['DREQ'] = DECODER.UE_DATA_TRANSFER_ATTEMPT;
                    if (!('DCOMP' in extraction))
                        extraction['DCOMP'] = DECODER.UE_DATA_TRANSFER_COMPLETE;
                    break;
                case 'APPLICATION_THROUGHPUT_UPLINK':
                    if (!('DRATE' in extraction))
                        extraction['DRATE'] = DECODER.DRATE_UL;
                    if (!('DREQ' in extraction))
                        extraction['DREQ'] = DECODER.UE_DATA_TRANSFER_ATTEMPT;
                    break;
                case 'ATTACH_ATTEMPT':
                    if (!('GAA' in extraction))
                        extraction['GAA'] = DECODER.UE_GAA_ATTACH_ATTEMPT;
                    break;
                case 'FTP_CONNECTION_ATTEMPT':
                    if (!('DAA' in extraction))
                        extraction['DAA'] = DECODER.UE_DAA;
                    break;
                case 'INTRA_HANDOVER':
                    if (!('HOA' in extraction))
                        extraction['HOA'] = DECODER.UE_HOA;
                    if (!('HOS' in extraction))
                        extraction['HOS'] = DECODER.UE_HOS;
                    if (!('HOF' in extraction))
                        extraction['HOF'] = DECODER.UE_HOF;
                    break;
                case 'IRAT_HANDOVER':
                    if (!('HOA' in extraction))
                        extraction['HOA'] = DECODER.UE_HOA;
                    if (!('HOS' in extraction))
                        extraction['HOS'] = DECODER.UE_HOS;
                    break;
                case 'VOLTE_CALL':
                    if (!('CAA' in extraction))
                        extraction['CAA'] = DECODER.UE_CAA;
                    if (!('CAC' in extraction))
                        extraction['CAC'] = DECODER.UE_CAC;
                    if (!('CAF' in extraction))
                        extraction['CAF'] = DECODER.UE_CAF;
                    if (!('CAD' in extraction))
                        extraction['CAD'] = DECODER.UE_CAD;
                    break;
                case 'CSFB_CALL':
                    if (!('CAA' in extraction))
                        extraction['CAA'] = DECODER.UE_CAA;
                    if (!('CAC' in extraction))
                        extraction['CAC'] = DECODER.UE_CAC;
                    if (!('CAF' in extraction))
                        extraction['CAF'] = DECODER.UE_CAF;
                    if (!('CAD' in extraction))
                        extraction['CAD'] = DECODER.UE_CAD;
                    if (!('L3SM' in extraction))
                        extraction['L3SM'] = DECODER.UE_L3SM;
                    break;
                case 'CALL':
                    if (!('CAA' in extraction))
                        extraction['CAA'] = DECODER.UE_CAA;
                    if (!('CAC' in extraction))
                        extraction['CAC'] = DECODER.UE_CAC;
                    if (!('CAF' in extraction))
                        extraction['CAF'] = DECODER.UE_CAF;
                    if (!('CAD' in extraction))
                        extraction['CAD'] = DECODER.UE_CAD;
                    if (!('L3SM' in extraction))
                        extraction['L3SM'] = DECODER.UE_L3SM;
                    break;
                case 'PDP_CONTEXT_SETUP':
                    if (!('PAA' in extraction))
                        extraction['PAA'] = DECODER.UE_PAA;
                    if (!('PAC' in extraction))
                        extraction['PAC'] = DECODER.UE_PAC;
                    if (!('PAD' in extraction))
                        extraction['PAD'] = DECODER.UE_PAD;
                    break;
                case 'DATA_CONNECTION_SETUP':
                    if (!('DAA' in extraction))
                        extraction['DAA'] = DECODER.UE_DAA;
                    if (!('DAC' in extraction))
                        extraction['DAC'] = DECODER.UE_DAC;
                    break;
                case 'TRACKING_AREA_UPDATE':
                    if (!('TUA' in extraction))
                        extraction['TUA'] = DECODER.UE_TUA;
                    if (!('TUS' in extraction))
                        extraction['TUS'] = DECODER.UE_TUS;
                    break;
                case 'PDSCH_BLER':
                    if (!('PHRATE' in extraction))
                        extraction['PHRATE'] = DECODER.UE_BLER;
                    break;
                case 'AUDIO_QUALITY_MOS':
                    if (!('AQDL' in extraction))
                        extraction['AQDL'] = DECODER.UE_AUDIO_MOS;
                    break;
                case 'RLC_BLER':
                    if (!('RLCBLER' in extraction))
                        extraction['RLCBLER'] = DECODER.UE_RLC_BLER;
                    break;
                case 'L3_MESSAGE':
                    if (!('L3SM' in extraction))
                        extraction['L3SM'] = DECODER.UE_L3SM;
                    break;
                case 'SIP_MESSAGE':
                    if (!('SIPSM' in extraction))
                        extraction['SIPSM'] = DECODER.UE_SIPSM;
                    break;
                case 'RRC_MESSAGE':
                    if (!('RRCSM' in extraction))
                        extraction['RRCSM'] = DECODER.UE_RRCSM;
                    break;
            }
        }
        return rxjs_1.Observable.create(function (observer) {
            var subFunction = function (data) {
                //console.log(data)
                var opts = option.nemo_opts ? option.nemo_opts : {};
                if (data.status == 'OK') {
                    observer.next({ status: 'CALCULATING' });
                    var result = {};
                    for (var _i = 0, nemo_params_2 = nemo_params; _i < nemo_params_2.length; _i++) {
                        var param = nemo_params_2[_i];
                        switch (param) {
                            case 'LTE_FDD_SCANNER_MEASUREMENT':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_lte_scanner_measurement(data.result, opts);
                                break;
                            case 'LTE_TDD_SCANNER_MEASUREMENT':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_lte_scanner_measurement(data.result, opts);
                                break;
                            case 'UMTS_SCANNER_MEASUREMENT':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_umts_scanner_measurement(data.result, opts);
                                break;
                            case 'LTE_TDD_UE_MEASUREMENT':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_ue_measurement(data.result, opts);
                                break;
                            case 'LTE_FDD_UE_MEASUREMENT':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_ue_measurement(data.result, opts);
                                break;
                            case 'UMTS_UE_MEASUREMENT':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_ue_measurement_umts(data.result, opts);
                                break;
                            case 'APPLICATION_THROUGHPUT_DOWNLINK':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_application_throughput_downlink_filter_sinr(data.result, opts);
                                break;
                            case 'APPLICATION_THROUGHPUT_UPLINK':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_application_throughput_uplink(data.result, opts);
                                break;
                            case 'ATTACH_ATTEMPT':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_attach_attempt(data.result, opts);
                                break;
                            case 'FTP_CONNECTION_ATTEMPT':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_ftp_server_connection_attempt(data.result, opts);
                                break;
                            case 'INTRA_HANDOVER':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_intra_handover(data.result, opts);
                                break;
                            case 'IRAT_HANDOVER':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_irat_handover(data.result, opts);
                                break;
                            case 'VOLTE_CALL':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_volte_call(data.result, opts);
                                break;
                            case 'CSFB_CALL':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_csfb_call(data.result, opts);
                                break;
                            case 'CALL':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_call(data.result, opts);
                                break;
                            case 'PDP_CONTEXT_SETUP':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_packet_data_setup(data.result, opts);
                                break;
                            case 'DATA_CONNECTION_SETUP':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_data_server_setup(data.result, opts);
                                break;
                            case 'TRACKING_AREA_UPDATE':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_tracking_area_update(data.result, opts);
                                break;
                            case 'PDSCH_BLER':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_pdsch_bler(data.result, opts);
                                break;
                            case 'AUDIO_QUALITY_MOS':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_mos_quality(data.result, opts);
                                break;
                            case 'RLC_BLER':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_rlc_bler(data.result, option);
                                break;
                            case 'L3_MESSAGE':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_l3_message(data.result, option);
                                break;
                            case 'RRC_MESSAGE':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_rrc_message(data.result, option);
                                break;
                            case 'SIP_MESSAGE':
                                result[param] = new nemo_parameter_grid_1.NemoParameterGrid().nemo_sip_message(data.result, option);
                                break;
                            default:
                                console.warn("No parameter found: " + param);
                        }
                    }
                    observer.next({ status: 'OK', result: result });
                    observer.complete();
                }
                else if (data.status == 'PROGRESS') {
                    observer.next({ status: 'PARSING', progress: data.progress });
                }
                else {
                    observer.error();
                    return "ERROR!";
                }
            };
            if (option.fileBuffer) {
                _this.parseBuffer(option.fileBuffer, extraction).subscribe(subFunction);
            }
            else if (option.files) {
                _this.parseLogfile(option.files, extraction).subscribe(subFunction);
            }
        });
    };
    NemoParser.prototype.convertToFeaturesCollection = function (data, lineString, ranges) {
        if (lineString === void 0) { lineString = true; }
        var GeoJSONParser = new nemo_geojson_1.NemoGeoJSON();
        var FILES = Array.from(new Set(data.map(function (entry) { return entry.FILE; })));
        var layers = FILES.map(function (file) {
            if (lineString) {
                return {
                    geojson: GeoJSONParser.convertToLineStringGeoJSON(data.filter(function (entry) { return entry.FILE === file; }), ranges),
                    file: file
                };
            }
            else {
                return {
                    geojson: GeoJSONParser.convertToPointGeoJSON(data.filter(function (entry) { return entry.FILE === file; })),
                    file: file
                };
            }
        });
        return layers;
    };
    return NemoParser;
}());
exports.NemoParser = NemoParser;
/*export class NemoFileUnzipper {
    constructor(){
    }

    public unzip(data):Promise<any>{
        return new Promise((resolve)=>{
            unzip(data).then((result)=>{
                let added = result.map((file)=>{
                    let details = (new NemoFile(file.data))
                    return {...file, ...details.getFileProperties(), group: details.grouping()}
                })
                resolve(added)
            })
        })
    }
}*/
var NemoFileReader = /** @class */ (function () {
    function NemoFileReader() {
    }
    NemoFileReader.prototype.parse = function (data) {
        return new nemo_file_1.NemoFile(data).getFileProperties();
    };
    return NemoFileReader;
}());
exports.NemoFileReader = NemoFileReader;

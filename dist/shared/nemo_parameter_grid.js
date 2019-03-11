"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var turf = require("@turf/turf");
//import { polygon } from '@turf/turf';
var NemoParameterGrid = /** @class */ (function () {
    function NemoParameterGrid() {
    }
    NemoParameterGrid.prototype.nemo_scanner_field_n_best = function (data, field) {
        var rfield = data.map(function (entry, index, array) {
            //let empty_field = {}
            //empty_field[field] = ''
            var top_field = {};
            top_field[field] = '';
            if (entry.loop.length !== 0) {
                var top_list = entry.loop.filter(function (meas) { return meas[field] !== ''; });
                if (top_list.length !== 0) {
                    var top_meas = top_list.map(function (meas) {
                        var temp = {};
                        temp[field] = parseFloat(meas[field]);
                        return temp;
                    }).sort(function (a, b) { return b[field] - a[field]; })[0];
                    top_field[field] = top_meas[field];
                }
            }
            else {
                /*if(index - CH_COUNT >= 0){
                    if(array[index-CH_COUNT].loop.length !== 0){
                        let top_list = array[index-CH_COUNT].loop.filter((meas)=>meas[field] !== '')
                        if(top_list.length !==0){
                            let top_meas = top_list.map((meas)=>{
                                let temp = {}
                                temp[field] = parseFloat(meas[field])
                                return temp
                            }).sort((a,b)=>b[field] - a[field])[0]
                            top_field[field] = top_meas[field]
                        }
                    }else{
                        console.log(`Empty loop: ${entry.EARFCN} FILE: ${entry.file}`)
                    }
                }else{
                    console.log(`No early loop: ${entry.EARFCN} FILE: ${entry.file}`)
                }*/
            }
            return __assign({}, top_field, { TIME: entry.TIME, CH: entry.EARFCN, FILE: entry.file, LAT: entry.LAT, LON: entry.LON });
        });
        var CH_COUNT = Array.from(new Set(data.map(function (entry) { return entry.EARFCN; }))).length;
        //console.log(Array.from(new Set(data.map(entry => entry.EARFCN))))
        //console.log(CH_COUNT)
        rfield = CH_COUNT === 1 ? rfield : rfield.map(function (entry, index, array) {
            if (entry[field] !== '') {
                return entry;
            }
            else {
                var ch = entry.CH;
                var i = --index;
                //console.log(`${array.length}|${i}|File:${entry.FILE}`)
                if (i < 0)
                    return entry;
                while (array[i].CH !== ch && i >= 0) {
                    --i;
                    if (i < 0)
                        break;
                }
                if (i < 0)
                    return entry;
                var new_entry = __assign({}, entry);
                new_entry[field] = array[i][field];
                return new_entry;
            }
        });
        rfield = rfield.filter(function (entry) { return entry[field] !== ""; }).map(function (entry, index, array) {
            if (index !== array.length - 1) {
                if (entry.TIME == array[index + 1].TIME) {
                    if (array[index + 1][field] < entry[field]) {
                        array[index + 1][field] = entry[field];
                        array[index + 1].CH = entry.CH;
                        array[index + 1].LAT = entry.LAT;
                        array[index + 1].LON = entry.LON;
                    }
                } // return duplicated and pass the maxvalue to next duplicated value
            }
            return __assign({}, entry, { duplicate: index !== array.length - 1 ? array[index + 1].TIME == entry.TIME : false });
        }).filter(function (entry) { return !entry.duplicate; }).map(function (entry, index, array) {
            var compare = [entry.CH];
            var i = index - 1;
            //console.log('current ch: '+array[i].CH)
            while (i !== -1) {
                if (compare.includes(array[i].CH)) {
                    i++;
                    break;
                }
                //console.log('push ch:'+array[i].CH)
                compare.push(array[i].CH);
                --i;
            }
            i = i != -1 ? i : 0;
            var max = array.slice(i, index + 1).reduce(function (acc, cur) {
                if (acc) {
                    return cur[field] > acc[field] ? cur : acc;
                }
                else {
                    return cur;
                }
            }, null);
            //console.log(`BEFORE: ${max.TIME} | ${entry.TIME}`)
            max.TIME = entry.TIME;
            //console.log(`AFTER: ${max.RSRP} | ${max.TIME} | ${max.CH}`)
            //console.log(max)
            max.LAT = entry.LAT;
            //console.log(`${entry.LON}|${entry.LAT}`)
            max.LON = entry.LON;
            return __assign({}, max);
        });
        //console.table(rfield)
        return rfield;
    };
    NemoParameterGrid.prototype.GetEpochTime = function (timeString) {
        return Date.parse("1970-01-01T" + timeString + "Z");
    };
    NemoParameterGrid.prototype.nemo_lte_scanner_measurement = function (data, opts) {
        //console.time("nemo_scanner_measurement")
        if (!data.OFDMSCAN)
            throw console.error('OFDMSCAN is not decoded while parsing logfile. Consider update decoder field.');
        var OFDMSCAN = data.OFDMSCAN;
        var files = Array.from(new Set(OFDMSCAN.map(function (entry) { return entry.file; })));
        var RSRP = [];
        var CINR = [];
        var RSRQ = [];
        var _loop_1 = function (file) {
            var filter_data = data.OFDMSCAN.filter(function (entry) { return entry.file == file; });
            /* filter channel */
            filter_data = ('filter_channel' in opts) ? filter_data.filter(function (entry) { return opts.filter_channel.includes(entry.EARFCN); }) : filter_data;
            RSRP = RSRP.concat(this_1.nemo_scanner_field_n_best(filter_data, 'RSRP'));
            CINR = CINR.concat(this_1.nemo_scanner_field_n_best(filter_data, 'CINR'));
            RSRQ = RSRQ.concat(this_1.nemo_scanner_field_n_best(filter_data, 'RSRQ'));
        };
        var this_1 = this;
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            _loop_1(file);
        }
        RSRP = ('polygon' in opts) ? RSRP.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: true }); }) : RSRP;
        CINR = ('polygon' in opts) ? CINR.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: true }); }) : CINR;
        RSRQ = ('polygon' in opts) ? RSRQ.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: true }); }) : RSRQ;
        //console.timeEnd("nemo_scanner_measurement")
        return { 'SCANNER_RSRP': RSRP, 'SCANNER_CINR': CINR, 'SCANNER_RSRQ': RSRQ };
    };
    NemoParameterGrid.prototype.nemo_umts_scanner_measurement = function (data, opts) {
        //console.time("nemo_scanner_measurement")
        if (!data.PILOTSCAN)
            throw console.error('PILOTSCAN is not decoded while parsing logfile. Consider update decoder field.');
        var PILOTSCAN = data.PILOTSCAN;
        var files = Array.from(new Set(PILOTSCAN.map(function (entry) { return entry.file; })));
        var RSCP = [];
        var ECNO = [];
        var _loop_2 = function (file) {
            var filter_data = data.PILOTSCAN.filter(function (entry) { return entry.file == file; });
            /* filter channel */
            filter_data = ('filter_channel' in opts) ? filter_data.filter(function (entry) { return opts.filter_channel.includes(entry.EARFCN); }) : filter_data;
            RSCP = RSCP.concat(this_2.nemo_scanner_field_n_best(filter_data, 'RSCP'));
            ECNO = ECNO.concat(this_2.nemo_scanner_field_n_best(filter_data, 'ECNO'));
        };
        var this_2 = this;
        for (var _i = 0, files_2 = files; _i < files_2.length; _i++) {
            var file = files_2[_i];
            _loop_2(file);
        }
        RSCP = ('polygon' in opts) ? RSCP.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: true }); }) : RSCP;
        ECNO = ('polygon' in opts) ? ECNO.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: true }); }) : ECNO;
        //console.timeEnd("nemo_scanner_measurement")
        return { 'SCANNER_RSCP': RSCP, 'SCANNER_ECNO': ECNO };
    };
    NemoParameterGrid.prototype.nemo_application_throughput_downlink_filter_sinr = function (data, opts) {
        var _this = this;
        //console.time("nemo_application_throughput_downlink_filter_sinr")
        if (!data.DRATE)
            throw console.error('DRATE is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CI)
            throw console.error('CI is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.DREQ)
            throw console.error('DREQ is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.DCOMP)
            throw console.error('DCOMP is not decoded while parsing logfile. Consider update decoder field.');
        data.DRATE = data.DRATE.map(function (entry) { return __assign({}, entry, { ETIME: _this.GetEpochTime(entry.TIME) }); });
        var file_list = Array.from(new Set(data.DRATE.map(function (entry) { return entry.file; })));
        var temp_DRATE = [];
        var _loop_3 = function (file) {
            var temp_drate = data.DRATE.filter(function (entry) { return entry.file == file; }).sort(function (a, b) { return a.ETIME - b.ETIME; });
            var _loop_5 = function (i) {
                if (!(i == 0)) {
                    temp_drate[i].LAT = temp_drate[i - 1].LAT;
                    temp_drate[i].LON = temp_drate[i - 1].LON;
                    temp_drate[i].TIME = temp_drate[i - 1].TIME;
                    temp_drate[i]['duplicate'] = temp_drate[i].ETIME == temp_drate[i - 1].ETIME;
                    temp_drate[i].ETIME = this_3.GetEpochTime(temp_drate[i].TIME);
                }
                else {
                    var DREQ = data.DREQ.find(function (entry) { return entry.file == temp_drate[i].file; });
                    temp_drate[i].LAT = DREQ.LAT;
                    temp_drate[i].LON = DREQ.LON;
                    temp_drate[i].TIME = DREQ.TIME;
                    temp_drate[i].ETIME = this_3.GetEpochTime(temp_drate[i].TIME);
                    temp_drate[i]['duplicate'] = false;
                }
            };
            //console.log(temp_drate)
            for (var i = temp_drate.length - 1; i >= 0; i--) {
                _loop_5(i);
            }
            temp_DRATE = temp_DRATE.concat(temp_drate);
        };
        var this_3 = this;
        for (var _i = 0, file_list_1 = file_list; _i < file_list_1.length; _i++) {
            var file = file_list_1[_i];
            _loop_3(file);
        }
        data.DRATE = temp_DRATE;
        data.DRATE.sort(function (a, b) { return a.ETIME - b.ETIME; });
        data.DRATE = data.DRATE.filter(function (entry) { return !entry.duplicate; });
        //data.DRATE.sort((a, b) => b.ETIME - a.ETIME)
        var DL_SNR = [];
        var extras_result = {};
        if (data.CI && ('sinr_value' in opts)) {
            var sinr_value_1 = opts.sinr_value;
            // attach CINR to dl throughput
            //console.time("nemo_dl_snr_attach")
            //Get file list
            var file_list_3 = Array.from(new Set(data.DRATE.map(function (entry) { return entry.file; })));
            var _loop_4 = function (file) {
                SINR = data.CI.filter(function (entry) { return entry.CELLTYPE === '0' && entry.file === file; }).map(function (entry) {
                    return { TIME: entry.TIME, ETIME: _this.GetEpochTime(entry.TIME), file: entry.file, CELLTYPE: entry.CELLTYPE, CINR: parseFloat(entry.CINR) };
                }).sort(function (a, b) { return a.ETIME - b.ETIME; }); //.filter(entry => entry.ETIME >= DRATE[0].ETIME - 500)
                //console.log('TEST')
                //console.log("SINR value")
                //console.log(data.CI)
                if (!SINR.find(function (entry) { return entry.CINR >= sinr_value_1; })) {
                    return "continue";
                }
                //console.log(SINR.find(entry => entry.CINR >= sinr_value))
                var FIRST_PASS = SINR.find(function (entry) { return entry.CINR >= sinr_value_1; }).ETIME;
                //console.log(FIRST_PASS)
                var DRATE = data.DRATE.filter(function (entry) { return entry.file === file; }).sort(function (a, b) { return a.ETIME - b.ETIME; }).filter(function (entry) { return entry.ETIME >= FIRST_PASS; });
                //console.log(DRATE[0])
                if (DRATE.length === 0) {
                    return "continue";
                }
                SINR = SINR.filter(function (entry) { return entry.ETIME >= DRATE[0].ETIME - 500; });
                var SINR_CURSOR = 0;
                //console.log(DRATE)
                //console.log(`STARTING CURSOR IS ${SINR_CURSOR} | TIME ${SINR[SINR_CURSOR].TIME} | DRATE TIME | ${DRATE[0].TIME} | MEASUREMENT | ${DRATE[0].file}`)
                for (var i = 0; i < DRATE.length - 1; i++) {
                    var DLSNR = [];
                    var FIRST_ENTRY_1 = true;
                    //console.log(`Current DL Time: ${DRATE[i].TIME} [${DRATE[i].ETIME}] | Next DL Time: ${DRATE[i+1].TIME} [${DRATE[i+1].ETIME}] Found table below`)
                    while (DRATE[i + 1].ETIME >= SINR[SINR_CURSOR].ETIME) {
                        if (DRATE[i].ETIME <= SINR[SINR_CURSOR].ETIME) {
                            if (FIRST_ENTRY_1) {
                                if (i == 0) {
                                    var temp_SINR = [];
                                    var j = 0;
                                    while (j !== SINR_CURSOR) {
                                        //console.log(`${DRATE[i].ETIME-1000} >= ${SINR[j].ETIME} | ${DRATE[i].ETIME-1000>=SINR[j].ETIME} | ${SINR[j].CINR}`)
                                        temp_SINR.push(SINR[j].CINR);
                                        j++;
                                    }
                                    DLSNR.push(Math.max.apply(Math, temp_SINR));
                                }
                                else {
                                    DLSNR.push(SINR[SINR_CURSOR - 1].CINR);
                                }
                                FIRST_ENTRY_1 = false;
                            }
                            DLSNR.push(SINR[SINR_CURSOR].CINR);
                        }
                        SINR_CURSOR++;
                    }
                    //console.table(DLSNR)
                    //if(DRATE[i].TIME == '11:02:12.434'){console.table(DRATE[i])}
                    if (i == 0) {
                        DRATE[i]['CINR'] = Math.max(DLSNR[0], DLSNR[DLSNR.length - 1]);
                        DRATE[i]['CINR_INDEX'] = DLSNR[0] >= sinr_value_1 ? 0 : 1;
                    }
                    else {
                        DRATE[i]['CINR'] = Math.max(DLSNR[0], DLSNR[DLSNR.length - 1]);
                        DRATE[i]['CINR_INDEX'] = DLSNR.indexOf(DRATE[i]['CINR']);
                    }
                    DRATE[i]['INDEX'] = i;
                }
                //attach SINR to last DRATE
                var FIRST_ENTRY = true;
                var DLSNR1 = [];
                var DCOMP = data.DCOMP.find(function (entry) { return entry.file == file; }) ? this_4.GetEpochTime(data.DCOMP.find(function (entry) { return entry.file == file; }).TIME) : SINR[SINR_CURSOR].ETIME + 2000;
                //console.table(DCOMP)
                while (SINR_CURSOR < SINR.length) {
                    if ((DRATE[DRATE.length - 1].ETIME <= SINR[SINR_CURSOR].ETIME) && (SINR[SINR_CURSOR].ETIME <= DCOMP)) {
                        if (FIRST_ENTRY) {
                            DLSNR1.push(SINR[SINR_CURSOR - 1].CINR);
                            FIRST_ENTRY = false;
                        }
                        //console.log(`${SINR[SINR_CURSOR].CINR}|${SINR[SINR_CURSOR].TIME}|${DRATE[DRATE.length-1].TIME}`)
                        DLSNR1.push(SINR[SINR_CURSOR].CINR);
                    }
                    SINR_CURSOR++;
                }
                //console.table(DLSNR1)
                DRATE[DRATE.length - 1]['CINR'] = Math.max(DLSNR1[0], DLSNR1[DLSNR1.length - 1]);
                DRATE[DRATE.length - 1]['CINR_INDEX'] = DLSNR1.indexOf(DRATE[DRATE.length - 1]['CINR']);
                //DL_SNR = [...DL_SNR, ...DRATE.filter(x => x.CINR >= 10).filter((x,i) => !(i===0 && x.CINR_INDEX !==0))]
                DL_SNR = DL_SNR.concat(DRATE.filter(function (x) { return x.CINR >= sinr_value_1; }));
                //console.log(DL_SNR)
                //DL_SNR = [...DL_SNR, ...DRATE]
            };
            var this_4 = this, SINR;
            //Process file
            for (var _a = 0, file_list_2 = file_list_3; _a < file_list_2.length; _a++) {
                var file = file_list_2[_a];
                _loop_4(file);
            }
            //console.log(`Current DL Time: ${entry.TIME} [${entry.ETIME}] | Next DL Time: ${array[index+1].TIME} [${array[index+1].ETIME}] Found table below`)
            //console.table(CINR)
            //console.timeEnd("nemo_dl_snr_attach")
        }
        var DL = ('polygon' in opts) ? data.DRATE.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); }) : data.DRATE;
        DL_SNR = ('polygon' in opts) ? DL_SNR.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); }) : DL_SNR;
        //console.table(DL_SNR.filter(x => x.CINR >= 10 && !(x.INDEX===0 && x.CINR_INDEX ===0 )))
        //console.table(DL_SNR)
        if (('sinr_value' in opts)) {
            DL_SNR = DL_SNR.map(function (x) { return { CINR: x.CINR, DL: parseInt(x.DL), TIME: x.TIME }; });
            extras_result['DL_TP_SNR'] = DL_SNR;
        }
        DL = DL.map(function (x) { return parseInt(x.DL); });
        //console.log(`${DL_SNR.filter(x => x.DL >= 60000000).length}/${DL_SNR.length}`)
        //console.log(`${DL_SNR.filter(x => x.DL >= 60000000 && x.CINR >= 10).length}/${DL_SNR.filter(x => x.CINR >= 10).length}`)
        //padl max
        //let psdlmax = (Math.max(...DL) / 1000000).toFixed(2) + "Mbps"
        //let psdlavedl = (DL.filter(x => x >= 100000000).length / DL.length * 100).toFixed(2) + "%"
        //console.timeEnd('nemo_application_throughput_downlink_filter_sinr')
        return __assign({ DL_TP: DL }, extras_result);
    };
    NemoParameterGrid.prototype.nemo_application_throughput_uplink = function (data, opts) {
        var _this = this;
        //shift time location
        //console.time("shiftLoc")
        if (!data.DRATE)
            throw console.error('DRATE is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.DREQ)
            throw console.error('DREQ is not decoded while parsing logfile. Consider update decoder field.');
        data.DRATE = data.DRATE.map(function (entry) { return __assign({}, entry, { ETIME: _this.GetEpochTime(entry.TIME) }); });
        var file_list = Array.from(new Set(data.DRATE.map(function (entry) { return entry.file; })));
        var temp_DRATE = [];
        var _loop_6 = function (file) {
            var temp_drate = data.DRATE.filter(function (entry) { return entry.file == file; }).sort(function (a, b) { return a.ETIME - b.ETIME; });
            var _loop_7 = function (i) {
                if (!(i == 0)) {
                    temp_drate[i].LAT = temp_drate[i - 1].LAT;
                    temp_drate[i].LON = temp_drate[i - 1].LON;
                    temp_drate[i].TIME = temp_drate[i - 1].TIME;
                    temp_drate[i]['duplicate'] = temp_drate[i].ETIME == temp_drate[i - 1].ETIME;
                    temp_drate[i].ETIME = this_5.GetEpochTime(temp_drate[i].TIME);
                }
                else {
                    var DREQ = data.DREQ.find(function (entry) { return entry.file == temp_drate[i].file; });
                    temp_drate[i].LAT = DREQ.LAT;
                    temp_drate[i].LON = DREQ.LON;
                    temp_drate[i].TIME = DREQ.TIME;
                    temp_drate[i].ETIME = this_5.GetEpochTime(temp_drate[i].TIME);
                    temp_drate[i]['duplicate'] = false;
                    //console.table(temp_drate[i])
                }
            };
            for (var i = temp_drate.length - 1; i >= 0; i--) {
                _loop_7(i);
            }
            temp_DRATE = temp_DRATE.concat(temp_drate);
        };
        var this_5 = this;
        for (var _i = 0, file_list_4 = file_list; _i < file_list_4.length; _i++) {
            var file = file_list_4[_i];
            _loop_6(file);
        }
        data.DRATE = temp_DRATE;
        data.DRATE.sort(function (a, b) { return a.ETIME - b.ETIME; });
        data.DRATE = data.DRATE.filter(function (entry) { return !entry.duplicate; });
        //console.timeEnd("shiftLoc")
        //console.time("nemo_application_throughput_uplink")
        //let UL = filter.area ? data.DRATE.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : data.DRATE
        var UL = data.DRATE;
        if (opts) {
            UL = ('polygon' in opts) ? data.DRATE.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); }) : data.DRATE;
        }
        UL = UL.map(function (x) { return parseInt(x.UL); });
        //padl max
        //let psdlmax = (Math.max(...DL) / 1000000).toFixed(2) + "Mbps"
        //let psdlavedl = (DL.filter(x => x >= 100000000).length / DL.length * 100).toFixed(2) + "%"
        //console.timeEnd("nemo_application_throughput_uplink")
        return { UL_TP: UL };
    };
    NemoParameterGrid.prototype.nemo_attach_attempt = function (data, opts) {
        if (!data.GAA)
            throw console.error('GAA is not decoded while parsing logfile. Consider update decoder field.');
        //let GAA = filter.area ? data.GAA.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : data.GAA
        //let GAA = data.GAA 
        var GAA = ('polygon' in opts) ? data.GAA.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); }) : data.GAA;
        return { ATTACH_ATTEMPT: GAA.length };
    };
    NemoParameterGrid.prototype.nemo_ftp_server_connection_attempt = function (data, opts) {
        if (!data.DAA)
            throw console.error('DAA is not decoded while parsing logfile. Consider update decoder field.');
        //let DAA = filter.area ? data.DAA.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]),filter.area, {ignoreBoundary:false})) : data.DAA
        //let DAA = data.DAA
        var DAA = ('polygon' in opts) ? data.DAA.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); }) : data.DAA;
        return { FTP_CONNECT_ATTEMPT: DAA.length };
    };
    NemoParameterGrid.prototype.nemo_intra_handover = function (data, opts) {
        //console.time("nemo_intra_handover")
        if (!data.HOA)
            throw console.error('HOA is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.HOS)
            throw console.error('HOS is not decoded while parsing logfile. Consider update decoder field.');
        var intra_handover_attempt = data.HOA.filter(function (entry) { return ['901', '902', '903'].includes(entry.HO_TYPE); });
        //filter HOA within the polygon if any
        //if (filter.area) {
        //    intra_handover_attempt = intra_handover_attempt.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false }))
        //}
        if ('polygon' in opts) {
            intra_handover_attempt = intra_handover_attempt.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); });
        }
        var intra_handover_success = data.HOS.filter(function (entry) {
            return intra_handover_attempt.find(function (hoa_entry) {
                return hoa_entry.file == entry.file && hoa_entry.HO_CONTEXT.trim() == entry.HO_CONTEXT.trim();
            });
        });
        //if (filter.area) {
        //    intra_handover_success = intra_handover_success.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false }))
        //warning - attempt in polygon but success not within the polygon will cause incorrect kpi
        //}
        if ('polygon' in opts) {
            intra_handover_success = intra_handover_success.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); });
            //warning - attempt in polygon but success not within the polygon will cause incorrect kpi
        }
        return { HANDOVER_SUCCESS: intra_handover_success.length, HANDOVER_ATTEMPT: intra_handover_attempt.length };
    };
    NemoParameterGrid.prototype.nemo_irat_handover = function (data, opts) {
        if (!data.HOA)
            throw console.error('HOA is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.HOS)
            throw console.error('HOS is not decoded while parsing logfile. Consider update decoder field.');
        var irat_handover_attempt = data.HOA.filter(function (entry) { return ['904'].includes(entry.HO_TYPE); });
        //filter HOA within the polygon if any
        if ('polygon' in opts) {
            irat_handover_attempt = irat_handover_attempt.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); });
        }
        //if (filter.area) {
        //    irat_handover_attempt = irat_handover_attempt.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false }))
        //} Deprecated
        var irat_handover_success = data.HOS.filter(function (entry) {
            return irat_handover_attempt.find(function (hoa_entry) {
                return hoa_entry.file == entry.file && hoa_entry.HO_CONTEXT.trim() == entry.HO_CONTEXT.trim();
            });
        });
        //if (filter.area) {
        //    irat_handover_success = irat_handover_success.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false }))
        //warning - attempt in polygon but success not within the polygon will cause incorrect kpi
        //} Deprecated
        if (opts.polygon) {
            irat_handover_success = irat_handover_success.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); });
            //warning - attempt in polygon but success not within the polygon will cause incorrect kpi
        }
        return { HANDOVER_SUCCESS: irat_handover_success.length, HANDOVER_ATTEMPT: irat_handover_attempt.length };
    };
    NemoParameterGrid.prototype.nemo_volte_call = function (data, opts) {
        var _this = this;
        if (!data.CAA)
            throw console.error('CAA is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CAC)
            throw console.error('CAC is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CAF)
            throw console.error('CAF is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CAD)
            throw console.error('CAD is not decoded while parsing logfile. Consider update decoder field.');
        var volte_call_attempt = data.CAA.map(function (entry) {
            var terminated_call = data.CAC.find(function (call) { return call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file; });
            if (!terminated_call) {
                terminated_call = data.CAF.find(function (call) { return call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file; });
            }
            return __assign({}, entry, { terminated: terminated_call });
        }).filter(function (entry) {
            //console.table(entry)
            if (!entry.terminated) {
                console.warn("terminating call not found possiblity logfile error FILE:" + entry.file);
                return false;
            }
            else if (!(entry.terminated.CALL_TYPE == '14')) {
                return false;
            }
            if ('FAIL' in entry.terminated) {
                if (entry.terminated.FAIL == '5') {
                    return false;
                }
            }
            return true;
        });
        //volte_call_attempt = filter.area? volte_call_attempt.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : volte_call_attempt
        volte_call_attempt = ('polygon' in opts) ? volte_call_attempt.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); }) : volte_call_attempt;
        var volte_call_connected = data.CAC.filter(function (entry) { return entry.CALL_TYPE == '14' && entry.CALL_STATUS == "3"; }).map(function (entry) {
            var start_time = _this.GetEpochTime(data.CAA.find(function (call) { return call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file; }).TIME);
            var end_time = _this.GetEpochTime(entry.TIME);
            return __assign({}, entry, { SETUP_TIME: end_time - start_time });
        });
        //volte_call_connected = filter.area? volte_call_connected.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]), filter.area, {ignoreBoundary:false})) : volte_call_connected
        volte_call_connected = ('polygon' in opts) ? volte_call_connected.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); }) : volte_call_connected;
        var volte_call_drop = data.CAD.filter(function (entry) { return entry.DROP_REASON != "1"; });
        //volte_call_drop = filter.area? volte_call_drop.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]), filter.area, {ignoreBoundary:false})) : volte_call_drop
        volte_call_drop = ('polygon' in opts) ? volte_call_drop.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); }) : volte_call_drop;
        return {
            VOLTE_CALL_ATTEMPT: volte_call_attempt,
            VOLTE_CALL_CONNECTED: volte_call_connected,
            VOLTE_CALL_DROP: volte_call_drop
        };
    };
    NemoParameterGrid.prototype.nemo_csfb_call = function (data, opts) {
        var _this = this;
        if (!data.CAA)
            throw console.error('CAA is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CAC)
            throw console.error('CAC is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CAF)
            throw console.error('CAF is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CAD)
            throw console.error('CAF is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.L3SM)
            throw console.error('L3SM is not decoded while parsing logfile. Consider update decoder field.');
        //console.time("nemo_csfb_call")
        var csfb_call_attempt = data.CAA.map(function (entry) {
            //console.log(data.CAC.filter(call => call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file))
            var terminated_call = data.CAC.find(function (call) { return call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file && call.CALL_STATUS === '2'; });
            if (!terminated_call) {
                terminated_call = data.CAF.find(function (call) { return call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file; });
            }
            return __assign({}, entry, { terminated: terminated_call });
        }).filter(function (entry) {
            //console.table(entry)
            if (!entry.terminated) {
                //console.warn(`terminating call not found possiblity logfile error FILE:${entry.file}`)
                return false;
            }
            else if (!(entry.terminated.CALL_TYPE == '1')) {
                return false;
            }
            if ('FAIL' in entry.terminated) {
                if (entry.terminated.FAIL == '5' || entry.terminated.FAIL == '1' || entry.terminated.FAIL == '2') {
                    return false;
                }
            }
            return true;
        }).filter(function (entry) {
            if (entry.MEAS_SYSTEM === '7' || entry.MEAS_SYSTEM === '8') {
                return true;
            }
            else {
                return false;
            }
        });
        //csfb_call_attempt = filter.area? csfb_call_attempt.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : csfb_call_attempt
        csfb_call_attempt = ('polygon' in opts) ? csfb_call_attempt.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); }) : csfb_call_attempt;
        var csfb_call_connected = data.CAC.filter(function (entry) { return entry.CALL_TYPE == '1' && entry.CALL_STATUS == "3"; }).filter(function (entry) {
            var CAA = data.CAA.find(function (call) { return call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file; });
            if (CAA.MEAS_SYSTEM === '7' || CAA.MEAS_SYSTEM === '8') {
                return true;
            }
            else {
                return false;
            }
        }).map(function (entry) {
            // call setup calculation for MTC is different from MOC
            // csfb_setup_time = CAC - 'CS_SERVICE_NOTIFICATION'  # if L3SM "CS_SERVICE_NOTIFICATION" exist
            // --- else ---
            // csfb_setup_time = CAC - CAA
            var CAA = data.CAA.find(function (call) { return call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file; });
            var LAST_CAA = data.CAC.slice().sort(function (a, b) { return _this.GetEpochTime(a.TIME) - _this.GetEpochTime(b.TIME); }) // descending sort time latest time first 
                .find(function (call) { return _this.GetEpochTime(call.TIME) <= _this.GetEpochTime(CAA.TIME) && call.file == entry.file; });
            var L3SM = null;
            if (!LAST_CAA) {
                L3SM = data.L3SM.filter(function (l3) { return l3.file == entry.file; })
                    .find(function (l3) { return (l3.MESSAGE === '"CS_SERVICE_NOTIFICATION"') && _this.GetEpochTime(CAA.TIME) >= _this.GetEpochTime(l3.TIME); });
            }
            else {
                L3SM = data.L3SM.filter(function (l3) { return l3.file == entry.file; })
                    .find(function (l3) { return (l3.MESSAGE === '"CS_SERVICE_NOTIFICATION"') && _this.GetEpochTime(CAA.TIME) >= _this.GetEpochTime(l3.TIME) && _this.GetEpochTime(LAST_CAA.TIME) <= _this.GetEpochTime(l3.TIME); });
            }
            var start_time = L3SM ? _this.GetEpochTime(L3SM.TIME) : _this.GetEpochTime(data.CAA.find(function (call) { return call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file; }).TIME);
            var end_time = _this.GetEpochTime(entry.TIME);
            return __assign({}, entry, { SETUP_TIME: end_time - start_time });
        });
        //csfb_call_connected = filter.area? csfb_call_connected.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]), filter.area, {ignoreBoundary:false})) : csfb_call_connected
        csfb_call_connected = ('polygon' in opts) ? csfb_call_connected.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); }) : csfb_call_connected;
        var csfb_call_drop = data.CAD.filter(function (entry) { return entry.DROP_REASON != "1" && entry.DROP_REASON != "2"; });
        //csfb_call_drop = filter.area? csfb_call_drop.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]), filter.area, {ignoreBoundary:false})) : csfb_call_drop
        csfb_call_drop = ('polygon' in opts) ? csfb_call_drop.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); }) : csfb_call_drop;
        return { CSFB_CALL_ATTEMPT: csfb_call_attempt, CSFB_CALL_CONNECTED: csfb_call_connected, CSFB_CALL_DROP: csfb_call_drop };
    };
    NemoParameterGrid.prototype.nemo_call = function (data, opts) {
        var _this = this;
        if (!data.CAA)
            throw console.error('CAA is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CAC)
            throw console.error('CAC is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CAF)
            throw console.error('CAF is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CAD)
            throw console.error('CAF is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.L3SM)
            throw console.error('L3SM is not decoded while parsing logfile. Consider update decoder field.');
        //console.time("nemo_csfb_call")
        var call_attempt = data.CAA.map(function (entry) {
            //console.log(data.CAC.filter(call => call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file))
            var terminated_call = data.CAC.find(function (call) { return call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file && call.CALL_STATUS === '2'; });
            if (!terminated_call) {
                terminated_call = data.CAF.find(function (call) { return call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file; });
            }
            return __assign({}, entry, { terminated: terminated_call });
        }).filter(function (entry) {
            //console.table(entry)
            if (!entry.terminated) {
                //console.warn(`terminating call not found possiblity logfile error FILE:${entry.file}`)
                return false;
            }
            else if (!(entry.terminated.CALL_TYPE == '1')) {
                //console.warn(`terminting call is not a voice call type`)
                return false;
            }
            if ('FAIL' in entry.terminated) {
                //console.warn(`call fail detected`)
                if (entry.terminated.FAIL == '5' || entry.terminated.FAIL == '1' || entry.terminated.FAIL == '2') {
                    return false;
                }
            }
            return true;
        }); /*.filter((entry) =>{ // filter only LTE system at start of the call
            if(entry.MEAS_SYSTEM === '7' || entry.MEAS_SYSTEM === '8'){
                return true
            }else{
                return false
            }
        })*/
        //csfb_call_attempt = filter.area? csfb_call_attempt.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : csfb_call_attempt
        call_attempt = ('polygon' in opts) ? call_attempt.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); }) : call_attempt;
        var call_connected = data.CAC.filter(function (entry) { return entry.CALL_TYPE == '1' && entry.CALL_STATUS == "3"; }).map(function (entry) {
            // call setup calculation for MTC is different from MOC
            // csfb_setup_time = CAC - 'CS_SERVICE_NOTIFICATION'  # if L3SM "CS_SERVICE_NOTIFICATION" exist
            // --- else ---
            // csfb_setup_time = CAC - CAA
            var CAA = data.CAA.find(function (call) { return call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file; });
            var LAST_CAA = data.CAC.slice().sort(function (a, b) { return _this.GetEpochTime(a.TIME) - _this.GetEpochTime(b.TIME); }) // descending sort time latest time first 
                .find(function (call) { return _this.GetEpochTime(call.TIME) <= _this.GetEpochTime(CAA.TIME) && call.file == entry.file; });
            var L3SM = null;
            if (!LAST_CAA) {
                L3SM = data.L3SM.filter(function (l3) { return l3.file == entry.file; })
                    .find(function (l3) { return (l3.MESSAGE === '"CS_SERVICE_NOTIFICATION"') && _this.GetEpochTime(CAA.TIME) >= _this.GetEpochTime(l3.TIME); });
            }
            else {
                L3SM = data.L3SM.filter(function (l3) { return l3.file == entry.file; })
                    .find(function (l3) { return (l3.MESSAGE === '"CS_SERVICE_NOTIFICATION"') && _this.GetEpochTime(CAA.TIME) >= _this.GetEpochTime(l3.TIME) && _this.GetEpochTime(LAST_CAA.TIME) <= _this.GetEpochTime(l3.TIME); });
            }
            var start_time = L3SM ? _this.GetEpochTime(L3SM.TIME) : _this.GetEpochTime(data.CAA.find(function (call) { return call.CALL_CONTEXT == entry.CALL_CONTEXT && call.file == entry.file; }).TIME);
            var end_time = _this.GetEpochTime(entry.TIME);
            return __assign({}, entry, { SETUP_TIME: end_time - start_time });
        });
        //csfb_call_connected = filter.area? csfb_call_connected.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]), filter.area, {ignoreBoundary:false})) : csfb_call_connected
        call_connected = ('polygon' in opts) ? call_connected.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); }) : call_connected;
        var call_drop = data.CAD.filter(function (entry) { return entry.DROP_REASON != "1" && entry.DROP_REASON != "2"; });
        //csfb_call_drop = filter.area? csfb_call_drop.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON,entry.LAT]), filter.area, {ignoreBoundary:false})) : csfb_call_drop
        call_drop = ('polygon' in opts) ? call_drop.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); }) : call_drop;
        return { CALL_ATTEMPT: call_attempt, CALL_CONNECTED: call_connected, CALL_DROP: call_drop };
    };
    NemoParameterGrid.prototype.nemo_packet_data_setup = function (data, opts) {
        if (!data.PAA)
            throw console.error('PAA is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.PAC)
            throw console.error('PAC is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.PAD)
            throw console.error('PAD is not decoded while parsing logfile. Consider update decoder field.');
        //let PAA = filter.area ? data.PAA.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : data.PAA
        //let PAA = data.PAA
        var PAA = ('polygon' in opts) ? data.PAA.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); }) : data.PAA;
        var PAC = data.PAC.filter(function (entry) {
            return PAA.find(function (paa_entry) { return paa_entry.PACKET_SESSION_CONTEXT == entry.PACKET_SESSION_CONTEXT && paa_entry.file == entry.file && entry.PACKET_STATE == '2'; });
        });
        var PAD = data.PAD.filter(function (entry) {
            return PAA.find(function (paa_entry) { return paa_entry.PACKET_SESSION_CONTEXT = entry.PACKET_SESSION_CONTEXT && paa_entry.file == entry.file && entry.DEACT_STATUS != "1"; });
        });
        if ('polygon' in opts) {
            PAC = PAC.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); });
            PAD = PAD.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); });
        }
        //if (filter.area) {
        //    PAC = PAC.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false }))
        //    PAD = PAD.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false }))
        //}
        return { PACKET_DATA_SETUP_ATTEMPT: PAA.length, PACKET_DATA_SETUP_SUCCESS: PAC.length, PACKET_DATA_DROP: PAD.length };
    };
    NemoParameterGrid.prototype.nemo_data_server_setup = function (data, opts) {
        var _this = this;
        if (!data.DAA)
            throw console.error('DAA is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.DAC)
            throw console.error('DAC is not decoded while parsing logfile. Consider update decoder field.');
        //let DAA = filter.area ? data.DAA.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : data.DAA
        //let DAA = data.DAA
        var DAA = ('polygon' in opts) ? data.DAA.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); }) : data.DAA;
        var DAC = data.DAC.filter(function (entry) {
            return DAA.find(function (daa_entry) { return daa_entry.DATA_CONTEXT == entry.DATA_CONTEXT && daa_entry.file == entry.file; });
        });
        var DATA_SETUP_TIME = DAC.reduce(function (acc, cur) {
            var end = _this.GetEpochTime(cur.TIME);
            var start = _this.GetEpochTime(DAA.find(function (entry) { return entry.DATA_CONTEXT == cur.DATA_CONTEXT && entry.file == cur.file; }).TIME);
            return acc.concat([end - start]);
        }, []);
        if ('polygon' in opts) {
            DAC = DAC.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); });
        }
        return { DATA_CONNECT_ATTEMPT: DAA.length, DATA_CONNECT_SUCCESS: DAC.length, DATA_SETUP_TIME: DATA_SETUP_TIME };
    };
    NemoParameterGrid.prototype.nemo_tracking_area_update = function (data, opts) {
        if (!data.TUA)
            throw console.error('TUA is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.TUS)
            throw console.error('TUS is not decoded while parsing logfile. Consider update decoder field.');
        //let TUA = filter.area ? data.TUA.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : data.TUA
        //let TUA = data.TUA
        var TUA = ('polygon' in opts) ? data.TUA.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); }) : data.TUA;
        var TUS = data.TUS.filter(function (entry) {
            return TUA.find(function (tua_entry) { return tua_entry.TAU_CONTEXT == entry.TAU_CONTEXT && tua_entry.file == entry.file; });
        });
        //if (filter.area) {
        //    TUS = TUS.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false }))
        //}
        if ('polygon' in opts) {
            TUS = TUS.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); });
        }
        return { TRACKING_AREA_UPDATE_ATTEMPT: TUA.length, TRACKING_AREA_UPDATE_SUCCESS: TUS.length };
    };
    NemoParameterGrid.prototype.nemo_pdsch_bler = function (data, opts) {
        if (!data.PHRATE)
            throw console.error('PHRATE is not decoded while parsing logfile. Consider update decoder field.');
        var PHRATE = data.PHRATE.filter(function (entry) { return entry.BLER != '' && entry.CELLTYPE == '0'; });
        if ('polygon' in opts) {
            PHRATE = PHRATE.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); });
        }
        //if (filter.area) {
        //    PHRATE = PHRATE.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false }))
        //}
        return { PDSCH_BLER: PHRATE.filter(function (entry) { return entry.CELLTYPE == "0" && entry.BLER != ''; }).map(function (x) { return parseFloat(x.BLER); }) };
    };
    NemoParameterGrid.prototype.nemo_mos_quality = function (data, opts) {
        if (!data.AQDL)
            throw console.error('AQDL is not decoded while parsing logfile. Consider update decoder field.');
        //let AQDL = filter.area? data.AQDL.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })) : data.AQDL
        //let AQDL = data.AQDL
        var AQDL = ('polygon' in opts) ? data.AQDL.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); }) : data.AQDL;
        //console.table(AQDL)
        if (('vq_type_dl' in opts)) { // by default mos audio filter any
            if (opts.vq_type_dl === 'PESQ_NB') { //filter PESQ NB
                AQDL = AQDL.filter(function (entry) { return entry.AUDIOTYPE == '2'; });
            }
            else if (opts.vq_type_dl === 'POLQA_NB') { //filter POQLA NB
                AQDL = AQDL.filter(function (entry) { return entry.AUDIOTYPE == '7'; });
            }
        }
        return { MOS_QUALITY: AQDL.map(function (entry) { return parseFloat(entry.MOS); }) };
    };
    NemoParameterGrid.prototype.nemo_ue_measurement = function (data, opts) {
        //console.time("nemo_cell_measurement")
        //let RSRP_RSRQ = data.CELLMEAS
        if (!data.CELLMEAS)
            throw console.error('CELLMEAS is not decoded while parsing logfile. Consider update decoder field.');
        if (!data.CI)
            throw console.error('CI is not decoded while parsing logfile. Consider update decoder field.');
        var RSRP_RSRQ = data.CELLMEAS.flatMap(function (entry) {
            return entry.loop.map(function (meas) { return { RSRP: parseFloat(meas.RSRP), RSRQ: parseFloat(meas.RSRQ), CELLTYPE: meas.CELLTYPE, LAT: entry.LAT, LON: entry.LON, CHANNEL: entry.EARFCN, TIME: entry.TIME, FILE: entry.file }; });
        }).filter(function (entry) { return entry.CELLTYPE == "0"; });
        var CINR = data.CI.filter(function (entry) { return entry.CINR !== '' && entry.CELLTYPE == '0'; });
        if ('polygon' in opts) {
            RSRP_RSRQ = RSRP_RSRQ.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); });
            CINR = CINR.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); });
        }
        CINR.forEach(function (entry) { return entry.CINR = parseFloat(entry.CINR); });
        //console.log(RSRP_RSRQ.length,CINR.length)
        //console.timeEnd("nemo_cell_measurement")
        return { "RSRP_RSRQ": RSRP_RSRQ, "SINR": CINR };
    };
    NemoParameterGrid.prototype.nemo_ue_measurement_umts = function (data, opts) {
        if (!data.CELLMEAS)
            throw console.error('CELLMEAS is not decoded while parsing logfile. Consider update decoder field.');
        var RSCP_ECNO = data.CELLMEAS.reduce(function (acc, cur) {
            //Best active set
            var BEST_ECNO_SET = cur.loop.filter(function (meas) { return meas.CELLTYPE == '0' && meas.ECNO !== ''; });
            var BEST_ECNO = Math.max.apply(Math, BEST_ECNO_SET.map(function (meas) { return parseFloat(meas.ECNO); }));
            var BEST_ECNO_CH = BEST_ECNO_SET.find(function (meas) { return meas.ECNO == BEST_ECNO; });
            BEST_ECNO_CH = BEST_ECNO_CH ? BEST_ECNO_CH.CH : '';
            var BEST_ACTIVE_SET = cur.loop.filter(function (meas) { return meas.CELLTYPE == '0'; }).find(function (meas) { return meas.ECNO == BEST_ECNO; });
            var BEST_RSCP = BEST_ACTIVE_SET ? parseFloat(BEST_ACTIVE_SET.RSCP) : null;
            return acc.concat([{ RSCP: BEST_RSCP, ECNO: BEST_ECNO, LAT: cur.LAT, LON: cur.LON, CHANNEL: BEST_ECNO_CH, TIME: cur.TIME, FILE: cur.file }]);
        }, []).filter(function (entry) { return entry.RSCP !== null; });
        if ('polygon' in opts) {
            RSCP_ECNO = RSCP_ECNO.filter(function (entry) { return turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), opts.polygon, { ignoreBoundary: false }); });
        }
        return { "RSCP_ECNO": RSCP_ECNO };
    };
    NemoParameterGrid.prototype.nemo_rlc_bler = function (data, opts) {
        if (!data.RLCBLER)
            throw console.error('RLCBLER is not decoded while parsing logfile. Consider update decoder field.');
        var RLCBLER = data.RLCBLER.filter(function (entry) { return entry.BLER !== ''; }).map(function (entry) { return parseFloat(entry.BLER); });
        return { "RLC_BLER": RLCBLER };
    };
    return NemoParameterGrid;
}());
exports.NemoParameterGrid = NemoParameterGrid;

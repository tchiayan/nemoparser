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
var NemoParameterGrid = /** @class */ (function () {
    function NemoParameterGrid() {
    }
    NemoParameterGrid.prototype.nemo_scanner_measurement = function (data) {
        console.time("nemo_scanner_measurement");
        //let OFDMSCAN = filter.area?data.OFDMSCAN.filter(entry => turf.booleanPointInPolygon(turf.point([entry.LON, entry.LAT]), filter.area, { ignoreBoundary: false })):data.OFDMSCAN
        if (!data.OFDMSCAN)
            throw console.error('OFDMSCAN is not decoded while parsing logfile. Consider update decoder field.');
        var OFDMSCAN = data.OFDMSCAN;
        var files = Array.from(new Set(OFDMSCAN.map(function (entry) { return entry.file; })));
        var RSRP = [];
        var CINR = [];
        var RSRQ = [];
        var _loop_1 = function (file) {
            var filter_data = data.OFDMSCAN.filter(function (entry) { return entry.file == file; });
            RSRP = RSRP.concat(this_1.nemo_scanner_field_n_best(filter_data, 'RSRP'));
            CINR = CINR.concat(this_1.nemo_scanner_field_n_best(filter_data, 'CINR'));
            RSRQ = RSRQ.concat(this_1.nemo_scanner_field_n_best(filter_data, 'RSRQ'));
        };
        var this_1 = this;
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            _loop_1(file);
        }
        console.timeEnd("nemo_scanner_measurement");
        return { 'SCANNER_RSRP': RSRP, 'SCANNER_CINR': CINR, 'SCANNER_RSRQ': RSRQ };
    };
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
            /*let top_field = entry.loop.length!==0?entry.loop.filter((meas)=>meas[field] !== '')
                .map((meas)=>{
                    let temp = {}
                    temp[field] = parseFloat(meas[field])
                    return temp
                }).sort((a,b)=>b[field] - a[field])[0]:empty_field*/
            return __assign({}, top_field, { TIME: entry.TIME, CH: entry.EARFCN, file: entry.file, LAT: entry.LAT, LON: entry.LON });
        }).map(function (entry, index, array) {
            if (entry[field] !== '') {
                return entry;
            }
            else {
                var ch = entry.CH;
                var i = --index;
                while (array[i].CH !== ch) {
                    --i;
                }
                var new_entry = __assign({}, entry);
                new_entry[field] = array[i][field];
                return new_entry;
            }
        }).filter(function (entry) { return entry[field] !== ""; }).map(function (entry, index, array) {
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
    return NemoParameterGrid;
}());
exports.NemoParameterGrid = NemoParameterGrid;

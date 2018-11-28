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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var DECODER = __importStar(require("./shared/nemo_decoder"));
var rxjs_1 = require("rxjs");
var NemoParser = /** @class */ (function () {
    function NemoParser(nemoParamGrid) {
        this.nemoParamGrid = nemoParamGrid;
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
                        var st = format.output[f]['n']['s'];
                        var nu = parseInt(cols[format.output[f]['n']['n']]);
                        var sp = parseInt(cols[format.output[f]['n']['p']]);
                        s_1 = st + nu * sp + 2;
                        n = parseInt(cols[st + nu * sp]);
                        //console.log(st,nu,sp)
                    }
                    else {
                        n = parseInt(cols[format.output[f]['n']]);
                        s_1 = format.output[f]['s'];
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
    NemoParser.prototype.displayGrid = function (nemo_params, files) {
        var extraction = {};
        var function_call = [];
        for (var _i = 0, nemo_params_1 = nemo_params; _i < nemo_params_1.length; _i++) {
            var param = nemo_params_1[_i];
            switch (param) {
                case 'LTE_FDD_SCANNER_MEASUREMENT':
                    extraction['OFDMSCAN'] = DECODER.LTE_FDD_SCANNER;
                    function_call.push({
                        TRIGGER: 'LTE_FDD_SCANNER_MEASUREMENT',
                        FUNCTION: this.nemoParamGrid.nemo_scanner_measurement
                    });
            }
        }
        this.parseLogfile(files, extraction).subscribe(function (data) {
            if (data.status == 'OK') {
                var result = {};
                for (var _i = 0, function_call_1 = function_call; _i < function_call_1.length; _i++) {
                    var _f = function_call_1[_i];
                    result[_f.TRIGGER] = _f.FUNCTION();
                }
                return result;
            }
            else if (data.status == 'PROGRESS') {
            }
            else {
                return "ERROR!";
            }
        });
    };
    return NemoParser;
}());
exports.NemoParser = NemoParser;

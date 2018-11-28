"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LTE_FDD_SCANNER = {
    filter: { 0: 'OFDMSCAN', 3: '7', 6: '1', 10: { condition: '>0' } },
    output: { 'SYSTEM': 'LTE', 'DEVICE': 'SCANNER', 'TIME': 1, 'EARFCN': 5, loop: { n: 10, p: 10, s: 12, c: {
                'PCI': 0,
                'RSRP': 3,
                'CINR': 5,
                'RSRQ': 4,
            } } }
};
exports.LTE_TDD_SCANNER = {
    filter: { 0: 'OFDMSCAN', 3: '8', 6: '1', 10: { condition: '>0' } },
    output: { 'SYSTEM': 'LTE', 'DEVICE': 'SCANNER', 'TIME': 1, 'EARFCN': 5, loop: { n: 10, p: 10, s: 12, c: {
                'PCI': 0,
                'RSRP': 3,
                'CINR': 5,
                'RSRQ': 4,
            } } }
};
exports.UMTS_SCANNER = {
    filter: { 0: 'PILOTSCAN', 3: '5' },
    output: { 'SYSTEM': 'UMTS', 'DEVICE': 'SCANNER', 'TIME': 1, 'EARFCN': 5, loop: {
            n: 9,
            p: 6,
            s: 11,
            c: { 'PCI': 0, 'RSRP': 2, 'CINR': 1 }
        } }
};

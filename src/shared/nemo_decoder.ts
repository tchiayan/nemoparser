export const LTE_FDD_SCANNER = {
    filter:{0:'OFDMSCAN',3:'7',6:'1',10:{condition:'>0'}},
    output:{'SYSTEM':'LTE','DEVICE':'SCANNER','TIME':1,'EARFCN':5,loop:{n:10,p:10,s:12,c:{
      'PCI':0,
      'RSRP':3,
      'CINR':5,
      'RSRQ':4,
    }}}
}

export const LTE_TDD_SCANNER = {
    filter:{0:'OFDMSCAN',3:'8',6:'1',10:{condition:'>0'}},
    output:{'SYSTEM':'LTE','DEVICE':'SCANNER','TIME':1,'EARFCN':5,loop:{n:10,p:12,s:12,c:{
      'PCI':0,
      'RSRP':3,
      'CINR':5,
      'RSRQ':4,
    }}}
}

export const UMTS_SCANNER = {
    filter:{0:'PILOTSCAN',3:'5'},
    output:{'SYSTEM':'UMTS','DEVICE':'SCANNER','TIME':1,'EARFCN':5,loop:{
      n:9,
      p:6,
      s:11,
      c:{'PCI':0,'RSRP':2,'CINR':1}
    }}
}

export const DRATE_DL = {
  filter:{0:'DRATE'},
  output:{'TIME':1,'DATA_TRANSFER_CONTEXT':3,'PROTOCOL':4,'DL':6}
}

export const UE_LTE_FDD_CI = {
  filter:{0:'CI',3:'7'},
  output:{'TIME':1,'CINR':5,"CELLTYPE":6}
}

export const UE_DATA_TRANSFER = {
  filter: {0:'DREQ'},
  output: {'TIME':1,'PROTOCOL':5,'DIR':6}
}

export const UE_DATA_TRANSFER_COMPLETE = {
  filter: {0:'DCOMP'},
  output: {'TIME':1}
}
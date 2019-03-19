export const LTE_FDD_SCANNER = {
    filter:{0:'OFDMSCAN',3:'7',6:'1'},
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
      c:{'SC':0,'RSCP':2,'ECNO':1}
    }}
}

export const DRATE_DL = {
  filter:{0:'DRATE'},
  output:{'TIME':1,'DATA_TRANSFER_CONTEXT':3,'PROTOCOL':4,'DL':6}
}

export const DRATE_UL = {
  filter:{0:'DRATE'},
  output:{'DATA_TRANSFER_CONTEXT':3,'PROTOCOL':4,'UL':5}
}

export const UE_LTE_CI = {
  filter:{0:'CI'},
  output:{'TIME':1,'CINR':5,"CELLTYPE":6}
}

export const UE_DATA_TRANSFER_ATTEMPT = {
  filter: {0:'DREQ'},
  output: {'TIME':1,'PROTOCOL':5,'DIR':6}
}

export const UE_DATA_TRANSFER_COMPLETE = {
  filter: {0:'DCOMP'},
  output: {'TIME':1}
}

export const UE_GAA_ATTACH_ATTEMPT = {
  filter:{0:'GAA'},
  output:{'TIME':1,'ATTACH_CONTEXT':3,'MEAS_SYSTEM':4}
}

export const UE_AUDIO_MOS = {
  filter: {0:'AQDL'},
  output: {'AUDIOTYPE':3,'MOS':4}
}

export const UE_BLER = {
  filter: {0:'PHRATE',4:'2'},
  output: {'BLER':8,'CELLTYPE':12}
}

export const UE_TUA = {
  filter: {0: 'TUA'},
  output: {'TIME':1, 'TAU_CONTEXT':3,'MEAS_SYSTEM':4,'TAU_TYPE':5}
} // 7 = LTE FDD, 8 = LTE TDD

export const UE_TUS = {
  filter: {0: 'TUS'},
  output: {'TIME':1, 'TAU_CONTEXT':3}
} // 7 = LTE FDD , 8 = LTE TDD

export const UE_DAA = {
  filter: {0:'DAA'},
  output: {'DATA_CONTEXT':3,'TIME':1,'PROTOCOL':6}
}

export const UE_DAC = {
  filter: {0:'DAC'},
  output: {'DATA_CONTEXT':3,'TIME':1,'PROTOCOL':4}
}

export const UE_PAA = {
  filter: {0:'PAA'},
  output: {'TIME':1,'PACKET_SESSION_CONTEXT':3,'MEAS_SYSTEM':4}
}

export const UE_PAC = {
  filter: {0:'PAC'},
  output: {'TIME':1,'PACKET_SESSION_CONTEXT':3,'MEAS_SYSTEM':4,'PACKET_STATE':5}
} // 1 = Air Interface connected ; 2 = Packet Session activated

export const UE_PAD = {
  filter: {0: 'PAD'},
  output: {'TIME':1,'PACKET_SESSION_CONTEXT':3,'MEAS_SYSTEM':4,'DEACT_STATUS':5}
}

export const UE_HOA = {
  filter: {0: 'HOA'},
  output: {'TIME':1,'HO_CONTEXT':3,'HO_TYPE':5}
} // 901 = LTE handover between cells, 902 = LTE handover between frequencies
  // 903 = LTE handover between bands, 904 = LTE handover between system

export const UE_HOS = {
  filter: {0: 'HOS'},
  output: {'TIME':1,'HO_CONTEXT':3}
}

export const UE_HOF = {
  filter: {0: 'HOF'},
  output: {'TIME':1,'HO_CONTEXT':3}
}

export const UE_CAA = {
  filter: {0:'CAA'},
  output: {'TIME':1,'CALL_CONTEXT':3,'MEAS_SYSTEM':4,'CALL_TYPE':5}
}

export const UE_CAC = {
  filter: {0:'CAC'},
  output: {'TIME':1,'CALL_CONTEXT':3,'MEAS_SYSTEM':4,'CALL_TYPE':5,'CALL_STATUS':6}
}

export const UE_CAF = {
  filter: {0:'CAF'},
  output: {'TIME':1,'CALL_CONTEXT':3,'MEAS_SYSTEM':4,'CALL_TYPE':5,'FAIL':6}
}

export const UE_CAD = {
  filter: {0:'CAD'},
  output: {'TIME':1, 'CALL_CONTEXT':3,'MEAS_SYSTEM':4,'CALL_TYPE':5,'DROP_REASON':6}    
}

export const UE_LTE_TDD_CELLMEAS = {
  filter:{0:'CELLMEAS',3:'8'},
  output:{'SYSTEM':'LTE','DEVICE':'UE','TIME':1,'EARFCN':9,loop:{
      n:5,
      p:9,
      s:7,
      c:{'PCI':3,'RSRP':5,'RSRQ':6,'EARFCN':2,'CELLTYPE':0}
    }
  }
}

export const UE_LTE_FDD_CELLMEAS = {
  filter:{0:'CELLMEAS',3:'7'},
  output:{'SYSTEM':'LTE','DEVICE':'UE','TIME':1,'EARFCN':9,loop:{
      n:5,
      p:9,
      s:7,
      c:{'PCI':3,'RSRP':5,'RSRQ':6,'EARFCN':2,'CELLTYPE':0}
    }
  }
}

export const UE_UMTS_CELLMEAS = {
  filter:{0:'CELLMEAS', 3:'5'},
  output: {'SYSTEM':'UMTS','DEVICE':'UE','TIME':1,loop:{
      n:{s:7,p:6,n:5},
      p:17,
      s:{},
      c:{'CELLTYPE':0,'CH':2,'SC':3,'ECNO':4,'RSCP':6}
    }
  }
}

export const  UE_LTE_TDD_CI = {
  filter:{0:'CI',3:'8'},
  output:{'TIME':1,'CINR':5,"CELLTYPE":6}
}

export const UE_LTE_FDD_CI = {
  filter:{0:'CI',3:'7'},
  output:{'TIME':1,'CINR':5,"CELLTYPE":6}
}

export const UE_L3SM = {
  filter:{0:'L3SM'},
  output:{'TIME':1,'MEAS_SYSTEM':3,'MESSAGE':5}
}

export const UE_RRCSM = {
  filter:{0:'RRCSM'},
  output:{'TIME':1,'MEAS_SYSTEM':3,'MESSAGE':5}
}

export const UE_RLC_BLER = {
  filter: {0:'RLCBLER'},
  output: {'TIME':1, 'BLER':4}
}

export const UE_SIPSM = {
  filter: {0:'SIPSM'},
  output: {'TIME':1,'MEAS_SYSTEM':3,'SIP_DIR':4,'MESSAGE':5}
}
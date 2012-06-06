define(function () {
  
  return {
    'NS_start':               { freq: 0   },
    'blank':                  { freq: 1   },
    'NS_road':                { freq: 1   },
    'EW_road':                { freq: 1   },
    'intersection':           { freq: 1   },
    'SE_turn':                { freq: 1   },
    'SW_turn':                { freq: 1   },
    'NE_turn':                { freq: 1   },
    'NW_turn':                { freq: 1   },
    'NSE_T':                  { freq: 1   },
    'NSW_T':                  { freq: 1   },
    'NEW_T':                  { freq: 1   },
    'SEW_T':                  { freq: 1   },
    'burbs1':                 { freq: 1   },
    'burbs2':                 { freq: 1   },
    'loop-crossroads':        { freq: 0.8 },
    'EW_burbs':               { freq: 1   },
    'EW_S-curve':             { freq: 0.3 },
    'NS_S-curve':             { freq: 0.3 },
    'roundabout':             { freq: 1   },
    'NSE_hotdog-stand':       { freq: 0.1, max: 1 },
    'gas-station-crossroads': { freq: 0.3, max: 1 },
    'EW_gas-station':         { freq: 0.4, max: 2 },
    'NSW_police-station':     { freq: 0.2, max: 1 }
  };
});

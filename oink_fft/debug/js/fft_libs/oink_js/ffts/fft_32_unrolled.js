let FFT_FAC_4 = new Float32Array([
1.0000000000000000,0.0000000000000000,-0.0000000437113883,1.0000000000000000
]);
let FFT_FAC_8 = new Float32Array([
1.0000000000000000,0.0000000000000000,0.7071067690849304,0.7071067690849304,-0.0000000437113883,1.0000000000000000,-0.7071067690849304,0.7071067690849304
]);
let FFT_FAC_16 = new Float32Array([
1.0000000000000000,0.0000000000000000,0.9238795042037964,0.3826834559440613,0.7071067690849304,0.7071067690849304,0.3826834261417389,0.9238795042037964,
-0.0000000437113883,1.0000000000000000,-0.3826833963394165,0.9238795638084412,-0.7071067690849304,0.7071067690849304,-0.9238795042037964,0.3826834857463837
]);
let FFT_FAC_32 = new Float32Array([
1.0000000000000000,0.0000000000000000,0.9807852506637573,0.1950903236865997,0.9238795042037964,0.3826834559440613,0.8314695954322815,0.5555702447891235,
0.7071067690849304,0.7071067690849304,0.5555702447891235,0.8314695954322815,0.3826834261417389,0.9238795042037964,0.1950903534889221,0.9807852506637573,
-0.0000000437113883,1.0000000000000000,-0.1950903236865997,0.9807852506637573,-0.3826833963394165,0.9238795638084412,-0.5555701851844788,0.8314696550369263,
-0.7071067690849304,0.7071067690849304,-0.8314696550369263,0.5555701851844788,-0.9238795042037964,0.3826834857463837,-0.9807853102684021,0.1950903087854385
]);


let iBR32 = new Float32Array(32);
let iP32  = new Float32Array(32);
let _iP32 = new Float32Array(32);
let out32 = new Float32Array(64);

function fftReal32(realInput) { 
    let size = realInput.length;
    if (size != 32) {
        for (let i = 0; i < 32; i++) {
            iP32[i] = (i < size) ? realInput[i] : 0.0;
        }
        _iP32 = iP32;
    } else {
        _iP32 = realInput;
    }


    //Bit Reversal
    {
        iBR32[0]=_iP32[0]; 
        iBR32[1]=_iP32[16]; 
        iBR32[2]=_iP32[8]; 
        iBR32[3]=_iP32[24]; 
        iBR32[4]=_iP32[4]; 
        iBR32[5]=_iP32[20]; 
        iBR32[6]=_iP32[12]; 
        iBR32[7]=_iP32[28]; 
        iBR32[8]=_iP32[2]; 
        iBR32[9]=_iP32[18]; 
        iBR32[10]=_iP32[10]; 
        iBR32[11]=_iP32[26]; 
        iBR32[12]=_iP32[6]; 
        iBR32[13]=_iP32[22]; 
        iBR32[14]=_iP32[14]; 
        iBR32[15]=_iP32[30]; 
        iBR32[16]=_iP32[1]; 
        iBR32[17]=_iP32[17]; 
        iBR32[18]=_iP32[9]; 
        iBR32[19]=_iP32[25]; 
        iBR32[20]=_iP32[5]; 
        iBR32[21]=_iP32[21]; 
        iBR32[22]=_iP32[13]; 
        iBR32[23]=_iP32[29]; 
        iBR32[24]=_iP32[3]; 
        iBR32[25]=_iP32[19]; 
        iBR32[26]=_iP32[11]; 
        iBR32[27]=_iP32[27]; 
        iBR32[28]=_iP32[7]; 
        iBR32[29]=_iP32[23]; 
        iBR32[30]=_iP32[15]; 
        iBR32[31]=_iP32[31]; 
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 4 - FFT step for SIZE 4/8 
    ////////////////////////////////////////////////

    for (let idx = 0, out_idx = 0; idx < 32; idx += 4, out_idx += 8) {
        let x0aRe = iBR32[idx    ];
        let x1aRe = iBR32[idx + 1];
        let x2aRe = iBR32[idx + 2];
        let x3aRe = iBR32[idx + 3];

        let sum1  = x0aRe + x1aRe;
        let sum2  = x2aRe + x3aRe;
        let diff1 = x0aRe - x1aRe;
        let diff2 = x2aRe - x3aRe;

        out32[out_idx]     = sum1 + sum2;
        out32[out_idx + 1] = 0.0;
        out32[out_idx + 2] = diff1;
        out32[out_idx + 3] = diff2;
        out32[out_idx + 4] = sum1 - sum2;
        out32[out_idx + 5] = 0.0;
        out32[out_idx + 6] = diff1;
        out32[out_idx + 7] = -diff2;
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 2 (rolled) - FFT step for SIZE 8 
    ////////////////////////////////////////////////
    { 
     for (let j = 0; j < 4; j++) { 
         let eI = 0 + j;
         let oI = 0 + j + 4;
         let eRe  = out32[eI * 2    ];
         let eIm  = out32[eI * 2 + 1];
         let oRe  = out32[oI * 2    ];
         let oIm  = out32[oI * 2 + 1];
         let tRe  = FFT_FAC_8[j * 2 + 0];
         let tIm  = FFT_FAC_8[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out32[eI * 2    ] = eRe + t_oRe;
         out32[eI * 2 + 1] = eIm + t_oIm;
         out32[oI * 2    ] = eRe - t_oRe;
         out32[oI * 2 + 1] = eIm - t_oIm;
     }
     for (let j = 0; j < 4; j++) { 
         let eI = 8 + j;
         let oI = 8 + j + 4;
         let eRe  = out32[eI * 2    ];
         let eIm  = out32[eI * 2 + 1];
         let oRe  = out32[oI * 2    ];
         let oIm  = out32[oI * 2 + 1];
         let tRe  = FFT_FAC_8[j * 2 + 0];
         let tIm  = FFT_FAC_8[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out32[eI * 2    ] = eRe + t_oRe;
         out32[eI * 2 + 1] = eIm + t_oIm;
         out32[oI * 2    ] = eRe - t_oRe;
         out32[oI * 2 + 1] = eIm - t_oIm;
     }
     for (let j = 0; j < 4; j++) { 
         let eI = 16 + j;
         let oI = 16 + j + 4;
         let eRe  = out32[eI * 2    ];
         let eIm  = out32[eI * 2 + 1];
         let oRe  = out32[oI * 2    ];
         let oIm  = out32[oI * 2 + 1];
         let tRe  = FFT_FAC_8[j * 2 + 0];
         let tIm  = FFT_FAC_8[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out32[eI * 2    ] = eRe + t_oRe;
         out32[eI * 2 + 1] = eIm + t_oIm;
         out32[oI * 2    ] = eRe - t_oRe;
         out32[oI * 2 + 1] = eIm - t_oIm;
     }
     for (let j = 0; j < 4; j++) { 
         let eI = 24 + j;
         let oI = 24 + j + 4;
         let eRe  = out32[eI * 2    ];
         let eIm  = out32[eI * 2 + 1];
         let oRe  = out32[oI * 2    ];
         let oIm  = out32[oI * 2 + 1];
         let tRe  = FFT_FAC_8[j * 2 + 0];
         let tIm  = FFT_FAC_8[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out32[eI * 2    ] = eRe + t_oRe;
         out32[eI * 2 + 1] = eIm + t_oIm;
         out32[oI * 2    ] = eRe - t_oRe;
         out32[oI * 2 + 1] = eIm - t_oIm;
     }
    } 
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 2 (rolled) - FFT step for SIZE 16 
    ////////////////////////////////////////////////
    { 
     for (let j = 0; j < 8; j++) { 
         let eI = 0 + j;
         let oI = 0 + j + 8;
         let eRe  = out32[eI * 2    ];
         let eIm  = out32[eI * 2 + 1];
         let oRe  = out32[oI * 2    ];
         let oIm  = out32[oI * 2 + 1];
         let tRe  = FFT_FAC_16[j * 2 + 0];
         let tIm  = FFT_FAC_16[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out32[eI * 2    ] = eRe + t_oRe;
         out32[eI * 2 + 1] = eIm + t_oIm;
         out32[oI * 2    ] = eRe - t_oRe;
         out32[oI * 2 + 1] = eIm - t_oIm;
     }
     for (let j = 0; j < 8; j++) { 
         let eI = 16 + j;
         let oI = 16 + j + 8;
         let eRe  = out32[eI * 2    ];
         let eIm  = out32[eI * 2 + 1];
         let oRe  = out32[oI * 2    ];
         let oIm  = out32[oI * 2 + 1];
         let tRe  = FFT_FAC_16[j * 2 + 0];
         let tIm  = FFT_FAC_16[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out32[eI * 2    ] = eRe + t_oRe;
         out32[eI * 2 + 1] = eIm + t_oIm;
         out32[oI * 2    ] = eRe - t_oRe;
         out32[oI * 2 + 1] = eIm - t_oIm;
     }
    } 
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 2 (rolled) - FFT step for SIZE 32 
    ////////////////////////////////////////////////
    { 
     for (let j = 0; j < 16; j++) { 
         let eI = 0 + j;
         let oI = 0 + j + 16;
         let eRe  = out32[eI * 2    ];
         let eIm  = out32[eI * 2 + 1];
         let oRe  = out32[oI * 2    ];
         let oIm  = out32[oI * 2 + 1];
         let tRe  = FFT_FAC_32[j * 2 + 0];
         let tIm  = FFT_FAC_32[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out32[eI * 2    ] = eRe + t_oRe;
         out32[eI * 2 + 1] = eIm + t_oIm;
         out32[oI * 2    ] = eRe - t_oRe;
         out32[oI * 2 + 1] = eIm - t_oIm;
     }
    } 

    return out32;
} 

export {fftReal32}; 

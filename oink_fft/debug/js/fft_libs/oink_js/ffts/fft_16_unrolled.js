let FFT_FAC_4 = new Float32Array([
1.0000000000000000,-0.0000000000000000,-0.0000000437113883,-1.0000000000000000
]);
let FFT_FAC_8 = new Float32Array([
1.0000000000000000,-0.0000000000000000,0.7071067690849304,-0.7071067690849304,-0.0000000437113883,-1.0000000000000000,-0.7071067690849304,-0.7071067690849304
]);
let FFT_FAC_16 = new Float32Array([
1.0000000000000000,-0.0000000000000000,0.9238795042037964,-0.3826834559440613,0.7071067690849304,-0.7071067690849304,0.3826834261417389,-0.9238795042037964,
-0.0000000437113883,-1.0000000000000000,-0.3826833963394165,-0.9238795638084412,-0.7071067690849304,-0.7071067690849304,-0.9238795042037964,-0.3826834857463837
]);


let iBR16 = new Float32Array(16);
let iP16  = new Float32Array(16);
let _iP16 = new Float32Array(16);
let out16 = new Float32Array(32);

function fftReal16(realInput) { 
    let size = realInput.length;
    if (size != 16) {
        for (let i = 0; i < 16; i++) {
            iP16[i] = (i < size) ? realInput[i] : 0.0;
        }
        _iP16 = iP16;
    } else {
        _iP16 = realInput;
    }


    //Bit Reversal
    {
        iBR16[0]=_iP16[0]; 
        iBR16[1]=_iP16[8]; 
        iBR16[2]=_iP16[4]; 
        iBR16[3]=_iP16[12]; 
        iBR16[4]=_iP16[2]; 
        iBR16[5]=_iP16[10]; 
        iBR16[6]=_iP16[6]; 
        iBR16[7]=_iP16[14]; 
        iBR16[8]=_iP16[1]; 
        iBR16[9]=_iP16[9]; 
        iBR16[10]=_iP16[5]; 
        iBR16[11]=_iP16[13]; 
        iBR16[12]=_iP16[3]; 
        iBR16[13]=_iP16[11]; 
        iBR16[14]=_iP16[7]; 
        iBR16[15]=_iP16[15]; 
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 4 - FFT step for SIZE 4/8 
    ////////////////////////////////////////////////

    for (let idx = 0, out_idx = 0; idx < 16; idx += 4, out_idx += 8) {
        let x0aRe = iBR16[idx    ];
        let x1aRe = iBR16[idx + 1];
        let x2aRe = iBR16[idx + 2];
        let x3aRe = iBR16[idx + 3];

        let sum1  =   x0aRe + x1aRe;
        let sum2  =   x2aRe + x3aRe;
        let diff1 =   x0aRe - x1aRe;
        let diff2 =   x3aRe - x2aRe;

        out16[out_idx]     = sum1 + sum2;
        out16[out_idx + 1] = 0.0;
        out16[out_idx + 2] = diff1;
        out16[out_idx + 3] = diff2;
        out16[out_idx + 4] = sum1 - sum2;
        out16[out_idx + 5] = 0.0;
        out16[out_idx + 6] = diff1;
        out16[out_idx + 7] = -diff2;
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 2 (rolled) - FFT step for SIZE 8 
    ////////////////////////////////////////////////
    { 
     for (let j = 0; j < 4; j++) { 
         let eI = 0 + j;
         let oI = 0 + j + 4;
         let eRe  = out16[eI * 2    ];
         let eIm  = out16[eI * 2 + 1];
         let oRe  = out16[oI * 2    ];
         let oIm  = out16[oI * 2 + 1];
         let tRe  = FFT_FAC_8[j * 2 + 0];
         let tIm  = FFT_FAC_8[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out16[eI * 2    ] = eRe + t_oRe;
         out16[eI * 2 + 1] = eIm + t_oIm;
         out16[oI * 2    ] = eRe - t_oRe;
         out16[oI * 2 + 1] = eIm - t_oIm;
     }
     for (let j = 0; j < 4; j++) { 
         let eI = 8 + j;
         let oI = 8 + j + 4;
         let eRe  = out16[eI * 2    ];
         let eIm  = out16[eI * 2 + 1];
         let oRe  = out16[oI * 2    ];
         let oIm  = out16[oI * 2 + 1];
         let tRe  = FFT_FAC_8[j * 2 + 0];
         let tIm  = FFT_FAC_8[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out16[eI * 2    ] = eRe + t_oRe;
         out16[eI * 2 + 1] = eIm + t_oIm;
         out16[oI * 2    ] = eRe - t_oRe;
         out16[oI * 2 + 1] = eIm - t_oIm;
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
         let eRe  = out16[eI * 2    ];
         let eIm  = out16[eI * 2 + 1];
         let oRe  = out16[oI * 2    ];
         let oIm  = out16[oI * 2 + 1];
         let tRe  = FFT_FAC_16[j * 2 + 0];
         let tIm  = FFT_FAC_16[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out16[eI * 2    ] = eRe + t_oRe;
         out16[eI * 2 + 1] = eIm + t_oIm;
         out16[oI * 2    ] = eRe - t_oRe;
         out16[oI * 2 + 1] = eIm - t_oIm;
     }
    } 

    return out16;
} 

export {fftReal16}; 

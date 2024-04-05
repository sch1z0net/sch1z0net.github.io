let FFT_FAC_4 = new Float32Array([
1.0000000000000000,-0.0000000000000000,-0.0000000437113883,-1.0000000000000000
]);
let FFT_FAC_8 = new Float32Array([
1.0000000000000000,-0.0000000000000000,0.7071067690849304,-0.7071067690849304,-0.0000000437113883,-1.0000000000000000,-0.7071067690849304,-0.7071067690849304
]);


let iBR8 = new Float32Array(8);
let iP8  = new Float32Array(8);
let _iP8 = new Float32Array(8);
let out8 = new Float32Array(16);

function fftReal8(realInput) { 
    let size = realInput.length;
    if (size != 8) {
        for (let i = 0; i < 8; i++) {
            iP8[i] = (i < size) ? realInput[i] : 0.0;
        }
        _iP8 = iP8;
    } else {
        _iP8 = realInput;
    }


    //Bit Reversal
    {
        iBR8[0]=_iP8[0]; 
        iBR8[1]=_iP8[4]; 
        iBR8[2]=_iP8[2]; 
        iBR8[3]=_iP8[6]; 
        iBR8[4]=_iP8[1]; 
        iBR8[5]=_iP8[5]; 
        iBR8[6]=_iP8[3]; 
        iBR8[7]=_iP8[7]; 
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 4 - FFT step for SIZE 4/8 
    ////////////////////////////////////////////////

    for (let idx = 0, out_idx = 0; idx < 8; idx += 4, out_idx += 8) {
        let x0aRe = iBR8[idx    ];
        let x1aRe = iBR8[idx + 1];
        let x2aRe = iBR8[idx + 2];
        let x3aRe = iBR8[idx + 3];

        let sum1  =   x0aRe + x1aRe;
        let sum2  =   x2aRe + x3aRe;
        let diff1 =   x0aRe - x1aRe;
        let diff2 =   x3aRe - x2aRe;

        out8[out_idx]     = sum1 + sum2;
        out8[out_idx + 1] = 0.0;
        out8[out_idx + 2] = diff1;
        out8[out_idx + 3] = diff2;
        out8[out_idx + 4] = sum1 - sum2;
        out8[out_idx + 5] = 0.0;
        out8[out_idx + 6] = diff1;
        out8[out_idx + 7] = -diff2;
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 2 (rolled) - FFT step for SIZE 8 
    ////////////////////////////////////////////////
    { 
     /*
     for (let j = 0; j < 4; j++) { 
         let eI = 0 + j;
         let oI = 0 + j + 4;
         let eRe  = out8[eI * 2    ];
         let eIm  = out8[eI * 2 + 1];
         let oRe  = out8[oI * 2    ];
         let oIm  = out8[oI * 2 + 1];
         let tRe  = FFT_FAC_8[j * 2 + 0];
         let tIm  = FFT_FAC_8[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out8[eI * 2    ] = eRe + t_oRe;
         out8[eI * 2 + 1] = eIm + t_oIm;
         out8[oI * 2    ] = eRe - t_oRe;
         out8[oI * 2 + 1] = eIm - t_oIm;
     }
     */

            let xA0re  = out8[0];
            let xA0im  = 0;
            let xA4re  = out8[8];
            let xA4im  = 0;

            let xA1re  = out8[2];
            let xA1im  = out8[3];
            let xA5re  = out8[10];
            let xA5im  = out8[11];

            let xA2re  = out8[4];
            let xA2im  = 0;
            let xA6re  = out8[12];
            let xA6im  = 0;

            let xA3re  =  xA1re;
            let xA3im  = -xA1im;
            let xA7re  =  xA5re;
            let xA7im  = -xA5im;

         

         //FFT_FAC_8[0]
         //FFT_FAC_8[1]
         let resA0 = xA0re + xA4re;
         let resA1 = 0;
         let resA8 = xA0re - xA4re;
         let resA9 = 0;

         out8[0] =  resA0;
         out8[1] =  resA1;
         out8[8] =  resA8;
         out8[9] =  resA9;

         //FFT_FAC_8[2]
         //FFT_FAC_8[3]
         let tRe = 0.7071067690849304;  //FFT_FAC_8[2];
         let resA2  = xA1re + (xA5re * tRe - xA5im *-tRe);
         let resA3  = xA1im + (xA5re *-tRe + xA5im * tRe);
         let resA10 = xA1re - (xA5re * tRe - xA5im *-tRe);
         let resA11 = xA1im - (xA5re *-tRe + xA5im * tRe);

         out8[2]  = resA2;
         out8[3]  = resA3;
         out8[10] = resA10;
         out8[11] = resA11;

         //FFT_FAC_8[4]
         //FFT_FAC_8[5]
         let resA4  =   xA2re;
         let resA5  = - xA6re;
         let resA12 =   xA2re;
         let resA13 =   xA6re;

         out8[4]  = resA4;
         out8[5]  = resA5;
         out8[12] = resA12;
         out8[13] = resA13;

         //FFT_FAC_8[6]
         //FFT_FAC_8[7]
         let resA6  =  xA1re + (xA5re * -tRe - xA5im * tRe);
         let resA7  = -xA1im + (xA5re * -tRe + xA5im * tRe);
         let resA14 =  xA1re - (xA5re * -tRe - xA5im * tRe);
         let resA15 = -xA1im - (xA5re * -tRe + xA5im * tRe);

         out8[6]  = resA6;
         out8[7]  = resA7;
         out8[14] = resA14;
         out8[15] = resA15;

    } 

    return out8;
} 

export {fftReal8}; 

let FFT_FAC_4 = new Float32Array([
1.0000000000000000,0.0000000000000000,-0.0000000437113883,1.0000000000000000
]);


let iBR4 = new Float32Array(4);
let iP4  = new Float32Array(4);
let _iP4 = new Float32Array(4);
let out4 = new Float32Array(8);

function fftReal4(realInput) { 
    let size = realInput.length;
    if (size != 4) {
        for (let i = 0; i < 4; i++) {
            iP4[i] = (i < size) ? realInput[i] : 0.0;
        }
        _iP4 = iP4;
    } else {
        _iP4 = realInput;
    }


    //Bit Reversal
    {
        iBR4[0]=_iP4[0]; 
        iBR4[1]=_iP4[2]; 
        iBR4[2]=_iP4[1]; 
        iBR4[3]=_iP4[3]; 
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 4 - FFT step for SIZE 4/8 
    ////////////////////////////////////////////////

    for (let idx = 0, out_idx = 0; idx < 4; idx += 4, out_idx += 8) {
        let x0aRe = iBR4[idx    ];
        let x1aRe = iBR4[idx + 1];
        let x2aRe = iBR4[idx + 2];
        let x3aRe = iBR4[idx + 3];

        let sum1  = x0aRe + x1aRe;
        let sum2  = x2aRe + x3aRe;
        let diff1 = x0aRe - x1aRe;
        let diff2 = x2aRe - x3aRe;

        out4[out_idx]     = sum1 + sum2;
        out4[out_idx + 1] = 0.0;
        out4[out_idx + 2] = diff1;
        out4[out_idx + 3] = diff2;
        out4[out_idx + 4] = sum1 - sum2;
        out4[out_idx + 5] = 0.0;
        out4[out_idx + 6] = diff1;
        out4[out_idx + 7] = -diff2;
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 4 - FFT step for SIZE 16/32 
    ////////////////////////////////////////////////

    for (let idx = 0; idx < 8; idx += 32) {
        let x0aRe = out4[idx     ];
        let x0bRe = out4[idx +  2];
        let x0bIm = out4[idx +  3];
        let x0cRe = out4[idx +  4];

        let x1aRe = out4[idx +  8];
        out4[idx +   8] = x0aRe - x1aRe;
        let x1bRe = out4[idx + 10];
        let x1bIm = out4[idx + 11];
        let x1cRe = out4[idx + 12];

        let x2aRe = out4[idx + 16];
        let x2bRe = out4[idx + 18];
        let x2bIm = out4[idx + 19];
        let x2cRe = out4[idx + 20];

        let x3aRe = out4[idx + 24];
        out4[idx +  24] = x0aRe - x1aRe;
        out4[idx +  25] = x3aRe - x2aRe;
        let x3bRe = out4[idx + 26];
        let x3bIm = out4[idx + 27];
        let x3cRe = out4[idx + 28];
        out4[idx      ] = x0aRe + x1aRe + x2aRe + x3aRe;
        out4[idx +   9] = x2aRe - x3aRe;
        out4[idx +  16] = x0aRe + x1aRe - x2aRe - x3aRe;

        let t1Re_2c = 0.7071067690849304;

        let x2cRe_tRe_2c = x2cRe * t1Re_2c;
        let x3cRe_tRe_2c = x3cRe * t1Re_2c;

        let resReC1 = x0cRe + x2cRe_tRe_2c - x3cRe_tRe_2c;
        out4[idx +  28] =   resReC1;
        out4[idx +   4] =   resReC1;
        let resImC1 = x1cRe + x2cRe_tRe_2c + x3cRe_tRe_2c;
        out4[idx +   5] =   resImC1;
        out4[idx +  29] = - resImC1;
        let resReC2 = x0cRe - x2cRe_tRe_2c + x3cRe_tRe_2c;
        out4[idx +  20] =   resReC2;
        out4[idx +  12] =   resReC2;
        let resImC2 = x1cRe - x2cRe_tRe_2c - x3cRe_tRe_2c;
        out4[idx +  13] = - resImC2;
        out4[idx +  21] =   resImC2;

        let x1dif = (x1bRe-x1bIm);
        let x1sum = (x1bRe+x1bIm);
        let x3dif = (x3bRe-x3bIm);
        let x3sum = (x3bRe+x3bIm);

        let t1Re_1b = 0.9807852506637573;

        let x1dif_tRe_1b = x1dif * t1Re_1b;
        let x1sum_tRe_1b = x1sum * t1Re_1b;

        let t1Re_1b2b = 0.9061273932456970;
        let t1Re_1b2d = 0.3753302693367004;

        let x3dif_tRe_1b2b = x3dif * t1Re_1b2b;
        let x3dif_tRe_1b2d = x3dif * t1Re_1b2d;
        let x3sum_tRe_1b2b = x3sum * t1Re_1b2b;
        let x3sum_tRe_1b2d = x3sum * t1Re_1b2d;

        let t1Re_2b = 0.9238795042037964;
        let t1Re_2d = 0.3826834261417389;

        let tempReB = (x3dif_tRe_1b2b - x3sum_tRe_1b2d + x2bRe*t1Re_2b - x2bIm*t1Re_2d);
        let tempImB = (x3dif_tRe_1b2d + x3sum_tRe_1b2b + x2bRe*t1Re_2d + x2bIm*t1Re_2b);
        let tempReD = (x3dif_tRe_1b2d + x3sum_tRe_1b2b - x2bRe*t1Re_2d - x2bIm*t1Re_2b);
        let tempImD = (x3dif_tRe_1b2b - x3sum_tRe_1b2d - x2bRe*t1Re_2b + x2bIm*t1Re_2d);

        let resReB1 = x0bRe  + x1dif_tRe_1b + tempReB;
        out4[idx +   2] =   resReB1;
        out4[idx +  30] =   resReB1;
        let resReB2 = x0bRe  + x1dif_tRe_1b - tempReB;
        out4[idx +  18] =   resReB2;
        out4[idx +  14] =   resReB2;
        let resReD1 = x0bRe  - x1dif_tRe_1b - tempReD;
        out4[idx +   6] =   resReD1;
        out4[idx +  26] =   resReD1;
        let resReD2 = x0bRe  - x1dif_tRe_1b + tempReD;
        out4[idx +  22] =   resReD2;
        out4[idx +  10] =   resReD2;

        let resImB1 = x0bIm  + x1sum_tRe_1b + tempImB;
        out4[idx +   3] =   resImB1;
        out4[idx +  31] = - resImB1;
        let resImB2 = x0bIm  + x1sum_tRe_1b - tempImB;
        out4[idx +  19] =   resImB2;
        out4[idx +  15] = - resImB2;
        let resImD1 =-x0bIm  + x1sum_tRe_1b - tempImD;
        out4[idx +   7] =   resImD1;
        out4[idx +  27] = - resImD1;
        let resImD2 =-x0bIm  + x1sum_tRe_1b + tempImD;
        out4[idx +  23] =   resImD2;
        out4[idx +  11] = - resImD2;
    }


    return out4;
} 

export {fftReal4}; 

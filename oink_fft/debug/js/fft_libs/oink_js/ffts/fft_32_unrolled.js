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
let FFT_FAC_32 = new Float32Array([
1.0000000000000000,-0.0000000000000000,0.9807852506637573,-0.1950903236865997,0.9238795042037964,-0.3826834559440613,0.8314695954322815,-0.5555702447891235,
0.7071067690849304,-0.7071067690849304,0.5555702447891235,-0.8314695954322815,0.3826834261417389,-0.9238795042037964,0.1950903534889221,-0.9807852506637573,
-0.0000000437113883,-1.0000000000000000,-0.1950903236865997,-0.9807852506637573,-0.3826833963394165,-0.9238795638084412,-0.5555701851844788,-0.8314696550369263,
-0.7071067690849304,-0.7071067690849304,-0.8314696550369263,-0.5555701851844788,-0.9238795042037964,-0.3826834857463837,-0.9807853102684021,-0.1950903087854385
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
    // RADIX 4 - FFT step for SIZE 2/4 
    ////////////////////////////////////////////////

    for (let idx = 0, out_idx = 0; idx < 32; idx += 4, out_idx += 8) {
        let x0aRe = iBR32[idx    ];
        let x1aRe = iBR32[idx + 1];
        let x2aRe = iBR32[idx + 2];
        let x3aRe = iBR32[idx + 3];

        let sum1  =   x0aRe + x1aRe;
        let sum2  =   x2aRe + x3aRe;
        let diff1 =   x0aRe - x1aRe;
        let diff2 =   x3aRe - x2aRe;

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
    // RADIX 4 - FFT step for SIZE 8/16 
    ////////////////////////////////////////////////
    /*
    for (let idx = 0; idx < 64; idx += 32) {
        let x0aRe = out32[idx     ];
        let x0bRe = out32[idx +  2];
        let x0bIm = out32[idx +  3];
        let x0cRe = out32[idx +  4];

        let x1aRe = out32[idx +  8];
        out32[idx +   8] = x0aRe - x1aRe;
        let x1bRe = out32[idx + 10];
        let x1bIm = out32[idx + 11];
        let x1cRe = out32[idx + 12];

        let x2aRe = out32[idx + 16];
        let x2bRe = out32[idx + 18];
        let x2bIm = out32[idx + 19];
        let x2cRe = out32[idx + 20];

        let x3aRe = out32[idx + 24];
        out32[idx +  24] = x0aRe - x1aRe;
        out32[idx +  25] = x3aRe - x2aRe;
        let x3bRe = out32[idx + 26];
        let x3bIm = out32[idx + 27];
        let x3cRe = out32[idx + 28];
        out32[idx      ] = x0aRe + x1aRe + x2aRe + x3aRe;
        out32[idx +   9] = x2aRe - x3aRe;
        out32[idx +  16] = x0aRe + x1aRe - x2aRe - x3aRe;

        let t1Re_2c = 0.7071067690849304;

        let x2cRe_tRe_2c = x2cRe * t1Re_2c;
        let x3cRe_tRe_2c = x3cRe * t1Re_2c;

        let resReC1 = x0cRe + x2cRe_tRe_2c - x3cRe_tRe_2c;
        out32[idx +  28] =   resReC1;
        out32[idx +   4] =   resReC1;
        let resImC1 = x1cRe + x2cRe_tRe_2c + x3cRe_tRe_2c;
        out32[idx +   5] =   resImC1;
        out32[idx +  29] = - resImC1;
        let resReC2 = x0cRe - x2cRe_tRe_2c + x3cRe_tRe_2c;
        out32[idx +  20] =   resReC2;
        out32[idx +  12] =   resReC2;
        let resImC2 = x1cRe - x2cRe_tRe_2c - x3cRe_tRe_2c;
        out32[idx +  13] = - resImC2;
        out32[idx +  21] =   resImC2;

        let x1dif = (x1bRe-x1bIm);
        let x1sum = (x1bRe+x1bIm);
        let x3dif = (x3bRe-x3bIm);
        let x3sum = (x3bRe+x3bIm);

        let t1Re_1b = 0.7071067690849304;

        let x1dif_tRe_1b = x1dif * t1Re_1b;
        let x1sum_tRe_1b = x1sum * t1Re_1b;

        let t1Re_1b2b = 0.6532814502716064;
        let t1Re_1b2d = 0.2705980539321899;

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
        out32[idx +   2] =   resReB1;
        out32[idx +  30] =   resReB1;
        let resReB2 = x0bRe  + x1dif_tRe_1b - tempReB;
        out32[idx +  18] =   resReB2;
        out32[idx +  14] =   resReB2;
        let resReD1 = x0bRe  - x1dif_tRe_1b - tempReD;
        out32[idx +   6] =   resReD1;
        out32[idx +  26] =   resReD1;
        let resReD2 = x0bRe  - x1dif_tRe_1b + tempReD;
        out32[idx +  22] =   resReD2;
        out32[idx +  10] =   resReD2;

        let resImB1 = x0bIm  + x1sum_tRe_1b + tempImB;
        out32[idx +   3] =   resImB1;
        out32[idx +  31] = - resImB1;
        let resImB2 = x0bIm  + x1sum_tRe_1b - tempImB;
        out32[idx +  19] =   resImB2;
        out32[idx +  15] = - resImB2;
        let resImD1 =-x0bIm  + x1sum_tRe_1b - tempImD;
        out32[idx +   7] =   resImD1;
        out32[idx +  27] = - resImD1;
        let resImD2 =-x0bIm  + x1sum_tRe_1b + tempImD;
        out32[idx +  23] =   resImD2;
        out32[idx +  11] = - resImD2;
    }*/


    for (let idx = 0; idx < 64; idx += 32) {
        let xA0re  = out32[idx + 0];
        let xA1re  = out32[idx + 2];
        let xA1im  = out32[idx + 3];
        let xA2re  = out32[idx + 4];

        let xA4re  = out32[idx + 8];
        out32[idx + 8]  =     xA0re - xA4re;
        let xA5re  = out32[idx + 10];
        let xA5im  = out32[idx + 11];
        let xA6re  = out32[idx + 12];

        let xA8re  = out32[idx + 16]; 
        let xA9re  = out32[idx + 18]; 
        let xA9im  = out32[idx + 19]; 
        let xA10re = out32[idx + 20]; 

        let xA12re = out32[idx + 24]; 
        out32[idx + 24] =     xA0re - xA4re;
        out32[idx + 25] =     xA8re - xA12re;
        out32[idx + 9]  =   - xA8re + xA12re;
        out32[idx + 0]  = xA0re + xA4re + (xA8re + xA12re);
        out32[idx + 1]  = 0;
        out32[idx + 16] = xA0re + xA4re - (xA8re + xA12re);
        out32[idx + 17] = 0;
        let xA13re = out32[idx + 26]; 
        let xA13im = out32[idx + 27]; 
        let xA14re = out32[idx + 28]; 



         let tRe = 0.7071067690849304;  //FFT_FAC_8[2];
         let x1re  =  xA1re + (xA5re  *  tRe + xA5im  *  tRe);    
         let x1im  =  xA1im + (xA5re  * -tRe + xA5im  *  tRe);
         let x9re  =  xA9re + (xA13re *  tRe - xA13im * -tRe); 
         let x9im  =  xA9im + (xA13re * -tRe + xA13im *  tRe);

         let t1re  = 0.9238795042037964; //FFT_FAC_16[2];
         let t3re  = 0.3826834261417389; //FFT_FAC_16[6];
         let res3  =  x1im + (x9re * -t3re  + x9im *  t1re);
         out32[idx + 31] = -res3;
         let res2  =  x1re + (x9re *  t1re  - x9im * -t3re);
         out32[idx + 30] =  res2;
         let res19 =  x1im - (x9re * -t3re  + x9im *  t1re);
         out32[idx + 19] =  res19;
         let res18 =  x1re - (x9re *  t1re  - x9im * -t3re);
         out32[idx + 18] =  res18;

         out32[idx + 15] = -res19;
         out32[idx + 14] =  res18;
         out32[idx + 3]  =  res3;
         out32[idx + 2]  =  res2;

         


         let res4  = xA2re + (xA10re *  tRe + xA14re * -tRe);
         out32[idx + 4]  =  res4;
         let res5  =-xA6re + (xA10re * -tRe - xA14re *  tRe);
         out32[idx + 5]  =  res5;
         let res20 = xA2re - (xA10re *  tRe + xA14re * -tRe);
         out32[idx + 12] =  res20;
         let res21 =-xA6re - (xA10re * -tRe - xA14re *  tRe);
         out32[idx + 13] = -res21;

         out32[idx + 20] =  res20;
         out32[idx + 21] =  res21;
         out32[idx + 28] =  res4;
         out32[idx + 29] = -res5;


         let x3re  =  xA1re - (xA5re  *  tRe + xA5im  *  tRe);    
         let x3im  = -xA1im + (xA5re  * -tRe + xA5im  *  tRe);
         let x11re =  xA9re + (xA13re * -tRe - xA13im *  tRe); 
         let x11im = -xA9im + (xA13re * -tRe + xA13im *  tRe);


         let res7  = x3im + (x11re * -t1re + x11im *  t3re);
         out32[idx + 27] = -res7;
         let res6  = x3re + (x11re *  t3re - x11im * -t1re);
         out32[idx + 26] =  res6;
         let res23 = x3im - (x11re * -t1re + x11im *  t3re);
         out32[idx + 23] =  res23;
         let res22 = x3re - (x11re *  t3re - x11im * -t1re);
         out32[idx + 22] =  res22;

         out32[idx + 11] = -res23;
         out32[idx + 10] =  res22;
         out32[idx + 6]  =  res6;
         out32[idx + 7]  =  res7;
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

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 2 (complete)
    ////////////////////////////////////////////////
    /*for (let size = 32; size <= 32; size*=2) { 
        for (let i = 0; i < 32; i+=size) { 
           for (let j = 0; j < size/2; j++) { 
             let eI = i + j;
             let oI = i + j + size/2;
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
    }*/

    return out32;
} 

export {fftReal32}; 

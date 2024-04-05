let FFT_FAC_4 = new Float32Array([
1.0000000000000000,-0.0000000000000000,-0.0000000437113883,-1.0000000000000000
]);
let FFT_FAC_8 = new Float32Array([
1.0000000000000000,-0.0000000000000000,0.7071067690849304,-0.707690849304,-0.0000000437113883,-1.0000000000000000,-0.7071067690849304,-0.7071067690849304
]);
let FFT_FAC_16 = new Float32Array([
1.0000000000000000,-0.0000000000000000,

0.9238795042037964,-0.3826834559440613,
0.7071067690849304,-0.7071067690849304,
0.3826834261417389,-0.9238795042037964,

-0.0000000437113883,-1.0000000000000000,

-0.3826833963394165,-0.9238795638084412,
-0.7071067690849304,-0.7071067690849304,
-0.9238795042037964,-0.3826834857463837
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
    // RADIX 4 - FFT step for SIZE 2/4 
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
    // RADIX 4 - FFT step for SIZE 8/16 
    ////////////////////////////////////////////////
    {

            let xA0re  = out16[0];
            let xA0im  = 0;
            let xA4re  = out16[8];
            let xA4im  = 0;

            let xA1re  = out16[2];
            let xA1im  = out16[3];
            let xA5re  = out16[10];
            let xA5im  = out16[11];

            let xA2re  = out16[4];
            let xA2im  = 0;
            let xA6re  = out16[12];
            let xA6im  = 0;

            let xA3re  =  xA1re;
            let xA3im  = -xA1im;
            let xA7re  =  xA5re;
            let xA7im  = -xA5im;


            let xA8re  = out16[16]; 
            let xA8im  = 0
            let xA12re = out16[24]; 
            let xA12im = 0

            let xA9re  = out16[18]; 
            let xA9im  = out16[19]; 
            let xA13re = out16[26]; 
            let xA13im = out16[27]; 

            let xA10re = out16[20]; 
            let xA10im = 0
            let xA14re = out16[28]; 
            let xA14im = 0

            let xA11re =  xA9re;
            let xA11im = -xA9im;
            let xA15re =  xA13re;
            let xA15im = -xA13im;


         // float eRe  = out16[2];
         // float eIm  = out16[3];
         // float oRe  = out16[18];
         // float oIm  = out16[19];

         // float tRe = FFT_FAC_8[2];
         // float tIm = FFT_FAC_8[3];
         // let res2  = eRe + (oRe * tRe - oIm * tIm);
         // let res3  = eIm + (oRe * tIm + oIm * tRe);
         // let res18 = eRe - (oRe * tRe - oIm * tIm);
         // let res19 = eIm - (oRe * tIm + oIm * tRe);

         // out16[2]  = res2;
         // out16[3]  = res3;
         // out16[18] = res18;
         // out16[19] = res19;



         

         //FFT_FAC_8[0]
         //FFT_FAC_8[1]
         let resA0 = xA0re + xA4re;
         let resA1 = 0;
         let resA8 = xA0re - xA4re;
         let resA9 = 0;

         out16[0] =  resA0;
         out16[1] =  resA1;
         out16[8] =  resA8;
         out16[9] =  resA9;

         //FFT_FAC_8[2]
         //FFT_FAC_8[3]
         let tRe = 0.7071067690849304;  //FFT_FAC_8[2];
         let resA2  = xA1re + (xA5re * tRe - xA5im *-tRe);
         let resA3  = xA1im + (xA5re *-tRe + xA5im * tRe);
         let resA10 = xA1re - (xA5re * tRe - xA5im *-tRe);
         let resA11 = xA1im - (xA5re *-tRe + xA5im * tRe);

         out16[2]  = resA2;
         out16[3]  = resA3;
         out16[10] = resA10;
         out16[11] = resA11;

         //FFT_FAC_8[4]
         //FFT_FAC_8[5]
         let resA4  =   xA2re;
         let resA5  = - xA6re;
         let resA12 =   xA2re;
         let resA13 =   xA6re;

         out16[4]  = resA4;
         out16[5]  = resA5;
         out16[12] = resA12;
         out16[13] = resA13;

         //FFT_FAC_8[6]
         //FFT_FAC_8[7]
         let resA6  =  xA1re + (xA5re * -tRe - xA5im * tRe);
         let resA7  = -xA1im + (xA5re * -tRe + xA5im * tRe);
         let resA14 =  xA1re - (xA5re * -tRe - xA5im * tRe);
         let resA15 = -xA1im - (xA5re * -tRe + xA5im * tRe);

         out16[6]  = resA6;
         out16[7]  = resA7;
         out16[14] = resA14;
         out16[15] = resA15;



         //FFT_FAC_8[0]
         //FFT_FAC_8[1]
         let resA16  = xA8re + xA12re;
         let resA17  = 0;
         let resA24  = xA8re - xA12re;
         let resA25  = 0;

         out16[16]  = resA16;
         out16[17]  = resA17;
         out16[24]  = resA24;
         out16[25]  = resA25;

         //FFT_FAC_8[2]
         //FFT_FAC_8[3]
         let resA18  = xA9re + (xA13re *  tRe - xA13im * -tRe);
         let resA19  = xA9im + (xA13re * -tRe + xA13im *  tRe);
         let resA26  = xA9re - (xA13re *  tRe - xA13im * -tRe);
         let resA27  = xA9im - (xA13re * -tRe + xA13im *  tRe);

         out16[18]  = resA18;
         out16[19]  = resA19;
         out16[26]  = resA26;
         out16[27]  = resA27;

         //FFT_FAC_8[4]
         //FFT_FAC_8[5]

         let resA20  =  xA10re;
         let resA21  = -xA14re;
         let resA28  =  xA10re;
         let resA29  =  xA14re;

         out16[20]  = resA20;
         out16[21]  = resA21;
         out16[28]  = resA28;
         out16[29]  = resA29;

         //FFT_FAC_8[6]
         //FFT_FAC_8[7]

         let resA22  =  xA9re + (xA13re * -tRe - xA13im * tRe);
         let resA23  = -xA9im + (xA13re * -tRe + xA13im * tRe);
         let resA30  =  xA9re - (xA13re * -tRe - xA13im * tRe);
         let resA31  = -xA9im - (xA13re * -tRe + xA13im * tRe);

         out16[22]  = resA22;
         out16[23]  = resA23;
         out16[30]  = resA30;
         out16[31]  = resA31;







         let x0re = out16[0];  let x0im = out16[1];
         let x1re = out16[2];  let x1im = out16[3];
         let x2re = out16[4];  let x2im = out16[5];
         let x3re = out16[6];  let x3im = out16[7];
         let x4re = out16[8];  let x4im = out16[9];
         let x5re = out16[10]; let x5im = out16[11];
         let x6re = out16[12]; let x6im = out16[13];
         let x7re = out16[14]; let x7im = out16[15];

         let x8re = out16[16]; let x8im = out16[17]; //Nyquist

         let x9re  = x7re;     let x9im  = -x7im;
         let x10re = x6re;     let x10im = -x6im; 
         let x11re = x5re;     let x11im = -x5im;
         let x12re = x4re;     let x12im = -x4im; 
         let x13re = x3re;     let x13im = -x3im;
         let x14re = x2re;     let x14im = -x2im; 
         let x15re = x1re;     let x15im = -x1im;




         let t1re  = FFT_FAC_16[2];
         let t2re  = FFT_FAC_16[4];
         let t3re  = FFT_FAC_16[6];


         // float eRe  = out16[0];
         // float eIm  = out16[1];
         // float oRe  = out16[16];
         // float oIm  = out16[17];

         // float tRe = FFT_FAC_16[0];
         // float tIm = FFT_FAC_16[1];
        
         // out16[0]  = eRe + (oRe * tRe - oIm * tIm);
         // out16[1]  = eIm + (oRe * tIm + oIm * tRe);
         // out16[16] = eRe - (oRe * tRe - oIm * tIm);
         // out16[17] = eIm - (oRe * tIm + oIm * tRe);

         out16[0]  = x0re + x8re;
         out16[1]  = x0im + x8im;
         out16[16] = x0re - x8re;
         out16[17] = x0im - x8im;



         // float eRe  = out16[2];
         // float eIm  = out16[3];
         // float oRe  = out16[18];
         // float oIm  = out16[19];

         // float tRe = FFT_FAC_16[2]; 
         // float tIm = FFT_FAC_16[3]; 
        
         // out16[2]  = eRe + (oRe * tRe - oIm * tIm);
         // out16[3]  = eIm + (oRe * tIm + oIm * tRe);
         // out16[18] = eRe - (oRe * tRe - oIm * tIm);
         // out16[19] = eIm - (oRe * tIm + oIm * tRe);

         let res2  =  x1re + (x7re *  t1re  + x7im * -t3re);
         let res3  =  x1im + (x7re * -t3re  - x7im *  t1re); 
         let res18 =  x1re - (x7re *  t1re  + x7im * -t3re);
         let res19 =  x1im - (x7re * -t3re  - x7im *  t1re);
         out16[2]  =  res2;
         out16[3]  =  res3;
         out16[18] =  res18;
         out16[19] =  res19;

         out16[14] =  res18;
         out16[15] = -res19;
         out16[30] =  res2;
         out16[31] = -res3;


         // float eRe  = out16[4];
         // float eIm  = out16[5];
         // float oRe  = out16[20];
         // float oIm  = out16[21];

         // float tRe = FFT_FAC_16[4];
         // float tIm = FFT_FAC_16[5];
        
         // out16[4]  = eRe + (oRe * tRe - oIm * tIm);
         // out16[5]  = eIm + (oRe * tIm + oIm * tRe);
         // out16[20] = eRe - (oRe * tRe - oIm * tIm);
         // out16[21] = eIm - (oRe * tIm + oIm * tRe);

         let res4  = x2re + (x6re *  t2re + x6im * -t2re);
         let res5  = x2im + (x6re * -t2re - x6im *  t2re);
         let res20 = x2re - (x6re *  t2re + x6im * -t2re);
         let res21 = x2im - (x6re * -t2re - x6im *  t2re);
         out16[4]  =  res4;  //
         out16[5]  =  res5;  //
         out16[20] =  res20;
         out16[21] =  res21;

         out16[12] =  res20;
         out16[13] = -res21;
         out16[27] =  res4;
         out16[28] = -res5;


         // float eRe  = out16[6];
         // float eIm  = out16[7];
         // float oRe  = out16[22];
         // float oIm  = out16[23];

         // float tRe = FFT_FAC_16[6];
         // float tIm = FFT_FAC_16[7];
        
         // out16[6]  = eRe + (oRe * tRe - oIm * tIm);
         // out16[7]  = eIm + (oRe * tIm + oIm * tRe);
         // out16[22] = eRe - (oRe * tRe - oIm * tIm);
         // out16[23] = eIm - (oRe * tIm + oIm * tRe);

         let res6  = x3re + (x3re *  t3re + x3im * -t1re);
         let res7  = x3im + (x3re * -t1re - x3im *  t3re);
         let res22 = x3re - (x3re *  t3re + x3im * -t1re);
         let res23 = x3im - (x3re * -t1re - x3im *  t3re);
         out16[6]  =  res6;
         out16[7]  =  res7;
         out16[22] =  res22;
         out16[23] =  res23;

         out16[10] =  res22;
         out16[11] = -res23;
         out16[26] =  res6;
         out16[27] = -res7;


         // float eRe  = out16[8];
         // float eIm  = out16[9];
         // float oRe  = out16[24];
         // float oIm  = out16[25];

         // float tRe = FFT_FAC_16[8];
         // float tIm = FFT_FAC_16[9];
        
         // out16[8]  = eRe + (oRe * tRe - oIm * tIm);
         // out16[9]  = eIm + (oRe * tIm + oIm * tRe);
         // out16[24] = eRe - (oRe * tRe - oIm * tIm);
         // out16[25] = eIm - (oRe * tIm + oIm * tRe);

         let res8  = x4re + x4re *  t2re;
         let res9  = x4im + x4re * -t2re;
         out16[8]  =   res8; //
         out16[9]  =   res9; //
         out16[24] =  -res9;
         out16[25] =   res8;
    }



    return out16;
} 

export {fftReal16}; 

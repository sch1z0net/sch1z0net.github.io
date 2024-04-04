let FFT_FAC_4 = new Float32Array([
1.0000000000000000,-0.0000000000000000,-0.0000000437113883,-1.0000000000000000
]);
let FFT_FAC_8 = new Float32Array([
1.0000000000000000,-0.0000000000000000,0.7071067690849304,-0.7071067690849304,-0.0000000437113883,-1.0000000000000000,-0.7071067690849304,-0.7071067690849304
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

            /*out16[0]  = xA0re + xA4re;
            out16[1]  = 0;
            out16[8]  = xA0re - xA4re;
            out16[9]  = 0;*/

            let tA1re  = FFT_FAC_8[2];
            let resA2   = xA1re + (xA5re *  tA1re - xA5im * -tA1re);
            let resA3   = xA1im + (xA5re * -tA1re + xA5im *  tA1re); 
            let resA10  = xA1re - (xA5re *  tA1re - xA5im * -tA1re);
            let resA11  = xA1im - (xA5re * -tA1re + xA5im *  tA1re);
            
            /*out16[2]   = resA2;
            out16[3]   = resA3;
            out16[10]  = resA10;
            out16[11]  = resA11;

            out16[6]   =  resA10;
            out16[7]   = -resA11;
            out16[14]  =  resA2;
            out16[15]  = -resA3;

         let res4  =  x2re;
         let res5  = -x6re;
         let res20 =  x2re;
         let res21 =  x6re;
         out16[4]  =  res4;
         out16[5]  =  res5;*/


/*
            let resA2   = xA2re + (xA6re *  tA2re - xA6im *  im);
            let resA3   = xA2im + (xA6re *  im + xA6im *  tA2re); 
            out16[12] =  xA2re;
            out16[13] = -xA6re;
*/

/*
            out16[16]  = out16[16] + out16[24];
            out16[17]  = 0;*/




         let x0re = xA0re + xA4re; let x0im = 0;

         let x1re = resA2;         let x1im =  resA3;
         let x2re = xA2re;         let x2im = -xA6re;
         let x3re = resA10;        let x3im = -resA11;

         let x4re = xA0re - xA4re; let x4im = 0;
         
         //let x5re = out16[10]; let x5im = out16[11];
         let x6re = xA2re;     let x6im = -xA6re;
         //let x7re = out16[14]; let x7im = out16[15];

         let x8re = out16[16] + out16[24]; let x8im = 0; //Nyquist
         //let x9re  = x7re;
         //let x10re = x6re; 

         let t1re  = FFT_FAC_16[2];
         let t2re  = FFT_FAC_16[4];
         let t3re  = FFT_FAC_16[6];


         out16[0]  = x0re + x8re;
         out16[1]  = x0im + x8im;
         out16[16] = x0re - x8re;
         out16[17] = x0im - x8im;


         let res2  =  x1re + (x1re *  t1re  + x1im * -t3re);
         let res3  =  x1im + (x1re * -t3re  - x1im *  t1re); 
         let res18 =  x1re - (x1re *  t1re  + x1im * -t3re);
         let res19 =  x1im - (x1re * -t3re  - x1im *  t1re);
         out16[2]  =  res2;
         out16[3]  =  res3;
         out16[18] =  res18;
         out16[19] =  res19;

         out16[14] =  res18;
         out16[15] = -res19;
         out16[30] =  res2;
         out16[31] = -res3;


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

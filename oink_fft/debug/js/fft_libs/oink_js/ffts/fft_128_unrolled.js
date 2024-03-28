let FFT_FAC_128 = new Float32Array([
1.0000000000000000,0.0000000000000000,0.9987954497337341,0.0490676760673523,0.9951847195625305,0.0980171412229538,0.9891765117645264,0.1467304676771164,
0.9807852506637573,0.1950903236865997,0.9700312614440918,0.2429801821708679,0.9569403529167175,0.2902846634387970,0.9415440559387207,0.3368898332118988,
0.9238795042037964,0.3826834559440613,0.9039893150329590,0.4275550842285156,0.8819212913513184,0.4713967144489288,0.8577286005020142,0.5141027569770813,
0.8314695954322815,0.5555702447891235,0.8032075166702271,0.5956993103027344,0.7730104923248291,0.6343932747840881,0.7409511208534241,0.6715589761734009,
0.7071067690849304,0.7071067690849304,0.6715589761734009,0.7409511208534241,0.6343932747840881,0.7730104327201843,0.5956993103027344,0.8032075166702271,
0.5555702447891235,0.8314695954322815,0.5141028165817261,0.8577286005020142,0.4713967740535736,0.8819212317466736,0.4275551140308380,0.9039893150329590,
0.3826834261417389,0.9238795042037964,0.3368898332118988,0.9415440559387207,0.2902846336364746,0.9569403529167175,0.2429802417755127,0.9700312614440918,
0.1950903534889221,0.9807852506637573,0.1467304974794388,0.9891765117645264,0.0980171337723732,0.9951847195625305,0.0490676499903202,0.9987954497337341,
-0.0000000437113883,1.0000000000000000,-0.0490676201879978,0.9987954497337341,-0.0980171039700508,0.9951847195625305,-0.1467304527759552,0.9891765117645264,
-0.1950903236865997,0.9807852506637573,-0.2429801970720291,0.9700312614440918,-0.2902847230434418,0.9569402933120728,-0.3368898034095764,0.9415440559387207,
-0.3826833963394165,0.9238795638084412,-0.4275550842285156,0.9039893150329590,-0.4713966250419617,0.8819212913513184,-0.5141027569770813,0.8577286005020142,
-0.5555701851844788,0.8314696550369263,-0.5956993699073792,0.8032075166702271,-0.6343932747840881,0.7730104923248291,-0.6715590357780457,0.7409510612487793,
-0.7071067690849304,0.7071067690849304,-0.7409510612487793,0.6715590357780457,-0.7730104923248291,0.6343932747840881,-0.8032075166702271,0.5956993699073792,
-0.8314696550369263,0.5555701851844788,-0.8577286005020142,0.5141027569770813,-0.8819212317466736,0.4713968336582184,-0.9039893150329590,0.4275550544261932,
-0.9238795042037964,0.3826834857463837,-0.9415441155433655,0.3368898034095764,-0.9569403529167175,0.2902847230434418,-0.9700312614440918,0.2429800778627396,
-0.9807853102684021,0.1950903087854385,-0.9891765117645264,0.1467305719852448,-0.9951847195625305,0.0980170965194702,-0.9987954497337341,0.0490677244961262
]);


let iBR128 = new Float32Array(128);
let iP128  = new Float32Array(128);
let _iP128 = new Float32Array(128);
let out128 = new Float32Array(256);

function fftReal128(realInput) { 
    let size = realInput.length;
    if (size != 128) {
        for (let i = 0; i < 128; i++) {
            iP128[i] = (i < size) ? realInput[i] : 0.0;
        }
        _iP128 = iP128;
    } else {
        _iP128 = realInput;
    }


    //Bit Reversal
    {
        iBR128[0]=_iP128[0]; 
        iBR128[1]=_iP128[64]; 
        iBR128[2]=_iP128[32]; 
        iBR128[3]=_iP128[96]; 
        iBR128[4]=_iP128[16]; 
        iBR128[5]=_iP128[80]; 
        iBR128[6]=_iP128[48]; 
        iBR128[7]=_iP128[112]; 
        iBR128[8]=_iP128[8]; 
        iBR128[9]=_iP128[72]; 
        iBR128[10]=_iP128[40]; 
        iBR128[11]=_iP128[104]; 
        iBR128[12]=_iP128[24]; 
        iBR128[13]=_iP128[88]; 
        iBR128[14]=_iP128[56]; 
        iBR128[15]=_iP128[120]; 
        iBR128[16]=_iP128[4]; 
        iBR128[17]=_iP128[68]; 
        iBR128[18]=_iP128[36]; 
        iBR128[19]=_iP128[100]; 
        iBR128[20]=_iP128[20]; 
        iBR128[21]=_iP128[84]; 
        iBR128[22]=_iP128[52]; 
        iBR128[23]=_iP128[116]; 
        iBR128[24]=_iP128[12]; 
        iBR128[25]=_iP128[76]; 
        iBR128[26]=_iP128[44]; 
        iBR128[27]=_iP128[108]; 
        iBR128[28]=_iP128[28]; 
        iBR128[29]=_iP128[92]; 
        iBR128[30]=_iP128[60]; 
        iBR128[31]=_iP128[124]; 
        iBR128[32]=_iP128[2]; 
        iBR128[33]=_iP128[66]; 
        iBR128[34]=_iP128[34]; 
        iBR128[35]=_iP128[98]; 
        iBR128[36]=_iP128[18]; 
        iBR128[37]=_iP128[82]; 
        iBR128[38]=_iP128[50]; 
        iBR128[39]=_iP128[114]; 
        iBR128[40]=_iP128[10]; 
        iBR128[41]=_iP128[74]; 
        iBR128[42]=_iP128[42]; 
        iBR128[43]=_iP128[106]; 
        iBR128[44]=_iP128[26]; 
        iBR128[45]=_iP128[90]; 
        iBR128[46]=_iP128[58]; 
        iBR128[47]=_iP128[122]; 
        iBR128[48]=_iP128[6]; 
        iBR128[49]=_iP128[70]; 
        iBR128[50]=_iP128[38]; 
        iBR128[51]=_iP128[102]; 
        iBR128[52]=_iP128[22]; 
        iBR128[53]=_iP128[86]; 
        iBR128[54]=_iP128[54]; 
        iBR128[55]=_iP128[118]; 
        iBR128[56]=_iP128[14]; 
        iBR128[57]=_iP128[78]; 
        iBR128[58]=_iP128[46]; 
        iBR128[59]=_iP128[110]; 
        iBR128[60]=_iP128[30]; 
        iBR128[61]=_iP128[94]; 
        iBR128[62]=_iP128[62]; 
        iBR128[63]=_iP128[126]; 
        iBR128[64]=_iP128[1]; 
        iBR128[65]=_iP128[65]; 
        iBR128[66]=_iP128[33]; 
        iBR128[67]=_iP128[97]; 
        iBR128[68]=_iP128[17]; 
        iBR128[69]=_iP128[81]; 
        iBR128[70]=_iP128[49]; 
        iBR128[71]=_iP128[113]; 
        iBR128[72]=_iP128[9]; 
        iBR128[73]=_iP128[73]; 
        iBR128[74]=_iP128[41]; 
        iBR128[75]=_iP128[105]; 
        iBR128[76]=_iP128[25]; 
        iBR128[77]=_iP128[89]; 
        iBR128[78]=_iP128[57]; 
        iBR128[79]=_iP128[121]; 
        iBR128[80]=_iP128[5]; 
        iBR128[81]=_iP128[69]; 
        iBR128[82]=_iP128[37]; 
        iBR128[83]=_iP128[101]; 
        iBR128[84]=_iP128[21]; 
        iBR128[85]=_iP128[85]; 
        iBR128[86]=_iP128[53]; 
        iBR128[87]=_iP128[117]; 
        iBR128[88]=_iP128[13]; 
        iBR128[89]=_iP128[77]; 
        iBR128[90]=_iP128[45]; 
        iBR128[91]=_iP128[109]; 
        iBR128[92]=_iP128[29]; 
        iBR128[93]=_iP128[93]; 
        iBR128[94]=_iP128[61]; 
        iBR128[95]=_iP128[125]; 
        iBR128[96]=_iP128[3]; 
        iBR128[97]=_iP128[67]; 
        iBR128[98]=_iP128[35]; 
        iBR128[99]=_iP128[99]; 
        iBR128[100]=_iP128[19]; 
        iBR128[101]=_iP128[83]; 
        iBR128[102]=_iP128[51]; 
        iBR128[103]=_iP128[115]; 
        iBR128[104]=_iP128[11]; 
        iBR128[105]=_iP128[75]; 
        iBR128[106]=_iP128[43]; 
        iBR128[107]=_iP128[107]; 
        iBR128[108]=_iP128[27]; 
        iBR128[109]=_iP128[91]; 
        iBR128[110]=_iP128[59]; 
        iBR128[111]=_iP128[123]; 
        iBR128[112]=_iP128[7]; 
        iBR128[113]=_iP128[71]; 
        iBR128[114]=_iP128[39]; 
        iBR128[115]=_iP128[103]; 
        iBR128[116]=_iP128[23]; 
        iBR128[117]=_iP128[87]; 
        iBR128[118]=_iP128[55]; 
        iBR128[119]=_iP128[119]; 
        iBR128[120]=_iP128[15]; 
        iBR128[121]=_iP128[79]; 
        iBR128[122]=_iP128[47]; 
        iBR128[123]=_iP128[111]; 
        iBR128[124]=_iP128[31]; 
        iBR128[125]=_iP128[95]; 
        iBR128[126]=_iP128[63]; 
        iBR128[127]=_iP128[127]; 
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 4 - FFT step for SIZE 4/8 
    ////////////////////////////////////////////////

    for (let idx = 0, out_idx = 0; idx < 128; idx += 4, out_idx += 8) {
        let x0aRe = iBR128[idx    ];
        let x1aRe = iBR128[idx + 1];
        let x2aRe = iBR128[idx + 2];
        let x3aRe = iBR128[idx + 3];

        let sum1  = x0aRe + x1aRe;
        let sum2  = x2aRe + x3aRe;
        let diff1 = x0aRe - x1aRe;
        let diff2 = x2aRe - x3aRe;

        out128[out_idx]     = sum1 + sum2;
        out128[out_idx + 1] = 0.0;
        out128[out_idx + 2] = diff1;
        out128[out_idx + 3] = diff2;
        out128[out_idx + 4] = sum1 - sum2;
        out128[out_idx + 5] = 0.0;
        out128[out_idx + 6] = diff1;
        out128[out_idx + 7] = -diff2;
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 4 - FFT step for SIZE 16/32 
    ////////////////////////////////////////////////

    for (let idx = 0; idx < 256; idx += 32) {
        let x0aRe = out128[idx     ];
        let x0bRe = out128[idx +  2];
        let x0bIm = out128[idx +  3];
        let x0cRe = out128[idx +  4];

        let x1aRe = out128[idx +  8];
        out128[idx +   8] = x0aRe - x1aRe;
        let x1bRe = out128[idx + 10];
        let x1bIm = out128[idx + 11];
        let x1cRe = out128[idx + 12];

        let x2aRe = out128[idx + 16];
        let x2bRe = out128[idx + 18];
        let x2bIm = out128[idx + 19];
        let x2cRe = out128[idx + 20];

        let x3aRe = out128[idx + 24];
        out128[idx +  24] = x0aRe - x1aRe;
        out128[idx +  25] = x3aRe - x2aRe;
        let x3bRe = out128[idx + 26];
        let x3bIm = out128[idx + 27];
        let x3cRe = out128[idx + 28];
        out128[idx      ] = x0aRe + x1aRe + x2aRe + x3aRe;
        out128[idx +   9] = x2aRe - x3aRe;
        out128[idx +  16] = x0aRe + x1aRe - x2aRe - x3aRe;

        let t1Re_2c = 0.7071067690849304;

        let x2cRe_tRe_2c = x2cRe * t1Re_2c;
        let x3cRe_tRe_2c = x3cRe * t1Re_2c;

        let resReC1 = x0cRe + x2cRe_tRe_2c - x3cRe_tRe_2c;
        out128[idx +  28] =   resReC1;
        out128[idx +   4] =   resReC1;
        let resImC1 = x1cRe + x2cRe_tRe_2c + x3cRe_tRe_2c;
        out128[idx +   5] =   resImC1;
        out128[idx +  29] = - resImC1;
        let resReC2 = x0cRe - x2cRe_tRe_2c + x3cRe_tRe_2c;
        out128[idx +  20] =   resReC2;
        out128[idx +  12] =   resReC2;
        let resImC2 = x1cRe - x2cRe_tRe_2c - x3cRe_tRe_2c;
        out128[idx +  13] = - resImC2;
        out128[idx +  21] =   resImC2;

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
        out128[idx +   2] =   resReB1;
        out128[idx +  30] =   resReB1;
        let resReB2 = x0bRe  + x1dif_tRe_1b - tempReB;
        out128[idx +  18] =   resReB2;
        out128[idx +  14] =   resReB2;
        let resReD1 = x0bRe  - x1dif_tRe_1b - tempReD;
        out128[idx +   6] =   resReD1;
        out128[idx +  26] =   resReD1;
        let resReD2 = x0bRe  - x1dif_tRe_1b + tempReD;
        out128[idx +  22] =   resReD2;
        out128[idx +  10] =   resReD2;

        let resImB1 = x0bIm  + x1sum_tRe_1b + tempImB;
        out128[idx +   3] =   resImB1;
        out128[idx +  31] = - resImB1;
        let resImB2 = x0bIm  + x1sum_tRe_1b - tempImB;
        out128[idx +  19] =   resImB2;
        out128[idx +  15] = - resImB2;
        let resImD1 =-x0bIm  + x1sum_tRe_1b - tempImD;
        out128[idx +   7] =   resImD1;
        out128[idx +  27] = - resImD1;
        let resImD2 =-x0bIm  + x1sum_tRe_1b + tempImD;
        out128[idx +  23] =   resImD2;
        out128[idx +  11] = - resImD2;
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 2 (semi unrolled) - FFT step for SIZE 64 
    ////////////////////////////////////////////////
    for(let idx = 0; idx < 128; idx += 64){ 
        let oRe0 = out128[idx + 64];
        let oIm0 = out128[idx + 65];
        let eRe0 = out128[idx + 0];
        let eIm0 = out128[idx + 1];
        let resRe0_s = eRe0 + oRe0;
        out128[idx] = resRe0_s;
        let resIm0_s = eIm0 + oIm0;
        out128[idx + 1] = resRe0_s;
        let resRe0_d = eRe0 - oRe0;
        out128[idx + 64] = resRe0_d;
        let resIm0_d = eIm0 - oIm0;
        out128[idx + 65] = resIm0_d;
        
        let oRe1 = out128[idx + 66];
        let oIm1 = out128[idx + 67];
        let eRe1 = out128[idx + 2];
        let eIm1 = out128[idx + 3];
        let tRe1 = FFT_FAC_128[idx + 1];
        let tRe15 = FFT_FAC_128[idx + 15];
        let resIm1_s = eIm1 + (oRe1 * tRe15 + oIm1 * tRe1);
        out128[idx + 3] = resIm1_s;
        out128[idx + 127] = -resIm1_s;
        let resRe1_s = eRe1 + (oRe1 * tRe1 - oIm1 * tRe15);
        out128[idx + 126] = resRe1_s;
        out128[idx + 2] = resRe1_s;
        let resRe31_s = eRe1 - (oRe1 * tRe1 - oIm1 * tRe15);
        out128[idx + 66] = resRe31_s;
        out128[idx + 62] = resRe31_s;
        let resIm31_s = -eIm1 + (oRe1 * tRe15 + oIm1 * tRe1);
        out128[idx + 63] = resIm31_s;
        out128[idx + 67] = -resIm31_s;
        
        let oRe2 = out128[idx + 68];
        let oIm2 = out128[idx + 69];
        let eRe2 = out128[idx + 4];
        let eIm2 = out128[idx + 5];
        let tRe2 = FFT_FAC_128[idx + 2];
        let tRe14 = FFT_FAC_128[idx + 14];
        let resIm2_s = eIm2 + (oRe2 * tRe14 + oIm2 * tRe2);
        out128[idx + 5] = resIm2_s;
        out128[idx + 125] = -resIm2_s;
        let resRe2_s = eRe2 + (oRe2 * tRe2 - oIm2 * tRe14);
        out128[idx + 124] = resRe2_s;
        out128[idx + 4] = resRe2_s;
        let resRe30_s = eRe2 - (oRe2 * tRe2 - oIm2 * tRe14);
        out128[idx + 68] = resRe30_s;
        out128[idx + 60] = resRe30_s;
        let resIm30_s = -eIm2 + (oRe2 * tRe14 + oIm2 * tRe2);
        out128[idx + 61] = resIm30_s;
        out128[idx + 69] = -resIm30_s;
        
        let oRe3 = out128[idx + 70];
        let oIm3 = out128[idx + 71];
        let eRe3 = out128[idx + 6];
        let eIm3 = out128[idx + 7];
        let tRe3 = FFT_FAC_128[idx + 3];
        let tRe13 = FFT_FAC_128[idx + 13];
        let resIm3_s = eIm3 + (oRe3 * tRe13 + oIm3 * tRe3);
        out128[idx + 7] = resIm3_s;
        out128[idx + 123] = -resIm3_s;
        let resRe3_s = eRe3 + (oRe3 * tRe3 - oIm3 * tRe13);
        out128[idx + 122] = resRe3_s;
        out128[idx + 6] = resRe3_s;
        let resRe29_s = eRe3 - (oRe3 * tRe3 - oIm3 * tRe13);
        out128[idx + 70] = resRe29_s;
        out128[idx + 58] = resRe29_s;
        let resIm29_s = -eIm3 + (oRe3 * tRe13 + oIm3 * tRe3);
        out128[idx + 59] = resIm29_s;
        out128[idx + 71] = -resIm29_s;
        
        let oRe4 = out128[idx + 72];
        let oIm4 = out128[idx + 73];
        let eRe4 = out128[idx + 8];
        let eIm4 = out128[idx + 9];
        let tRe4 = FFT_FAC_128[idx + 4];
        let tRe12 = FFT_FAC_128[idx + 12];
        let resIm4_s = eIm4 + (oRe4 * tRe12 + oIm4 * tRe4);
        out128[idx + 9] = resIm4_s;
        out128[idx + 121] = -resIm4_s;
        let resRe4_s = eRe4 + (oRe4 * tRe4 - oIm4 * tRe12);
        out128[idx + 120] = resRe4_s;
        out128[idx + 8] = resRe4_s;
        let resRe28_s = eRe4 - (oRe4 * tRe4 - oIm4 * tRe12);
        out128[idx + 72] = resRe28_s;
        out128[idx + 56] = resRe28_s;
        let resIm28_s = -eIm4 + (oRe4 * tRe12 + oIm4 * tRe4);
        out128[idx + 57] = resIm28_s;
        out128[idx + 73] = -resIm28_s;
        
        let oRe5 = out128[idx + 74];
        let oIm5 = out128[idx + 75];
        let eRe5 = out128[idx + 10];
        let eIm5 = out128[idx + 11];
        let tRe5 = FFT_FAC_128[idx + 5];
        let tRe11 = FFT_FAC_128[idx + 11];
        let resIm5_s = eIm5 + (oRe5 * tRe11 + oIm5 * tRe5);
        out128[idx + 11] = resIm5_s;
        out128[idx + 119] = -resIm5_s;
        let resRe5_s = eRe5 + (oRe5 * tRe5 - oIm5 * tRe11);
        out128[idx + 118] = resRe5_s;
        out128[idx + 10] = resRe5_s;
        let resRe27_s = eRe5 - (oRe5 * tRe5 - oIm5 * tRe11);
        out128[idx + 74] = resRe27_s;
        out128[idx + 54] = resRe27_s;
        let resIm27_s = -eIm5 + (oRe5 * tRe11 + oIm5 * tRe5);
        out128[idx + 55] = resIm27_s;
        out128[idx + 75] = -resIm27_s;
        
        let oRe6 = out128[idx + 76];
        let oIm6 = out128[idx + 77];
        let eRe6 = out128[idx + 12];
        let eIm6 = out128[idx + 13];
        let tRe6 = FFT_FAC_128[idx + 6];
        let tRe10 = FFT_FAC_128[idx + 10];
        let resIm6_s = eIm6 + (oRe6 * tRe10 + oIm6 * tRe6);
        out128[idx + 13] = resIm6_s;
        out128[idx + 117] = -resIm6_s;
        let resRe6_s = eRe6 + (oRe6 * tRe6 - oIm6 * tRe10);
        out128[idx + 116] = resRe6_s;
        out128[idx + 12] = resRe6_s;
        let resRe26_s = eRe6 - (oRe6 * tRe6 - oIm6 * tRe10);
        out128[idx + 76] = resRe26_s;
        out128[idx + 52] = resRe26_s;
        let resIm26_s = -eIm6 + (oRe6 * tRe10 + oIm6 * tRe6);
        out128[idx + 53] = resIm26_s;
        out128[idx + 77] = -resIm26_s;
        
        let oRe7 = out128[idx + 78];
        let oIm7 = out128[idx + 79];
        let eRe7 = out128[idx + 14];
        let eIm7 = out128[idx + 15];
        let tRe7 = FFT_FAC_128[idx + 7];
        let tRe9 = FFT_FAC_128[idx + 9];
        let resIm7_s = eIm7 + (oRe7 * tRe9 + oIm7 * tRe7);
        out128[idx + 15] = resIm7_s;
        out128[idx + 115] = -resIm7_s;
        let resRe7_s = eRe7 + (oRe7 * tRe7 - oIm7 * tRe9);
        out128[idx + 114] = resRe7_s;
        out128[idx + 14] = resRe7_s;
        let resRe25_s = eRe7 - (oRe7 * tRe7 - oIm7 * tRe9);
        out128[idx + 78] = resRe25_s;
        out128[idx + 50] = resRe25_s;
        let resIm25_s = -eIm7 + (oRe7 * tRe9 + oIm7 * tRe7);
        out128[idx + 51] = resIm25_s;
        out128[idx + 79] = -resIm25_s;
        
        let oRe8 = out128[idx + 80];
        let oIm8 = out128[idx + 81];
        let eRe8 = out128[idx + 16];
        let eIm8 = out128[idx + 17];
        let tRe8 = FFT_FAC_128[idx + 8];
        let resIm8_s = eIm8 + (oRe8 * tRe8 + oIm8 * tRe8);
        out128[idx + 17] = resIm8_s;
        out128[idx + 113] = -resIm8_s;
        let resRe8_s = eRe8 + (oRe8 * tRe8 - oIm8 * tRe8);
        out128[idx + 112] = resRe8_s;
        out128[idx + 16] = resRe8_s;
        let resRe24_s = eRe8 - (oRe8 * tRe8 - oIm8 * tRe8);
        out128[idx + 80] = resRe24_s;
        out128[idx + 48] = resRe24_s;
        let resIm24_s = -eIm8 + (oRe8 * tRe8 + oIm8 * tRe8);
        out128[idx + 49] = resIm24_s;
        out128[idx + 81] = -resIm24_s;
        
        let oRe9 = out128[idx + 82];
        let oIm9 = out128[idx + 83];
        let eRe9 = out128[idx + 18];
        let eIm9 = out128[idx + 19];
        let resIm9_s = eIm9 + (oRe9 * tRe7 + oIm9 * tRe9);
        out128[idx + 19] = resIm9_s;
        out128[idx + 111] = -resIm9_s;
        let resRe9_s = eRe9 + (oRe9 * tRe9 - oIm9 * tRe7);
        out128[idx + 110] = resRe9_s;
        out128[idx + 18] = resRe9_s;
        let resRe23_s = eRe9 - (oRe9 * tRe9 - oIm9 * tRe7);
        out128[idx + 82] = resRe23_s;
        out128[idx + 46] = resRe23_s;
        let resIm23_s = -eIm9 + (oRe9 * tRe7 + oIm9 * tRe9);
        out128[idx + 47] = resIm23_s;
        out128[idx + 83] = -resIm23_s;
        
        let oRe10 = out128[idx + 84];
        let oIm10 = out128[idx + 85];
        let eRe10 = out128[idx + 20];
        let eIm10 = out128[idx + 21];
        let resIm10_s = eIm10 + (oRe10 * tRe6 + oIm10 * tRe10);
        out128[idx + 21] = resIm10_s;
        out128[idx + 109] = -resIm10_s;
        let resRe10_s = eRe10 + (oRe10 * tRe10 - oIm10 * tRe6);
        out128[idx + 108] = resRe10_s;
        out128[idx + 20] = resRe10_s;
        let resRe22_s = eRe10 - (oRe10 * tRe10 - oIm10 * tRe6);
        out128[idx + 84] = resRe22_s;
        out128[idx + 44] = resRe22_s;
        let resIm22_s = -eIm10 + (oRe10 * tRe6 + oIm10 * tRe10);
        out128[idx + 45] = resIm22_s;
        out128[idx + 85] = -resIm22_s;
        
        let oRe11 = out128[idx + 86];
        let oIm11 = out128[idx + 87];
        let eRe11 = out128[idx + 22];
        let eIm11 = out128[idx + 23];
        let resIm11_s = eIm11 + (oRe11 * tRe5 + oIm11 * tRe11);
        out128[idx + 23] = resIm11_s;
        out128[idx + 107] = -resIm11_s;
        let resRe11_s = eRe11 + (oRe11 * tRe11 - oIm11 * tRe5);
        out128[idx + 106] = resRe11_s;
        out128[idx + 22] = resRe11_s;
        let resRe21_s = eRe11 - (oRe11 * tRe11 - oIm11 * tRe5);
        out128[idx + 86] = resRe21_s;
        out128[idx + 42] = resRe21_s;
        let resIm21_s = -eIm11 + (oRe11 * tRe5 + oIm11 * tRe11);
        out128[idx + 43] = resIm21_s;
        out128[idx + 87] = -resIm21_s;
        
        let oRe12 = out128[idx + 88];
        let oIm12 = out128[idx + 89];
        let eRe12 = out128[idx + 24];
        let eIm12 = out128[idx + 25];
        let resIm12_s = eIm12 + (oRe12 * tRe4 + oIm12 * tRe12);
        out128[idx + 25] = resIm12_s;
        out128[idx + 105] = -resIm12_s;
        let resRe12_s = eRe12 + (oRe12 * tRe12 - oIm12 * tRe4);
        out128[idx + 104] = resRe12_s;
        out128[idx + 24] = resRe12_s;
        let resRe20_s = eRe12 - (oRe12 * tRe12 - oIm12 * tRe4);
        out128[idx + 88] = resRe20_s;
        out128[idx + 40] = resRe20_s;
        let resIm20_s = -eIm12 + (oRe12 * tRe4 + oIm12 * tRe12);
        out128[idx + 41] = resIm20_s;
        out128[idx + 89] = -resIm20_s;
        
        let oRe13 = out128[idx + 90];
        let oIm13 = out128[idx + 91];
        let eRe13 = out128[idx + 26];
        let eIm13 = out128[idx + 27];
        let resIm13_s = eIm13 + (oRe13 * tRe3 + oIm13 * tRe13);
        out128[idx + 27] = resIm13_s;
        out128[idx + 103] = -resIm13_s;
        let resRe13_s = eRe13 + (oRe13 * tRe13 - oIm13 * tRe3);
        out128[idx + 102] = resRe13_s;
        out128[idx + 26] = resRe13_s;
        let resRe19_s = eRe13 - (oRe13 * tRe13 - oIm13 * tRe3);
        out128[idx + 90] = resRe19_s;
        out128[idx + 38] = resRe19_s;
        let resIm19_s = -eIm13 + (oRe13 * tRe3 + oIm13 * tRe13);
        out128[idx + 39] = resIm19_s;
        out128[idx + 91] = -resIm19_s;
        
        let oRe14 = out128[idx + 92];
        let oIm14 = out128[idx + 93];
        let eRe14 = out128[idx + 28];
        let eIm14 = out128[idx + 29];
        let resIm14_s = eIm14 + (oRe14 * tRe2 + oIm14 * tRe14);
        out128[idx + 29] = resIm14_s;
        out128[idx + 101] = -resIm14_s;
        let resRe14_s = eRe14 + (oRe14 * tRe14 - oIm14 * tRe2);
        out128[idx + 100] = resRe14_s;
        out128[idx + 28] = resRe14_s;
        let resRe18_s = eRe14 - (oRe14 * tRe14 - oIm14 * tRe2);
        out128[idx + 92] = resRe18_s;
        out128[idx + 36] = resRe18_s;
        let resIm18_s = -eIm14 + (oRe14 * tRe2 + oIm14 * tRe14);
        out128[idx + 37] = resIm18_s;
        out128[idx + 93] = -resIm18_s;
        
        let oRe15 = out128[idx + 94];
        let oIm15 = out128[idx + 95];
        let eRe15 = out128[idx + 30];
        let eIm15 = out128[idx + 31];
        let resIm15_s = eIm15 + (oRe15 * tRe1 + oIm15 * tRe15);
        out128[idx + 31] = resIm15_s;
        out128[idx + 99] = -resIm15_s;
        let resRe15_s = eRe15 + (oRe15 * tRe15 - oIm15 * tRe1);
        out128[idx + 98] = resRe15_s;
        out128[idx + 30] = resRe15_s;
        let resRe17_s = eRe15 - (oRe15 * tRe15 - oIm15 * tRe1);
        out128[idx + 94] = resRe17_s;
        out128[idx + 34] = resRe17_s;
        let resIm17_s = -eIm15 + (oRe15 * tRe1 + oIm15 * tRe15);
        out128[idx + 35] = resIm17_s;
        out128[idx + 95] = -resIm17_s;
        
        let oRe16 = out128[idx + 96];
        let oIm16 = out128[idx + 97];
        let eRe16 = out128[idx + 32];
        let eIm16 = out128[idx + 33];
        let resIm16_s = eIm16 + oRe16;
        out128[idx + 33] = resIm16_s;
        out128[idx + 97] = -resIm16_s;
        let resRe16_s = eRe16 - oIm16;
        out128[idx + 96] = resRe16_s;
        out128[idx + 32] = resRe16_s;
        
    } 
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 2 (semi unrolled) - FFT step for SIZE 128 
    ////////////////////////////////////////////////
    for(let idx = 0; idx < 128; idx += 128){ 
        let oRe0 = out128[idx + 128];
        let oIm0 = out128[idx + 129];
        let eRe0 = out128[idx + 0];
        let eIm0 = out128[idx + 1];
        let resRe0_s = eRe0 + oRe0;
        out128[idx] = resRe0_s;
        let resIm0_s = eIm0 + oIm0;
        out128[idx + 1] = resRe0_s;
        let resRe0_d = eRe0 - oRe0;
        out128[idx + 128] = resRe0_d;
        let resIm0_d = eIm0 - oIm0;
        out128[idx + 129] = resIm0_d;
        
        let oRe1 = out128[idx + 130];
        let oIm1 = out128[idx + 131];
        let eRe1 = out128[idx + 2];
        let eIm1 = out128[idx + 3];
        let tRe1 = FFT_FAC_128[idx + 1];
        let tRe31 = FFT_FAC_128[idx + 31];
        let resIm1_s = eIm1 + (oRe1 * tRe31 + oIm1 * tRe1);
        out128[idx + 3] = resIm1_s;
        out128[idx + 255] = -resIm1_s;
        let resRe1_s = eRe1 + (oRe1 * tRe1 - oIm1 * tRe31);
        out128[idx + 254] = resRe1_s;
        out128[idx + 2] = resRe1_s;
        let resRe63_s = eRe1 - (oRe1 * tRe1 - oIm1 * tRe31);
        out128[idx + 130] = resRe63_s;
        out128[idx + 126] = resRe63_s;
        let resIm63_s = -eIm1 + (oRe1 * tRe31 + oIm1 * tRe1);
        out128[idx + 127] = resIm63_s;
        out128[idx + 131] = -resIm63_s;
        
        let oRe2 = out128[idx + 132];
        let oIm2 = out128[idx + 133];
        let eRe2 = out128[idx + 4];
        let eIm2 = out128[idx + 5];
        let tRe2 = FFT_FAC_128[idx + 2];
        let tRe30 = FFT_FAC_128[idx + 30];
        let resIm2_s = eIm2 + (oRe2 * tRe30 + oIm2 * tRe2);
        out128[idx + 5] = resIm2_s;
        out128[idx + 253] = -resIm2_s;
        let resRe2_s = eRe2 + (oRe2 * tRe2 - oIm2 * tRe30);
        out128[idx + 252] = resRe2_s;
        out128[idx + 4] = resRe2_s;
        let resRe62_s = eRe2 - (oRe2 * tRe2 - oIm2 * tRe30);
        out128[idx + 132] = resRe62_s;
        out128[idx + 124] = resRe62_s;
        let resIm62_s = -eIm2 + (oRe2 * tRe30 + oIm2 * tRe2);
        out128[idx + 125] = resIm62_s;
        out128[idx + 133] = -resIm62_s;
        
        let oRe3 = out128[idx + 134];
        let oIm3 = out128[idx + 135];
        let eRe3 = out128[idx + 6];
        let eIm3 = out128[idx + 7];
        let tRe3 = FFT_FAC_128[idx + 3];
        let tRe29 = FFT_FAC_128[idx + 29];
        let resIm3_s = eIm3 + (oRe3 * tRe29 + oIm3 * tRe3);
        out128[idx + 7] = resIm3_s;
        out128[idx + 251] = -resIm3_s;
        let resRe3_s = eRe3 + (oRe3 * tRe3 - oIm3 * tRe29);
        out128[idx + 250] = resRe3_s;
        out128[idx + 6] = resRe3_s;
        let resRe61_s = eRe3 - (oRe3 * tRe3 - oIm3 * tRe29);
        out128[idx + 134] = resRe61_s;
        out128[idx + 122] = resRe61_s;
        let resIm61_s = -eIm3 + (oRe3 * tRe29 + oIm3 * tRe3);
        out128[idx + 123] = resIm61_s;
        out128[idx + 135] = -resIm61_s;
        
        let oRe4 = out128[idx + 136];
        let oIm4 = out128[idx + 137];
        let eRe4 = out128[idx + 8];
        let eIm4 = out128[idx + 9];
        let tRe4 = FFT_FAC_128[idx + 4];
        let tRe28 = FFT_FAC_128[idx + 28];
        let resIm4_s = eIm4 + (oRe4 * tRe28 + oIm4 * tRe4);
        out128[idx + 9] = resIm4_s;
        out128[idx + 249] = -resIm4_s;
        let resRe4_s = eRe4 + (oRe4 * tRe4 - oIm4 * tRe28);
        out128[idx + 248] = resRe4_s;
        out128[idx + 8] = resRe4_s;
        let resRe60_s = eRe4 - (oRe4 * tRe4 - oIm4 * tRe28);
        out128[idx + 136] = resRe60_s;
        out128[idx + 120] = resRe60_s;
        let resIm60_s = -eIm4 + (oRe4 * tRe28 + oIm4 * tRe4);
        out128[idx + 121] = resIm60_s;
        out128[idx + 137] = -resIm60_s;
        
        let oRe5 = out128[idx + 138];
        let oIm5 = out128[idx + 139];
        let eRe5 = out128[idx + 10];
        let eIm5 = out128[idx + 11];
        let tRe5 = FFT_FAC_128[idx + 5];
        let tRe27 = FFT_FAC_128[idx + 27];
        let resIm5_s = eIm5 + (oRe5 * tRe27 + oIm5 * tRe5);
        out128[idx + 11] = resIm5_s;
        out128[idx + 247] = -resIm5_s;
        let resRe5_s = eRe5 + (oRe5 * tRe5 - oIm5 * tRe27);
        out128[idx + 246] = resRe5_s;
        out128[idx + 10] = resRe5_s;
        let resRe59_s = eRe5 - (oRe5 * tRe5 - oIm5 * tRe27);
        out128[idx + 138] = resRe59_s;
        out128[idx + 118] = resRe59_s;
        let resIm59_s = -eIm5 + (oRe5 * tRe27 + oIm5 * tRe5);
        out128[idx + 119] = resIm59_s;
        out128[idx + 139] = -resIm59_s;
        
        let oRe6 = out128[idx + 140];
        let oIm6 = out128[idx + 141];
        let eRe6 = out128[idx + 12];
        let eIm6 = out128[idx + 13];
        let tRe6 = FFT_FAC_128[idx + 6];
        let tRe26 = FFT_FAC_128[idx + 26];
        let resIm6_s = eIm6 + (oRe6 * tRe26 + oIm6 * tRe6);
        out128[idx + 13] = resIm6_s;
        out128[idx + 245] = -resIm6_s;
        let resRe6_s = eRe6 + (oRe6 * tRe6 - oIm6 * tRe26);
        out128[idx + 244] = resRe6_s;
        out128[idx + 12] = resRe6_s;
        let resRe58_s = eRe6 - (oRe6 * tRe6 - oIm6 * tRe26);
        out128[idx + 140] = resRe58_s;
        out128[idx + 116] = resRe58_s;
        let resIm58_s = -eIm6 + (oRe6 * tRe26 + oIm6 * tRe6);
        out128[idx + 117] = resIm58_s;
        out128[idx + 141] = -resIm58_s;
        
        let oRe7 = out128[idx + 142];
        let oIm7 = out128[idx + 143];
        let eRe7 = out128[idx + 14];
        let eIm7 = out128[idx + 15];
        let tRe7 = FFT_FAC_128[idx + 7];
        let tRe25 = FFT_FAC_128[idx + 25];
        let resIm7_s = eIm7 + (oRe7 * tRe25 + oIm7 * tRe7);
        out128[idx + 15] = resIm7_s;
        out128[idx + 243] = -resIm7_s;
        let resRe7_s = eRe7 + (oRe7 * tRe7 - oIm7 * tRe25);
        out128[idx + 242] = resRe7_s;
        out128[idx + 14] = resRe7_s;
        let resRe57_s = eRe7 - (oRe7 * tRe7 - oIm7 * tRe25);
        out128[idx + 142] = resRe57_s;
        out128[idx + 114] = resRe57_s;
        let resIm57_s = -eIm7 + (oRe7 * tRe25 + oIm7 * tRe7);
        out128[idx + 115] = resIm57_s;
        out128[idx + 143] = -resIm57_s;
        
        let oRe8 = out128[idx + 144];
        let oIm8 = out128[idx + 145];
        let eRe8 = out128[idx + 16];
        let eIm8 = out128[idx + 17];
        let tRe8 = FFT_FAC_128[idx + 8];
        let tRe24 = FFT_FAC_128[idx + 24];
        let resIm8_s = eIm8 + (oRe8 * tRe24 + oIm8 * tRe8);
        out128[idx + 17] = resIm8_s;
        out128[idx + 241] = -resIm8_s;
        let resRe8_s = eRe8 + (oRe8 * tRe8 - oIm8 * tRe24);
        out128[idx + 240] = resRe8_s;
        out128[idx + 16] = resRe8_s;
        let resRe56_s = eRe8 - (oRe8 * tRe8 - oIm8 * tRe24);
        out128[idx + 144] = resRe56_s;
        out128[idx + 112] = resRe56_s;
        let resIm56_s = -eIm8 + (oRe8 * tRe24 + oIm8 * tRe8);
        out128[idx + 113] = resIm56_s;
        out128[idx + 145] = -resIm56_s;
        
        let oRe9 = out128[idx + 146];
        let oIm9 = out128[idx + 147];
        let eRe9 = out128[idx + 18];
        let eIm9 = out128[idx + 19];
        let tRe9 = FFT_FAC_128[idx + 9];
        let tRe23 = FFT_FAC_128[idx + 23];
        let resIm9_s = eIm9 + (oRe9 * tRe23 + oIm9 * tRe9);
        out128[idx + 19] = resIm9_s;
        out128[idx + 239] = -resIm9_s;
        let resRe9_s = eRe9 + (oRe9 * tRe9 - oIm9 * tRe23);
        out128[idx + 238] = resRe9_s;
        out128[idx + 18] = resRe9_s;
        let resRe55_s = eRe9 - (oRe9 * tRe9 - oIm9 * tRe23);
        out128[idx + 146] = resRe55_s;
        out128[idx + 110] = resRe55_s;
        let resIm55_s = -eIm9 + (oRe9 * tRe23 + oIm9 * tRe9);
        out128[idx + 111] = resIm55_s;
        out128[idx + 147] = -resIm55_s;
        
        let oRe10 = out128[idx + 148];
        let oIm10 = out128[idx + 149];
        let eRe10 = out128[idx + 20];
        let eIm10 = out128[idx + 21];
        let tRe10 = FFT_FAC_128[idx + 10];
        let tRe22 = FFT_FAC_128[idx + 22];
        let resIm10_s = eIm10 + (oRe10 * tRe22 + oIm10 * tRe10);
        out128[idx + 21] = resIm10_s;
        out128[idx + 237] = -resIm10_s;
        let resRe10_s = eRe10 + (oRe10 * tRe10 - oIm10 * tRe22);
        out128[idx + 236] = resRe10_s;
        out128[idx + 20] = resRe10_s;
        let resRe54_s = eRe10 - (oRe10 * tRe10 - oIm10 * tRe22);
        out128[idx + 148] = resRe54_s;
        out128[idx + 108] = resRe54_s;
        let resIm54_s = -eIm10 + (oRe10 * tRe22 + oIm10 * tRe10);
        out128[idx + 109] = resIm54_s;
        out128[idx + 149] = -resIm54_s;
        
        let oRe11 = out128[idx + 150];
        let oIm11 = out128[idx + 151];
        let eRe11 = out128[idx + 22];
        let eIm11 = out128[idx + 23];
        let tRe11 = FFT_FAC_128[idx + 11];
        let tRe21 = FFT_FAC_128[idx + 21];
        let resIm11_s = eIm11 + (oRe11 * tRe21 + oIm11 * tRe11);
        out128[idx + 23] = resIm11_s;
        out128[idx + 235] = -resIm11_s;
        let resRe11_s = eRe11 + (oRe11 * tRe11 - oIm11 * tRe21);
        out128[idx + 234] = resRe11_s;
        out128[idx + 22] = resRe11_s;
        let resRe53_s = eRe11 - (oRe11 * tRe11 - oIm11 * tRe21);
        out128[idx + 150] = resRe53_s;
        out128[idx + 106] = resRe53_s;
        let resIm53_s = -eIm11 + (oRe11 * tRe21 + oIm11 * tRe11);
        out128[idx + 107] = resIm53_s;
        out128[idx + 151] = -resIm53_s;
        
        let oRe12 = out128[idx + 152];
        let oIm12 = out128[idx + 153];
        let eRe12 = out128[idx + 24];
        let eIm12 = out128[idx + 25];
        let tRe12 = FFT_FAC_128[idx + 12];
        let tRe20 = FFT_FAC_128[idx + 20];
        let resIm12_s = eIm12 + (oRe12 * tRe20 + oIm12 * tRe12);
        out128[idx + 25] = resIm12_s;
        out128[idx + 233] = -resIm12_s;
        let resRe12_s = eRe12 + (oRe12 * tRe12 - oIm12 * tRe20);
        out128[idx + 232] = resRe12_s;
        out128[idx + 24] = resRe12_s;
        let resRe52_s = eRe12 - (oRe12 * tRe12 - oIm12 * tRe20);
        out128[idx + 152] = resRe52_s;
        out128[idx + 104] = resRe52_s;
        let resIm52_s = -eIm12 + (oRe12 * tRe20 + oIm12 * tRe12);
        out128[idx + 105] = resIm52_s;
        out128[idx + 153] = -resIm52_s;
        
        let oRe13 = out128[idx + 154];
        let oIm13 = out128[idx + 155];
        let eRe13 = out128[idx + 26];
        let eIm13 = out128[idx + 27];
        let tRe13 = FFT_FAC_128[idx + 13];
        let tRe19 = FFT_FAC_128[idx + 19];
        let resIm13_s = eIm13 + (oRe13 * tRe19 + oIm13 * tRe13);
        out128[idx + 27] = resIm13_s;
        out128[idx + 231] = -resIm13_s;
        let resRe13_s = eRe13 + (oRe13 * tRe13 - oIm13 * tRe19);
        out128[idx + 230] = resRe13_s;
        out128[idx + 26] = resRe13_s;
        let resRe51_s = eRe13 - (oRe13 * tRe13 - oIm13 * tRe19);
        out128[idx + 154] = resRe51_s;
        out128[idx + 102] = resRe51_s;
        let resIm51_s = -eIm13 + (oRe13 * tRe19 + oIm13 * tRe13);
        out128[idx + 103] = resIm51_s;
        out128[idx + 155] = -resIm51_s;
        
        let oRe14 = out128[idx + 156];
        let oIm14 = out128[idx + 157];
        let eRe14 = out128[idx + 28];
        let eIm14 = out128[idx + 29];
        let tRe14 = FFT_FAC_128[idx + 14];
        let tRe18 = FFT_FAC_128[idx + 18];
        let resIm14_s = eIm14 + (oRe14 * tRe18 + oIm14 * tRe14);
        out128[idx + 29] = resIm14_s;
        out128[idx + 229] = -resIm14_s;
        let resRe14_s = eRe14 + (oRe14 * tRe14 - oIm14 * tRe18);
        out128[idx + 228] = resRe14_s;
        out128[idx + 28] = resRe14_s;
        let resRe50_s = eRe14 - (oRe14 * tRe14 - oIm14 * tRe18);
        out128[idx + 156] = resRe50_s;
        out128[idx + 100] = resRe50_s;
        let resIm50_s = -eIm14 + (oRe14 * tRe18 + oIm14 * tRe14);
        out128[idx + 101] = resIm50_s;
        out128[idx + 157] = -resIm50_s;
        
        let oRe15 = out128[idx + 158];
        let oIm15 = out128[idx + 159];
        let eRe15 = out128[idx + 30];
        let eIm15 = out128[idx + 31];
        let tRe15 = FFT_FAC_128[idx + 15];
        let tRe17 = FFT_FAC_128[idx + 17];
        let resIm15_s = eIm15 + (oRe15 * tRe17 + oIm15 * tRe15);
        out128[idx + 31] = resIm15_s;
        out128[idx + 227] = -resIm15_s;
        let resRe15_s = eRe15 + (oRe15 * tRe15 - oIm15 * tRe17);
        out128[idx + 226] = resRe15_s;
        out128[idx + 30] = resRe15_s;
        let resRe49_s = eRe15 - (oRe15 * tRe15 - oIm15 * tRe17);
        out128[idx + 158] = resRe49_s;
        out128[idx + 98] = resRe49_s;
        let resIm49_s = -eIm15 + (oRe15 * tRe17 + oIm15 * tRe15);
        out128[idx + 99] = resIm49_s;
        out128[idx + 159] = -resIm49_s;
        
        let oRe16 = out128[idx + 160];
        let oIm16 = out128[idx + 161];
        let eRe16 = out128[idx + 32];
        let eIm16 = out128[idx + 33];
        let tRe16 = FFT_FAC_128[idx + 16];
        let resIm16_s = eIm16 + (oRe16 * tRe16 + oIm16 * tRe16);
        out128[idx + 33] = resIm16_s;
        out128[idx + 225] = -resIm16_s;
        let resRe16_s = eRe16 + (oRe16 * tRe16 - oIm16 * tRe16);
        out128[idx + 224] = resRe16_s;
        out128[idx + 32] = resRe16_s;
        let resRe48_s = eRe16 - (oRe16 * tRe16 - oIm16 * tRe16);
        out128[idx + 160] = resRe48_s;
        out128[idx + 96] = resRe48_s;
        let resIm48_s = -eIm16 + (oRe16 * tRe16 + oIm16 * tRe16);
        out128[idx + 97] = resIm48_s;
        out128[idx + 161] = -resIm48_s;
        
        let oRe17 = out128[idx + 162];
        let oIm17 = out128[idx + 163];
        let eRe17 = out128[idx + 34];
        let eIm17 = out128[idx + 35];
        let resIm17_s = eIm17 + (oRe17 * tRe15 + oIm17 * tRe17);
        out128[idx + 35] = resIm17_s;
        out128[idx + 223] = -resIm17_s;
        let resRe17_s = eRe17 + (oRe17 * tRe17 - oIm17 * tRe15);
        out128[idx + 222] = resRe17_s;
        out128[idx + 34] = resRe17_s;
        let resRe47_s = eRe17 - (oRe17 * tRe17 - oIm17 * tRe15);
        out128[idx + 162] = resRe47_s;
        out128[idx + 94] = resRe47_s;
        let resIm47_s = -eIm17 + (oRe17 * tRe15 + oIm17 * tRe17);
        out128[idx + 95] = resIm47_s;
        out128[idx + 163] = -resIm47_s;
        
        let oRe18 = out128[idx + 164];
        let oIm18 = out128[idx + 165];
        let eRe18 = out128[idx + 36];
        let eIm18 = out128[idx + 37];
        let resIm18_s = eIm18 + (oRe18 * tRe14 + oIm18 * tRe18);
        out128[idx + 37] = resIm18_s;
        out128[idx + 221] = -resIm18_s;
        let resRe18_s = eRe18 + (oRe18 * tRe18 - oIm18 * tRe14);
        out128[idx + 220] = resRe18_s;
        out128[idx + 36] = resRe18_s;
        let resRe46_s = eRe18 - (oRe18 * tRe18 - oIm18 * tRe14);
        out128[idx + 164] = resRe46_s;
        out128[idx + 92] = resRe46_s;
        let resIm46_s = -eIm18 + (oRe18 * tRe14 + oIm18 * tRe18);
        out128[idx + 93] = resIm46_s;
        out128[idx + 165] = -resIm46_s;
        
        let oRe19 = out128[idx + 166];
        let oIm19 = out128[idx + 167];
        let eRe19 = out128[idx + 38];
        let eIm19 = out128[idx + 39];
        let resIm19_s = eIm19 + (oRe19 * tRe13 + oIm19 * tRe19);
        out128[idx + 39] = resIm19_s;
        out128[idx + 219] = -resIm19_s;
        let resRe19_s = eRe19 + (oRe19 * tRe19 - oIm19 * tRe13);
        out128[idx + 218] = resRe19_s;
        out128[idx + 38] = resRe19_s;
        let resRe45_s = eRe19 - (oRe19 * tRe19 - oIm19 * tRe13);
        out128[idx + 166] = resRe45_s;
        out128[idx + 90] = resRe45_s;
        let resIm45_s = -eIm19 + (oRe19 * tRe13 + oIm19 * tRe19);
        out128[idx + 91] = resIm45_s;
        out128[idx + 167] = -resIm45_s;
        
        let oRe20 = out128[idx + 168];
        let oIm20 = out128[idx + 169];
        let eRe20 = out128[idx + 40];
        let eIm20 = out128[idx + 41];
        let resIm20_s = eIm20 + (oRe20 * tRe12 + oIm20 * tRe20);
        out128[idx + 41] = resIm20_s;
        out128[idx + 217] = -resIm20_s;
        let resRe20_s = eRe20 + (oRe20 * tRe20 - oIm20 * tRe12);
        out128[idx + 216] = resRe20_s;
        out128[idx + 40] = resRe20_s;
        let resRe44_s = eRe20 - (oRe20 * tRe20 - oIm20 * tRe12);
        out128[idx + 168] = resRe44_s;
        out128[idx + 88] = resRe44_s;
        let resIm44_s = -eIm20 + (oRe20 * tRe12 + oIm20 * tRe20);
        out128[idx + 89] = resIm44_s;
        out128[idx + 169] = -resIm44_s;
        
        let oRe21 = out128[idx + 170];
        let oIm21 = out128[idx + 171];
        let eRe21 = out128[idx + 42];
        let eIm21 = out128[idx + 43];
        let resIm21_s = eIm21 + (oRe21 * tRe11 + oIm21 * tRe21);
        out128[idx + 43] = resIm21_s;
        out128[idx + 215] = -resIm21_s;
        let resRe21_s = eRe21 + (oRe21 * tRe21 - oIm21 * tRe11);
        out128[idx + 214] = resRe21_s;
        out128[idx + 42] = resRe21_s;
        let resRe43_s = eRe21 - (oRe21 * tRe21 - oIm21 * tRe11);
        out128[idx + 170] = resRe43_s;
        out128[idx + 86] = resRe43_s;
        let resIm43_s = -eIm21 + (oRe21 * tRe11 + oIm21 * tRe21);
        out128[idx + 87] = resIm43_s;
        out128[idx + 171] = -resIm43_s;
        
        let oRe22 = out128[idx + 172];
        let oIm22 = out128[idx + 173];
        let eRe22 = out128[idx + 44];
        let eIm22 = out128[idx + 45];
        let resIm22_s = eIm22 + (oRe22 * tRe10 + oIm22 * tRe22);
        out128[idx + 45] = resIm22_s;
        out128[idx + 213] = -resIm22_s;
        let resRe22_s = eRe22 + (oRe22 * tRe22 - oIm22 * tRe10);
        out128[idx + 212] = resRe22_s;
        out128[idx + 44] = resRe22_s;
        let resRe42_s = eRe22 - (oRe22 * tRe22 - oIm22 * tRe10);
        out128[idx + 172] = resRe42_s;
        out128[idx + 84] = resRe42_s;
        let resIm42_s = -eIm22 + (oRe22 * tRe10 + oIm22 * tRe22);
        out128[idx + 85] = resIm42_s;
        out128[idx + 173] = -resIm42_s;
        
        let oRe23 = out128[idx + 174];
        let oIm23 = out128[idx + 175];
        let eRe23 = out128[idx + 46];
        let eIm23 = out128[idx + 47];
        let resIm23_s = eIm23 + (oRe23 * tRe9 + oIm23 * tRe23);
        out128[idx + 47] = resIm23_s;
        out128[idx + 211] = -resIm23_s;
        let resRe23_s = eRe23 + (oRe23 * tRe23 - oIm23 * tRe9);
        out128[idx + 210] = resRe23_s;
        out128[idx + 46] = resRe23_s;
        let resRe41_s = eRe23 - (oRe23 * tRe23 - oIm23 * tRe9);
        out128[idx + 174] = resRe41_s;
        out128[idx + 82] = resRe41_s;
        let resIm41_s = -eIm23 + (oRe23 * tRe9 + oIm23 * tRe23);
        out128[idx + 83] = resIm41_s;
        out128[idx + 175] = -resIm41_s;
        
        let oRe24 = out128[idx + 176];
        let oIm24 = out128[idx + 177];
        let eRe24 = out128[idx + 48];
        let eIm24 = out128[idx + 49];
        let resIm24_s = eIm24 + (oRe24 * tRe8 + oIm24 * tRe24);
        out128[idx + 49] = resIm24_s;
        out128[idx + 209] = -resIm24_s;
        let resRe24_s = eRe24 + (oRe24 * tRe24 - oIm24 * tRe8);
        out128[idx + 208] = resRe24_s;
        out128[idx + 48] = resRe24_s;
        let resRe40_s = eRe24 - (oRe24 * tRe24 - oIm24 * tRe8);
        out128[idx + 176] = resRe40_s;
        out128[idx + 80] = resRe40_s;
        let resIm40_s = -eIm24 + (oRe24 * tRe8 + oIm24 * tRe24);
        out128[idx + 81] = resIm40_s;
        out128[idx + 177] = -resIm40_s;
        
        let oRe25 = out128[idx + 178];
        let oIm25 = out128[idx + 179];
        let eRe25 = out128[idx + 50];
        let eIm25 = out128[idx + 51];
        let resIm25_s = eIm25 + (oRe25 * tRe7 + oIm25 * tRe25);
        out128[idx + 51] = resIm25_s;
        out128[idx + 207] = -resIm25_s;
        let resRe25_s = eRe25 + (oRe25 * tRe25 - oIm25 * tRe7);
        out128[idx + 206] = resRe25_s;
        out128[idx + 50] = resRe25_s;
        let resRe39_s = eRe25 - (oRe25 * tRe25 - oIm25 * tRe7);
        out128[idx + 178] = resRe39_s;
        out128[idx + 78] = resRe39_s;
        let resIm39_s = -eIm25 + (oRe25 * tRe7 + oIm25 * tRe25);
        out128[idx + 79] = resIm39_s;
        out128[idx + 179] = -resIm39_s;
        
        let oRe26 = out128[idx + 180];
        let oIm26 = out128[idx + 181];
        let eRe26 = out128[idx + 52];
        let eIm26 = out128[idx + 53];
        let resIm26_s = eIm26 + (oRe26 * tRe6 + oIm26 * tRe26);
        out128[idx + 53] = resIm26_s;
        out128[idx + 205] = -resIm26_s;
        let resRe26_s = eRe26 + (oRe26 * tRe26 - oIm26 * tRe6);
        out128[idx + 204] = resRe26_s;
        out128[idx + 52] = resRe26_s;
        let resRe38_s = eRe26 - (oRe26 * tRe26 - oIm26 * tRe6);
        out128[idx + 180] = resRe38_s;
        out128[idx + 76] = resRe38_s;
        let resIm38_s = -eIm26 + (oRe26 * tRe6 + oIm26 * tRe26);
        out128[idx + 77] = resIm38_s;
        out128[idx + 181] = -resIm38_s;
        
        let oRe27 = out128[idx + 182];
        let oIm27 = out128[idx + 183];
        let eRe27 = out128[idx + 54];
        let eIm27 = out128[idx + 55];
        let resIm27_s = eIm27 + (oRe27 * tRe5 + oIm27 * tRe27);
        out128[idx + 55] = resIm27_s;
        out128[idx + 203] = -resIm27_s;
        let resRe27_s = eRe27 + (oRe27 * tRe27 - oIm27 * tRe5);
        out128[idx + 202] = resRe27_s;
        out128[idx + 54] = resRe27_s;
        let resRe37_s = eRe27 - (oRe27 * tRe27 - oIm27 * tRe5);
        out128[idx + 182] = resRe37_s;
        out128[idx + 74] = resRe37_s;
        let resIm37_s = -eIm27 + (oRe27 * tRe5 + oIm27 * tRe27);
        out128[idx + 75] = resIm37_s;
        out128[idx + 183] = -resIm37_s;
        
        let oRe28 = out128[idx + 184];
        let oIm28 = out128[idx + 185];
        let eRe28 = out128[idx + 56];
        let eIm28 = out128[idx + 57];
        let resIm28_s = eIm28 + (oRe28 * tRe4 + oIm28 * tRe28);
        out128[idx + 57] = resIm28_s;
        out128[idx + 201] = -resIm28_s;
        let resRe28_s = eRe28 + (oRe28 * tRe28 - oIm28 * tRe4);
        out128[idx + 200] = resRe28_s;
        out128[idx + 56] = resRe28_s;
        let resRe36_s = eRe28 - (oRe28 * tRe28 - oIm28 * tRe4);
        out128[idx + 184] = resRe36_s;
        out128[idx + 72] = resRe36_s;
        let resIm36_s = -eIm28 + (oRe28 * tRe4 + oIm28 * tRe28);
        out128[idx + 73] = resIm36_s;
        out128[idx + 185] = -resIm36_s;
        
        let oRe29 = out128[idx + 186];
        let oIm29 = out128[idx + 187];
        let eRe29 = out128[idx + 58];
        let eIm29 = out128[idx + 59];
        let resIm29_s = eIm29 + (oRe29 * tRe3 + oIm29 * tRe29);
        out128[idx + 59] = resIm29_s;
        out128[idx + 199] = -resIm29_s;
        let resRe29_s = eRe29 + (oRe29 * tRe29 - oIm29 * tRe3);
        out128[idx + 198] = resRe29_s;
        out128[idx + 58] = resRe29_s;
        let resRe35_s = eRe29 - (oRe29 * tRe29 - oIm29 * tRe3);
        out128[idx + 186] = resRe35_s;
        out128[idx + 70] = resRe35_s;
        let resIm35_s = -eIm29 + (oRe29 * tRe3 + oIm29 * tRe29);
        out128[idx + 71] = resIm35_s;
        out128[idx + 187] = -resIm35_s;
        
        let oRe30 = out128[idx + 188];
        let oIm30 = out128[idx + 189];
        let eRe30 = out128[idx + 60];
        let eIm30 = out128[idx + 61];
        let resIm30_s = eIm30 + (oRe30 * tRe2 + oIm30 * tRe30);
        out128[idx + 61] = resIm30_s;
        out128[idx + 197] = -resIm30_s;
        let resRe30_s = eRe30 + (oRe30 * tRe30 - oIm30 * tRe2);
        out128[idx + 196] = resRe30_s;
        out128[idx + 60] = resRe30_s;
        let resRe34_s = eRe30 - (oRe30 * tRe30 - oIm30 * tRe2);
        out128[idx + 188] = resRe34_s;
        out128[idx + 68] = resRe34_s;
        let resIm34_s = -eIm30 + (oRe30 * tRe2 + oIm30 * tRe30);
        out128[idx + 69] = resIm34_s;
        out128[idx + 189] = -resIm34_s;
        
        let oRe31 = out128[idx + 190];
        let oIm31 = out128[idx + 191];
        let eRe31 = out128[idx + 62];
        let eIm31 = out128[idx + 63];
        let resIm31_s = eIm31 + (oRe31 * tRe1 + oIm31 * tRe31);
        out128[idx + 63] = resIm31_s;
        out128[idx + 195] = -resIm31_s;
        let resRe31_s = eRe31 + (oRe31 * tRe31 - oIm31 * tRe1);
        out128[idx + 194] = resRe31_s;
        out128[idx + 62] = resRe31_s;
        let resRe33_s = eRe31 - (oRe31 * tRe31 - oIm31 * tRe1);
        out128[idx + 190] = resRe33_s;
        out128[idx + 66] = resRe33_s;
        let resIm33_s = -eIm31 + (oRe31 * tRe1 + oIm31 * tRe31);
        out128[idx + 67] = resIm33_s;
        out128[idx + 191] = -resIm33_s;
        
        let oRe32 = out128[idx + 192];
        let oIm32 = out128[idx + 193];
        let eRe32 = out128[idx + 64];
        let eIm32 = out128[idx + 65];
        let resIm32_s = eIm32 + oRe32;
        out128[idx + 65] = resIm32_s;
        out128[idx + 193] = -resIm32_s;
        let resRe32_s = eRe32 - oIm32;
        out128[idx + 192] = resRe32_s;
        out128[idx + 64] = resRe32_s;
        
    } 

    return out128;
} 

export {fftReal128}; 

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
    // RADIX 2 (unrolled) - FFT step for SIZE 64 
    ////////////////////////////////////////////////
    { 
        let oRe0 = out128[64];
        let oIm0 = out128[65];
        let eRe0 = out128[0];
        let eIm0 = out128[1];
        let resRe0_s = eRe0 + oRe0;
        out128[0] = resRe0_s;
        let resIm0_s = eIm0 + oIm0;
        out128[1] = resIm0_s;
        let resRe0_d = eRe0 - oRe0;
        out128[64] = resRe0_d;
        let resIm0_d = eIm0 - oIm0;
        out128[65] = resIm0_d;
        
        let oRe1 = out128[66];
        let oIm1 = out128[67];
        let eRe1 = out128[2];
        let eIm1 = out128[3];
        let tRe1 = 0.9951847195625305;
        let tRe15 = 0.0980171337723732;
        let resIm1_s = eIm1 + (oRe1 * tRe15 + oIm1 * tRe1);
        out128[3] = resIm1_s;
        out128[127] = -resIm1_s;
        let resRe1_s = eRe1 + (oRe1 * tRe1 - oIm1 * tRe15);
        out128[126] = resRe1_s;
        out128[2] = resRe1_s;
        let resRe31_s = eRe1 - (oRe1 * tRe1 - oIm1 * tRe15);
        out128[66] = resRe31_s;
        out128[62] = resRe31_s;
        let resIm31_s = -eIm1 + (oRe1 * tRe15 + oIm1 * tRe1);
        out128[63] = resIm31_s;
        out128[67] = -resIm31_s;
        
        let oRe2 = out128[68];
        let oIm2 = out128[69];
        let eRe2 = out128[4];
        let eIm2 = out128[5];
        let tRe2 = 0.9807852506637573;
        let tRe14 = 0.1950903534889221;
        let resIm2_s = eIm2 + (oRe2 * tRe14 + oIm2 * tRe2);
        out128[5] = resIm2_s;
        out128[125] = -resIm2_s;
        let resRe2_s = eRe2 + (oRe2 * tRe2 - oIm2 * tRe14);
        out128[124] = resRe2_s;
        out128[4] = resRe2_s;
        let resRe30_s = eRe2 - (oRe2 * tRe2 - oIm2 * tRe14);
        out128[68] = resRe30_s;
        out128[60] = resRe30_s;
        let resIm30_s = -eIm2 + (oRe2 * tRe14 + oIm2 * tRe2);
        out128[61] = resIm30_s;
        out128[69] = -resIm30_s;
        
        let oRe3 = out128[70];
        let oIm3 = out128[71];
        let eRe3 = out128[6];
        let eIm3 = out128[7];
        let tRe3 = 0.9569403529167175;
        let tRe13 = 0.2902846336364746;
        let resIm3_s = eIm3 + (oRe3 * tRe13 + oIm3 * tRe3);
        out128[7] = resIm3_s;
        out128[123] = -resIm3_s;
        let resRe3_s = eRe3 + (oRe3 * tRe3 - oIm3 * tRe13);
        out128[122] = resRe3_s;
        out128[6] = resRe3_s;
        let resRe29_s = eRe3 - (oRe3 * tRe3 - oIm3 * tRe13);
        out128[70] = resRe29_s;
        out128[58] = resRe29_s;
        let resIm29_s = -eIm3 + (oRe3 * tRe13 + oIm3 * tRe3);
        out128[59] = resIm29_s;
        out128[71] = -resIm29_s;
        
        let oRe4 = out128[72];
        let oIm4 = out128[73];
        let eRe4 = out128[8];
        let eIm4 = out128[9];
        let tRe4 = 0.9238795042037964;
        let tRe12 = 0.3826834261417389;
        let resIm4_s = eIm4 + (oRe4 * tRe12 + oIm4 * tRe4);
        out128[9] = resIm4_s;
        out128[121] = -resIm4_s;
        let resRe4_s = eRe4 + (oRe4 * tRe4 - oIm4 * tRe12);
        out128[120] = resRe4_s;
        out128[8] = resRe4_s;
        let resRe28_s = eRe4 - (oRe4 * tRe4 - oIm4 * tRe12);
        out128[72] = resRe28_s;
        out128[56] = resRe28_s;
        let resIm28_s = -eIm4 + (oRe4 * tRe12 + oIm4 * tRe4);
        out128[57] = resIm28_s;
        out128[73] = -resIm28_s;
        
        let oRe5 = out128[74];
        let oIm5 = out128[75];
        let eRe5 = out128[10];
        let eIm5 = out128[11];
        let tRe5 = 0.8819212913513184;
        let tRe11 = 0.4713967740535736;
        let resIm5_s = eIm5 + (oRe5 * tRe11 + oIm5 * tRe5);
        out128[11] = resIm5_s;
        out128[119] = -resIm5_s;
        let resRe5_s = eRe5 + (oRe5 * tRe5 - oIm5 * tRe11);
        out128[118] = resRe5_s;
        out128[10] = resRe5_s;
        let resRe27_s = eRe5 - (oRe5 * tRe5 - oIm5 * tRe11);
        out128[74] = resRe27_s;
        out128[54] = resRe27_s;
        let resIm27_s = -eIm5 + (oRe5 * tRe11 + oIm5 * tRe5);
        out128[55] = resIm27_s;
        out128[75] = -resIm27_s;
        
        let oRe6 = out128[76];
        let oIm6 = out128[77];
        let eRe6 = out128[12];
        let eIm6 = out128[13];
        let tRe6 = 0.8314695954322815;
        let tRe10 = 0.5555702447891235;
        let resIm6_s = eIm6 + (oRe6 * tRe10 + oIm6 * tRe6);
        out128[13] = resIm6_s;
        out128[117] = -resIm6_s;
        let resRe6_s = eRe6 + (oRe6 * tRe6 - oIm6 * tRe10);
        out128[116] = resRe6_s;
        out128[12] = resRe6_s;
        let resRe26_s = eRe6 - (oRe6 * tRe6 - oIm6 * tRe10);
        out128[76] = resRe26_s;
        out128[52] = resRe26_s;
        let resIm26_s = -eIm6 + (oRe6 * tRe10 + oIm6 * tRe6);
        out128[53] = resIm26_s;
        out128[77] = -resIm26_s;
        
        let oRe7 = out128[78];
        let oIm7 = out128[79];
        let eRe7 = out128[14];
        let eIm7 = out128[15];
        let tRe7 = 0.7730104923248291;
        let tRe9 = 0.6343932747840881;
        let resIm7_s = eIm7 + (oRe7 * tRe9 + oIm7 * tRe7);
        out128[15] = resIm7_s;
        out128[115] = -resIm7_s;
        let resRe7_s = eRe7 + (oRe7 * tRe7 - oIm7 * tRe9);
        out128[114] = resRe7_s;
        out128[14] = resRe7_s;
        let resRe25_s = eRe7 - (oRe7 * tRe7 - oIm7 * tRe9);
        out128[78] = resRe25_s;
        out128[50] = resRe25_s;
        let resIm25_s = -eIm7 + (oRe7 * tRe9 + oIm7 * tRe7);
        out128[51] = resIm25_s;
        out128[79] = -resIm25_s;
        
        let oRe8 = out128[80];
        let oIm8 = out128[81];
        let eRe8 = out128[16];
        let eIm8 = out128[17];
        let tRe8 = 0.7071067690849304;
        let resIm8_s = eIm8 + (oRe8 * tRe8 + oIm8 * tRe8);
        out128[17] = resIm8_s;
        out128[113] = -resIm8_s;
        let resRe8_s = eRe8 + (oRe8 * tRe8 - oIm8 * tRe8);
        out128[112] = resRe8_s;
        out128[16] = resRe8_s;
        let resRe24_s = eRe8 - (oRe8 * tRe8 - oIm8 * tRe8);
        out128[80] = resRe24_s;
        out128[48] = resRe24_s;
        let resIm24_s = -eIm8 + (oRe8 * tRe8 + oIm8 * tRe8);
        out128[49] = resIm24_s;
        out128[81] = -resIm24_s;
        
        let oRe9 = out128[82];
        let oIm9 = out128[83];
        let eRe9 = out128[18];
        let eIm9 = out128[19];
        let resIm9_s = eIm9 + (oRe9 * tRe7 + oIm9 * tRe9);
        out128[19] = resIm9_s;
        out128[111] = -resIm9_s;
        let resRe9_s = eRe9 + (oRe9 * tRe9 - oIm9 * tRe7);
        out128[110] = resRe9_s;
        out128[18] = resRe9_s;
        let resRe23_s = eRe9 - (oRe9 * tRe9 - oIm9 * tRe7);
        out128[82] = resRe23_s;
        out128[46] = resRe23_s;
        let resIm23_s = -eIm9 + (oRe9 * tRe7 + oIm9 * tRe9);
        out128[47] = resIm23_s;
        out128[83] = -resIm23_s;
        
        let oRe10 = out128[84];
        let oIm10 = out128[85];
        let eRe10 = out128[20];
        let eIm10 = out128[21];
        let resIm10_s = eIm10 + (oRe10 * tRe6 + oIm10 * tRe10);
        out128[21] = resIm10_s;
        out128[109] = -resIm10_s;
        let resRe10_s = eRe10 + (oRe10 * tRe10 - oIm10 * tRe6);
        out128[108] = resRe10_s;
        out128[20] = resRe10_s;
        let resRe22_s = eRe10 - (oRe10 * tRe10 - oIm10 * tRe6);
        out128[84] = resRe22_s;
        out128[44] = resRe22_s;
        let resIm22_s = -eIm10 + (oRe10 * tRe6 + oIm10 * tRe10);
        out128[45] = resIm22_s;
        out128[85] = -resIm22_s;
        
        let oRe11 = out128[86];
        let oIm11 = out128[87];
        let eRe11 = out128[22];
        let eIm11 = out128[23];
        let resIm11_s = eIm11 + (oRe11 * tRe5 + oIm11 * tRe11);
        out128[23] = resIm11_s;
        out128[107] = -resIm11_s;
        let resRe11_s = eRe11 + (oRe11 * tRe11 - oIm11 * tRe5);
        out128[106] = resRe11_s;
        out128[22] = resRe11_s;
        let resRe21_s = eRe11 - (oRe11 * tRe11 - oIm11 * tRe5);
        out128[86] = resRe21_s;
        out128[42] = resRe21_s;
        let resIm21_s = -eIm11 + (oRe11 * tRe5 + oIm11 * tRe11);
        out128[43] = resIm21_s;
        out128[87] = -resIm21_s;
        
        let oRe12 = out128[88];
        let oIm12 = out128[89];
        let eRe12 = out128[24];
        let eIm12 = out128[25];
        let resIm12_s = eIm12 + (oRe12 * tRe4 + oIm12 * tRe12);
        out128[25] = resIm12_s;
        out128[105] = -resIm12_s;
        let resRe12_s = eRe12 + (oRe12 * tRe12 - oIm12 * tRe4);
        out128[104] = resRe12_s;
        out128[24] = resRe12_s;
        let resRe20_s = eRe12 - (oRe12 * tRe12 - oIm12 * tRe4);
        out128[88] = resRe20_s;
        out128[40] = resRe20_s;
        let resIm20_s = -eIm12 + (oRe12 * tRe4 + oIm12 * tRe12);
        out128[41] = resIm20_s;
        out128[89] = -resIm20_s;
        
        let oRe13 = out128[90];
        let oIm13 = out128[91];
        let eRe13 = out128[26];
        let eIm13 = out128[27];
        let resIm13_s = eIm13 + (oRe13 * tRe3 + oIm13 * tRe13);
        out128[27] = resIm13_s;
        out128[103] = -resIm13_s;
        let resRe13_s = eRe13 + (oRe13 * tRe13 - oIm13 * tRe3);
        out128[102] = resRe13_s;
        out128[26] = resRe13_s;
        let resRe19_s = eRe13 - (oRe13 * tRe13 - oIm13 * tRe3);
        out128[90] = resRe19_s;
        out128[38] = resRe19_s;
        let resIm19_s = -eIm13 + (oRe13 * tRe3 + oIm13 * tRe13);
        out128[39] = resIm19_s;
        out128[91] = -resIm19_s;
        
        let oRe14 = out128[92];
        let oIm14 = out128[93];
        let eRe14 = out128[28];
        let eIm14 = out128[29];
        let resIm14_s = eIm14 + (oRe14 * tRe2 + oIm14 * tRe14);
        out128[29] = resIm14_s;
        out128[101] = -resIm14_s;
        let resRe14_s = eRe14 + (oRe14 * tRe14 - oIm14 * tRe2);
        out128[100] = resRe14_s;
        out128[28] = resRe14_s;
        let resRe18_s = eRe14 - (oRe14 * tRe14 - oIm14 * tRe2);
        out128[92] = resRe18_s;
        out128[36] = resRe18_s;
        let resIm18_s = -eIm14 + (oRe14 * tRe2 + oIm14 * tRe14);
        out128[37] = resIm18_s;
        out128[93] = -resIm18_s;
        
        let oRe15 = out128[94];
        let oIm15 = out128[95];
        let eRe15 = out128[30];
        let eIm15 = out128[31];
        let resIm15_s = eIm15 + (oRe15 * tRe1 + oIm15 * tRe15);
        out128[31] = resIm15_s;
        out128[99] = -resIm15_s;
        let resRe15_s = eRe15 + (oRe15 * tRe15 - oIm15 * tRe1);
        out128[98] = resRe15_s;
        out128[30] = resRe15_s;
        let resRe17_s = eRe15 - (oRe15 * tRe15 - oIm15 * tRe1);
        out128[94] = resRe17_s;
        out128[34] = resRe17_s;
        let resIm17_s = -eIm15 + (oRe15 * tRe1 + oIm15 * tRe15);
        out128[35] = resIm17_s;
        out128[95] = -resIm17_s;
        
        let oRe16 = out128[96];
        let oIm16 = out128[97];
        let eRe16 = out128[32];
        let eIm16 = out128[33];
        let resIm16_s = eIm16 + oRe16;
        out128[33] = resIm16_s;
        out128[97] = -resIm16_s;
        let resRe16_s = eRe16 - oIm16;
        out128[96] = resRe16_s;
        out128[32] = resRe16_s;
        
        let oRe128 = out128[192];
        let oIm128 = out128[193];
        let eRe128 = out128[128];
        let eIm128 = out128[129];
        let resRe128_s = eRe128 + oRe128;
        out128[128] = resRe128_s;
        let resIm128_s = eIm128 + oIm128;
        out128[129] = resIm128_s;
        let resRe128_d = eRe128 - oRe128;
        out128[192] = resRe128_d;
        let resIm128_d = eIm128 - oIm128;
        out128[193] = resIm128_d;
        
        let oRe129 = out128[194];
        let oIm129 = out128[195];
        let eRe129 = out128[130];
        let eIm129 = out128[131];
        let tRe129 = 0.9951847195625305;
        let tRe143 = 0.0980171337723732;
        let resIm129_s = eIm129 + (oRe129 * tRe143 + oIm129 * tRe129);
        out128[131] = resIm129_s;
        out128[255] = -resIm129_s;
        let resRe129_s = eRe129 + (oRe129 * tRe129 - oIm129 * tRe143);
        out128[254] = resRe129_s;
        out128[130] = resRe129_s;
        let resRe159_s = eRe129 - (oRe129 * tRe129 - oIm129 * tRe143);
        out128[194] = resRe159_s;
        out128[190] = resRe159_s;
        let resIm159_s = -eIm129 + (oRe129 * tRe143 + oIm129 * tRe129);
        out128[191] = resIm159_s;
        out128[195] = -resIm159_s;
        
        let oRe130 = out128[196];
        let oIm130 = out128[197];
        let eRe130 = out128[132];
        let eIm130 = out128[133];
        let tRe130 = 0.9807852506637573;
        let tRe142 = 0.1950903534889221;
        let resIm130_s = eIm130 + (oRe130 * tRe142 + oIm130 * tRe130);
        out128[133] = resIm130_s;
        out128[253] = -resIm130_s;
        let resRe130_s = eRe130 + (oRe130 * tRe130 - oIm130 * tRe142);
        out128[252] = resRe130_s;
        out128[132] = resRe130_s;
        let resRe158_s = eRe130 - (oRe130 * tRe130 - oIm130 * tRe142);
        out128[196] = resRe158_s;
        out128[188] = resRe158_s;
        let resIm158_s = -eIm130 + (oRe130 * tRe142 + oIm130 * tRe130);
        out128[189] = resIm158_s;
        out128[197] = -resIm158_s;
        
        let oRe131 = out128[198];
        let oIm131 = out128[199];
        let eRe131 = out128[134];
        let eIm131 = out128[135];
        let tRe131 = 0.9569403529167175;
        let tRe141 = 0.2902846336364746;
        let resIm131_s = eIm131 + (oRe131 * tRe141 + oIm131 * tRe131);
        out128[135] = resIm131_s;
        out128[251] = -resIm131_s;
        let resRe131_s = eRe131 + (oRe131 * tRe131 - oIm131 * tRe141);
        out128[250] = resRe131_s;
        out128[134] = resRe131_s;
        let resRe157_s = eRe131 - (oRe131 * tRe131 - oIm131 * tRe141);
        out128[198] = resRe157_s;
        out128[186] = resRe157_s;
        let resIm157_s = -eIm131 + (oRe131 * tRe141 + oIm131 * tRe131);
        out128[187] = resIm157_s;
        out128[199] = -resIm157_s;
        
        let oRe132 = out128[200];
        let oIm132 = out128[201];
        let eRe132 = out128[136];
        let eIm132 = out128[137];
        let tRe132 = 0.9238795042037964;
        let tRe140 = 0.3826834261417389;
        let resIm132_s = eIm132 + (oRe132 * tRe140 + oIm132 * tRe132);
        out128[137] = resIm132_s;
        out128[249] = -resIm132_s;
        let resRe132_s = eRe132 + (oRe132 * tRe132 - oIm132 * tRe140);
        out128[248] = resRe132_s;
        out128[136] = resRe132_s;
        let resRe156_s = eRe132 - (oRe132 * tRe132 - oIm132 * tRe140);
        out128[200] = resRe156_s;
        out128[184] = resRe156_s;
        let resIm156_s = -eIm132 + (oRe132 * tRe140 + oIm132 * tRe132);
        out128[185] = resIm156_s;
        out128[201] = -resIm156_s;
        
        let oRe133 = out128[202];
        let oIm133 = out128[203];
        let eRe133 = out128[138];
        let eIm133 = out128[139];
        let tRe133 = 0.8819212913513184;
        let tRe139 = 0.4713967740535736;
        let resIm133_s = eIm133 + (oRe133 * tRe139 + oIm133 * tRe133);
        out128[139] = resIm133_s;
        out128[247] = -resIm133_s;
        let resRe133_s = eRe133 + (oRe133 * tRe133 - oIm133 * tRe139);
        out128[246] = resRe133_s;
        out128[138] = resRe133_s;
        let resRe155_s = eRe133 - (oRe133 * tRe133 - oIm133 * tRe139);
        out128[202] = resRe155_s;
        out128[182] = resRe155_s;
        let resIm155_s = -eIm133 + (oRe133 * tRe139 + oIm133 * tRe133);
        out128[183] = resIm155_s;
        out128[203] = -resIm155_s;
        
        let oRe134 = out128[204];
        let oIm134 = out128[205];
        let eRe134 = out128[140];
        let eIm134 = out128[141];
        let tRe134 = 0.8314695954322815;
        let tRe138 = 0.5555702447891235;
        let resIm134_s = eIm134 + (oRe134 * tRe138 + oIm134 * tRe134);
        out128[141] = resIm134_s;
        out128[245] = -resIm134_s;
        let resRe134_s = eRe134 + (oRe134 * tRe134 - oIm134 * tRe138);
        out128[244] = resRe134_s;
        out128[140] = resRe134_s;
        let resRe154_s = eRe134 - (oRe134 * tRe134 - oIm134 * tRe138);
        out128[204] = resRe154_s;
        out128[180] = resRe154_s;
        let resIm154_s = -eIm134 + (oRe134 * tRe138 + oIm134 * tRe134);
        out128[181] = resIm154_s;
        out128[205] = -resIm154_s;
        
        let oRe135 = out128[206];
        let oIm135 = out128[207];
        let eRe135 = out128[142];
        let eIm135 = out128[143];
        let tRe135 = 0.7730104923248291;
        let tRe137 = 0.6343932747840881;
        let resIm135_s = eIm135 + (oRe135 * tRe137 + oIm135 * tRe135);
        out128[143] = resIm135_s;
        out128[243] = -resIm135_s;
        let resRe135_s = eRe135 + (oRe135 * tRe135 - oIm135 * tRe137);
        out128[242] = resRe135_s;
        out128[142] = resRe135_s;
        let resRe153_s = eRe135 - (oRe135 * tRe135 - oIm135 * tRe137);
        out128[206] = resRe153_s;
        out128[178] = resRe153_s;
        let resIm153_s = -eIm135 + (oRe135 * tRe137 + oIm135 * tRe135);
        out128[179] = resIm153_s;
        out128[207] = -resIm153_s;
        
        let oRe136 = out128[208];
        let oIm136 = out128[209];
        let eRe136 = out128[144];
        let eIm136 = out128[145];
        let tRe136 = 0.7071067690849304;
        let resIm136_s = eIm136 + (oRe136 * tRe136 + oIm136 * tRe136);
        out128[145] = resIm136_s;
        out128[241] = -resIm136_s;
        let resRe136_s = eRe136 + (oRe136 * tRe136 - oIm136 * tRe136);
        out128[240] = resRe136_s;
        out128[144] = resRe136_s;
        let resRe152_s = eRe136 - (oRe136 * tRe136 - oIm136 * tRe136);
        out128[208] = resRe152_s;
        out128[176] = resRe152_s;
        let resIm152_s = -eIm136 + (oRe136 * tRe136 + oIm136 * tRe136);
        out128[177] = resIm152_s;
        out128[209] = -resIm152_s;
        
        let oRe137 = out128[210];
        let oIm137 = out128[211];
        let eRe137 = out128[146];
        let eIm137 = out128[147];
        let resIm137_s = eIm137 + (oRe137 * tRe135 + oIm137 * tRe137);
        out128[147] = resIm137_s;
        out128[239] = -resIm137_s;
        let resRe137_s = eRe137 + (oRe137 * tRe137 - oIm137 * tRe135);
        out128[238] = resRe137_s;
        out128[146] = resRe137_s;
        let resRe151_s = eRe137 - (oRe137 * tRe137 - oIm137 * tRe135);
        out128[210] = resRe151_s;
        out128[174] = resRe151_s;
        let resIm151_s = -eIm137 + (oRe137 * tRe135 + oIm137 * tRe137);
        out128[175] = resIm151_s;
        out128[211] = -resIm151_s;
        
        let oRe138 = out128[212];
        let oIm138 = out128[213];
        let eRe138 = out128[148];
        let eIm138 = out128[149];
        let resIm138_s = eIm138 + (oRe138 * tRe134 + oIm138 * tRe138);
        out128[149] = resIm138_s;
        out128[237] = -resIm138_s;
        let resRe138_s = eRe138 + (oRe138 * tRe138 - oIm138 * tRe134);
        out128[236] = resRe138_s;
        out128[148] = resRe138_s;
        let resRe150_s = eRe138 - (oRe138 * tRe138 - oIm138 * tRe134);
        out128[212] = resRe150_s;
        out128[172] = resRe150_s;
        let resIm150_s = -eIm138 + (oRe138 * tRe134 + oIm138 * tRe138);
        out128[173] = resIm150_s;
        out128[213] = -resIm150_s;
        
        let oRe139 = out128[214];
        let oIm139 = out128[215];
        let eRe139 = out128[150];
        let eIm139 = out128[151];
        let resIm139_s = eIm139 + (oRe139 * tRe133 + oIm139 * tRe139);
        out128[151] = resIm139_s;
        out128[235] = -resIm139_s;
        let resRe139_s = eRe139 + (oRe139 * tRe139 - oIm139 * tRe133);
        out128[234] = resRe139_s;
        out128[150] = resRe139_s;
        let resRe149_s = eRe139 - (oRe139 * tRe139 - oIm139 * tRe133);
        out128[214] = resRe149_s;
        out128[170] = resRe149_s;
        let resIm149_s = -eIm139 + (oRe139 * tRe133 + oIm139 * tRe139);
        out128[171] = resIm149_s;
        out128[215] = -resIm149_s;
        
        let oRe140 = out128[216];
        let oIm140 = out128[217];
        let eRe140 = out128[152];
        let eIm140 = out128[153];
        let resIm140_s = eIm140 + (oRe140 * tRe132 + oIm140 * tRe140);
        out128[153] = resIm140_s;
        out128[233] = -resIm140_s;
        let resRe140_s = eRe140 + (oRe140 * tRe140 - oIm140 * tRe132);
        out128[232] = resRe140_s;
        out128[152] = resRe140_s;
        let resRe148_s = eRe140 - (oRe140 * tRe140 - oIm140 * tRe132);
        out128[216] = resRe148_s;
        out128[168] = resRe148_s;
        let resIm148_s = -eIm140 + (oRe140 * tRe132 + oIm140 * tRe140);
        out128[169] = resIm148_s;
        out128[217] = -resIm148_s;
        
        let oRe141 = out128[218];
        let oIm141 = out128[219];
        let eRe141 = out128[154];
        let eIm141 = out128[155];
        let resIm141_s = eIm141 + (oRe141 * tRe131 + oIm141 * tRe141);
        out128[155] = resIm141_s;
        out128[231] = -resIm141_s;
        let resRe141_s = eRe141 + (oRe141 * tRe141 - oIm141 * tRe131);
        out128[230] = resRe141_s;
        out128[154] = resRe141_s;
        let resRe147_s = eRe141 - (oRe141 * tRe141 - oIm141 * tRe131);
        out128[218] = resRe147_s;
        out128[166] = resRe147_s;
        let resIm147_s = -eIm141 + (oRe141 * tRe131 + oIm141 * tRe141);
        out128[167] = resIm147_s;
        out128[219] = -resIm147_s;
        
        let oRe142 = out128[220];
        let oIm142 = out128[221];
        let eRe142 = out128[156];
        let eIm142 = out128[157];
        let resIm142_s = eIm142 + (oRe142 * tRe130 + oIm142 * tRe142);
        out128[157] = resIm142_s;
        out128[229] = -resIm142_s;
        let resRe142_s = eRe142 + (oRe142 * tRe142 - oIm142 * tRe130);
        out128[228] = resRe142_s;
        out128[156] = resRe142_s;
        let resRe146_s = eRe142 - (oRe142 * tRe142 - oIm142 * tRe130);
        out128[220] = resRe146_s;
        out128[164] = resRe146_s;
        let resIm146_s = -eIm142 + (oRe142 * tRe130 + oIm142 * tRe142);
        out128[165] = resIm146_s;
        out128[221] = -resIm146_s;
        
        let oRe143 = out128[222];
        let oIm143 = out128[223];
        let eRe143 = out128[158];
        let eIm143 = out128[159];
        let resIm143_s = eIm143 + (oRe143 * tRe129 + oIm143 * tRe143);
        out128[159] = resIm143_s;
        out128[227] = -resIm143_s;
        let resRe143_s = eRe143 + (oRe143 * tRe143 - oIm143 * tRe129);
        out128[226] = resRe143_s;
        out128[158] = resRe143_s;
        let resRe145_s = eRe143 - (oRe143 * tRe143 - oIm143 * tRe129);
        out128[222] = resRe145_s;
        out128[162] = resRe145_s;
        let resIm145_s = -eIm143 + (oRe143 * tRe129 + oIm143 * tRe143);
        out128[163] = resIm145_s;
        out128[223] = -resIm145_s;
        
        let oRe144 = out128[224];
        let oIm144 = out128[225];
        let eRe144 = out128[160];
        let eIm144 = out128[161];
        let resIm144_s = eIm144 + oRe144;
        out128[161] = resIm144_s;
        out128[225] = -resIm144_s;
        let resRe144_s = eRe144 - oIm144;
        out128[224] = resRe144_s;
        out128[160] = resRe144_s;
        
    } 
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 2 (rolled) - FFT step for SIZE 128 
    ////////////////////////////////////////////////
    { 
     for (let j = 0; j < 64; j++) { 
         let eI = 0 + j;
         let oI = 0 + j + 64;
         if(j > 32){
             out128[eI * 2    ] =  out128[256 - eI * 2    ];
             out128[eI * 2 + 1] = -out128[256 - eI * 2 + 1];
             out128[oI * 2    ] =  out128[256 - oI * 2    ];
             out128[oI * 2 + 1] = -out128[256 - oI * 2 + 1];
             continue;
         } 
         let eRe  = out128[eI * 2    ];
         let eIm  = out128[eI * 2 + 1];
         let oRe  = out128[oI * 2    ];
         let oIm  = out128[oI * 2 + 1];
         let tRe  = FFT_FAC_128[j * 2 + 0];
         let tIm  = FFT_FAC_128[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out128[eI * 2    ] = eRe + t_oRe;
         out128[eI * 2 + 1] = eIm + t_oIm;
         out128[oI * 2    ] = eRe - t_oRe;
         out128[oI * 2 + 1] = eIm - t_oIm;
     }
    } 

    return out128;
} 

export {fftReal128}; 

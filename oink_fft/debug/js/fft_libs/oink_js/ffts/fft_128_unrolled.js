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
    // RADIX 2 (complete)
    ////////////////////////////////////////////////
    for (let j = 0; j < 32; j++) { 
        let eRe1a  = out128[     j * 2    ];
        let eIm1a  = out128[     j * 2 + 1];
        let oRe1a  = out128[32 + j * 2    ];
        let oIm1a  = out128[32 + j * 2 + 1];
        let tRe1a  = FFT_FAC_128[j * 2 + 0];
        let tIm1a  = FFT_FAC_128[j * 2 + 1];
        let t_oRe1a = oRe1a * tRe1a - oIm1a * tIm1a;
        let t_oIm1a = oRe1a * tIm1a + oIm1a * tRe1a;
        let res0r  = eRe1a + t_oRe1a;
        let res0i  = eIm1a + t_oIm1a;
        let res32r = eRe1a - t_oRe1a;
        let res32i = eIm1a - t_oIm1a;

        let eRe1b  = out128[64 + j * 2    ];
        let eIm1b  = out128[64 + j * 2 + 1];
        let oRe1b  = out128[96 + j * 2    ];
        let oIm1b  = out128[96 + j * 2 + 1];
        let tRe1b  = FFT_FAC_128[j * 2 + 0];
        let tIm1b  = FFT_FAC_128[j * 2 + 1];
        let t_oRe1b = oRe1b * tRe1b - oIm1b * tIm1b;
        let t_oIm1b = oRe1b * tIm1b + oIm1b * tRe1b;
        res64r = eRe1b + t_oRe1b;
        res64i = eIm1b + t_oIm1b;
        res96r = eRe1b - t_oRe1b;
        res96i = eIm1b - t_oIm1b;


        let eRe2a  = res0r;
        let eIm2a  = res0i;
        let oRe2a  = res64r;
        let oIm2a  = res64i;
        let tRe2a  = FFT_FAC_128[     j * 2 + 0];
        let tIm2a  = FFT_FAC_128[     j * 2 + 1];
        let t_oRe2a = oRe2a * tRe2a - oIm2a * tIm2a;
        let t_oIm2a = oRe2a * tIm2a + oIm2a * tRe2a;
        out128[(     j) * 2    ] = eRe2a + t_oRe2a;
        out128[(     j) * 2 + 1] = eIm2a + t_oIm2a;
        out128[(64 + j) * 2    ] = eRe2a - t_oRe2a;
        out128[(64 + j) * 2 + 1] = eIm2a - t_oIm2a;

        let eRe2b  = res32r;
        let eIm2b  = res32i;
        let oRe2b  = res96r;
        let oIm2b  = res96i;
        let tRe2b  = FFT_FAC_128[32 + j * 2 + 0];
        let tIm2b  = FFT_FAC_128[32 + j * 2 + 1];
        let t_oRe2b = oRe2b * tRe2b - oIm2b * tIm2b;
        let t_oIm2b = oRe2b * tIm2b + oIm2b * tRe2b;
        out128[(32 + j) * 2    ] = eRe2b + t_oRe2b;
        out128[(32 + j) * 2 + 1] = eIm2b + t_oIm2b;
        out128[(96 + j) * 2    ] = eRe2b - t_oRe2b;
        out128[(96 + j) * 2 + 1] = eIm2b - t_oIm2b;
    }

    return out128;
} 

export {fftReal128}; 

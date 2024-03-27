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
    // RADIX 2 (rolled) - FFT step for SIZE 16 
    ////////////////////////////////////////////////
    for(let idx = 0; idx < 128; idx += 32){ 
        let oRe0 = out128[idx + 16];
        let oIm0 = out128[idx + 17];
        let eRe0 = out128[idx + 0];
        let eIm0 = out128[idx + 1];
        let resRe0_s = eRe0 + oRe0;
        out128[idx] = resRe0_s;
        let resIm0_s = eIm0 + oIm0;
        out128[idx + 1] = resRe0_s;
        let resRe0_d = eRe0 - oRe0;
        out128[idx + 16] = resRe0_d;
        let resIm0_d = eIm0 - oIm0;
        out128[idx + 17] = resIm0_d;
        
        let oRe1 = out128[idx + 18];
        let oIm1 = out128[idx + 19];
        let eRe1 = out128[idx + 2];
        let eIm1 = out128[idx + 3];
        let tRe1 = FFT_FAC_128[idx + 1];
        let tRe3 = FFT_FAC_128[idx + 3];
        let resIm1_s = eIm1 + (oRe1 * tRe3 + oIm1 * tRe1);
        out128[idx + 3] = resIm1_s;
        out128[idx + 31] = -resIm1_s;
        let resRe1_s = eRe1 + (oRe1 * tRe1 - oIm1 * tRe3);
        out128[idx + 30] = resRe1_s;
        out128[idx + 2] = resRe1_s;
        let resRe7_s = eRe1 - (oRe1 * tRe1 - oIm1 * tRe3);
        out128[idx + 18] = resRe7_s;
        out128[idx + 14] = resRe7_s;
        let resIm7_s = -eIm1 + (oRe1 * tRe3 + oIm1 * tRe1);
        out128[idx + 15] = resIm7_s;
        out128[idx + 19] = -resIm7_s;
        
        let oRe2 = out128[idx + 20];
        let oIm2 = out128[idx + 21];
        let eRe2 = out128[idx + 4];
        let eIm2 = out128[idx + 5];
        let tRe2 = FFT_FAC_128[idx + 2];
        let resIm2_s = eIm2 + (oRe2 * tRe2 + oIm2 * tRe2);
        out128[idx + 5] = resIm2_s;
        out128[idx + 29] = -resIm2_s;
        let resRe2_s = eRe2 + (oRe2 * tRe2 - oIm2 * tRe2);
        out128[idx + 28] = resRe2_s;
        out128[idx + 4] = resRe2_s;
        let resRe6_s = eRe2 - (oRe2 * tRe2 - oIm2 * tRe2);
        out128[idx + 20] = resRe6_s;
        out128[idx + 12] = resRe6_s;
        let resIm6_s = -eIm2 + (oRe2 * tRe2 + oIm2 * tRe2);
        out128[idx + 13] = resIm6_s;
        out128[idx + 21] = -resIm6_s;
        
        let oRe3 = out128[idx + 22];
        let oIm3 = out128[idx + 23];
        let eRe3 = out128[idx + 6];
        let eIm3 = out128[idx + 7];
        let resIm3_s = eIm3 + (oRe3 * tRe1 + oIm3 * tRe3);
        out128[idx + 7] = resIm3_s;
        out128[idx + 27] = -resIm3_s;
        let resRe3_s = eRe3 + (oRe3 * tRe3 - oIm3 * tRe1);
        out128[idx + 26] = resRe3_s;
        out128[idx + 6] = resRe3_s;
        let resRe5_s = eRe3 - (oRe3 * tRe3 - oIm3 * tRe1);
        out128[idx + 22] = resRe5_s;
        out128[idx + 10] = resRe5_s;
        let resIm5_s = -eIm3 + (oRe3 * tRe1 + oIm3 * tRe3);
        out128[idx + 11] = resIm5_s;
        out128[idx + 23] = -resIm5_s;
        
        let oRe4 = out128[idx + 24];
        let oIm4 = out128[idx + 25];
        let eRe4 = out128[idx + 8];
        let eIm4 = out128[idx + 9];
        let resIm4_s = eIm4 + oRe4;
        out128[idx + 9] = resIm4_s;
        out128[idx + 25] = -resIm4_s;
        let resRe4_s = eRe4 - oIm4;
        out128[idx + 24] = resRe4_s;
        out128[idx + 8] = resRe4_s;
        
    } 
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 2 (rolled) - FFT step for SIZE 32 
    ////////////////////////////////////////////////
    for(let idx = 0; idx < 128; idx += 64){ 
        let oRe0 = out128[idx + 32];
        let oIm0 = out128[idx + 33];
        let eRe0 = out128[idx + 0];
        let eIm0 = out128[idx + 1];
        let resRe0_s = eRe0 + oRe0;
        out128[idx] = resRe0_s;
        let resIm0_s = eIm0 + oIm0;
        out128[idx + 1] = resRe0_s;
        let resRe0_d = eRe0 - oRe0;
        out128[idx + 32] = resRe0_d;
        let resIm0_d = eIm0 - oIm0;
        out128[idx + 33] = resIm0_d;
        
        let oRe1 = out128[idx + 34];
        let oIm1 = out128[idx + 35];
        let eRe1 = out128[idx + 2];
        let eIm1 = out128[idx + 3];
        let tRe1 = FFT_FAC_128[idx + 1];
        let tRe7 = FFT_FAC_128[idx + 7];
        let resIm1_s = eIm1 + (oRe1 * tRe7 + oIm1 * tRe1);
        out128[idx + 3] = resIm1_s;
        out128[idx + 63] = -resIm1_s;
        let resRe1_s = eRe1 + (oRe1 * tRe1 - oIm1 * tRe7);
        out128[idx + 62] = resRe1_s;
        out128[idx + 2] = resRe1_s;
        let resRe15_s = eRe1 - (oRe1 * tRe1 - oIm1 * tRe7);
        out128[idx + 34] = resRe15_s;
        out128[idx + 30] = resRe15_s;
        let resIm15_s = -eIm1 + (oRe1 * tRe7 + oIm1 * tRe1);
        out128[idx + 31] = resIm15_s;
        out128[idx + 35] = -resIm15_s;
        
        let oRe2 = out128[idx + 36];
        let oIm2 = out128[idx + 37];
        let eRe2 = out128[idx + 4];
        let eIm2 = out128[idx + 5];
        let tRe2 = FFT_FAC_128[idx + 2];
        let tRe6 = FFT_FAC_128[idx + 6];
        let resIm2_s = eIm2 + (oRe2 * tRe6 + oIm2 * tRe2);
        out128[idx + 5] = resIm2_s;
        out128[idx + 61] = -resIm2_s;
        let resRe2_s = eRe2 + (oRe2 * tRe2 - oIm2 * tRe6);
        out128[idx + 60] = resRe2_s;
        out128[idx + 4] = resRe2_s;
        let resRe14_s = eRe2 - (oRe2 * tRe2 - oIm2 * tRe6);
        out128[idx + 36] = resRe14_s;
        out128[idx + 28] = resRe14_s;
        let resIm14_s = -eIm2 + (oRe2 * tRe6 + oIm2 * tRe2);
        out128[idx + 29] = resIm14_s;
        out128[idx + 37] = -resIm14_s;
        
        let oRe3 = out128[idx + 38];
        let oIm3 = out128[idx + 39];
        let eRe3 = out128[idx + 6];
        let eIm3 = out128[idx + 7];
        let tRe3 = FFT_FAC_128[idx + 3];
        let tRe5 = FFT_FAC_128[idx + 5];
        let resIm3_s = eIm3 + (oRe3 * tRe5 + oIm3 * tRe3);
        out128[idx + 7] = resIm3_s;
        out128[idx + 59] = -resIm3_s;
        let resRe3_s = eRe3 + (oRe3 * tRe3 - oIm3 * tRe5);
        out128[idx + 58] = resRe3_s;
        out128[idx + 6] = resRe3_s;
        let resRe13_s = eRe3 - (oRe3 * tRe3 - oIm3 * tRe5);
        out128[idx + 38] = resRe13_s;
        out128[idx + 26] = resRe13_s;
        let resIm13_s = -eIm3 + (oRe3 * tRe5 + oIm3 * tRe3);
        out128[idx + 27] = resIm13_s;
        out128[idx + 39] = -resIm13_s;
        
        let oRe4 = out128[idx + 40];
        let oIm4 = out128[idx + 41];
        let eRe4 = out128[idx + 8];
        let eIm4 = out128[idx + 9];
        let tRe4 = FFT_FAC_128[idx + 4];
        let resIm4_s = eIm4 + (oRe4 * tRe4 + oIm4 * tRe4);
        out128[idx + 9] = resIm4_s;
        out128[idx + 57] = -resIm4_s;
        let resRe4_s = eRe4 + (oRe4 * tRe4 - oIm4 * tRe4);
        out128[idx + 56] = resRe4_s;
        out128[idx + 8] = resRe4_s;
        let resRe12_s = eRe4 - (oRe4 * tRe4 - oIm4 * tRe4);
        out128[idx + 40] = resRe12_s;
        out128[idx + 24] = resRe12_s;
        let resIm12_s = -eIm4 + (oRe4 * tRe4 + oIm4 * tRe4);
        out128[idx + 25] = resIm12_s;
        out128[idx + 41] = -resIm12_s;
        
        let oRe5 = out128[idx + 42];
        let oIm5 = out128[idx + 43];
        let eRe5 = out128[idx + 10];
        let eIm5 = out128[idx + 11];
        let resIm5_s = eIm5 + (oRe5 * tRe3 + oIm5 * tRe5);
        out128[idx + 11] = resIm5_s;
        out128[idx + 55] = -resIm5_s;
        let resRe5_s = eRe5 + (oRe5 * tRe5 - oIm5 * tRe3);
        out128[idx + 54] = resRe5_s;
        out128[idx + 10] = resRe5_s;
        let resRe11_s = eRe5 - (oRe5 * tRe5 - oIm5 * tRe3);
        out128[idx + 42] = resRe11_s;
        out128[idx + 22] = resRe11_s;
        let resIm11_s = -eIm5 + (oRe5 * tRe3 + oIm5 * tRe5);
        out128[idx + 23] = resIm11_s;
        out128[idx + 43] = -resIm11_s;
        
        let oRe6 = out128[idx + 44];
        let oIm6 = out128[idx + 45];
        let eRe6 = out128[idx + 12];
        let eIm6 = out128[idx + 13];
        let resIm6_s = eIm6 + (oRe6 * tRe2 + oIm6 * tRe6);
        out128[idx + 13] = resIm6_s;
        out128[idx + 53] = -resIm6_s;
        let resRe6_s = eRe6 + (oRe6 * tRe6 - oIm6 * tRe2);
        out128[idx + 52] = resRe6_s;
        out128[idx + 12] = resRe6_s;
        let resRe10_s = eRe6 - (oRe6 * tRe6 - oIm6 * tRe2);
        out128[idx + 44] = resRe10_s;
        out128[idx + 20] = resRe10_s;
        let resIm10_s = -eIm6 + (oRe6 * tRe2 + oIm6 * tRe6);
        out128[idx + 21] = resIm10_s;
        out128[idx + 45] = -resIm10_s;
        
        let oRe7 = out128[idx + 46];
        let oIm7 = out128[idx + 47];
        let eRe7 = out128[idx + 14];
        let eIm7 = out128[idx + 15];
        let resIm7_s = eIm7 + (oRe7 * tRe1 + oIm7 * tRe7);
        out128[idx + 15] = resIm7_s;
        out128[idx + 51] = -resIm7_s;
        let resRe7_s = eRe7 + (oRe7 * tRe7 - oIm7 * tRe1);
        out128[idx + 50] = resRe7_s;
        out128[idx + 14] = resRe7_s;
        let resRe9_s = eRe7 - (oRe7 * tRe7 - oIm7 * tRe1);
        out128[idx + 46] = resRe9_s;
        out128[idx + 18] = resRe9_s;
        let resIm9_s = -eIm7 + (oRe7 * tRe1 + oIm7 * tRe7);
        out128[idx + 19] = resIm9_s;
        out128[idx + 47] = -resIm9_s;
        
        let oRe8 = out128[idx + 48];
        let oIm8 = out128[idx + 49];
        let eRe8 = out128[idx + 16];
        let eIm8 = out128[idx + 17];
        let resIm8_s = eIm8 + oRe8;
        out128[idx + 17] = resIm8_s;
        out128[idx + 49] = -resIm8_s;
        let resRe8_s = eRe8 - oIm8;
        out128[idx + 48] = resRe8_s;
        out128[idx + 16] = resRe8_s;
        
    } 
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 2 (rolled) - FFT step for SIZE 64 
    ////////////////////////////////////////////////
    for(let idx = 0; idx < 128; idx += 128){ 
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

    return out128;
} 

export {fftReal128}; 

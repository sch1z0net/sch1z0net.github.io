let FFT_FAC_256 = new Float32Array([
1.0000000000000000,0.0000000000000000,0.9996988177299500,0.0245412290096283,0.9987954497337341,0.0490676760673523,0.9972904324531555,0.0735645666718483,
0.9951847195625305,0.0980171412229538,0.9924795627593994,0.1224106699228287,0.9891765117645264,0.1467304676771164,0.9852776527404785,0.1709618866443634,
0.9807852506637573,0.1950903236865997,0.9757021069526672,0.2191012352705002,0.9700312614440918,0.2429801821708679,0.9637760519981384,0.2667127549648285,
0.9569403529167175,0.2902846634387970,0.9495281577110291,0.3136817514896393,0.9415440559387207,0.3368898332118988,0.9329928159713745,0.3598950505256653,
0.9238795042037964,0.3826834559440613,0.9142097830772400,0.4052413105964661,0.9039893150329590,0.4275550842285156,0.8932242989540100,0.4496113359928131,
0.8819212913513184,0.4713967144489288,0.8700870275497437,0.4928981661796570,0.8577286005020142,0.5141027569770813,0.8448535799980164,0.5349976420402527,
0.8314695954322815,0.5555702447891235,0.8175848126411438,0.5758082270622253,0.8032075166702271,0.5956993103027344,0.7883464694023132,0.6152315735816956,
0.7730104923248291,0.6343932747840881,0.7572088241577148,0.6531728506088257,0.7409511208534241,0.6715589761734009,0.7242470979690552,0.6895405650138855,
0.7071067690849304,0.7071067690849304,0.6895405650138855,0.7242470383644104,0.6715589761734009,0.7409511208534241,0.6531728506088257,0.7572088241577148,
0.6343932747840881,0.7730104327201843,0.6152315735816956,0.7883464097976685,0.5956993103027344,0.8032075166702271,0.5758082270622253,0.8175848126411438,
0.5555702447891235,0.8314695954322815,0.5349976420402527,0.8448535799980164,0.5141028165817261,0.8577286005020142,0.4928981959819794,0.8700869679450989,
0.4713967740535736,0.8819212317466736,0.4496113061904907,0.8932242989540100,0.4275551140308380,0.9039893150329590,0.4052412807941437,0.9142097830772400,
0.3826834261417389,0.9238795042037964,0.3598950803279877,0.9329927563667297,0.3368898332118988,0.9415440559387207,0.3136817514896393,0.9495281577110291,
0.2902846336364746,0.9569403529167175,0.2667127549648285,0.9637760519981384,0.2429802417755127,0.9700312614440918,0.2191012203693390,0.9757021069526672,
0.1950903534889221,0.9807852506637573,0.1709618568420410,0.9852776527404785,0.1467304974794388,0.9891765117645264,0.1224106252193451,0.9924795627593994,
0.0980171337723732,0.9951847195625305,0.0735646113753319,0.9972904324531555,0.0490676499903202,0.9987954497337341,0.0245412550866604,0.9996988177299500,
-0.0000000437113883,1.0000000000000000,-0.0245412234216928,0.9996988177299500,-0.0490676201879978,0.9987954497337341,-0.0735645741224289,0.9972904324531555,
-0.0980171039700508,0.9951847195625305,-0.1224107071757317,0.9924795031547546,-0.1467304527759552,0.9891765117645264,-0.1709619462490082,0.9852776527404785,
-0.1950903236865997,0.9807852506637573,-0.2191011905670166,0.9757021665573120,-0.2429801970720291,0.9700312614440918,-0.2667127251625061,0.9637760519981384,
-0.2902847230434418,0.9569402933120728,-0.3136817216873169,0.9495281577110291,-0.3368898034095764,0.9415440559387207,-0.3598950505256653,0.9329928159713745,
-0.3826833963394165,0.9238795638084412,-0.4052413403987885,0.9142097234725952,-0.4275550842285156,0.9039893150329590,-0.4496113657951355,0.8932242989540100,
-0.4713966250419617,0.8819212913513184,-0.4928981661796570,0.8700870275497437,-0.5141027569770813,0.8577286005020142,-0.5349977016448975,0.8448535203933716,
-0.5555701851844788,0.8314696550369263,-0.5758081674575806,0.8175848126411438,-0.5956993699073792,0.8032075166702271,-0.6152315139770508,0.7883464694023132,
-0.6343932747840881,0.7730104923248291,-0.6531728506088257,0.7572088241577148,-0.6715590357780457,0.7409510612487793,-0.6895405054092407,0.7242470979690552,
-0.7071067690849304,0.7071067690849304,-0.7242471575737000,0.6895405054092407,-0.7409510612487793,0.6715590357780457,-0.7572088241577148,0.6531728506088257,
-0.7730104923248291,0.6343932747840881,-0.7883464694023132,0.6152315139770508,-0.8032075166702271,0.5956993699073792,-0.8175848126411438,0.5758081674575806,
-0.8314696550369263,0.5555701851844788,-0.8448535203933716,0.5349977016448975,-0.8577286005020142,0.5141027569770813,-0.8700870275497437,0.4928981363773346,
-0.8819212317466736,0.4713968336582184,-0.8932242989540100,0.4496113657951355,-0.9039893150329590,0.4275550544261932,-0.9142097830772400,0.4052412211894989,
-0.9238795042037964,0.3826834857463837,-0.9329928159713745,0.3598950505256653,-0.9415441155433655,0.3368898034095764,-0.9495281577110291,0.3136818408966064,
-0.9569403529167175,0.2902847230434418,-0.9637760519981384,0.2667127251625061,-0.9700312614440918,0.2429800778627396,-0.9757021069526672,0.2191012948751450,
-0.9807853102684021,0.1950903087854385,-0.9852776527404785,0.1709618121385574,-0.9891765117645264,0.1467305719852448,-0.9924795031547546,0.1224106997251511,
-0.9951847195625305,0.0980170965194702,-0.9972904920578003,0.0735644474625587,-0.9987954497337341,0.0490677244961262,-0.9996988177299500,0.0245412103831768
]);


let iBR256 = new Float32Array(256);
let iP256  = new Float32Array(256);
let _iP256 = new Float32Array(256);
let out256 = new Float32Array(512);

function fftReal256(realInput) { 
    let size = realInput.length;
    if (size != 256) {
        for (let i = 0; i < 256; i++) {
            iP256[i] = (i < size) ? realInput[i] : 0.0;
        }
        _iP256 = iP256;
    } else {
        _iP256 = realInput;
    }


    //Bit Reversal
    {
        iBR256[0]=_iP256[0]; 
        iBR256[1]=_iP256[128]; 
        iBR256[2]=_iP256[64]; 
        iBR256[3]=_iP256[192]; 
        iBR256[4]=_iP256[32]; 
        iBR256[5]=_iP256[160]; 
        iBR256[6]=_iP256[96]; 
        iBR256[7]=_iP256[224]; 
        iBR256[8]=_iP256[16]; 
        iBR256[9]=_iP256[144]; 
        iBR256[10]=_iP256[80]; 
        iBR256[11]=_iP256[208]; 
        iBR256[12]=_iP256[48]; 
        iBR256[13]=_iP256[176]; 
        iBR256[14]=_iP256[112]; 
        iBR256[15]=_iP256[240]; 
        iBR256[16]=_iP256[8]; 
        iBR256[17]=_iP256[136]; 
        iBR256[18]=_iP256[72]; 
        iBR256[19]=_iP256[200]; 
        iBR256[20]=_iP256[40]; 
        iBR256[21]=_iP256[168]; 
        iBR256[22]=_iP256[104]; 
        iBR256[23]=_iP256[232]; 
        iBR256[24]=_iP256[24]; 
        iBR256[25]=_iP256[152]; 
        iBR256[26]=_iP256[88]; 
        iBR256[27]=_iP256[216]; 
        iBR256[28]=_iP256[56]; 
        iBR256[29]=_iP256[184]; 
        iBR256[30]=_iP256[120]; 
        iBR256[31]=_iP256[248]; 
        iBR256[32]=_iP256[4]; 
        iBR256[33]=_iP256[132]; 
        iBR256[34]=_iP256[68]; 
        iBR256[35]=_iP256[196]; 
        iBR256[36]=_iP256[36]; 
        iBR256[37]=_iP256[164]; 
        iBR256[38]=_iP256[100]; 
        iBR256[39]=_iP256[228]; 
        iBR256[40]=_iP256[20]; 
        iBR256[41]=_iP256[148]; 
        iBR256[42]=_iP256[84]; 
        iBR256[43]=_iP256[212]; 
        iBR256[44]=_iP256[52]; 
        iBR256[45]=_iP256[180]; 
        iBR256[46]=_iP256[116]; 
        iBR256[47]=_iP256[244]; 
        iBR256[48]=_iP256[12]; 
        iBR256[49]=_iP256[140]; 
        iBR256[50]=_iP256[76]; 
        iBR256[51]=_iP256[204]; 
        iBR256[52]=_iP256[44]; 
        iBR256[53]=_iP256[172]; 
        iBR256[54]=_iP256[108]; 
        iBR256[55]=_iP256[236]; 
        iBR256[56]=_iP256[28]; 
        iBR256[57]=_iP256[156]; 
        iBR256[58]=_iP256[92]; 
        iBR256[59]=_iP256[220]; 
        iBR256[60]=_iP256[60]; 
        iBR256[61]=_iP256[188]; 
        iBR256[62]=_iP256[124]; 
        iBR256[63]=_iP256[252]; 
        iBR256[64]=_iP256[2]; 
        iBR256[65]=_iP256[130]; 
        iBR256[66]=_iP256[66]; 
        iBR256[67]=_iP256[194]; 
        iBR256[68]=_iP256[34]; 
        iBR256[69]=_iP256[162]; 
        iBR256[70]=_iP256[98]; 
        iBR256[71]=_iP256[226]; 
        iBR256[72]=_iP256[18]; 
        iBR256[73]=_iP256[146]; 
        iBR256[74]=_iP256[82]; 
        iBR256[75]=_iP256[210]; 
        iBR256[76]=_iP256[50]; 
        iBR256[77]=_iP256[178]; 
        iBR256[78]=_iP256[114]; 
        iBR256[79]=_iP256[242]; 
        iBR256[80]=_iP256[10]; 
        iBR256[81]=_iP256[138]; 
        iBR256[82]=_iP256[74]; 
        iBR256[83]=_iP256[202]; 
        iBR256[84]=_iP256[42]; 
        iBR256[85]=_iP256[170]; 
        iBR256[86]=_iP256[106]; 
        iBR256[87]=_iP256[234]; 
        iBR256[88]=_iP256[26]; 
        iBR256[89]=_iP256[154]; 
        iBR256[90]=_iP256[90]; 
        iBR256[91]=_iP256[218]; 
        iBR256[92]=_iP256[58]; 
        iBR256[93]=_iP256[186]; 
        iBR256[94]=_iP256[122]; 
        iBR256[95]=_iP256[250]; 
        iBR256[96]=_iP256[6]; 
        iBR256[97]=_iP256[134]; 
        iBR256[98]=_iP256[70]; 
        iBR256[99]=_iP256[198]; 
        iBR256[100]=_iP256[38]; 
        iBR256[101]=_iP256[166]; 
        iBR256[102]=_iP256[102]; 
        iBR256[103]=_iP256[230]; 
        iBR256[104]=_iP256[22]; 
        iBR256[105]=_iP256[150]; 
        iBR256[106]=_iP256[86]; 
        iBR256[107]=_iP256[214]; 
        iBR256[108]=_iP256[54]; 
        iBR256[109]=_iP256[182]; 
        iBR256[110]=_iP256[118]; 
        iBR256[111]=_iP256[246]; 
        iBR256[112]=_iP256[14]; 
        iBR256[113]=_iP256[142]; 
        iBR256[114]=_iP256[78]; 
        iBR256[115]=_iP256[206]; 
        iBR256[116]=_iP256[46]; 
        iBR256[117]=_iP256[174]; 
        iBR256[118]=_iP256[110]; 
        iBR256[119]=_iP256[238]; 
        iBR256[120]=_iP256[30]; 
        iBR256[121]=_iP256[158]; 
        iBR256[122]=_iP256[94]; 
        iBR256[123]=_iP256[222]; 
        iBR256[124]=_iP256[62]; 
        iBR256[125]=_iP256[190]; 
        iBR256[126]=_iP256[126]; 
        iBR256[127]=_iP256[254]; 
        iBR256[128]=_iP256[1]; 
        iBR256[129]=_iP256[129]; 
        iBR256[130]=_iP256[65]; 
        iBR256[131]=_iP256[193]; 
        iBR256[132]=_iP256[33]; 
        iBR256[133]=_iP256[161]; 
        iBR256[134]=_iP256[97]; 
        iBR256[135]=_iP256[225]; 
        iBR256[136]=_iP256[17]; 
        iBR256[137]=_iP256[145]; 
        iBR256[138]=_iP256[81]; 
        iBR256[139]=_iP256[209]; 
        iBR256[140]=_iP256[49]; 
        iBR256[141]=_iP256[177]; 
        iBR256[142]=_iP256[113]; 
        iBR256[143]=_iP256[241]; 
        iBR256[144]=_iP256[9]; 
        iBR256[145]=_iP256[137]; 
        iBR256[146]=_iP256[73]; 
        iBR256[147]=_iP256[201]; 
        iBR256[148]=_iP256[41]; 
        iBR256[149]=_iP256[169]; 
        iBR256[150]=_iP256[105]; 
        iBR256[151]=_iP256[233]; 
        iBR256[152]=_iP256[25]; 
        iBR256[153]=_iP256[153]; 
        iBR256[154]=_iP256[89]; 
        iBR256[155]=_iP256[217]; 
        iBR256[156]=_iP256[57]; 
        iBR256[157]=_iP256[185]; 
        iBR256[158]=_iP256[121]; 
        iBR256[159]=_iP256[249]; 
        iBR256[160]=_iP256[5]; 
        iBR256[161]=_iP256[133]; 
        iBR256[162]=_iP256[69]; 
        iBR256[163]=_iP256[197]; 
        iBR256[164]=_iP256[37]; 
        iBR256[165]=_iP256[165]; 
        iBR256[166]=_iP256[101]; 
        iBR256[167]=_iP256[229]; 
        iBR256[168]=_iP256[21]; 
        iBR256[169]=_iP256[149]; 
        iBR256[170]=_iP256[85]; 
        iBR256[171]=_iP256[213]; 
        iBR256[172]=_iP256[53]; 
        iBR256[173]=_iP256[181]; 
        iBR256[174]=_iP256[117]; 
        iBR256[175]=_iP256[245]; 
        iBR256[176]=_iP256[13]; 
        iBR256[177]=_iP256[141]; 
        iBR256[178]=_iP256[77]; 
        iBR256[179]=_iP256[205]; 
        iBR256[180]=_iP256[45]; 
        iBR256[181]=_iP256[173]; 
        iBR256[182]=_iP256[109]; 
        iBR256[183]=_iP256[237]; 
        iBR256[184]=_iP256[29]; 
        iBR256[185]=_iP256[157]; 
        iBR256[186]=_iP256[93]; 
        iBR256[187]=_iP256[221]; 
        iBR256[188]=_iP256[61]; 
        iBR256[189]=_iP256[189]; 
        iBR256[190]=_iP256[125]; 
        iBR256[191]=_iP256[253]; 
        iBR256[192]=_iP256[3]; 
        iBR256[193]=_iP256[131]; 
        iBR256[194]=_iP256[67]; 
        iBR256[195]=_iP256[195]; 
        iBR256[196]=_iP256[35]; 
        iBR256[197]=_iP256[163]; 
        iBR256[198]=_iP256[99]; 
        iBR256[199]=_iP256[227]; 
        iBR256[200]=_iP256[19]; 
        iBR256[201]=_iP256[147]; 
        iBR256[202]=_iP256[83]; 
        iBR256[203]=_iP256[211]; 
        iBR256[204]=_iP256[51]; 
        iBR256[205]=_iP256[179]; 
        iBR256[206]=_iP256[115]; 
        iBR256[207]=_iP256[243]; 
        iBR256[208]=_iP256[11]; 
        iBR256[209]=_iP256[139]; 
        iBR256[210]=_iP256[75]; 
        iBR256[211]=_iP256[203]; 
        iBR256[212]=_iP256[43]; 
        iBR256[213]=_iP256[171]; 
        iBR256[214]=_iP256[107]; 
        iBR256[215]=_iP256[235]; 
        iBR256[216]=_iP256[27]; 
        iBR256[217]=_iP256[155]; 
        iBR256[218]=_iP256[91]; 
        iBR256[219]=_iP256[219]; 
        iBR256[220]=_iP256[59]; 
        iBR256[221]=_iP256[187]; 
        iBR256[222]=_iP256[123]; 
        iBR256[223]=_iP256[251]; 
        iBR256[224]=_iP256[7]; 
        iBR256[225]=_iP256[135]; 
        iBR256[226]=_iP256[71]; 
        iBR256[227]=_iP256[199]; 
        iBR256[228]=_iP256[39]; 
        iBR256[229]=_iP256[167]; 
        iBR256[230]=_iP256[103]; 
        iBR256[231]=_iP256[231]; 
        iBR256[232]=_iP256[23]; 
        iBR256[233]=_iP256[151]; 
        iBR256[234]=_iP256[87]; 
        iBR256[235]=_iP256[215]; 
        iBR256[236]=_iP256[55]; 
        iBR256[237]=_iP256[183]; 
        iBR256[238]=_iP256[119]; 
        iBR256[239]=_iP256[247]; 
        iBR256[240]=_iP256[15]; 
        iBR256[241]=_iP256[143]; 
        iBR256[242]=_iP256[79]; 
        iBR256[243]=_iP256[207]; 
        iBR256[244]=_iP256[47]; 
        iBR256[245]=_iP256[175]; 
        iBR256[246]=_iP256[111]; 
        iBR256[247]=_iP256[239]; 
        iBR256[248]=_iP256[31]; 
        iBR256[249]=_iP256[159]; 
        iBR256[250]=_iP256[95]; 
        iBR256[251]=_iP256[223]; 
        iBR256[252]=_iP256[63]; 
        iBR256[253]=_iP256[191]; 
        iBR256[254]=_iP256[127]; 
        iBR256[255]=_iP256[255]; 
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 4 - FFT step for SIZE 4/8 
    ////////////////////////////////////////////////

    for (let idx = 0, out_idx = 0; idx < 256; idx += 4, out_idx += 8) {
        let x0aRe = iBR256[idx    ];
        let x1aRe = iBR256[idx + 1];
        let x2aRe = iBR256[idx + 2];
        let x3aRe = iBR256[idx + 3];

        let sum1  = x0aRe + x1aRe;
        let sum2  = x2aRe + x3aRe;
        let diff1 = x0aRe - x1aRe;
        let diff2 = x2aRe - x3aRe;

        out256[out_idx]     = sum1 + sum2;
        out256[out_idx + 1] = 0.0;
        out256[out_idx + 2] = diff1;
        out256[out_idx + 3] = diff2;
        out256[out_idx + 4] = sum1 - sum2;
        out256[out_idx + 5] = 0.0;
        out256[out_idx + 6] = diff1;
        out256[out_idx + 7] = -diff2;
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 2 (semi unrolled) - FFT step for SIZE 16 
    ////////////////////////////////////////////////
    for(let idx = 0; idx < 256; idx += 16){ 
        let oRe0 = out256[idx + 16];
        let oIm0 = out256[idx + 17];
        let eRe0 = out256[idx + 0];
        let eIm0 = out256[idx + 1];
        let resRe0_s = eRe0 + oRe0;
        out256[idx] = resRe0_s;
        let resIm0_s = eIm0 + oIm0;
        out256[idx + 1] = resRe0_s;
        let resRe0_d = eRe0 - oRe0;
        out256[idx + 16] = resRe0_d;
        let resIm0_d = eIm0 - oIm0;
        out256[idx + 17] = resIm0_d;
        
        let oRe1 = out256[idx + 18];
        let oIm1 = out256[idx + 19];
        let eRe1 = out256[idx + 2];
        let eIm1 = out256[idx + 3];
        let tRe1 = FFT_FAC_256[idx + 1];
        let tRe3 = FFT_FAC_256[idx + 3];
        let resIm1_s = eIm1 + (oRe1 * tRe3 + oIm1 * tRe1);
        out256[idx + 3] = resIm1_s;
        out256[idx + 31] = -resIm1_s;
        let resRe1_s = eRe1 + (oRe1 * tRe1 - oIm1 * tRe3);
        out256[idx + 30] = resRe1_s;
        out256[idx + 2] = resRe1_s;
        let resRe7_s = eRe1 - (oRe1 * tRe1 - oIm1 * tRe3);
        out256[idx + 18] = resRe7_s;
        out256[idx + 14] = resRe7_s;
        let resIm7_s = -eIm1 + (oRe1 * tRe3 + oIm1 * tRe1);
        out256[idx + 15] = resIm7_s;
        out256[idx + 19] = -resIm7_s;
        
        let oRe2 = out256[idx + 20];
        let oIm2 = out256[idx + 21];
        let eRe2 = out256[idx + 4];
        let eIm2 = out256[idx + 5];
        let tRe2 = FFT_FAC_256[idx + 2];
        let resIm2_s = eIm2 + (oRe2 * tRe2 + oIm2 * tRe2);
        out256[idx + 5] = resIm2_s;
        out256[idx + 29] = -resIm2_s;
        let resRe2_s = eRe2 + (oRe2 * tRe2 - oIm2 * tRe2);
        out256[idx + 28] = resRe2_s;
        out256[idx + 4] = resRe2_s;
        let resRe6_s = eRe2 - (oRe2 * tRe2 - oIm2 * tRe2);
        out256[idx + 20] = resRe6_s;
        out256[idx + 12] = resRe6_s;
        let resIm6_s = -eIm2 + (oRe2 * tRe2 + oIm2 * tRe2);
        out256[idx + 13] = resIm6_s;
        out256[idx + 21] = -resIm6_s;
        
        let oRe3 = out256[idx + 22];
        let oIm3 = out256[idx + 23];
        let eRe3 = out256[idx + 6];
        let eIm3 = out256[idx + 7];
        let resIm3_s = eIm3 + (oRe3 * tRe1 + oIm3 * tRe3);
        out256[idx + 7] = resIm3_s;
        out256[idx + 27] = -resIm3_s;
        let resRe3_s = eRe3 + (oRe3 * tRe3 - oIm3 * tRe1);
        out256[idx + 26] = resRe3_s;
        out256[idx + 6] = resRe3_s;
        let resRe5_s = eRe3 - (oRe3 * tRe3 - oIm3 * tRe1);
        out256[idx + 22] = resRe5_s;
        out256[idx + 10] = resRe5_s;
        let resIm5_s = -eIm3 + (oRe3 * tRe1 + oIm3 * tRe3);
        out256[idx + 11] = resIm5_s;
        out256[idx + 23] = -resIm5_s;
        
        let oRe4 = out256[idx + 24];
        let oIm4 = out256[idx + 25];
        let eRe4 = out256[idx + 8];
        let eIm4 = out256[idx + 9];
        let resIm4_s = eIm4 + oRe4;
        out256[idx + 9] = resIm4_s;
        out256[idx + 25] = -resIm4_s;
        let resRe4_s = eRe4 - oIm4;
        out256[idx + 24] = resRe4_s;
        out256[idx + 8] = resRe4_s;
        
    } 
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 2 (semi unrolled) - FFT step for SIZE 32 
    ////////////////////////////////////////////////
    for(let idx = 0; idx < 256; idx += 32){ 
        let oRe0 = out256[idx + 32];
        let oIm0 = out256[idx + 33];
        let eRe0 = out256[idx + 0];
        let eIm0 = out256[idx + 1];
        let resRe0_s = eRe0 + oRe0;
        out256[idx] = resRe0_s;
        let resIm0_s = eIm0 + oIm0;
        out256[idx + 1] = resRe0_s;
        let resRe0_d = eRe0 - oRe0;
        out256[idx + 32] = resRe0_d;
        let resIm0_d = eIm0 - oIm0;
        out256[idx + 33] = resIm0_d;
        
        let oRe1 = out256[idx + 34];
        let oIm1 = out256[idx + 35];
        let eRe1 = out256[idx + 2];
        let eIm1 = out256[idx + 3];
        let tRe1 = FFT_FAC_256[idx + 1];
        let tRe7 = FFT_FAC_256[idx + 7];
        let resIm1_s = eIm1 + (oRe1 * tRe7 + oIm1 * tRe1);
        out256[idx + 3] = resIm1_s;
        out256[idx + 63] = -resIm1_s;
        let resRe1_s = eRe1 + (oRe1 * tRe1 - oIm1 * tRe7);
        out256[idx + 62] = resRe1_s;
        out256[idx + 2] = resRe1_s;
        let resRe15_s = eRe1 - (oRe1 * tRe1 - oIm1 * tRe7);
        out256[idx + 34] = resRe15_s;
        out256[idx + 30] = resRe15_s;
        let resIm15_s = -eIm1 + (oRe1 * tRe7 + oIm1 * tRe1);
        out256[idx + 31] = resIm15_s;
        out256[idx + 35] = -resIm15_s;
        
        let oRe2 = out256[idx + 36];
        let oIm2 = out256[idx + 37];
        let eRe2 = out256[idx + 4];
        let eIm2 = out256[idx + 5];
        let tRe2 = FFT_FAC_256[idx + 2];
        let tRe6 = FFT_FAC_256[idx + 6];
        let resIm2_s = eIm2 + (oRe2 * tRe6 + oIm2 * tRe2);
        out256[idx + 5] = resIm2_s;
        out256[idx + 61] = -resIm2_s;
        let resRe2_s = eRe2 + (oRe2 * tRe2 - oIm2 * tRe6);
        out256[idx + 60] = resRe2_s;
        out256[idx + 4] = resRe2_s;
        let resRe14_s = eRe2 - (oRe2 * tRe2 - oIm2 * tRe6);
        out256[idx + 36] = resRe14_s;
        out256[idx + 28] = resRe14_s;
        let resIm14_s = -eIm2 + (oRe2 * tRe6 + oIm2 * tRe2);
        out256[idx + 29] = resIm14_s;
        out256[idx + 37] = -resIm14_s;
        
        let oRe3 = out256[idx + 38];
        let oIm3 = out256[idx + 39];
        let eRe3 = out256[idx + 6];
        let eIm3 = out256[idx + 7];
        let tRe3 = FFT_FAC_256[idx + 3];
        let tRe5 = FFT_FAC_256[idx + 5];
        let resIm3_s = eIm3 + (oRe3 * tRe5 + oIm3 * tRe3);
        out256[idx + 7] = resIm3_s;
        out256[idx + 59] = -resIm3_s;
        let resRe3_s = eRe3 + (oRe3 * tRe3 - oIm3 * tRe5);
        out256[idx + 58] = resRe3_s;
        out256[idx + 6] = resRe3_s;
        let resRe13_s = eRe3 - (oRe3 * tRe3 - oIm3 * tRe5);
        out256[idx + 38] = resRe13_s;
        out256[idx + 26] = resRe13_s;
        let resIm13_s = -eIm3 + (oRe3 * tRe5 + oIm3 * tRe3);
        out256[idx + 27] = resIm13_s;
        out256[idx + 39] = -resIm13_s;
        
        let oRe4 = out256[idx + 40];
        let oIm4 = out256[idx + 41];
        let eRe4 = out256[idx + 8];
        let eIm4 = out256[idx + 9];
        let tRe4 = FFT_FAC_256[idx + 4];
        let resIm4_s = eIm4 + (oRe4 * tRe4 + oIm4 * tRe4);
        out256[idx + 9] = resIm4_s;
        out256[idx + 57] = -resIm4_s;
        let resRe4_s = eRe4 + (oRe4 * tRe4 - oIm4 * tRe4);
        out256[idx + 56] = resRe4_s;
        out256[idx + 8] = resRe4_s;
        let resRe12_s = eRe4 - (oRe4 * tRe4 - oIm4 * tRe4);
        out256[idx + 40] = resRe12_s;
        out256[idx + 24] = resRe12_s;
        let resIm12_s = -eIm4 + (oRe4 * tRe4 + oIm4 * tRe4);
        out256[idx + 25] = resIm12_s;
        out256[idx + 41] = -resIm12_s;
        
        let oRe5 = out256[idx + 42];
        let oIm5 = out256[idx + 43];
        let eRe5 = out256[idx + 10];
        let eIm5 = out256[idx + 11];
        let resIm5_s = eIm5 + (oRe5 * tRe3 + oIm5 * tRe5);
        out256[idx + 11] = resIm5_s;
        out256[idx + 55] = -resIm5_s;
        let resRe5_s = eRe5 + (oRe5 * tRe5 - oIm5 * tRe3);
        out256[idx + 54] = resRe5_s;
        out256[idx + 10] = resRe5_s;
        let resRe11_s = eRe5 - (oRe5 * tRe5 - oIm5 * tRe3);
        out256[idx + 42] = resRe11_s;
        out256[idx + 22] = resRe11_s;
        let resIm11_s = -eIm5 + (oRe5 * tRe3 + oIm5 * tRe5);
        out256[idx + 23] = resIm11_s;
        out256[idx + 43] = -resIm11_s;
        
        let oRe6 = out256[idx + 44];
        let oIm6 = out256[idx + 45];
        let eRe6 = out256[idx + 12];
        let eIm6 = out256[idx + 13];
        let resIm6_s = eIm6 + (oRe6 * tRe2 + oIm6 * tRe6);
        out256[idx + 13] = resIm6_s;
        out256[idx + 53] = -resIm6_s;
        let resRe6_s = eRe6 + (oRe6 * tRe6 - oIm6 * tRe2);
        out256[idx + 52] = resRe6_s;
        out256[idx + 12] = resRe6_s;
        let resRe10_s = eRe6 - (oRe6 * tRe6 - oIm6 * tRe2);
        out256[idx + 44] = resRe10_s;
        out256[idx + 20] = resRe10_s;
        let resIm10_s = -eIm6 + (oRe6 * tRe2 + oIm6 * tRe6);
        out256[idx + 21] = resIm10_s;
        out256[idx + 45] = -resIm10_s;
        
        let oRe7 = out256[idx + 46];
        let oIm7 = out256[idx + 47];
        let eRe7 = out256[idx + 14];
        let eIm7 = out256[idx + 15];
        let resIm7_s = eIm7 + (oRe7 * tRe1 + oIm7 * tRe7);
        out256[idx + 15] = resIm7_s;
        out256[idx + 51] = -resIm7_s;
        let resRe7_s = eRe7 + (oRe7 * tRe7 - oIm7 * tRe1);
        out256[idx + 50] = resRe7_s;
        out256[idx + 14] = resRe7_s;
        let resRe9_s = eRe7 - (oRe7 * tRe7 - oIm7 * tRe1);
        out256[idx + 46] = resRe9_s;
        out256[idx + 18] = resRe9_s;
        let resIm9_s = -eIm7 + (oRe7 * tRe1 + oIm7 * tRe7);
        out256[idx + 19] = resIm9_s;
        out256[idx + 47] = -resIm9_s;
        
        let oRe8 = out256[idx + 48];
        let oIm8 = out256[idx + 49];
        let eRe8 = out256[idx + 16];
        let eIm8 = out256[idx + 17];
        let resIm8_s = eIm8 + oRe8;
        out256[idx + 17] = resIm8_s;
        out256[idx + 49] = -resIm8_s;
        let resRe8_s = eRe8 - oIm8;
        out256[idx + 48] = resRe8_s;
        out256[idx + 16] = resRe8_s;
        
    } 
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 2 (semi unrolled) - FFT step for SIZE 64 
    ////////////////////////////////////////////////
    for(let idx = 0; idx < 256; idx += 64){ 
        let oRe0 = out256[idx + 64];
        let oIm0 = out256[idx + 65];
        let eRe0 = out256[idx + 0];
        let eIm0 = out256[idx + 1];
        let resRe0_s = eRe0 + oRe0;
        out256[idx] = resRe0_s;
        let resIm0_s = eIm0 + oIm0;
        out256[idx + 1] = resRe0_s;
        let resRe0_d = eRe0 - oRe0;
        out256[idx + 64] = resRe0_d;
        let resIm0_d = eIm0 - oIm0;
        out256[idx + 65] = resIm0_d;
        
        let oRe1 = out256[idx + 66];
        let oIm1 = out256[idx + 67];
        let eRe1 = out256[idx + 2];
        let eIm1 = out256[idx + 3];
        let tRe1 = FFT_FAC_256[idx + 1];
        let tRe15 = FFT_FAC_256[idx + 15];
        let resIm1_s = eIm1 + (oRe1 * tRe15 + oIm1 * tRe1);
        out256[idx + 3] = resIm1_s;
        out256[idx + 127] = -resIm1_s;
        let resRe1_s = eRe1 + (oRe1 * tRe1 - oIm1 * tRe15);
        out256[idx + 126] = resRe1_s;
        out256[idx + 2] = resRe1_s;
        let resRe31_s = eRe1 - (oRe1 * tRe1 - oIm1 * tRe15);
        out256[idx + 66] = resRe31_s;
        out256[idx + 62] = resRe31_s;
        let resIm31_s = -eIm1 + (oRe1 * tRe15 + oIm1 * tRe1);
        out256[idx + 63] = resIm31_s;
        out256[idx + 67] = -resIm31_s;
        
        let oRe2 = out256[idx + 68];
        let oIm2 = out256[idx + 69];
        let eRe2 = out256[idx + 4];
        let eIm2 = out256[idx + 5];
        let tRe2 = FFT_FAC_256[idx + 2];
        let tRe14 = FFT_FAC_256[idx + 14];
        let resIm2_s = eIm2 + (oRe2 * tRe14 + oIm2 * tRe2);
        out256[idx + 5] = resIm2_s;
        out256[idx + 125] = -resIm2_s;
        let resRe2_s = eRe2 + (oRe2 * tRe2 - oIm2 * tRe14);
        out256[idx + 124] = resRe2_s;
        out256[idx + 4] = resRe2_s;
        let resRe30_s = eRe2 - (oRe2 * tRe2 - oIm2 * tRe14);
        out256[idx + 68] = resRe30_s;
        out256[idx + 60] = resRe30_s;
        let resIm30_s = -eIm2 + (oRe2 * tRe14 + oIm2 * tRe2);
        out256[idx + 61] = resIm30_s;
        out256[idx + 69] = -resIm30_s;
        
        let oRe3 = out256[idx + 70];
        let oIm3 = out256[idx + 71];
        let eRe3 = out256[idx + 6];
        let eIm3 = out256[idx + 7];
        let tRe3 = FFT_FAC_256[idx + 3];
        let tRe13 = FFT_FAC_256[idx + 13];
        let resIm3_s = eIm3 + (oRe3 * tRe13 + oIm3 * tRe3);
        out256[idx + 7] = resIm3_s;
        out256[idx + 123] = -resIm3_s;
        let resRe3_s = eRe3 + (oRe3 * tRe3 - oIm3 * tRe13);
        out256[idx + 122] = resRe3_s;
        out256[idx + 6] = resRe3_s;
        let resRe29_s = eRe3 - (oRe3 * tRe3 - oIm3 * tRe13);
        out256[idx + 70] = resRe29_s;
        out256[idx + 58] = resRe29_s;
        let resIm29_s = -eIm3 + (oRe3 * tRe13 + oIm3 * tRe3);
        out256[idx + 59] = resIm29_s;
        out256[idx + 71] = -resIm29_s;
        
        let oRe4 = out256[idx + 72];
        let oIm4 = out256[idx + 73];
        let eRe4 = out256[idx + 8];
        let eIm4 = out256[idx + 9];
        let tRe4 = FFT_FAC_256[idx + 4];
        let tRe12 = FFT_FAC_256[idx + 12];
        let resIm4_s = eIm4 + (oRe4 * tRe12 + oIm4 * tRe4);
        out256[idx + 9] = resIm4_s;
        out256[idx + 121] = -resIm4_s;
        let resRe4_s = eRe4 + (oRe4 * tRe4 - oIm4 * tRe12);
        out256[idx + 120] = resRe4_s;
        out256[idx + 8] = resRe4_s;
        let resRe28_s = eRe4 - (oRe4 * tRe4 - oIm4 * tRe12);
        out256[idx + 72] = resRe28_s;
        out256[idx + 56] = resRe28_s;
        let resIm28_s = -eIm4 + (oRe4 * tRe12 + oIm4 * tRe4);
        out256[idx + 57] = resIm28_s;
        out256[idx + 73] = -resIm28_s;
        
        let oRe5 = out256[idx + 74];
        let oIm5 = out256[idx + 75];
        let eRe5 = out256[idx + 10];
        let eIm5 = out256[idx + 11];
        let tRe5 = FFT_FAC_256[idx + 5];
        let tRe11 = FFT_FAC_256[idx + 11];
        let resIm5_s = eIm5 + (oRe5 * tRe11 + oIm5 * tRe5);
        out256[idx + 11] = resIm5_s;
        out256[idx + 119] = -resIm5_s;
        let resRe5_s = eRe5 + (oRe5 * tRe5 - oIm5 * tRe11);
        out256[idx + 118] = resRe5_s;
        out256[idx + 10] = resRe5_s;
        let resRe27_s = eRe5 - (oRe5 * tRe5 - oIm5 * tRe11);
        out256[idx + 74] = resRe27_s;
        out256[idx + 54] = resRe27_s;
        let resIm27_s = -eIm5 + (oRe5 * tRe11 + oIm5 * tRe5);
        out256[idx + 55] = resIm27_s;
        out256[idx + 75] = -resIm27_s;
        
        let oRe6 = out256[idx + 76];
        let oIm6 = out256[idx + 77];
        let eRe6 = out256[idx + 12];
        let eIm6 = out256[idx + 13];
        let tRe6 = FFT_FAC_256[idx + 6];
        let tRe10 = FFT_FAC_256[idx + 10];
        let resIm6_s = eIm6 + (oRe6 * tRe10 + oIm6 * tRe6);
        out256[idx + 13] = resIm6_s;
        out256[idx + 117] = -resIm6_s;
        let resRe6_s = eRe6 + (oRe6 * tRe6 - oIm6 * tRe10);
        out256[idx + 116] = resRe6_s;
        out256[idx + 12] = resRe6_s;
        let resRe26_s = eRe6 - (oRe6 * tRe6 - oIm6 * tRe10);
        out256[idx + 76] = resRe26_s;
        out256[idx + 52] = resRe26_s;
        let resIm26_s = -eIm6 + (oRe6 * tRe10 + oIm6 * tRe6);
        out256[idx + 53] = resIm26_s;
        out256[idx + 77] = -resIm26_s;
        
        let oRe7 = out256[idx + 78];
        let oIm7 = out256[idx + 79];
        let eRe7 = out256[idx + 14];
        let eIm7 = out256[idx + 15];
        let tRe7 = FFT_FAC_256[idx + 7];
        let tRe9 = FFT_FAC_256[idx + 9];
        let resIm7_s = eIm7 + (oRe7 * tRe9 + oIm7 * tRe7);
        out256[idx + 15] = resIm7_s;
        out256[idx + 115] = -resIm7_s;
        let resRe7_s = eRe7 + (oRe7 * tRe7 - oIm7 * tRe9);
        out256[idx + 114] = resRe7_s;
        out256[idx + 14] = resRe7_s;
        let resRe25_s = eRe7 - (oRe7 * tRe7 - oIm7 * tRe9);
        out256[idx + 78] = resRe25_s;
        out256[idx + 50] = resRe25_s;
        let resIm25_s = -eIm7 + (oRe7 * tRe9 + oIm7 * tRe7);
        out256[idx + 51] = resIm25_s;
        out256[idx + 79] = -resIm25_s;
        
        let oRe8 = out256[idx + 80];
        let oIm8 = out256[idx + 81];
        let eRe8 = out256[idx + 16];
        let eIm8 = out256[idx + 17];
        let tRe8 = FFT_FAC_256[idx + 8];
        let resIm8_s = eIm8 + (oRe8 * tRe8 + oIm8 * tRe8);
        out256[idx + 17] = resIm8_s;
        out256[idx + 113] = -resIm8_s;
        let resRe8_s = eRe8 + (oRe8 * tRe8 - oIm8 * tRe8);
        out256[idx + 112] = resRe8_s;
        out256[idx + 16] = resRe8_s;
        let resRe24_s = eRe8 - (oRe8 * tRe8 - oIm8 * tRe8);
        out256[idx + 80] = resRe24_s;
        out256[idx + 48] = resRe24_s;
        let resIm24_s = -eIm8 + (oRe8 * tRe8 + oIm8 * tRe8);
        out256[idx + 49] = resIm24_s;
        out256[idx + 81] = -resIm24_s;
        
        let oRe9 = out256[idx + 82];
        let oIm9 = out256[idx + 83];
        let eRe9 = out256[idx + 18];
        let eIm9 = out256[idx + 19];
        let resIm9_s = eIm9 + (oRe9 * tRe7 + oIm9 * tRe9);
        out256[idx + 19] = resIm9_s;
        out256[idx + 111] = -resIm9_s;
        let resRe9_s = eRe9 + (oRe9 * tRe9 - oIm9 * tRe7);
        out256[idx + 110] = resRe9_s;
        out256[idx + 18] = resRe9_s;
        let resRe23_s = eRe9 - (oRe9 * tRe9 - oIm9 * tRe7);
        out256[idx + 82] = resRe23_s;
        out256[idx + 46] = resRe23_s;
        let resIm23_s = -eIm9 + (oRe9 * tRe7 + oIm9 * tRe9);
        out256[idx + 47] = resIm23_s;
        out256[idx + 83] = -resIm23_s;
        
        let oRe10 = out256[idx + 84];
        let oIm10 = out256[idx + 85];
        let eRe10 = out256[idx + 20];
        let eIm10 = out256[idx + 21];
        let resIm10_s = eIm10 + (oRe10 * tRe6 + oIm10 * tRe10);
        out256[idx + 21] = resIm10_s;
        out256[idx + 109] = -resIm10_s;
        let resRe10_s = eRe10 + (oRe10 * tRe10 - oIm10 * tRe6);
        out256[idx + 108] = resRe10_s;
        out256[idx + 20] = resRe10_s;
        let resRe22_s = eRe10 - (oRe10 * tRe10 - oIm10 * tRe6);
        out256[idx + 84] = resRe22_s;
        out256[idx + 44] = resRe22_s;
        let resIm22_s = -eIm10 + (oRe10 * tRe6 + oIm10 * tRe10);
        out256[idx + 45] = resIm22_s;
        out256[idx + 85] = -resIm22_s;
        
        let oRe11 = out256[idx + 86];
        let oIm11 = out256[idx + 87];
        let eRe11 = out256[idx + 22];
        let eIm11 = out256[idx + 23];
        let resIm11_s = eIm11 + (oRe11 * tRe5 + oIm11 * tRe11);
        out256[idx + 23] = resIm11_s;
        out256[idx + 107] = -resIm11_s;
        let resRe11_s = eRe11 + (oRe11 * tRe11 - oIm11 * tRe5);
        out256[idx + 106] = resRe11_s;
        out256[idx + 22] = resRe11_s;
        let resRe21_s = eRe11 - (oRe11 * tRe11 - oIm11 * tRe5);
        out256[idx + 86] = resRe21_s;
        out256[idx + 42] = resRe21_s;
        let resIm21_s = -eIm11 + (oRe11 * tRe5 + oIm11 * tRe11);
        out256[idx + 43] = resIm21_s;
        out256[idx + 87] = -resIm21_s;
        
        let oRe12 = out256[idx + 88];
        let oIm12 = out256[idx + 89];
        let eRe12 = out256[idx + 24];
        let eIm12 = out256[idx + 25];
        let resIm12_s = eIm12 + (oRe12 * tRe4 + oIm12 * tRe12);
        out256[idx + 25] = resIm12_s;
        out256[idx + 105] = -resIm12_s;
        let resRe12_s = eRe12 + (oRe12 * tRe12 - oIm12 * tRe4);
        out256[idx + 104] = resRe12_s;
        out256[idx + 24] = resRe12_s;
        let resRe20_s = eRe12 - (oRe12 * tRe12 - oIm12 * tRe4);
        out256[idx + 88] = resRe20_s;
        out256[idx + 40] = resRe20_s;
        let resIm20_s = -eIm12 + (oRe12 * tRe4 + oIm12 * tRe12);
        out256[idx + 41] = resIm20_s;
        out256[idx + 89] = -resIm20_s;
        
        let oRe13 = out256[idx + 90];
        let oIm13 = out256[idx + 91];
        let eRe13 = out256[idx + 26];
        let eIm13 = out256[idx + 27];
        let resIm13_s = eIm13 + (oRe13 * tRe3 + oIm13 * tRe13);
        out256[idx + 27] = resIm13_s;
        out256[idx + 103] = -resIm13_s;
        let resRe13_s = eRe13 + (oRe13 * tRe13 - oIm13 * tRe3);
        out256[idx + 102] = resRe13_s;
        out256[idx + 26] = resRe13_s;
        let resRe19_s = eRe13 - (oRe13 * tRe13 - oIm13 * tRe3);
        out256[idx + 90] = resRe19_s;
        out256[idx + 38] = resRe19_s;
        let resIm19_s = -eIm13 + (oRe13 * tRe3 + oIm13 * tRe13);
        out256[idx + 39] = resIm19_s;
        out256[idx + 91] = -resIm19_s;
        
        let oRe14 = out256[idx + 92];
        let oIm14 = out256[idx + 93];
        let eRe14 = out256[idx + 28];
        let eIm14 = out256[idx + 29];
        let resIm14_s = eIm14 + (oRe14 * tRe2 + oIm14 * tRe14);
        out256[idx + 29] = resIm14_s;
        out256[idx + 101] = -resIm14_s;
        let resRe14_s = eRe14 + (oRe14 * tRe14 - oIm14 * tRe2);
        out256[idx + 100] = resRe14_s;
        out256[idx + 28] = resRe14_s;
        let resRe18_s = eRe14 - (oRe14 * tRe14 - oIm14 * tRe2);
        out256[idx + 92] = resRe18_s;
        out256[idx + 36] = resRe18_s;
        let resIm18_s = -eIm14 + (oRe14 * tRe2 + oIm14 * tRe14);
        out256[idx + 37] = resIm18_s;
        out256[idx + 93] = -resIm18_s;
        
        let oRe15 = out256[idx + 94];
        let oIm15 = out256[idx + 95];
        let eRe15 = out256[idx + 30];
        let eIm15 = out256[idx + 31];
        let resIm15_s = eIm15 + (oRe15 * tRe1 + oIm15 * tRe15);
        out256[idx + 31] = resIm15_s;
        out256[idx + 99] = -resIm15_s;
        let resRe15_s = eRe15 + (oRe15 * tRe15 - oIm15 * tRe1);
        out256[idx + 98] = resRe15_s;
        out256[idx + 30] = resRe15_s;
        let resRe17_s = eRe15 - (oRe15 * tRe15 - oIm15 * tRe1);
        out256[idx + 94] = resRe17_s;
        out256[idx + 34] = resRe17_s;
        let resIm17_s = -eIm15 + (oRe15 * tRe1 + oIm15 * tRe15);
        out256[idx + 35] = resIm17_s;
        out256[idx + 95] = -resIm17_s;
        
        let oRe16 = out256[idx + 96];
        let oIm16 = out256[idx + 97];
        let eRe16 = out256[idx + 32];
        let eIm16 = out256[idx + 33];
        let resIm16_s = eIm16 + oRe16;
        out256[idx + 33] = resIm16_s;
        out256[idx + 97] = -resIm16_s;
        let resRe16_s = eRe16 - oIm16;
        out256[idx + 96] = resRe16_s;
        out256[idx + 32] = resRe16_s;
        
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
             out256[eI * 2    ] =  out256[256 - eI * 2    ];
             out256[eI * 2 + 1] = -out256[256 - eI * 2 + 1];
             out256[oI * 2    ] =  out256[256 - oI * 2    ];
             out256[oI * 2 + 1] = -out256[256 - oI * 2 + 1];
             continue;
         } 
         let eRe  = out256[eI * 2    ];
         let eIm  = out256[eI * 2 + 1];
         let oRe  = out256[oI * 2    ];
         let oIm  = out256[oI * 2 + 1];
         let tRe  = FFT_FAC_256[j * 2 + 0];
         let tIm  = FFT_FAC_256[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out256[eI * 2    ] = eRe + t_oRe;
         out256[eI * 2 + 1] = eIm + t_oIm;
         out256[oI * 2    ] = eRe - t_oRe;
         out256[oI * 2 + 1] = eIm - t_oIm;
     }
     for (let j = 0; j < 64; j++) { 
         let eI = 128 + j;
         let oI = 128 + j + 64;
         if(j > 32){
             out256[eI * 2    ] =  out256[256 - eI * 2    ];
             out256[eI * 2 + 1] = -out256[256 - eI * 2 + 1];
             out256[oI * 2    ] =  out256[256 - oI * 2    ];
             out256[oI * 2 + 1] = -out256[256 - oI * 2 + 1];
             continue;
         } 
         let eRe  = out256[eI * 2    ];
         let eIm  = out256[eI * 2 + 1];
         let oRe  = out256[oI * 2    ];
         let oIm  = out256[oI * 2 + 1];
         let tRe  = FFT_FAC_256[j * 2 + 0];
         let tIm  = FFT_FAC_256[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out256[eI * 2    ] = eRe + t_oRe;
         out256[eI * 2 + 1] = eIm + t_oIm;
         out256[oI * 2    ] = eRe - t_oRe;
         out256[oI * 2 + 1] = eIm - t_oIm;
     }
    } 
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 2 (rolled) - FFT step for SIZE 256 
    ////////////////////////////////////////////////
    { 
     for (let j = 0; j < 128; j++) { 
         let eI = 0 + j;
         let oI = 0 + j + 128;
         if(j > 64){
             out256[eI * 2    ] =  out256[512 - eI * 2    ];
             out256[eI * 2 + 1] = -out256[512 - eI * 2 + 1];
             out256[oI * 2    ] =  out256[512 - oI * 2    ];
             out256[oI * 2 + 1] = -out256[512 - oI * 2 + 1];
             continue;
         } 
         let eRe  = out256[eI * 2    ];
         let eIm  = out256[eI * 2 + 1];
         let oRe  = out256[oI * 2    ];
         let oIm  = out256[oI * 2 + 1];
         let tRe  = FFT_FAC_256[j * 2 + 0];
         let tIm  = FFT_FAC_256[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out256[eI * 2    ] = eRe + t_oRe;
         out256[eI * 2 + 1] = eIm + t_oIm;
         out256[oI * 2    ] = eRe - t_oRe;
         out256[oI * 2 + 1] = eIm - t_oIm;
     }
    } 

    return out256;
} 

export {fftReal256}; 

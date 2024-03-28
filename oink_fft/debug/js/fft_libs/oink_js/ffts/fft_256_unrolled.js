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
    // RADIX 4 - FFT step for SIZE 16/32 
    ////////////////////////////////////////////////

    for (let idx = 0; idx < 512; idx += 32) {
        let x0aRe = out256[idx     ];
        let x0bRe = out256[idx +  2];
        let x0bIm = out256[idx +  3];
        let x0cRe = out256[idx +  4];

        let x1aRe = out256[idx +  8];
        out256[idx +   8] = x0aRe - x1aRe;
        let x1bRe = out256[idx + 10];
        let x1bIm = out256[idx + 11];
        let x1cRe = out256[idx + 12];

        let x2aRe = out256[idx + 16];
        let x2bRe = out256[idx + 18];
        let x2bIm = out256[idx + 19];
        let x2cRe = out256[idx + 20];

        let x3aRe = out256[idx + 24];
        out256[idx +  24] = x0aRe - x1aRe;
        out256[idx +  25] = x3aRe - x2aRe;
        let x3bRe = out256[idx + 26];
        let x3bIm = out256[idx + 27];
        let x3cRe = out256[idx + 28];
        out256[idx      ] = x0aRe + x1aRe + x2aRe + x3aRe;
        out256[idx +   9] = x2aRe - x3aRe;
        out256[idx +  16] = x0aRe + x1aRe - x2aRe - x3aRe;

        let t1Re_2c = 0.7071067690849304;

        let x2cRe_tRe_2c = x2cRe * t1Re_2c;
        let x3cRe_tRe_2c = x3cRe * t1Re_2c;

        let resReC1 = x0cRe + x2cRe_tRe_2c - x3cRe_tRe_2c;
        out256[idx +  28] =   resReC1;
        out256[idx +   4] =   resReC1;
        let resImC1 = x1cRe + x2cRe_tRe_2c + x3cRe_tRe_2c;
        out256[idx +   5] =   resImC1;
        out256[idx +  29] = - resImC1;
        let resReC2 = x0cRe - x2cRe_tRe_2c + x3cRe_tRe_2c;
        out256[idx +  20] =   resReC2;
        out256[idx +  12] =   resReC2;
        let resImC2 = x1cRe - x2cRe_tRe_2c - x3cRe_tRe_2c;
        out256[idx +  13] = - resImC2;
        out256[idx +  21] =   resImC2;

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
        out256[idx +   2] =   resReB1;
        out256[idx +  30] =   resReB1;
        let resReB2 = x0bRe  + x1dif_tRe_1b - tempReB;
        out256[idx +  18] =   resReB2;
        out256[idx +  14] =   resReB2;
        let resReD1 = x0bRe  - x1dif_tRe_1b - tempReD;
        out256[idx +   6] =   resReD1;
        out256[idx +  26] =   resReD1;
        let resReD2 = x0bRe  - x1dif_tRe_1b + tempReD;
        out256[idx +  22] =   resReD2;
        out256[idx +  10] =   resReD2;

        let resImB1 = x0bIm  + x1sum_tRe_1b + tempImB;
        out256[idx +   3] =   resImB1;
        out256[idx +  31] = - resImB1;
        let resImB2 = x0bIm  + x1sum_tRe_1b - tempImB;
        out256[idx +  19] =   resImB2;
        out256[idx +  15] = - resImB2;
        let resImD1 =-x0bIm  + x1sum_tRe_1b - tempImD;
        out256[idx +   7] =   resImD1;
        out256[idx +  27] = - resImD1;
        let resImD2 =-x0bIm  + x1sum_tRe_1b + tempImD;
        out256[idx +  23] =   resImD2;
        out256[idx +  11] = - resImD2;
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 2 (unrolled) - FFT step for SIZE 64 
    ////////////////////////////////////////////////
    { 
        let oRe0 = out256[64];
        let oIm0 = out256[65];
        let eRe0 = out256[0];
        let eIm0 = out256[1];
        let resRe0_s = eRe0 + oRe0;
        out256[0] = resRe0_s;
        let resIm0_s = eIm0 + oIm0;
        out256[1] = resIm0_s;
        let resRe0_d = eRe0 - oRe0;
        out256[64] = resRe0_d;
        let resIm0_d = eIm0 - oIm0;
        out256[65] = resIm0_d;
        
        let oRe1 = out256[66];
        let oIm1 = out256[67];
        let eRe1 = out256[2];
        let eIm1 = out256[3];
        let tRe1 = 0.9951847195625305;
        let tRe15 = 0.0980171337723732;
        let resIm1_s = eIm1 + (oRe1 * tRe15 + oIm1 * tRe1);
        out256[3] = resIm1_s;
        out256[127] = -resIm1_s;
        let resRe1_s = eRe1 + (oRe1 * tRe1 - oIm1 * tRe15);
        out256[126] = resRe1_s;
        out256[2] = resRe1_s;
        let resRe31_s = eRe1 - (oRe1 * tRe1 - oIm1 * tRe15);
        out256[66] = resRe31_s;
        out256[62] = resRe31_s;
        let resIm31_s = -eIm1 + (oRe1 * tRe15 + oIm1 * tRe1);
        out256[63] = resIm31_s;
        out256[67] = -resIm31_s;
        
        let oRe2 = out256[68];
        let oIm2 = out256[69];
        let eRe2 = out256[4];
        let eIm2 = out256[5];
        let tRe2 = 0.9807852506637573;
        let tRe14 = 0.1950903534889221;
        let resIm2_s = eIm2 + (oRe2 * tRe14 + oIm2 * tRe2);
        out256[5] = resIm2_s;
        out256[125] = -resIm2_s;
        let resRe2_s = eRe2 + (oRe2 * tRe2 - oIm2 * tRe14);
        out256[124] = resRe2_s;
        out256[4] = resRe2_s;
        let resRe30_s = eRe2 - (oRe2 * tRe2 - oIm2 * tRe14);
        out256[68] = resRe30_s;
        out256[60] = resRe30_s;
        let resIm30_s = -eIm2 + (oRe2 * tRe14 + oIm2 * tRe2);
        out256[61] = resIm30_s;
        out256[69] = -resIm30_s;
        
        let oRe3 = out256[70];
        let oIm3 = out256[71];
        let eRe3 = out256[6];
        let eIm3 = out256[7];
        let tRe3 = 0.9569403529167175;
        let tRe13 = 0.2902846336364746;
        let resIm3_s = eIm3 + (oRe3 * tRe13 + oIm3 * tRe3);
        out256[7] = resIm3_s;
        out256[123] = -resIm3_s;
        let resRe3_s = eRe3 + (oRe3 * tRe3 - oIm3 * tRe13);
        out256[122] = resRe3_s;
        out256[6] = resRe3_s;
        let resRe29_s = eRe3 - (oRe3 * tRe3 - oIm3 * tRe13);
        out256[70] = resRe29_s;
        out256[58] = resRe29_s;
        let resIm29_s = -eIm3 + (oRe3 * tRe13 + oIm3 * tRe3);
        out256[59] = resIm29_s;
        out256[71] = -resIm29_s;
        
        let oRe4 = out256[72];
        let oIm4 = out256[73];
        let eRe4 = out256[8];
        let eIm4 = out256[9];
        let tRe4 = 0.9238795042037964;
        let tRe12 = 0.3826834261417389;
        let resIm4_s = eIm4 + (oRe4 * tRe12 + oIm4 * tRe4);
        out256[9] = resIm4_s;
        out256[121] = -resIm4_s;
        let resRe4_s = eRe4 + (oRe4 * tRe4 - oIm4 * tRe12);
        out256[120] = resRe4_s;
        out256[8] = resRe4_s;
        let resRe28_s = eRe4 - (oRe4 * tRe4 - oIm4 * tRe12);
        out256[72] = resRe28_s;
        out256[56] = resRe28_s;
        let resIm28_s = -eIm4 + (oRe4 * tRe12 + oIm4 * tRe4);
        out256[57] = resIm28_s;
        out256[73] = -resIm28_s;
        
        let oRe5 = out256[74];
        let oIm5 = out256[75];
        let eRe5 = out256[10];
        let eIm5 = out256[11];
        let tRe5 = 0.8819212913513184;
        let tRe11 = 0.4713967740535736;
        let resIm5_s = eIm5 + (oRe5 * tRe11 + oIm5 * tRe5);
        out256[11] = resIm5_s;
        out256[119] = -resIm5_s;
        let resRe5_s = eRe5 + (oRe5 * tRe5 - oIm5 * tRe11);
        out256[118] = resRe5_s;
        out256[10] = resRe5_s;
        let resRe27_s = eRe5 - (oRe5 * tRe5 - oIm5 * tRe11);
        out256[74] = resRe27_s;
        out256[54] = resRe27_s;
        let resIm27_s = -eIm5 + (oRe5 * tRe11 + oIm5 * tRe5);
        out256[55] = resIm27_s;
        out256[75] = -resIm27_s;
        
        let oRe6 = out256[76];
        let oIm6 = out256[77];
        let eRe6 = out256[12];
        let eIm6 = out256[13];
        let tRe6 = 0.8314695954322815;
        let tRe10 = 0.5555702447891235;
        let resIm6_s = eIm6 + (oRe6 * tRe10 + oIm6 * tRe6);
        out256[13] = resIm6_s;
        out256[117] = -resIm6_s;
        let resRe6_s = eRe6 + (oRe6 * tRe6 - oIm6 * tRe10);
        out256[116] = resRe6_s;
        out256[12] = resRe6_s;
        let resRe26_s = eRe6 - (oRe6 * tRe6 - oIm6 * tRe10);
        out256[76] = resRe26_s;
        out256[52] = resRe26_s;
        let resIm26_s = -eIm6 + (oRe6 * tRe10 + oIm6 * tRe6);
        out256[53] = resIm26_s;
        out256[77] = -resIm26_s;
        
        let oRe7 = out256[78];
        let oIm7 = out256[79];
        let eRe7 = out256[14];
        let eIm7 = out256[15];
        let tRe7 = 0.7730104923248291;
        let tRe9 = 0.6343932747840881;
        let resIm7_s = eIm7 + (oRe7 * tRe9 + oIm7 * tRe7);
        out256[15] = resIm7_s;
        out256[115] = -resIm7_s;
        let resRe7_s = eRe7 + (oRe7 * tRe7 - oIm7 * tRe9);
        out256[114] = resRe7_s;
        out256[14] = resRe7_s;
        let resRe25_s = eRe7 - (oRe7 * tRe7 - oIm7 * tRe9);
        out256[78] = resRe25_s;
        out256[50] = resRe25_s;
        let resIm25_s = -eIm7 + (oRe7 * tRe9 + oIm7 * tRe7);
        out256[51] = resIm25_s;
        out256[79] = -resIm25_s;
        
        let oRe8 = out256[80];
        let oIm8 = out256[81];
        let eRe8 = out256[16];
        let eIm8 = out256[17];
        let tRe8 = 0.7071067690849304;
        let resIm8_s = eIm8 + (oRe8 * tRe8 + oIm8 * tRe8);
        out256[17] = resIm8_s;
        out256[113] = -resIm8_s;
        let resRe8_s = eRe8 + (oRe8 * tRe8 - oIm8 * tRe8);
        out256[112] = resRe8_s;
        out256[16] = resRe8_s;
        let resRe24_s = eRe8 - (oRe8 * tRe8 - oIm8 * tRe8);
        out256[80] = resRe24_s;
        out256[48] = resRe24_s;
        let resIm24_s = -eIm8 + (oRe8 * tRe8 + oIm8 * tRe8);
        out256[49] = resIm24_s;
        out256[81] = -resIm24_s;
        
        let oRe9 = out256[82];
        let oIm9 = out256[83];
        let eRe9 = out256[18];
        let eIm9 = out256[19];
        let resIm9_s = eIm9 + (oRe9 * tRe7 + oIm9 * tRe9);
        out256[19] = resIm9_s;
        out256[111] = -resIm9_s;
        let resRe9_s = eRe9 + (oRe9 * tRe9 - oIm9 * tRe7);
        out256[110] = resRe9_s;
        out256[18] = resRe9_s;
        let resRe23_s = eRe9 - (oRe9 * tRe9 - oIm9 * tRe7);
        out256[82] = resRe23_s;
        out256[46] = resRe23_s;
        let resIm23_s = -eIm9 + (oRe9 * tRe7 + oIm9 * tRe9);
        out256[47] = resIm23_s;
        out256[83] = -resIm23_s;
        
        let oRe10 = out256[84];
        let oIm10 = out256[85];
        let eRe10 = out256[20];
        let eIm10 = out256[21];
        let resIm10_s = eIm10 + (oRe10 * tRe6 + oIm10 * tRe10);
        out256[21] = resIm10_s;
        out256[109] = -resIm10_s;
        let resRe10_s = eRe10 + (oRe10 * tRe10 - oIm10 * tRe6);
        out256[108] = resRe10_s;
        out256[20] = resRe10_s;
        let resRe22_s = eRe10 - (oRe10 * tRe10 - oIm10 * tRe6);
        out256[84] = resRe22_s;
        out256[44] = resRe22_s;
        let resIm22_s = -eIm10 + (oRe10 * tRe6 + oIm10 * tRe10);
        out256[45] = resIm22_s;
        out256[85] = -resIm22_s;
        
        let oRe11 = out256[86];
        let oIm11 = out256[87];
        let eRe11 = out256[22];
        let eIm11 = out256[23];
        let resIm11_s = eIm11 + (oRe11 * tRe5 + oIm11 * tRe11);
        out256[23] = resIm11_s;
        out256[107] = -resIm11_s;
        let resRe11_s = eRe11 + (oRe11 * tRe11 - oIm11 * tRe5);
        out256[106] = resRe11_s;
        out256[22] = resRe11_s;
        let resRe21_s = eRe11 - (oRe11 * tRe11 - oIm11 * tRe5);
        out256[86] = resRe21_s;
        out256[42] = resRe21_s;
        let resIm21_s = -eIm11 + (oRe11 * tRe5 + oIm11 * tRe11);
        out256[43] = resIm21_s;
        out256[87] = -resIm21_s;
        
        let oRe12 = out256[88];
        let oIm12 = out256[89];
        let eRe12 = out256[24];
        let eIm12 = out256[25];
        let resIm12_s = eIm12 + (oRe12 * tRe4 + oIm12 * tRe12);
        out256[25] = resIm12_s;
        out256[105] = -resIm12_s;
        let resRe12_s = eRe12 + (oRe12 * tRe12 - oIm12 * tRe4);
        out256[104] = resRe12_s;
        out256[24] = resRe12_s;
        let resRe20_s = eRe12 - (oRe12 * tRe12 - oIm12 * tRe4);
        out256[88] = resRe20_s;
        out256[40] = resRe20_s;
        let resIm20_s = -eIm12 + (oRe12 * tRe4 + oIm12 * tRe12);
        out256[41] = resIm20_s;
        out256[89] = -resIm20_s;
        
        let oRe13 = out256[90];
        let oIm13 = out256[91];
        let eRe13 = out256[26];
        let eIm13 = out256[27];
        let resIm13_s = eIm13 + (oRe13 * tRe3 + oIm13 * tRe13);
        out256[27] = resIm13_s;
        out256[103] = -resIm13_s;
        let resRe13_s = eRe13 + (oRe13 * tRe13 - oIm13 * tRe3);
        out256[102] = resRe13_s;
        out256[26] = resRe13_s;
        let resRe19_s = eRe13 - (oRe13 * tRe13 - oIm13 * tRe3);
        out256[90] = resRe19_s;
        out256[38] = resRe19_s;
        let resIm19_s = -eIm13 + (oRe13 * tRe3 + oIm13 * tRe13);
        out256[39] = resIm19_s;
        out256[91] = -resIm19_s;
        
        let oRe14 = out256[92];
        let oIm14 = out256[93];
        let eRe14 = out256[28];
        let eIm14 = out256[29];
        let resIm14_s = eIm14 + (oRe14 * tRe2 + oIm14 * tRe14);
        out256[29] = resIm14_s;
        out256[101] = -resIm14_s;
        let resRe14_s = eRe14 + (oRe14 * tRe14 - oIm14 * tRe2);
        out256[100] = resRe14_s;
        out256[28] = resRe14_s;
        let resRe18_s = eRe14 - (oRe14 * tRe14 - oIm14 * tRe2);
        out256[92] = resRe18_s;
        out256[36] = resRe18_s;
        let resIm18_s = -eIm14 + (oRe14 * tRe2 + oIm14 * tRe14);
        out256[37] = resIm18_s;
        out256[93] = -resIm18_s;
        
        let oRe15 = out256[94];
        let oIm15 = out256[95];
        let eRe15 = out256[30];
        let eIm15 = out256[31];
        let resIm15_s = eIm15 + (oRe15 * tRe1 + oIm15 * tRe15);
        out256[31] = resIm15_s;
        out256[99] = -resIm15_s;
        let resRe15_s = eRe15 + (oRe15 * tRe15 - oIm15 * tRe1);
        out256[98] = resRe15_s;
        out256[30] = resRe15_s;
        let resRe17_s = eRe15 - (oRe15 * tRe15 - oIm15 * tRe1);
        out256[94] = resRe17_s;
        out256[34] = resRe17_s;
        let resIm17_s = -eIm15 + (oRe15 * tRe1 + oIm15 * tRe15);
        out256[35] = resIm17_s;
        out256[95] = -resIm17_s;
        
        let oRe16 = out256[96];
        let oIm16 = out256[97];
        let eRe16 = out256[32];
        let eIm16 = out256[33];
        let resIm16_s = eIm16 + oRe16;
        out256[33] = resIm16_s;
        out256[97] = -resIm16_s;
        let resRe16_s = eRe16 - oIm16;
        out256[96] = resRe16_s;
        out256[32] = resRe16_s;
        
        let oRe128 = out256[192];
        let oIm128 = out256[193];
        let eRe128 = out256[128];
        let eIm128 = out256[129];
        let resRe128_s = eRe128 + oRe128;
        out256[128] = resRe128_s;
        let resIm128_s = eIm128 + oIm128;
        out256[129] = resIm128_s;
        let resRe128_d = eRe128 - oRe128;
        out256[192] = resRe128_d;
        let resIm128_d = eIm128 - oIm128;
        out256[193] = resIm128_d;
        
        let oRe129 = out256[194];
        let oIm129 = out256[195];
        let eRe129 = out256[130];
        let eIm129 = out256[131];
        let tRe129 = 0.9951847195625305;
        let tRe143 = 0.0980171337723732;
        let resIm129_s = eIm129 + (oRe129 * tRe143 + oIm129 * tRe129);
        out256[131] = resIm129_s;
        out256[255] = -resIm129_s;
        let resRe129_s = eRe129 + (oRe129 * tRe129 - oIm129 * tRe143);
        out256[254] = resRe129_s;
        out256[130] = resRe129_s;
        let resRe159_s = eRe129 - (oRe129 * tRe129 - oIm129 * tRe143);
        out256[194] = resRe159_s;
        out256[190] = resRe159_s;
        let resIm159_s = -eIm129 + (oRe129 * tRe143 + oIm129 * tRe129);
        out256[191] = resIm159_s;
        out256[195] = -resIm159_s;
        
        let oRe130 = out256[196];
        let oIm130 = out256[197];
        let eRe130 = out256[132];
        let eIm130 = out256[133];
        let tRe130 = 0.9807852506637573;
        let tRe142 = 0.1950903534889221;
        let resIm130_s = eIm130 + (oRe130 * tRe142 + oIm130 * tRe130);
        out256[133] = resIm130_s;
        out256[253] = -resIm130_s;
        let resRe130_s = eRe130 + (oRe130 * tRe130 - oIm130 * tRe142);
        out256[252] = resRe130_s;
        out256[132] = resRe130_s;
        let resRe158_s = eRe130 - (oRe130 * tRe130 - oIm130 * tRe142);
        out256[196] = resRe158_s;
        out256[188] = resRe158_s;
        let resIm158_s = -eIm130 + (oRe130 * tRe142 + oIm130 * tRe130);
        out256[189] = resIm158_s;
        out256[197] = -resIm158_s;
        
        let oRe131 = out256[198];
        let oIm131 = out256[199];
        let eRe131 = out256[134];
        let eIm131 = out256[135];
        let tRe131 = 0.9569403529167175;
        let tRe141 = 0.2902846336364746;
        let resIm131_s = eIm131 + (oRe131 * tRe141 + oIm131 * tRe131);
        out256[135] = resIm131_s;
        out256[251] = -resIm131_s;
        let resRe131_s = eRe131 + (oRe131 * tRe131 - oIm131 * tRe141);
        out256[250] = resRe131_s;
        out256[134] = resRe131_s;
        let resRe157_s = eRe131 - (oRe131 * tRe131 - oIm131 * tRe141);
        out256[198] = resRe157_s;
        out256[186] = resRe157_s;
        let resIm157_s = -eIm131 + (oRe131 * tRe141 + oIm131 * tRe131);
        out256[187] = resIm157_s;
        out256[199] = -resIm157_s;
        
        let oRe132 = out256[200];
        let oIm132 = out256[201];
        let eRe132 = out256[136];
        let eIm132 = out256[137];
        let tRe132 = 0.9238795042037964;
        let tRe140 = 0.3826834261417389;
        let resIm132_s = eIm132 + (oRe132 * tRe140 + oIm132 * tRe132);
        out256[137] = resIm132_s;
        out256[249] = -resIm132_s;
        let resRe132_s = eRe132 + (oRe132 * tRe132 - oIm132 * tRe140);
        out256[248] = resRe132_s;
        out256[136] = resRe132_s;
        let resRe156_s = eRe132 - (oRe132 * tRe132 - oIm132 * tRe140);
        out256[200] = resRe156_s;
        out256[184] = resRe156_s;
        let resIm156_s = -eIm132 + (oRe132 * tRe140 + oIm132 * tRe132);
        out256[185] = resIm156_s;
        out256[201] = -resIm156_s;
        
        let oRe133 = out256[202];
        let oIm133 = out256[203];
        let eRe133 = out256[138];
        let eIm133 = out256[139];
        let tRe133 = 0.8819212913513184;
        let tRe139 = 0.4713967740535736;
        let resIm133_s = eIm133 + (oRe133 * tRe139 + oIm133 * tRe133);
        out256[139] = resIm133_s;
        out256[247] = -resIm133_s;
        let resRe133_s = eRe133 + (oRe133 * tRe133 - oIm133 * tRe139);
        out256[246] = resRe133_s;
        out256[138] = resRe133_s;
        let resRe155_s = eRe133 - (oRe133 * tRe133 - oIm133 * tRe139);
        out256[202] = resRe155_s;
        out256[182] = resRe155_s;
        let resIm155_s = -eIm133 + (oRe133 * tRe139 + oIm133 * tRe133);
        out256[183] = resIm155_s;
        out256[203] = -resIm155_s;
        
        let oRe134 = out256[204];
        let oIm134 = out256[205];
        let eRe134 = out256[140];
        let eIm134 = out256[141];
        let tRe134 = 0.8314695954322815;
        let tRe138 = 0.5555702447891235;
        let resIm134_s = eIm134 + (oRe134 * tRe138 + oIm134 * tRe134);
        out256[141] = resIm134_s;
        out256[245] = -resIm134_s;
        let resRe134_s = eRe134 + (oRe134 * tRe134 - oIm134 * tRe138);
        out256[244] = resRe134_s;
        out256[140] = resRe134_s;
        let resRe154_s = eRe134 - (oRe134 * tRe134 - oIm134 * tRe138);
        out256[204] = resRe154_s;
        out256[180] = resRe154_s;
        let resIm154_s = -eIm134 + (oRe134 * tRe138 + oIm134 * tRe134);
        out256[181] = resIm154_s;
        out256[205] = -resIm154_s;
        
        let oRe135 = out256[206];
        let oIm135 = out256[207];
        let eRe135 = out256[142];
        let eIm135 = out256[143];
        let tRe135 = 0.7730104923248291;
        let tRe137 = 0.6343932747840881;
        let resIm135_s = eIm135 + (oRe135 * tRe137 + oIm135 * tRe135);
        out256[143] = resIm135_s;
        out256[243] = -resIm135_s;
        let resRe135_s = eRe135 + (oRe135 * tRe135 - oIm135 * tRe137);
        out256[242] = resRe135_s;
        out256[142] = resRe135_s;
        let resRe153_s = eRe135 - (oRe135 * tRe135 - oIm135 * tRe137);
        out256[206] = resRe153_s;
        out256[178] = resRe153_s;
        let resIm153_s = -eIm135 + (oRe135 * tRe137 + oIm135 * tRe135);
        out256[179] = resIm153_s;
        out256[207] = -resIm153_s;
        
        let oRe136 = out256[208];
        let oIm136 = out256[209];
        let eRe136 = out256[144];
        let eIm136 = out256[145];
        let tRe136 = 0.7071067690849304;
        let resIm136_s = eIm136 + (oRe136 * tRe136 + oIm136 * tRe136);
        out256[145] = resIm136_s;
        out256[241] = -resIm136_s;
        let resRe136_s = eRe136 + (oRe136 * tRe136 - oIm136 * tRe136);
        out256[240] = resRe136_s;
        out256[144] = resRe136_s;
        let resRe152_s = eRe136 - (oRe136 * tRe136 - oIm136 * tRe136);
        out256[208] = resRe152_s;
        out256[176] = resRe152_s;
        let resIm152_s = -eIm136 + (oRe136 * tRe136 + oIm136 * tRe136);
        out256[177] = resIm152_s;
        out256[209] = -resIm152_s;
        
        let oRe137 = out256[210];
        let oIm137 = out256[211];
        let eRe137 = out256[146];
        let eIm137 = out256[147];
        let resIm137_s = eIm137 + (oRe137 * tRe135 + oIm137 * tRe137);
        out256[147] = resIm137_s;
        out256[239] = -resIm137_s;
        let resRe137_s = eRe137 + (oRe137 * tRe137 - oIm137 * tRe135);
        out256[238] = resRe137_s;
        out256[146] = resRe137_s;
        let resRe151_s = eRe137 - (oRe137 * tRe137 - oIm137 * tRe135);
        out256[210] = resRe151_s;
        out256[174] = resRe151_s;
        let resIm151_s = -eIm137 + (oRe137 * tRe135 + oIm137 * tRe137);
        out256[175] = resIm151_s;
        out256[211] = -resIm151_s;
        
        let oRe138 = out256[212];
        let oIm138 = out256[213];
        let eRe138 = out256[148];
        let eIm138 = out256[149];
        let resIm138_s = eIm138 + (oRe138 * tRe134 + oIm138 * tRe138);
        out256[149] = resIm138_s;
        out256[237] = -resIm138_s;
        let resRe138_s = eRe138 + (oRe138 * tRe138 - oIm138 * tRe134);
        out256[236] = resRe138_s;
        out256[148] = resRe138_s;
        let resRe150_s = eRe138 - (oRe138 * tRe138 - oIm138 * tRe134);
        out256[212] = resRe150_s;
        out256[172] = resRe150_s;
        let resIm150_s = -eIm138 + (oRe138 * tRe134 + oIm138 * tRe138);
        out256[173] = resIm150_s;
        out256[213] = -resIm150_s;
        
        let oRe139 = out256[214];
        let oIm139 = out256[215];
        let eRe139 = out256[150];
        let eIm139 = out256[151];
        let resIm139_s = eIm139 + (oRe139 * tRe133 + oIm139 * tRe139);
        out256[151] = resIm139_s;
        out256[235] = -resIm139_s;
        let resRe139_s = eRe139 + (oRe139 * tRe139 - oIm139 * tRe133);
        out256[234] = resRe139_s;
        out256[150] = resRe139_s;
        let resRe149_s = eRe139 - (oRe139 * tRe139 - oIm139 * tRe133);
        out256[214] = resRe149_s;
        out256[170] = resRe149_s;
        let resIm149_s = -eIm139 + (oRe139 * tRe133 + oIm139 * tRe139);
        out256[171] = resIm149_s;
        out256[215] = -resIm149_s;
        
        let oRe140 = out256[216];
        let oIm140 = out256[217];
        let eRe140 = out256[152];
        let eIm140 = out256[153];
        let resIm140_s = eIm140 + (oRe140 * tRe132 + oIm140 * tRe140);
        out256[153] = resIm140_s;
        out256[233] = -resIm140_s;
        let resRe140_s = eRe140 + (oRe140 * tRe140 - oIm140 * tRe132);
        out256[232] = resRe140_s;
        out256[152] = resRe140_s;
        let resRe148_s = eRe140 - (oRe140 * tRe140 - oIm140 * tRe132);
        out256[216] = resRe148_s;
        out256[168] = resRe148_s;
        let resIm148_s = -eIm140 + (oRe140 * tRe132 + oIm140 * tRe140);
        out256[169] = resIm148_s;
        out256[217] = -resIm148_s;
        
        let oRe141 = out256[218];
        let oIm141 = out256[219];
        let eRe141 = out256[154];
        let eIm141 = out256[155];
        let resIm141_s = eIm141 + (oRe141 * tRe131 + oIm141 * tRe141);
        out256[155] = resIm141_s;
        out256[231] = -resIm141_s;
        let resRe141_s = eRe141 + (oRe141 * tRe141 - oIm141 * tRe131);
        out256[230] = resRe141_s;
        out256[154] = resRe141_s;
        let resRe147_s = eRe141 - (oRe141 * tRe141 - oIm141 * tRe131);
        out256[218] = resRe147_s;
        out256[166] = resRe147_s;
        let resIm147_s = -eIm141 + (oRe141 * tRe131 + oIm141 * tRe141);
        out256[167] = resIm147_s;
        out256[219] = -resIm147_s;
        
        let oRe142 = out256[220];
        let oIm142 = out256[221];
        let eRe142 = out256[156];
        let eIm142 = out256[157];
        let resIm142_s = eIm142 + (oRe142 * tRe130 + oIm142 * tRe142);
        out256[157] = resIm142_s;
        out256[229] = -resIm142_s;
        let resRe142_s = eRe142 + (oRe142 * tRe142 - oIm142 * tRe130);
        out256[228] = resRe142_s;
        out256[156] = resRe142_s;
        let resRe146_s = eRe142 - (oRe142 * tRe142 - oIm142 * tRe130);
        out256[220] = resRe146_s;
        out256[164] = resRe146_s;
        let resIm146_s = -eIm142 + (oRe142 * tRe130 + oIm142 * tRe142);
        out256[165] = resIm146_s;
        out256[221] = -resIm146_s;
        
        let oRe143 = out256[222];
        let oIm143 = out256[223];
        let eRe143 = out256[158];
        let eIm143 = out256[159];
        let resIm143_s = eIm143 + (oRe143 * tRe129 + oIm143 * tRe143);
        out256[159] = resIm143_s;
        out256[227] = -resIm143_s;
        let resRe143_s = eRe143 + (oRe143 * tRe143 - oIm143 * tRe129);
        out256[226] = resRe143_s;
        out256[158] = resRe143_s;
        let resRe145_s = eRe143 - (oRe143 * tRe143 - oIm143 * tRe129);
        out256[222] = resRe145_s;
        out256[162] = resRe145_s;
        let resIm145_s = -eIm143 + (oRe143 * tRe129 + oIm143 * tRe143);
        out256[163] = resIm145_s;
        out256[223] = -resIm145_s;
        
        let oRe144 = out256[224];
        let oIm144 = out256[225];
        let eRe144 = out256[160];
        let eIm144 = out256[161];
        let resIm144_s = eIm144 + oRe144;
        out256[161] = resIm144_s;
        out256[225] = -resIm144_s;
        let resRe144_s = eRe144 - oIm144;
        out256[224] = resRe144_s;
        out256[160] = resRe144_s;
        
        let oRe256 = out256[320];
        let oIm256 = out256[321];
        let eRe256 = out256[256];
        let eIm256 = out256[257];
        let resRe256_s = eRe256 + oRe256;
        out256[256] = resRe256_s;
        let resIm256_s = eIm256 + oIm256;
        out256[257] = resIm256_s;
        let resRe256_d = eRe256 - oRe256;
        out256[320] = resRe256_d;
        let resIm256_d = eIm256 - oIm256;
        out256[321] = resIm256_d;
        
        let oRe257 = out256[322];
        let oIm257 = out256[323];
        let eRe257 = out256[258];
        let eIm257 = out256[259];
        let tRe257 = 0.9951847195625305;
        let tRe271 = 0.0980171337723732;
        let resIm257_s = eIm257 + (oRe257 * tRe271 + oIm257 * tRe257);
        out256[259] = resIm257_s;
        out256[383] = -resIm257_s;
        let resRe257_s = eRe257 + (oRe257 * tRe257 - oIm257 * tRe271);
        out256[382] = resRe257_s;
        out256[258] = resRe257_s;
        let resRe287_s = eRe257 - (oRe257 * tRe257 - oIm257 * tRe271);
        out256[322] = resRe287_s;
        out256[318] = resRe287_s;
        let resIm287_s = -eIm257 + (oRe257 * tRe271 + oIm257 * tRe257);
        out256[319] = resIm287_s;
        out256[323] = -resIm287_s;
        
        let oRe258 = out256[324];
        let oIm258 = out256[325];
        let eRe258 = out256[260];
        let eIm258 = out256[261];
        let tRe258 = 0.9807852506637573;
        let tRe270 = 0.1950903534889221;
        let resIm258_s = eIm258 + (oRe258 * tRe270 + oIm258 * tRe258);
        out256[261] = resIm258_s;
        out256[381] = -resIm258_s;
        let resRe258_s = eRe258 + (oRe258 * tRe258 - oIm258 * tRe270);
        out256[380] = resRe258_s;
        out256[260] = resRe258_s;
        let resRe286_s = eRe258 - (oRe258 * tRe258 - oIm258 * tRe270);
        out256[324] = resRe286_s;
        out256[316] = resRe286_s;
        let resIm286_s = -eIm258 + (oRe258 * tRe270 + oIm258 * tRe258);
        out256[317] = resIm286_s;
        out256[325] = -resIm286_s;
        
        let oRe259 = out256[326];
        let oIm259 = out256[327];
        let eRe259 = out256[262];
        let eIm259 = out256[263];
        let tRe259 = 0.9569403529167175;
        let tRe269 = 0.2902846336364746;
        let resIm259_s = eIm259 + (oRe259 * tRe269 + oIm259 * tRe259);
        out256[263] = resIm259_s;
        out256[379] = -resIm259_s;
        let resRe259_s = eRe259 + (oRe259 * tRe259 - oIm259 * tRe269);
        out256[378] = resRe259_s;
        out256[262] = resRe259_s;
        let resRe285_s = eRe259 - (oRe259 * tRe259 - oIm259 * tRe269);
        out256[326] = resRe285_s;
        out256[314] = resRe285_s;
        let resIm285_s = -eIm259 + (oRe259 * tRe269 + oIm259 * tRe259);
        out256[315] = resIm285_s;
        out256[327] = -resIm285_s;
        
        let oRe260 = out256[328];
        let oIm260 = out256[329];
        let eRe260 = out256[264];
        let eIm260 = out256[265];
        let tRe260 = 0.9238795042037964;
        let tRe268 = 0.3826834261417389;
        let resIm260_s = eIm260 + (oRe260 * tRe268 + oIm260 * tRe260);
        out256[265] = resIm260_s;
        out256[377] = -resIm260_s;
        let resRe260_s = eRe260 + (oRe260 * tRe260 - oIm260 * tRe268);
        out256[376] = resRe260_s;
        out256[264] = resRe260_s;
        let resRe284_s = eRe260 - (oRe260 * tRe260 - oIm260 * tRe268);
        out256[328] = resRe284_s;
        out256[312] = resRe284_s;
        let resIm284_s = -eIm260 + (oRe260 * tRe268 + oIm260 * tRe260);
        out256[313] = resIm284_s;
        out256[329] = -resIm284_s;
        
        let oRe261 = out256[330];
        let oIm261 = out256[331];
        let eRe261 = out256[266];
        let eIm261 = out256[267];
        let tRe261 = 0.8819212913513184;
        let tRe267 = 0.4713967740535736;
        let resIm261_s = eIm261 + (oRe261 * tRe267 + oIm261 * tRe261);
        out256[267] = resIm261_s;
        out256[375] = -resIm261_s;
        let resRe261_s = eRe261 + (oRe261 * tRe261 - oIm261 * tRe267);
        out256[374] = resRe261_s;
        out256[266] = resRe261_s;
        let resRe283_s = eRe261 - (oRe261 * tRe261 - oIm261 * tRe267);
        out256[330] = resRe283_s;
        out256[310] = resRe283_s;
        let resIm283_s = -eIm261 + (oRe261 * tRe267 + oIm261 * tRe261);
        out256[311] = resIm283_s;
        out256[331] = -resIm283_s;
        
        let oRe262 = out256[332];
        let oIm262 = out256[333];
        let eRe262 = out256[268];
        let eIm262 = out256[269];
        let tRe262 = 0.8314695954322815;
        let tRe266 = 0.5555702447891235;
        let resIm262_s = eIm262 + (oRe262 * tRe266 + oIm262 * tRe262);
        out256[269] = resIm262_s;
        out256[373] = -resIm262_s;
        let resRe262_s = eRe262 + (oRe262 * tRe262 - oIm262 * tRe266);
        out256[372] = resRe262_s;
        out256[268] = resRe262_s;
        let resRe282_s = eRe262 - (oRe262 * tRe262 - oIm262 * tRe266);
        out256[332] = resRe282_s;
        out256[308] = resRe282_s;
        let resIm282_s = -eIm262 + (oRe262 * tRe266 + oIm262 * tRe262);
        out256[309] = resIm282_s;
        out256[333] = -resIm282_s;
        
        let oRe263 = out256[334];
        let oIm263 = out256[335];
        let eRe263 = out256[270];
        let eIm263 = out256[271];
        let tRe263 = 0.7730104923248291;
        let tRe265 = 0.6343932747840881;
        let resIm263_s = eIm263 + (oRe263 * tRe265 + oIm263 * tRe263);
        out256[271] = resIm263_s;
        out256[371] = -resIm263_s;
        let resRe263_s = eRe263 + (oRe263 * tRe263 - oIm263 * tRe265);
        out256[370] = resRe263_s;
        out256[270] = resRe263_s;
        let resRe281_s = eRe263 - (oRe263 * tRe263 - oIm263 * tRe265);
        out256[334] = resRe281_s;
        out256[306] = resRe281_s;
        let resIm281_s = -eIm263 + (oRe263 * tRe265 + oIm263 * tRe263);
        out256[307] = resIm281_s;
        out256[335] = -resIm281_s;
        
        let oRe264 = out256[336];
        let oIm264 = out256[337];
        let eRe264 = out256[272];
        let eIm264 = out256[273];
        let tRe264 = 0.7071067690849304;
        let resIm264_s = eIm264 + (oRe264 * tRe264 + oIm264 * tRe264);
        out256[273] = resIm264_s;
        out256[369] = -resIm264_s;
        let resRe264_s = eRe264 + (oRe264 * tRe264 - oIm264 * tRe264);
        out256[368] = resRe264_s;
        out256[272] = resRe264_s;
        let resRe280_s = eRe264 - (oRe264 * tRe264 - oIm264 * tRe264);
        out256[336] = resRe280_s;
        out256[304] = resRe280_s;
        let resIm280_s = -eIm264 + (oRe264 * tRe264 + oIm264 * tRe264);
        out256[305] = resIm280_s;
        out256[337] = -resIm280_s;
        
        let oRe265 = out256[338];
        let oIm265 = out256[339];
        let eRe265 = out256[274];
        let eIm265 = out256[275];
        let resIm265_s = eIm265 + (oRe265 * tRe263 + oIm265 * tRe265);
        out256[275] = resIm265_s;
        out256[367] = -resIm265_s;
        let resRe265_s = eRe265 + (oRe265 * tRe265 - oIm265 * tRe263);
        out256[366] = resRe265_s;
        out256[274] = resRe265_s;
        let resRe279_s = eRe265 - (oRe265 * tRe265 - oIm265 * tRe263);
        out256[338] = resRe279_s;
        out256[302] = resRe279_s;
        let resIm279_s = -eIm265 + (oRe265 * tRe263 + oIm265 * tRe265);
        out256[303] = resIm279_s;
        out256[339] = -resIm279_s;
        
        let oRe266 = out256[340];
        let oIm266 = out256[341];
        let eRe266 = out256[276];
        let eIm266 = out256[277];
        let resIm266_s = eIm266 + (oRe266 * tRe262 + oIm266 * tRe266);
        out256[277] = resIm266_s;
        out256[365] = -resIm266_s;
        let resRe266_s = eRe266 + (oRe266 * tRe266 - oIm266 * tRe262);
        out256[364] = resRe266_s;
        out256[276] = resRe266_s;
        let resRe278_s = eRe266 - (oRe266 * tRe266 - oIm266 * tRe262);
        out256[340] = resRe278_s;
        out256[300] = resRe278_s;
        let resIm278_s = -eIm266 + (oRe266 * tRe262 + oIm266 * tRe266);
        out256[301] = resIm278_s;
        out256[341] = -resIm278_s;
        
        let oRe267 = out256[342];
        let oIm267 = out256[343];
        let eRe267 = out256[278];
        let eIm267 = out256[279];
        let resIm267_s = eIm267 + (oRe267 * tRe261 + oIm267 * tRe267);
        out256[279] = resIm267_s;
        out256[363] = -resIm267_s;
        let resRe267_s = eRe267 + (oRe267 * tRe267 - oIm267 * tRe261);
        out256[362] = resRe267_s;
        out256[278] = resRe267_s;
        let resRe277_s = eRe267 - (oRe267 * tRe267 - oIm267 * tRe261);
        out256[342] = resRe277_s;
        out256[298] = resRe277_s;
        let resIm277_s = -eIm267 + (oRe267 * tRe261 + oIm267 * tRe267);
        out256[299] = resIm277_s;
        out256[343] = -resIm277_s;
        
        let oRe268 = out256[344];
        let oIm268 = out256[345];
        let eRe268 = out256[280];
        let eIm268 = out256[281];
        let resIm268_s = eIm268 + (oRe268 * tRe260 + oIm268 * tRe268);
        out256[281] = resIm268_s;
        out256[361] = -resIm268_s;
        let resRe268_s = eRe268 + (oRe268 * tRe268 - oIm268 * tRe260);
        out256[360] = resRe268_s;
        out256[280] = resRe268_s;
        let resRe276_s = eRe268 - (oRe268 * tRe268 - oIm268 * tRe260);
        out256[344] = resRe276_s;
        out256[296] = resRe276_s;
        let resIm276_s = -eIm268 + (oRe268 * tRe260 + oIm268 * tRe268);
        out256[297] = resIm276_s;
        out256[345] = -resIm276_s;
        
        let oRe269 = out256[346];
        let oIm269 = out256[347];
        let eRe269 = out256[282];
        let eIm269 = out256[283];
        let resIm269_s = eIm269 + (oRe269 * tRe259 + oIm269 * tRe269);
        out256[283] = resIm269_s;
        out256[359] = -resIm269_s;
        let resRe269_s = eRe269 + (oRe269 * tRe269 - oIm269 * tRe259);
        out256[358] = resRe269_s;
        out256[282] = resRe269_s;
        let resRe275_s = eRe269 - (oRe269 * tRe269 - oIm269 * tRe259);
        out256[346] = resRe275_s;
        out256[294] = resRe275_s;
        let resIm275_s = -eIm269 + (oRe269 * tRe259 + oIm269 * tRe269);
        out256[295] = resIm275_s;
        out256[347] = -resIm275_s;
        
        let oRe270 = out256[348];
        let oIm270 = out256[349];
        let eRe270 = out256[284];
        let eIm270 = out256[285];
        let resIm270_s = eIm270 + (oRe270 * tRe258 + oIm270 * tRe270);
        out256[285] = resIm270_s;
        out256[357] = -resIm270_s;
        let resRe270_s = eRe270 + (oRe270 * tRe270 - oIm270 * tRe258);
        out256[356] = resRe270_s;
        out256[284] = resRe270_s;
        let resRe274_s = eRe270 - (oRe270 * tRe270 - oIm270 * tRe258);
        out256[348] = resRe274_s;
        out256[292] = resRe274_s;
        let resIm274_s = -eIm270 + (oRe270 * tRe258 + oIm270 * tRe270);
        out256[293] = resIm274_s;
        out256[349] = -resIm274_s;
        
        let oRe271 = out256[350];
        let oIm271 = out256[351];
        let eRe271 = out256[286];
        let eIm271 = out256[287];
        let resIm271_s = eIm271 + (oRe271 * tRe257 + oIm271 * tRe271);
        out256[287] = resIm271_s;
        out256[355] = -resIm271_s;
        let resRe271_s = eRe271 + (oRe271 * tRe271 - oIm271 * tRe257);
        out256[354] = resRe271_s;
        out256[286] = resRe271_s;
        let resRe273_s = eRe271 - (oRe271 * tRe271 - oIm271 * tRe257);
        out256[350] = resRe273_s;
        out256[290] = resRe273_s;
        let resIm273_s = -eIm271 + (oRe271 * tRe257 + oIm271 * tRe271);
        out256[291] = resIm273_s;
        out256[351] = -resIm273_s;
        
        let oRe272 = out256[352];
        let oIm272 = out256[353];
        let eRe272 = out256[288];
        let eIm272 = out256[289];
        let resIm272_s = eIm272 + oRe272;
        out256[289] = resIm272_s;
        out256[353] = -resIm272_s;
        let resRe272_s = eRe272 - oIm272;
        out256[352] = resRe272_s;
        out256[288] = resRe272_s;
        
        let oRe384 = out256[448];
        let oIm384 = out256[449];
        let eRe384 = out256[384];
        let eIm384 = out256[385];
        let resRe384_s = eRe384 + oRe384;
        out256[384] = resRe384_s;
        let resIm384_s = eIm384 + oIm384;
        out256[385] = resIm384_s;
        let resRe384_d = eRe384 - oRe384;
        out256[448] = resRe384_d;
        let resIm384_d = eIm384 - oIm384;
        out256[449] = resIm384_d;
        
        let oRe385 = out256[450];
        let oIm385 = out256[451];
        let eRe385 = out256[386];
        let eIm385 = out256[387];
        let tRe385 = 0.9951847195625305;
        let tRe399 = 0.0980171337723732;
        let resIm385_s = eIm385 + (oRe385 * tRe399 + oIm385 * tRe385);
        out256[387] = resIm385_s;
        out256[511] = -resIm385_s;
        let resRe385_s = eRe385 + (oRe385 * tRe385 - oIm385 * tRe399);
        out256[510] = resRe385_s;
        out256[386] = resRe385_s;
        let resRe415_s = eRe385 - (oRe385 * tRe385 - oIm385 * tRe399);
        out256[450] = resRe415_s;
        out256[446] = resRe415_s;
        let resIm415_s = -eIm385 + (oRe385 * tRe399 + oIm385 * tRe385);
        out256[447] = resIm415_s;
        out256[451] = -resIm415_s;
        
        let oRe386 = out256[452];
        let oIm386 = out256[453];
        let eRe386 = out256[388];
        let eIm386 = out256[389];
        let tRe386 = 0.9807852506637573;
        let tRe398 = 0.1950903534889221;
        let resIm386_s = eIm386 + (oRe386 * tRe398 + oIm386 * tRe386);
        out256[389] = resIm386_s;
        out256[509] = -resIm386_s;
        let resRe386_s = eRe386 + (oRe386 * tRe386 - oIm386 * tRe398);
        out256[508] = resRe386_s;
        out256[388] = resRe386_s;
        let resRe414_s = eRe386 - (oRe386 * tRe386 - oIm386 * tRe398);
        out256[452] = resRe414_s;
        out256[444] = resRe414_s;
        let resIm414_s = -eIm386 + (oRe386 * tRe398 + oIm386 * tRe386);
        out256[445] = resIm414_s;
        out256[453] = -resIm414_s;
        
        let oRe387 = out256[454];
        let oIm387 = out256[455];
        let eRe387 = out256[390];
        let eIm387 = out256[391];
        let tRe387 = 0.9569403529167175;
        let tRe397 = 0.2902846336364746;
        let resIm387_s = eIm387 + (oRe387 * tRe397 + oIm387 * tRe387);
        out256[391] = resIm387_s;
        out256[507] = -resIm387_s;
        let resRe387_s = eRe387 + (oRe387 * tRe387 - oIm387 * tRe397);
        out256[506] = resRe387_s;
        out256[390] = resRe387_s;
        let resRe413_s = eRe387 - (oRe387 * tRe387 - oIm387 * tRe397);
        out256[454] = resRe413_s;
        out256[442] = resRe413_s;
        let resIm413_s = -eIm387 + (oRe387 * tRe397 + oIm387 * tRe387);
        out256[443] = resIm413_s;
        out256[455] = -resIm413_s;
        
        let oRe388 = out256[456];
        let oIm388 = out256[457];
        let eRe388 = out256[392];
        let eIm388 = out256[393];
        let tRe388 = 0.9238795042037964;
        let tRe396 = 0.3826834261417389;
        let resIm388_s = eIm388 + (oRe388 * tRe396 + oIm388 * tRe388);
        out256[393] = resIm388_s;
        out256[505] = -resIm388_s;
        let resRe388_s = eRe388 + (oRe388 * tRe388 - oIm388 * tRe396);
        out256[504] = resRe388_s;
        out256[392] = resRe388_s;
        let resRe412_s = eRe388 - (oRe388 * tRe388 - oIm388 * tRe396);
        out256[456] = resRe412_s;
        out256[440] = resRe412_s;
        let resIm412_s = -eIm388 + (oRe388 * tRe396 + oIm388 * tRe388);
        out256[441] = resIm412_s;
        out256[457] = -resIm412_s;
        
        let oRe389 = out256[458];
        let oIm389 = out256[459];
        let eRe389 = out256[394];
        let eIm389 = out256[395];
        let tRe389 = 0.8819212913513184;
        let tRe395 = 0.4713967740535736;
        let resIm389_s = eIm389 + (oRe389 * tRe395 + oIm389 * tRe389);
        out256[395] = resIm389_s;
        out256[503] = -resIm389_s;
        let resRe389_s = eRe389 + (oRe389 * tRe389 - oIm389 * tRe395);
        out256[502] = resRe389_s;
        out256[394] = resRe389_s;
        let resRe411_s = eRe389 - (oRe389 * tRe389 - oIm389 * tRe395);
        out256[458] = resRe411_s;
        out256[438] = resRe411_s;
        let resIm411_s = -eIm389 + (oRe389 * tRe395 + oIm389 * tRe389);
        out256[439] = resIm411_s;
        out256[459] = -resIm411_s;
        
        let oRe390 = out256[460];
        let oIm390 = out256[461];
        let eRe390 = out256[396];
        let eIm390 = out256[397];
        let tRe390 = 0.8314695954322815;
        let tRe394 = 0.5555702447891235;
        let resIm390_s = eIm390 + (oRe390 * tRe394 + oIm390 * tRe390);
        out256[397] = resIm390_s;
        out256[501] = -resIm390_s;
        let resRe390_s = eRe390 + (oRe390 * tRe390 - oIm390 * tRe394);
        out256[500] = resRe390_s;
        out256[396] = resRe390_s;
        let resRe410_s = eRe390 - (oRe390 * tRe390 - oIm390 * tRe394);
        out256[460] = resRe410_s;
        out256[436] = resRe410_s;
        let resIm410_s = -eIm390 + (oRe390 * tRe394 + oIm390 * tRe390);
        out256[437] = resIm410_s;
        out256[461] = -resIm410_s;
        
        let oRe391 = out256[462];
        let oIm391 = out256[463];
        let eRe391 = out256[398];
        let eIm391 = out256[399];
        let tRe391 = 0.7730104923248291;
        let tRe393 = 0.6343932747840881;
        let resIm391_s = eIm391 + (oRe391 * tRe393 + oIm391 * tRe391);
        out256[399] = resIm391_s;
        out256[499] = -resIm391_s;
        let resRe391_s = eRe391 + (oRe391 * tRe391 - oIm391 * tRe393);
        out256[498] = resRe391_s;
        out256[398] = resRe391_s;
        let resRe409_s = eRe391 - (oRe391 * tRe391 - oIm391 * tRe393);
        out256[462] = resRe409_s;
        out256[434] = resRe409_s;
        let resIm409_s = -eIm391 + (oRe391 * tRe393 + oIm391 * tRe391);
        out256[435] = resIm409_s;
        out256[463] = -resIm409_s;
        
        let oRe392 = out256[464];
        let oIm392 = out256[465];
        let eRe392 = out256[400];
        let eIm392 = out256[401];
        let tRe392 = 0.7071067690849304;
        let resIm392_s = eIm392 + (oRe392 * tRe392 + oIm392 * tRe392);
        out256[401] = resIm392_s;
        out256[497] = -resIm392_s;
        let resRe392_s = eRe392 + (oRe392 * tRe392 - oIm392 * tRe392);
        out256[496] = resRe392_s;
        out256[400] = resRe392_s;
        let resRe408_s = eRe392 - (oRe392 * tRe392 - oIm392 * tRe392);
        out256[464] = resRe408_s;
        out256[432] = resRe408_s;
        let resIm408_s = -eIm392 + (oRe392 * tRe392 + oIm392 * tRe392);
        out256[433] = resIm408_s;
        out256[465] = -resIm408_s;
        
        let oRe393 = out256[466];
        let oIm393 = out256[467];
        let eRe393 = out256[402];
        let eIm393 = out256[403];
        let resIm393_s = eIm393 + (oRe393 * tRe391 + oIm393 * tRe393);
        out256[403] = resIm393_s;
        out256[495] = -resIm393_s;
        let resRe393_s = eRe393 + (oRe393 * tRe393 - oIm393 * tRe391);
        out256[494] = resRe393_s;
        out256[402] = resRe393_s;
        let resRe407_s = eRe393 - (oRe393 * tRe393 - oIm393 * tRe391);
        out256[466] = resRe407_s;
        out256[430] = resRe407_s;
        let resIm407_s = -eIm393 + (oRe393 * tRe391 + oIm393 * tRe393);
        out256[431] = resIm407_s;
        out256[467] = -resIm407_s;
        
        let oRe394 = out256[468];
        let oIm394 = out256[469];
        let eRe394 = out256[404];
        let eIm394 = out256[405];
        let resIm394_s = eIm394 + (oRe394 * tRe390 + oIm394 * tRe394);
        out256[405] = resIm394_s;
        out256[493] = -resIm394_s;
        let resRe394_s = eRe394 + (oRe394 * tRe394 - oIm394 * tRe390);
        out256[492] = resRe394_s;
        out256[404] = resRe394_s;
        let resRe406_s = eRe394 - (oRe394 * tRe394 - oIm394 * tRe390);
        out256[468] = resRe406_s;
        out256[428] = resRe406_s;
        let resIm406_s = -eIm394 + (oRe394 * tRe390 + oIm394 * tRe394);
        out256[429] = resIm406_s;
        out256[469] = -resIm406_s;
        
        let oRe395 = out256[470];
        let oIm395 = out256[471];
        let eRe395 = out256[406];
        let eIm395 = out256[407];
        let resIm395_s = eIm395 + (oRe395 * tRe389 + oIm395 * tRe395);
        out256[407] = resIm395_s;
        out256[491] = -resIm395_s;
        let resRe395_s = eRe395 + (oRe395 * tRe395 - oIm395 * tRe389);
        out256[490] = resRe395_s;
        out256[406] = resRe395_s;
        let resRe405_s = eRe395 - (oRe395 * tRe395 - oIm395 * tRe389);
        out256[470] = resRe405_s;
        out256[426] = resRe405_s;
        let resIm405_s = -eIm395 + (oRe395 * tRe389 + oIm395 * tRe395);
        out256[427] = resIm405_s;
        out256[471] = -resIm405_s;
        
        let oRe396 = out256[472];
        let oIm396 = out256[473];
        let eRe396 = out256[408];
        let eIm396 = out256[409];
        let resIm396_s = eIm396 + (oRe396 * tRe388 + oIm396 * tRe396);
        out256[409] = resIm396_s;
        out256[489] = -resIm396_s;
        let resRe396_s = eRe396 + (oRe396 * tRe396 - oIm396 * tRe388);
        out256[488] = resRe396_s;
        out256[408] = resRe396_s;
        let resRe404_s = eRe396 - (oRe396 * tRe396 - oIm396 * tRe388);
        out256[472] = resRe404_s;
        out256[424] = resRe404_s;
        let resIm404_s = -eIm396 + (oRe396 * tRe388 + oIm396 * tRe396);
        out256[425] = resIm404_s;
        out256[473] = -resIm404_s;
        
        let oRe397 = out256[474];
        let oIm397 = out256[475];
        let eRe397 = out256[410];
        let eIm397 = out256[411];
        let resIm397_s = eIm397 + (oRe397 * tRe387 + oIm397 * tRe397);
        out256[411] = resIm397_s;
        out256[487] = -resIm397_s;
        let resRe397_s = eRe397 + (oRe397 * tRe397 - oIm397 * tRe387);
        out256[486] = resRe397_s;
        out256[410] = resRe397_s;
        let resRe403_s = eRe397 - (oRe397 * tRe397 - oIm397 * tRe387);
        out256[474] = resRe403_s;
        out256[422] = resRe403_s;
        let resIm403_s = -eIm397 + (oRe397 * tRe387 + oIm397 * tRe397);
        out256[423] = resIm403_s;
        out256[475] = -resIm403_s;
        
        let oRe398 = out256[476];
        let oIm398 = out256[477];
        let eRe398 = out256[412];
        let eIm398 = out256[413];
        let resIm398_s = eIm398 + (oRe398 * tRe386 + oIm398 * tRe398);
        out256[413] = resIm398_s;
        out256[485] = -resIm398_s;
        let resRe398_s = eRe398 + (oRe398 * tRe398 - oIm398 * tRe386);
        out256[484] = resRe398_s;
        out256[412] = resRe398_s;
        let resRe402_s = eRe398 - (oRe398 * tRe398 - oIm398 * tRe386);
        out256[476] = resRe402_s;
        out256[420] = resRe402_s;
        let resIm402_s = -eIm398 + (oRe398 * tRe386 + oIm398 * tRe398);
        out256[421] = resIm402_s;
        out256[477] = -resIm402_s;
        
        let oRe399 = out256[478];
        let oIm399 = out256[479];
        let eRe399 = out256[414];
        let eIm399 = out256[415];
        let resIm399_s = eIm399 + (oRe399 * tRe385 + oIm399 * tRe399);
        out256[415] = resIm399_s;
        out256[483] = -resIm399_s;
        let resRe399_s = eRe399 + (oRe399 * tRe399 - oIm399 * tRe385);
        out256[482] = resRe399_s;
        out256[414] = resRe399_s;
        let resRe401_s = eRe399 - (oRe399 * tRe399 - oIm399 * tRe385);
        out256[478] = resRe401_s;
        out256[418] = resRe401_s;
        let resIm401_s = -eIm399 + (oRe399 * tRe385 + oIm399 * tRe399);
        out256[419] = resIm401_s;
        out256[479] = -resIm401_s;
        
        let oRe400 = out256[480];
        let oIm400 = out256[481];
        let eRe400 = out256[416];
        let eIm400 = out256[417];
        let resIm400_s = eIm400 + oRe400;
        out256[417] = resIm400_s;
        out256[481] = -resIm400_s;
        let resRe400_s = eRe400 - oIm400;
        out256[480] = resRe400_s;
        out256[416] = resRe400_s;
        
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

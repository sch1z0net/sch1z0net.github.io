let FFT_FAC_64 = new Float32Array([
1.0000000000000000,0.0000000000000000,0.9951847195625305,0.0980171412229538,0.9807852506637573,0.1950903236865997,0.9569403529167175,0.2902846634387970,
0.9238795042037964,0.3826834559440613,0.8819212913513184,0.4713967144489288,0.8314695954322815,0.5555702447891235,0.7730104923248291,0.6343932747840881,
0.7071067690849304,0.7071067690849304,0.6343932747840881,0.7730104327201843,0.5555702447891235,0.8314695954322815,0.4713967740535736,0.8819212317466736,
0.3826834261417389,0.9238795042037964,0.2902846336364746,0.9569403529167175,0.1950903534889221,0.9807852506637573,0.0980171337723732,0.9951847195625305,
-0.0000000437113883,1.0000000000000000,-0.0980171039700508,0.9951847195625305,-0.1950903236865997,0.9807852506637573,-0.2902847230434418,0.9569402933120728,
-0.3826833963394165,0.9238795638084412,-0.4713966250419617,0.8819212913513184,-0.5555701851844788,0.8314696550369263,-0.6343932747840881,0.7730104923248291,
-0.7071067690849304,0.7071067690849304,-0.7730104923248291,0.6343932747840881,-0.8314696550369263,0.5555701851844788,-0.8819212317466736,0.4713968336582184,
-0.9238795042037964,0.3826834857463837,-0.9569403529167175,0.2902847230434418,-0.9807853102684021,0.1950903087854385,-0.9951847195625305,0.0980170965194702
]);
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

        let t1Re_2c = 0.9238795042037964;

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

        let t1Re_1b = 0.9238795042037964;

        let x1dif_tRe_1b = x1dif * t1Re_1b;
        let x1sum_tRe_1b = x1sum * t1Re_1b;

        let t1Re_1b2b = 0.0000000000000000;
        let t1Re_1b2d = 0.3535534143447876;

        let x3dif_tRe_1b2b = x3dif * t1Re_1b2b;
        let x3dif_tRe_1b2d = x3dif * t1Re_1b2d;
        let x3sum_tRe_1b2b = x3sum * t1Re_1b2b;
        let x3sum_tRe_1b2d = x3sum * t1Re_1b2d;

        let t1Re_2b = 0.0000000000000000;
        let t1Re_2d = 0.3826834559440613;

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
    // RADIX 2 (rolled) - FFT step for SIZE 64 
    ////////////////////////////////////////////////
    { 
     for (let j = 0; j < 32; j++) { 
         let eI = 0 + j;
         let oI = 0 + j + 32;
         let eRe  = out256[eI * 2    ];
         let eIm  = out256[eI * 2 + 1];
         let oRe  = out256[oI * 2    ];
         let oIm  = out256[oI * 2 + 1];
         let tRe  = FFT_FAC_64[j * 2 + 0];
         let tIm  = FFT_FAC_64[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out256[eI * 2    ] = eRe + t_oRe;
         out256[eI * 2 + 1] = eIm + t_oIm;
         out256[oI * 2    ] = eRe - t_oRe;
         out256[oI * 2 + 1] = eIm - t_oIm;
     }
     for (let j = 0; j < 32; j++) { 
         let eI = 64 + j;
         let oI = 64 + j + 32;
         let eRe  = out256[eI * 2    ];
         let eIm  = out256[eI * 2 + 1];
         let oRe  = out256[oI * 2    ];
         let oIm  = out256[oI * 2 + 1];
         let tRe  = FFT_FAC_64[j * 2 + 0];
         let tIm  = FFT_FAC_64[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out256[eI * 2    ] = eRe + t_oRe;
         out256[eI * 2 + 1] = eIm + t_oIm;
         out256[oI * 2    ] = eRe - t_oRe;
         out256[oI * 2 + 1] = eIm - t_oIm;
     }
     for (let j = 0; j < 32; j++) { 
         let eI = 128 + j;
         let oI = 128 + j + 32;
         let eRe  = out256[eI * 2    ];
         let eIm  = out256[eI * 2 + 1];
         let oRe  = out256[oI * 2    ];
         let oIm  = out256[oI * 2 + 1];
         let tRe  = FFT_FAC_64[j * 2 + 0];
         let tIm  = FFT_FAC_64[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out256[eI * 2    ] = eRe + t_oRe;
         out256[eI * 2 + 1] = eIm + t_oIm;
         out256[oI * 2    ] = eRe - t_oRe;
         out256[oI * 2 + 1] = eIm - t_oIm;
     }
     for (let j = 0; j < 32; j++) { 
         let eI = 192 + j;
         let oI = 192 + j + 32;
         let eRe  = out256[eI * 2    ];
         let eIm  = out256[eI * 2 + 1];
         let oRe  = out256[oI * 2    ];
         let oIm  = out256[oI * 2 + 1];
         let tRe  = FFT_FAC_64[j * 2 + 0];
         let tIm  = FFT_FAC_64[j * 2 + 1];
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
    // RADIX 2 (rolled) - FFT step for SIZE 128 
    ////////////////////////////////////////////////
    { 
     for (let j = 0; j < 64; j++) { 
         let eI = 0 + j;
         let oI = 0 + j + 64;
         let eRe  = out256[eI * 2    ];
         let eIm  = out256[eI * 2 + 1];
         let oRe  = out256[oI * 2    ];
         let oIm  = out256[oI * 2 + 1];
         let tRe  = FFT_FAC_128[j * 2 + 0];
         let tIm  = FFT_FAC_128[j * 2 + 1];
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
         let eRe  = out256[eI * 2    ];
         let eIm  = out256[eI * 2 + 1];
         let oRe  = out256[oI * 2    ];
         let oIm  = out256[oI * 2 + 1];
         let tRe  = FFT_FAC_128[j * 2 + 0];
         let tIm  = FFT_FAC_128[j * 2 + 1];
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

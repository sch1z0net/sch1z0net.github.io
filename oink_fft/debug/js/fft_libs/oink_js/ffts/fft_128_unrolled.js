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
let FFT_FAC_64 = new Float32Array([
1.0000000000000000,-0.0000000000000000,

0.9951847195625305,-0.0980171412229538,
0.9807852506637573,-0.1950903236865997,
0.9569403529167175,-0.2902846634387970,
0.9238795042037964,-0.3826834559440613,
0.8819212913513184,-0.4713967144489288,
0.8314695954322815,-0.5555702447891235,
0.7730104923248291,-0.6343932747840881,
0.7071067690849304,-0.7071067690849304,
0.6343932747840881,-0.7730104327201843,
0.5555702447891235,-0.8314695954322815,
0.4713967740535736,-0.8819212317466736,
0.3826834261417389,-0.9238795042037964,
0.2902846336364746,-0.9569403529167175,
0.1950903534889221,-0.9807852506637573,
0.0980171337723732,-0.9951847195625305,

-0.0000000437113883,-1.0000000000000000,

-0.0980171039700508,-0.9951847195625305, //34 //35
-0.1950903236865997,-0.9807852506637573, //-28 -4
-0.2902847230434418,-0.9569402933120728,
-0.3826833963394165,-0.9238795638084412,
-0.4713966250419617,-0.8819212913513184,
-0.5555701851844788,-0.8314696550369263,
-0.6343932747840881,-0.7730104923248291,
-0.7071067690849304,-0.7071067690849304,
-0.7730104923248291,-0.6343932747840881,
-0.8314696550369263,-0.5555701851844788,
-0.8819212317466736,-0.4713968336582184,
-0.9238795042037964,-0.3826834857463837,
-0.9569403529167175,-0.2902847230434418,
-0.9807853102684021,-0.1950903087854385,
-0.9951847195625305,-0.0980170965194702
]);
let FFT_FAC_128 = new Float32Array([
1.0000000000000000,-0.0000000000000000,0.9987954497337341,-0.0490676760673523,0.9951847195625305,-0.0980171412229538,0.9891765117645264,-0.1467304676771164,
0.9807852506637573,-0.1950903236865997,0.9700312614440918,-0.2429801821708679,0.9569403529167175,-0.2902846634387970,0.9415440559387207,-0.3368898332118988,
0.9238795042037964,-0.3826834559440613,0.9039893150329590,-0.4275550842285156,0.8819212913513184,-0.4713967144489288,0.8577286005020142,-0.5141027569770813,
0.8314695954322815,-0.5555702447891235,0.8032075166702271,-0.5956993103027344,0.7730104923248291,-0.6343932747840881,0.7409511208534241,-0.6715589761734009,
0.7071067690849304,-0.7071067690849304,0.6715589761734009,-0.7409511208534241,0.6343932747840881,-0.7730104327201843,0.5956993103027344,-0.8032075166702271,
0.5555702447891235,-0.8314695954322815,0.5141028165817261,-0.8577286005020142,0.4713967740535736,-0.8819212317466736,0.4275551140308380,-0.9039893150329590,
0.3826834261417389,-0.9238795042037964,0.3368898332118988,-0.9415440559387207,0.2902846336364746,-0.9569403529167175,0.2429802417755127,-0.9700312614440918,
0.1950903534889221,-0.9807852506637573,0.1467304974794388,-0.9891765117645264,0.0980171337723732,-0.9951847195625305,0.0490676499903202,-0.9987954497337341,
-0.0000000437113883,-1.0000000000000000,-0.0490676201879978,-0.9987954497337341,-0.0980171039700508,-0.9951847195625305,-0.1467304527759552,-0.9891765117645264,
-0.1950903236865997,-0.9807852506637573,-0.2429801970720291,-0.9700312614440918,-0.2902847230434418,-0.9569402933120728,-0.3368898034095764,-0.9415440559387207,
-0.3826833963394165,-0.9238795638084412,-0.4275550842285156,-0.9039893150329590,-0.4713966250419617,-0.8819212913513184,-0.5141027569770813,-0.8577286005020142,
-0.5555701851844788,-0.8314696550369263,-0.5956993699073792,-0.8032075166702271,-0.6343932747840881,-0.7730104923248291,-0.6715590357780457,-0.7409510612487793,
-0.7071067690849304,-0.7071067690849304,-0.7409510612487793,-0.6715590357780457,-0.7730104923248291,-0.6343932747840881,-0.8032075166702271,-0.5956993699073792,
-0.8314696550369263,-0.5555701851844788,-0.8577286005020142,-0.5141027569770813,-0.8819212317466736,-0.4713968336582184,-0.9039893150329590,-0.4275550544261932,
-0.9238795042037964,-0.3826834857463837,-0.9415441155433655,-0.3368898034095764,-0.9569403529167175,-0.2902847230434418,-0.9700312614440918,-0.2429800778627396,
-0.9807853102684021,-0.1950903087854385,-0.9891765117645264,-0.1467305719852448,-0.9951847195625305,-0.0980170965194702,-0.9987954497337341,-0.0490677244961262
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
    // RADIX 4 - FFT step for SIZE 2/4 
    ////////////////////////////////////////////////

    for (let idx = 0, out_idx = 0; idx < 128; idx += 4, out_idx += 8) {
        let x0aRe = iBR128[idx    ];
        let x1aRe = iBR128[idx + 1];
        let x2aRe = iBR128[idx + 2];
        let x3aRe = iBR128[idx + 3];

        let sum1  =   x0aRe + x1aRe;
        let sum2  =   x2aRe + x3aRe;
        let diff1 =   x0aRe - x1aRe;
        let diff2 =   x3aRe - x2aRe;

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
    // RADIX 4 - FFT step for SIZE 8/16 
    ////////////////////////////////////////////////

    for (let idx = 0; idx < 256; idx += 32) {
        let xA0re  = out128[0   + idx];
        let xA1re  = out128[2   + idx];
        let xA1im  = out128[3   + idx];
        let xA2re  = out128[4   + idx];

        let xA4re  = out128[8   + idx];
        out128[8  + idx]  =     xA0re - xA4re;
        let xA5re  = out128[10  + idx];
        let xA5im  = out128[11  + idx];
        let xA6re  = out128[12  + idx];

        let xA8re  = out128[16  + idx]; 
        let xA9re  = out128[18  + idx]; 
        let xA9im  = out128[19  + idx]; 
        let xA10re = out128[20  + idx]; 

        let xA12re = out128[24  + idx]; 
        out128[24  + idx] =     xA0re - xA4re;
        out128[25  + idx] =     xA8re - xA12re;
        out128[9  + idx]  =   - xA8re + xA12re;
        out128[0  + idx]  = xA0re + xA4re + (xA8re + xA12re);
        out128[1  + idx]  = 0;
        out128[16  + idx] = xA0re + xA4re - (xA8re + xA12re);
        out128[17  + idx] = 0;
        let xA13re = out128[26  + idx]; 
        let xA13im = out128[27  + idx]; 
        let xA14re = out128[28  + idx]; 


        let tRe = 0.7071067690849304;  //FFT_FAC_8[2];
        let x1re  =  xA1re + (xA5re  *  tRe + xA5im  *  tRe);    
        let x1im  =  xA1im + (xA5re  * -tRe + xA5im  *  tRe);
        let x9re  =  xA9re + (xA13re *  tRe - xA13im * -tRe); 
        let x9im  =  xA9im + (xA13re * -tRe + xA13im *  tRe);

        let t1re  = 0.9238795042037964; //FFT_FAC_16[2];
        let t3re  = 0.3826834261417389; //FFT_FAC_16[6];
        let res3  =  x1im + (x9re * -t3re  + x9im *  t1re);
        out128[31  + idx] = -res3;
        let res2  =  x1re + (x9re *  t1re  - x9im * -t3re);
        out128[30  + idx] =  res2;
        let res19 =  x1im - (x9re * -t3re  + x9im *  t1re);
        out128[19  + idx] =  res19;
        let res18 =  x1re - (x9re *  t1re  - x9im * -t3re);
        out128[18  + idx] =  res18;

        out128[15  + idx] = -res19;
        out128[14  + idx] =  res18;
        out128[3   + idx]  =  res3;
        out128[2   + idx]  =  res2;

         
        let res4  = xA2re + (xA10re *  tRe + xA14re * -tRe);
        out128[4   + idx]  =  res4;
        let res5  =-xA6re + (xA10re * -tRe - xA14re *  tRe);
        out128[5   + idx]  =  res5;
        let res20 = xA2re - (xA10re *  tRe + xA14re * -tRe);
        out128[12  + idx] =  res20;
        let res21 =-xA6re - (xA10re * -tRe - xA14re *  tRe);
        out128[13  + idx] = -res21;

        out128[20  + idx] =  res20;
        out128[21  + idx] =  res21;
        out128[28  + idx] =  res4;
        out128[29  + idx] = -res5;


        let x3re  =  xA1re - (xA5re  *  tRe + xA5im  *  tRe);    
        let x3im  = -xA1im + (xA5re  * -tRe + xA5im  *  tRe);
        let x11re =  xA9re + (xA13re * -tRe - xA13im *  tRe); 
        let x11im = -xA9im + (xA13re * -tRe + xA13im *  tRe);


        let res7  = x3im + (x11re * -t1re + x11im *  t3re);
        out128[27  + idx] = -res7;
        let res6  = x3re + (x11re *  t3re - x11im * -t1re);
        out128[26  + idx] =  res6;
        let res23 = x3im - (x11re * -t1re + x11im *  t3re);
        out128[23  + idx] =  res23;
        let res22 = x3re - (x11re *  t3re - x11im * -t1re);
        out128[22  + idx] =  res22;

        out128[11  + idx] = -res23;
        out128[10  + idx] =  res22;
        out128[6   + idx]  =  res6;
        out128[7   + idx]  =  res7;
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 2 (rolled) - FFT step for SIZE 32 
    ////////////////////////////////////////////////
    { 
     {
        let tA1re  = FFT_FAC_32[2];
        let tA2re  = FFT_FAC_32[4];
        let tA3re  = FFT_FAC_32[6];
        let tA4re  = FFT_FAC_32[8];
        let tA5re  = FFT_FAC_32[10];
        let tA6re  = FFT_FAC_32[12];
        let tA7re  = FFT_FAC_32[14];

        let xA0re  = out128[ 0];
        let xA0im  = out128[ 1];
        let xA16re = out128[32];
        let xA16im = out128[33];

        let xA1re  = out128[ 2];
        let xA1im  = out128[ 3];
        let xA17re = out128[34];
        let xA17im = out128[35];

        let xA2re  = out128[ 4];
        let xA2im  = out128[ 5];
        let xA18re = out128[36];
        let xA18im = out128[37];

        let xA3re  = out128[ 6];
        let xA3im  = out128[ 7];
        let xA19re = out128[38];
        let xA19im = out128[39];

        let xA4re  = out128[ 8];
        let xA4im  = out128[ 9];
        let xA20re = out128[40];
        let xA20im = out128[41];

        let xA5re  = out128[10];
        let xA5im  = out128[11];
        let xA21re = out128[42];
        let xA21im = out128[43];

        let xA6re  = out128[12];
        let xA6im  = out128[13];
        let xA22re = out128[44];
        let xA22im = out128[45];

        let xA7re  = out128[14];
        let xA7im  = out128[15];
        let xA23re = out128[46];
        let xA23im = out128[47];

        let xA8re  = out128[16];
        let xA8im  = out128[17];
        let xA24re = out128[48];
        let xA24im = out128[49];

        let xA32re  = out128[64];
        let xA32im  = out128[65];
        let xA48re  = out128[96];
        let xA48im  = out128[97];

        let xA33re  = out128[66];
        let xA33im  = out128[67];
        let xA49re  = out128[98];
        let xA49im  = out128[99];

        let xA34re  = out128[68];
        let xA34im  = out128[69];
        let xA50re  = out128[100];
        let xA50im  = out128[101];

        let xA35re  = out128[70];
        let xA35im  = out128[71];
        let xA51re  = out128[102];
        let xA51im  = out128[103];

        let xA36re  = out128[72];
        let xA36im  = out128[73];
        let xA52re  = out128[104];
        let xA52im  = out128[105];

        let xA37re  = out128[74];
        let xA37im  = out128[75];
        let xA53re  = out128[106];
        let xA53im  = out128[107];

        let xA38re  = out128[76];
        let xA38im  = out128[77];
        let xA54re  = out128[108];
        let xA54im  = out128[109];

        let xA39re  = out128[78];
        let xA39im  = out128[79];
        let xA55re  = out128[110];
        let xA55im  = out128[111];

        let xA40re  = out128[80];
        let xA40im  = out128[81];
        let xA56re  = out128[112];
        let xA56im  = out128[113];


        let res2  = xA1re + (xA17re *  tA1re - xA17im * -tA7re);
        let res3  = xA1im + (xA17re * -tA7re + xA17im *  tA1re);
        let res34 = xA1re - (xA17re *  tA1re - xA17im * -tA7re);
        let res35 = xA1im - (xA17re * -tA7re + xA17im *  tA1re);

        let res4   = xA2re + (xA18re *  tA2re - xA18im * -tA6re);
        let res5   = xA2im + (xA18re * -tA6re + xA18im *  tA2re);
        let res36  = xA2re - (xA18re *  tA2re - xA18im * -tA6re);
        let res37  = xA2im - (xA18re * -tA6re + xA18im *  tA2re);

        let res6   = xA3re + (xA19re *  tA3re - xA19im * -tA5re);
        let res7   = xA3im + (xA19re * -tA5re + xA19im *  tA3re);
        let res38  = xA3re - (xA19re *  tA3re - xA19im * -tA5re);
        let res39  = xA3im - (xA19re * -tA5re + xA19im *  tA3re);

        let res8   = xA4re + (xA20re *  tA4re - xA20im * -tA4re);
        let res9   = xA4im + (xA20re * -tA4re + xA20im *  tA4re);
        let res40  = xA4re - (xA20re *  tA4re - xA20im * -tA4re);
        let res41  = xA4im - (xA20re * -tA4re + xA20im *  tA4re);

        let res10  = xA5re + (xA21re *  tA5re - xA21im * -tA3re);
        let res11  = xA5im + (xA21re * -tA3re + xA21im *  tA5re);
        let res42  = xA5re - (xA21re *  tA5re - xA21im * -tA3re);
        let res43  = xA5im - (xA21re * -tA3re + xA21im *  tA5re);

        let res12  = xA6re + (xA22re *  tA6re - xA22im * -tA2re);
        let res13  = xA6im + (xA22re * -tA2re + xA22im *  tA6re);
        let res44  = xA6re - (xA22re *  tA6re - xA22im * -tA2re);
        let res45  = xA6im - (xA22re * -tA2re + xA22im *  tA6re);

        let res14  = xA7re + (xA23re *  tA7re - xA23im * -tA1re);
        let res15  = xA7im + (xA23re * -tA1re + xA23im *  tA7re);
        let res46  = xA7re - (xA23re *  tA7re - xA23im * -tA1re);
        let res47  = xA7im - (xA23re * -tA1re + xA23im *  tA7re);

        let res18   = xA33re + (xA49re *  tA1re - xA49im * -tA7re);
        let res19   = xA33im + (xA49re * -tA7re + xA49im *  tA1re);
        let res50   = xA33re - (xA49re *  tA1re - xA49im * -tA7re);
        let res51   = xA33im - (xA49re * -tA7re + xA49im *  tA1re);

        let res20   = xA34re + (xA50re *  tA2re - xA50im * -tA6re);
        let res21   = xA34im + (xA50re * -tA6re + xA50im *  tA2re);
        let res52   = xA34re - (xA50re *  tA2re - xA50im * -tA6re);
        let res53   = xA34im - (xA50re * -tA6re + xA50im *  tA2re);

        let res22   = xA35re + (xA51re *  tA3re - xA51im * -tA5re);
        let res23   = xA35im + (xA51re * -tA5re + xA51im *  tA3re);
        let res54   = xA35re - (xA51re *  tA3re - xA51im * -tA5re);
        let res55   = xA35im - (xA51re * -tA5re + xA51im *  tA3re);

        let res24   = xA36re + (xA52re *  tA4re - xA52im * -tA4re);
        let res25   = xA36im + (xA52re * -tA4re + xA52im *  tA4re);
        let res56   = xA36re - (xA52re *  tA4re - xA52im * -tA4re);
        let res57   = xA36im - (xA52re * -tA4re + xA52im *  tA4re);

        let res26   = xA37re + (xA53re *  tA5re - xA53im * -tA3re);
        let res27   = xA37im + (xA53re * -tA3re + xA53im *  tA5re);
        let res58   = xA37re - (xA53re *  tA5re - xA53im * -tA3re);
        let res59   = xA37im - (xA53re * -tA3re + xA53im *  tA5re);

        let res28   = xA38re + (xA54re *  tA6re - xA54im * -tA2re);
        let res29   = xA38im + (xA54re * -tA2re + xA54im *  tA6re);
        let res60   = xA38re - (xA54re *  tA6re - xA54im * -tA2re);
        let res61   = xA38im - (xA54re * -tA2re + xA54im *  tA6re);

        let res30   = xA39re + (xA55re *  tA7re - xA55im * -tA1re);
        let res31   = xA39im + (xA55re * -tA1re + xA55im *  tA7re);
        let res62   = xA39re - (xA55re *  tA7re - xA55im * -tA1re);
        let res63   = xA39im - (xA55re * -tA1re + xA55im *  tA7re);


        let t1Re  = FFT_FAC_64[2];
        let t2Re  = FFT_FAC_64[4];
        let t3Re  = FFT_FAC_64[6];
        let t4Re  = FFT_FAC_64[8];
        let t5Re  = FFT_FAC_64[10];
        let t6Re  = FFT_FAC_64[12];
        let t7Re  = FFT_FAC_64[14];
        let t8Re  = FFT_FAC_64[16];
        let t9Re  = FFT_FAC_64[18];
        let t10Re = FFT_FAC_64[20];
        let t11Re = FFT_FAC_64[22];
        let t12Re = FFT_FAC_64[24];
        let t13Re = FFT_FAC_64[26];
        let t14Re = FFT_FAC_64[28];
        let t15Re = FFT_FAC_64[30];

        out128[0]   =  xA0re + xA16re + xA32re + xA48re;
        out128[1]   =  xA0im + xA16im + xA32im + xA48im;
        out128[64]  =  xA0re + xA16re - xA32re - xA48re;
        out128[65]  =  xA0im + xA16im - xA32im - xA48im;

        let resB2   =  res2 + (res18 *  t1Re  - res19 * -t15Re);
        let resB3   =  res3 + (res18 * -t15Re + res19 *  t1Re );
        let resB66  =  res2 - (res18 *  t1Re  - res19 * -t15Re);
        let resB67  =  res3 - (res18 * -t15Re + res19 *  t1Re );
        out128[2]   =  resB2;
        out128[3]   =  resB3;
        out128[66]  =  resB66;
        out128[67]  =  resB67;
        out128[62]  =  resB66;
        out128[63]  = -resB67;
        out128[126] =  resB2;
        out128[127] = -resB3;

        let resB4   =  res4 + (res20 *  t2Re  - res21 * -t14Re);
        let resB5   =  res5 + (res20 * -t14Re + res21 *  t2Re );
        let resB68  =  res4 - (res20 *  t2Re  - res21 * -t14Re);
        let resB69  =  res5 - (res20 * -t14Re + res21 *  t2Re );
        out128[4]   =  resB4;
        out128[5]   =  resB5;
        out128[68]  =  resB68;
        out128[69]  =  resB69;
        out128[60]  =  resB68;
        out128[61]  = -resB69;
        out128[124] =  resB4;
        out128[125] = -resB5;

        let resB6   =  res6 + (res22 *  t3Re  - res23 * -t13Re);
        let resB7   =  res7 + (res22 * -t13Re + res23 *  t3Re );
        let resB70  =  res6 - (res22 *  t3Re  - res23 * -t13Re);
        let resB71  =  res7 - (res22 * -t13Re + res23 *  t3Re );
        out128[6]   =  resB6;
        out128[7]   =  resB7;
        out128[70]  =  resB70;
        out128[71]  =  resB71;
        out128[58]  =  resB70;
        out128[59]  = -resB71;
        out128[122] =  resB6;
        out128[123] = -resB7;

        let resB8   =  res8 + (res24 *  t4Re  - res25 * -t12Re);
        let resB9   =  res9 + (res24 * -t12Re + res25 *  t4Re);
        let resB72  =  res8 - (res24 *  t4Re  - res25 * -t12Re);
        let resB73  =  res9 - (res24 * -t12Re + res25 *  t4Re);
        out128[8]   =  resB8;
        out128[9]   =  resB9;
        out128[72]  =  resB72;
        out128[73]  =  resB73;
        out128[56]  =  resB72;
        out128[57]  = -resB73;
        out128[120] =  resB8;
        out128[121] = -resB9;

        let resB10  =  res10 + (res26 *  t5Re  - res27 * -t11Re);
        let resB11  =  res11 + (res26 * -t11Re + res27 *  t5Re);
        let resB74  =  res10 - (res26 *  t5Re  - res27 * -t11Re);
        let resB75  =  res11 - (res26 * -t11Re + res27 *  t5Re);
        out128[10]  =  resB10;
        out128[11]  =  resB11;
        out128[74]  =  resB74;
        out128[75]  =  resB75;
        out128[54]  =  resB74;
        out128[55]  = -resB75;
        out128[118] =  resB10;
        out128[119] = -resB11;

        let resB12  =  res12 + (res28 *  t6Re  - res29 * -t10Re);
        let resB13  =  res13 + (res28 * -t10Re + res29 *  t6Re);
        let resB76  =  res12 - (res28 *  t6Re  - res29 * -t10Re);
        let resB77  =  res13 - (res28 * -t10Re + res29 *  t6Re);
        out128[12]  =  resB12;
        out128[13]  =  resB13;
        out128[76]  =  resB76;
        out128[77]  =  resB77;
        out128[52]  =  resB76;
        out128[53]  = -resB77;
        out128[116] =  resB12;
        out128[117] = -resB13;

        let resB14  =  res14 + (res30 *  t7Re - res31 * -t9Re);
        let resB15  =  res15 + (res30 * -t9Re + res31 *  t7Re);
        let resB78  =  res14 - (res30 *  t7Re - res31 * -t9Re);
        let resB79  =  res15 - (res30 * -t9Re + res31 *  t7Re);
        out128[14]  =  resB14;
        out128[15]  =  resB15;
        out128[78]  =  resB78;
        out128[79]  =  resB79;
        out128[50]  =  resB78;
        out128[51]  = -resB79;
        out128[114] =  resB14;
        out128[115] = -resB15;

        out128[16]  =  xA8re + xA24im + ((xA40re + xA56im) *  t8Re - (xA40im - xA56re) * -t8Re);
        out128[17]  =  xA8im - xA24re + ((xA40re + xA56im) * -t8Re + (xA40im - xA56re) *  t8Re);
        out128[80]  =  xA8re + xA24im - ((xA40re + xA56im) *  t8Re - (xA40im - xA56re) * -t8Re);
        out128[81]  =  xA8im - xA24re - ((xA40re + xA56im) * -t8Re + (xA40im - xA56re) *  t8Re);

        let resB18  =  res46 + (res62 *  t9Re - -res63 * -t7Re);
        let resB19  = -res47 + (res62 * -t7Re + -res63 *  t9Re);
        let resB82  =  res46 - (res62 *  t9Re - -res63 * -t7Re);
        let resB83  = -res47 - (res62 * -t7Re + -res63 *  t9Re);
        out128[18]  =  resB18;
        out128[19]  =  resB19;
        out128[82]  =  resB82;
        out128[83]  =  resB83;
        out128[46]  =  resB82;
        out128[47]  = -resB83;
        out128[110] =  resB18;
        out128[111] = -resB19;

        let resB20  =  res44 + (res60 *  t10Re - -res61 * -t6Re );
        let resB21  = -res45 + (res60 * -t6Re  + -res61 *  t10Re);
        let resB84  =  res44 - (res60 *  t10Re - -res61 * -t6Re );
        let resB85  = -res45 - (res60 * -t6Re  + -res61 *  t10Re);
        out128[20]  =  resB20;
        out128[21]  =  resB21;
        out128[84]  =  resB84;
        out128[85]  =  resB85;
        out128[44]  =  resB84;
        out128[45]  = -resB85;
        out128[108] =  resB20;
        out128[109] = -resB21;

        let resB22  =  res42 + (res58 *  t11Re - -res59 * -t5Re );
        let resB23  = -res43 + (res58 * -t5Re  + -res59 *  t11Re);
        let resB86  =  res42 - (res58 *  t11Re - -res59 * -t5Re );
        let resB87  = -res43 - (res58 * -t5Re  + -res59 *  t11Re);
        out128[22]  =  resB22;
        out128[23]  =  resB23;
        out128[86]  =  resB86;
        out128[87]  =  resB87;
        out128[42]  =  resB86;
        out128[43]  = -resB87;
        out128[106] =  resB22;
        out128[107] = -resB23;

        let resB24  =  res40 + (res56 *  t12Re - -res57 * -t4Re );
        let resB25  = -res41 + (res56 * -t4Re  + -res57 * t12Re );
        let resB88  =  res40 - (res56 *  t12Re - -res57 * -t4Re );
        let resB89  = -res41 - (res56 * -t4Re  + -res57 * t12Re );
        out128[24]  =  resB24;
        out128[25]  =  resB25;
        out128[88]  =  resB88;
        out128[89]  =  resB89;
        out128[40]  =  resB88;
        out128[41]  = -resB89;
        out128[104] =  resB24;
        out128[105] = -resB25;

        let resB26  =  res38 + (res54 *  t13Re - -res55 * -t3Re );
        let resB27  = -res39 + (res54 * -t3Re  + -res55 *  t13Re);
        let resB90  =  res38 - (res54 *  t13Re - -res55 * -t3Re );
        let resB91  = -res39 - (res54 * -t3Re  + -res55 *  t13Re);
        out128[26]  =  resB26;
        out128[27]  =  resB27;
        out128[90]  =  resB90;
        out128[91]  =  resB91;
        out128[38]  =  resB90;
        out128[39]  = -resB91;
        out128[102] =  resB26;
        out128[103] = -resB27;

        let resB28  =  res36 + (res52 *  t14Re - -res53 * -t2Re );
        let resB29  = -res37 + (res52 * -t2Re  + -res53 *  t14Re);
        let resB92  =  res36 - (res52 *  t14Re - -res53 * -t2Re );
        let resB93  = -res37 - (res52 * -t2Re  + -res53 *  t14Re);
        out128[28]  =  resB28;
        out128[29]  =  resB29;
        out128[92]  =  resB92;
        out128[93]  =  resB93;
        out128[36]  =  resB92;
        out128[37]  = -resB93;
        out128[100] =  resB28;
        out128[101] = -resB29;

        let resB30  =  res34 + (res50 *  t15Re - -res51 * -t1Re );
        let resB31  = -res35 + (res50 * -t1Re  + -res51 *  t15Re);
        let resB94  =  res34 - (res50 *  t15Re - -res51 * -t1Re );
        let resB95  = -res35 - (res50 * -t1Re  + -res51 *  t15Re);
        out128[30]  =  resB30;
        out128[31]  =  resB31;
        out128[94]  =  resB94;
        out128[95]  =  resB95;
        out128[34]  =  resB94;
        out128[35]  = -resB95;
        out128[98]  =  resB30;
        out128[99]  = -resB31;


        out128[32]  = xA0re - xA16re + (xA32im - xA48im);
        out128[33]  = xA0im - xA16im + (-(xA32re - xA48re));
        out128[96]  = xA0re - xA16re - (xA32im - xA48im);
        out128[97]  = xA0im - xA16im - (-(xA32re - xA48re));

        out128[48]   = xA8re - xA24im + ((xA40re - xA56im) * -t8Re - (xA40im + xA56re) * -t8Re);
        out128[49]   = xA8im + xA24re + ((xA40re - xA56im) * -t8Re + (xA40im + xA56re) * -t8Re);
        out128[112]  = xA8re - xA24im - ((xA40re - xA56im) * -t8Re - (xA40im + xA56re) * -t8Re);
        out128[113]  = xA8im + xA24re - ((xA40re - xA56im) * -t8Re + (xA40im + xA56re) * -t8Re);

     }



     for (let j = 0; j < 16; j++) { 
         let eI = 64 + j;
         let oI = 64 + j + 16;
         let eRe  = out128[eI * 2    ];
         let eIm  = out128[eI * 2 + 1];
         let oRe  = out128[oI * 2    ];
         let oIm  = out128[oI * 2 + 1];
         let tRe  = FFT_FAC_32[j * 2 + 0];
         let tIm  = FFT_FAC_32[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out128[eI * 2    ] = eRe + t_oRe;
         out128[eI * 2 + 1] = eIm + t_oIm;
         out128[oI * 2    ] = eRe - t_oRe;
         out128[oI * 2 + 1] = eIm - t_oIm;
     }

     for (let j = 0; j < 16; j++) { 
         let eI = 96 + j;
         let oI = 96 + j + 16;
         let eRe  = out128[eI * 2    ];
         let eIm  = out128[eI * 2 + 1];
         let oRe  = out128[oI * 2    ];
         let oIm  = out128[oI * 2 + 1];
         let tRe  = FFT_FAC_32[j * 2 + 0];
         let tIm  = FFT_FAC_32[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out128[eI * 2    ] = eRe + t_oRe;
         out128[eI * 2 + 1] = eIm + t_oIm;
         out128[oI * 2    ] = eRe - t_oRe;
         out128[oI * 2 + 1] = eIm - t_oIm;
     }

     for (let j = 0; j < 32; j++) { 
         let eI = 64 + j;
         let oI = 64 + j + 32;
         let eRe  = out128[eI * 2    ];
         let eIm  = out128[eI * 2 + 1];
         let oRe  = out128[oI * 2    ];
         let oIm  = out128[oI * 2 + 1];
         let tRe  = FFT_FAC_64[j * 2 + 0];
         let tIm  = FFT_FAC_64[j * 2 + 1];
         let t_oRe = oRe * tRe - oIm * tIm;
         let t_oIm = oRe * tIm + oIm * tRe;
         out128[eI * 2    ] = eRe + t_oRe;
         out128[eI * 2 + 1] = eIm + t_oIm;
         out128[oI * 2    ] = eRe - t_oRe;
         out128[oI * 2 + 1] = eIm - t_oIm;
     }
    } 
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 2 (rolled) - FFT step for SIZE 64 
    ////////////////////////////////////////////////
    { 

    } 
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 2 (rolled) - FFT step for SIZE 128 
    ////////////////////////////////////////////////
    { 
     for (let j = 0; j < 64; j++) { 
         let eI = 0 + j;
         let oI = 0 + j + 64;
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

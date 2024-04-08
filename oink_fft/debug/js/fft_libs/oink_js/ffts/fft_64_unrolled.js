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
1.0000000000000000,-0.0000000000000000,0.9951847195625305,-0.0980171412229538,0.9807852506637573,-0.1950903236865997,0.9569403529167175,-0.2902846634387970,
0.9238795042037964,-0.3826834559440613,0.8819212913513184,-0.4713967144489288,0.8314695954322815,-0.5555702447891235,0.7730104923248291,-0.6343932747840881,
0.7071067690849304,-0.7071067690849304,0.6343932747840881,-0.7730104327201843,0.5555702447891235,-0.8314695954322815,0.4713967740535736,-0.8819212317466736,
0.3826834261417389,-0.9238795042037964,0.2902846336364746,-0.9569403529167175,0.1950903534889221,-0.9807852506637573,0.0980171337723732,-0.9951847195625305,
-0.0000000437113883,-1.0000000000000000,-0.0980171039700508,-0.9951847195625305,-0.1950903236865997,-0.9807852506637573,-0.2902847230434418,-0.9569402933120728,
-0.3826833963394165,-0.9238795638084412,-0.4713966250419617,-0.8819212913513184,-0.5555701851844788,-0.8314696550369263,-0.6343932747840881,-0.7730104923248291,
-0.7071067690849304,-0.7071067690849304,-0.7730104923248291,-0.6343932747840881,-0.8314696550369263,-0.5555701851844788,-0.8819212317466736,-0.4713968336582184,
-0.9238795042037964,-0.3826834857463837,-0.9569403529167175,-0.2902847230434418,-0.9807853102684021,-0.1950903087854385,-0.9951847195625305,-0.0980170965194702
]);


let iBR64 = new Float32Array(64);
let iP64  = new Float32Array(64);
let _iP64 = new Float32Array(64);
let out64 = new Float32Array(128);

function fftReal64(realInput) { 
    let size = realInput.length;
    if (size != 64) {
        for (let i = 0; i < 64; i++) {
            iP64[i] = (i < size) ? realInput[i] : 0.0;
        }
        _iP64 = iP64;
    } else {
        _iP64 = realInput;
    }


    //Bit Reversal
    {
        iBR64[0]=_iP64[0]; 
        iBR64[1]=_iP64[32]; 
        iBR64[2]=_iP64[16]; 
        iBR64[3]=_iP64[48]; 
        iBR64[4]=_iP64[8]; 
        iBR64[5]=_iP64[40]; 
        iBR64[6]=_iP64[24]; 
        iBR64[7]=_iP64[56]; 
        iBR64[8]=_iP64[4]; 
        iBR64[9]=_iP64[36]; 
        iBR64[10]=_iP64[20]; 
        iBR64[11]=_iP64[52]; 
        iBR64[12]=_iP64[12]; 
        iBR64[13]=_iP64[44]; 
        iBR64[14]=_iP64[28]; 
        iBR64[15]=_iP64[60]; 
        iBR64[16]=_iP64[2]; 
        iBR64[17]=_iP64[34]; 
        iBR64[18]=_iP64[18]; 
        iBR64[19]=_iP64[50]; 
        iBR64[20]=_iP64[10]; 
        iBR64[21]=_iP64[42]; 
        iBR64[22]=_iP64[26]; 
        iBR64[23]=_iP64[58]; 
        iBR64[24]=_iP64[6]; 
        iBR64[25]=_iP64[38]; 
        iBR64[26]=_iP64[22]; 
        iBR64[27]=_iP64[54]; 
        iBR64[28]=_iP64[14]; 
        iBR64[29]=_iP64[46]; 
        iBR64[30]=_iP64[30]; 
        iBR64[31]=_iP64[62]; 
        iBR64[32]=_iP64[1]; 
        iBR64[33]=_iP64[33]; 
        iBR64[34]=_iP64[17]; 
        iBR64[35]=_iP64[49]; 
        iBR64[36]=_iP64[9]; 
        iBR64[37]=_iP64[41]; 
        iBR64[38]=_iP64[25]; 
        iBR64[39]=_iP64[57]; 
        iBR64[40]=_iP64[5]; 
        iBR64[41]=_iP64[37]; 
        iBR64[42]=_iP64[21]; 
        iBR64[43]=_iP64[53]; 
        iBR64[44]=_iP64[13]; 
        iBR64[45]=_iP64[45]; 
        iBR64[46]=_iP64[29]; 
        iBR64[47]=_iP64[61]; 
        iBR64[48]=_iP64[3]; 
        iBR64[49]=_iP64[35]; 
        iBR64[50]=_iP64[19]; 
        iBR64[51]=_iP64[51]; 
        iBR64[52]=_iP64[11]; 
        iBR64[53]=_iP64[43]; 
        iBR64[54]=_iP64[27]; 
        iBR64[55]=_iP64[59]; 
        iBR64[56]=_iP64[7]; 
        iBR64[57]=_iP64[39]; 
        iBR64[58]=_iP64[23]; 
        iBR64[59]=_iP64[55]; 
        iBR64[60]=_iP64[15]; 
        iBR64[61]=_iP64[47]; 
        iBR64[62]=_iP64[31]; 
        iBR64[63]=_iP64[63]; 
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 4 - FFT step for SIZE 2/4 
    ////////////////////////////////////////////////

    for (let idx = 0, out_idx = 0; idx < 64; idx += 4, out_idx += 8) {
        let x0aRe = iBR64[idx    ];
        let x1aRe = iBR64[idx + 1];
        let x2aRe = iBR64[idx + 2];
        let x3aRe = iBR64[idx + 3];

        let sum1  =   x0aRe + x1aRe;
        let sum2  =   x2aRe + x3aRe;
        let diff1 =   x0aRe - x1aRe;
        let diff2 =   x3aRe - x2aRe;

        out64[out_idx]     = sum1 + sum2;
        out64[out_idx + 1] = 0.0;
        out64[out_idx + 2] = diff1;
        out64[out_idx + 3] = diff2;
        out64[out_idx + 4] = sum1 - sum2;
        out64[out_idx + 5] = 0.0;
        out64[out_idx + 6] = diff1;
        out64[out_idx + 7] = -diff2;
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 4 - FFT step for SIZE 8/16 
    ////////////////////////////////////////////////

    for (let idx = 0; idx < 128; idx += 32) {
        let xA0re  = out64[0   + idx];
        let xA1re  = out64[2   + idx];
        let xA1im  = out64[3   + idx];
        let xA2re  = out64[4   + idx];

        let xA4re  = out64[8   + idx];
        out64[8  + idx]  =     xA0re - xA4re;
        let xA5re  = out64[10  + idx];
        let xA5im  = out64[11  + idx];
        let xA6re  = out64[12  + idx];

        let xA8re  = out64[16  + idx]; 
        let xA9re  = out64[18  + idx]; 
        let xA9im  = out64[19  + idx]; 
        let xA10re = out64[20  + idx]; 

        let xA12re = out64[24  + idx]; 
        out64[24  + idx] =     xA0re - xA4re;
        out64[25  + idx] =     xA8re - xA12re;
        out64[9  + idx]  =   - xA8re + xA12re;
        out64[0  + idx]  = xA0re + xA4re + (xA8re + xA12re);
        out64[1  + idx]  = 0;
        out64[16  + idx] = xA0re + xA4re - (xA8re + xA12re);
        out64[17  + idx] = 0;
        let xA13re = out64[26  + idx]; 
        let xA13im = out64[27  + idx]; 
        let xA14re = out64[28  + idx]; 


        let tRe = 0.7071067690849304;  //FFT_FAC_8[2];
        let x1re  =  xA1re + (xA5re  *  tRe + xA5im  *  tRe);    
        let x1im  =  xA1im + (xA5re  * -tRe + xA5im  *  tRe);
        let x9re  =  xA9re + (xA13re *  tRe - xA13im * -tRe); 
        let x9im  =  xA9im + (xA13re * -tRe + xA13im *  tRe);

        let t1re  = 0.9238795042037964; //FFT_FAC_16[2];
        let t3re  = 0.3826834261417389; //FFT_FAC_16[6];
        let res3  =  x1im + (x9re * -t3re  + x9im *  t1re);
        out64[31  + idx] = -res3;
        let res2  =  x1re + (x9re *  t1re  - x9im * -t3re);
        out64[30  + idx] =  res2;
        let res19 =  x1im - (x9re * -t3re  + x9im *  t1re);
        out64[19  + idx] =  res19;
        let res18 =  x1re - (x9re *  t1re  - x9im * -t3re);
        out64[18  + idx] =  res18;

        out64[15  + idx] = -res19;
        out64[14  + idx] =  res18;
        out64[3   + idx]  =  res3;
        out64[2   + idx]  =  res2;

         
        let res4  = xA2re + (xA10re *  tRe + xA14re * -tRe);
        out64[4   + idx]  =  res4;
        let res5  =-xA6re + (xA10re * -tRe - xA14re *  tRe);
        out64[5   + idx]  =  res5;
        let res20 = xA2re - (xA10re *  tRe + xA14re * -tRe);
        out64[12  + idx] =  res20;
        let res21 =-xA6re - (xA10re * -tRe - xA14re *  tRe);
        out64[13  + idx] = -res21;

        out64[20  + idx] =  res20;
        out64[21  + idx] =  res21;
        out64[28  + idx] =  res4;
        out64[29  + idx] = -res5;


        let x3re  =  xA1re - (xA5re  *  tRe + xA5im  *  tRe);    
        let x3im  = -xA1im + (xA5re  * -tRe + xA5im  *  tRe);
        let x11re =  xA9re + (xA13re * -tRe - xA13im *  tRe); 
        let x11im = -xA9im + (xA13re * -tRe + xA13im *  tRe);


        let res7  = x3im + (x11re * -t1re + x11im *  t3re);
        out64[27  + idx] = -res7;
        let res6  = x3re + (x11re *  t3re - x11im * -t1re);
        out64[26  + idx] =  res6;
        let res23 = x3im - (x11re * -t1re + x11im *  t3re);
        out64[23  + idx] =  res23;
        let res22 = x3re - (x11re *  t3re - x11im * -t1re);
        out64[22  + idx] =  res22;

        out64[11  + idx] = -res23;
        out64[10  + idx] =  res22;
        out64[6   + idx]  =  res6;
        out64[7   + idx]  =  res7;
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 4 - FFT step for SIZE 32/64
    ////////////////////////////////////////////////
    {
        let xA0re  = out64[ 0 ];
        let xA0im  = out64[ 1 ];
        let xA1re  = out64[ 2 ];
        let xA1im  = out64[ 3 ];
        let xA2re  = out64[ 4 ];
        let xA2im  = out64[ 5 ];
        let xA3re  = out64[ 6 ];
        let xA3im  = out64[ 7 ];
        let xA4re  = out64[ 8 ];
        let xA4im  = out64[ 9 ];
        let xA5re  = out64[10 ];
        let xA5im  = out64[11 ];
        let xA6re  = out64[12 ];
        let xA6im  = out64[13 ];
        let xA7re  = out64[14 ];
        let xA7im  = out64[15 ];
        let xA8re  = out64[16 ];
        let xA8im  = out64[17 ];

        let xA16re = out64[32 ];
        let xA16im = out64[33 ];
        let xA17re = out64[34 ];
        let xA17im = out64[35 ];
        let xA18re = out64[36 ];
        let xA18im = out64[37 ];
        let xA19re = out64[38 ];
        let xA19im = out64[39 ];
        let xA20re = out64[40 ];
        let xA20im = out64[41 ];
        let xA21re = out64[42 ];
        let xA21im = out64[43 ];
        let xA22re = out64[44 ];
        let xA22im = out64[45 ];
        let xA23re = out64[46 ];
        let xA23im = out64[47 ];
        let xA24re = out64[48 ];
        let xA24im = out64[49 ];

        let xA32re  = out64[64 ];
        let xA32im  = out64[65 ];
        let xA33re  = out64[66 ];
        let xA33im  = out64[67 ];
        let xA34re  = out64[68 ];
        let xA34im  = out64[69 ];
        let xA35re  = out64[70 ];
        let xA35im  = out64[71 ];
        let xA36re  = out64[72 ];
        let xA36im  = out64[73 ];
        let xA37re  = out64[74 ];
        let xA37im  = out64[75 ];
        let xA38re  = out64[76 ];
        let xA38im  = out64[77 ];
        let xA39re  = out64[78 ];
        let xA39im  = out64[79 ];
        let xA40re  = out64[80 ];
        let xA40im  = out64[81 ];

        let xA48re  = out64[96 ];
        let xA48im  = out64[97 ];        
        let xA49re  = out64[98 ];
        let xA49im  = out64[99 ];
        let xA50re  = out64[100 ];
        let xA50im  = out64[101 ];        
        let xA51re  = out64[102 ];
        let xA51im  = out64[103 ];
        let xA52re  = out64[104 ];
        let xA52im  = out64[105 ];
        let xA53re  = out64[106 ];
        let xA53im  = out64[107 ];
        let xA54re  = out64[108 ];
        let xA54im  = out64[109 ];
        let xA55re  = out64[110 ];
        let xA55im  = out64[111 ];
        let xA56re  = out64[112 ];
        let xA56im  = out64[113 ];





        let tA1re   = 0.9807852506637573; //FFT_FAC_32[2];
        let tA7re   = 0.1950903534889221; //FFT_FAC_32[14];
        let res2    = xA1re  + (xA17re *  tA1re - xA17im * -tA7re);
        let res3    = xA1im  + (xA17re * -tA7re + xA17im *  tA1re);
        let res18   = xA33re + (xA49re *  tA1re - xA49im * -tA7re);
        let res19   = xA33im + (xA49re * -tA7re + xA49im *  tA1re);
        let t1Re    = 0.9951847195625305; //FFT_FAC_64[2];
        let t15Re   = 0.0980171337723732; //FFT_FAC_64[30];

        let resB3   =  res3 + (res18 * -t15Re + res19 *  t1Re );
        out64[127 ]  = -resB3;
        let resB2   =  res2 + (res18 *  t1Re  - res19 * -t15Re);
        out64[126 ]  =  resB2;
        let resB67  =  res3 - (res18 * -t15Re + res19 *  t1Re );
        out64[67  ]  =  resB67;
        let resB66  =  res2 - (res18 *  t1Re  - res19 * -t15Re);
        out64[66  ]  =  resB66;

        out64[63  ]  = -resB67;
        out64[62  ]  =  resB66;
        out64[3   ]  =  resB3;
        out64[2   ]  =  resB2;




        let tA2re   = 0.9238795042037964; //FFT_FAC_32[4];
        let tA6re   = 0.3826834261417389; //FFT_FAC_32[12];
        let res4    = xA2re + (xA18re *  tA2re - xA18im * -tA6re);
        let res5    = xA2im + (xA18re * -tA6re + xA18im *  tA2re);
        let res20   = xA34re + (xA50re *  tA2re - xA50im * -tA6re);
        let res21   = xA34im + (xA50re * -tA6re + xA50im *  tA2re);
        let t2Re    = 0.9807852506637573; //FFT_FAC_64[4];
        let t14Re   = 0.1950903534889221; //FFT_FAC_64[28];

        let resB4   =  res4 + (res20 *  t2Re  - res21 * -t14Re);
        out64[4  ]   =  resB4;
        let resB5   =  res5 + (res20 * -t14Re + res21 *  t2Re );
        out64[5  ]   =  resB5;
        let resB68  =  res4 - (res20 *  t2Re  - res21 * -t14Re);
        out64[60  ]  =  resB68;
        let resB69  =  res5 - (res20 * -t14Re + res21 *  t2Re );
        out64[61  ]  = -resB69;

        out64[68  ]  =  resB68;
        out64[69  ]  =  resB69;
        out64[124  ] =  resB4;
        out64[125  ] = -resB5;



        let tA3re   = 0.8314695954322815; //FFT_FAC_32[6];
        let tA5re   = 0.5555702447891235; //FFT_FAC_32[10];
        let res6    = xA3re  + (xA19re *  tA3re - xA19im * -tA5re);
        let res7    = xA3im  + (xA19re * -tA5re + xA19im *  tA3re);
        let res22   = xA35re + (xA51re *  tA3re - xA51im * -tA5re);
        let res23   = xA35im + (xA51re * -tA5re + xA51im *  tA3re);
        let t3Re    = 0.9569403529167175; //FFT_FAC_64[6];
        let t13Re   = 0.2902846336364746; //FFT_FAC_64[26];
        let resB7   =  res7 + (res22 * -t13Re + res23 *  t3Re );
        out64[123  ] = -resB7;
        let resB6   =  res6 + (res22 *  t3Re  - res23 * -t13Re);
        out64[122  ] =  resB6;
        let resB71  =  res7 - (res22 * -t13Re + res23 *  t3Re );
        out64[71  ]  =  resB71;
        let resB70  =  res6 - (res22 *  t3Re  - res23 * -t13Re);
        out64[70  ]  =  resB70;

        out64[59  ]  = -resB71;
        out64[58  ]  =  resB70;
        out64[7  ]   =  resB7;
        out64[6  ]   =  resB6;



        let tA4re   = 0.7071067690849304; //FFT_FAC_32[8];
        let res8    = xA4re + (xA20re *  tA4re - xA20im * -tA4re);
        let res9    = xA4im + (xA20re * -tA4re + xA20im *  tA4re);
        let res24   = xA36re + (xA52re *  tA4re - xA52im * -tA4re);
        let res25   = xA36im + (xA52re * -tA4re + xA52im *  tA4re);
        let t4Re    = 0.9238795042037964; //FFT_FAC_64[8];
        let t12Re   = 0.3826834261417389; //FFT_FAC_64[24];
        let resB8   =  res8 + (res24 *  t4Re  - res25 * -t12Re);
        out64[8  ]   =  resB8;
        let resB9   =  res9 + (res24 * -t12Re + res25 *  t4Re);
        out64[9  ]   =  resB9;
        let resB72  =  res8 - (res24 *  t4Re  - res25 * -t12Re);
        out64[56  ]  =  resB72;
        let resB73  =  res9 - (res24 * -t12Re + res25 *  t4Re);
        out64[57  ]  = -resB73;

        out64[72  ]  =  resB72;
        out64[73  ]  =  resB73;
        out64[120  ] =  resB8;
        out64[121  ] = -resB9;



        let res10   = xA5re + (xA21re *  tA5re - xA21im * -tA3re);
        let res11   = xA5im + (xA21re * -tA3re + xA21im *  tA5re);
        let res26   = xA37re + (xA53re *  tA5re - xA53im * -tA3re);
        let res27   = xA37im + (xA53re * -tA3re + xA53im *  tA5re);
        let t5Re  = 0.8819212913513184; //FFT_FAC_64[10];
        let t11Re = 0.4713967740535736; //FFT_FAC_64[22];
        let resB11  =  res11 + (res26 * -t11Re + res27 *  t5Re);
        out64[119  ] = -resB11;
        let resB10  =  res10 + (res26 *  t5Re  - res27 * -t11Re);
        out64[118  ] =  resB10;
        let resB75  =  res11 - (res26 * -t11Re + res27 *  t5Re);
        out64[75  ]  =  resB75;
        let resB74  =  res10 - (res26 *  t5Re  - res27 * -t11Re);
        out64[74  ]  =  resB74;

        out64[55  ]  = -resB75;
        out64[54  ]  =  resB74;
        out64[11  ]  =  resB11;
        out64[10  ]  =  resB10;



        let res12   = xA6re + (xA22re *  tA6re - xA22im * -tA2re);
        let res13   = xA6im + (xA22re * -tA2re + xA22im *  tA6re);
        let res28   = xA38re + (xA54re *  tA6re - xA54im * -tA2re);
        let res29   = xA38im + (xA54re * -tA2re + xA54im *  tA6re);
        let t6Re  = 0.8314695954322815; //FFT_FAC_64[12];
        let t10Re = 0.5555702447891235; //FFT_FAC_64[20];
        let resB12  =  res12 + (res28 *  t6Re  - res29 * -t10Re);
        out64[12  ]  =  resB12;
        let resB13  =  res13 + (res28 * -t10Re + res29 *  t6Re);
        out64[13  ]  =  resB13;
        let resB76  =  res12 - (res28 *  t6Re  - res29 * -t10Re);
        out64[52  ]  =  resB76;
        let resB77  =  res13 - (res28 * -t10Re + res29 *  t6Re);
        out64[53  ]  = -resB77;

        out64[76  ]  =  resB76;
        out64[77  ]  =  resB77;
        out64[116  ] =  resB12;
        out64[117  ] = -resB13;



        let res14  = xA7re + (xA23re *  tA7re - xA23im * -tA1re);
        let res15  = xA7im + (xA23re * -tA1re + xA23im *  tA7re);
        let res30   = xA39re + (xA55re *  tA7re - xA55im * -tA1re);
        let res31   = xA39im + (xA55re * -tA1re + xA55im *  tA7re);
        let t7Re  = 0.7730104923248291; //FFT_FAC_64[14];
        let t9Re  = 0.6343932747840881; //FFT_FAC_64[18];
        let resB15  =  res15 + (res30 * -t9Re + res31 *  t7Re);
        out64[115  ] = -resB15;
        let resB14  =  res14 + (res30 *  t7Re - res31 * -t9Re);
        out64[114  ] =  resB14;
        let resB79  =  res15 - (res30 * -t9Re + res31 *  t7Re);
        out64[79  ]  =  resB79;
        let resB78  =  res14 - (res30 *  t7Re - res31 * -t9Re);
        out64[78  ]  =  resB78;
        
        out64[51  ]  = -resB79;
        out64[50  ]  =  resB78;
        out64[15  ]  =  resB15;
        out64[14  ]  =  resB14;



        let t8Re  = 0.7071067690849304; //FFT_FAC_64[16];
        out64[16  ]  =  xA8re + xA24im + ((xA40re + xA56im) *  t8Re - (xA40im - xA56re) * -t8Re);
        out64[17  ]  =  xA8im - xA24re + ((xA40re + xA56im) * -t8Re + (xA40im - xA56re) *  t8Re);
        out64[48  ]   = xA8re - xA24im + ((xA40re - xA56im) * -t8Re - (xA40im + xA56re) * -t8Re);
        out64[49  ]   = xA8im + xA24re + ((xA40re - xA56im) * -t8Re + (xA40im + xA56re) * -t8Re);
        out64[80  ]  =  xA8re + xA24im - ((xA40re + xA56im) *  t8Re - (xA40im - xA56re) * -t8Re);
        out64[81  ]  =  xA8im - xA24re - ((xA40re + xA56im) * -t8Re + (xA40im - xA56re) *  t8Re);
        out64[112  ]  = xA8re - xA24im - ((xA40re - xA56im) * -t8Re - (xA40im + xA56re) * -t8Re);
        out64[113  ]  = xA8im + xA24re - ((xA40re - xA56im) * -t8Re + (xA40im + xA56re) * -t8Re);

        let res46   =  xA7re  - (xA23re *  tA7re - xA23im * -tA1re);
        let res47   =  xA7im  - (xA23re * -tA1re + xA23im *  tA7re);
        let res62   =  xA39re - (xA55re *  tA7re - xA55im * -tA1re);
        let res63   =  xA39im - (xA55re * -tA1re + xA55im *  tA7re);
        let resB19  = -res47 + (res62 * -t7Re + -res63 *  t9Re);
        out64[111  ] = -resB19;
        let resB18  =  res46 + (res62 *  t9Re - -res63 * -t7Re);
        out64[110  ] =  resB18;
        let resB83  = -res47 - (res62 * -t7Re + -res63 *  t9Re);
        out64[83  ]  =  resB83;
        let resB82  =  res46 - (res62 *  t9Re - -res63 * -t7Re);
        out64[82  ]  =  resB82;

        out64[47  ]  = -resB83;
        out64[46  ]  =  resB82;
        out64[19  ]  =  resB19;
        out64[18  ]  =  resB18;



        let res44   =  xA6re  - (xA22re *  tA6re - xA22im * -tA2re);
        let res45   =  xA6im  - (xA22re * -tA2re + xA22im *  tA6re);
        let res60   =  xA38re - (xA54re *  tA6re - xA54im * -tA2re);
        let res61   =  xA38im - (xA54re * -tA2re + xA54im *  tA6re);
        let resB20  =  res44 + (res60 *  t10Re - -res61 * -t6Re );
        out64[20  ]  =  resB20;
        let resB21  = -res45 + (res60 * -t6Re  + -res61 *  t10Re);
        out64[21  ]  =  resB21;
        let resB84  =  res44 - (res60 *  t10Re - -res61 * -t6Re );
        out64[44  ]  =  resB84;
        let resB85  = -res45 - (res60 * -t6Re  + -res61 *  t10Re);
        out64[45  ]  = -resB85;

        out64[84  ]  =  resB84;
        out64[85  ]  =  resB85;
        out64[108  ] =  resB20;
        out64[109  ] = -resB21;



        let res42   =  xA5re  - (xA21re *  tA5re - xA21im * -tA3re);
        let res43   =  xA5im  - (xA21re * -tA3re + xA21im *  tA5re);
        let res58   =  xA37re - (xA53re *  tA5re - xA53im * -tA3re);
        let res59   =  xA37im - (xA53re * -tA3re + xA53im *  tA5re);
        let resB23  = -res43 + (res58 * -t5Re  + -res59 *  t11Re);
        out64[107  ] = -resB23;
        let resB22  =  res42 + (res58 *  t11Re - -res59 * -t5Re );
        out64[106  ] =  resB22;
        let resB87  = -res43 - (res58 * -t5Re  + -res59 *  t11Re);
        out64[87  ]  =  resB87;
        let resB86  =  res42 - (res58 *  t11Re - -res59 * -t5Re );
        out64[86  ]  =  resB86;

        out64[43  ]  = -resB87;
        out64[42  ]  =  resB86;
        out64[23  ]  =  resB23;
        out64[22  ]  =  resB22;



        let res40   =  xA4re  - (xA20re *  tA4re - xA20im * -tA4re);
        let res41   =  xA4im  - (xA20re * -tA4re + xA20im *  tA4re);
        let res56   =  xA36re - (xA52re *  tA4re - xA52im * -tA4re);
        let res57   =  xA36im - (xA52re * -tA4re + xA52im *  tA4re);
        let resB24  =  res40 + (res56 *  t12Re - -res57 * -t4Re );
        out64[24  ]  =  resB24;
        let resB25  = -res41 + (res56 * -t4Re  + -res57 * t12Re );
        out64[25  ]  =  resB25;
        let resB88  =  res40 - (res56 *  t12Re - -res57 * -t4Re );
        out64[40  ]  =  resB88;
        let resB89  = -res41 - (res56 * -t4Re  + -res57 * t12Re );
        out64[41  ]  = -resB89;

        out64[88  ]  =  resB88;
        out64[89  ]  =  resB89;
        out64[104  ] =  resB24;
        out64[105  ] = -resB25;



        let res38   =  xA3re  - (xA19re *  tA3re - xA19im * -tA5re);
        let res39   =  xA3im  - (xA19re * -tA5re + xA19im *  tA3re);
        let res54   =  xA35re - (xA51re *  tA3re - xA51im * -tA5re);
        let res55   =  xA35im - (xA51re * -tA5re + xA51im *  tA3re);
        let resB27  = -res39 + (res54 * -t3Re  + -res55 *  t13Re);
        out64[103  ] = -resB27;
        let resB26  =  res38 + (res54 *  t13Re - -res55 * -t3Re );
        out64[102  ] =  resB26;
        let resB91  = -res39 - (res54 * -t3Re  + -res55 *  t13Re);
        out64[91  ]  =  resB91;
        let resB90  =  res38 - (res54 *  t13Re - -res55 * -t3Re );
        out64[90  ]  =  resB90;

        out64[39  ]  = -resB91;
        out64[38  ]  =  resB90;
        out64[27  ]  =  resB27;
        out64[26  ]  =  resB26;



        let res36   = xA2re  - (xA18re *  tA2re - xA18im * -tA6re);
        let res37   = xA2im  - (xA18re * -tA6re + xA18im *  tA2re);
        let res52   = xA34re - (xA50re *  tA2re - xA50im * -tA6re);
        let res53   = xA34im - (xA50re * -tA6re + xA50im *  tA2re);
        let resB28  =  res36 + (res52 *  t14Re - -res53 * -t2Re );
        out64[28  ]  =  resB28;
        let resB29  = -res37 + (res52 * -t2Re  + -res53 *  t14Re);
        out64[29  ]  =  resB29;
        let resB92  =  res36 - (res52 *  t14Re - -res53 * -t2Re );
        out64[36  ]  =  resB92;
        let resB93  = -res37 - (res52 * -t2Re  + -res53 *  t14Re);
        out64[37  ]  = -resB93;

        out64[92  ]  =  resB92;
        out64[93  ]  =  resB93;
        out64[100  ] =  resB28;
        out64[101  ] = -resB29;



        let res34   =  xA1re - (xA17re *  tA1re - xA17im * -tA7re);
        let res35   =  xA1im - (xA17re * -tA7re + xA17im *  tA1re);
        let res50   =  xA33re - (xA49re *  tA1re - xA49im * -tA7re);
        let res51   =  xA33im - (xA49re * -tA7re + xA49im *  tA1re);
        let resB31  = -res35 + (res50 * -t1Re  + -res51 *  t15Re);
        out64[99  ]  = -resB31;
        let resB30  =  res34 + (res50 *  t15Re - -res51 * -t1Re );
        out64[98  ]  =  resB30;
        let resB95  = -res35 - (res50 * -t1Re  + -res51 *  t15Re);
        out64[95  ]  =  resB95;
        let resB94  =  res34 - (res50 *  t15Re - -res51 * -t1Re );
        out64[94  ]  =  resB94;

        out64[35  ]  = -resB95;
        out64[34  ]  =  resB94;
        out64[31  ]  =  resB31;
        out64[30  ]  =  resB30;



        out64[0   ]  =  xA0re + xA16re + xA32re + xA48re;
        out64[1   ]  =  xA0im + xA16im + xA32im + xA48im;
        out64[32  ]  =  xA0re - xA16re + xA32im - xA48im;
        out64[33  ]  =  xA0im - xA16im - xA32re + xA48re;
        out64[64  ]  =  xA0re + xA16re - xA32re - xA48re;
        out64[65  ]  =  xA0im + xA16im - xA32im - xA48im;
        out64[96  ]  =  xA0re - xA16re - xA32im + xA48im;
        out64[97  ]  =  xA0im - xA16im + xA32re - xA48re;
     }

    return out64;
} 

export {fftReal64}; 

///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////

const FFT_BANK = new Map();

//////////////////////////////////////
//////////////////////////////////////
// Only Copy per Slicing
//////////////////////////////////////
const perform_slice = (fftSize, testData) => {
    for (let i = 0; i < NUM_OPS; i++) { testData.slice(); }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////
//////////////////////////////////////
// Measure the time taken to perform FFT operations
//////////////////////////////////////
const measureSlicing = (type, fftSize, testData) => {
    let testData32 = testData.slice();
    let testData64 = Float64Array.from(testData.slice());

    let precision = FFT_BANK.get(type).precision;
    
    const startTime = performance.now(); // Start time
    if(precision == "double"){
        perform_slice(fftSize, testData64);
    }else 
    if(precision == "float"){
        perform_slice(fftSize, testData32);
    }else{
        throw Error("wrong precision defined in setup")
    }
    const endTime = performance.now(); // End time
    const elapsedTime = endTime - startTime; // Elapsed time in milliseconds

    return elapsedTime;
};

const measureFFT = (type, size, testData) => {
    let tD;
    let func;
    let precision = FFT_BANK.get(type).precision;
    if (precision == "float"){
        tD = testData.slice();
    }else 
    if(precsion == "double"){
        tD = Float64Array.from(testData.slice());
    }else{
        throw Error("wrong precision defined in setup")
    }

    if(size ==  128){ func = () => { FFT_BANK.get(type).fft128(tD);  }; }
    if(size ==  256){ func = () => { FFT_BANK.get(type).fft256(tD);  }; }
    if(size ==  512){ func = () => { FFT_BANK.get(type).fft512(tD);  }; }
    if(size == 1024){ func = () => { FFT_BANK.get(type).fft1024(tD); }; }
    if(size == 2048){ func = () => { FFT_BANK.get(type).fft2048(tD); }; }

    const startTime = performance.now(); // Start time
    for (let i = 0; i < NUM_OPS; i++){
        func();
    }
    const endTime = performance.now(); // End time
    const elapsedTime = endTime - startTime; // Elapsed time in milliseconds

    return elapsedTime;
};

/*
FFT_BANK.set("INDUTNY",{
    idname: "INDUTNY", 
    fullname: "FFT.JS (indutny)", 
    url: "https://github.com/indutny/fft.js/", 
    res: new Map(),
    example: example_INDUTNY,
    precision: "float"
});
*/
/*
FFT_BANK.set("DSP",{
    idname: "DSP", 
    fullname: "DSP.JS (corbanbrook)", 
    url: "https://github.com/corbanbrook/dsp.js/", 
    res: new Map(),
    example: example_DSP,
    precision: "double"
});

FFT_BANK.set("OOURA",{
    idname: "OOURA", 
    fullname: "OOURA (audioplastic)", 
    url: "https://github.com/audioplastic/ooura", 
    res: new Map(),
    example: example_OOURA,
    precision: "double"
});

FFT_BANK.set("KISS",{
    idname: "KISS", 
    fullname: "KISS (mborgerding)", 
    url: "https://github.com/mborgerding/kissfft", 
    res: new Map(),
    example: example_KISS,
    precision: "double"
});

FFT_BANK.set("OINK",{
    idname: "OINK", 
    fullname: "OINK (sch1z0net)", 
    url: "https://github.com/sch1z0net/oink", 
    res: new Map(),
    example: example_OINK,
    precision: "float"
});
*/
async function setup(){


    FFT_BANK.set(
        PLUGIN_INDUTNY.idname,
        {
            idname:   PLUGIN_INDUTNY.idname(), 
            fullname: PLUGIN_INDUTNY.fullname(), 
            url:      PLUGIN_INDUTNY.url(),
            res:      new Map(),
            precision:PLUGIN_INDUTNY.precision(),
            init:     PLUGIN_INDUTNY.init, 
            fft128:   PLUGIN_INDUTNY.fft128, 
            fft256:   PLUGIN_INDUTNY.fft256, 
            fft512:   PLUGIN_INDUTNY.fft512, 
            fft1024:  PLUGIN_INDUTNY.fft1024, 
            fft2048:  PLUGIN_INDUTNY.fft2048, 
            example:  PLUGIN_INDUTNY.example 
        }
    );

    // Call each initialization function asynchronously using await
    //$loading_info.text("Initializing INDUTNY..."); await initializeINDUTNY();
    /*$loading_info.text("Initializing DSP...");     await initializeDSP();
    $loading_info.text("Initializing OOURA...");   await initializeOOURA();
    $loading_info.text("Initializing KISS...");    Module_KISS_ = await Module_KISS(); await initializeKISS();
    $loading_info.text("Initializing OINK...");    Module_OINK_ = await Module_OINK(); await initializeModuleOINK();*/
};


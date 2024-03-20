///////////////////////////////////////////////////////////////////////////////////////////////////////
let Module_OINK_;
let Module_KISS_;

//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM KISS
//////////////////////////////////////
let kiss_fft_128, kiss_input_128;
let kiss_fft_256, kiss_input_256;
let kiss_fft_512, kiss_input_512;
let kiss_fft_1024,kiss_input_1024;
let kiss_fft_2048,kiss_input_2048;

function initializeKISS(){
    return new Promise((resolve, reject) => {
        kiss_fft_128 = new Module_KISS_.KissFftReal(128);
        kiss_input_128 = kiss_fft_128.getInputTimeDataBuffer();
        kiss_fft_256 = new Module_KISS_.KissFftReal(256);
        kiss_input_256 = kiss_fft_256.getInputTimeDataBuffer();
        kiss_fft_512 = new Module_KISS_.KissFftReal(512);
        kiss_input_512 = kiss_fft_512.getInputTimeDataBuffer();
        kiss_fft_1024 = new Module_KISS_.KissFftReal(1024);
        kiss_input_1024 = kiss_fft_1024.getInputTimeDataBuffer();
        kiss_fft_2048 = new Module_KISS_.KissFftReal(2048);
        kiss_input_2048 = kiss_fft_2048.getInputTimeDataBuffer();
        resolve();
    });
};

const perform_KISS = (input, instance, testData) => {
    input.set(testData.slice()); return instance.transform();
};

const example_KISS = (testData) => {
    let testData64 = Float64Array.from(testData.slice());
    return perform_INDUTNY(indutny_f_1024, indutny_out_1024, testData64.slice()).slice();
}

//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM DSP
//////////////////////////////////////
let dsp_fft_128;
let dsp_fft_256;
let dsp_fft_512;
let dsp_fft_1024;
let dsp_fft_2048;

function initializeDSP(){
    return new Promise((resolve, reject) => {
        dsp_fft_128 = new FFT(128, 44100);
        dsp_fft_256 = new FFT(256, 44100);
        dsp_fft_512 = new FFT(512, 44100);
        dsp_fft_1024 = new FFT(1024, 44100);
        dsp_fft_2048 = new FFT(2048, 44100);
        resolve();
    });
}    

const perform_DSP = (instance, testData) => {
    instance.forward(testData.slice()); 
    let result = [];
    let real = instance.real;
    let imag = instance.imag;
    for(let i = 0; i < testData.length; i++){
        result.push(real[i]);
        result.push(imag[i]);
    }

    return result;
};

const example_DSP = (testData) => {
    let testData64 = Float64Array.from(testData.slice());
    return perform_DSP(dsp_fft_1024, testData64.slice()).slice();
}

//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM OOURA
//////////////////////////////////////
let ooura_oo_128;
let ooura_oo_256;
let ooura_oo_512;
let ooura_oo_1024;
let ooura_oo_2048;

function initializeOOURA(){
    return new Promise((resolve, reject) => {
        ooura_oo_128 = new Ooura(128, {"type":"real", "radix":4} );
        ooura_oo_256 = new Ooura(256, {"type":"real", "radix":4} );
        ooura_oo_512 = new Ooura(512, {"type":"real", "radix":4} );
        ooura_oo_1024 = new Ooura(1024, {"type":"real", "radix":4} );
        ooura_oo_2048 = new Ooura(2048, {"type":"real", "radix":4} );
        resolve();
    });
}

const perform_OOURA = (instance, testData) => {
    let ooura_data = testData.slice(); instance.fftInPlace(ooura_data.buffer); return ooura_data;
};

const example_OOURA = (testData) => {
    let testData64 = Float64Array.from(testData.slice());
    return perform_OOURA(ooura_oo_1024, testData64.slice()).slice();
}

//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM INDUTNY
//////////////////////////////////////
let indutny_f_128,  indutny_out_128;
let indutny_f_256,  indutny_out_256;
let indutny_f_512,  indutny_out_512;
let indutny_f_1024, indutny_out_1024;
let indutny_f_2048, indutny_out_2048;

function initializeINDUTNY(){
    return new Promise((resolve, reject) => {
        indutny_f_128 = new IND_FFT(128);
        indutny_out_128 = indutny_f_128.createComplexArray();
        indutny_f_256 = new IND_FFT(256);
        indutny_out_256 = indutny_f_256.createComplexArray();
        indutny_f_512 = new IND_FFT(512);
        indutny_out_512 = indutny_f_512.createComplexArray();
        indutny_f_1024 = new IND_FFT(1024);
        indutny_out_1024 = indutny_f_1024.createComplexArray();
        indutny_f_2048 = new IND_FFT(2048);
        indutny_out_2048 = indutny_f_2048.createComplexArray();
        resolve();
    });
}

const perform_INDUTNY = (instance, out, testData) => {
    instance.realTransform(out, testData.slice()); return out;
};

const example_INDUTNY = (testData) => {
    return perform_KISS(kiss_input_1024, kiss_fft_1024, testData.slice()).slice();
}

//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM OINK
//////////////////////////////////////
const perform_OINK = (instance, testData) => {
    return instance(testData.slice());
};

const example_OINK = (testData) => {
    return perform_OINK(fftReal1024, testData.slice()).slice();
}

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
    let testData32 = testData.slice();
    let testData64 = Float64Array.from(testData.slice());
    let func;

    if(type == "INDUTNY"){
        if(size ==  128){ func = () => { perform_INDUTNY(indutny_f_128,  indutny_out_128,  testData32); }; }
        if(size ==  256){ func = () => { perform_INDUTNY(indutny_f_256,  indutny_out_256,  testData32); }; }
        if(size ==  512){ func = () => { perform_INDUTNY(indutny_f_512,  indutny_out_512,  testData32); }; }
        if(size == 1024){ func = () => { perform_INDUTNY(indutny_f_1024, indutny_out_1024, testData32); }; }
        if(size == 2048){ func = () => { perform_INDUTNY(indutny_f_2048, indutny_out_2048, testData32); }; }
    }

    if(type == "DSP"){
        if(size ==  128){ func = () => { perform_DSP(dsp_fft_128, testData64); }; }
        if(size ==  256){ func = () => { perform_DSP(dsp_fft_256, testData64); }; }
        if(size ==  512){ func = () => { perform_DSP(dsp_fft_512, testData64); }; }
        if(size == 1024){ func = () => { perform_DSP(dsp_fft_1024, testData64); }; }
        if(size == 2048){ func = () => { perform_DSP(dsp_fft_2048, testData64); }; }
    }

    if(type == "OOURA"){
        if(size ==  128){ func = () => { perform_OOURA(ooura_oo_128, testData64); }; }
        if(size ==  256){ func = () => { perform_OOURA(ooura_oo_256, testData64); }; }
        if(size ==  512){ func = () => { perform_OOURA(ooura_oo_512, testData64); }; }
        if(size == 1024){ func = () => { perform_OOURA(ooura_oo_1024, testData64); }; }
        if(size == 2048){ func = () => { perform_OOURA(ooura_oo_2048, testData64); }; }
    }

    if(type == "KISS"){
        if(size ==  128){ func = () => { perform_KISS(kiss_input_128, kiss_fft_128, testData64); }; }
        if(size ==  256){ func = () => { perform_KISS(kiss_input_256, kiss_fft_256, testData64); }; }
        if(size ==  512){ func = () => { perform_KISS(kiss_input_512, kiss_fft_512, testData64); }; }
        if(size == 1024){ func = () => { perform_KISS(kiss_input_1024, kiss_fft_1024, testData64); }; }
        if(size == 2048){ func = () => { perform_KISS(kiss_input_2048, kiss_fft_2048, testData64); }; }
    }

    if(type == "OINK"){
        if(size ==  128){ func = () => { perform_OINK(fftReal128, testData32); }; }
        if(size ==  256){ func = () => { perform_OINK(fftReal256, testData32); }; }
        if(size ==  512){ func = () => { perform_OINK(fftReal512, testData32); }; }
        if(size == 1024){ func = () => { perform_OINK(fftReal1024, testData32); }; }
        if(size == 2048){ func = () => { perform_OINK(fftReal2048, testData32); }; }
    }

    const startTime = performance.now(); // Start time
    for (let i = 0; i < NUM_OPS; i++){
        func();
    }
    const endTime = performance.now(); // End time
    const elapsedTime = endTime - startTime; // Elapsed time in milliseconds

    return elapsedTime;
};

///////////////////////////////////////////////////////////////////////////////////////////////////////

const FFT_BANK = new Map();

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

FFT_BANK.set("INDUTNY",{
    idname: "INDUTNY", 
    fullname: "FFT.JS (indutny)", 
    url: "https://github.com/indutny/fft.js/", 
    res: new Map(),
    example: example_INDUTNY,
    precision: "float"
});

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

async function setup(){
    // Call each initialization function asynchronously using await
    $loading_info.text("Initializing INDUTNY..."); await initializeINDUTNY();
    $loading_info.text("Initializing DSP...");     await initializeDSP();
    $loading_info.text("Initializing OOURA...");   await initializeOOURA();
    $loading_info.text("Initializing KISS...");    Module_KISS_ = await Module_KISS(); await initializeKISS();
    $loading_info.text("Initializing OINK...");    Module_OINK_ = await Module_OINK(); await initializeModuleOINK();
};


///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// TESTING PERFORMANCE ///////////////////////////////////////////////

// Define the number of FFT operations to perform
const numOPs = 10000;

// Generate test data as Float32Array
const generateTestData = (size) => {
    const testData = new Float32Array(size);
    for (let i = 0; i < size; i++) {
        // For demonstration purposes, generate random data between -1 and 1
        testData[i] = Math.random() * 2 - 1;
    }
    return testData;
};

let testData8      = generateTestData(8);
let testData16     = generateTestData(16);
let testData32     = generateTestData(32);
let testData64     = generateTestData(64);
let testData128    = generateTestData(128);
let testData256    = generateTestData(256);
let testData512    = generateTestData(512);
let testData1024   = generateTestData(1024);
let testData2048   = generateTestData(2048);
let testData4096   = generateTestData(4096);

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
        resolve();
    });
};

const perform_KISS = (input, instance, testData) => {
    input.set(testData.slice()); instance.transform();
};

//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM DSP
//////////////////////////////////////
let dsp_fft_128;
let dsp_fft_256;
let dsp_fft_512;
let dsp_fft_1024;

function initializeDSP(){
    return new Promise((resolve, reject) => {
        dsp_fft_128 = new FFT(128, 44100);
        dsp_fft_256 = new FFT(256, 44100);
        dsp_fft_512 = new FFT(512, 44100);
        dsp_fft_1024 = new FFT(1024, 44100);
        resolve();
    });
}    

const perform_DSP = (instance, testData) => {
    instance.forward(testData.slice());
};

//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM OOURA
//////////////////////////////////////
let ooura_oo_128;
let ooura_oo_256;
let ooura_oo_512;
let ooura_oo_1024;

function initializeOOURA(){
    return new Promise((resolve, reject) => {
        ooura_oo_128 = new Ooura(128, {"type":"real", "radix":4} );
        ooura_oo_256 = new Ooura(256, {"type":"real", "radix":4} );
        ooura_oo_512 = new Ooura(512, {"type":"real", "radix":4} );
        ooura_oo_1024 = new Ooura(1024, {"type":"real", "radix":4} );
        resolve();
    });
}

const perform_OOURA = (instance, testData) => {
    let ooura_data = testData.slice(); instance.fftInPlace(ooura_data.buffer);
};

//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM INDUTNY
//////////////////////////////////////
let indutny_f_128,  indutny_out_128;
let indutny_f_256,  indutny_out_256;
let indutny_f_512,  indutny_out_512;
let indutny_f_1024, indutny_out_1024;

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
        resolve();
    });
}

const perform_INDUTNY = (instance, out, testData) => {
    instance.realTransform(out, testData.slice());
};

//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM OINK
//////////////////////////////////////
const perform_OINK = (instance, testData) => {
    instance(testData.slice());
};

//////////////////////////////////////
//////////////////////////////////////
// Only Copy per Slicing
//////////////////////////////////////
const perform_slice = (fftSize, testData) => {
    if(fftSize == 128){ for (let i = 0; i < numOPs; i++) { testData.slice(); } }
    if(fftSize == 256){ for (let i = 0; i < numOPs; i++) { testData.slice(); } }
    if(fftSize == 512){ for (let i = 0; i < numOPs; i++) { testData.slice(); } }
    if(fftSize == 1024){for (let i = 0; i < numOPs; i++) { testData.slice(); } }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////
//////////////////////////////////////
// Measure the time taken to perform FFT operations
//////////////////////////////////////
const measureSlicing = (type, fftSize, testData) => {
    let testData32 = testData.slice();
    let testData64 = Float64Array.from(testData.slice());

    const startTime = performance.now(); // Start time
    if(type == "INDUTNY"){ perform_slice(fftSize, testData32); }
    if(type == "DSP"){     perform_slice(fftSize, testData64); }
    if(type == "OOURA"){   perform_slice(fftSize, testData64); }
    if(type == "KISS"){    perform_slice(fftSize, testData64); }
    if(type == "OINK"){    perform_slice(fftSize, testData32); }
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
    }

    if(type == "DSP"){
        if(size ==  128){ func = () => { perform_DSP(dsp_fft_128, testData64); }; }
        if(size ==  256){ func = () => { perform_DSP(dsp_fft_256, testData64); }; }
        if(size ==  512){ func = () => { perform_DSP(dsp_fft_512, testData64); }; }
        if(size == 1024){ func = () => { perform_DSP(dsp_fft_1024, testData64); }; }
    }

    if(type == "OOURA"){
        if(size ==  128){ func = () => { perform_OOURA(ooura_oo_128, testData64); }; }
        if(size ==  256){ func = () => { perform_OOURA(ooura_oo_256, testData64); }; }
        if(size ==  512){ func = () => { perform_OOURA(ooura_oo_512, testData64); }; }
        if(size == 1024){ func = () => { perform_OOURA(ooura_oo_1024, testData64); }; }
    }

    if(type == "KISS"){
        if(size ==  128){ func = () => { perform_KISS(kiss_input_128, kiss_fft_128, testData64); }; }
        if(size ==  256){ func = () => { perform_KISS(kiss_input_256, kiss_fft_256, testData64); }; }
        if(size ==  512){ func = () => { perform_KISS(kiss_input_512, kiss_fft_512, testData64); }; }
        if(size == 1024){ func = () => { perform_KISS(kiss_input_1024, kiss_fft_1024, testData64); }; }
    }

    if(type == "OINK"){
        if(size ==  128){ func = () => { perform_OINK(fftReal128, testData32); }; }
        if(size ==  256){ func = () => { perform_OINK(fftReal256, testData32); }; }
        if(size ==  512){ func = () => { perform_OINK(fftReal512, testData32); }; }
        if(size == 1024){ func = () => { perform_OINK(fftReal1024, testData32); }; }
    }

    const startTime = performance.now(); // Start time
    for (let i = 0; i < numOPs; i++){
        func();
    }
    const endTime = performance.now(); // End time
    const elapsedTime = endTime - startTime; // Elapsed time in milliseconds

    return elapsedTime;
};

///////////////////////////////////////////////////////////////////////////////////////////////////////
const DELAY_BETWEEN_ITERATIONS = 2;
let WARMUPS = 3;
let RUNS = 6;

var SIGNALS_FOR_EACH_FFT = [];

var OINK_FFT_RESULTS    = new Map();
var INDUTNY_FFT_RESULTS = new Map();
var OOURA_FFT_RESULTS   = new Map();
var DSP_FFT_RESULTS     = new Map();
var KISS_FFT_RESULTS    = new Map();

const runPerformance = async (type) => {
    let s = 0;
    for (let size = 128; size <= 1024; size *= 2) {
        let avrg_ops = 0;

        // Warm up
        for (let run = 0; run < WARMUPS; run++) {
            await measureFFT(type, size, SIGNALS_FOR_EACH_FFT[s][run]);
        }

        // Run Measurement
        for (let run = 0; run < RUNS; run++) {
            let eT_slice = await measureSlicing(type, size, SIGNALS_FOR_EACH_FFT[s][run]);
            let eT_FFT = await measureFFT(type, size, SIGNALS_FOR_EACH_FFT[s][run]);
            let ops = Math.floor(numOPs / ((eT_FFT - eT_slice) / 1000));
            avrg_ops += ops;

            // Introduce a delay between iterations
            await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_ITERATIONS));
        }

        avrg_ops = Math.floor(avrg_ops / RUNS);
        if (type == "INDUTNY") { INDUTNY_FFT_RESULTS.set(size, avrg_ops); }
        if (type == "OOURA") { OOURA_FFT_RESULTS.set(size, avrg_ops); }
        if (type == "DSP") { DSP_FFT_RESULTS.set(size, avrg_ops); }
        if (type == "KISS") { KISS_FFT_RESULTS.set(size, avrg_ops); }
        if (type == "OINK") { OINK_FFT_RESULTS.set(size, avrg_ops); }
        s++;
    }
};





///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// HTML CREATION       ///////////////////////////////////////////////


$(document).ready(async function(){
    // Call each initialization function asynchronously using await
    await initializeINDUTNY();
    await initializeDSP();
    await initializeOOURA();
    
    var j = 0;
    for (var size = 128; size <= 1024; size *= 2) {
       var SIGNALS = [];
       for(let i = 0; i<RUNS; i++){
          let signal = generateTestData(size);
          SIGNALS.push(signal);
       }
       SIGNALS_FOR_EACH_FFT.push(SIGNALS);
       j++;
    }

    // After all initialization is done, run performance tests and add performance rows
    await runPerformance("INDUTNY");
    await addPerformanceRow("INDUTNY", INDUTNY_FFT_RESULTS);
    await runPerformance("DSP");
    await addPerformanceRow("DSP", DSP_FFT_RESULTS);
    await runPerformance("OOURA");
    await addPerformanceRow("OOURA", OOURA_FFT_RESULTS);
});


/*
$(document).ready(function(){
    let initialized = 0;
    Module_KISS().then(function(Module) {
        Module_KISS_ = Module;
        initializeKISS();
        console.log("INITIALIZED KISS");
        runPerformance("KISS");    addPerformanceRow("KISS", KISS_FFT_RESULTS);
        if(++initialized == 2){ $loading.hide(); }
    });

    Module_OINK().then(function(Module) {
        Module_OINK_ = Module;
        initializeModuleOINK();
        console.log("INITIALIZED OINK");
        runPerformance("OINK");    addPerformanceRow("OINK", OINK_FFT_RESULTS);
        if(++initialized == 2){ $loading.hide(); }
    });
});*/







/*
function runComparison(){
    let error;
    error = 1e-3;
    console.log("\n\nCompare to Reference with acceptable Error ",error," :");
    console.log("128:  ",compareFFTResults(fftReal_ref(testData128), fftReal128(testData128),error));
    console.log("256:  ",compareFFTResults(fftReal_ref(testData256), fftReal256(testData256),error));
    console.log("512:  ",compareFFTResults(fftReal_ref(testData512), fftReal512(testData512),error));
    console.log("1024: ",compareFFTResults(fftReal_ref(testData1024),fftReal1024(testData1024),error));

    error = 1e-4;
    console.log("\n\nCompare to Reference with acceptable Error ",error," :");
    console.log("128:  ",compareFFTResults(fftReal_ref(testData128), fftReal128(testData128),error));
    console.log("256:  ",compareFFTResults(fftReal_ref(testData256), fftReal256(testData256),error));
    console.log("512:  ",compareFFTResults(fftReal_ref(testData512), fftReal512(testData512),error));
    console.log("1024: ",compareFFTResults(fftReal_ref(testData1024),fftReal1024(testData1024),error));

    error = 1e-5;
    console.log("\n\nCompare to Reference with acceptable Error ",error," :");
    console.log("128:  ",compareFFTResults(fftReal_ref(testData128), fftReal128(testData128),error));
    console.log("256:  ",compareFFTResults(fftReal_ref(testData256), fftReal256(testData256),error));
    console.log("512:  ",compareFFTResults(fftReal_ref(testData512), fftReal512(testData512),error));
    console.log("1024: ",compareFFTResults(fftReal_ref(testData1024),fftReal1024(testData1024),error));

    error = 1e-6;
    console.log("\n\nCompare to Reference with acceptable Error ",error," :");
    console.log("128:  ",compareFFTResults(fftReal_ref(testData128), fftReal128(testData128),error));
    console.log("256:  ",compareFFTResults(fftReal_ref(testData256), fftReal256(testData256),error));
    console.log("512:  ",compareFFTResults(fftReal_ref(testData512), fftReal512(testData512),error));
    console.log("1024: ",compareFFTResults(fftReal_ref(testData1024),fftReal1024(testData1024),error));
}

function runForthAndBack(){
    let error;
    
    let signal128  = IFFT128onHalf(fftReal128(testData128).slice(0,128+2));
    let signal256  = IFFT256onHalf(fftReal256(testData256).slice(0,256+2));
    let signal512  = IFFT512onHalf(fftReal512(testData512).slice(0,512+2));
    let signal1024 = IFFT1024onHalf(fftReal1024(testData1024).slice(0,1024+2));

    error = 1e-3;
    console.log("\n\nCompare after Forth and Back with acceptable Error ",error," :");
    console.log("128:   ",compareFFTResults(testData128, signal128 ,error));
    console.log("256:   ",compareFFTResults(testData256, signal256 ,error));
    console.log("512:   ",compareFFTResults(testData512, signal512 ,error));
    console.log("1024:  ",compareFFTResults(testData1024, signal1024 ,error));

    error = 1e-4;
    console.log("\n\nCompare after Forth and Back with acceptable Error ",error," :");
    console.log("128:   ",compareFFTResults(testData128, signal128 ,error));
    console.log("256:   ",compareFFTResults(testData256, signal256 ,error));
    console.log("512:   ",compareFFTResults(testData512, signal512 ,error));
    console.log("1024:  ",compareFFTResults(testData1024, signal1024 ,error));

    error = 1e-5;
    console.log("\n\nCompare after Forth and Back with acceptable Error ",error," :");
    console.log("128:   ",compareFFTResults(testData128, signal128 ,error));
    console.log("256:   ",compareFFTResults(testData256, signal256 ,error));
    console.log("512:   ",compareFFTResults(testData512, signal512 ,error));
    console.log("1024:  ",compareFFTResults(testData1024, signal1024 ,error));

    error = 1e-6;
    console.log("\n\nCompare after Forth and Back with acceptable Error ",error," :");
    console.log("128:   ",compareFFTResults(testData128, signal128 ,error));
    console.log("256:   ",compareFFTResults(testData256, signal256 ,error));
    console.log("512:   ",compareFFTResults(testData512, signal512 ,error));
    console.log("1024:  ",compareFFTResults(testData1024, signal1024 ,error));
}
*/
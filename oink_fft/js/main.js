///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// TESTING PERFORMANCE ///////////////////////////////////////////////

// Define the number of FFT operations to perform
const numOperations = 10000; // You can adjust this number based on your requirements

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


//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM KISS
//////////////////////////////////////
let kiss_fft_128, kiss_input_128;
let kiss_fft_256, kiss_input_256;
let kiss_fft_512, kiss_input_512;
let kiss_fft_1024,kiss_input_1024;
/*
function initializeModuleKISS(){
    kiss_fft_128 = new Module_KISS.KissFftReal(128);
    kiss_input_128 = kiss_fft_128.getInputTimeDataBuffer();
    kiss_fft_256 = new Module_KISS.KissFftReal(256);
    kiss_input_256 = kiss_fft_256.getInputTimeDataBuffer();
    kiss_fft_512 = new Module_KISS.KissFftReal(512);
    kiss_input_512 = kiss_fft_512.getInputTimeDataBuffer();
    kiss_fft_1024 = new Module_KISS.KissFftReal(1024);
    kiss_input_1024 = kiss_fft_1024.getInputTimeDataBuffer();
};*/

const perform_KISS = (fftSize, testData) => {
    if(fftSize == 128){ for (let i = 0; i < numOperations; i++) { kiss_input_128.set(testData.slice()); kiss_fft_128.transform(); } }
    if(fftSize == 256){ for (let i = 0; i < numOperations; i++) { kiss_input_256.set(testData.slice()); kiss_fft_256.transform(); } }
    if(fftSize == 512){ for (let i = 0; i < numOperations; i++) { kiss_input_512.set(testData.slice()); kiss_fft_512.transform(); } }
    if(fftSize == 1024){for (let i = 0; i < numOperations; i++) { kiss_input_1024.set(testData.slice()); kiss_fft_1024.transform(); } }
};

//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM DSP
//////////////////////////////////////
var dsp_fft_128 = new FFT(128, 44100);
var dsp_fft_256 = new FFT(256, 44100);
var dsp_fft_512 = new FFT(512, 44100);
var dsp_fft_1024 = new FFT(1024, 44100);
const perform_DSP = (fftSize, testData) => {
    if(fftSize == 128){ for (let i = 0; i < numOperations; i++) { dsp_fft_128.forward(testData.slice()); } }
    if(fftSize == 256){ for (let i = 0; i < numOperations; i++) { dsp_fft_256.forward(testData.slice()); } }
    if(fftSize == 512){ for (let i = 0; i < numOperations; i++) { dsp_fft_512.forward(testData.slice()); } }
    if(fftSize == 1024){for (let i = 0; i < numOperations; i++) { dsp_fft_1024.forward(testData.slice()); } }
};

//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM OOURA
//////////////////////////////////////
let ooura_oo_128 = new Ooura(128, {"type":"real", "radix":4} );
let ooura_oo_256 = new Ooura(256, {"type":"real", "radix":4} );
let ooura_oo_512 = new Ooura(512, {"type":"real", "radix":4} );
let ooura_oo_1024 = new Ooura(1024, {"type":"real", "radix":4} );
const perform_OOURA = (fftSize, testData) => {
    if(fftSize == 128){ for (let i = 0; i < numOperations; i++) { let ooura_data = testData.slice(); ooura_oo_128.fftInPlace(ooura_data.buffer); } }
    if(fftSize == 256){ for (let i = 0; i < numOperations; i++) { let ooura_data = testData.slice(); ooura_oo_256.fftInPlace(ooura_data.buffer); } }
    if(fftSize == 512){ for (let i = 0; i < numOperations; i++) { let ooura_data = testData.slice(); ooura_oo_512.fftInPlace(ooura_data.buffer); } }
    if(fftSize == 1024){for (let i = 0; i < numOperations; i++) { let ooura_data = testData.slice(); ooura_oo_1024.fftInPlace(ooura_data.buffer); } }
};

//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM INDUTNY
//////////////////////////////////////
const indutny_f_128 = new IND_FFT(128);
const indutny_out_128 = indutny_f_128.createComplexArray();
const indutny_f_256 = new IND_FFT(256);
const indutny_out_256 = indutny_f_256.createComplexArray();
const indutny_f_512 = new IND_FFT(512);
const indutny_out_512 = indutny_f_512.createComplexArray();
const indutny_f_1024 = new IND_FFT(1024);
const indutny_out_1024 = indutny_f_1024.createComplexArray();
const perform_INDUTNY = (fftSize, testData) => {
    if(fftSize == 128){ for (let i = 0; i < numOperations; i++) { indutny_f_128.realTransform(indutny_out_128, testData.slice()); } }
    if(fftSize == 256){ for (let i = 0; i < numOperations; i++) { indutny_f_256.realTransform(indutny_out_256, testData.slice()); } }
    if(fftSize == 512){ for (let i = 0; i < numOperations; i++) { indutny_f_512.realTransform(indutny_out_512, testData.slice()); } }
    if(fftSize == 1024){for (let i = 0; i < numOperations; i++) { indutny_f_1024.realTransform(indutny_out_1024, testData.slice()); } }
};

//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM OINK
//////////////////////////////////////
const perform_OINK = (fftSize, testData) => {
    if(fftSize == 128){ for (let i = 0; i < numOperations; i++) { fftReal128(testData.slice()); } }
    if(fftSize == 256){ for (let i = 0; i < numOperations; i++) { fftReal256(testData.slice()); } }
    if(fftSize == 512){ for (let i = 0; i < numOperations; i++) { fftReal512(testData.slice()); } }
    if(fftSize == 1024){for (let i = 0; i < numOperations; i++) { fftReal1024(testData.slice());} }
};

//////////////////////////////////////
//////////////////////////////////////
// Only Copy per Slicing
//////////////////////////////////////
const perform_slice = (fftSize, testData) => {
    if(fftSize == 128){ for (let i = 0; i < numOperations; i++) { testData.slice(); } }
    if(fftSize == 256){ for (let i = 0; i < numOperations; i++) { testData.slice(); } }
    if(fftSize == 512){ for (let i = 0; i < numOperations; i++) { testData.slice(); } }
    if(fftSize == 1024){for (let i = 0; i < numOperations; i++) { testData.slice(); } }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////
//////////////////////////////////////
// Measure the time taken to perform FFT operations
//////////////////////////////////////
const measureSlicing = (type, fftSize, testData) => {
    let testData64 = Float64Array.from(testData.slice());

    const startTime = performance.now(); // Start time
    if(type == "INDUTNY"){ perform_slice(fftSize, testData); }
    if(type == "OOURA"){ perform_slice(fftSize, testData64); }
    if(type == "DSP"){ perform_slice(fftSize, testData64); }
    if(type == "KISS"){ perform_slice(fftSize, testData64); }
    if(type == "OINK"){ perform_slice(fftSize, testData); }
    const endTime = performance.now(); // End time
    const elapsedTime = endTime - startTime; // Elapsed time in milliseconds

    return elapsedTime;
};

const measureFFT = (type, fftSize, testData) => {
    let testData64 = Float64Array.from(testData.slice());

    const startTime = performance.now(); // Start time
    if(type == "INDUTNY"){ perform_INDUTNY(fftSize, testData); }
    if(type == "OOURA"){ perform_OOURA(fftSize, testData64); }
    if(type == "DSP"){ perform_DSP(fftSize, testData64); }
    if(type == "KISS"){ perform_KISS(fftSize, testData64); }
    if(type == "OINK"){ perform_OINK(fftSize, testData); }
    const endTime = performance.now(); // End time
    const elapsedTime = endTime - startTime; // Elapsed time in milliseconds

    return elapsedTime;
};

///////////////////////////////////////////////////////////////////////////////////////////////////////
let RUNS = 10;

var SIGNAL = [];

var OINK_FFT_RESULTS = new Map();
var INDUTNY_FFT_RESULTS = new Map();
var OOURA_FFT_RESULTS = new Map();
var DSP_FFT_RESULTS = new Map();
var KISS_FFT_RESULTS = new Map();

var j = 0;
for (var size = 128; size <= 1024; size *= 2) {
   var SIGNALS = [];
   for(let i = 0; i<RUNS; i++){
      let signal = generateTestData(size);
      SIGNALS.push(signal);
   }
   SIGNAL.push(SIGNALS);
   j++;
}

function runPerformance(type){
    //console.log("\n\nPerformance Test:");
    let j = 0;
    for (var size = 128; size <= 1024; size *= 2) {
        let avrg_ops = 0;
        // WARM UP
        for(let i = 0; i<4; i++){
           measureFFT(type, size, SIGNAL[j][i]);
        }
        // Run Measurement
        for(let i = 0; i<RUNS; i++){
          let eT_slice = measureSlicing(type, size, SIGNAL[j][i]);
          let eT_FFT   = measureFFT(type, size, SIGNAL[j][i]);
          let ops = Math.floor(numOperations / ((eT_FFT-eT_slice) / 1000));
          avrg_ops += ops;
        }
        avrg_ops = Math.floor(avrg_ops/RUNS);
        if(type == "INDUTNY"){ INDUTNY_FFT_RESULTS.set(size, avrg_ops); } 
        if(type == "OOURA"){ OOURA_FFT_RESULTS.set(size, avrg_ops); }
        if(type == "DSP"){ DSP_FFT_RESULTS.set(size, avrg_ops); }
        if(type == "KISS"){ KISS_FFT_RESULTS.set(size, avrg_ops); }
        if(type == "OINK"){ OINK_FFT_RESULTS.set(size, avrg_ops); }
        j++;
    }
}

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

///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// HTML CREATION       ///////////////////////////////////////////////


$(document).ready(function(){
    var $title_div = $("<div>").attr("id", "title_div");
    $("#root").append($title_div);

    var $title = $("<h1>").text("OINK FFT").attr("id", "title");
    $title_div.append($title);

    var $subtitle = $("<h2>").text("the oinkiest FFT in the web").attr("id", "subtitle");
    $title_div.append($subtitle);

    var $stats_div = $("<div>").attr("id", "stats_div");
    $("#root").append($stats_div);
    
    // Create the loading circle element
    var $loading = $('<div class="loading-circle"></div>');
    $stats_div.append($loading);

    function createPerformanceTable(){
        $stats_div.empty();

        // Create a table element
        var $table = $("<table>").attr("id", "fft-table");
        // Create table header
        var $thead = $("<thead>").appendTo($table);
        var $trHead = $("<tr>").appendTo($thead);
        $("<th>").text("FFT Performance (measured in OINKS per second)").attr("colspan", 6).appendTo($trHead); // colspan to span all columns
        // Create table body
        var $tbody = $("<tbody>").appendTo($table);

        // HEADER
        var $tr_sizes = $("<tr>").attr("id", "tr_header").appendTo($tbody); 
        $("<td>").text("FFT size").appendTo($tr_sizes);
        for (var size = 128; size <= 1024; size *= 2) {
            $("<td>").text(size).appendTo($tr_sizes);
        }

        // INDUTNY FFT
        var $tr1 = $("<tr>").appendTo($tbody); 
        $("<td>").text("fft.js (indutny)").appendTo($tr1);
        for (var size = 128; size <= 1024; size *= 2) {
            $("<td>").text( INDUTNY_FFT_RESULTS.get(size)).appendTo($tr1);
        }

        // OOURA FFT
        var $tr2 = $("<tr>").appendTo($tbody); 
        $("<td>").text("OOURA (audioplastic)").appendTo($tr2);
        for (var size = 128; size <= 1024; size *= 2) {
            $("<td>").text( OOURA_FFT_RESULTS.get(size)).appendTo($tr2);
        }

        // DSP FFT
        var $tr3 = $("<tr>").appendTo($tbody); 
        $("<td>").text("dsp.js (corbanbrook)").appendTo($tr3);
        for (var size = 128; size <= 1024; size *= 2) {
            $("<td>").text( DSP_FFT_RESULTS.get(size)).appendTo($tr3);
        }

        // KISS FFT
        var $tr4 = $("<tr>").appendTo($tbody); 
        $("<td>").text("KISS (mborgerding)").appendTo($tr4);
        for (var size = 128; size <= 1024; size *= 2) {
            $("<td>").text( DSP_FFT_RESULTS.get(size)).appendTo($tr4);
        }

        // OINK FFT
        var $tr5 = $("<tr>").appendTo($tbody); 
        $("<td>").text("OINK (sch1z0net)").appendTo($tr5);
        for (var size = 128; size <= 1024; size *= 2) {
            $("<td>").text( OINK_FFT_RESULTS.get(size)).appendTo($tr5);
        }

        // Append the table to the body
        $stats_div.append($table);
    }


    var $descr_div = $("<div>").attr("id", "descr_div");
    $("#root").append($descr_div);
    $descr_div.text("According to ChatGPT, OINK FFT stands for: Outrageously Insane, Notoriously Quick Fast Fourier Transform!");
    
    
    let init_count = 0;
    function run(){
        init_count++;
        if(init_count == 2){
          runPerformance("INDUTNY");
          runPerformance("OOURA");
          runPerformance("DSP");
          //runPerformance("KISS");
          runPerformance("OINK");
          //runComparison();
          //runForthAndBack();
          createPerformanceTable();           
        }
    }

    // Check if the module is already initialized, otherwise wait for initialization
    if (Module_OINK.isRuntimeInitialized) {
        initializeModuleOINK();
        console.log("INITIALIZED OINK");
        run();
    } else {
        Module_OINK.onRuntimeInitialized = function(){
            initializeModuleOINK();
            console.log("INITIALIZED OINK");
            run();
        };
    }

    /*
    // Check if the module is already initialized, otherwise wait for initialization
    if (Module_KISS.isRuntimeInitialized) {
        initializeModuleKISS();
        console.log("INITIALIZED KISS");
        run();
    } else {
        Module_KISS.onRuntimeInitialized = function(){
            initializeModuleKISS();
            console.log("INITIALIZED KISS");
            run();
        };
    }*/
});
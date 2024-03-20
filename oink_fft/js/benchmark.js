///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// TESTING PERFORMANCE ///////////////////////////////////////////////
let NUM_OPS = 7500;
let WARMUPS = 3;
let RUNS = 8;

let DELAY_BETWEEN_ITERATIONS = 0.35;



///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// HTML CREATION       ///////////////////////////////////////////////
let MAX_ = new Map();
function updateMax(size, ops, name){
    if(MAX_.get(size).ops < ops){ 
        MAX_.set(size, {name: name, ops: ops }); 
    }
}

function highlightComparison(){
    for (var size = 128; size <= MAX_PERF_SIZE; size *= 2) {
         MAX_.set(size, {name: '-', ops: 0 });
    }
    for (var size = 128; size <= MAX_PERF_SIZE; size *= 2) {
         updateMax(size, OINK_FFT_RESULTS.get(size),    "OINK");
         updateMax(size, INDUTNY_FFT_RESULTS.get(size), "INDUTNY");
         updateMax(size, OOURA_FFT_RESULTS.get(size),   "OOURA");
         updateMax(size, DSP_FFT_RESULTS.get(size),     "DSP");
         updateMax(size, KISS_FFT_RESULTS.get(size),    "KISS");
    }
    for (var size = 128; size <= MAX_PERF_SIZE; size *= 2) {
         let best = MAX_.get(size).name;
         let id = best+"_"+size;
         $("#"+id).addClass("bestPerf");
    }
}

function resetData(){
    SIGNALS_FOR_EACH_FFT = [];
    OINK_FFT_RESULTS    = new Map();
    INDUTNY_FFT_RESULTS = new Map();
    OOURA_FFT_RESULTS   = new Map();
    DSP_FFT_RESULTS     = new Map();
    KISS_FFT_RESULTS    = new Map();
}


///////////////////////////////////////////////////////////////////////////////////////////////////////
const runPerformance = async (type) => {
    let s = 0;
    for (let size = 128; size <= MAX_PERF_SIZE; size *= 2) {
        let avrg_ops = 0;

        // Warm up
        for (let run = 0; run < WARMUPS; run++) {
            await measureFFT(type, size, SIGNALS_FOR_EACH_FFT[s][run]);
        }

        // Run Measurement
        let errors = 0;
        for (let run = WARMUPS; run < RUNS+WARMUPS; run++) {
            let eT_slice = await measureSlicing(type, size, SIGNALS_FOR_EACH_FFT[s][run]);
            let eT_FFT = await measureFFT(type, size, SIGNALS_FOR_EACH_FFT[s][run]);
            let diff = eT_FFT - eT_slice;
            if(diff <= 0){ 
                if(errors < 3){ run--; errors++; continue; }
                avrg_ops = -1; break;
            }
            let ops = Math.floor(1000*NUM_OPS  / diff); //let ops = Math.floor(NUM_OPS  / (diff / 1000));
            avrg_ops += ops;
            if (    isNaN(avrg_ops)){ avrg_ops = -1; break; }
            if (!isFinite(avrg_ops)){ break; }
            
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


async function runAllPerformanceTests(){
    NUM_OPS = parseInt($numOpsSelect.val());
    RUNS    = parseInt($runsSelect.val());

    var j = 0;
    for (var size = 128; size <= MAX_PERF_SIZE; size *= 2) {
       var SIGNALS = [];
       for(let i = 0; i<RUNS+WARMUPS; i++){
          let signal = generateTestData(size);
          SIGNALS.push(signal);
       }
       SIGNALS_FOR_EACH_FFT.push(SIGNALS);
       j++;
    }

    // After all initialization is done, run performance tests and add performance rows
    $loading_info.text("Measure INDUTNY..."); 
    await runPerformance("INDUTNY");
    await addPerformanceRow(
        "FFT", 
        "FFT.JS (indutny)", 
        "https://github.com/indutny/fft.js/", 
        INDUTNY_FFT_RESULTS
    );
    await updateChart("INDUTNY", INDUTNY_FFT_RESULTS);
    $loading_info.text("Measure DSP..."); 
    await runPerformance("DSP");
    await addPerformanceRow(
        "DSP", 
        "DSP.JS (corbanbrook)", 
        "https://github.com/corbanbrook/dsp.js/",
        DSP_FFT_RESULTS
    );
    await updateChart("DSP", DSP_FFT_RESULTS);
    $loading_info.text("Measure OOURA..."); 
    await runPerformance("OOURA");
    await addPerformanceRow(
        "OOURA", 
        "OOURA (audioplastic)", 
        "https://github.com/audioplastic/ooura",
        OOURA_FFT_RESULTS
    );
    await updateChart("OOURA", OOURA_FFT_RESULTS);
    $loading_info.text("Measure KISS..."); 
    await runPerformance("KISS");    
    await addPerformanceRow(
        "KISS", 
        "KISS (mborgerding)", 
        "https://github.com/mborgerding/kissfft",
        KISS_FFT_RESULTS
    );
    await updateChart("KISS", KISS_FFT_RESULTS);
    $loading_info.text("Measure OINK..."); 
    await runPerformance("OINK");    
    await addPerformanceRow(
        "OINK", 
        "OINK (sch1z0net)", 
        "https://github.com/sch1z0net/oink",
        OINK_FFT_RESULTS
    );
    await updateChart("OINK", OINK_FFT_RESULTS);
    $loading_info.text("Finished!"); 
    
    await highlightComparison();

    $loading.hide();
    $reload.show();
}


function runErrorComparison(){
    let testData   = generateTestData(1024);
    let testData32 = testData.slice();
    let testData64 = Float64Array.from(testData.slice());

    let out_1 = output_INDUTNY(indutny_f_1024, indutny_out_1024, testData32.slice()).slice();
    let out_2 = output_DSP(dsp_fft_1024, testData64.slice()).slice();
    let out_3 = output_OOURA(ooura_oo_1024, testData64.slice()).slice();
    let out_4 = output_KISS(kiss_input_1024, kiss_fft_1024, testData64.slice()).slice();
    let out_5 = output_OINK(fftReal1024, testData32.slice()).slice();
    output_values.push(out_1,out_2,out_3,out_4,out_5);
    
    $("#out_slider").trigger('input');
}





$(document).ready(async function(){
    $reload.click(function(){
       $loading.show();
       $reload.hide();
       createPerformanceTable();
       createPerformanceCharts();
       resetData();
       runErrorComparison();
       runAllPerformanceTests();
    });

    // Call each initialization function asynchronously using await
    $loading_info.text("Initializing INDUTNY..."); await initializeINDUTNY();
    $loading_info.text("Initializing DSP...");     await initializeDSP();
    $loading_info.text("Initializing OOURA...");   await initializeOOURA();
    $loading_info.text("Initializing KISS...");    Module_KISS_ = await Module_KISS(); await initializeKISS();
    $loading_info.text("Initializing OINK...");    Module_OINK_ = await Module_OINK(); await initializeModuleOINK();

    await runErrorComparison();
    await runAllPerformanceTests();
});
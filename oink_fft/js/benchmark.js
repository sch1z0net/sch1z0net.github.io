///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// TESTING PERFORMANCE ///////////////////////////////////////////////
let NUM_OPS = 7500;
let WARMUPS = 3;
let RUNS = 8;

let DELAY_BETWEEN_ITERATIONS = 0.35;



///////////////////////////////////////////////////////////////////////////////////////////////////////
// Reset on each new Run
let SIGNALS_FOR_EACH_FFT = [];


///////////////////////////////////////////////////////////////////////////////////////////////////////
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
         FFT_BANK.forEach((value, key) => {
               updateMax(size, value.res.get(size), value.idname);
         });
    }
    for (var size = 128; size <= MAX_PERF_SIZE; size *= 2) {
         let best = MAX_.get(size).name;
         let id = best+"_"+size;
         $("#"+id).addClass("bestPerf");
    }
}

function resetData(){
    SIGNALS_FOR_EACH_FFT = [];
    FFT_BANK.forEach((value, key) => {
        value.res = new Map();
    });
}


///////////////////////////////////////////////////////////////////////////////////////////////////////
const runPerformance = async (type) => {
    for (let s = 0; s < PANELS.length; s++) {
        let size = PANELS[s];
        let avrg_ops = 0;

        // Warm up
        for (let run = 0; run < WARMUPS; run++) {
            await measureFFT(type, size, SIGNALS_FOR_EACH_FFT[size][run]);
        }

        // Run Measurement
        let errors = 0;
        for (let run = WARMUPS; run < RUNS+WARMUPS; run++) {
            let eT_slice = await measureSlicing(type, size, SIGNALS_FOR_EACH_FFT[size][run]);
            let eT_FFT = await measureFFT(type, size, SIGNALS_FOR_EACH_FFT[size][run]);
            let diff = eT_FFT - eT_slice;
            if(diff <= 0){ 
                if(errors < 5){ run--; errors++; continue; }
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
        FFT_BANK.get(type).res.set(size, avrg_ops);
    }
};


async function runAllPerformanceTests(){
    NUM_OPS = parseInt($numOpsSelect.val());
    RUNS    = parseInt($runsSelect.val());

    var j = 0;
    for (let s = 0; s < PANELS.length; s++) {
       let size = PANELS[s];

       var SIGNALS = [];
       for(let i = 0; i<RUNS+WARMUPS; i++){
          let signal = generateTestData(size);
          SIGNALS.push(signal);
       }
       SIGNALS_FOR_EACH_FFT.push(SIGNALS);
       j++;
    }

    for (let [key, value] of FFT_BANK) {
        let idname   = value.idname;
        let fullname = value.fullname;
        let url      = value.url;
        let results  = value.res;

        $loading_info.text("Measure " + idname + "...");
        await runPerformance(idname);
        await addPerformanceRow(idname, fullname, url, results);
        await updateChart(idname, results);
    }

    $loading_info.text("Finished!"); 
    
    await highlightComparison();

    $loading.hide();
    $reload.show();
}


function runErrorComparison(){
    let testData = generateTestData(1024);

    FFT_BANK.forEach((value, key) => {
        output_values.push( value.example(testData) );
    });
    
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
    
    await setup();
    await runErrorComparison();
    await runAllPerformanceTests();
});
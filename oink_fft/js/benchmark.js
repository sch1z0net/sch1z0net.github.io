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
let SIGNALS_FOR_EACH_FFT = new Map();


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
    for (let size of PANELS) {
         MAX_.set(size, {name: '-', ops: 0 });
    }
    for (let size of PANELS) {
         FFT_BANK.forEach((value, key) => {
               updateMax(size, value.res.get(size), value.idname);
         });
    }
    for (let size of PANELS) {
         let best = MAX_.get(size).name;
         let id = best+"_"+size;
         $("#"+id).addClass("bestPerf");
    }
}

function resetData(){
    SIGNALS_FOR_EACH_FFT = new Map();
    FFT_BANK.forEach((value, key) => {
        value.res = new Map();
    });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////
//////////////////////////////////////
// Only Copy per Slicing
//////////////////////////////////////
const perform_slice = (fftSize, testData) => {
    for (let i = 0; i < NUM_OPS; i++) { testData.slice(); }
};


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

///////////////////////////////////////////////////////////////////////////////////////////////////////
const runPerformance = async (type) => {
    for (let size of PANELS) {
        let avrg_ops = 0;

        $loading_info.text("Warm Up " + type + "...");
        // Warm up
        for (let run = 0; run < WARMUPS; run++) {
            await measureFFT(type, size, SIGNALS_FOR_EACH_FFT.get(size)[run]);
        }
        
        // Run Measurement
        let errors = 0;
        for (let run = WARMUPS; run < RUNS+WARMUPS; run++) {
            let str = "Measure " + type;
            str    += " (FFT "+size+")";
            str    += " ... (RUN "+(run+1-WARMUPS)+"/"+RUNS+")";
            $loading_info.text( str );

            let eT_slice = await measureSlicing(type, size, SIGNALS_FOR_EACH_FFT.get(size)[run]);
            let eT_FFT   = await measureFFT(type, size, SIGNALS_FOR_EACH_FFT.get(size)[run]);
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


async function runAllPerformanceTests(FFT_BANK){
    NUM_OPS = parseInt($numOpsSelect.val());
    RUNS    = parseInt($runsSelect.val());

    for (let size of PANELS) {
       var SIGNALS = [];
       for(let i = 0; i<RUNS+WARMUPS; i++){
          let signal = generateTestData(size);
          SIGNALS.push(signal);
       }
       SIGNALS_FOR_EACH_FFT.set(size, SIGNALS);
    }

    for (let [key, value] of FFT_BANK.entries()) {
        let idname   = value.idname;
        let fullname = value.fullname;
        let url      = value.url;
        let results  = value.res;

        await runPerformance(idname);
        await addPerformanceRow(idname, fullname, url, results);
        await updateChart(idname, results);
    }

    $loading_info.text("Finished!"); 
    
    await highlightComparison();

    $loading.hide();
    $reload.show();
}


function runErrorComparison(FFT_BANK, output_values){
    let testData = generateTestData(1024);

    FFT_BANK.forEach((value, key) => {
        output_values.push( value.example(testData).slice() );
    });
    
    $("#out_slider").trigger('input');
}

export { runAllPerformanceTests, runErrorComparison };
var FFT_RESULTS = new Map();

function runPerformance(){
    console.log("\n\nPerformance Test:");
    let RUNS = 10;

    for (var size = 128; size <= 1024; size *= 2) {
        let avrg_ops;
        for(let i = 0; i<RUNS; i++){
          avrg_ops += measureTime(size, generateTestData(size));
        }
        avrg_ops = Math.floor(avrg_ops/10);
        FFT_RESULTS.set(size, avrg_ops);
    }
}

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

$(document).ready(function(){
    var $title_div = $("<div>").attr("id", "title_div");
    $("#root").append($title_div);

    var $title = $("<h1>").text("OINK FFT").attr("id", "title");
    $title_div.append($title);

    var $subtitle = $("<h2>").text("the oinkiest FFT in the web").attr("id", "subtitle");
    $title_div.append($subtitle);

    var $stats_div = $("<div>").attr("id", "stats_div");
    $("#root").append($stats_div);
    

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
        var $tr_sizes = $("<tr>").attr("id", "tr_header").appendTo($tbody); 
        $("<td>").text("FFT size").appendTo($tr_sizes);
        for (var size = 128; size <= 1024; size *= 2) {
            $("<td>").text(size).appendTo($tr_sizes);
        }
        var $tr = $("<tr>").appendTo($tbody); 
        $("<td>").text("OINK FFT").appendTo($tr);
        for (var size = 128; size <= 1024; size *= 2) {
            $("<td>").text( FFT_RESULTS.get(size)).appendTo($tr);
        }

        // Append the table to the body
        $stats_div.append($table);
    }


    var $descr_div = $("<div>").attr("id", "descr_div");
    $("#root").append($descr_div);
    $descr_div.text("According to ChatGPT, OINK FFT stands for: Outrageously Insane, Notoriously Quick Fast Fourier Transform!");
    
    

    

    // Check if the module is already initialized, otherwise wait for initialization
    if (Module.isRuntimeInitialized) {
        initializeModule();
        runPerformance();
        runComparison();
        runForthAndBack();
        createPerformanceTable();
    } else {
        Module.onRuntimeInitialized = function(){
            initializeModule();
            runPerformance();
            runComparison();
            runForthAndBack();
            createPerformanceTable();
        };
    }
});
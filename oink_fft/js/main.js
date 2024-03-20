///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
import setup from './setup.js';
import {runAllPerformanceTests, runErrorComparison, resetData} from './benchmark.js'

const FFT_BANK = new Map();
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// HTML CREATION       ///////////////////////////////////////////////
let PANELS = [128, 256, 512, 1024, 2048];
let P_IDX = 0;
let PARAMS = { 
   NUM_OPS: 7500, 
   RUNS:    8,
   WARMUPS: 3,
   PANELS: PANELS
}


var $title_div;
var $title;
var $subtitle;
var $stats_div;
var $stats_head;
var $stats_footer;

var $tab_table;
var $tab_chart;
var $tab_micro;

var $perf_table;
var $outputs;
var $tbody;
var $loading;
var $loading_info;
var $reload;
var $descr_div;
var $numOpsSelect;
var $runsSelect;

function resetPerformanceTable(){
    $perf_table && $perf_table.remove();
}

function createPerformanceTable(){
    resetPerformanceTable();

    // Create a table element
    $perf_table = $("<table>").attr("id", "fft-table");

    // Create table header
    var $thead = $("<thead>").appendTo($perf_table);
    // Create the loading circle element
    //$loading.show().appendTo($table);

    var $trHead = $("<tr>").appendTo($thead);
    // Create Header Text
    $("<th>").text("FFT Performance (measured in OINKS per second)").attr("colspan", 6).appendTo($trHead); // colspan to span all columns
    // Create table body
    $tbody = $("<tbody>").appendTo($perf_table);

    // HEADER
    var $tr_sizes = $("<tr>").attr("id", "tr_header").appendTo($tbody); 
    $("<td>").text("FFT size").appendTo($tr_sizes);
        for (let size of PANELS) {
        $("<td>").text(size).appendTo($tr_sizes).css("background-color","rgba(200,0,0,0.2)");
    }

    // Append the table to the body
    $tab_table.append($perf_table);
}

let charts;
function resetPerformanceCharts(){
    charts = new Map();
    if($(".chart_panel")){ $(".chart_panel").remove(); }
}

function createPerformanceChart(fft_size){
    let $chart_panel = $('<div>').attr("class","chart_panel fade-in").attr("id","panel_"+fft_size).appendTo($tab_chart).hide();
    let $perf_chart = $('<canvas width="1600" height="800"></canvas>').attr("class", "performanceChart").appendTo($chart_panel);  

    const ctx = $perf_chart[0].getContext('2d');

    let chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [ 
            {data: [], borderWidth: 1, borderColor : 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 0.2)'},
          ]
        },
        options: {
           responsive: true,
           maintainAspectRatio: false,
           //aspectRatio: 4,
           plugins: {
              legend: { 
                display: false 
              },
              title: {
                display: true,
                text: 'FFT '+fft_size
              },
           },
           tooltips: {
                callbacks: {
                   label: function(tooltipItem) {
                          return tooltipItem.yLabel;
                   }
                }
          },
          indexAxis: 'y',
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
    });

    charts.set(fft_size, chart);
    return $chart_panel;
}

function createPerformanceCharts(){
    resetPerformanceCharts();
    for (let size of PANELS) {
        createPerformanceChart(size);
    }
    $("#panel_"+PANELS[P_IDX]).show();
}

let output_values = [];
let ref_output = 0;
function createOutputFields(){
    const $output_div = $("<div>").attr("id","output-div");
    $tab_micro.append($output_div);

    //let types = ["INDUTNY","DSP","OOURA","KISS","OINK"];
    let types = Array.from(FFT_BANK.keys());

    $outputs = $('<div>').attr("id","outputs");
    // Create rows dynamically
    for (let i = 0; i < types.length; i++) {
        let type = types[i];

        let outputRow = $('<div>').addClass('output-row');
        let label = $('<label>').attr('for', `output_${type}`).text(`${type}:`);
        let outputRE = $('<input>').attr({type: 'text', id: `outputRE_${type}`}).addClass('float-input');
        let outputIM = $('<input>').attr({type: 'text', id: `outputIM_${type}`}).addClass('float-input');
        let checkbox = $('<input>').attr({type: 'checkbox', id: `check_${type}`}).addClass('check_ref');
        checkbox.on('change',function() {
            $('.check_ref').prop('checked', false);
            $(this).prop('checked', true);
            ref_output = i;
            $("#out_slider").trigger('input');
        });

        outputRow.append(label, outputRE, outputIM, checkbox);
        $outputs.append(outputRow);
    }
    $outputs.appendTo($output_div);

    $('#check_' + types[ref_output]).prop('checked', true);


    // Create container div
    const $slider_div = $("<div>").addClass("slider-container");
    // Create slider element
    const $slider = $("<input>").attr({type: "range", min: 0, max: 511, value: 0, id: "out_slider"});
    // Create div to display slider value
    const $sliderValue = $("<div>").addClass("slider-value").attr("id", "sliderValue").text("50");
    // Append slider and slider value to container
    $slider_div.append($slider, $sliderValue);
    // Initial slider value
    $sliderValue.text($slider.val());
    // Update slider value on input change
    $slider.on("input", function() { 
        let valsRE = new Map();
        let valsIM = new Map();

        let bin = parseInt($(this).val());
        $sliderValue.text(bin);
        
        // RE VALUES
        for (let i = 0; i < types.length; i++) {
            let type = types[i];
            $("#outputRE_"+type).css("background-color", "transparent");
            let str = output_values[i][bin*2+0];
            let value = parseFloat(str);
            valsRE.set(type, value);
            if(isNaN(value)){ 
                $("#outputRE_"+type).val("");
                continue; 
            }

            let formatted = ""+str;
            let neg = false;
            if(value < 0){ 
                formatted = formatted.replace("-", ""); 
                neg = true;
            }
            let spl = formatted.split(".");
            if(spl.length == 1){ spl[1] = 0; }
            formatted = spl[0].padStart(4, " ")+"."+spl[1];
            if(neg){ 
                formatted = "- "+formatted;
            }else{
                formatted = "+ "+formatted;
            }
            
            $("#outputRE_"+type).val(formatted);
        }

        for (let i = 0; i < types.length; i++) {
            let type = types[i];
            if(valsRE.get(type) == null){ continue; }
            let diff = Math.abs(valsRE.get(type)-valsRE.get(types[ref_output]));
            if(diff <= 0.0){
                $("#outputRE_"+type).css("background-color", "rgb(100,250,100)");
            }else 
            if(diff <= 0.0000001){
                $("#outputRE_"+type).css("background-color", "rgb(200,250,180)");
            }else
            if(diff <= 0.00001){
                $("#outputRE_"+type).css("background-color", "rgb(210,210,100)");
            }else
            if(diff <= 0.001){
                $("#outputRE_"+type).css("background-color", "rgb(210,130,100)");
            }else{
                $("#outputRE_"+type).css("background-color", "rgb(210,50,50)");
            }
        }

        // IM VALUES
        for (let i = 0; i < types.length; i++) {
            let type = types[i];
            $("#outputIM_"+type).css("background-color", "transparent");
            let str = output_values[i][bin*2+1];
            let value = parseFloat(str);
            valsIM.set(type, value);
            if(isNaN(value)){ 
                $("#outputIM_"+type).val("");
                continue; 
            }

            let formatted = ""+str;
            let neg = false;
            if(value < 0){ 
                formatted = formatted.replace("-", ""); 
                neg = true;
            }
            let spl = formatted.split(".");
            if(spl.length == 1){ spl[1] = 0; }
            formatted = spl[0].padStart(4, " ")+"."+spl[1];
            if(neg){ 
                formatted = "- "+formatted;
            }else{
                formatted = "+ "+formatted;
            }
            
            $("#outputIM_"+type).val(formatted);
        }

        for (let i = 0; i < types.length; i++) {
            let type = types[i];
            if(valsIM.get(type) == null){ continue; }
            let diff = Math.abs(valsIM.get(type)-valsIM.get(types[ref_output]));
            if(diff <= 0.0){
                $("#outputIM_"+type).css("background-color", "rgb(100,250,100)");
            }else 
            if(diff <= 0.0000001){
                $("#outputIM_"+type).css("background-color", "rgb(200,250,180)");
            }else
            if(diff <= 0.00001){
                $("#outputIM_"+type).css("background-color", "rgb(210,210,100)");
            }else
            if(diff <= 0.001){
                $("#outputIM_"+type).css("background-color", "rgb(210,130,100)");
            }else{
                $("#outputIM_"+type).css("background-color", "rgb(210,50,50)");
            }
        }
    });
    $slider_div.appendTo($output_div);
}


let MAX_ = new Map();
function updateMax(size, ops, name){
    if(MAX_.get(size).ops < ops){ 
        MAX_.set(size, {name: name, ops: ops }); 
    }
}

function highlightComparison(FFT_BANK){
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



$(document).ready(function(){
    $title_div   = $("<div>").attr("id", "title_div");
    $title       = $("<h1>").text("OINK FFT").attr("id", "title");
    $subtitle    = $("<h2>").text("the oinkiest FFT in the web").attr("id", "subtitle");
    $stats_div   = $("<div>").attr("id", "stats_div");
    $stats_head  = $("<div>").attr("id", "stats_head");
    $tab_table   = $("<div>").attr("id", "tab_table").addClass("tab").show();
    $tab_chart   = $("<div>").attr("id", "tab_chart").addClass("tab").hide();
    $tab_micro   = $("<div>").attr("id", "tab_micro").addClass("tab").hide();

    //$loading     = $('<div id="loading-circle"></div>');
    $stats_footer= $("<div>").attr("id", "stats_footer");
    $loading     = $('<div id="loading" class="loading-dots">');
    for (var i = 0; i < 3; i++) {
      $loading.append('<span class="dot"></span>');
    }
    $loading_info= $('<div id="loading_info">');
    $descr_div   = $("<div>").attr("id", "descr_div");

    $("#root").append($title_div);
    $title_div.append($title);
    $title_div.append($subtitle);
    $("#root").append($stats_div);
    $stats_div.append($stats_head);
    $stats_div.append($tab_table);
    $stats_div.append($tab_chart);
    $stats_div.append($tab_micro);
    $stats_div.append($stats_footer);
    $stats_footer.append($loading);
    $stats_footer.append($loading_info);
    $("#root").append($descr_div);
    $descr_div.text("According to ChatGPT, OINK FFT stands for: Outrageously Insane, Notoriously Quick Fast Fourier Transform!");

    // Create select boxes for the number of operations and the amount of runs
    $numOpsSelect = $('<select id="numOpsSelect"></select>');
    $runsSelect = $('<select id="runsSelect"></select>');
    
    $numOpsSelect.append('<option value="' + 5000 + '">' +  5000 + '</option>');
    $numOpsSelect.append('<option value="' + 7500 + '">' +  7500 + '</option>');
    $numOpsSelect.append('<option value="' + 10000 + '">' + 10000 + '</option>');
    $numOpsSelect.append('<option value="' + 15000 + '">' + 15000 + '</option>');
    $numOpsSelect.append('<option value="' + 20000 + '">' + 20000 + '</option>');
    $runsSelect.append('<option value="' + 1 + '">' + 1 + '</option>');
    $runsSelect.append('<option value="' + 2 + '">' + 2 + '</option>');
    $runsSelect.append('<option value="' + 4 + '">' + 4 + '</option>');
    $runsSelect.append('<option value="' + 8 + '">' + 8 + '</option>');
    $runsSelect.append('<option value="' + 16 + '">' + 16 + '</option>');

    // Create the image element
    var $oinkImage = $("<img>", {
        id: "oinkImage",
        src: "./favicon/oink.png"
    });

    // Append the image to the container div
    $title_div.append($oinkImage);
    
    // Append select boxes to the stats_div
    $stats_footer.append($numOpsSelect.val(7500));
    $stats_footer.append($runsSelect.val(8));

    $reload = $('<button id="reload">Reload</button>').hide().appendTo($stats_footer);



    let $chart_l = $('<button id="chart_l">←</button>').appendTo($tab_chart);
    let $chart_r = $('<button id="chart_r">→</button>').appendTo($tab_chart);
    $chart_l.click(function(){ $(".chart_panel").hide(); P_IDX=(P_IDX==0)?(PANELS.length-1):(P_IDX-1); $("#panel_"+PANELS[P_IDX]).show();});
    $chart_r.click(function(){ $(".chart_panel").hide(); P_IDX=(P_IDX+1)%PANELS.length; $("#panel_"+PANELS[P_IDX]).show();});

    // Create a div element for the icon row
    var $iconRow = $("<div>").attr("id", "icon-row");

    var $iconImage1 = $("<img>").attr("src", "./icons/table.svg").addClass("icon-image");
    var $iconLink1  = $("<a>").attr("id", "icon_table").addClass("icon-link").append($iconImage1).addClass("active-icon");
    $iconRow.append($iconLink1);
    var $iconImage2 = $("<img>").attr("src", "./icons/chart.svg").addClass("icon-image");
    var $iconLink2  = $("<a>").attr("id", "icon_chart").addClass("icon-link").append($iconImage2);
    $iconRow.append($iconLink2);
    var $iconImage3 = $("<img>").attr("src", "./icons/micro.svg").addClass("icon-image");
    var $iconLink3  = $("<a>").attr("id", "icon_micro").addClass("icon-link").append($iconImage3);
    $iconRow.append($iconLink3);

    function changeTab(id, icon){
        $(".tab").hide(); 
        $(id).show(); 
        $(".icon-link").removeClass("active-icon");
        $(icon).addClass("active-icon");
    }
    $iconLink1.click(function(){ changeTab("#tab_table", this); });
    $iconLink2.click(function(){ changeTab("#tab_chart", this); });
    $iconLink3.click(function(){ changeTab("#tab_micro", this); });

    // Append the icon row to the document body
    $stats_head.append($iconRow);
});



///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// BENCHMARKING        ///////////////////////////////////////////////

$(document).ready(async function(){
    $reload.click(function(){
       $loading.show();
       $reload.hide();
       createPerformanceTable();
       createPerformanceCharts();
       
       PARAMS = { 
         NUM_OPS: parseInt($numOpsSelect.val()), 
         RUNS:    parseInt($runsSelect.val()),
         WARMUPS: 5,
         PANELS: PANELS
       }

       resetData(FFT_BANK);
       runErrorComparison(FFT_BANK, output_values);
       runAllPerformanceTests(FFT_BANK, PARAMS, charts);
       highlightComparison(FFT_BANK);
       $loading.hide();
       $reload.show();
       $loading_info.text("Finished!"); 
    });

    await setup(FFT_BANK);
    await $reload.trigger('click');
    
    /*
    await createPerformanceTable();
    await createPerformanceCharts();
    await createOutputFields();

    await runErrorComparison(FFT_BANK, output_values);
    await runAllPerformanceTests(FFT_BANK, PARAMS, charts);
    await highlightComparison(FFT_BANK);
    $loading.hide();
    $reload.show();
    $loading_info.text("Finished!"); 
    */
});





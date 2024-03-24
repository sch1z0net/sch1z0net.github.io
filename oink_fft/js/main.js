///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
import setup from './setup.js';
import {runAllPerformanceTests, runErrorComparison, resetData} from './benchmark.js'

const FFT_BANK = new Map();
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// HTML CREATION       ///////////////////////////////////////////////
const numOpsOptions = [5000, 7500, 10000, 15000, 20000];
const runsOptions = [1, 2, 4, 8, 16];
const FFT_SIZES = [ 128, 256, 512, 1024, 2048 ];

let PANELS_FOR_NEXT_RUN = FFT_SIZES.slice();
let P_IDX = 0;
let PARAMS = {
   NUM_OPS: numOpsOptions[1], 
   RUNS:    runsOptions[1],
   WARMUPS: 3,
   PANELS: PANELS_FOR_NEXT_RUN.slice()
}


var $title_div;
var $title;
var $subtitle;
var $stats_div;
var $stats_head;
var $stats_footer;

var $tabs;
var $tab_intro;
var $tab_table;
var $tab_chart;
var $tab_micro;

var $perf_table;
var $output_div;
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
    $("<th>").text("FFT Performance (measured in OINKS per second)").attr("colspan", 1+PARAMS.PANELS.length).appendTo($trHead); // colspan to span all columns
    // Create table body
    $tbody = $("<tbody>").attr("id","fft-body").appendTo($perf_table);

    // HEADER
    var $tr_sizes = $("<tr>").attr("id", "tr_header").appendTo($tbody); 
    $("<td>").text("FFT size").appendTo($tr_sizes);
        for (let size of PARAMS.PANELS) {
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
    P_IDX = 0;
    resetPerformanceCharts();
    for (let size of PARAMS.PANELS) {
        createPerformanceChart(size);
    }
    if(PARAMS.PANELS.length > 0){
        $("#panel_"+PARAMS.PANELS[P_IDX]).show();
    }
}


let output_values = [];
let ref_output = 0;
function resetOutputFields(){
    output_values = [];
    $output_div && $output_div.remove();
}

function createOutputFields(){
    resetOutputFields();

    $output_div = $("<div>").attr("id","output-div");
    $tab_micro.append($output_div);

    //let types = ["INDUTNY","DSP","OOURA","KISS","OINK"];
    let types = Array.from(FFT_BANK.keys());

    $outputs = $('<div>').attr("id","outputs");
    // Create rows dynamically
    for (let i = 0; i < types.length; i++) {
        let type = types[i];

        let outputRow = $('<div>').addClass('output-row');
        let label = $('<label>').text(`${type}:`);
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
    for (let size of PARAMS.PANELS) {
         MAX_.set(size, {name: '-', ops: 0 });
    }
    for (let size of PARAMS.PANELS) {
         FFT_BANK.forEach((value, key) => {
               updateMax(size, value.res.get(size), value.idname);
         });
    }
    for (let size of PARAMS.PANELS) {
         let best = MAX_.get(size).name;
         let id = best+"_"+size;
         $("#"+id).addClass("bestPerf");
    }
}



$(document).ready(function(){
    $title_div   = $("<div>").attr("id", "title_div");
    $title       = $("<h1>").text("OINK FFT").attr("id", "title");
    $title.click(function(){ window.open("https://sch1z0net.github.io/oink_fft/"); });

    $subtitle    = $("<h2>").text("the oinkiest FFT in the web").attr("id", "subtitle");
    $stats_div   = $("<div>").attr("id", "stats_div");
    $stats_head  = $("<div>").attr("id", "stats_head");
    $tabs        = $("<div>").attr("id", "tabs");
    $tab_intro   = $("<div>").attr("id", "tab_intro").show();
    $tab_table   = $("<div>").attr("id", "tab_table").addClass("tab").show();
    $tab_chart   = $("<div>").attr("id", "tab_chart").addClass("tab").hide();
    $tab_micro   = $("<div>").attr("id", "tab_micro").addClass("tab").hide();

    //$loading     = $('<div id="loading-circle"></div>');
    $stats_footer= $("<div>").attr("id", "stats_footer");
    $loading     = $('<div id="loading" class="loading-dots">').hide();
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
    $stats_div.append($tabs);
    $tabs.append($tab_intro);
    $tabs.append($tab_table);
    $tabs.append($tab_chart);
    $tabs.append($tab_micro);
    $stats_div.append($stats_footer);
    $stats_footer.append($loading);
    $stats_footer.append($loading_info);
    $("#root").append($descr_div);
    $descr_div.text("According to ChatGPT, OINK FFT stands for: Outrageously Insane, Notoriously Quick Fast Fourier Transform!");

    
    let $intro = $("<div class='pulse'>RUN BENCHMARK</div>");
    let $intro_text = $("<div>Welcome to my Benchmarking Suite</div>");
    $tab_intro.append($intro_text);
    $tab_intro.append($intro);
    

    // Create select boxes for the number of operations and the amount of runs
    let $paramsDiv =  $('<div id="paramsDiv">').appendTo($stats_footer);
    let $numOpsLabel = $('<label>').text("# Operations").appendTo($paramsDiv);
    let $runsLabel = $('<label>').text("# Runs").appendTo($paramsDiv);
    $numOpsSelect = $('<select id="numOpsSelect"></select>').appendTo($paramsDiv);
    $runsSelect = $('<select id="runsSelect"></select>').appendTo($paramsDiv);

    // Append options to numOpsSelect
    numOpsOptions.forEach(option => { $numOpsSelect.append('<option value="' + option + '">' + option + '</option>'); });
    // Append options to runsSelect
    runsOptions.forEach(option => { $runsSelect.append('<option value="' + option + '">' + option + '</option>'); });

    $numOpsSelect.val(PARAMS.NUM_OPS);
    $runsSelect.val(PARAMS.RUNS);

    // Create the fieldset element
    var $fieldset = $('<fieldset></fieldset>');
    var $legend = $('<legend>Choose FFT sizes:</legend>');
    $fieldset.append($legend);

    function updatePANELS(checkbox){
        PANELS_FOR_NEXT_RUN = [];
        for(let i = 0; i < FFT_SIZES.length; i++){
            if ($("#check_"+FFT_SIZES[i]).prop("checked")) { 
                PANELS_FOR_NEXT_RUN.push( FFT_SIZES[i] ); 
            }
        }
        if(PANELS_FOR_NEXT_RUN.length == 0){
            $(checkbox).prop("checked",true);
        }
    }

    // Create checkbox inputs and labels for each feature
    FFT_SIZES.forEach(function(size) {
      var $div = $('<div></div>');
      var $checkbox = $('<input type="checkbox" class="check_size" id="check_' + size + '" name="check_' + size + '" checked>');
      var $label = $('<label for="check_' + size + '">' + size + '</label>');

      $div.append($checkbox);
      $div.append($label);
      $fieldset.append($div);
      
      $checkbox.change(function(){ updatePANELS(this); });
    });

    // Append the fieldset to the features div
    let $selectionsDiv = $('<div id="selectionsDiv">').append($fieldset);
    $stats_head.append($selectionsDiv);


    // Create the image element
    var $oinkImage = $("<img>", {
        id: "oinkImage",
        src: "./favicon/oink.png"
    });
    
    let oinkActive = false;
    $oinkImage.click(function(){
        if(oinkActive){
           $(".giphy-round").css({
               visibility: "hidden"
           });
           oinkActive = false;
        }else{
           oinkActive = true;
           $(".giphy-round").css({
            visibility: "visible"
            });
        }
    });


    // Append the image to the container div
    $title_div.append($oinkImage);

    $reload = $('<button id="reload">Reload</button>').hide().appendTo($stats_footer);


    let $chart_l = $('<button id="chart_l">←</button>').appendTo($tab_chart);
    let $chart_r = $('<button id="chart_r">→</button>').appendTo($tab_chart);
    $chart_l.click(function(){ $(".chart_panel").hide(); P_IDX=(P_IDX==0)?(PARAMS.PANELS.length-1):(P_IDX-1); $("#panel_"+PARAMS.PANELS[P_IDX]).show();});
    $chart_r.click(function(){ $(".chart_panel").hide(); P_IDX=(P_IDX+1)%PARAMS.PANELS.length; $("#panel_"+PARAMS.PANELS[P_IDX]).show();});

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
    $reload.click(async function(){
       $loading.show();
       $reload.hide();

       PARAMS = { 
         NUM_OPS: parseInt($numOpsSelect.val()), 
         RUNS:    parseInt($runsSelect.val()),
         WARMUPS: 5,
         PANELS: PANELS_FOR_NEXT_RUN.slice()
       }

       createPerformanceTable();
       createPerformanceCharts();
       createOutputFields();

       await resetData(FFT_BANK);
       await runErrorComparison(FFT_BANK, output_values);
       await runAllPerformanceTests(FFT_BANK, PARAMS, charts);
       await highlightComparison(FFT_BANK);
       $loading.hide();
       $reload.show();
       $loading_info.text("Finished!"); 
    });

    await setup(FFT_BANK);

    await $tab_intro.click(function(){
         $tab_intro.addClass("fade_hide");
         setTimeout(function() {
             $tab_intro.hide();
             $reload.trigger('click');
         }, 500); // 1000 milliseconds = 1 second
    });
});





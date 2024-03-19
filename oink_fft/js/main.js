///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// HTML CREATION       ///////////////////////////////////////////////

let MAX_PERF_SIZE = 2048;

var $title_div;
var $title;
var $subtitle;
var $stats_div;
var $tab_table;
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
    for (var size = 128; size <= 2048; size *= 2) {
        $("<td>").text(size).appendTo($tr_sizes).css("background-color","rgba(200,0,0,0.2)");
    }

    // Append the table to the body
    $tab_table.append($perf_table);
}

function addPerformanceRow(idname, fullname, results){
    var $tr = $("<tr>");
    $("<td>").text(fullname).appendTo($tr).css("background-color","rgba(200,0,0,0.2)");;
    for (var size = 128; size <= 2048; size *= 2) {
        let id = idname+"_"+size;
        let result = parseInt(results.get(size));
        if(result < 0){ result = "(ERROR)" }
        $("<td id='"+id+"' >").text( result ).appendTo($tr);
    }
    $tr.addClass('fade-up');
    $tr.appendTo($tbody);
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

let panels = [128, 256, 512, 1024, 2048];
let p_idx = 0;
function createPerformanceCharts(){
    resetPerformanceCharts();
    for (let size = 128; size <= MAX_PERF_SIZE; size *= 2) {
        createPerformanceChart(size);
    }
    $("#panel_"+panels[p_idx]).show();
}

function updateChart(name, results) {
    //const labels = Array.from(results.keys());
    const data = Array.from(results.values());
    // Push new data to the chart
    let k = 0;
    for (let size = 128; size <= MAX_PERF_SIZE; size *= 2) {
       let chart = charts.get(size);
       chart.data.labels.push(name);
       chart.data.datasets[0].data.push(data[k]);
       // Update the chart
       chart.update();
       k++;
    }
}

let outs = [];

function createOutputFields(){
    const $output_div = $("<div>").addClass("output-div");


    let types = ["INDUTNY","DSP","OOURA","KISS","OINK"];

    $outputs = $('<div>').attr("id","outputs");
    // Create rows dynamically
    for (let i = 0; i < types.length; i++) {
        let type = types[i];
        $outputs.append(`
            <div class="output-row">
                <label for="output_${type}">${type}:</label>
                <input type="text" id="output_${type}" class="float-input" readonly>
            </div>
        `);
    }

    // Create container div
    const $slider_div = $("<div>").addClass("slider-container");
    // Create slider element
    const $slider = $("<input>").attr({type: "range", min: 0, max: 1024, value: 0, id: "out_slider"});
    // Create div to display slider value
    const $sliderValue = $("<div>").addClass("slider-value").attr("id", "sliderValue").text("50");
    // Append slider and slider value to container
    $slider_div.append($slider, $sliderValue);
    // Initial slider value
    $sliderValue.text($slider.val());
    // Update slider value on input change
    $slider.on("input", function() { $sliderValue.text($(this).val()); });
    // Update slider value on scroll
    $slider.on("wheel", function(event) {
        event.preventDefault(); // Prevent page scrolling

        // Calculate new value based on scroll direction
        const delta = Math.sign(event.originalEvent.deltaY); // Get scroll direction (1 for up, -1 for down)
        const step = parseInt($(this).attr("step")) || 1; // Get step value (default to 1 if not defined)
        let bin = parseInt($(this).val()) + (delta * step);

        // Ensure bin stays within min and max range
        bin = Math.max(parseInt($(this).attr("min")), Math.min(bin, parseInt($(this).attr("max"))));

        // Update slider value and slider value display
        $(this).val(bin).trigger("input"); // Trigger input event to update value display

        for (let i = 0; i < types.length; i++) {
            let type = types[i];
            $("#output_"+type).val(outs[i][bin]);
        }
    });

    $slider_div.appendTo($output_div);
    $outputs.appendTo($output_div);
    $tab_micro.append($output_div);
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
    
    createPerformanceTable();
    createPerformanceCharts();
    createOutputFields();

    $chart_l = $('<button id="chart_l">←</button>').appendTo($tab_chart);
    $chart_r = $('<button id="chart_r">→</button>').appendTo($tab_chart);
    $chart_l.click(function(){ $(".chart_panel").hide(); p_idx=(p_idx==0)?(MAX_PERF_SIZE-1):(p_idx-1); $("#panel_"+panels[p_idx]).show();});
    $chart_r.click(function(){ $(".chart_panel").hide(); p_idx=(p_idx+1)%MAX_PERF_SIZE; $("#panel_"+panels[p_idx]).show();});

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





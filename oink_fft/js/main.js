///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// HTML CREATION       ///////////////////////////////////////////////

var $title_div;
var $title;
var $subtitle;
var $stats_div;
var $tab_table;
var $perf_table
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
    // Create the dots
    $loading = $('<div id="loading" class="loading-dots">').appendTo($perf_table);
    $loading_info = $('<div id="loading_info">').appendTo($perf_table);

    // Create table header
    var $thead = $("<thead>").appendTo($perf_table);
    // Create the loading circle element
    //$loading.show().appendTo($table);
    for (var i = 0; i < 3; i++) {
      $loading.append('<span class="dot"></span>');
    }

    var $trHead = $("<tr>").appendTo($thead);
    // Create Header Text
    $("<th>").text("FFT Performance (measured in OINKS per second)").attr("colspan", 6).appendTo($trHead); // colspan to span all columns
    // Create table body
    $tbody = $("<tbody>").appendTo($perf_table);

    // HEADER
    var $tr_sizes = $("<tr>").attr("id", "tr_header").appendTo($tbody); 
    $("<td>").text("FFT size").appendTo($tr_sizes);
    for (var size = 128; size <= 1024; size *= 2) {
        $("<td>").text(size).appendTo($tr_sizes);
    }

    // Append the table to the body
    $tab_table.append($perf_table);
}

function addPerformanceRow(name, results){
    var $tr = $("<tr>");
    $("<td>").text(name).appendTo($tr);
    for (var size = 128; size <= 1024; size *= 2) {
        let id = name+"_"+size;
        let result = parseInt(results.get(size));
        if(result < 0){ result = "(ERROR)" }
        $("<td id='"+id+"' >").text( result ).appendTo($tr);
    }
    $tr.addClass('fade-up');
    $tr.appendTo($tbody);
}


$(document).ready(function(){
    $title_div   = $("<div>").attr("id", "title_div");
    $title       = $("<h1>").text("OINK FFT").attr("id", "title");
    $subtitle    = $("<h2>").text("the oinkiest FFT in the web").attr("id", "subtitle");
    $stats_div   = $("<div>").attr("id", "stats_div");
    $stats_head  = $("<div>").attr("id", "stats_head");
    $tab_table   = $("<div>").attr("id", "stats_tab");
    $loading     = $('<div id="loading-circle"></div>');
    $stats_footer= $("<div>").attr("id", "stats_footer");
    $descr_div   = $("<div>").attr("id", "descr_div");

    $("#root").append($title_div);
    $title_div.append($title);
    $title_div.append($subtitle);
    $("#root").append($stats_div);
    $stats_div.append($stats_head);
    $stats_div.append($stats_footer);
    $stats_div.append($tab_table);
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





    // Create an array of SVG file paths
    var svgFiles = [
        "./icons/table.svg",
        "./icons/chart.svg",
        "./icons/micro.svg"
    ];

    // Create a div element for the icon row
    var $iconRow = $("<div>").attr("id", "icon-row");

    // Iterate over the SVG file paths and create image elements with SVG as the source
    $.each(svgFiles, function(index, svgFile) {
        var $iconImage = $("<img>").attr("src", svgFile).addClass("icon-image");
        var $iconLink = $("<a>").attr("href", "#").addClass("icon-link").append($iconImage);
        $iconRow.append($iconLink);
    });

    // Append the icon row to the document body
    $stats_div.append($iconRow);

    // Attach click event handler to all icon links
    $(".icon-link").click(function(event) {
        event.preventDefault(); // Prevent default link behavior

    });
});





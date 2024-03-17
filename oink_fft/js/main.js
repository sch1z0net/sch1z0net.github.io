///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// HTML CREATION       ///////////////////////////////////////////////

var $title_div;
var $title;
var $subtitle;
var $stats_div;
var $tbody;
var $loading;
var $loading_info;
var $reload;
var $descr_div;

function resetPerformanceTable(){
    $stats_div.empty();
}

function createPerformanceTable(){
    resetPerformanceTable();

    // Create a table element
    var $table = $("<table>").attr("id", "fft-table");
    // Create the dots
    $loading = $('<div id="loading" class="loading-dots">').appendTo($table);
    $loading_info = $('<div id="loading_info">').appendTo($table);
    $reload = $('<button id="reload">Reload</button>').hide().appendTo($table);

    // Create table header
    var $thead = $("<thead>").appendTo($table);
    // Create the loading circle element
    //$loading.show().appendTo($table);
    for (var i = 0; i < 3; i++) {
      $loading.append('<span class="dot"></span>');
    }

    var $trHead = $("<tr>").appendTo($thead);
    // Create Header Text
    $("<th>").text("FFT Performance (measured in OINKS per second)").attr("colspan", 6).appendTo($trHead); // colspan to span all columns
    // Create table body
    $tbody = $("<tbody>").appendTo($table);

    // HEADER
    var $tr_sizes = $("<tr>").attr("id", "tr_header").appendTo($tbody); 
    $("<td>").text("FFT size").appendTo($tr_sizes);
    for (var size = 128; size <= 1024; size *= 2) {
        $("<td>").text(size).appendTo($tr_sizes);
    }

    // Append the table to the body
    $stats_div.append($table);
}

function addPerformanceRow(name, results){
    var $tr = $("<tr>");
    $("<td>").text(name).appendTo($tr);
    for (var size = 128; size <= 1024; size *= 2) {
        $("<td>").text( results.get(size) ).appendTo($tr);
    }
    $tr.addClass('fade-up');
    $tr.appendTo($tbody);
}


$(document).ready(function(){
    $title_div = $("<div>").attr("id", "title_div");
    $title     = $("<h1>").text("OINK FFT").attr("id", "title");
    $subtitle  = $("<h2>").text("the oinkiest FFT in the web").attr("id", "subtitle");
    $stats_div = $("<div>").attr("id", "stats_div");
    $loading   = $('<div id="loading-circle"></div>');
    $descr_div = $("<div>").attr("id", "descr_div");

    $("#root").append($title_div);
    $title_div.append($title);
    $title_div.append($subtitle);
    $("#root").append($stats_div);
    $("#root").append($descr_div);
    $descr_div.text("According to ChatGPT, OINK FFT stands for: Outrageously Insane, Notoriously Quick Fast Fourier Transform!");
    createPerformanceTable();
});

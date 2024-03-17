///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// HTML CREATION       ///////////////////////////////////////////////

var $title_div = $("<div>").attr("id", "title_div");
$("#root").append($title_div);

var $title = $("<h1>").text("OINK FFT").attr("id", "title");
$title_div.append($title);

var $subtitle = $("<h2>").text("the oinkiest FFT in the web").attr("id", "subtitle");
$title_div.append($subtitle);

var $stats_div = $("<div>").attr("id", "stats_div");
$("#root").append($stats_div);

function resetPerformanceTable(){
    $stats_div.empty();
}

var $tbody;
var $loading = $('<div id="loading-circle"></div>');
function createPerformanceTable(){
    resetPerformanceTable();

    // Create a table element
    var $table = $("<table>").attr("id", "fft-table");
    // Create table header
    var $thead = $("<thead>").appendTo($table);
    // Create the loading circle element
    $loading.show().appendTo($thead);
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
    $tr.appendTo($tbody);
}

var $descr_div = $("<div>").attr("id", "descr_div");
$("#root").append($descr_div);
$descr_div.text("According to ChatGPT, OINK FFT stands for: Outrageously Insane, Notoriously Quick Fast Fourier Transform!");

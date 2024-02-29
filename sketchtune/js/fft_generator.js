let code;

function d(i) {
    // Ensure i is a number
    i = Number(i);
    // Check if i is a valid number
    if (!isNaN(i)) {
        // Convert i to a string and pad it with leading zeros
        const formattedNumber = String(i).padStart(3, '0');
        // Print the formatted number
        return formattedNumber;
    } else {
        console.error('Invalid input: ' + i);
    }
}


function tRe(r,c){  return "tRe"+d(r)+"_"+c;  }
function tIm(r,c){  return "tIm"+d(r)+"_"+c;  }

function tRe_(r,c){
    var res = "";
    let f_lines = 1;
    let f_start = 1;
    if(c > 1){ 
        f_lines = (2<<(c-2))>>1; 
        f_start += f_lines;
    }
    if( r>=f_start && r<(f_start+f_lines) ){
        res = "____F(i)";
    }else{
        res = "tRe"+d(r)+"_"+c;
    }
    return res;
}

function tIm_(r,c){
    var res = "";
    let f_lines = 1;
    let f_start = 1;
    if(c > 1){ 
        f_lines = (2<<(c-2))>>1; 
        f_start += f_lines;
    }
    if( r>=f_start && r<(f_start+f_lines) ){
        res = "____F(i)";
    }else{
        res = "tIm"+d(r)+"_"+c;
    }
    return res;
}

function print_code(power){
    const rows = (2<<(power-1))>>1;
    const cols  = power;
    
    let line = "";
    for(let c = 1; c<=cols; c++){
        line += "let ";
        for(let r = 1; r<=rows; r++){
            line += tRe(r,c)+",";
            line += tIm(r,c)+",";
        }
        line += "; \n";
    }
    
    line += "\n\n\n";

    for(let r = 1; r<=rows; r++){
        for(let c = 1; c<=cols; c++){
            line += tRe(r,c)+"="+tRe_(r,c)+";";
            line += tIm(r,c)+"="+tIm_(r,c)+";";
        }
        line += "\n";
    }

    code = line;
    
}

print_code(5);


$(document).ready(function(){
    $('#play').click(function(){
        // Create a Blob object with the text content
        const blob = new Blob([code], { type: 'text/plain' });
        
        // Create a temporary <a> element to trigger the download
        const a = $('<a></a>');
        const url = window.URL.createObjectURL(blob);
        a.attr('href', url);
        a.attr('download', 'example.txt');
        
        // Append the <a> element to the DOM
        $('body').append(a);
        
        // Click the <a> element to trigger the download
        a.get(0).click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        a.remove();
    });
});
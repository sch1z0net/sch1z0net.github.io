//////////////////////////////////////
//////////////////////////////////////
// IMPORT THE FFT LIBRARY
//////////////////////////////////////
import IND_FFT from './fft.js';

//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM INDUTNY
//////////////////////////////////////
let indutny_f_4,    indutny_out_4;
let indutny_f_8,    indutny_out_8;
let indutny_f_16,   indutny_out_16;
let indutny_f_32,   indutny_out_32;
let indutny_f_64,   indutny_out_64;
let indutny_f_128,  indutny_out_128;
let indutny_f_256,  indutny_out_256;
let indutny_f_512,  indutny_out_512;
let indutny_f_1024, indutny_out_1024;
let indutny_f_2048, indutny_out_2048;

function initializeINDUTNY(){
    return new Promise((resolve, reject) => {
        indutny_f_4 = new IND_FFT(4);
        indutny_out_4 = indutny_f_4.createComplexArray();
        indutny_f_8 = new IND_FFT(8);
        indutny_out_8 = indutny_f_8.createComplexArray();
        indutny_f_16 = new IND_FFT(16);
        indutny_out_16 = indutny_f_16.createComplexArray();
        indutny_f_32 = new IND_FFT(32);
        indutny_out_32 = indutny_f_32.createComplexArray();
        indutny_f_64 = new IND_FFT(64);
        indutny_out_64 = indutny_f_64.createComplexArray();
        indutny_f_128 = new IND_FFT(128);
        indutny_out_128 = indutny_f_128.createComplexArray();
        indutny_f_256 = new IND_FFT(256);
        indutny_out_256 = indutny_f_256.createComplexArray();
        indutny_f_512 = new IND_FFT(512);
        indutny_out_512 = indutny_f_512.createComplexArray();
        indutny_f_1024 = new IND_FFT(1024);
        indutny_out_1024 = indutny_f_1024.createComplexArray();
        indutny_f_2048 = new IND_FFT(2048);
        indutny_out_2048 = indutny_f_2048.createComplexArray();
        resolve();
    });
}

const perform_INDUTNY = (instance, out, testData) => {
    instance.realTransform(out, testData.slice()); return out;
};



//////////////////////////////////////
//////////////////////////////////////
// IMPLEMENT GIVEN INTERFACE
//////////////////////////////////////
const PLUGIN_INDUTNY = {
  idname:   function() { return "INDUTNY"; },
  fullname: function() { return "FFT.JS (indunty)"; },
  url:      function() { return "https://github.com/indutny/fft.js/"; },
  precision:function() { return "float"; },
  init:     function() { return initializeINDUTNY(); },
  fft8:     function(testData) { perform_INDUTNY(indutny_f_8,     indutny_out_8,     testData); },
  fft16:    function(testData) { perform_INDUTNY(indutny_f_16,    indutny_out_16,    testData); },
  fft32:    function(testData) { perform_INDUTNY(indutny_f_32,    indutny_out_32,    testData); },
  fft64:    function(testData) { perform_INDUTNY(indutny_f_64,    indutny_out_64,    testData); },
  fft128:   function(testData) { perform_INDUTNY(indutny_f_128,   indutny_out_128,   testData); },
  fft256:   function(testData) { perform_INDUTNY(indutny_f_256,   indutny_out_256,   testData); },
  fft512:   function(testData) { perform_INDUTNY(indutny_f_512,   indutny_out_512,   testData); },
  fft1024:  function(testData) { perform_INDUTNY(indutny_f_1024,  indutny_out_1024,  testData); },
  fft2048:  function(testData) { perform_INDUTNY(indutny_f_2048,  indutny_out_2048,  testData); },
  example:  function(testData) { 
    switch(testData.length){
       case    4: return perform_INDUTNY(indutny_f_4,    indutny_out_4,   testData);
       case    8: return perform_INDUTNY(indutny_f_8,    indutny_out_8,   testData);
       case   16: return perform_INDUTNY(indutny_f_16,   indutny_out_16,  testData);
       case   32: return perform_INDUTNY(indutny_f_32,   indutny_out_32,  testData);
       case   64: return perform_INDUTNY(indutny_f_64,   indutny_out_64,  testData);
       case  128: return perform_INDUTNY(indutny_f_128,  indutny_out_128, testData);
       case  256: return perform_INDUTNY(indutny_f_256,  indutny_out_256, testData);
       case  512: return perform_INDUTNY(indutny_f_512,  indutny_out_512, testData);
       case 1024: return perform_INDUTNY(indutny_f_1024, indutny_out_1024,testData);
    }
  }  
};

//////////////////////////////////////
//////////////////////////////////////
// EXPORT
//////////////////////////////////////
export default PLUGIN_INDUTNY;
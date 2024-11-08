//////////////////////////////////////
//////////////////////////////////////
// IMPORT THE FFT LIBRARY
//////////////////////////////////////
import FFT from './dsp.js';

//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM DSP
//////////////////////////////////////
let dsp_fft_4;
let dsp_fft_8;
let dsp_fft_16;
let dsp_fft_32;
let dsp_fft_64;
let dsp_fft_128;
let dsp_fft_256;
let dsp_fft_512;
let dsp_fft_1024;
let dsp_fft_2048;

function initializeDSP(){
    return new Promise((resolve, reject) => {
        dsp_fft_4    = new FFT(4, 44100);
        dsp_fft_8    = new FFT(8, 44100);
        dsp_fft_16   = new FFT(16, 44100);
        dsp_fft_32   = new FFT(32, 44100);
        dsp_fft_64   = new FFT(64, 44100);
        dsp_fft_128  = new FFT(128, 44100);
        dsp_fft_256  = new FFT(256, 44100);
        dsp_fft_512  = new FFT(512, 44100);
        dsp_fft_1024 = new FFT(1024, 44100);
        dsp_fft_2048 = new FFT(2048, 44100);
        resolve();
    });
}    

const perform_DSP = (instance, testData) => {
    instance.forward(testData.slice()); 
    let result = [];
    let real = instance.real;
    let imag = instance.imag;
    for(let i = 0; i < testData.length; i++){
        result.push(real[i]);
        result.push(imag[i]);
    }

    return result;
};


//////////////////////////////////////
//////////////////////////////////////
// IMPLEMENT GIVEN INTERFACE
//////////////////////////////////////
const PLUGIN_DSP = {
  idname:   function() { return "DSP";  },
  fullname: function() { return "DSP.JS (corbanbrook)"; },
  url:      function() { return "https://github.com/corbanbrook/dsp.js/"; },
  precision:function() { return "double"; },
  init:     function() { return initializeDSP(); },
  fft8:     function(testData) { perform_DSP(dsp_fft_8,    testData); },
  fft16:    function(testData) { perform_DSP(dsp_fft_16,   testData); },
  fft32:    function(testData) { perform_DSP(dsp_fft_32,   testData); },
  fft64:    function(testData) { perform_DSP(dsp_fft_64,   testData); },
  fft128:   function(testData) { perform_DSP(dsp_fft_128,  testData); },
  fft256:   function(testData) { perform_DSP(dsp_fft_256,  testData); },
  fft512:   function(testData) { perform_DSP(dsp_fft_512,  testData); },
  fft1024:  function(testData) { perform_DSP(dsp_fft_1024, testData); },
  fft2048:  function(testData) { perform_DSP(dsp_fft_2048, testData); },
  example:  function(testData) { 
    switch(testData.length){
       case    4: return perform_DSP(dsp_fft_4,    testData);
       case    8: return perform_DSP(dsp_fft_8,    testData);
       case   16: return perform_DSP(dsp_fft_16,   testData);
       case   32: return perform_DSP(dsp_fft_32,   testData);
       case   64: return perform_DSP(dsp_fft_64,   testData);
       case  128: return perform_DSP(dsp_fft_128,  testData);
       case  256: return perform_DSP(dsp_fft_256,  testData);
       case  512: return perform_DSP(dsp_fft_512,  testData);
       case 1024: return perform_DSP(dsp_fft_1024, testData);
    }
  }   
};

//////////////////////////////////////
//////////////////////////////////////
// EXPORT
//////////////////////////////////////
export default PLUGIN_DSP;

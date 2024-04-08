//////////////////////////////////////
//////////////////////////////////////
// IMPORT THE FFT LIBRARY
//////////////////////////////////////
//import * as OINK from "https://cdn.jsdelivr.net/gh/sch1z0net/oink@v0.1.5-alpha/oink_fft.js";
import * as OINK_js from "./oink_fft.js"
//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM KISS
//////////////////////////////////////

const perform_OINK_js = (instance, testData) => {
    return instance(testData.slice());
};

//////////////////////////////////////
//////////////////////////////////////
// IMPLEMENT GIVEN INTERFACE
//////////////////////////////////////
const PLUGIN_OINK_js = {
  idname:   function() { return "OINK_js" },
  fullname: function() { return "OINK_js (sch1z0net)"},
  url:      function() { return "https://github.com/sch1z0net/oink" },
  precision:function() { return "float" },
  init: async function() { },
  fft8:     function(testData) { perform_OINK_js(OINK_js.fftReal8,    testData); },
  fft16:    function(testData) { perform_OINK_js(OINK_js.fftReal16,   testData); },
  fft32:    function(testData) { perform_OINK_js(OINK_js.fftReal32,   testData); },
  fft64:    function(testData) { perform_OINK_js(OINK_js.fftReal64,   testData); },
  fft128:   function(testData) { perform_OINK_js(OINK_js.fftReal128,  testData); },
  fft256:   function(testData) { perform_OINK_js(OINK_js.fftReal256,  testData); },
  fft512:   function(testData) { perform_OINK_js(OINK_js.fftReal512,  testData); },
  fft1024:  function(testData) { perform_OINK_js(OINK_js.fftReal1024, testData); },
  fft2048:  function(testData) { perform_OINK_js(OINK_js.fftReal2048, testData); },
  example:  function(testData) { 
    switch(testData.length){
       case    4: return perform_OINK_js(OINK_js.fftReal4,     testData);
       case    8: return perform_OINK_js(OINK_js.fftReal8,     testData);
       case   16: return perform_OINK_js(OINK_js.fftReal16,    testData);
       case   32: return perform_OINK_js(OINK_js.fftReal32,    testData);
       case   64: return perform_OINK_js(OINK_js.fftReal64,    testData);
       case  128: return perform_OINK_js(OINK_js.fftReal128,   testData);
       case  256: return perform_OINK_js(OINK_js.fftReal256,   testData);
       case  512: return perform_OINK_js(OINK_js.fftReal512,   testData);
       case 1024: return perform_OINK_js(OINK_js.fftReal1024,  testData);
    }
  }  
};


//////////////////////////////////////
//////////////////////////////////////
// EXPORT
//////////////////////////////////////
export default PLUGIN_OINK_js;
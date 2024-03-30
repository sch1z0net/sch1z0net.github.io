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
  fft128:   function(testData) { perform_OINK_js(OINK_js.fftReal128,  testData); },
  fft256:   function(testData) { perform_OINK_js(OINK_js.fftReal256,  testData); },
  fft512:   function(testData) { perform_OINK_js(OINK_js.fftReal512,  testData); },
  fft1024:  function(testData) { perform_OINK_js(OINK_js.fftReal1024, testData); },
  fft2048:  function(testData) { perform_OINK_js(OINK_js.fftReal2048, testData); },
  example:  function(testData) { return perform_OINK_js(OINK_js.fftReal8,  testData); },
};


//////////////////////////////////////
//////////////////////////////////////
// EXPORT
//////////////////////////////////////
export default PLUGIN_OINK_js;
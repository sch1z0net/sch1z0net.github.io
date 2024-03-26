//////////////////////////////////////
//////////////////////////////////////
// IMPORT THE FFT LIBRARY
//////////////////////////////////////
import * as OINK from "https://cdn.jsdelivr.net/gh/sch1z0net/oink@v0.1.5-alpha/oink_fft.js";
//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM KISS
//////////////////////////////////////

const perform_OINK = (instance, testData) => {
    return instance(testData.slice());
};

//////////////////////////////////////
//////////////////////////////////////
// IMPLEMENT GIVEN INTERFACE
//////////////////////////////////////
const PLUGIN_OINK = {
  idname:   function() { return "OINK" },
  fullname: function() { return "OINK (sch1z0net)"},
  url:      function() { return "https://github.com/sch1z0net/oink" },
  precision:function() { return "float" },
  example:  function() { return perform_OINK(OINK.fftReal1024, testData.slice()).slice(); },
  init: async function() { },
  fft128:   function(testData) { perform_OINK(OINK.fftReal128,  testData); },
  fft256:   function(testData) { perform_OINK(OINK.fftReal256,  testData); },
  fft512:   function(testData) { perform_OINK(OINK.fftReal512,  testData); },
  fft1024:  function(testData) { perform_OINK(OINK.fftReal1024, testData); },
  fft2048:  function(testData) { perform_OINK(OINK.fftReal2048, testData); },
  example:  function(testData) { return perform_OINK(OINK.fftReal1024,  testData); },
};


//////////////////////////////////////
//////////////////////////////////////
// EXPORT
//////////////////////////////////////
export default PLUGIN_OINK;
//////////////////////////////////////
//////////////////////////////////////
// IMPORT THE FFT LIBRARY
//////////////////////////////////////
import { initializeModuleOINK, fftReal2048, fftReal1024, fftReal512, fftReal256, fftReal128 } 
//from '/oink_fft/js/oink/oink_fft.js';
from "https://cdn.jsdelivr.net/gh/sch1z0net/oink/oink_fft.js"

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
  example:  function() { return perform_OINK(fftReal1024, testData.slice()).slice(); },
  init: async function() {
    const Module_OINK = await import('https://cdn.jsdelivr.net/gh/sch1z0net/oink/fft_wasm.js');
    const _Module_OINK_ = await Module_OINK.default();
    await initializeModuleOINK(_Module_OINK_);
  },
  fft128:   function(testData) { perform_OINK(fftReal128,  testData); },
  fft256:   function(testData) { perform_OINK(fftReal256,  testData); },
  fft512:   function(testData) { perform_OINK(fftReal512,  testData); },
  fft1024:  function(testData) { perform_OINK(fftReal1024, testData); },
  fft2048:  function(testData) { perform_OINK(fftReal2048, testData); },
  example:  function(testData) { return perform_OINK(fftReal1024,  testData); },
};


//////////////////////////////////////
//////////////////////////////////////
// EXPORT
//////////////////////////////////////
export default PLUGIN_OINK;
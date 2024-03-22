//////////////////////////////////////
//////////////////////////////////////
// IMPORT THE FFT LIBRARY
//////////////////////////////////////
import Ooura from '/oink_fft/js/ooura/ooura.js';

//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM OOURA
//////////////////////////////////////
let ooura_oo_128;
let ooura_oo_256;
let ooura_oo_512;
let ooura_oo_1024;
let ooura_oo_2048;

function initializeOOURA(){
    return new Promise((resolve, reject) => {
        ooura_oo_128  = new Ooura(128,  {"type":"real", "radix":4} );
        ooura_oo_256  = new Ooura(256,  {"type":"real", "radix":4} );
        ooura_oo_512  = new Ooura(512,  {"type":"real", "radix":4} );
        ooura_oo_1024 = new Ooura(1024, {"type":"real", "radix":4} );
        ooura_oo_2048 = new Ooura(2048, {"type":"real", "radix":4} );
        resolve();
    });
}

const perform_OOURA = (instance, testData) => {
    let ooura_data = testData.slice(); instance.fftInPlace(ooura_data.buffer); return ooura_data;
};

//////////////////////////////////////
//////////////////////////////////////
// IMPLEMENT GIVEN INTERFACE
//////////////////////////////////////
const PLUGIN_OOURA = {
  idname:   function() { return "OOURA";  },
  fullname: function() { return "OOURA (audioplastic)"; },
  url:      function() { return "https://github.com/audioplastic/ooura"; },
  precision:function() { return "double"; },
  init:     function() { return initializeOOURA(); },
  fft128:   function(testData) { perform_OOURA(ooura_oo_128,   testData); },
  fft256:   function(testData) { perform_OOURA(ooura_oo_256,   testData); },
  fft512:   function(testData) { perform_OOURA(ooura_oo_512,   testData); },
  fft1024:  function(testData) { perform_OOURA(ooura_oo_1024,  testData); },
  fft2048:  function(testData) { perform_OOURA(ooura_oo_2048,  testData); },
  example:  function(testData) { return perform_OOURA(ooura_oo_1024,  testData); },
};

//////////////////////////////////////
//////////////////////////////////////
// EXPORT
//////////////////////////////////////
export default PLUGIN_OOURA;
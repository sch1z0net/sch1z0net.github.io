//////////////////////////////////////
//////////////////////////////////////
// IMPORT THE FFT LIBRARY
//////////////////////////////////////
let Module_KISS_;

//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM KISS
//////////////////////////////////////

let kiss_fft_4,   kiss_input_4;
let kiss_fft_8,   kiss_input_8;
let kiss_fft_16,  kiss_input_16;
let kiss_fft_32,  kiss_input_32;
let kiss_fft_64,  kiss_input_64;
let kiss_fft_128, kiss_input_128;
let kiss_fft_256, kiss_input_256;
let kiss_fft_512, kiss_input_512;
let kiss_fft_1024,kiss_input_1024;
let kiss_fft_2048,kiss_input_2048;

function initializeKISS(){
    return new Promise((resolve, reject) => {
        kiss_fft_4 = new Module_KISS_.KissFftReal(4);
        kiss_input_4 = kiss_fft_4.getInputTimeDataBuffer();
        kiss_fft_8 = new Module_KISS_.KissFftReal(8);
        kiss_input_8 = kiss_fft_8.getInputTimeDataBuffer();
        kiss_fft_16 = new Module_KISS_.KissFftReal(16);
        kiss_input_16 = kiss_fft_16.getInputTimeDataBuffer();
        kiss_fft_32 = new Module_KISS_.KissFftReal(32);
        kiss_input_32 = kiss_fft_32.getInputTimeDataBuffer();
        kiss_fft_64 = new Module_KISS_.KissFftReal(64);
        kiss_input_64 = kiss_fft_64.getInputTimeDataBuffer();
        kiss_fft_128 = new Module_KISS_.KissFftReal(128);
        kiss_input_128 = kiss_fft_128.getInputTimeDataBuffer();
        kiss_fft_256 = new Module_KISS_.KissFftReal(256);
        kiss_input_256 = kiss_fft_256.getInputTimeDataBuffer();
        kiss_fft_512 = new Module_KISS_.KissFftReal(512);
        kiss_input_512 = kiss_fft_512.getInputTimeDataBuffer();
        kiss_fft_1024 = new Module_KISS_.KissFftReal(1024);
        kiss_input_1024 = kiss_fft_1024.getInputTimeDataBuffer();
        kiss_fft_2048 = new Module_KISS_.KissFftReal(2048);
        kiss_input_2048 = kiss_fft_2048.getInputTimeDataBuffer();
        resolve();
    });
};

const perform_KISS = (input, instance, testData) => {
    input.set(testData.slice()); return instance.transform();
};


//////////////////////////////////////
//////////////////////////////////////
// IMPLEMENT GIVEN INTERFACE
//////////////////////////////////////
const PLUGIN_KISS = {
  idname:   function() { return "KISS"; },
  fullname: function() { return "KISS (mborgerding)"; },
  url:      function() { return "https://github.com/mborgerding/kissfft"; },
  precision:function() { return "double"; },
  init: async function() {
    const Module_KISS = await import('./kiss_fft.js');
    Module_KISS_ = await Module_KISS.default();
    await initializeKISS();
  },
  fft8:     function(testData) { perform_KISS(kiss_input_8,     kiss_fft_8,     testData); },
  fft16:    function(testData) { perform_KISS(kiss_input_16,    kiss_fft_16,    testData); },
  fft32:    function(testData) { perform_KISS(kiss_input_32,    kiss_fft_32,    testData); },
  fft64:    function(testData) { perform_KISS(kiss_input_64,    kiss_fft_64,    testData); },
  fft128:   function(testData) { perform_KISS(kiss_input_128,   kiss_fft_128,   testData); },
  fft256:   function(testData) { perform_KISS(kiss_input_256,   kiss_fft_256,   testData); },
  fft512:   function(testData) { perform_KISS(kiss_input_512,   kiss_fft_512,   testData); },
  fft1024:  function(testData) { perform_KISS(kiss_input_1024,  kiss_fft_1024,  testData); },
  fft2048:  function(testData) { perform_KISS(kiss_input_2048,  kiss_fft_2048,  testData); },
  example:  function(testData) { 
    switch(testData.length){
       case    4: return perform_KISS(kiss_input_4,    kiss_fft_4,   testData);
       case    8: return perform_KISS(kiss_input_8,    kiss_fft_8,   testData);
       case   16: return perform_KISS(kiss_input_16,   kiss_fft_16,  testData);
       case   32: return perform_KISS(kiss_input_32,   kiss_fft_32,  testData);
       case   64: return perform_KISS(kiss_input_64,   kiss_fft_64,  testData);
       case  128: return perform_KISS(kiss_input_128,  kiss_fft_128, testData);
       case  256: return perform_KISS(kiss_input_256,  kiss_fft_256, testData);
       case  512: return perform_KISS(kiss_input_512,  kiss_fft_512, testData);
       case 1024: return perform_KISS(kiss_input_1024, kiss_fft_1024,testData);
    }
  }  

};

//////////////////////////////////////
//////////////////////////////////////
// EXPORT
//////////////////////////////////////
export default PLUGIN_KISS;


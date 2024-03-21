//////////////////////////////////////
//////////////////////////////////////
// IMPORT THE FFT LIBRARY
//////////////////////////////////////
let Module_KISS_;

//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM KISS
//////////////////////////////////////

let kiss_fft_128, kiss_input_128;
let kiss_fft_256, kiss_input_256;
let kiss_fft_512, kiss_input_512;
let kiss_fft_1024,kiss_input_1024;
let kiss_fft_2048,kiss_input_2048;

function initializeKISS(){
    return new Promise((resolve, reject) => {
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

async function importModule() {
  try {
    const Module_KISS = await import('/oink_fft/js/kiss/kiss_fft.js');
    Module_KISS_ = await Module_KISS.default();
    await initializeKISS();

  } catch (error) {
    // Handle any errors that occur during import
    console.error('Error importing module:', error);
  }
}


//////////////////////////////////////
//////////////////////////////////////
// IMPLEMENT GIVEN INTERFACE
//////////////////////////////////////
const PLUGIN_KISS = {
  idname:   function() { return "KISS" },
  fullname: function() { return "KISS (mborgerding)"},
  url:      function() { return "https://github.com/mborgerding/kissfft" },
  precision:function() { return "double" },
  init: async function() {
    Module_KISS_ = await import('/oink_fft/js/kiss/kiss_fft.js');
    await initializeKISS();
  },
  fft128:   function(testData) { perform_KISS(kiss_input_128,   kiss_fft_128,   testData); },
  fft256:   function(testData) { perform_KISS(kiss_input_256,   kiss_fft_256,   testData); },
  fft512:   function(testData) { perform_KISS(kiss_input_512,   kiss_fft_512,   testData); },
  fft1024:  function(testData) { perform_KISS(kiss_input_1024,  kiss_fft_1024,  testData); },
  fft2048:  function(testData) { perform_KISS(kiss_input_2048,  kiss_fft_2048,  testData); },
  example:  function(testData) { return perform_KISS(kiss_input_1024,  kiss_fft_1024,  testData); },
};

//////////////////////////////////////
//////////////////////////////////////
// EXPORT
//////////////////////////////////////
export default PLUGIN_KISS;


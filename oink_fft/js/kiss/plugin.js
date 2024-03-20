//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM KISS
//////////////////////////////////////
let Module_KISS_;

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

const example_KISS = (testData) => {
    let testData64 = Float64Array.from(testData.slice());
    return perform_INDUTNY(indutny_f_1024, indutny_out_1024, testData64.slice()).slice();
}


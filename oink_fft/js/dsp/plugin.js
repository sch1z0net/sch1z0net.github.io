//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM DSP
//////////////////////////////////////
let dsp_fft_128;
let dsp_fft_256;
let dsp_fft_512;
let dsp_fft_1024;
let dsp_fft_2048;

function initializeDSP(){
    return new Promise((resolve, reject) => {
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

const example_DSP = (testData) => {
    let testData64 = Float64Array.from(testData.slice());
    return perform_DSP(dsp_fft_1024, testData64.slice()).slice();
}


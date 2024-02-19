function nextPowerOf2(n) {
    return Math.pow(2, Math.ceil(Math.log2(n)));
}

function fft(input) {
    const N = input.length;

    if (N <= 1) {
        return input;
    }

    const even = [];
    const odd = [];
    for (let i = 0; i < N; i++) {
        if (i % 2 === 0) {
            even.push(input[i]);
        } else {
            odd.push(input[i]);
        }
    }

    const evenFFT = fft(even);
    const oddFFT = fft(odd);

    const output = [];
    for (let k = 0; k < N / 2; k++) {
        const theta = -2 * Math.PI * k / N;
        const exp = { re: Math.cos(theta), im: Math.sin(theta) };
        const t = { re: exp.re * oddFFT[k].re - exp.im * oddFFT[k].im, im: exp.re * oddFFT[k].im + exp.im * oddFFT[k].re };
        output[k] = { re: evenFFT[k].re + t.re, im: evenFFT[k].im + t.im };
        output[k + N / 2] = { re: evenFFT[k].re - t.re, im: evenFFT[k].im - t.im };
    }

    return output;
}


// Function to apply Hanning window to the input signal
function applyHanningWindow(inputSignal) {
    const windowedSignal = [];
    const N = inputSignal.length;
    for (let n = 0; n < N; n++) {
        const w = 0.5 * (1 - Math.cos(2 * Math.PI * n / (N - 1))); // Hanning window formula
        windowedSignal.push(inputSignal[n] * w);
    }
    return windowedSignal;
}

// Function to perform FFT on the input signal with windowing and zero-padding
function prepare_and_fft(inputSignal, sampleRate) {
    // Apply Hanning window to the input signal
    const windowedSignal = applyHanningWindow(inputSignal);
    //const windowedSignal = inputSignal;

    // Zero-padding to the next power of 2
    const FFT_SIZE = nextPowerOf2(windowedSignal.length);
    const paddedInput = new Array(FFT_SIZE).fill(0);
    windowedSignal.forEach((value, index) => paddedInput[index] = value);

    // Convert to complex numbers
    const complexInput = convertToComplex(paddedInput);

    // Perform FFT
    return fft(complexInput);
}



function convertToComplex(inputSignal) {
    return inputSignal.map(value => ({ re: value, im: 0 }));
}




// audio-processor.js (AudioWorkletProcessor)
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.fftSize = 2048; // FFT size (you can adjust this)
    this.lastProcessingTime = 0;
    this.processingInterval = 200; // Processing interval in milliseconds (adjust as needed)
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0]; // Get the input audio data
    const output = outputs[0]; // Get the output audio data

    // Check if input data is null or empty
    if (!input || input.length === 0) {
      console.log("No audio to process, but keep processor running");
      return true; // Keep the processor alive without processing any audio data
    }

    // Extract audio samples from the input array
    const numChannels = input.length;
    const numSamples = input[0].length;

    // Mix the channels into a single mono channel
    const monoChannel = new Float32Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      let sum = 0;
      for (let ch = 0; ch < numChannels; ch++) {
        sum += input[ch][i];
      }
      monoChannel[i] = sum / numChannels;
    }

    // Check if enough time has elapsed since the last processing
    const currentTime = performance.now();
    if (currentTime - this.lastProcessingTime < this.processingInterval) {
      return true; // Skip processing
    }

    // Perform the processing (FFT analysis) on the mono channel
    prepare_and_fft(monoChannel, this.sampleRate, this.fftSize);

    // Update the last processing time
    this.lastProcessingTime = currentTime;

    return true; // Keep the processor alive
  }
}

registerProcessor('audio-processor', AudioProcessor);

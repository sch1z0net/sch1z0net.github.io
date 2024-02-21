importScripts('./fft.js');



/*
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


// Find the frequency with the highest magnitude in the spectrum
function findPeakFrequency(spectrum, sampleRate) {
    const N = spectrum.length;
    let maxMagnitude = 0;
    let maxIndex = 0;

    for (let i = 0; i < N / 2; i++) { // Only consider the positive frequencies
        const magnitude = Math.sqrt(spectrum[i].re * spectrum[i].re + spectrum[i].im * spectrum[i].im);

        if (magnitude > maxMagnitude) {
            maxMagnitude = magnitude;
            maxIndex = i;
        }
    }

    // Calculate the corresponding frequency
    const frequency = maxIndex * sampleRate / N;

    return frequency;
}
*/

/*
function displaySpec(audiobuffer, sampleRate){
   const spectrum = fft_audio_buffer(audiobuffer);
   const numBins = spectrum.length;
   const minBinIndex = Math.round((minFrequency / sampleRate) * numBins);
   const maxBinIndex = Math.round((maxFrequency / sampleRate) * numBins);
   // Extract the subset of the spectrum corresponding to frequencies between minFrequency and maxFrequency
   const subsetSpectrum = spectrum.slice(minBinIndex, maxBinIndex);
   //console.log("FFT result:", subsetSpectrum);
   const peakFrequency = findPeakFrequency(subsetSpectrum, sampleRate);
   console.log("Peak frequency:", peakFrequency, "Hz");
   // Plot spectrum
   plotSpectrum(spectrumCanvas, subsetSpectrum, sampleRate);
}*/























// audio-processor.js (AudioWorkletProcessor)
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.port.onmessage = this.handleMessage.bind(this);
    
    //this.fftSize = 512;
    //this.fftSize = 1024;
    this.fftSize = 2048;
    //this.fftSize = 4096;
    //this.fftSize = 8192;
    this.lastProcessingTime = 0;
    this.processingInterval = 260; // Processing interval in milliseconds (adjust as needed)
    // Create an array to store the frequency data
    this.frequencyBinCount = this.fftSize / 2;
    this.frequencyData = new Uint8Array(this.frequencyBinCount).fill(0); // Only need half the FFT size due to Nyquist theorem
    this.sampleBuffer = [];

    // Initialize variables for EMA smoothing
    //this.alpha = 0.6; // Smoothing factor (adjust as needed)
    //this.prevSmoothedData = null;

    // Time-domain smoothing parameters
    this.bufferSize = 3; // Number of frames to use for smoothing
    this.spectrumBuffer = [];
    this.smoothedSpectrum = new Float32Array(this.frequencyBinCount).fill(0);
  }

  // Inside AudioProcessor class
  handleMessage(event) {
    const { data } = event;
    if (data.type === 'getFrequencyData') {
      const frequencyData = this.getByteFrequencyData();
      this.port.postMessage({ type: 'frequencyData', data: frequencyData });
    }
  }



  process(inputs, outputs, parameters) {
    const input = inputs[0]; // Get the input audio data
    const output = outputs[0]; // Get the output audio data
    // Check if input data is null or empty
    if (!input || input.length === 0) {
      //console.log("No audio to process, but keep processor running");
      return true; // Keep the processor alive without processing any audio data
    }


    // Throttle processing
    const currentTime = this.currentTime;
    if (currentTime - this.lastProcessingTime < this.processingInterval) {
      return true; // Keep the processor alive without processing any audio data
    }


    // Extract audio samples from the input array (assuming mono input)
    const monoChannel = input[0];
    const numSamples = monoChannel.length;

    // Push samples into the buffer
    this.sampleBuffer.push(...monoChannel);

    // Check if the buffer contains enough samples for processing
    if (this.sampleBuffer.length >= this.fftSize) {
      // Extract the required number of samples from the buffer
      const samplesToProcess = this.sampleBuffer.splice(0, this.fftSize);

      // Perform processing (e.g., FFT analysis) on the extracted samples
      const fftData = this.performFFT(samplesToProcess);

      // Convert FFT data to frequency data
      this.convertToFrequencyData(fftData);

      // Perform EMA smoothing on frequency data
      //this.frequencyData = this.smoothFrequencyData(this.frequencyData);

      this.updateSmoothedSpectrum();
    }

    // Update the last processing time
    this.lastProcessingTime = currentTime;

    return true; // Keep the processor alive
  }

  performFFT(inputData) {
    // Perform the processing (FFT analysis) on the mono channel
    var spectrum = prepare_and_fft(inputData);
    
    /*const numBins = spectrum.length;
    const maxFrequency = 10000; // Maximum frequency (10 kHz)
    const minFrequency = 20; // Minimum frequency (20 Hz)
    const minBinIndex = Math.round((minFrequency / sampleRate) * numBins);
    const maxBinIndex = Math.round((maxFrequency / sampleRate) * numBins);
    // Extract the subset of the spectrum corresponding to frequencies between minFrequency and maxFrequency
    const subsetSpectrum = spectrum.slice(minBinIndex, maxBinIndex);
    const peakFrequency = findPeakFrequency(subsetSpectrum, sampleRate);
    console.log("Peak frequency:", peakFrequency, "Hz");*/

    return spectrum;
  }

  convertToFrequencyData(fftData) {
    // Calculate magnitude spectrum from complex FFT data
    for (let i = 0; i < this.frequencyData.length; i++) {
      const re = fftData[i].re;
      const im = fftData[i].im;
      // Calculate magnitude
      this.frequencyData[i] = Math.sqrt(re * re + im * im);
    }
  }

  smoothFrequencyData(data) {
    if (!this.prevSmoothedData) {
      // If no previous smoothed data, initialize with current data
      this.prevSmoothedData = data.slice();
      return data;
    }

    // Apply EMA smoothing to each frequency bin
    for (let i = 0; i < data.length; i++) {
      this.prevSmoothedData[i] = this.alpha * data[i] + (1 - this.alpha) * this.prevSmoothedData[i];
    }

    return this.prevSmoothedData;
  }

  updateSmoothedSpectrum() {
        // Add the current spectrum frame to the buffer
        this.spectrumBuffer.push([...this.frequencyData]);

        // Remove the oldest spectrum frame if the buffer exceeds its size
        if (this.spectrumBuffer.length > this.bufferSize) {
            this.spectrumBuffer.shift();
        }

        // Calculate the average spectrum frame from the buffer
        this.smoothedSpectrum.fill(0);
        for (const spectrumFrame of this.spectrumBuffer) {
            for (let i = 0; i < this.frequencyBinCount; i++) {
                this.smoothedSpectrum[i] += spectrumFrame[i];
            }
        }
        // Divide each bin by the number of frames to get the average
        const numFrames = this.spectrumBuffer.length;
        for (let i = 0; i < this.frequencyBinCount; i++) {
            this.smoothedSpectrum[i] /= numFrames;
        }
  }

  getByteFrequencyData() {
      // Return the smoothed spectrum data
      return this.smoothedSpectrum;
  }
}










registerProcessor('audio-processor', AudioProcessor);

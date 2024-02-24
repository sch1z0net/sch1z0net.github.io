function convertToComplex(inputSignal) {
    return inputSignal.map(value => ({ re: value, im: 0 }));
}

function nextPowerOf2(n) {
    return Math.pow(2, Math.ceil(Math.log2(n)));
}

/******************** UTILS *********************/
// Function to create a Hanning window
function createHanningWindow(windowLength) {
    const window = new Float32Array(windowLength);
    for (let i = 0; i < windowLength; i++) {
        window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (windowLength - 1)));
    }
    return window;
}

// Function to apply Hanning window to the input signal
function applyHanningWindow(frame) {
    const windowedFrame = new Float32Array(frame.length);
    for (let i = 0; i < frame.length; i++) {
        windowedFrame[i] = frame[i] * 0.5 * (1 - Math.cos(2 * Math.PI * i / (frame.length - 1)));
    }
    return windowedFrame;
}

function generateFFTFactorLookup(maxSampleLength) {
    const maxN = nextPowerOf2(maxSampleLength);
    const fftFactorLookup = {};

    for (let N = 2; N <= maxN; N *= 2) {
        fftFactorLookup[N] = precalculateFFTFactors(N);
    }

    return fftFactorLookup;
}

/******************** FORWARD *********************/

/*
// Cache object to store precalculated FFT factors
const fftFactorCache = {};

// Function to compute FFT factors with caching
function computeFFTFactorsWithCache(N) {
    // Check if FFT factors for this size are already cached
    if (fftFactorCache[N]) {
        return fftFactorCache[N];
    }

    // Calculate FFT factors
    const factors = [];
    for (let k = 0; k < N / 2; k++) {
        const theta = -2 * Math.PI * k / N;
        factors.push({ re: Math.cos(theta), im: Math.sin(theta) });
    }

    // Cache the factors for future use
    fftFactorCache[N] = factors;

    return factors;
}



// Bit reversal function
function bitReverse(num, bits) {
    let reversed = 0;
    for (let i = 0; i < bits; i++) {
        reversed = (reversed << 1) | (num & 1);
        num >>= 1;
    }
    return reversed;
}

// Function to pad the input array with zeros to make its length a power of 2
function padArray(input) {
    const N = input.length;
    const paddedLength = Math.pow(2, Math.ceil(Math.log2(N)));
    const paddedInput = new Array(paddedLength).fill(0);
    input.forEach((value, index) => paddedInput[index] = value);
    return paddedInput;
}


// Calculate the FFT of real-valued input data and return complex numbers as output
function fftReal(input) {
    const N = input.length;

    if(N != nextPowerOf2(N)){
        console.error("FFT FRAME must have power of 2");
    }

    // Base case of recursion: if input has only one element, return it as complex number
    if (N === 1) {
        return [{ re: input[0], im: 0 }];
    }

    // Split the input into even and odd parts
    const even = [];
    const odd = [];
    for (let i = 0; i < N; i += 2) {
        even.push(input[i]);
        odd.push(input[i + 1]);
    }

    // Recursively calculate FFT for even and odd parts
    const evenFFT = fftReal(even);
    const oddFFT = fftReal(odd);

    // Combine the results of even and odd parts
    const result = [];
    for (let k = 0; k < N / 2; k++) {
        const angle = -2 * Math.PI * k / N;
        const twiddleReal = Math.cos(angle);
        const twiddleImag = Math.sin(angle);

        const evenPart = { re: evenFFT[k].re, im: evenFFT[k].im };
        const oddPart = {
            re: oddFFT[k].re * twiddleReal - oddFFT[k].im * twiddleImag,
            im: oddFFT[k].re * twiddleImag + oddFFT[k].im * twiddleReal
        };

        // Combine the results of even and odd parts...
        result[k] = {         re: evenPart.re + oddPart.re, im: evenPart.im + oddPart.im };
        result[k + N / 2] = { re: evenPart.re - oddPart.re, im: evenPart.im - oddPart.im };
    }


    return result;
}


function fftRealInPlace(input) {
    const N = input.length;

    if(N != nextPowerOf2(N)){
        console.error("FFT FRAME must have power of 2");
        return;
    }

    // Perform bit reversal
    const bits = Math.log2(N);
    const output = new Array(N);
    for (let i = 0; i < N; i++) {
       const reversedIndex = bitReverse(i, bits);
       output[reversedIndex] = { re: input[i], im: 0 };
    }

    // Base case of recursion: if input has only one element, return it as complex number
    if (N === 1) {
        return [{ re: output[0], im: 0 }];
    }

    // Recursively calculate FFT
    for (let size = 2; size <= N; size *= 2) {
        const halfSize = size / 2;
        // Get FFT factors with caching
        const factors = computeFFTFactorsWithCache(size);
        for (let i = 0; i < N; i += size) {
            for (let j = 0; j < halfSize; j++) {
                const evenIndex = i + j;
                const oddIndex = i + j + halfSize;
                const evenPart = output[evenIndex];
                const oddPart = {
                    re: output[oddIndex].re * factors[j].re - output[oddIndex].im * factors[j].im,
                    im: output[oddIndex].re * factors[j].im + output[oddIndex].im * factors[j].re
                };

                // Combine results of even and odd parts
                output[evenIndex] = {  re: evenPart.re + oddPart.re, im: evenPart.im + oddPart.im  };
                output[oddIndex]  = {  re: evenPart.re - oddPart.re, im: evenPart.im - oddPart.im  };
            }
        }
    }

    return output;
}

function prepare_and_fft(inputSignal, fftFactorLookup=null) {
    // Apply Hanning window to the input signal
    const windowedSignal = inputSignal;
    //const windowedSignal = applyHanningWindow(inputSignal); 

    // Zero-padding to the next power of 2
    const FFT_SIZE = nextPowerOf2(windowedSignal.length);
    //const paddedInput = new Array(FFT_SIZE).fill({ re: 0, im: 0 });
    const paddedInput = new Array(FFT_SIZE).fill(0);
    //windowedSignal.forEach((value, index) => (paddedInput[index] = { re: value, im: 0 }));
    windowedSignal.forEach((value, index) => (paddedInput[index] = value));

    // Perform FFT
    //var spectrumReal = await fftInPlaceReal(paddedInput, fftFactorLookup);
    // Map real-only spectrum to complex numbers
    //const spectrumComplex = spectrumReal.map(value => ({ re: value, im: 0 }));
    //return spectrumComplex;
    return fftRealInPlace(paddedInput);
    //return fftReal(paddedInput);
}*/




/******************** FORWARD *********************/
// Cache object to store precalculated FFT factors
const fftFactorCache = {};

// Pre-calculate FFT factors for a given size and cache them for future use
function precalculateFFTFactors(N) {
    const factors = new Float32Array(N); // Double the size for both real and imaginary parts
    for (let k = 0; k < N / 2; k++) {
        const theta = -2 * Math.PI * k / N;
        factors[k * 2] = Math.cos(theta); // Real part
        factors[k * 2 + 1] = Math.sin(theta); // Imaginary part
    }
    return factors;
}

// Function to compute FFT factors with caching
function computeFFTFactorsWithCache(N) {
    // Check if FFT factors for this size are already cached
    if (!fftFactorCache[N]) {
        // Calculate FFT factors and cache them
        fftFactorCache[N] = precalculateFFTFactors(N);
    }

    // Return the cached factors
    return fftFactorCache[N];
}


// Bit reversal function
function bitReverse(num, bits) {
    let reversed = 0;
    for (let i = 0; i < bits; i++) {
        reversed = (reversed << 1) | (num & 1);
        num >>= 1;
    }
    return reversed;
}

// Function to pad the input array with zeros to make its length a power of 2
function padArray(input) {
    const N = input.length;
    const paddedLength = Math.pow(2, Math.ceil(Math.log2(N)));
    const paddedInput = new Array(paddedLength).fill(0);
    input.forEach((value, index) => paddedInput[index] = value);
    return paddedInput;
}


function fftRealInPlace(input) {
    const N = input.length;
    const bits = Math.log2(N);

    if (N !== nextPowerOf2(N)) {
        console.error("FFT FRAME must have power of 2");
        return;
    }

    // Perform bit reversal in place, treating the input as real-valued
    for (let i = 0; i < N; i++) {
        const reversedIndex = bitReverse(i, bits);
        if (reversedIndex > i) {
            // Swap elements if necessary
            const temp = input[i];
            input[i] = input[reversedIndex];
            input[reversedIndex] = temp;
        }
    }

    // Convert the real-valued input to a complex-valued Float32Array
    const complexInput = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
        complexInput[i * 2] = input[i];
        complexInput[i * 2 + 1] = 0; // Imaginary part is set to 0
    }

    // Recursively calculate FFT
    for (let size = 2; size <= N; size *= 2) {
        const halfSize = size / 2;
        // Precompute FFT factors
        const factors = computeFFTFactorsWithCache(size);
        for (let i = 0; i < N; i += size) {
            for (let j = 0; j < halfSize; j++) {
                const evenIndex = i + j;
                const oddIndex = i + j + halfSize;

                // Get real and imaginary parts of even and odd elements
                const evenRe = complexInput[evenIndex * 2];
                const evenIm = complexInput[evenIndex * 2 + 1];
                const oddRe = complexInput[oddIndex * 2];
                const oddIm = complexInput[oddIndex * 2 + 1];

                // Use precalculated FFT factors directly
                const twiddleRe = factors[j * 2];
                const twiddleIm = factors[j * 2 + 1];

                // Perform complex multiplication
                const twiddledOddRe = oddRe * twiddleRe - oddIm * twiddleIm;
                const twiddledOddIm = oddRe * twiddleIm + oddIm * twiddleRe;

                // Update even and odd elements with new values
                complexInput[evenIndex * 2]     = evenRe + twiddledOddRe;
                complexInput[evenIndex * 2 + 1] = evenIm + twiddledOddIm;
                complexInput[oddIndex * 2]      = evenRe - twiddledOddRe;
                complexInput[oddIndex * 2 + 1]  = evenIm - twiddledOddIm;
            }
        }

    }

    // Return the output
    return complexInput;
}




async function prepare_and_fft(inputSignal, fftFactorLookup=null) {
    // Apply Hanning window to the input signal (if needed)
    // const windowedSignal = applyHanningWindow(inputSignal); // Assuming the windowing function is already applied or not needed

    // Zero-padding to the next power of 2
    const FFT_SIZE = nextPowerOf2(inputSignal.length);
    const paddedInput = new Float32Array(FFT_SIZE).fill(0);
    inputSignal.forEach((value, index) => paddedInput[index] = value); // Store real part in even indices

    // Perform FFT
    return await fftRealInPlace(paddedInput);
}



async function FFT(inputSignal, fftFactorLookup=null) {
    return await prepare_and_fft(inputSignal, fftFactorLookup);
}


// Function to compute FFT of a frame
async function computeFFT(frame, fftFactorLookup=null) {
    // Perform FFT on the frame (you can use your FFT implementation here)
    // For simplicity, let's assume computeFFT returns the magnitude spectrum
    const spectrum = await FFT(frame, fftFactorLookup);
    
    // Convert the Float32Array spectrum back to a complex array
    const complexSpectrum = [];
    for (let i = 0; i < spectrum.length; i += 2) {
        complexSpectrum.push({ re: spectrum[i], im: spectrum[i + 1] });
    }

    console.log(complexSpectrum);

    return complexSpectrum;
}







// audio-processor.js (AudioWorkletProcessor)
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.port.onmessage = this.handleMessage.bind(this);
    
    var MAX_FFT_SIZE = 8192;

    // Create an array to store the frequency data
    this.frequencyBinCount = MAX_FFT_SIZE / 2; // Only need half the FFT size due to Nyquist theorem
    this.frequencyData = new Uint8Array(this.frequencyBinCount).fill(0); 
    this.sampleBuffer = [];

    // Initialize variables for EMA smoothing
    //this.alpha = 0.6; // Smoothing factor (adjust as needed)
    //this.prevSmoothedData = null;

    this.fftSize = 2048;
    // Time-domain smoothing parameters
    this.bufferSize = 3; // Number of frames to use for smoothing
    this.spectrumBuffer = [];
    this.smoothedSpectrum = new Float32Array(this.frequencyBinCount).fill(0);
  }

  // Inside AudioProcessor class
  handleMessage(event) {
    const { type, fftSize, smoothingSize } = event.data;
    if(fftSize){ this.fftSize = parseInt(fftSize);  this.frequencyBinCount = this.fftSize / 2; }
    if(smoothingSize){ this.bufferSize = parseInt(smoothingSize); }
    if (type === 'getFrequencyData') {
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

    // ADD? Throttle processing

    // Convert multichannel input to mono
    const numChannels = input.length;
    const numSamples = input[0].length;
    const monoChannel = new Float32Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
        let sum = 0;
        for (let j = 0; j < numChannels; j++) {
            sum += input[j][i];
        }
        monoChannel[i] = sum / numChannels;
    }

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

    return true; // Keep the processor alive
  }


  performFFT(inputData) {
    // Perform the processing (FFT analysis) on the mono channel
    var spectrum = computeFFT(inputData)
    return spectrum;
  }

  convertToFrequencyData(fftData) {
    // Calculate magnitude spectrum from complex FFT data
    for (let i = 0; i < this.fftSize; i++) {
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

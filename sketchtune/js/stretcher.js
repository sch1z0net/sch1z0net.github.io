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

function ifft(input) {
    // Reverse the order of the complex input array (if needed)
    //const reversedInput = input.slice().reverse();
    const reversedInput = input.slice();

    // Apply FFT to the reversed array
    const fftResult = fft(reversedInput);

    // Take the complex conjugate of the FFT result
    const conjugateResult = fftResult.map(({ re, im }) => ({ re, im: -im }));

    // Perform FFT on the conjugate result
    const fftConjugate = fft(conjugateResult);

    // Take the complex conjugate of the final FFT result
    const ifftResult = fftConjugate.map(({ re, im }) => ({ re, im: -im }));

    // Scale the output by dividing by the length of the input array
    return ifftResult.map(({ re, im }) => ({ re: re / input.length, im: im / input.length }));
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
function prepare_and_fft(inputSignal) {
    // Apply Hanning window to the input signal
    //const windowedSignal = applyHanningWindow(inputSignal);
    const windowedSignal = inputSignal;

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




  // Function to perform phase vocoding
  function phaseVocoder(audioContext, inputBuffer, stretchFactor) {

    const windowSize = 2048; // Size of the analysis window
    const hopSize = Math.floor(windowSize / 4); // Hop size for overlap-add   //512


    const analysisWindow = new Float32Array(windowSize); // Analysis window
    // Initialize analysis window with Hanning window function
    for (let i = 0; i < windowSize; i++) {
        analysisWindow[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / windowSize));
    }

    
    const numChannels = inputBuffer.numberOfChannels;
    const numFrames = Math.ceil(inputBuffer.length / hopSize);
    const outputBuffer = audioContext.createBuffer(numChannels, numFrames * hopSize, audioContext.sampleRate);
    
    console.log(numFrames, hopSize);

    // Process inputBuffer frame by frame for each channel
    for (let ch = 0; ch < numChannels; ch++) {
        const inputData = inputBuffer.getChannelData(ch);
        const outputData = outputBuffer.getChannelData(ch);

        for (let i = 0; i < numFrames; i++) {
            // Extract frame
            const start = i * hopSize;
            const end = Math.min(start + windowSize, inputData.length);
            const frame = inputData.subarray(start, end);
            
            // Apply window function
            for (let j = 0; j < frame.length; j++) {
                frame[j] *= analysisWindow[j];
            }
            
            // Perform FFT (you need to implement FFT function)
            const spectrum = prepare_and_fft(frame);
            
            // Modify spectrum phase and magnitude (time stretching)
            // You would typically interpolate between frames to change the phase and magnitude
            

            // Perform IFFT (you need to implement IFFT function)
            const processedFrame = ifft(spectrum);
            console.log(
                "input frame length",frame.length,
                "spectrum length",spectrum.length,
                "output frame length",processedFrame.length
            );
            
            // Overlap-add
            for (let j = 0; j < processedFrame.length; j++) {
                outputData[i * hopSize + j] += processedFrame[j];
            }
        }
    }

    return outputBuffer;
  }

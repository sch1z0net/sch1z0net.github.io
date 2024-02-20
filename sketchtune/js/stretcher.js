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
    const N = input.length;
    const pi = Math.PI;

    // Take the complex conjugate of the input spectrum
    const conjugateSpectrum = input.map(({ re, im }) => ({ re, im: -im }));

    // Apply FFT to the conjugate spectrum
    const fftResult = fft(conjugateSpectrum);

    // Take the complex conjugate of the FFT result
    const ifftResult = fftResult.map(({ re, im }) => ({ re: re / N, im: -im / N }));

    return ifftResult;
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







function FFT(inputSignal){
   return prepare_and_fft(inputSignal);  
} 

function IFFT(spectrum){
   return ifft(spectrum).map(({ re }) => re);
} 









// Function to apply windowing to a frame
function applyWindow(frame) {
    // Hanning window function
    const windowedFrame = frame.map((value, index) => value * 0.5 * (1 - Math.cos(2 * Math.PI * index / (frame.length - 1))));
    return windowedFrame;
}

// Function to compute FFT of a frame
function computeFFT(frame) {
    // Perform FFT on the frame (you can use your FFT implementation here)
    // For simplicity, let's assume computeFFT returns the magnitude spectrum
    const spectrum = FFT(frame);
    return spectrum;
}

// Function to compute inverse FFT of a spectrum
function computeInverseFFT(spectrum) {
    // Perform inverse FFT to obtain the time-domain frame (you can use your IFFT implementation here)
    // For simplicity, let's assume computeInverseFFT returns the time-domain frame
    
    // Ensure the size of the spectrum array is a power of 2
    const paddedSize = nextPowerOf2(spectrum.length);

    // Pad both real and imaginary parts of the spectrum
    const paddedSpectrum = [];
    for (let i = 0; i < paddedSize; i++) {
        if (i < spectrum.length) {
            paddedSpectrum.push(spectrum[i]);
        } else {
            // Pad with zeros for both real and imaginary parts
            paddedSpectrum.push({ re: 0, im: 0 });
        }
    }

    // Now you can pass paddedSpectrum to the IFFT function
    const timeDomainSignal = IFFT(paddedSpectrum);
    return timeDomainSignal;
}

// Function to perform Short-Time Fourier Transform (STFT)
function STFT(inputSignal, windowSize, hopSize) {
    const numFrames = Math.floor((inputSignal.length - windowSize) / hopSize) + 1;
    const spectrogram = [];

    // Iterate over each frame
    for (let i = 0; i < numFrames; i++) {
        // Calculate start index of current frame
        const startIdx = i * hopSize;
        
        // Apply window function to the current frame
        const frame = inputSignal.slice(startIdx, startIdx + windowSize);
        const windowedFrame = applyWindow(frame);
        
        // Compute FFT of the windowed frame
        const spectrum = computeFFT(windowedFrame);

        // Store the spectrum in the spectrogram
        spectrogram.push(spectrum);
    }

    return spectrogram;
}

// Function to perform inverse Short-Time Fourier Transform (ISTFT)
function ISTFT(spectrogram, windowSize, hopSize) {
    const numFrames = spectrogram.length;
    const outputSignalLength = (numFrames - 1) * hopSize + windowSize;
    const outputSignal = new Array(outputSignalLength).fill(0);

    // Iterate over each frame in the spectrogram
    for (let i = 0; i < numFrames; i++) {
        // Compute inverse FFT of the spectrum to obtain the frame in time domain
        const frame = computeInverseFFT(spectrogram[i]);
        console.log(spectrogram[i], frame);

        // Apply overlap-add to reconstruct the output signal
        const startIdx = i * hopSize;
        for (let j = 0; j < windowSize; j++) {
            outputSignal[startIdx + j] += frame[j] * 0.5 * (1 - Math.cos(2 * Math.PI * j / (windowSize - 1)));
        }
    }

    return outputSignal;
}







// Function to perform time stretching using phase vocoder
function timeStretch(inputSignal, stretchFactor, windowSize, hopSize) {
    // Apply STFT to input signal
    const spectrogram = STFT(inputSignal, windowSize, hopSize);
    // Modify magnitude and phase components based on stretch factor
    const stretchedSpectrogram = stretchSpectrogram(spectrogram, stretchFactor);
    //const stretchedSpectrogram = spectrogram;
    // Apply inverse STFT to reconstruct processed signal
    const processedSignal = ISTFT(stretchedSpectrogram, windowSize, hopSize);
    //console.log("SPECT",stretchedSpectrogram,"PROC",processedSignal);
    return processedSignal;
}

// Function to stretch spectrogram
function stretchSpectrogram(spectrogram, stretchFactor) {
    const stretchedFrames = interpolateMagnitudes(spectrogram, stretchFactor);
    const stretchedPhases = synchronizePhase(spectrogram, stretchFactor);
    
    const stretchedSpectrogram = [];
    for (let i = 0; i < stretchedFrames.length; i++) {
        var frameWithMagnitudes = stretchedFrames[i];
        var frameWithPhases = stretchedPhases[i];
        var frameWithPairs = [];
        for (let j = 0; j < frameWithMagnitudes.length; j++) {
           var pair = [frameWithMagnitudes[j],frameWithPhases[j]];
           frameWithPairs.push(pair);
        }
        stretchedSpectrogram.push(frameWithPairs);
    }

    return stretchedSpectrogram;
}

// Function to interpolate magnitudes between frames in the entire spectrogram
function interpolateMagnitudes(spectrogram, stretchFactor) {
    const numFrames = spectrogram.length;
    const numBins = spectrogram[0].length;
    const stretchedNumFrames = Math.floor(numFrames * stretchFactor);
    const stretchedSpectrogram = [];

    // Interpolate magnitudes for each frame in the stretched spectrogram
    for (let i = 0; i < stretchedNumFrames; i++) {
        // Calculate the frame index in the original spectrogram
        const originalFrameIndex = i / stretchFactor;
        
        // Get the indices of the adjacent frames
        var frameIndex1 = Math.floor(originalFrameIndex);
        var frameIndex2 = Math.ceil(originalFrameIndex);

        // Handle edge cases where frameIndex2 exceeds the maximum index
        if (frameIndex2 >= numFrames) {
            frameIndex2 = numFrames - 1;
            frameIndex1 = numFrames - 2;
        }

        // Calculate the fraction between the two frames
        const fraction = originalFrameIndex - frameIndex1;

        // Interpolate magnitudes between the adjacent frames
        const interpolatedFrame = interpolateFrameMagnitudes(spectrogram[frameIndex1], spectrogram[frameIndex2], numBins, fraction);

        // Store the interpolated frame in the stretched spectrogram
        stretchedSpectrogram.push(interpolatedFrame);
    }

    return stretchedSpectrogram;
}


// Function to interpolate magnitudes between frames
function interpolateFrameMagnitudes(frame1, frame2, numBins, fraction) {
    const interpolatedMagnitudes = new Array(numBins).fill(0);
    
    // Interpolate magnitudes for each bin
    for (let j = 0; j < numBins; j++) {
        const magnitude1 = frame1[j].re;
        const magnitude2 = frame2[j].re;
        interpolatedMagnitudes[j] = (1 - fraction) * magnitude1 + fraction * magnitude2;
    }

    return interpolatedMagnitudes;
}



// Function to synchronize phase values between frames in the entire spectrogram
function synchronizePhase(spectrogram, stretchFactor) {
    const numFrames = spectrogram.length;
    const numBins = spectrogram[0].length;
    const stretchedNumFrames = Math.floor(numFrames * stretchFactor);
    const stretchedPhases = [];

    // Synchronize phase values for each frame in the stretched spectrogram
    for (let i = 0; i < stretchedNumFrames; i++) {
        // Calculate the frame index in the original spectrogram
        const originalFrameIndex = i / stretchFactor;

        // Get the indices of the adjacent frames
        var frameIndex1 = Math.floor(originalFrameIndex);
        var frameIndex2 = Math.ceil(originalFrameIndex);

        // Handle edge cases where frameIndex2 exceeds the maximum index
        if (frameIndex2 >= numFrames) {
            frameIndex2 = numFrames - 1;
            frameIndex1 = numFrames - 2;
        }

        // Calculate the fraction between the two frames
        const fraction = originalFrameIndex - frameIndex1;

        // Synchronize phase values between the adjacent frames
        const synchronizedPhase = synchronizeFramePhases(spectrogram[frameIndex1], spectrogram[frameIndex2], numBins, fraction);

        // Store the synchronized phase in the stretched phases array
        stretchedPhases.push(synchronizedPhase);
    }

    return stretchedPhases;
}

// Function to synchronize phase values between frames
function synchronizeFramePhases(frame1, frame2, numBins, fraction) {
    const synchronizedPhase = [];

    // Synchronize phase values for each bin
    for (let j = 0; j < numBins; j++) {
        const phase1 = frame1[j].im;
        const phase2 = frame2[j].im;

        // Calculate the difference in phase
        let phaseDiff = phase2 - phase1;

        // Wrap phase difference to [-π, π] range
        if (phaseDiff > Math.PI) {
            phaseDiff -= 2 * Math.PI;
        } else if (phaseDiff < -Math.PI) {
            phaseDiff += 2 * Math.PI;
        }

        // Interpolate phase values
        synchronizedPhase.push(phase1 + fraction * phaseDiff);
    }

    return synchronizedPhase;
}









// Function to perform phase vocoding
function phaseVocoder(audioContext, inputBuffer, stretchFactor) {
    const windowSize = 512 * 4; // Size of the analysis window
    const hopSize = windowSize / 2; // 50% overlap

    const numChannels = inputBuffer.numberOfChannels;
    const inputLength = inputBuffer.length;
    const outputLength = Math.ceil(inputLength * stretchFactor);
    const outputBuffer = audioContext.createBuffer(numChannels, outputLength, audioContext.sampleRate);

    // Process inputBuffer frame by frame for each channel
    for (let ch = 0; ch < numChannels; ch++) {
        const inputData = inputBuffer.getChannelData(ch);

        // Time-stretch the input data
        const processedSignal = timeStretch(inputData, stretchFactor, windowSize, hopSize);

        // Convert processedSignal to Float32Array if necessary
        const processedSignalFloat32 = new Float32Array(processedSignal);

        // Copy the processed signal to the output buffer
        outputBuffer.copyToChannel(processedSignalFloat32, ch);
    }

    console.log(inputBuffer, outputBuffer);

    return outputBuffer;
}




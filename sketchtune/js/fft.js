function convertToComplex(inputSignal) {
    return inputSignal.map(value => ({ re: value, im: 0 }));
}

function nextPowerOf2(n) {
    return Math.pow(2, Math.ceil(Math.log2(n)));
}

/******************** UTILS *********************/
// Function to apply Hanning window to the input signal
function applyHanningWindow(frame) {
    const windowedFrame = new Float32Array(frame.length);
    for (let i = 0; i < frame.length; i++) {
        windowedFrame[i] = frame[i] * 0.5 * (1 - Math.cos(2 * Math.PI * i / (frame.length - 1)));
    }
    return windowedFrame;
}

function precalculateFFTFactors(N) {
    const factors = [];
    for (let k = 0; k < N / 2; k++) {
        const theta = -2 * Math.PI * k / N;
        factors.push({ re: Math.cos(theta), im: Math.sin(theta) });
    }
    return factors;
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
// Bit reversal function
function bitReverse(num, bits) {
    let reversed = 0;
    for (let i = 0; i < bits; i++) {
        reversed = (reversed << 1) | (num & 1);
        num >>= 1;
    }
    return reversed;
}

// In-place FFT algorithm
async function fftInPlace(input, fftFactorLookup=null) {
    const N = input.length;
    const bits = Math.log2(N);

    if (N <= 1) {
        return input;
    }

    // Bit reversal permutation
    for (let i = 0; i < N; i++) {
        const j = bitReverse(i, bits);
        if (j > i) {
            const temp = input[j];
            input[j] = input[i];
            input[i] = temp;
        }
    }

    // Perform FFT in-place
    for (let len = 2; len <= N; len <<= 1) {
        const angle = -2 * Math.PI / len;
        for (let i = 0; i < N; i += len) {
            for (let k = 0; k < len / 2; k++) {
                const index = k + i;
                const evenIndex = index;
                const oddIndex = index + len / 2;

                const exp = fftFactorLookup ? fftFactorLookup[N][k] : { re: Math.cos(k * angle), im: Math.sin(k * angle) };

                const tRe = exp.re * input[oddIndex].re - exp.im * input[oddIndex].im;
                const tIm = exp.re * input[oddIndex].im + exp.im * input[oddIndex].re;

                input[oddIndex].re = input[evenIndex].re - tRe;
                input[oddIndex].im = input[evenIndex].im - tIm;
                input[evenIndex].re += tRe;
                input[evenIndex].im += tIm;
            }
        }
    }

    return input;
}


// Cache object to store precomputed FFT results
const fftCache = {};

// Function to perform FFT with caching
async function fftWithCache(input) {
    const cacheKey = JSON.stringify(input); // Generate cache key based on input

    // Check if FFT result for this input is already cached
    if (fftCache[cacheKey]) {
        return fftCache[cacheKey];
    }

    // Perform FFT calculation
    const fftResult = await fftInPlace(input);

    // Cache the result for future use
    fftCache[cacheKey] = fftResult;

    return fftResult;
}


/*
// Modified FFT function to use precalculated FFT factors
// input was zero padded before to a length N = PowerOf2
async function fft(input, fftFactorLookup=null) {

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

    const evenFFT = await fft(even);
    const oddFFT = await fft(odd);

    const output = [];
    if(fftFactorLookup==null){ 
        //Calculate FFT Factors directly
        for (let k = 0; k < N / 2; k++) {
          const theta = -2 * Math.PI * k / N;
          const exp = { re: Math.cos(theta), im: Math.sin(theta) };
          const t = { re: exp.re * oddFFT[k].re - exp.im * oddFFT[k].im, im: exp.re * oddFFT[k].im + exp.im * oddFFT[k].re };
          output[k] = { re: evenFFT[k].re + t.re, im: evenFFT[k].im + t.im };
          output[k + N / 2] = { re: evenFFT[k].re - t.re, im: evenFFT[k].im - t.im };
        }
    }else{
        //Use FFT Factor Lookup
        for (let k = 0; k < N / 2; k++) {
          const exp = fftFactorLookup[N][k];
          const t = { re: exp.re * oddFFT[k].re - exp.im * oddFFT[k].im, im: exp.re * oddFFT[k].im + exp.im * oddFFT[k].re };
          output[k] = { re: evenFFT[k].re + t.re, im: evenFFT[k].im + t.im };
          output[k + N / 2] = { re: evenFFT[k].re - t.re, im: evenFFT[k].im - t.im };
        }
    }


    return output;
}
*/

async function prepare_and_fft(inputSignal, fftFactorLookup=null) {
    // Apply Hanning window to the input signal
    const windowedSignal = inputSignal;

    // Zero-padding to the next power of 2
    const FFT_SIZE = nextPowerOf2(windowedSignal.length);
    const paddedInput = new Array(FFT_SIZE).fill({ re: 0, im: 0 });
    windowedSignal.forEach((value, index) => (paddedInput[index] = { re: value, im: 0 }));

    // Perform FFT
    return await fftWithCache(paddedInput);
    //return await fftInPlace(paddedInput, fftFactorLookup);
    //return await fft(paddedInput, fftFactorLookup);
}

async function FFT(inputSignal, fftFactorLookup=null) {
    return await prepare_and_fft(inputSignal, fftFactorLookup);
}

// Function to compute FFT of a frame
async function computeFFT(frame,frameID,frames,fftFactorLookup=null) {
    // Perform FFT on the frame (you can use your FFT implementation here)
    // For simplicity, let's assume computeFFT returns the magnitude spectrum
    const startTime = performance.now();
    const spectrum = await FFT(frame, fftFactorLookup);
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;
    console.log(`FFT for Frame ${frameID}/${frames}: Elapsed time: ${elapsedTime} milliseconds`);
    return spectrum;
}

/******************** INVERSE *********************/



// Function to compute inverse FFT of a spectrum
async function computeInverseFFT(spectrum) {
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
    const timeDomainSignal = await IFFT(paddedSpectrum);
    return timeDomainSignal;
}

async function ifft(input) {
    const N = input.length;
    const pi = Math.PI;

    // Take the complex conjugate of the input spectrum
    const conjugateSpectrum = input.map(({ re, im }) => ({ re, im: -im }));

    // Apply FFT to the conjugate spectrum
    const fftResult = await fftWithCache(conjugateSpectrum);
    //const fftResult = await fftInPlace(conjugateSpectrum);
    //const fftResult = await fft(conjugateSpectrum);

    // Take the complex conjugate of the FFT result
    const ifftResult = fftResult.map(({ re, im }) => ({ re: re / N, im: -im / N }));

    return ifftResult;
}

async function IFFT(spectrum) {
    return (await ifft(spectrum)).map(({ re }) => re);
}

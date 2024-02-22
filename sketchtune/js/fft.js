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

/*
async function fftInPlaceReal(input, fftFactorLookup = null) {
    const N = input.length;
    const bits = Math.log2(N);

    if (N <= 1) {
        return input;
    }

    // Check if FFT factors for this size are cached
    let factors;
    if (!fftFactorLookup) {
        factors = computeFFTFactorsWithCache(N);
    } else {
        factors = fftFactorLookup[N];
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
        const halfLen = len / 2;
        for (let i = 0; i < N; i += len) {
            for (let k = 0; k < halfLen; k++) {
                const index = k + i;
                const evenIndex = index;
                const oddIndex = index + halfLen;

                const exp = factors[k];

                // Perform butterfly operations
                const tRe = exp.re * input[oddIndex];
                const tIm = exp.im * input[oddIndex];

                input[oddIndex] = input[evenIndex] - tRe;
                input[evenIndex] += tRe;

                // For odd indices, imaginary part is zero, so no need to update
                if (oddIndex < N) {
                    input[oddIndex] = input[evenIndex] - tIm;
                    input[evenIndex] += tIm;
                }
            }
        }
    }

    return input;
}*/






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
        return [{ real: input[0], imag: 0 }];
    }

    // Split the input into even and odd parts
    const even = [];
    const odd = [];
    for (let i = 0; i < N; i += 2) {
        even.push(input[i]);
        odd.push(input[i + 1] || 0); // Pad with zero if odd length
    }

    // Recursively calculate FFT for even and odd parts
    const evenFFT = fftReal(even);
    const oddFFT = fftReal(odd);

    // Combine the results of even and odd parts
    const result = [];
    for (let k = 0; k < N / 2; k++) {
        const angle = -2 * Math.PI * k / N;
        const oddPart = { real: oddFFT[k].real * Math.cos(angle), imag: oddFFT[k].real * Math.sin(angle) };
        const evenPart = { real: evenFFT[k].real, imag: evenFFT[k].imag };
        const twiddle = { real: Math.cos(angle), imag: Math.sin(angle) };
        result[k] = {
            real: evenFFT[k].real + oddPart.real,
            imag: evenFFT[k].imag + oddPart.imag
        };
        result[k + N / 2] = {
            real: evenPart.real - oddPart.real,
            imag: evenPart.imag - oddPart.imag
        };
        // Apply twiddle factor
        const temp = {
            real: result[k + N / 2].real * twiddle.real - result[k + N / 2].imag * twiddle.imag,
            imag: result[k + N / 2].real * twiddle.imag + result[k + N / 2].imag * twiddle.real
        };
        result[k + N / 2] = {
            real: temp.real,
            imag: temp.imag
        };
    }

    return result;
}












// Async function to perform FFT in-place
async function fftInPlace(input, fftFactorLookup = null) {
    const N = input.length;
    const bits = Math.log2(N);

    if (N <= 1) {
        return input;
    }

    // Check if FFT factors for this size are cached
    let factors;
    if (!fftFactorLookup) {
        factors = computeFFTFactorsWithCache(N);
    }else{
        factors = fftFactorLookup[N];
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

                const exp = factors[k];

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

async function prepare_and_fft(inputSignal, fftFactorLookup=null) {
    // Apply Hanning window to the input signal
    const windowedSignal = inputSignal;
    //const windowedSignal = applyHanningWindow(inputSignal); 

    // Zero-padding to the next power of 2
    const FFT_SIZE = nextPowerOf2(windowedSignal.length);
    const paddedInput = new Array(FFT_SIZE).fill({ re: 0, im: 0 });
    //const paddedInput = new Array(FFT_SIZE).fill(0);
    windowedSignal.forEach((value, index) => (paddedInput[index] = { re: value, im: 0 }));
    //windowedSignal.forEach((value, index) => (paddedInput[index] = value));

    // Perform FFT
    //var spectrumReal = await fftInPlaceReal(paddedInput, fftFactorLookup);
    // Map real-only spectrum to complex numbers
    //const spectrumComplex = spectrumReal.map(value => ({ re: value, im: 0 }));
    //return spectrumComplex;

    return await fftInPlace(paddedInput, fftFactorLookup);
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
    //console.log(`FFT for Frame ${frameID}/${frames}: Elapsed time: ${elapsedTime} milliseconds`);
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
    const fftResult = await fftInPlace(conjugateSpectrum);
    //const fftResult = await fft(conjugateSpectrum);

    // Take the complex conjugate of the FFT result
    const ifftResult = fftResult.map(({ re, im }) => ({ re: re / N, im: -im / N }));

    return ifftResult;
}

async function IFFT(spectrum) {
    return (await ifft(spectrum)).map(({ re }) => re);
}

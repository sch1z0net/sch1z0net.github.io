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

/*
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
}*/

/*
function fftRealInPlace(input) {
    const N = input.length;
    const bits = Math.log2(N);

    if (N !== nextPowerOf2(N)) {
        console.error("FFT FRAME must have power of 2");
        return;
    }

    // Perform bit reversal in place
    for (let i = 0; i < N; i++) {
        const reversedIndex = bitReverse(i, bits);
        if (reversedIndex > i) {
            // Swap elements if necessary
            const temp = input[i];
            input[i] = input[reversedIndex];
            input[reversedIndex] = temp;
        }
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
                const evenPart = input[evenIndex];
                const oddPart = {
                    re: input[oddIndex].re * factors[j].re - input[oddIndex].im * factors[j].im,
                    im: input[oddIndex].re * factors[j].im + input[oddIndex].im * factors[j].re
                };

                // Combine results of even and odd parts in place
                input[evenIndex] = {
                    re: evenPart.re + oddPart.re,
                    im: evenPart.im + oddPart.im
                };
                input[oddIndex] = {
                    re: evenPart.re - oddPart.re,
                    im: evenPart.im - oddPart.im
                };
            }
        }
    }

    return input;
}*/


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

    // Recursively calculate FFT in-place
    for (let size = 2; size <= N; size *= 2) {
        const halfSize = size / 2;
        // Precompute FFT factors
        const factors = computeFFTFactorsWithCache(size);
        for (let i = 0; i < N; i += size) {
            for (let j = 0; j < halfSize; j++) {
                const evenIndex = i + j;
                const oddIndex = i + j + halfSize;

                // Get real and imaginary parts of even and odd elements
                const evenRe = input[evenIndex];
                const oddRe = input[oddIndex];

                const twiddleRe = factors[j].re;
                const twiddleIm = factors[j].im;

                // Perform complex multiplication
                const oddIm = input[oddIndex + N / 2]; // Get imaginary part of odd element
                const twiddledOddRe = oddRe * twiddleRe - oddIm * twiddleIm;
                const twiddledOddIm = oddRe * twiddleIm + oddIm * twiddleRe;

                // Update even and odd elements with new values
                input[evenIndex] = evenRe + twiddledOddRe;
                input[oddIndex] = evenRe - twiddledOddRe;
                input[evenIndex + N / 2] = twiddledOddIm; // Update imaginary part of even element
                input[oddIndex + N / 2] = -twiddledOddIm; // Update imaginary part of odd element
            }
        }
    }

    // Return the output (in-place FFT result)
    return input;
}









/*
// Async function to perform FFT in-place
async function fftComplexInPlace(input, fftFactorLookup = null) {
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
       output[reversedIndex] = input[i];
    }

    if (N <= 1) {
        return input;
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
}*/


async function fftComplexInPlace(input, fftFactorLookup = null) {
    const N = input.length;
    const bits = Math.log2(N);

    if (N !== nextPowerOf2(N)) {
        console.error("FFT FRAME must have power of 2");
        return;
    }

    // Perform bit reversal
    const output = new Array(N);
    for (let i = 0; i < N; i++) {
       const reversedIndex = bitReverse(i, bits);
       output[reversedIndex] = input[i];
    }

    if (N <= 1) {
        return input;
    }

    // Recursively calculate FFT
    for (let size = 2; size <= N; size *= 2) {
        const halfSize = size / 2;
        for (let i = 0; i < N; i += size) {
            // Get FFT factors with caching
            const factors = computeFFTFactorsWithCache(size);
            for (let j = 0; j < halfSize; j++) {
                const evenIndex = i + j;
                const oddIndex = i + j + halfSize;
                const evenPartRe = output[evenIndex].re;
                const evenPartIm = output[evenIndex].im;
                const oddPartRe = output[oddIndex].re;
                const oddPartIm = output[oddIndex].im;

                const twiddleRe = factors[j].re;
                const twiddleIm = factors[j].im;

                // Multiply by twiddle factors
                const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
                const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

                // Combine results of even and odd parts in place
                output[evenIndex].re = evenPartRe + twiddledOddRe;
                output[evenIndex].im = evenPartIm + twiddledOddIm;
                output[oddIndex].re = evenPartRe - twiddledOddRe;
                output[oddIndex].im = evenPartIm - twiddledOddIm;
            }
        }
    }

    return output;
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
async function computeFFT(frame, frameID, frames, fftFactorLookup=null) {
    // Perform FFT on the frame (you can use your FFT implementation here)
    // For simplicity, let's assume computeFFT returns the magnitude spectrum
    const startTime = performance.now();
    const spectrum = await FFT(frame, fftFactorLookup);
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;
    console.log(`FFT for Frame ${frameID}/${frames}: Elapsed time: ${elapsedTime} milliseconds`);

    // Convert the Float32Array spectrum back to a complex array
    const complexSpectrum = [];
    for (let i = 0; i < spectrum.length; i += 2) {
        complexSpectrum.push({ re: spectrum[i], im: spectrum[i + 1] });
    }

    const endTime2 = performance.now();
    const elapsedTime2 = endTime2 - startTime;
    console.log(`FFT for Frame ${frameID}/${frames}: Elapsed time 2: ${elapsedTime2} milliseconds`);

    return complexSpectrum;
}


/******************** INVERSE *********************/
async function ifft(input) {
    const N = input.length;
    const pi = Math.PI;

    // Take the complex conjugate of the input spectrum
    const conjugateSpectrum = input.map(({ re, im }) => ({ re: re, im: -im }));

    // Apply FFT to the conjugate spectrum
    const fftResult = await fftComplexInPlace(conjugateSpectrum);
    //const fftResult = await fft(conjugateSpectrum);

    // Take the complex conjugate of the FFT result
    const ifftResult = fftResult.map(({ re, im }) => ({ re: re / N, im: -im / N }));

    return ifftResult;
}

async function IFFT(spectrum) {
    //return ifft(spectrum);
    return (await ifft(spectrum)).map(({ re }) => re);
}

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

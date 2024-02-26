function convertToComplex(inputSignal) {
    return inputSignal.map(value => ({ re: value, im: 0 }));
}

function nextPowerOf2(n) {
    return Math.pow(2, Math.ceil(Math.log2(n)));
}

function nextPowerOf4(n) {
    if (n <= 0) return 1; // Edge case: 0 or negative numbers
    let power = 1;
    while (power < n) {
        power *= 4;
    }
    return power;
}



// Function to apply synthesis window to a frame
function applySynthesisWindow(frame, synthesisWindow) {
    const weightedFrame = new Float32Array(frame.length);
    for (let i = 0; i < frame.length; i++) {
        weightedFrame[i] = frame[i] * synthesisWindow[i];
    }
    return weightedFrame;
}

// Function to normalize the output signal
function normalizeOutput(outputSignalChunk) {
    // Find the maximum absolute value in the output signal
    let maxAbsValue = 0;
    for (let i = 0; i < outputSignalChunk.length; i++) {
        const absValue = Math.abs(outputSignalChunk[i]);
        if (absValue > maxAbsValue) {
            maxAbsValue = absValue;
        }
    }

    // Normalize the output signal
    if (maxAbsValue > 0) {
        const scaleFactor = 1 / maxAbsValue;
        for (let i = 0; i < outputSignalChunk.length; i++) {
            outputSignalChunk[i] *= scaleFactor;
        }
    }
}

/******************** UTILS *********************/
function hanningWindow(windowSize) {
    const window = new Float32Array(windowSize);
    const alpha = 0.5;
    for (let i = 0; i < windowSize; i++) {
        window[i] = (1 - alpha) - (alpha * Math.cos(2 * Math.PI * i / (windowSize - 1)));
    }
    return window;
}

function hammingWindow(windowSize) {
    const window = new Float32Array(windowSize);
    const alpha = 0.54;
    const beta = 1 - alpha;
    for (let i = 0; i < windowSize; i++) {
        window[i] = alpha - (beta * Math.cos(2 * Math.PI * i / (windowSize - 1)));
    }
    return window;
}

function blackmanWindow(windowSize) {
    const window = new Float32Array(windowSize);
    const alpha = 0.42;
    const beta = 0.5;
    const gamma = 0.08;
    for (let i = 0; i < windowSize; i++) {
        window[i] = alpha - (beta * Math.cos(2 * Math.PI * i / (windowSize - 1))) + (gamma * Math.cos(4 * Math.PI * i / (windowSize - 1)));
    }
    return window;
}





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

/*
function precalculateFFTFactors(N) {
    const factors = [];
    for (let k = 0; k < N / 2; k++) {
        const theta = -2 * Math.PI * k / N;
        factors.push({ re: Math.cos(theta), im: Math.sin(theta) });
    }
    return factors;
}*/

/******************** FORWARD *********************/
// Cache object to store precalculated FFT factors
const fftFactorCacheRADIX2 = {};
const fftFactorCacheRADIX4 = {};

// Pre-calculate FFT factors for a given size and cache them for future use
function precalculateFFTFactorsRADIX2(maxSampleLength) {
    const maxN = nextPowerOf2(maxSampleLength);
    let len = 0; // Initialize len
    for (let N = 2; N <= maxN; N *= 2) {
        len += N; // Update len by adding N
    }
    const factors = new Array(len); // Preallocate memory for factors

    let pre = 0;
    for (let N = 2; N <= maxN; N *= 2) {
        for (let i = 0; i < N / 2; i++) {
            const angle1 = (2 * Math.PI * i) / N;
            factors[pre + i * 2] = Math.cos(angle1); // Cosine of angle1
            factors[pre + i * 2 + 1] = Math.sin(angle1); // Sine of angle1
        }
        pre += N;
    }

    return new Float32Array(factors);
}

// Compute FFT factors with caching (optimized for Radix-4 FFT)
function precalculateFFTFactorsRADIX4(maxSampleLength) {
    const maxN = nextPowerOf4(maxSampleLength);
    var len = 0;
    for (let N = 4; N <= maxN; N *= 4) {
       len += N;
    }
    const factors = new Array(len); // Preallocate memory for factors

   var pre = 0;
   for (let N = 4; N <= maxN; N *= 4) {
    for (let i = 0; i < N / 4; i++) {
        const angle1 = (2 * Math.PI * i) / N;
        const angle2 = (4 * Math.PI * i) / N;
        factors[pre + i * 4] = Math.cos(angle1); // Cosine of angle1
        factors[pre + i * 4 + 1] = Math.sin(angle1); // Sine of angle1
        factors[pre + i * 4 + 2] = Math.cos(angle2); // Cosine of angle2
        factors[pre + i * 4 + 3] = Math.sin(angle2); // Sine of angle2
    }
    pre += N;
   }

    return new Float32Array(factors);
}

// Function to compute FFT factors with caching
function computeFFTFactorsWithCache(N) {
    // Check if FFT factors for this size are already cached
    if (!fftFactorCacheRADIX2[N]) {
        // Calculate FFT factors and cache them
        fftFactorCacheRADIX2[N] = precalculateFFTFactorsRADIX2(N);
    }

    // Return the cached factors
    return fftFactorCacheRADIX2[N];
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


// Define a global map to store bit reversal indices
const bitReversalMap = new Map();

// Function to precompute and store bit reversal map for a given size N
function precomputeBitReversalMap(N) {
    const bits = Math.log2(N);
    const map = new Array(N);

    for (let i = 0; i < N; i++) {
        let reversedIndex = 0;
        for (let j = 0; j < bits; j++) {
            reversedIndex = (reversedIndex << 1) | ((i >> j) & 1);
        }
        map[i] = reversedIndex;
    }

    bitReversalMap.set(N, map);
}

precomputeBitReversalMap(16);

// Create the flattened lookup table for twiddle factors
const LOOKUP_RADIX4 = precalculateFFTFactorsRADIX4(16);
const LOOKUP_RADIX2 = precalculateFFTFactorsRADIX2(16);

function fftRealInPlaceRADIX2(inputOriginal) {
    const N = inputOriginal.length;
    const bits = Math.log2(N);

    if (N !== nextPowerOf2(N)) {
        console.error("FFT FRAME must have power of 2");
        return;
    }

    // Create a copy of the input array
    const input = inputOriginal.slice();

    //const startTime = performance.now();

    // Create a copy of the input array
    const out = new Float32Array(N);

    // Perform bit reversal
    const map = bitReversalMap.get(N);
    for (let i = 0; i < N; i++) {
        out[i] = input[map[i]];
    }

    // Convert the real-valued input to a complex-valued Float32Array
    const complexInput = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
        complexInput[i * 2] = out[i];
        complexInput[i * 2 + 1] = 0; // Imaginary part is set to 0
    }

    const factors = LOOKUP_RADIX2;

    /*
    for (let size = 2; size <= N; size *= 2) {
        const halfSize = size / 2;
        // Get FFT factors with caching
        const factors = computeFFTFactorsWithCache(size);
        for (let i = 0; i < N; i += size) {
            for (let j = 0; j < halfSize; j++) {
                factors[j]
                factors[j+1]
    */

    // Recursively calculate FFT
    // Perform Radix-2 FFT
    /*
    let pre = 0;
    for (let size = 2; size <= N; size <<= 1) {
        // Precompute FFT factors
        // const factors = computeFFTFactorsWithCache(size);
        const halfSize = size >> 1;
        const steps = N / size;
        for (let i = 0, j = 0, k = 0; k < halfSize*steps; k++, j = (j+1)%halfSize, i = Math.floor(k/halfSize)*size ) {

            // Use precalculated FFT factors directly
            const twiddleRe = factors[pre + (j << 1)];
            const twiddleIm = factors[pre + (j << 1) + 1];

            const evenIndex = i;
            const oddIndex = i + halfSize;

            // Get real and imaginary parts of even and odd elements
            const evenRe = complexInput[evenIndex << 1];
            const evenIm = complexInput[(evenIndex << 1) + 1];
            const oddRe = complexInput[oddIndex << 1];
            const oddIm = complexInput[(oddIndex << 1) + 1];

            // Perform complex multiplication
            const twiddledOddRe = oddRe * twiddleRe - oddIm * twiddleIm;
            const twiddledOddIm = oddRe * twiddleIm + oddIm * twiddleRe;

            // Update even and odd elements with new values
            complexInput[evenIndex << 1]     = evenRe + twiddledOddRe;
            complexInput[(evenIndex << 1) + 1] = evenIm + twiddledOddIm;
            complexInput[oddIndex << 1]      = evenRe - twiddledOddRe;
            complexInput[(oddIndex << 1) + 1]  = evenIm - twiddledOddIm;
        }
        pre += size;
    }*/

    let pre = 0;
    for (let size = 2; size <= N; size <<= 1) {
        // Define variables
        let i = 0; // Initialize i to 0
        let j = 0; // Initialize j to 0
        let k = 0; // Initialize k to 0

        const halfSize = size >> 1;
        const steps = N / size;
        console.log("------------------------ size", size)
        // Loop condition
        while (k < halfSize * steps) {
            // Use precalculated FFT factors directly
            const twiddleRe = factors[pre + (j << 1)];
            const twiddleIm = factors[pre + (j << 1) + 1];

            const evenIndex = i;
            const oddIndex = i + halfSize;

            console.log("evenIndex", evenIndex, "oddIndex", oddIndex, "TwiddleRE", pre + (j << 1), "TwiddleIM", pre + (j << 1) + 1);

            // Get real and imaginary parts of even and odd elements
            const evenRe = complexInput[evenIndex << 1];
            const evenIm = complexInput[(evenIndex << 1) + 1];
            const oddRe = complexInput[oddIndex << 1];
            const oddIm = complexInput[(oddIndex << 1) + 1];

            // Perform complex multiplication
            const twiddledOddRe = oddRe * twiddleRe - oddIm * twiddleIm;
            const twiddledOddIm = oddRe * twiddleIm + oddIm * twiddleRe;

            // Update even and odd elements with new values
            complexInput[evenIndex << 1] = evenRe + twiddledOddRe;
            complexInput[(evenIndex << 1) + 1] = evenIm + twiddledOddIm;
            complexInput[oddIndex << 1] = evenRe - twiddledOddRe;
            complexInput[(oddIndex << 1) + 1] = evenIm - twiddledOddIm;

            // Increment k and update i if k is a multiple of halfSize
            k++;
            j = (j + 1) % halfSize;
            if (k % halfSize === 0) {
                i += size;
                console.log("-------------------")
            }
        }
        pre += size;
    }


    // Return the output
    return complexInput;
}


/*
// Function to compute FFT factors with caching
function computeFFTFactorsWithCacheRADIX4(N) {
    // Check if FFT factors for this size are already cached
    if (!fftFactorCacheRADIX4[N]) {
        // Calculate FFT factors and cache them
        fftFactorCacheRADIX4[N] = precalculateFFTFactorsRADIX4(N);
    }

    // Return the cached factors
    return fftFactorCacheRADIX4[N];
}*/


function fftRealInPlaceRADIX4(input) {
    const N = input.length;

    if (N !== nextPowerOf4(N)) {
        console.error("FFT FRAME must have power of 4");
        return;
    }

    // Create a copy of the input array
    const out = new Float32Array(N);

    // Perform bit reversal
    const map = bitReversalMap.get(N);
    for (let i = 0; i < N; i++) {
        out[i] = input[map[i]];
    }

    const factors = LOOKUP_RADIX4;

    // Perform Radix-4 FFT
    for (let size = N; size >= 4; size >>= 2) { // Loop in decreasing order using bitshift
        const halfSize = size >> 1; // Using bitwise right shift for efficiency
        const quarterSize = size >> 2; // Using bitwise right shift for efficiency

        // Combine both loops into a single loop
        for (let i = 0, j = 0; i < N; i += size, j += quarterSize) {
            const evenIndex1 = i + j;
            const oddIndex1 = i + j + quarterSize;
            const evenIndex2 = i + j + halfSize;
            const oddIndex2 = i + j + halfSize + quarterSize;

            const evenRe1 = out[evenIndex1 << 1]; // Using bitwise left shift for efficiency
            const evenIm1 = out[(evenIndex1 << 1) + 1]; // Using bitwise left shift for efficiency
            const oddRe1 = out[oddIndex1 << 1]; // Using bitwise left shift for efficiency
            const oddIm1 = out[(oddIndex1 << 1) + 1]; // Using bitwise left shift for efficiency
            const evenRe2 = out[evenIndex2 << 1]; // Using bitwise left shift for efficiency
            const evenIm2 = out[(evenIndex2 << 1) + 1]; // Using bitwise left shift for efficiency
            const oddRe2 = out[oddIndex2 << 1]; // Using bitwise left shift for efficiency
            const oddIm2 = out[(oddIndex2 << 1) + 1]; // Using bitwise left shift for efficiency

            const twiddleRe1 = factors[j << 2]; // Using bitwise left shift for efficiency
            const twiddleIm1 = factors[(j << 2) + 1]; // Using bitwise left shift for efficiency
            const twiddleRe2 = factors[(j << 2) + 2]; // Using bitwise left shift for efficiency
            const twiddleIm2 = factors[(j << 2) + 3]; // Using bitwise left shift for efficiency

            const twiddledOddRe1 = oddRe1 * twiddleRe1 - oddIm1 * twiddleIm1;
            const twiddledOddIm1 = oddRe1 * twiddleIm1 + oddIm1 * twiddleRe1;
            const twiddledOddRe2 = oddRe2 * twiddleRe2 - oddIm2 * twiddleIm2;
            const twiddledOddIm2 = oddRe2 * twiddleIm2 + oddIm2 * twiddleRe2;

            out[evenIndex1 << 1]     = evenRe1 + twiddledOddRe1; // Using bitwise left shift for efficiency
            out[(evenIndex1 << 1) + 1] = evenIm1 + twiddledOddIm1; // Using bitwise left shift for efficiency
            out[oddIndex1 << 1]      = evenRe1 - twiddledOddRe1; // Using bitwise left shift for efficiency
            out[(oddIndex1 << 1) + 1]  = evenIm1 - twiddledOddIm1; // Using bitwise left shift for efficiency

            out[evenIndex2 << 1]     = evenRe2 + twiddledOddRe2; // Using bitwise left shift for efficiency
            out[(evenIndex2 << 1) + 1] = evenIm2 + twiddledOddIm2; // Using bitwise left shift for efficiency
            out[oddIndex2 << 1]      = evenRe2 - twiddledOddRe2; // Using bitwise left shift for efficiency
            out[(oddIndex2 << 1) + 1]  = evenIm2 - twiddledOddIm2; // Using bitwise left shift for efficiency
        }
    }

    return out;
}




/*
function fftRealInPlaceRADIX4(input) {
    const N = input.length;
    const bits = Math.log2(N);

    if (N !== nextPowerOf4(N)) {
        console.error("FFT FRAME must have power of 4");
        return;
    }

    // Create a copy of the input array
    //const out = input.slice();
    const out = new Float32Array(N);

    // Initial step (permute and transform)
    var width = 2;
    var size = N;
    var step = 1 << width;
    var len = (size / step) << 1;
    var inv = -1;


    const map = bitReversalMap.get(N);
    for (let i = 0; i < N; i++) {
        out[i] = input[map[i]];
    }

    const table = LOOKUP_RADIX4;

    for (step >>= 2; step >= 2; step >>= 2) {
        len = (size / step) << 1;
        var halfLen = len >>> 1;
        var quarterLen = halfLen >>> 1;
        var hquarterLen = quarterLen >>> 1;

        // Loop through offsets in the data
        for (var outOff = 0; outOff < size; outOff += len) {
        // Loop through offsets in the data
          for (var i = 0, k = 0; i <= hquarterLen; i += 2, k += step) {
            var A = outOff + i;
            var B = A + quarterLen;
            var C = B + quarterLen;
            var D = C + quarterLen;

            // Original values
            var Ar = out[A];
            var Ai = out[A + 1];
            var Br = out[B];
            var Bi = out[B + 1];
            var Cr = out[C];
            var Ci = out[C + 1];
            var Dr = out[D];
            var Di = out[D + 1];

            // Middle values
            var MAr = Ar;
            var MAi = Ai;

            var tableBr = table[k];
            var tableBi = inv * table[k + 1];
            var MBr = Br * tableBr - Bi * tableBi;
            var MBi = Br * tableBi + Bi * tableBr;

            var tableCr = table[2 * k];
            var tableCi = inv * table[2 * k + 1];
            var MCr = Cr * tableCr - Ci * tableCi;
            var MCi = Cr * tableCi + Ci * tableCr;

            var tableDr = table[3 * k];
            var tableDi = inv * table[3 * k + 1];
            var MDr = Dr * tableDr - Di * tableDi;
            var MDi = Dr * tableDi + Di * tableDr;

            // Pre-Final values
            var T0r = MAr + MCr;
            var T0i = MAi + MCi;
            var T1r = MAr - MCr;
            var T1i = MAi - MCi;
            var T2r = MBr + MDr;
            var T2i = MBi + MDi;
            var T3r = inv * (MBr - MDr);
            var T3i = inv * (MBi - MDi);

            // Final values
            var FAr = T0r + T2r;
            var FAi = T0i + T2i;

            var FBr = T1r + T3i;
            var FBi = T1i - T3r;

            out[A] = FAr;
            out[A + 1] = FAi;
            out[B] = FBr;
            out[B + 1] = FBi;

            // Output final middle point
            if (i === 0) {
              var FCr = T0r - T2r;
              var FCi = T0i - T2i;
              out[C] = FCr;
              out[C + 1] = FCi;
              continue;
            }

            // Do not overwrite ourselves
            if (i === hquarterLen)
              continue;

            // In the flipped case:
            // MAi = -MAi
            // MBr=-MBi, MBi=-MBr
            // MCr=-MCr
            // MDr=MDi, MDi=MDr
            var ST0r = T1r;
            var ST0i = -T1i;
            var ST1r = T0r;
            var ST1i = -T0i;
            var ST2r = -inv * T3i;
            var ST2i = -inv * T3r;
            var ST3r = -inv * T2i;
            var ST3i = -inv * T2r;

            var SFAr = ST0r + ST2r;
            var SFAi = ST0i + ST2i;

            var SFBr = ST1r + ST3i;
            var SFBi = ST1i - ST3r;

            var SA = outOff + quarterLen - i;
            var SB = outOff + halfLen - i;

            out[SA] = SFAr;
            out[SA + 1] = SFAi;
            out[SB] = SFBr;
            out[SB + 1] = SFBi;
          }
        }
    }

    return out;
}*/








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

function fftComplexInPlace(input, fftFactorLookup = null) {
    const N = input.length / 2;
    const bits = Math.log2(N);

    if (N !== nextPowerOf2(N)) {
        console.error("FFT FRAME must have power of 2");
        return;
    }

    // Perform bit reversal
    const output = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
        const reversedIndex = bitReverse(i, bits);
        output[reversedIndex * 2] = input[i * 2]; // Copy real part
        output[reversedIndex * 2 + 1] = input[i * 2 + 1]; // Copy imaginary part
    }

    if (N <= 1) {
        return output;
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
                const evenPartRe = output[evenIndex * 2];
                const evenPartIm = output[evenIndex * 2 + 1];
                const oddPartRe = output[oddIndex * 2];
                const oddPartIm = output[oddIndex * 2 + 1];

                const twiddleRe = factors[j * 2];
                const twiddleIm = factors[j * 2 + 1];

                // Multiply by twiddle factors
                const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
                const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

                // Combine results of even and odd parts in place
                output[evenIndex * 2] = evenPartRe + twiddledOddRe;
                output[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
                output[oddIndex * 2] = evenPartRe - twiddledOddRe;
                output[oddIndex * 2 + 1] = evenPartIm - twiddledOddIm;
            }
        }
    }

    return output;
}




function prepare_and_fft(inputSignal, fftFactorLookup=null) {
    // Apply Hanning window to the input signal (if needed)
    // const windowedSignal = applyHanningWindow(inputSignal); // Assuming the windowing function is already applied or not needed

    //const startTime = performance.now();
    // Zero-padding to the next power of 2
    const FFT_SIZE = nextPowerOf2(inputSignal.length);
    /*const endTime1 = performance.now();
    const elapsedTime1 = endTime1 - startTime;
    console.log(`FFT - FFTSIZE: Elapsed time: ${elapsedTime1} milliseconds`);*/

    const paddedInput = new Float32Array(FFT_SIZE).fill(0);
    inputSignal.forEach((value, index) => paddedInput[index] = value); // Store real part in even indices

    /*const endTime2 = performance.now();
    const elapsedTime2 = endTime2 - startTime;
    console.log(`FFT - PADDING: Elapsed time: ${elapsedTime2} milliseconds`);*/

    // Perform FFT
    return fftRealInPlaceRADIX2(paddedInput);
    //return fftRealInPlace(paddedInput);
}



function FFT(inputSignal, fftFactorLookup=null) {
    return prepare_and_fft(inputSignal, fftFactorLookup);
}

// Function to compute FFT of a frame
function computeFFT(frame, frameID, frames, fftFactorLookup=null) {
    // Perform FFT on the frame (you can use your FFT implementation here)
    // For simplicity, let's assume computeFFT returns the magnitude spectrum
    //const startTime = performance.now();
    const spectrum = FFT(frame, fftFactorLookup);
    //const endTime = performance.now();
    //const elapsedTime = endTime - startTime;
    //console.log(`FFT for Frame ${frameID}/${frames}: Elapsed time: ${elapsedTime} milliseconds`);

    // Convert the Float32Array spectrum back to a complex array
    const complexSpectrum = [];
    for (let i = 0; i < spectrum.length; i += 2) {
        complexSpectrum.push({ re: spectrum[i], im: spectrum[i + 1] });
        //if(Number.isNaN(spectrum[i])){ console.error("spectrum[",i,"] is NaN"); }
        //if(Number.isNaN(spectrum[i+1])){ console.error("spectrum[",i+1,"] is NaN"); }
    }

    //const endTime2 = performance.now();
    //const elapsedTime2 = endTime2 - startTime;
    //console.log(`FFT for Frame ${frameID}/${frames}: Elapsed time 2: ${elapsedTime2} milliseconds`);

    return complexSpectrum;
}

// Function to compute FFT of a frame
async function computeFFTasync(frame, frameID, frames, fftFactorLookup=null) {
    const spectrum = FFT(frame, fftFactorLookup);
    const complexSpectrum = [];
    for (let i = 0; i < spectrum.length; i += 2) {
        complexSpectrum.push({ re: spectrum[i], im: spectrum[i + 1] });
    }
    return complexSpectrum;
}



/******************** INVERSE *********************/
function ifft(input) {
    const N = input.length / 2; // Divide by 2 since input represents complex numbers
    const pi = Math.PI;

    // Take the complex conjugate of the input spectrum
    const conjugateSpectrum = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
        conjugateSpectrum[i * 2] = input[i * 2]; // Copy real part
        conjugateSpectrum[i * 2 + 1] = -input[i * 2 + 1]; // Negate imaginary part
    }

    // Apply FFT to the conjugate spectrum
    const fftResult = fftComplexInPlace(conjugateSpectrum);

    // Take the complex conjugate of the FFT result and scale by 1/N
    const ifftResult = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
        ifftResult[i * 2] = fftResult[i * 2] / N; // Scale real part
        ifftResult[i * 2 + 1] = -fftResult[i * 2 + 1] / N; // Scale and negate imaginary part
    }

    return ifftResult;
}

/*
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
}*/


function IFFT(spectrum) {
    return ifft(spectrum);
}



// Function to compute inverse FFT of a spectrum
async function computeInverseFFT(spectrum) {
    // Ensure the size of the spectrum array is a power of 2
    const paddedSize = nextPowerOf2(spectrum.length);

    // Pad both real and imaginary parts of the spectrum
    const paddedSpectrum = new Float32Array(paddedSize * 2).fill(0);
    for (let i = 0; i < spectrum.length; i++) {
        paddedSpectrum[i * 2] = spectrum[i].re; // Copy real part
        paddedSpectrum[i * 2 + 1] = spectrum[i].im; // Copy imaginary part
    }

    // Now you can pass paddedSpectrum to the IFFT function
    const timeDomainSignal = IFFT(paddedSpectrum);

    // Extract only the real parts of the time-domain signal
    const audioSignal = new Float32Array(timeDomainSignal.length / 2);
    for (let i = 0; i < audioSignal.length; i++) {
        audioSignal[i] = timeDomainSignal[i * 2];
    }

    return audioSignal;
}



// Function to compute inverse FFT of a spectrum
async function computeInverseFFTonHalf(halfSpectrum) {
    // Ensure the size of the spectrum array is a power of 2
    const paddedSize = nextPowerOf2(halfSpectrum.length * 2);

    const halfSize = paddedSize;
    const fullSize = halfSize * 2;

    // Create a full-sized spectrum array and fill it with the values from halfSpectrum
    const fullSpectrum = new Float32Array(fullSize).fill(0);

    // Copy DC component (index 0)
    fullSpectrum[0] = halfSpectrum[0].re; // Copy the real part
    fullSpectrum[1] = halfSpectrum[0].im; // Copy the imaginary part

    // Copy Nyquist frequency component (index paddedSize)
    fullSpectrum[halfSize    ] = 0; // Copy the real part
    fullSpectrum[halfSize + 1] = 0; // Invert the imaginary part

    // Apply symmetry to fill the rest of the spectrum
    for (let i = 1; i < halfSpectrum.length; i++) {
        fullSpectrum[i * 2] = halfSpectrum[i].re; // Copy the real part
        fullSpectrum[i * 2 + 1] = halfSpectrum[i].im; // Copy imaginary part

        // Fill the mirrored part of the spectrum
        fullSpectrum[fullSize - (i * 2)    ] = halfSpectrum[i].re; // Copy the real part
        fullSpectrum[fullSize - (i * 2) + 1] = -halfSpectrum[i].im; // Invert the imaginary part
    }

    // Perform the IFFT on the full spectrum
    const timeDomainSignal = IFFT(fullSpectrum);

    // Extract only the real parts of the time-domain signal
    const audioSignal = new Float32Array(timeDomainSignal.length / 2);
    for (let i = 0; i < audioSignal.length; i++) {
        audioSignal[i] = timeDomainSignal[i * 2];
    }

    return audioSignal;
}







/****** TESTING PERFORMANCE ******/

console.log(fftRealInPlaceRADIX2([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]));




// Define the FFT size
const fftSize = 16;
// Define the number of FFT operations to perform
const numOperations = 1; // You can adjust this number based on your requirements


// Generate test data as Float32Array
const generateTestData = (size) => {
    const testData = new Float32Array(size);
    for (let i = 0; i < size; i++) {
        // For demonstration purposes, generate random data between -1 and 1
        testData[i] = Math.random() * 2 - 1;
    }
    return testData;
};

const testData = generateTestData(fftSize);

// Perform FFT operations
const performFFTOperations = (type) => {
    //console.log("fftRealInPlaceRADIX4");
    //console.log("fftRealInPlaceRADIX2");
    // Perform FFT operations numOperations times
    if(type==0){
        for (let i = 0; i < numOperations; i++) {
            fftRealInPlaceRADIX2(testData);
        }
    }else{
        for (let i = 0; i < numOperations; i++) {
            fftRealInPlaceRADIX4(testData);
        }
    }

};

// Measure the time taken to perform FFT operations
const measureTime = (type) => {
    /*const startTimeA = performance.now(); // Start time
    for (let i = 0; i < numOperations; i++) {
        var copy = testData.slice();
    }
    const endTimeA = performance.now(); // End time
    const elapsedTimeA = endTimeA - startTimeA; // Elapsed time in milliseconds
    console.log("Slicing takes: ",elapsedTimeA,"ms");*/


    const startTime = performance.now(); // Start time
    performFFTOperations(type); // Perform FFT operations
    const endTime = performance.now(); // End time
    const elapsedTime = endTime - startTime; // Elapsed time in milliseconds

    // Calculate the number of FFT operations per second
    const operationsPerSecond = Math.floor(numOperations / (elapsedTime / 1000));

    console.log("Type",type,"Number of FFT operations per second:", operationsPerSecond);
};

//measureTime(0);
//measureTime(1);


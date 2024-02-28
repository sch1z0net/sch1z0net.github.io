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
// Pre-calculate FFT factors for a given size and cache them for future use
function precalculateFFTFactorsRADIX2flattened(maxSampleLength) {
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
        //if(maxN==64){ console.log("for N=",N,"LOOKUP goes from",pre,"to",pre+N-1); }
        pre += N;
        
        //N=2   - pre =  0: [ re, im ]
        //N=4   - pre =  2: [ re, im, re, im ]
        //N=8   - pre =  6: [ re, im, re, im, re, im, re, im ]  
        //N=16  - pre = 14: [ re, im, re, im, re, im, re, im, re, im, re, im, re, im, re, im ] 
        //....
    }

    return new Float32Array(factors);
}
/*
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

// Function to precompute and store bit reversal map for a given size N
//For 4:     0 2 1 3 
//For 8:     0 4 2 6 1 5 3 7 
//For 16:    0 8 4 12 2 10 6 14 1 9 5 13 3 11 7 15
function precomputeBitReversalMap(N) {
    const bits = Math.log2(N);
    const map = new Array(N);
    const bitReversalMap = new Map();

    for (let i = 0; i < N; i++) {
        let reversedIndex = 0;
        for (let j = 0; j < bits; j++) {
            reversedIndex = (reversedIndex << 1) | ((i >> j) & 1);
        }
        map[i] = reversedIndex;
    }
    
    bitReversalMap.set(N, map);
    return bitReversalMap;
}

// Define a global map to store bit reversal indices
let bitReversalMap4     = precomputeBitReversalMap(4);
let bitReversalMap8     = precomputeBitReversalMap(8);
let bitReversalMap16    = precomputeBitReversalMap(16);
let bitReversalMap32    = precomputeBitReversalMap(32);
let bitReversalMap64    = precomputeBitReversalMap(64);
let bitReversalMap128   = precomputeBitReversalMap(128);
let bitReversalMap256   = precomputeBitReversalMap(256);
let bitReversalMap512   = precomputeBitReversalMap(512);
let bitReversalMap1024  = precomputeBitReversalMap(1024);
let bitReversalMap2048  = precomputeBitReversalMap(2048);
let bitReversalMap4096  = precomputeBitReversalMap(4096);

// Create the flattened lookup table for twiddle factors
const LOOKUP_RADIX2_4    = precalculateFFTFactorsRADIX2flattened(4);
const LOOKUP_RADIX2_8    = precalculateFFTFactorsRADIX2flattened(8);
const LOOKUP_RADIX2_16   = precalculateFFTFactorsRADIX2flattened(16);
const LOOKUP_RADIX2_32   = precalculateFFTFactorsRADIX2flattened(32);
const LOOKUP_RADIX2_64   = precalculateFFTFactorsRADIX2flattened(64);
const LOOKUP_RADIX2_128  = precalculateFFTFactorsRADIX2flattened(128);
const LOOKUP_RADIX2_256  = precalculateFFTFactorsRADIX2flattened(256);
const LOOKUP_RADIX2_512  = precalculateFFTFactorsRADIX2flattened(512);
const LOOKUP_RADIX2_1024 = precalculateFFTFactorsRADIX2flattened(1024);
const LOOKUP_RADIX2_2048 = precalculateFFTFactorsRADIX2flattened(2048);
const LOOKUP_RADIX2_4096 = precalculateFFTFactorsRADIX2flattened(4096);

function fftRealInPlaceRADIX2(realInput) {
    const N = realInput.length;
    const bits = Math.log2(N);

    if (N !== nextPowerOf2(N)) {
        console.error("FFT FRAME must have power of 2");
        return;
    }

    // Create a copy of the input array
    const input = realInput.slice();

    //const startTime = performance.now();

    let factors, map;
    if(N == 4){    factors = LOOKUP_RADIX2_4;    map = bitReversalMap4.get(N);}
    if(N == 8){    factors = LOOKUP_RADIX2_8;    map = bitReversalMap8.get(N);}
    if(N == 16){   factors = LOOKUP_RADIX2_16;   map = bitReversalMap16.get(N);}
    if(N == 32){   factors = LOOKUP_RADIX2_32;   map = bitReversalMap32.get(N);}
    if(N == 64){   factors = LOOKUP_RADIX2_64;   map = bitReversalMap64.get(N);}
    if(N == 128){  factors = LOOKUP_RADIX2_128;  map = bitReversalMap128.get(N);}
    if(N == 256){  factors = LOOKUP_RADIX2_256;  map = bitReversalMap256.get(N);}
    if(N == 512){  factors = LOOKUP_RADIX2_512;  map = bitReversalMap512.get(N);}
    if(N == 1024){ factors = LOOKUP_RADIX2_1024; map = bitReversalMap1024.get(N);}
    if(N == 2048){ factors = LOOKUP_RADIX2_2048; map = bitReversalMap2048.get(N);}

    // Create a copy of the input array
    const out = new Float32Array(N);

    // Perform bit reversal
    for (let i = 0; i < N; i++) {
        out[i] = input[map[i]];
    }

    // Convert the real-valued input to a complex-valued Float32Array
    const complexInput = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
        complexInput[i * 2] = out[i];
        complexInput[i * 2 + 1] = 0; // Imaginary part is set to 0
    }

    let pre = 0;
    let inv = 1;
    for (let size = 2; size <= N; size <<= 1) {
        // Define variables
        let i = 0; // Initialize i to 0
        let j = 0; // Initialize j to 0

        if(size == N){ inv = -inv; }

        const halfSize = size >> 1;
        //console.log("------------------------ size",size)
        // Loop condition
        while (i < N) {
            // Use precalculated FFT factors directly
            /*const tIdxRe = pre + (j % halfSize) * 2;
            const tIdxIm = pre + (j % halfSize) * 2 + 1;
            const twiddleRe = factors[tIdxRe];
            const twiddleIm = factors[tIdxIm];*/

            const tIdxRe = (j % halfSize) * 2; 
            const tIdxIm = (j % halfSize) * 2 + 1;
            const tRe  = Math.cos((2 * Math.PI * tIdxRe) / size);  // Calculate Directly
            const tIm  = Math.sin((2 * Math.PI * tIdxIm) / size);  // Calculate Directly

            const evenIndex = i + j;
            const oddIndex = i + j + halfSize;

            //console.log(evenIndex,oddIndex,"-",tIdxRe,tIdxIm);
            //console.log(evenIndex,oddIndex);

            // Get real and imaginary parts of even and odd elements
            const evenRe = complexInput[evenIndex << 1];
            const evenIm = complexInput[(evenIndex << 1) + 1];
            const oddRe = complexInput[oddIndex << 1];
            const oddIm = complexInput[(oddIndex << 1) + 1];
            
            // Perform complex multiplication
            const twiddledOddRe = oddRe * tRe - oddIm * tIm;
            const twiddledOddIm = oddRe * tIm + oddIm * tRe;
            
            // Update even and odd elements with new values
            complexInput[evenIndex << 1]       =  evenRe + twiddledOddRe;
            complexInput[(evenIndex << 1) + 1] = (evenIm + twiddledOddIm) * inv;
            complexInput[oddIndex << 1]        =  evenRe - twiddledOddRe;
            complexInput[(oddIndex << 1) + 1]  = (evenIm - twiddledOddIm) * inv;

            j++;
            if(j % halfSize === 0){
                i += size; 
                j = 0;
            }
        }
        pre += size;
    }

    // Return the output
    return complexInput;
}

/**********************************************************************************************/
/**********************************************************************************************/
/**********************************************************************************************/
/**********************************************************************************************/
/*******************************  RADIX 2/4 IMPLEMENTATIONS ***********************************/
/**********************************************************************************************/
/**********************************************************************************************/
/**********************************************************************************************/
/**********************************************************************************************/


function fftComplexInPlace_radix2(out) {
    const N = out.length / 2;
    const bits = Math.log2(N);

    let factors;
    if(N == 4){    factors = LOOKUP_RADIX2_4;    }
    if(N == 8){    factors = LOOKUP_RADIX2_8;    }
    if(N == 16){   factors = LOOKUP_RADIX2_16;   }
    if(N == 32){   factors = LOOKUP_RADIX2_32;   }
    if(N == 64){   factors = LOOKUP_RADIX2_64;   }
    if(N == 128){  factors = LOOKUP_RADIX2_128;  }
    if(N == 256){  factors = LOOKUP_RADIX2_256;  }
    if(N == 512){  factors = LOOKUP_RADIX2_512;  }
    if(N == 1024){ factors = LOOKUP_RADIX2_1024; }
    if(N == 2048){ factors = LOOKUP_RADIX2_2048; }
    if(N == 4096){ factors = LOOKUP_RADIX2_4096; }


    let pre  = 0;    //offset for indexing Factor Lookup 
    let pwr  = 0;    //power 
    let mpwr = bits; //max power
    let N_half    = N >> 1;
    let N_quarter = N >> 2;
    let c = N_half;  // circled index start

    for (let size = 2; size <= N; size <<= 1) {
        pwr++;
        // Define variables
        let i = 0;    // ev index, increases with every line step
        let l = 0;    // line step made
        let b = size; // block size
        let bs = 0;   // block steps made
        let ni = 0;   // number of indices handled 

        const h = size >> 1;
        const q = size >> 2;
      
        if( size == N ){ c = N_quarter; }; 

        while (ni < N) {                                                                      
            const eInd1 = i;        const oInd1 = i + h;                         
            const eInd2 = i + c;    const oInd2 = i + h + c;              

            // (1) Use precalculated FFT factors directly                                               
            const j1 = (l)%h;
            // (1) TwiddleFactors
            const tRe1 = factors[pre + 2*j1 + 0];  // LOOKUP
            const tIm1 = factors[pre + 2*j1 + 1];  // LOOKUP
            // (1) Get real and imaginary parts of elements
            const eRe1  = out[(eInd1 << 1)    ];
            const eIm1  = out[(eInd1 << 1) + 1];
            const oRe1  = out[(oInd1 << 1)    ];
            const oIm1  = out[(oInd1 << 1) + 1];
            // (1) Perform complex multiplications
            const t_oRe1 = oRe1 * tRe1 - oIm1 * tIm1;
            const t_oIm1 = oRe1 * tIm1 + oIm1 * tRe1;
            // (1) Update elements with new values
            out[(eInd1 << 1)    ] =  (eRe1 + t_oRe1);
            out[(eInd1 << 1) + 1] =  (eIm1 + t_oIm1);
            out[(oInd1 << 1)    ] =  (eRe1 - t_oRe1);
            out[(oInd1 << 1) + 1] =  (eIm1 - t_oIm1);
            
            i++; l++; ni+=2;
            // line reaches block-end
            if (l % h === 0) { bs++; i=bs*b; }
        }
        pre += size;
    }

    return out;
}









function index_lookup(N){
    const bits = Math.log2(N);

    let lookup = new Uint16Array(bits*12*N/2);

    let idx = 0;

    let pre  = 0;    //offset for indexing Factor Lookup  
    let pwr  = 0;    //power 
    let mpwr = bits; //max power
    let N_half    = N >> 1;
    let N_quarter = N >> 2;
    let c = N_half;  // circled index start

    for (let size = 2; size <= N; size <<= 1) {
        pwr++;
        // Define variables
        let i = 0;    // ev index, increases with every line step
        let l = 0;    // line step made
        let b = size; // block size
        let bs = 0;   // block steps made
        let ni = 0;   // number of indices handled 

        const h = size >> 1;
        const q = size >> 2;
      
        if( size == N ){ c = N_quarter; }; 

        let br = (size==N) ? h/2 : 0;

        const isNotPowerOf4 = (size & (size - 1)) !== 0 || size === 0 || (size & 0xAAAAAAAA) !== 0;
        // runs N/2 times for PowerOf2
        // runs N/4 times for PowerOf4
        while (ni < N) {         
            const eInd1 = i;        const oInd1 = i + h;                         
            const eInd2 = i + c;    const oInd2 = i + h + c;              

            const j1 = (l)%h;
            const tRe1 = pre + 2*j1 + 0;  // LOOKUP
            const tIm1 = pre + 2*j1 + 1;  // LOOKUP

            const eRe1Indx = (eInd1 << 1);
            const eIm1Indx = (eInd1 << 1) + 1;
            const oRe1Indx = (oInd1 << 1);
            const oIm1Indx = (oInd1 << 1) + 1;

            lookup[idx++] = tRe1;
            lookup[idx++] = tIm1;
            lookup[idx++] = eRe1Indx;
            lookup[idx++] = eIm1Indx;
            lookup[idx++] = oRe1Indx;
            lookup[idx++] = oIm1Indx;

            // Not Power of 4?
            if( isNotPowerOf4 ){ 
                i++; l++; ni+=2;
                // line reaches block-end
                if (l % h === 0) { bs++; i=bs*b; }
                continue; 
            }

            const j2 = j1 + br;
            const tRe2 = pre + 2*j2 + 0;  // LOOKUP
            const tIm2 = pre + 2*j2 + 1;  // LOOKUP

            const eRe2Indx = (eInd2 << 1);
            const eIm2Indx = (eInd2 << 1) + 1;
            const oRe2Indx = (oInd2 << 1);
            const oIm2Indx = (oInd2 << 1) + 1;

            lookup[idx++] = tRe2;
            lookup[idx++] = tIm2;
            lookup[idx++] = eRe2Indx;
            lookup[idx++] = eIm2Indx;
            lookup[idx++] = oRe2Indx;
            lookup[idx++] = oIm2Indx;
            
            i++; l++; ni+=4;
            // line reaches block-end
            if (l % h === 0) { bs++; i=bs*b; }

        }
        pre += size;
    }

    return lookup;
}

let INDEX_LOOKUP_4    = index_lookup(4);
let INDEX_LOOKUP_8    = index_lookup(8);
let INDEX_LOOKUP_16   = index_lookup(16);
let INDEX_LOOKUP_32   = index_lookup(32);
let INDEX_LOOKUP_64   = index_lookup(64);
let INDEX_LOOKUP_128  = index_lookup(128);
let INDEX_LOOKUP_256  = index_lookup(256);
let INDEX_LOOKUP_512  = index_lookup(512);
let INDEX_LOOKUP_1024 = index_lookup(1024);
let INDEX_LOOKUP_2048 = index_lookup(2048);
let INDEX_LOOKUP_4096 = index_lookup(4096);

let factors = LOOKUP_RADIX2_1024;
let idx_LKUP = INDEX_LOOKUP_1024;
let len = idx_LKUP.length;

function fftComplexInPlace_seq(out) {
    const N = out.length/2;

    let factors;
    if(N ==    4){ factors = LOOKUP_RADIX2_4;    }
    if(N ==    8){ factors = LOOKUP_RADIX2_8;    }
    if(N ==   16){ factors = LOOKUP_RADIX2_16;   }
    if(N ==   32){ factors = LOOKUP_RADIX2_32;   }
    if(N ==   64){ factors = LOOKUP_RADIX2_64;   }
    if(N ==  128){ factors = LOOKUP_RADIX2_128;  }
    if(N ==  256){ factors = LOOKUP_RADIX2_256;  }
    if(N ==  512){ factors = LOOKUP_RADIX2_512;  }
    if(N == 1024){ factors = LOOKUP_RADIX2_1024; }
    if(N == 2048){ factors = LOOKUP_RADIX2_2048; }
    if(N == 4096){ factors = LOOKUP_RADIX2_4096; }

    let idx_LKUP; 
    if(N ==   4){ idx_LKUP = INDEX_LOOKUP_4;    }
    if(N ==   8){ idx_LKUP = INDEX_LOOKUP_8;    }
    if(N ==  16){ idx_LKUP = INDEX_LOOKUP_16;   }
    if(N ==  32){ idx_LKUP = INDEX_LOOKUP_32;   }
    if(N ==  64){ idx_LKUP = INDEX_LOOKUP_64;   }
    if(N == 128){ idx_LKUP = INDEX_LOOKUP_128;  }
    if(N == 256){ idx_LKUP = INDEX_LOOKUP_256;  }
    if(N == 512){ idx_LKUP = INDEX_LOOKUP_512;  }
    if(N ==1024){ idx_LKUP = INDEX_LOOKUP_1024; }
    if(N ==2048){ idx_LKUP = INDEX_LOOKUP_2048; }  
    if(N ==4096){ idx_LKUP = INDEX_LOOKUP_4096; } 


    let i = 0;
    while(i < len){
        // TwiddleFactors
        const tRe = factors[idx_LKUP[i++]];
        const tIm = factors[idx_LKUP[i++]];
        // Get real and imaginary parts of elements
        const eReI = idx_LKUP[i++];
        const eImI = idx_LKUP[i++];
        const oReI = idx_LKUP[i++];
        const oImI = idx_LKUP[i++];
        const eRe  = out[eReI];
        const eIm  = out[eImI];
        const oRe  = out[oReI];
        const oIm  = out[oImI];
        // Perform complex multiplications
        const t_oRe = oRe * tRe - oIm * tIm;
        const t_oIm = oRe * tIm + oIm * tRe;
        // Update elements with new values
        out[eReI]  = (eRe + t_oRe);
        out[eImI]  = (eIm + t_oIm);
        out[oReI]  = (eRe - t_oRe);
        out[oImI]  = (eIm - t_oIm);
    }

    return out;
}


function fftComplexInPlace_tidy(out) {
    const N = out.length / 2;
    const bits = Math.log2(N);

    let factors;
    if(N == 4){    factors = LOOKUP_RADIX2_4;    }
    if(N == 8){    factors = LOOKUP_RADIX2_8;    }
    if(N == 16){   factors = LOOKUP_RADIX2_16;   }
    if(N == 32){   factors = LOOKUP_RADIX2_32;   }
    if(N == 64){   factors = LOOKUP_RADIX2_64;   }
    if(N == 128){  factors = LOOKUP_RADIX2_128;  }
    if(N == 256){  factors = LOOKUP_RADIX2_256;  }
    if(N == 512){  factors = LOOKUP_RADIX2_512;  }
    if(N == 1024){ factors = LOOKUP_RADIX2_1024; }
    if(N == 2048){ factors = LOOKUP_RADIX2_2048; }
    if(N == 4096){ factors = LOOKUP_RADIX2_4096; }


    let pre  = 0;    //offset for indexing Factor Lookup 
    let pwr  = 0;    //power 
    let mpwr = bits; //max power
    //for (let size = 4; size <= N; size <<= 2) {
    //let js = new Array(N/2);
    for (let size = 2; size <= N; size <<= 1) {
        //console.log("-size "+size+"-------------------------------------------------------------------------------------------------");
        pwr++;
        // Define variables
        let i = 0;    // ev index, increases with every line step
        let l = 0;    // line step made
        let b = size; // block size
        let bs = 0;   // block steps made
        let ni = 0;   // number of indices handled 

        const h = size >> 1;
        const q = size >> 2;
      
        let c = (2-((N/b) & 1)) * N >> 2;  // circled index start
        let br = (size==N) ? h/2 : 0;

        //  For N = 2, the indices must look like this after each iteration
        //  
        //  power = 1       
        //  size = 2 
        //  half = 1     
        //  ev  odd      
        // _0     1     



        //  For N = 4, the indices must look like this after each iteration
        //  
        //  power = 1          power = 2      
        //  size = 2           size = 4  
        //  half = 1           half = 2  
        //  ev  odd            ev odd     
        // _0     1            0    2     
        // (2)    3           _(1)  3     
        //    
        // _block = 2         _block = 4    
        // max_bn =4/2        max_bn =4/4   



        //  For N = 16, the indices must look like this after each iteration
        //  
        //  power = 1          power = 2          power = 3           power = 4
        //  size = 2           size = 4           size = 8            size = 16
        //  half = 1           half = 2           half = 4            half =  8
        //  ev  j odd          ev  j odd       _  ev  j odd           ev  j odd 
        // _0   0   1          0   0   2      |   0   0   4            0  0   8  
        //  2   0   3         _1   1   3      |h  1   1   5            1  1   9  
        //  4   0   5          4   0   6      |   2   2   6            2  2  10  
        //  6   0   7          5   1   7      |_ _3   3   7            3  3  11  
        // (8)  0   9         (8)  0  10         (8)  0  12           (4) 4  12   <---- circled index start = 4
        // 10   0  11          9   1  11          9   1  13            5  5  13  
        // 12   0  13         12   0  14         10   2  14            6  6  14  
        // 14   0  15         13   1  15         11   3  15           _7  7  15  
        //  
        // ratio = 4          ratio = 2           ratio = 1          ratio = 1/2       (N/b) -> 1  2  4 ..... 8
        // _block = 2         _block = 4          _block = 8         _block = 16       1 is a special case, map it to 1/2 and the rest to 1
        // max_bn =16/2       max_bn =16/4        max_bn = 16/2      max_bn = 16/4     therefor: c = (N/2) * (2-((N/b) & 1))/2  
        //              


        const isNotPowerOf4 = (size & (size - 1)) !== 0 || size === 0 || (size & 0xAAAAAAAA) !== 0;
        // runs N/2 times for PowerOf2
        // runs N/4 times for PowerOf4
        while (ni < N) {                                                                      
            const eInd1 = i;        const oInd1 = i + h;                         
            const eInd2 = i + c;    const oInd2 = i + h + c;              


            // (1) Use precalculated FFT factors directly                                               
            //const tIdxRe1 = pre + (2*l + 0)%b;  const tIdxIm1 = pre + (2*l + 1)%b; 
            const j1 = (l)%h;
            //js[l] = j1;
            // (1) TwiddleFactors
            //const tRe1 = Math.cos((2 * Math.PI * j1) / size);  // Calculate Directly
            //const tIm1 = Math.sin((2 * Math.PI * j1) / size);  // Calculate Directly
            const tRe1 = factors[pre + 2*j1 + 0];  // LOOKUP
            const tIm1 = factors[pre + 2*j1 + 1];  // LOOKUP
            //j--------------------  0           1           2           3           4           5           6           7
            //size=2   - pre = +0: [ re00, im01 ]
            //size=4   - pre = +2: [ re02, im03, re04, im05 ]
            //size=8   - pre = +6: [ re06, im07, re08, im09, re10, im11, re12, im13 ]  
            //size=16  - pre =+14: [ re14, im15, re16, im17, re18, im19, re20, im21, re22, im23, re24, im25, re26, im27, re28, im29 ] 
            //....

            // (1) Get real and imaginary parts of elements
            const eRe1  = out[(eInd1 << 1)    ];
            const eIm1  = out[(eInd1 << 1) + 1];
            const oRe1  = out[(oInd1 << 1)    ];
            const oIm1  = out[(oInd1 << 1) + 1];
            // (1) Perform complex multiplications
            const t_oRe1 = oRe1 * tRe1 - oIm1 * tIm1;
            const t_oIm1 = oRe1 * tIm1 + oIm1 * tRe1;
            // (1) Update elements with new values
            out[(eInd1 << 1)    ] =  (eRe1 + t_oRe1);
            out[(eInd1 << 1) + 1] =  (eIm1 + t_oIm1);
            out[(oInd1 << 1)    ] =  (eRe1 - t_oRe1);
            out[(oInd1 << 1) + 1] =  (eIm1 - t_oIm1);
            
            //console.log("**** EV.RE",eInd1,(eRe1 + t_oRe1).toFixed(2),"<- EV.RE",eInd1,"+ (OD.RE",oInd1,"* TW.RE",j1,"- OD.IM",oInd1,"* TW.IM",j1,")","|||||||","EV.IM",eInd1,(eIm1 + t_oIm1).toFixed(2),"<- EV.IM",eInd1,"+ (OD.RE",oInd1,"* TW.IM",j1,"+ OD.IM",oInd1,"* TW.RE",j1,")");
            //console.log("**** OD.RE",oInd1,(eRe1 - t_oRe1).toFixed(2),"<- EV.RE",eInd1,"- (OD.RE",oInd1,"* TW.RE",j1,"- OD.IM",oInd1,"* TW.IM",j1,")","|||||||","OD.IM",oInd1,(eIm1 - t_oIm1).toFixed(2),"<- EV.IM",eInd1,"- (OD.RE",oInd1,"* TW.IM",j1,"+ OD.IM",oInd1,"* TW.RE",j1,")");

            // Not Power of 4?
            if( isNotPowerOf4 ){ 
                //console.log(eInd1,oInd1,"-",tIdxRe1,tIdxIm1);
                //console.log(eInd1,oInd1,"-",j1);
                i++; l++; ni+=2;
                // line reaches block-end
                if (l % h === 0) { bs++; i=bs*b; }
                continue; 
            }
            
            // (2) Use precalculated FFT factors directly  
            if( N == 4 ){ l = 1; } // Correction for a special case
            //const tIdxRe2 = pre + (2*l + N/2 + 0)%b;  const tIdxIm2 = pre + (2*l + N/2 + 1)%b;
            const j2 = j1 + br;
            //js[l+N/4] = j2;
            // (1) TwiddleFactors
            //const tRe2 = Math.cos((2 * Math.PI * j2) / size);  // Calculate Directly
            //const tIm2 = Math.sin((2 * Math.PI * j2) / size);  // Calculate Directly
            const tRe2 = factors[pre + 2*j2 + 0];  // LOOKUP
            const tIm2 = factors[pre + 2*j2 + 1];  // LOOKUP

            // (2) Get real and imaginary parts of elements
            const eRe2  = out[(eInd2 << 1)    ];
            const eIm2  = out[(eInd2 << 1) + 1];
            const oRe2  = out[(oInd2 << 1)    ];
            const oIm2  = out[(oInd2 << 1) + 1];
            // (2) Perform complex multiplications
            const t_oRe2 = oRe2 * tRe2 - oIm2 * tIm2;
            const t_oIm2 = oRe2 * tIm2 + oIm2 * tRe2;
            // (2) Update elements with new values
            out[(eInd2 << 1)    ] =  (eRe2 + t_oRe2);
            out[(eInd2 << 1) + 1] =  (eIm2 + t_oIm2);
            out[(oInd2 << 1)    ] =  (eRe2 - t_oRe2);
            out[(oInd2 << 1) + 1] =  (eIm2 - t_oIm2);

            //console.log(eInd1,oInd1,"-",tIdxRe1,tIdxIm1,"|||",eInd2,oInd2,"-",tIdxRe2,tIdxIm2);
            //console.log(eInd1,oInd1,"-",j1,"|||",eInd2,oInd2,"-",j2);

            //console.log("**** EV.RE",eInd2,(eRe2 + t_oRe2).toFixed(2),"<- EV.RE",eInd2,"+ (OD.RE",oInd2,"* TW.RE",j2,"- OD.IM",oInd2,"* TW.IM",j2,")","|||||||","EV.IM",eInd2,(eIm2 + t_oIm2).toFixed(2),"<- EV.IM",eInd2,"+ (OD.RE",oInd2,"* TW.IM",j2,"+ OD.IM",oInd2,"* TW.RE",j2,")");
            //console.log("**** OD.RE",oInd2,(eRe2 - t_oRe2).toFixed(2),"<- EV.RE",eInd2,"- (OD.RE",oInd2,"* TW.RE",j2,"- OD.IM",oInd2,"* TW.IM",j2,")","|||||||","OD.IM",oInd2,(eIm2 - t_oIm2).toFixed(2),"<- EV.IM",eInd2,"- (OD.RE",oInd2,"* TW.IM",j2,"+ OD.IM",oInd2,"* TW.RE",j2,")");

            i++; l++; ni+=4;
            // line reaches block-end
            if (l % h === 0) { bs++; i=bs*b; }
        }
        pre += size;
        //console.log("size:"+size, out);
        //console.log("size:"+size, js);
        //js = new Array(N/2);
    }

    return out;
}



/******************** WRAPPER *******************************************************/

function fftRealInPlaceRADIX4(realInput) {
    const N = realInput.length;
    const bits = Math.log2(N);
    
    if (N !== nextPowerOf2(N)) {
        console.error("FFT FRAME must have power of 2");
        return;
    }
    
    // Create a copy of the input array
    const input = realInput.slice();
    
    let map;
    if(N == 4){    map = bitReversalMap4.get(N);}
    if(N == 8){    map = bitReversalMap8.get(N);}
    if(N == 16){   map = bitReversalMap16.get(N);}
    if(N == 32){   map = bitReversalMap32.get(N);}
    if(N == 64){   map = bitReversalMap64.get(N);}
    if(N == 128){  map = bitReversalMap128.get(N);}
    if(N == 256){  map = bitReversalMap256.get(N);}
    if(N == 512){  map = bitReversalMap512.get(N);}
    if(N == 1024){ map = bitReversalMap1024.get(N);}
    if(N == 2048){ map = bitReversalMap2048.get(N);}
    if(N == 4096){ map = bitReversalMap4096.get(N);}
    

    // Perform bit reversal
    const inputBR = new Float32Array(N);
    for (let i = 0; i < N; i++) {
        inputBR[i] = input[map[i]];
    }

    // Convert the real-valued input to a complex-valued Float32Array
    const complexOut = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
        complexOut[i * 2] = inputBR[i];
        complexOut[i * 2 + 1] = 0; // Imaginary part is set to 0
    }

    return fftComplexInPlace_radix2(complexOut);
    //return fftComplexInPlace_tidy(complexOut);
    //return fftComplexInPlace(complexOut);
}


function fftComplexInPlaceRADIX4(complexInput) {
    const N = complexInput.length / 2;
    const bits = Math.log2(N);

    if (N !== nextPowerOf2(N)) {
        console.error("FFT FRAME must have power of 2");
        return;
    }

    // Create a copy of the input array
    const input = complexInput.slice();

    let map;
    if(N == 4){    map = bitReversalMap4.get(N);}
    if(N == 8){    map = bitReversalMap8.get(N);}
    if(N == 16){   map = bitReversalMap16.get(N);}
    if(N == 32){   map = bitReversalMap32.get(N);}
    if(N == 64){   map = bitReversalMap64.get(N);}
    if(N == 128){  map = bitReversalMap128.get(N);}
    if(N == 256){  map = bitReversalMap256.get(N);}
    if(N == 512){  map = bitReversalMap512.get(N);}
    if(N == 1024){ map = bitReversalMap1024.get(N);}
    if(N == 2048){ map = bitReversalMap2048.get(N);}
    if(N == 4096){ map = bitReversalMap4096.get(N);}

    // Perform bit reversal
    const out = new Float32Array(N*2);
    for (let i = 0; i < N; i++) {
        out[i*2  ] = input[map[i]*2  ];
        out[i*2+1] = input[map[i]*2+1];
    }

    return fftComplexInPlace(out);
}











/**********************************************************************************************/
/**********************************************************************************************/
/***************************** OLD IMPLEMENTATION FOR REF *************************************/
/**********************************************************************************************/


// Bit reversal function
function bitReverse(num, bits) {
    let reversed = 0;
    for (let i = 0; i < bits; i++) {
        reversed = (reversed << 1) | (num & 1);
        num >>= 1;
    }
    return reversed;
}

// Cache object to store precalculated FFT factors
const fftFactorCacheRADIX2 = {};
const fftFactorCacheRADIX4 = {};

// Pre-calculate FFT factors for a given size and cache them for future use
function precalculateFFTFactorsRADIX2(N) {
    const factors = new Array(N); // Preallocate memory for factors

    for (let i = 0; i < N / 2; i++) {
        const angle1 = (2 * Math.PI * i) / N;
        factors[i * 2] = Math.cos(angle1); // Cosine of angle1
        factors[i * 2 + 1] = Math.sin(angle1); // Sine of angle1
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

function fftComplexInPlace_ref(complexInput, fftFactorLookup = null) {
    const N = complexInput.length / 2;
    const bits = Math.floor(Math.log2(N));

    if (N !== nextPowerOf2(N)) {
        console.error("FFT FRAME must have power of 2");
        return;
    }

    // Perform bit reversal
    const out = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
        const reversedIndex = bitReverse(i, bits);
        out[reversedIndex * 2    ] = complexInput[i * 2    ]; // Copy real part
        out[reversedIndex * 2 + 1] = complexInput[i * 2 + 1]; // Copy imaginary part
    }

    if (N <= 1) {
        return output;
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
                const evenPartRe = out[evenIndex * 2    ];
                const evenPartIm = out[evenIndex * 2 + 1];
                const oddPartRe  = out[oddIndex  * 2    ];
                const oddPartIm  = out[oddIndex  * 2 + 1];

                //const twiddleRe = Math.cos((2 * Math.PI * j) / size);
                //const twiddleIm = Math.sin((2 * Math.PI * j) / size);
                const twiddleRe = factors[2 * j    ];
                const twiddleIm = factors[2 * j + 1];

                // Multiply by twiddle factors
                const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
                const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

                // Combine results of even and odd parts in place
                out[evenIndex * 2    ] = evenPartRe + twiddledOddRe;
                out[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
                out[oddIndex  * 2    ] = evenPartRe - twiddledOddRe;
                out[oddIndex  * 2 + 1] = evenPartIm - twiddledOddIm;
            }
        }
    }

    return out;
}


function fftRealInPlace_ref(realInput, fftFactorLookup = null) {
    const N = realInput.length;
    const bits = Math.floor(Math.log2(N));

    if (N !== nextPowerOf2(N)) {
        console.error("FFT FRAME must have power of 2");
        return;
    }

    // Perform bit reversal
    const out = new Float32Array(N * 2);
    let brs = [];
    for (let i = 0; i < N; i++) {
        const reversedIndex = bitReverse(i, bits);
        brs.push(reversedIndex);
        out[reversedIndex * 2    ] = realInput[i]; // Copy real part
        out[reversedIndex * 2 + 1] = 0;            // Copy imaginary part
    }
    //console.log("BR:",brs);

    if (N <= 1) {
        return output;
    }

    let js = [];
    // Recursively calculate FFT
    for (let size = 2; size <= N; size *= 2) {
        const halfSize = size / 2;
        // Get FFT factors with caching
        const factors = computeFFTFactorsWithCache(size);
        //console.log("-size "+size+"-------------------------------------------------------------------------------------------------");
        for (let i = 0; i < N; i += size) {
            for (let j = 0; j < halfSize; j++) {
                js.push(j);
                const evenIndex = i + j;
                const oddIndex = i + j + halfSize;

                const eRe = out[evenIndex * 2];
                const eIm = out[evenIndex * 2 + 1];
                const oRe = out[oddIndex * 2];
                const oIm = out[oddIndex * 2 + 1];

                //const twiddleRe = Math.cos((2 * Math.PI * j) / size);
                //const twiddleIm = Math.sin((2 * Math.PI * j) / size);
                const twiddleRe = factors[2 * j    ];
                const twiddleIm = factors[2 * j + 1];

                //console.log(evenIndex,oddIndex,"-",j);

                // Multiply by twiddle factors
                const t_oRe = oRe * twiddleRe - oIm * twiddleIm;
                const t_oIm = oRe * twiddleIm + oIm * twiddleRe;

                // Combine results of even and odd parts in place
                out[evenIndex * 2    ] = eRe + t_oRe;
                out[evenIndex * 2 + 1] = eIm + t_oIm;
                out[oddIndex  * 2    ] = eRe - t_oRe;
                out[oddIndex  * 2 + 1] = eIm - t_oIm;

                //console.log("**** EV.RE",evenIndex,(eRe + t_oRe).toFixed(2),"<- EV.RE",evenIndex,"+ (OD.RE",oddIndex,"* TW.RE",j,"- OD.IM",oddIndex,"* TW.IM",j,")","|||||||","EV.IM",evenIndex,(eIm + t_oIm).toFixed(2),"<- EV.IM",evenIndex,"+ (OD.RE",oddIndex,"* TW.IM",j,"+ OD.IM",oddIndex,"* TW.RE",j,")");
                //console.log("**** OD.RE",oddIndex ,(eRe - t_oRe).toFixed(2),"<- EV.RE",evenIndex,"- (OD.RE",oddIndex,"* TW.RE",j,"- OD.IM",oddIndex,"* TW.IM",j,")","|||||||","OD.IM",oddIndex ,(eIm - t_oIm).toFixed(2),"<- EV.IM",evenIndex,"- (OD.RE",oddIndex,"* TW.IM",j,"+ OD.IM",oddIndex,"* TW.RE",j,")");
            }
        }
        //console.log("size:"+size, output);
        //console.log("size:"+size, js);
        js = [];
    }

    return out;
}


/**********************************************************************************************/
/**********************************************************************************************/
/***************************** PREPARATION OF FFT AND IFFT ************************************/
/**********************************************************************************************/


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
    //return fftRealInPlace_ref(paddedInput);
    //return fftRealInPlaceRADIX2(paddedInput);
    return fftRealInPlaceRADIX4(paddedInput);
}



function FFT(inputSignal, fftFactorLookup=null) {
    //console.log("----FFT-----");
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
    //const fftResult = fftComplexInPlace_ref(conjugateSpectrum);
    const fftResult = fftComplexInPlaceRADIX4(conjugateSpectrum);

    // Take the complex conjugate of the FFT result and scale by 1/N
    const ifftResult = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
        ifftResult[i * 2] = fftResult[i * 2] / N; // Scale real part
        ifftResult[i * 2 + 1] = -fftResult[i * 2 + 1] / N; // Scale and negate imaginary part
    }

    return ifftResult;
}


function IFFT(spectrum) {
    //console.log("----IFFT-----");
    return ifft(spectrum);
}



// Function to compute inverse FFT of a spectrum
function computeInverseFFT(spectrum) {
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






/**********************************************************************************************/
/**********************************************************************************************/
/**********************************************************************************************/
/********************************* TESTING PERFORMANCE ****************************************/

// Define the number of FFT operations to perform
const numOperations = 10000; // You can adjust this number based on your requirements

// Generate test data as Float32Array
const generateTestData = (size) => {
    const testData = new Float32Array(size);
    for (let i = 0; i < size; i++) {
        // For demonstration purposes, generate random data between -1 and 1
        testData[i] = Math.random() * 2 - 1;
    }
    return testData;
};

const testData8    = generateTestData(8);
const testData16   = generateTestData(16);
const testData32   = generateTestData(32);
const testData64   = generateTestData(64);
const testData128  = generateTestData(128);
const testData256  = generateTestData(256);
const testData512  = generateTestData(512);
const testData1024 = generateTestData(1024);
const testData2048 = generateTestData(2048);
const testData4096 = generateTestData(4096);

// Perform FFT operations
const performFFTOperations = (fftSize) => {
    let testData;
    if(fftSize ==  512){ testData = testData512; } 
    if(fftSize == 1024){ testData = testData1024; } 
    if(fftSize == 2048){ testData = testData2048; } 
    if(fftSize == 4096){ testData = testData4096; } 

    // Perform FFT operations numOperations times
    for (let i = 0; i < numOperations; i++) {
        fftRealInPlaceRADIX4(testData);
    }

};

// Measure the time taken to perform FFT operations
const measureTime = (fftSize) => {
    const startTime = performance.now(); // Start time
    performFFTOperations(fftSize); // Perform FFT operations
    const endTime = performance.now(); // End time
    const elapsedTime = endTime - startTime; // Elapsed time in milliseconds

    // Calculate the number of FFT operations per second
    const operationsPerSecond = Math.floor(numOperations / (elapsedTime / 1000));
    console.log("Number of FFT",fftSize,"operations per second:", operationsPerSecond);
};


function compareFFTResults(array1, array2) {
    // Check if arrays have the same length
    if (array1.length !== array2.length) {
        return false;
    }

    // Check each element in the arrays for equality
    for (let i = 0; i < array1.length; i++) {
        // Compare elements with a small tolerance for floating-point imprecision
        if (Math.abs(array1[i] - array2[i]) > 1e-6) {
            console.log("Mismatch at ",i," between ",array1[i],array2[i]);
            return false;
        }
    }

    // If all elements are equal within tolerance, arrays are considered equal
    return true;
}

/****************** TEST SPEED *******************/ 

measureTime(512);
measureTime(1024);
measureTime(2048);
//measureTime(4096);


/****************** TEST IF FORWARD IS CORRECT by comparison with REFERENCE *******************/ 
/*

console.log("8:    ",compareFFTResults(fftRealInPlace_ref(testData8),fftRealInPlaceRADIX4(testData8)));
console.log("16:   ",compareFFTResults(fftRealInPlace_ref(testData16),fftRealInPlaceRADIX4(testData16)));
console.log("32:   ",compareFFTResults(fftRealInPlace_ref(testData32),fftRealInPlaceRADIX4(testData32)));
console.log("64:   ",compareFFTResults(fftRealInPlace_ref(testData64),fftRealInPlaceRADIX4(testData64)));
console.log("128:  ",compareFFTResults(fftRealInPlace_ref(testData128),fftRealInPlaceRADIX4(testData128)));
console.log("256:  ",compareFFTResults(fftRealInPlace_ref(testData256),fftRealInPlaceRADIX4(testData256)));
console.log("512:  ",compareFFTResults(fftRealInPlace_ref(testData512),fftRealInPlaceRADIX4(testData512)));
console.log("1024: ",compareFFTResults(fftRealInPlace_ref(testData1024),fftRealInPlaceRADIX4(testData1024)));
console.log("2048: ",compareFFTResults(fftRealInPlace_ref(testData2048),fftRealInPlaceRADIX4(testData2048)));
console.log("4096: ",compareFFTResults(fftRealInPlace_ref(testData4096),fftRealInPlaceRADIX4(testData4096)));
*/

/****************** TEST IF FFT AND IFFT RETURN ORIGINAL SIGNAL *******************/ 

const signal1 = [ 1.0, 0.4, 0.0, 0.2 ];
const signal2 = [ 0.0, 0.5, 1.0, 0.5, 0.0,-0.5, 1.0,-0.5 ];
const signal3 = [ 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1 ];
const signal4 = [ 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1, 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1 ];

/*
console.log(signal1);
console.log(computeInverseFFT(computeFFT(signal1)));
console.log(signal2);
console.log(computeInverseFFT(computeFFT(signal2)));
console.log(signal3);
console.log(computeInverseFFT(computeFFT(signal3)));
*/

//console.log(computeFFT(signal1));


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

    return new Float64Array(factors);
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



function fftComplexInPlace_radix4(out) {
    const N = out.length / 4;
    const bits = Math.log2(N);

    let factors;
    if(N == 4){    factors = LOOKUP_RADIX2_4;    }

    if(N == 16){   factors = LOOKUP_RADIX2_16;   }

    if(N == 64){   factors = LOOKUP_RADIX2_64;   }

    if(N == 256){  factors = LOOKUP_RADIX2_256;  }

    if(N == 1024){ factors = LOOKUP_RADIX2_1024; }

    if(N == 4096){ factors = LOOKUP_RADIX2_4096; }


    let pre  = 0;    //offset for indexing Factor Lookup 
    let pwr  = 0;    //power 
    let mpwr = bits; //max power
    let N_half    = N >> 1;
    let N_quarter = N >> 2;
    let c = N_half;  // circled index start

    for (let size = 4; size <= N; size <<= 2) {
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

            const j2 = j1 + br;
            // (2) TwiddleFactors
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


            i++; l++; ni+=4;
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

function twiddlelizer(out, tRe, tIm, eReI, eImI, oReI, oImI){
        // Get current values
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

/*
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
    let tRe1, tIm1, eReI1, eImI1, oReI1, oImI1;
    let tRe2, tIm2, eReI2, eImI2, oReI2, oImI2;
    let tRe3, tIm3, eReI3, eImI3, oReI3, oImI3;
    let tRe4, tIm4, eReI4, eImI4, oReI4, oImI4;
    let tRe5, tIm5, eReI5, eImI5, oReI5, oImI5;
    let tRe6, tIm6, eReI6, eImI6, oReI6, oImI6;
    let tRe7, tIm7, eReI7, eImI7, oReI7, oImI7;
    let tRe8, tIm8, eReI8, eImI8, oReI8, oImI8;

    while(i < len){
        if(i==0){ 
          // TwiddleFactors
          tRe1 = factors[idx_LKUP[i++]]; tIm1 = factors[idx_LKUP[i++]]; eReI1 = idx_LKUP[i++]; eImI1 = idx_LKUP[i++]; oReI1 = idx_LKUP[i++]; oImI1 = idx_LKUP[i++];
          tRe2 = factors[idx_LKUP[i++]]; tIm2 = factors[idx_LKUP[i++]]; eReI2 = idx_LKUP[i++]; eImI2 = idx_LKUP[i++]; oReI2 = idx_LKUP[i++]; oImI2 = idx_LKUP[i++];
          tRe3 = factors[idx_LKUP[i++]]; tIm3 = factors[idx_LKUP[i++]]; eReI3 = idx_LKUP[i++]; eImI3 = idx_LKUP[i++]; oReI3 = idx_LKUP[i++]; oImI3 = idx_LKUP[i++];
          tRe4 = factors[idx_LKUP[i++]]; tIm4 = factors[idx_LKUP[i++]]; eReI4 = idx_LKUP[i++]; eImI4 = idx_LKUP[i++]; oReI4 = idx_LKUP[i++]; oImI4 = idx_LKUP[i++];
          tRe5 = factors[idx_LKUP[i++]]; tIm5 = factors[idx_LKUP[i++]]; eReI5 = idx_LKUP[i++]; eImI5 = idx_LKUP[i++]; oReI5 = idx_LKUP[i++]; oImI5 = idx_LKUP[i++];
          tRe6 = factors[idx_LKUP[i++]]; tIm6 = factors[idx_LKUP[i++]]; eReI6 = idx_LKUP[i++]; eImI6 = idx_LKUP[i++]; oReI6 = idx_LKUP[i++]; oImI6 = idx_LKUP[i++];
          tRe7 = factors[idx_LKUP[i++]]; tIm7 = factors[idx_LKUP[i++]]; eReI7 = idx_LKUP[i++]; eImI7 = idx_LKUP[i++]; oReI7 = idx_LKUP[i++]; oImI7 = idx_LKUP[i++];
          tRe8 = factors[idx_LKUP[i++]]; tIm8 = factors[idx_LKUP[i++]]; eReI8 = idx_LKUP[i++]; eImI8 = idx_LKUP[i++]; oReI8 = idx_LKUP[i++]; oImI8 = idx_LKUP[i++];
        }else{
          i += 8 * 6; // factor 8
        }

        twiddlelizer(out, tRe1, tIm1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe1, tIm1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe1, tIm1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe1, tIm1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe1, tIm1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe1, tIm1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe1, tIm1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe1, tIm1, eReI1, eImI1, oReI1, oImI1);

    }

    return out;
}*/

let ____F = LOOKUP_RADIX2_1024;

let t1Re_1b  = ____F[6+(1*2+0)];

let t1Re_2b  = ____F[14+(1*2+0)]; 
let t1Re_2c  = ____F[14+(2*2+0)]; 
let t1Re_2d  = ____F[14+(3*2+0)];

let t1Re_1b2b = t1Re_1b * t1Re_2b;
let t1Re_1b2d = t1Re_1b * t1Re_2d;


let t2Re_1b   = ____F[30+(1*2+0)];
let t2Re_1c   = ____F[30+(2*2+0)];
let t2Re_1d   = ____F[30+(3*2+0)];
let t2Re_1e   = ____F[30+(4*2+0)];
let t2Re_1f   = ____F[30+(5*2+0)];
let t2Re_1g   = ____F[30+(6*2+0)];
let t2Re_1h   = ____F[30+(7*2+0)];

let t2Re_2b   = ____F[62+(1*2+0)]; 
let t2Re_2c   = ____F[62+(2*2+0)]; 
let t2Re_2d   = ____F[62+(3*2+0)]; 
let t2Re_2e   = ____F[62+(4*2+0)];
let t2Re_2f   = ____F[62+(5*2+0)]; 
let t2Re_2g   = ____F[62+(6*2+0)]; 
let t2Re_2h   = ____F[62+(7*2+0)]; 
let t2Re_2i   = ____F[62+(8*2+0)];
let t2Re_2j   = ____F[62+(9*2+0)]; 
let t2Re_2k   = ____F[62+(10*2+0)]; 
let t2Re_2l   = ____F[62+(11*2+0)]; 
let t2Re_2m   = ____F[62+(12*2+0)];
let t2Re_2n   = ____F[62+(13*2+0)]; 
let t2Re_2o   = ____F[62+(14*2+0)]; 
let t2Re_2p   = ____F[62+(15*2+0)]; 

function fftComplexInPlace_seq_4(out) {

    /////////////////////////////////////////////
    // P = 0  -> 4
    //

    for(let idx = 0; idx < 2048; idx+=8){
          let x0aRe = out[idx    ];
          let x1aRe = out[idx + 2];
          out[idx  +  2] =  x0aRe - x1aRe; 

          let x3aRe = out[idx + 6];
          out[idx  +  6] =  x0aRe - x1aRe; 

          let x2aRe = out[idx + 4];
          out[idx  +  4] =  x0aRe + x1aRe - x2aRe - x3aRe; 

          out[idx      ] =  x0aRe + x1aRe + x2aRe + x3aRe;
          out[idx  +  3] =  x2aRe - x3aRe; 
          out[idx  +  7] = -x2aRe + x3aRe;
    } 


    /////////////////////////////////////////////
    // P = 1  -> 16
    //

    for(let idx = 0; idx < 2048; idx+=32){
          let x0aRe = out[idx     ];
          let x0bRe = out[idx +  2]; 
          let x0bIm = out[idx +  3];
          let x0cRe = out[idx +  4];

          let x1aRe = out[idx +  8];
          out[idx +   8] = x0aRe - x1aRe; 
          let x1bRe = out[idx + 10];
          let x1bIm = out[idx + 11];
          let x1cRe = out[idx + 12];

          let x2aRe = out[idx + 16];
          let x2bRe = out[idx + 18];
          let x2bIm = out[idx + 19];
          let x2cRe = out[idx + 20];

          let x3aRe = out[idx + 24];
          out[idx +  24] = x0aRe - x1aRe;
          out[idx +  25] = x3aRe - x2aRe;  
          let x3bRe = out[idx + 26];
          let x3bIm = out[idx + 27];
          let x3cRe = out[idx + 28];

          out[idx      ] = x0aRe + x1aRe + x2aRe + x3aRe;  
          out[idx +   9] = x2aRe - x3aRe;      
          out[idx +  16] = x0aRe + x1aRe - x2aRe - x3aRe;

          let x2cRe_tRe_2c = x2cRe * t1Re_2c;
          let x3cRe_tRe_2c = x3cRe * t1Re_2c;

          let resReC1 = x0cRe + x2cRe_tRe_2c - x3cRe_tRe_2c; out[idx +   4] =   resReC1; out[idx +  28] =   resReC1;
          let resImC1 = x1cRe + x2cRe_tRe_2c + x3cRe_tRe_2c; out[idx +   5] =   resImC1; out[idx +  29] = - resImC1;
          let resReC2 = x0cRe - x2cRe_tRe_2c + x3cRe_tRe_2c; out[idx +  12] =   resReC2; out[idx +  20] =   resReC2;
          let resImC2 = x1cRe - x2cRe_tRe_2c - x3cRe_tRe_2c; out[idx +  13] = - resImC2; out[idx +  21] =   resImC2;  

          let x1dif = (x1bRe-x1bIm);
          let x1sum = (x1bRe+x1bIm);
          let x3dif = (x3bRe-x3bIm);
          let x3sum = (x3bRe+x3bIm);

          let x1dif_tRe_1b = x1dif * t1Re_1b;
          let x1sum_tRe_1b = x1sum * t1Re_1b;
          
          let x3dif_tRe_1b2b = x3dif * t1Re_1b2b;
          let x3dif_tRe_1b2d = x3dif * t1Re_1b2d;
          let x3sum_tRe_1b2b = x3sum * t1Re_1b2b;
          let x3sum_tRe_1b2d = x3sum * t1Re_1b2d;

          let tempReB = (x3dif_tRe_1b2b - x3sum_tRe_1b2d + x2bRe*t1Re_2b - x2bIm*t1Re_2d);
          let tempImB = (x3dif_tRe_1b2d + x3sum_tRe_1b2b + x2bRe*t1Re_2d + x2bIm*t1Re_2b);
          let tempReD = (x3dif_tRe_1b2d + x3sum_tRe_1b2b - x2bRe*t1Re_2d - x2bIm*t1Re_2b);
          let tempImD = (x3dif_tRe_1b2b - x3sum_tRe_1b2d - x2bRe*t1Re_2b + x2bIm*t1Re_2d);

          let resReB1 = x0bRe  + x1dif_tRe_1b + tempReB;     out[idx +   2] =   resReB1; out[idx +  30] =   resReB1;  
          let resReB2 = x0bRe  + x1dif_tRe_1b - tempReB;     out[idx +  14] =   resReB2; out[idx +  18] =   resReB2;
          let resReD1 = x0bRe  - x1dif_tRe_1b - tempReD;     out[idx +   6] =   resReD1; out[idx +  26] =   resReD1; 
          let resReD2 = x0bRe  - x1dif_tRe_1b + tempReD;     out[idx +  10] =   resReD2; out[idx +  22] =   resReD2;

          let resImB1 = x0bIm  + x1sum_tRe_1b + tempImB;     out[idx +   3] =   resImB1; out[idx +  31] = - resImB1;  
          let resImB2 = x0bIm  + x1sum_tRe_1b - tempImB;     out[idx +  15] = - resImB2; out[idx +  19] =   resImB2;
          let resImD1 =-x0bIm  + x1sum_tRe_1b - tempImD;     out[idx +   7] =   resImD1; out[idx +  27] = - resImD1; 
          let resImD2 =-x0bIm  + x1sum_tRe_1b + tempImD;     out[idx +  11] = - resImD2; out[idx +  23] =   resImD2;  
    }




    /////////////////////////////////////////////
    // P = 2  -> 64
    //

    for(let idx = 0; idx < 2048; idx+=128){
          
          let x0aRe_0 = out[idx       ];
          let x0bRe_0 = out[idx   +  2]; let x0bIm_0 = out[idx   +  3];
          let x0cRe_0 = out[idx   +  4]; let x0cIm_0 = out[idx   +  5];
          let x0dRe_0 = out[idx   +  6]; let x0dIm_0 = out[idx   +  7];
          let x0aRe_4 = out[idx   +  8]; let x0aIm_4 = out[idx   +  9];
          let x0bRe_4 = out[idx   + 10]; let x0bIm_4 = out[idx   + 11];
          let x0cRe_4 = out[idx   + 12]; let x0cIm_4 = out[idx   + 13];
          let x0dRe_4 = out[idx   + 14]; let x0dIm_4 = out[idx   + 15];
          let x0aRe_8 = out[idx   + 16];                                       //turning point

          let x1aRe_0 = out[idx   + 32];
          let x1bRe_0 = out[idx   + 34]; let x1bIm_0 = out[idx   + 35];
          let x1cRe_0 = out[idx   + 36]; let x1cIm_0 = out[idx   + 37];
          let x1dRe_0 = out[idx   + 38]; let x1dIm_0 = out[idx   + 39];
          let x1aRe_4 = out[idx   + 40]; let x1aIm_4 = out[idx   + 41];
          let x1bRe_4 = out[idx   + 42]; let x1bIm_4 = out[idx   + 43];
          let x1cRe_4 = out[idx   + 44]; let x1cIm_4 = out[idx   + 45];
          let x1dRe_4 = out[idx   + 46]; let x1dIm_4 = out[idx   + 47];
          let x1aRe_8 = out[idx   + 48]; let x1aIm_8 = out[idx   + 49];        //turning point

          let x2aRe_0 = out[idx   + 64]; let x2aIm_0 = out[idx   + 65];
          let x2bRe_0 = out[idx   + 66]; let x2bIm_0 = out[idx   + 67];
          let x2cRe_0 = out[idx   + 68]; let x2cIm_0 = out[idx   + 69];
          let x2dRe_0 = out[idx   + 70]; let x2dIm_0 = out[idx   + 71];
          let x2aRe_4 = out[idx   + 72]; let x2aIm_4 = out[idx   + 73];
          let x2bRe_4 = out[idx   + 74]; let x2bIm_4 = out[idx   + 75];
          let x2cRe_4 = out[idx   + 76]; let x2cIm_4 = out[idx   + 77];
          let x2dRe_4 = out[idx   + 78]; let x2dIm_4 = out[idx   + 79];
          let x2aRe_8 = out[idx   + 80]; let x2aIm_8 = out[idx   + 81];        //turning point

          let x3aRe_0 = out[idx   + 96]; let x3aIm_0 = out[idx   + 97];
          let x3bRe_0 = out[idx   + 98]; let x3bIm_0 = out[idx   + 99];
          let x3cRe_0 = out[idx   +100]; let x3cIm_0 = out[idx   +101];
          let x3dRe_0 = out[idx   +102]; let x3dIm_0 = out[idx   +103];
          let x3aRe_4 = out[idx   +104]; let x3aIm_4 = out[idx   +105];
          let x3bRe_4 = out[idx   +106]; let x3bIm_4 = out[idx   +107];
          let x3cRe_4 = out[idx   +108]; let x3cIm_4 = out[idx   +109];
          let x3dRe_4 = out[idx   +110]; let x3dIm_4 = out[idx   +111];
          let x3aRe_8 = out[idx   +112]; let x3aIm_8 = out[idx   +113];        //turning point

          let T0x1bRe = (x1bRe_0 * t2Re_1b - x1bIm_0 * t2Re_1h);
          let T0x1bIm = (x1bRe_0 * t2Re_1h + x1bIm_0 * t2Re_1b);
          let T0x3bRe = (x3bRe_0 * t2Re_1b - x3bIm_0 * t2Re_1h);
          let T0x3bIm = (x3bRe_0 * t2Re_1h + x3bIm_0 * t2Re_1b);

          let T0x0cRe = (x1cRe_0 * t2Re_1c - x1cIm_0 * t2Re_1g);
          let T0x0cIm = (x1cRe_0 * t2Re_1g + x1cIm_0 * t2Re_1c);
          let T0x2cRe = (x3cRe_0 * t2Re_1c - x3cIm_0 * t2Re_1g);
          let T0x2cIm = (x3cRe_0 * t2Re_1g + x3cIm_0 * t2Re_1c);

          let T0x1dRe = (x1dRe_0 * t2Re_1d - x1dIm_0 * t2Re_1f);
          let T0x1dIm = (x1dRe_0 * t2Re_1f + x1dIm_0 * t2Re_1d);
          let T0x3dRe = (x3dRe_0 * t2Re_1d - x3dIm_0 * t2Re_1f);
          let T0x3dIm = (x3dRe_0 * t2Re_1f + x3dIm_0 * t2Re_1d);

          out[idx       ] =   (x0aRe_0 + x1aRe_0) + (x2aRe_0 + x3aRe_0);
          out[idx  +  64] =   (x0aRe_0 + x1aRe_0) - (x2aRe_0 + x3aRe_0);
          out[idx  +   1] =                         (x2aIm_0 + x3aIm_0); 
          out[idx  +  65] =                       - (x2aIm_0 + x3aIm_0);
          let res0ReB = x0bRe_0 + T0x1bRe + ((x2bRe_0 + T0x3bRe)*  t2Re_2b - ((x2bIm_0 + T0x3bIm)*  t2Re_2p));
          out[idx  +   2] =   res0ReB;
          out[idx  + 126] =   res0ReB; 
          let res0ImB = x0bIm_0 + T0x1bIm + ((x2bRe_0 + T0x3bRe)*  t2Re_2p + ((x2bIm_0 + T0x3bIm)*  t2Re_2b)); 
          out[idx  +   3] =   res0ImB;
          out[idx  + 127] = - res0ImB;
          let res0ReC = x0cRe_0 + T0x0cRe + ((x2cRe_0 + T0x2cRe)*  t2Re_2c - ((x2cIm_0 + T0x2cIm)*  t2Re_2o));  
          out[idx  +   4] =   res0ReC;
          out[idx  + 124] =   res0ReC;
          let res0ImC = x0cIm_0 + T0x0cIm + ((x2cRe_0 + T0x2cRe)*  t2Re_2o + ((x2cIm_0 + T0x2cIm)*  t2Re_2c));
          out[idx  +   5] =   res0ImC; 
          out[idx  + 125] = - res0ImC;
          let res0ReD = x0dRe_0 + T0x1dRe + ((x2dRe_0 + T0x3dRe)*  t2Re_2d - ((x2dIm_0 + T0x3dIm)*  t2Re_2n));  
          out[idx  +   6] =   res0ReD;
          out[idx  + 122] =   res0ReD;
          let res0ImD = x0dIm_0 + T0x1dIm + ((x2dRe_0 + T0x3dRe)*  t2Re_2n + ((x2dIm_0 + T0x3dIm)*  t2Re_2d)); 
          out[idx  +   7] =   res0ImD;  
          out[idx  + 123] = - res0ImD;
          let res1ReA =    (x0aRe_0 - x1aRe_0) - (x2aIm_0 - x3aIm_0);
          out[idx  +  32] =   res1ReA;
          out[idx  +  96] =   res1ReA;
          let res1ImA =                          (x2aRe_0 - x3aRe_0); 
          out[idx  +  33] =   res1ImA;
          out[idx  +  97] = - res1ImA;
          let res1ReB = x0bRe_0 - T0x1bRe + ((x2bRe_0 - T0x3bRe)* -t2Re_2p  - ((x2bIm_0 - T0x3bIm)*  t2Re_2b ));
          out[idx  +  34] =   res1ReB;
          out[idx  +  94] =   res1ReB;
          let res1ImB = x0bIm_0 - T0x1bIm + ((x2bRe_0 - T0x3bRe)*  t2Re_2b  + ((x2bIm_0 - T0x3bIm)* -t2Re_2p )); 
          out[idx  +  35] =   res1ImB;
          out[idx  +  95] = - res1ImB; 
          let res1ReC = x0cRe_0 - T0x0cRe + ((x2cRe_0 - T0x2cRe)* -t2Re_2o  - ((x2cIm_0 - T0x2cIm)*  t2Re_2c )); 
          out[idx  +  36] =   res1ReC;
          out[idx  +  92] =   res1ReC;
          let res1ImC = x0cIm_0 - T0x0cIm + ((x2cRe_0 - T0x2cRe)*  t2Re_2c  + ((x2cIm_0 - T0x2cIm)* -t2Re_2o ));
          out[idx  +  37] =   res1ImC;
          out[idx  +  93] = - res1ImC;   
          let res1ReD = x0dRe_0 - T0x1dRe + ((x2dRe_0 - T0x3dRe)* -t2Re_2n  - ((x2dIm_0 - T0x3dIm)*  t2Re_2d ));
          out[idx  +  38] =   res1ReD;
          out[idx  +  90] =   res1ReD;
          let res1ImD = x0dIm_0 - T0x1dIm + ((x2dRe_0 - T0x3dRe)*  t2Re_2d  + ((x2dIm_0 - T0x3dIm)* -t2Re_2n ));  
          out[idx  +  39] =   res1ImD;
          out[idx  +  91] = - res1ImD; 

          let T1x0aRe = (x1aRe_4 * t2Re_1e - x1aIm_4 * t2Re_1e);
          let T1x0aIm = (x1aRe_4 * t2Re_1e + x1aIm_4 * t2Re_1e);
          let T1x2aRe = (x3aRe_4 * t2Re_1e - x3aIm_4 * t2Re_1e);
          let T1x2aIm = (x3aRe_4 * t2Re_1e + x3aIm_4 * t2Re_1e);

          let T1x1bRe = (x1bRe_4 * t2Re_1f - x1bIm_4 * t2Re_1d);
          let T1x1bIm = (x1bRe_4 * t2Re_1d + x1bIm_4 * t2Re_1f);
          let T1x3bRe = (x3bRe_4 * t2Re_1f - x3bIm_4 * t2Re_1d);
          let T1x3bIm = (x3bRe_4 * t2Re_1d + x3bIm_4 * t2Re_1f);

          let T1x0cRe = (x1cRe_4 * t2Re_1g - x1cIm_4 * t2Re_1c);
          let T1x0cIm = (x1cRe_4 * t2Re_1c + x1cIm_4 * t2Re_1g);
          let T1x2cRe = (x3cRe_4 * t2Re_1g - x3cIm_4 * t2Re_1c);
          let T1x2cIm = (x3cRe_4 * t2Re_1c + x3cIm_4 * t2Re_1g);

          let T1x1dRe = (x1dRe_4 * t2Re_1h - x1dIm_4 * t2Re_1b);
          let T1x1dIm = (x1dRe_4 * t2Re_1b + x1dIm_4 * t2Re_1h);
          let T1x3dRe = (x3dRe_4 * t2Re_1h - x3dIm_4 * t2Re_1b);
          let T1x3dIm = (x3dRe_4 * t2Re_1b + x3dIm_4 * t2Re_1h);

          let res2ReA = x0aRe_4 + T1x0aRe + ((x2aRe_4 + T1x2aRe)*  t2Re_2e - ((x2aIm_4 + T1x2aIm)*  t2Re_2m));  
          out[idx  +   8] =   res2ReA;
          out[idx  + 120] =   res2ReA;
          let res2ImA = x0aIm_4 + T1x0aIm + ((x2aRe_4 + T1x2aRe)*  t2Re_2m + ((x2aIm_4 + T1x2aIm)*  t2Re_2e)); 
          out[idx  +   9] =   res2ImA;
          out[idx  + 121] = - res2ImA; 
          let res2ReB = x0bRe_4 + T1x1bRe + ((x2bRe_4 + T1x3bRe)*  t2Re_2f - ((x2bIm_4 + T1x3bIm)*  t2Re_2l));
          out[idx  +  10] =   res2ReB;
          out[idx  + 118] =   res2ReB; 
          let res2ImB = x0bIm_4 + T1x1bIm + ((x2bRe_4 + T1x3bRe)*  t2Re_2l + ((x2bIm_4 + T1x3bIm)*  t2Re_2f));  
          out[idx  +  11] =   res2ImB; 
          out[idx  + 119] = - res2ImB; 
          let res2ReC = x0cRe_4 + T1x0cRe + ((x2cRe_4 + T1x2cRe)*  t2Re_2g - ((x2cIm_4 + T1x2cIm)*  t2Re_2k));
          out[idx  +  12] =   res2ReC;
          out[idx  + 116] =   res2ReC;  
          let res2ImC = x0cIm_4 + T1x0cIm + ((x2cRe_4 + T1x2cRe)*  t2Re_2k + ((x2cIm_4 + T1x2cIm)*  t2Re_2g)); 
          out[idx  +  13] =   res2ImC;
          out[idx  + 117] = - res2ImC;  
          let res2ReD = x0dRe_4 + T1x1dRe + ((x2dRe_4 + T1x3dRe)*  t2Re_2h - ((x2dIm_4 + T1x3dIm)*  t2Re_2j));  
          out[idx  +  14] =   res2ReD;
          out[idx  + 114] =   res2ReD;
          let res2ImD = x0dIm_4 + T1x1dIm + ((x2dRe_4 + T1x3dRe)*  t2Re_2j + ((x2dIm_4 + T1x3dIm)*  t2Re_2h)); 
          out[idx  +  15] =   res2ImD;
          out[idx  + 115] = - res2ImD;
          let res3ReA = x0aRe_4 - T1x0aRe + ((x2aRe_4 - T1x2aRe)* -t2Re_2m  - ((x2aIm_4 - T1x2aIm)*  t2Re_2e ));
          out[idx  +  40] =   res3ReA;
          out[idx  +  88] =   res3ReA;
          let res3ImA = x0aIm_4 - T1x0aIm + ((x2aRe_4 - T1x2aRe)*  t2Re_2e  + ((x2aIm_4 - T1x2aIm)* -t2Re_2m )); 
          out[idx  +  41] =   res3ImA; 
          out[idx  +  89] = - res3ImA;
          let res3ReB = x0bRe_4 - T1x1bRe + ((x2bRe_4 - T1x3bRe)* -t2Re_2l  - ((x2bIm_4 - T1x3bIm)*  t2Re_2f ));
          out[idx  +  42] =   res3ReB; 
          out[idx  +  86] =   res3ReB;
          let res3ImB = x0bIm_4 - T1x1bIm + ((x2bRe_4 - T1x3bRe)*  t2Re_2f  + ((x2bIm_4 - T1x3bIm)* -t2Re_2l ));
          out[idx  +  43] =   res3ImB;
          out[idx  +  87] = - res3ImB;  
          let res3ReC = x0cRe_4 - T1x0cRe + ((x2cRe_4 - T1x2cRe)* -t2Re_2k  - ((x2cIm_4 - T1x2cIm)*  t2Re_2g ));
          out[idx  +  44] =   res3ReC;
          out[idx  +  84] =   res3ReC;
          let res3ImC = x0cIm_4 - T1x0cIm + ((x2cRe_4 - T1x2cRe)*  t2Re_2g  + ((x2cIm_4 - T1x2cIm)* -t2Re_2k )); 
          out[idx  +  45] =   res3ImC;
          out[idx  +  85] = - res3ImC;
          let res3ReD = x0dRe_4 - T1x1dRe + ((x2dRe_4 - T1x3dRe)* -t2Re_2j  - ((x2dIm_4 - T1x3dIm)*  t2Re_2h ));
          out[idx  +  46] =   res3ReD;
          out[idx  +  82] =   res3ReD;
          let res3ImD = x0dIm_4 - T1x1dIm + ((x2dRe_4 - T1x3dRe)*  t2Re_2h  + ((x2dIm_4 - T1x3dIm)* -t2Re_2j ));
          out[idx  +  47] =   res3ImD; 
          out[idx  +  83] = - res3ImD;

          let T2x0aRe = - x1aIm_8;
          let T2x0aIm =   x1aRe_8;
          let T2x2aRe = - x3aIm_8;
          let T2x2aIm =   x3aRe_8;

          let T2x1bRe = (x1dRe_4 * -t2Re_1h - -x1dIm_4 *  t2Re_1b);
          let T2x1bIm = (x1dRe_4 *  t2Re_1b + -x1dIm_4 * -t2Re_1h);
          let T2x3bRe = (x3dRe_4 * -t2Re_1h - -x3dIm_4 *  t2Re_1b);
          let T2x3bIm = (x3dRe_4 *  t2Re_1b + -x3dIm_4 * -t2Re_1h);

          let T2x0cRe = (x1cRe_4 * -t2Re_1g - -x1cIm_4 *  t2Re_1c);
          let T2x0cIm = (x1cRe_4 *  t2Re_1c + -x1cIm_4 * -t2Re_1g);
          let T2x2cRe = (x3cRe_4 * -t2Re_1g - -x3cIm_4 *  t2Re_1c);
          let T2x2cIm = (x3cRe_4 *  t2Re_1c + -x3cIm_4 * -t2Re_1g);

          let T2x1dRe = (x1bRe_4 * -t2Re_1f - -x1bIm_4 *  t2Re_1d);
          let T2x1dIm = (x1bRe_4 *  t2Re_1d + -x1bIm_4 * -t2Re_1f);
          let T2x3dRe = (x3bRe_4 * -t2Re_1f - -x3bIm_4 *  t2Re_1d);
          let T2x3dIm = (x3bRe_4 *  t2Re_1d + -x3bIm_4 * -t2Re_1f);

          let res4ReA =  x0aRe_8 + T2x0aRe + ((x2aRe_8 + T2x2aRe)*  t2Re_2i - (( x2aIm_8 + T2x2aIm)*  t2Re_2i)); 
          out[idx  +  16] =   res4ReA;
          out[idx  + 112] =   res4ReA; 
          let res4ImA =  0       + T2x0aIm + ((x2aRe_8 + T2x2aRe)*  t2Re_2i + (( x2aIm_8 + T2x2aIm)*  t2Re_2i)); 
          out[idx  +  17] =   res4ImA;
          out[idx  + 113] = - res4ImA; 
          let res4ReB =  x0dRe_4 + T2x1bRe + ((x2dRe_4 + T2x3bRe)*  t2Re_2j - ((-x2dIm_4 + T2x3bIm)*  t2Re_2h)); 
          out[idx  +  18] =   res4ReB;
          out[idx  + 110] =   res4ReB;
          let res4ImB = -x0dIm_4 + T2x1bIm + ((x2dRe_4 + T2x3bRe)*  t2Re_2h + ((-x2dIm_4 + T2x3bIm)*  t2Re_2j)); 
          out[idx  +  19] =   res4ImB; 
          out[idx  + 111] = - res4ImB; 
          let res4ReC =  x0cRe_4 + T2x0cRe + ((x2cRe_4 + T2x2cRe)*  t2Re_2k - ((-x2cIm_4 + T2x2cIm)*  t2Re_2g)); 
          out[idx  +  20] =   res4ReC;
          out[idx  + 108] =   res4ReC; 
          let res4ImC = -x0cIm_4 + T2x0cIm + ((x2cRe_4 + T2x2cRe)*  t2Re_2g + ((-x2cIm_4 + T2x2cIm)*  t2Re_2k));   
          out[idx  +  21] =   res4ImC;
          out[idx  + 109] = - res4ImC;
          let res4ReD =  x0bRe_4 + T2x1dRe + ((x2bRe_4 + T2x3dRe)*  t2Re_2l - ((-x2bIm_4 + T2x3dIm)*  t2Re_2f)); 
          out[idx  +  22] =   res4ReD;
          out[idx  + 106] =   res4ReD; 
          let res4ImD = -x0bIm_4 + T2x1dIm + ((x2bRe_4 + T2x3dRe)*  t2Re_2f + ((-x2bIm_4 + T2x3dIm)*  t2Re_2l)); 
          out[idx  +  23] =   res4ImD;
          out[idx  + 107] = - res4ImD;
          let res5ReA =  x0aRe_8 - T2x0aRe + ((x2aRe_8 - T2x2aRe)* -t2Re_2i  - (( x2aIm_8 - T2x2aIm)*  t2Re_2i ));
          out[idx  +  48] =   res5ReA;
          out[idx  +  80] =   res5ReA;
          let res5ImA =  0       - T2x0aIm + ((x2aRe_8 - T2x2aRe)*  t2Re_2i  + (( x2aIm_8 - T2x2aIm)* -t2Re_2i ));
          out[idx  +  49] =   res5ImA; 
          out[idx  +  81] = - res5ImA;
          let res5ReB =  x0dRe_4 - T2x1bRe + ((x2dRe_4 - T2x3bRe)* -t2Re_2h  - ((-x2dIm_4 - T2x3bIm)*  t2Re_2j ));
          out[idx  +  50] =   res5ReB;
          out[idx  +  78] =   res5ReB;
          let res5ImB = -x0dIm_4 - T2x1bIm + ((x2dRe_4 - T2x3bRe)*  t2Re_2j  + ((-x2dIm_4 - T2x3bIm)* -t2Re_2h ));
          out[idx  +  51] =   res5ImB;
          out[idx  +  79] = - res5ImB; 
          let res5ReC =  x0cRe_4 - T2x0cRe + ((x2cRe_4 - T2x2cRe)* -t2Re_2g  - ((-x2cIm_4 - T2x2cIm)*  t2Re_2k ));
          out[idx  +  52] =   res5ReC;
          out[idx  +  76] =   res5ReC;
          let res5ImC = -x0cIm_4 - T2x0cIm + ((x2cRe_4 - T2x2cRe)*  t2Re_2k  + ((-x2cIm_4 - T2x2cIm)* -t2Re_2g ));
          out[idx  +  53] =   res5ImC;
          out[idx  +  77] = - res5ImC; 
          let res5ReD =  x0bRe_4 - T2x1dRe + ((x2bRe_4 - T2x3dRe)* -t2Re_2f  - ((-x2bIm_4 - T2x3dIm)*  t2Re_2l ));
          out[idx  +  54] =   res5ReD;
          out[idx  +  74] =   res5ReD;
          let res5ImD = -x0bIm_4 - T2x1dIm + ((x2bRe_4 - T2x3dRe)*  t2Re_2l  + ((-x2bIm_4 - T2x3dIm)* -t2Re_2f ));
          out[idx  +  55] =   res5ImD;
          out[idx  +  75] = - res5ImD;

          let T3x0aRe = (x1aRe_4  * -t2Re_1e - -x1aIm_4 *  t2Re_1e);
          let T3x0aIm = (x1aRe_4  *  t2Re_1e + -x1aIm_4 * -t2Re_1e);
          let T3x2aRe = (x3aRe_4  * -t2Re_1e - -x3aIm_4 *  t2Re_1e);
          let T3x2aIm = (x3aRe_4  *  t2Re_1e + -x3aIm_4 * -t2Re_1e);

          let T3x1bRe = (x1dRe_0  * -t2Re_1d - -x1dIm_0 *  t2Re_1f);
          let T3x1bIm = (x1dRe_0  *  t2Re_1f + -x1dIm_0 * -t2Re_1d);
          let T3x3bRe = (x3dRe_0  * -t2Re_1d - -x3dIm_0 *  t2Re_1f);
          let T3x3bIm = (x3dRe_0  *  t2Re_1f + -x3dIm_0 * -t2Re_1d);

          let T3x0cRe = (x1cRe_0  * -t2Re_1c - -x1cIm_0 *  t2Re_1g);
          let T3x0cIm = (x1cRe_0  *  t2Re_1g + -x1cIm_0 * -t2Re_1c);
          let T3x2cRe = (x3cRe_0  * -t2Re_1c - -x3cIm_0 *  t2Re_1g);
          let T3x2cIm = (x3cRe_0  *  t2Re_1g + -x3cIm_0 * -t2Re_1c);

          let T3x1dRe = (x1bRe_0  * -t2Re_1b - -x1bIm_0 *  t2Re_1h);
          let T3x1dIm = (x1bRe_0  *  t2Re_1h + -x1bIm_0 * -t2Re_1b);
          let T3x3dRe = (x3bRe_0  * -t2Re_1b - -x3bIm_0 *  t2Re_1h);
          let T3x3dIm = (x3bRe_0  *  t2Re_1h + -x3bIm_0 * -t2Re_1b);

          let res6ReA =  x0aRe_4 + T3x0aRe + ((x2aRe_4 + T3x2aRe)*  t2Re_2m - ((-x2aIm_4 + T3x2aIm)*  t2Re_2e));  
          out[idx  +  24] =   res6ReA;
          out[idx  + 104] =   res6ReA;
          let res6ImA = -x0aIm_4 + T3x0aIm + ((x2aRe_4 + T3x2aRe)*  t2Re_2e + ((-x2aIm_4 + T3x2aIm)*  t2Re_2m)); 
          out[idx  +  25] =   res6ImA;
          out[idx  + 105] = - res6ImA; 
          let res6ReB =  x0dRe_0 + T3x1bRe + ((x2dRe_0 + T3x3bRe)*  t2Re_2n - ((-x2dIm_0 + T3x3bIm)*  t2Re_2d)); 
          out[idx  +  26] =   res6ReB;
          out[idx  + 102] =   res6ReB;
          let res6ImB = -x0dIm_0 + T3x1bIm + ((x2dRe_0 + T3x3bRe)*  t2Re_2d + ((-x2dIm_0 + T3x3bIm)*  t2Re_2n)); 
          out[idx  +  27] =   res6ImB; 
          out[idx  + 103] = - res6ImB; 
          let res6ReC =  x0cRe_0 + T3x0cRe + ((x2cRe_0 + T3x2cRe)*  t2Re_2o - ((-x2cIm_0 + T3x2cIm)*  t2Re_2c));  
          out[idx  +  28] =   res6ReC;
          out[idx  + 100] =   res6ReC;
          let res6ImC = -x0cIm_0 + T3x0cIm + ((x2cRe_0 + T3x2cRe)*  t2Re_2c + ((-x2cIm_0 + T3x2cIm)*  t2Re_2o)); 
          out[idx  +  29] =   res6ImC;
          out[idx  + 101] = - res6ImC;  
          let res6ReD =  x0bRe_0 + T3x1dRe + ((x2bRe_0 + T3x3dRe)*  t2Re_2p - ((-x2bIm_0 + T3x3dIm)*  t2Re_2b)); 
          out[idx  +  30] =   res6ReD;
          out[idx  +  98] =   res6ReD; 
          let res6ImD = -x0bIm_0 + T3x1dIm + ((x2bRe_0 + T3x3dRe)*  t2Re_2b + ((-x2bIm_0 + T3x3dIm)*  t2Re_2p)); 
          out[idx  +  31] =   res6ImD;
          out[idx  +  99] = - res6ImD;
          let res7ReA =  x0aRe_4 - T3x0aRe + ((x2aRe_4 - T3x2aRe)* -t2Re_2e  - ((-x2aIm_4 - T3x2aIm)*  t2Re_2m ));
          out[idx  +  56] =   res7ReA;
          out[idx  +  72] =   res7ReA;
          let res7ImA = -x0aIm_4 - T3x0aIm + ((x2aRe_4 - T3x2aRe)*  t2Re_2m  + ((-x2aIm_4 - T3x2aIm)* -t2Re_2e ));
          out[idx  +  57] =   res7ImA;
          out[idx  +  73] = - res7ImA;
          let res7ReB =  x0dRe_0 - T3x1bRe + ((x2dRe_0 - T3x3bRe)* -t2Re_2d  - ((-x2dIm_0 - T3x3bIm)*  t2Re_2n ));
          out[idx  +  58] =   res7ReB;
          out[idx  +  70] =   res7ReB;
          let res7ImB = -x0dIm_0 - T3x1bIm + ((x2dRe_0 - T3x3bRe)*  t2Re_2n  + ((-x2dIm_0 - T3x3bIm)* -t2Re_2d ));
          out[idx  +  59] =   res7ImB;
          out[idx  +  71] = - res7ImB; 
          let res7ReC =  x0cRe_0 - T3x0cRe + ((x2cRe_0 - T3x2cRe)* -t2Re_2c  - ((-x2cIm_0 - T3x2cIm)*  t2Re_2o ));
          out[idx  +  60] =   res7ReC;
          out[idx  +  68] =   res7ReC;
          let res7ImC = -x0cIm_0 - T3x0cIm + ((x2cRe_0 - T3x2cRe)*  t2Re_2o  + ((-x2cIm_0 - T3x2cIm)* -t2Re_2c ));
          out[idx  +  61] =   res7ImC;
          out[idx  +  69] = - res7ImC;
          let res7ReD =  x0bRe_0 - T3x1dRe + ((x2bRe_0 - T3x3dRe)* -t2Re_2b  - ((-x2bIm_0 - T3x3dIm)*  t2Re_2p ));
          out[idx  +  62] =   res7ReD;
          out[idx  +  66] =   res7ReD;
          let res7ImD = -x0bIm_0 - T3x1dIm + ((x2bRe_0 - T3x3dRe)*  t2Re_2p  + ((-x2bIm_0 - T3x3dIm)* -t2Re_2b ));
          out[idx  +  63] =   res7ImD;
          out[idx  +  67] = - res7ImD;
    }

    

    /////////////////////////////////////////////
    // P = 2.5  -> 128
    //

        let halfSize    = 128;
        let quarterSize = 64;
        for (let j = 0; j < halfSize; j++) {
            const evenIndex = j;
            const oddIndex  = j + halfSize;

            if(j > quarterSize){
              out[evenIndex * 2]     =  out[512 - evenIndex * 2] ;
              out[evenIndex * 2 + 1] = -out[512 - evenIndex * 2 + 1];
              out[oddIndex * 2]      =  out[512 - oddIndex * 2];
              out[oddIndex * 2 + 1]  = -out[512 - oddIndex * 2 + 1];
              continue;
            }

            const evenPartRe = out[evenIndex * 2];
            const evenPartIm = out[evenIndex * 2 + 1];
            const oddPartRe  = out[oddIndex * 2];
            const oddPartIm  = out[oddIndex * 2 + 1];

            const twiddleRe = ____F[126 + (j * 2 + 0)];
            const twiddleIm = ____F[126 + (j * 2 + 1)];

            const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
            const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

            out[evenIndex * 2]     = evenPartRe + twiddledOddRe;
            out[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
            out[oddIndex * 2]      = evenPartRe - twiddledOddRe;
            out[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
        }

        for (let j = 0; j < halfSize; j++) {
            const evenIndex = 256 + j;
            const oddIndex  = 256 + j + halfSize;

            const evenPartRe = out[evenIndex * 2];
            const evenPartIm = out[evenIndex * 2 + 1];
            const oddPartRe  = out[oddIndex * 2];
            const oddPartIm  = out[oddIndex * 2 + 1];

            const twiddleRe = ____F[126 + (j * 2 + 0)];
            const twiddleIm = ____F[126 + (j * 2 + 1)];

            const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
            const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

            out[evenIndex * 2]     = evenPartRe + twiddledOddRe;
            out[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
            out[oddIndex * 2]      = evenPartRe - twiddledOddRe;
            out[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
        }

        for (let j = 0; j < halfSize; j++) {
            const evenIndex = 512 + j;
            const oddIndex  = 512 + j + halfSize;

            const evenPartRe = out[evenIndex * 2];
            const evenPartIm = out[evenIndex * 2 + 1];
            const oddPartRe  = out[oddIndex * 2];
            const oddPartIm  = out[oddIndex * 2 + 1];

            const twiddleRe = ____F[126 + (j * 2 + 0)];
            const twiddleIm = ____F[126 + (j * 2 + 1)];

            const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
            const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

            out[evenIndex * 2]     = evenPartRe + twiddledOddRe;
            out[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
            out[oddIndex * 2]      = evenPartRe - twiddledOddRe;
            out[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
        }

        for (let j = 0; j < halfSize; j++) {
            const evenIndex = 768 + j;
            const oddIndex  = 768 + j + halfSize;

            const evenPartRe = out[evenIndex * 2];
            const evenPartIm = out[evenIndex * 2 + 1];
            const oddPartRe  = out[oddIndex * 2];
            const oddPartIm  = out[oddIndex * 2 + 1];

            const twiddleRe = ____F[126 + (j * 2 + 0)];
            const twiddleIm = ____F[126 + (j * 2 + 1)];

            const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
            const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

            out[evenIndex * 2]     = evenPartRe + twiddledOddRe;
            out[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
            out[oddIndex * 2]      = evenPartRe - twiddledOddRe;
            out[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
        }

     /*
    /////////////////////////////////////////////
    // P = 3  -> 256
    //

        halfSize    = 128;
        quarterSize = 64;
        for (let j = 0; j < halfSize; j++) {
            const evenIndex = j;
            const oddIndex  = j + halfSize;

            if(j > quarterSize){
              out[evenIndex * 2]     =  out[512 - evenIndex * 2] ;
              out[evenIndex * 2 + 1] = -out[512 - evenIndex * 2 + 1];
              out[oddIndex * 2]      =  out[512 - oddIndex * 2];
              out[oddIndex * 2 + 1]  = -out[512 - oddIndex * 2 + 1];
              continue;
            }

            const evenPartRe = out[evenIndex * 2];
            const evenPartIm = out[evenIndex * 2 + 1];
            const oddPartRe  = out[oddIndex * 2];
            const oddPartIm  = out[oddIndex * 2 + 1];

            const twiddleRe = ____F[254 + (j * 2 + 0)];
            const twiddleIm = ____F[254 + (j * 2 + 1)];

            const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
            const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

            out[evenIndex * 2]     = evenPartRe + twiddledOddRe;
            out[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
            out[oddIndex * 2]      = evenPartRe - twiddledOddRe;
            out[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
        }
    
    */






    return out;
}

function fftComplexInPlace_seq_4__(out) {
    const N = out.length/2;
    const bits = Math.log2(N);

    /*
    let ____F;
    if(N ==    4){ ____F = LOOKUP_RADIX2_4;    }
    if(N ==    8){ ____F = LOOKUP_RADIX2_8;    }
    if(N ==   16){ ____F = LOOKUP_RADIX2_16;   }
    if(N ==   32){ ____F = LOOKUP_RADIX2_32;   }
    if(N ==   64){ ____F = LOOKUP_RADIX2_64;   }
    if(N ==  128){ ____F = LOOKUP_RADIX2_128;  }
    if(N ==  256){ ____F = LOOKUP_RADIX2_256;  }
    if(N ==  512){ ____F = LOOKUP_RADIX2_512;  }
    if(N == 1024){ ____F = LOOKUP_RADIX2_1024; }
    if(N == 2048){ ____F = LOOKUP_RADIX2_2048; }
    if(N == 4096){ ____F = LOOKUP_RADIX2_4096; }
    */

    /*
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
    */

    let its = 0, accs = 0;


    /*for(let i=0; i<16; i++){
        console.log("INIT:",i," -> ", out[i*2], out[i*2+1]); 
    }*/
    
    
    let x0aRe, x0aIm; let x1aRe, x1aIm; let x2aRe, x2aIm; let x3aRe, x3aIm;
    let x0bRe, x0bIm; let x1bRe, x1bIm; let x2bRe, x2bIm; let x3bRe, x3bIm;
    let x0cRe, x0cIm; let x1cRe, x1cIm; let x2cRe, x2cIm; let x3cRe, x3cIm;
    let x0dRe, x0dIm; let x1dRe, x1dIm; let x2dRe, x2dIm; let x3dRe, x3dIm;
    let xM0ReA = 0; let xM0ImA = 0; let xM2ReA = 0; let xM2ImA = 0;
    let xM1ReB = 0; let xM1ImB = 0; let xM3ReB = 0; let xM3ImB = 0;
    let xM0ReC = 0; let xM0ImC = 0; let xM2ReC = 0; let xM2ImC = 0;
    let xM1ReD = 0; let xM1ImD = 0; let xM3ReD = 0; let xM3ImD = 0;

    let tRe_1a; let tIm_1a;    
    let tRe_1b; let tIm_1b;
    let tRe_1c; let tIm_1c;    
    let tRe_1d; let tIm_1d;
    let tRe_2a; let tIm_2a;    
    let tRe_2b; let tIm_2b;
    let tRe_2c; let tIm_2c;    
    let tRe_2d; let tIm_2d;

    let r = N; //64          // 4   16   64  128
    let steps = (bits>>1);   // 1    2    3    4   
    let ts = 1 << (steps-1); // 1    2    4    8
    let pre1 = 0;
    let pre2 = 2;
    for(let p = 0; p < steps; p++){
        let d = 1<<(2*p);    // 1    4   16   64
        
        let r = 4;  
        if(N == 16){ 
            if(p==0){ r = 8; }
            if(p==1){ r = 4; }
        }
        if(N == 64){
            if(p==0){ r = 16; }
            if(p==1){ r = 16; }
            if(p==2){ r = 4; }
        }
        if(N == 256){
            if(p==0){ r = 32; }
            if(p==1){ r = 32; }
            if(p==2){ r = 4; }
            if(p==3){ r = 4; }
        }

        let r_ = 4;  
        if(N == 16){ 
            if(p==0){ r_ = 4; }  
            if(p==1){ r_ = 8; }
        }
        if(N == 64){
            if(p==0){ r_ = 4; } 
            if(p==1){ r_ = 4; }
            if(p==2){ r_ = 16; }   
        }
        if(N == 256){
            if(p==0){ r_ = 4; }
            if(p==1){ r_ = 4; }
            if(p==2){ r_ = 16; }    
            if(p==3){ r_ = 32; }
        }


        let z = d*4;
        let s = 0;
        let k = 0;
                                //  0     1     2   
        let p1 = (p*2)+1;       //  1 //  3 //  5 //
        let p2 = (p*2+1)+1;     //  2 //  4 //  6 //
        let size1 = 2<<(p1-1);  //  2 //  8 // 32 // 128
        let size2 = 2<<(p2-1);  //  4 // 16 // 64 //
        let ji = 0; let jj = 0; let jk = 0;
        let c = 0;
        let w = 0;
        let b = 0;

        let jm2 = (1<<(p*2+1));    //   2     8     32
        let jm1 = (1<<(p*2+0));    //   1     4     16
        //console.log( "-size "+size2+"########################################" );
        for(let b_ = 0; b_ < ts; b_++){
          b = b_*r;  
          if(N==256 && p == 2 && b_ >= ts/2){ 
            b = (b_%4)*r + N/2; 
          } 
          s = b;
          let k = p==0 ? 1 : (1<<(2*p));  //  1  4  16  64

          for(let i_ = 0; i_ < ts; i_++){
            let i = b + i_*r_;
            if(N == 256 && p == 3){
                if(i_<(ts/2)){ 
                    i = b +  0+((i_%4)*32)*2; 
                }else{ 
                    i = b + 32+((i_%4)*32)*2; 
                }
            }
            jk = i;
            jj = i;
            w = 0;

            let ji = 0;
            let jl = (i % (4<<p)); // 4  8  16  32

            let i_a0 = (i + 0 + (k)*0); let i_a1 = (i + 0 + (k)*1); let i_a2 = (i + 0 + (k)*2); let i_a3 = (i + 0 + (k)*3);
            let i_b0 = (i + 1 + (k)*0); let i_b1 = (i + 1 + (k)*1); let i_b2 = (i + 1 + (k)*2); let i_b3 = (i + 1 + (k)*3);
            let i_c0 = (i + 2 + (k)*0); let i_c1 = (i + 2 + (k)*1); let i_c2 = (i + 2 + (k)*2); let i_c3 = (i + 2 + (k)*3);
            let i_d0 = (i + 3 + (k)*0); let i_d1 = (i + 3 + (k)*1); let i_d2 = (i + 3 + (k)*2); let i_d3 = (i + 3 + (k)*3);
            
            let sign2a = ((jj+0)%size2 < size1)      ? 1 : -1;
            let sign1a = ((jj+0)%size1 < (size1>>1)) ? 1 : -1; 
            let sign2b = ((jj+1)%size2 < size1)      ? 1 : -1;
            let sign1b = ((jj+1)%size1 < (size1>>1)) ? 1 : -1; 
            let sign2c = ((jj+2)%size2 < size1)      ? 1 : -1;
            let sign1c = ((jj+2)%size1 < (size1>>1)) ? 1 : -1; 
            let sign2d = ((jj+3)%size2 < size1)      ? 1 : -1;
            let sign1d = ((jj+3)%size1 < (size1>>1)) ? 1 : -1; 

            let j2a = ji%size1+(i%jm2); let j1a = ji%(size1/2)+(i%jm1); ji++;
            let j2b = ji%size1+(i%jm2); let j1b = ji%(size1/2)+(i%jm1); ji++;
            let j2c = ji%size1+(i%jm2); let j1c = ji%(size1/2)+(i%jm1); ji++;
            let j2d = ji%size1+(i%jm2); let j1d = ji%(size1/2)+(i%jm1); ji++;

            tRe_1a  = ____F[pre1+(2*j1a+0)];
            tIm_1a  = ____F[pre1+(2*j1a+1)];
            tRe_1b  = tRe_1a;
            tIm_1b  = tIm_1a;
            tRe_1c  = tRe_1a;
            tIm_1c  = tIm_1a;
            tRe_1d  = tRe_1a;
            tIm_1d  = tIm_1a;

            /*if(p > 0){
                tRe_1b  = ____F[pre1+(2*j1b+0)];
                tIm_1b  = ____F[pre1+(2*j1b+1)];  
                tRe_1c  = ____F[pre1+(2*j1c+0)];
                tIm_1c  = ____F[pre1+(2*j1c+1)]; 
                tRe_1d  = ____F[pre1+(2*j1d+0)];
                tIm_1d  = ____F[pre1+(2*j1d+1)]; 
            }*/

            tRe_2a  = ____F[pre2+(2*j2a+0)]; 
            tIm_2a  = ____F[pre2+(2*j2a+1)];
            tRe_2b  = ____F[pre2+(2*j2b+0)]; 
            tIm_2b  = ____F[pre2+(2*j2b+1)];
            tRe_2c  = tRe_2a;
            tIm_2c  = tIm_2a;
            tRe_2d  = tRe_2b;
            tIm_2d  = tIm_2b;

            /*if(p > 0){        
                tRe_2b  = ____F[pre2+(2*j2b+0)]; 
                tIm_2b  = ____F[pre2+(2*j2b+1)];
                tRe_2c  = ____F[pre2+(2*j2c+0)]; 
                tIm_2c  = ____F[pre2+(2*j2c+1)];        
                tRe_2d  = ____F[pre2+(2*j2d+0)]; 
                tIm_2d  = ____F[pre2+(2*j2d+1)];
            }*/

            
            if(p==0 || (i_%4) == 0){
                                                                    //########    +00\\  |+04\\  |-08\\  |-12\\  |
                x0aRe = out[(i_a0)*2+0]; x0aIm = out[(i_a0)*2+1];   //########       00  |   00  |   00  |   00  |
                x1aRe = out[(i_a1)*2+0]; x1aIm = out[(i_a1)*2+1];   //########      +04  |  -04  |  +04  |  -04  |
                x2aRe = out[(i_a2)*2+0]; x2aIm = out[(i_a2)*2+1];   //########       08  |   08  |   08  |   08  |
                x3aRe = out[(i_a3)*2+0]; x3aIm = out[(i_a3)*2+1];   //########      +12  |  -12  |  +12  |  -12  |
                //console.log( "(i_a0)",(i_a0),"(i_a1)",(i_a1),"(i_a2)",(i_a2),"(i_a3)",(i_a3) ); 
            }
            
            jk++;
            /*
            if(p>0 && (i_%4) == 0){
                                                                    //########    +01\\  |+05\\  |-09\\  |-13\\  |
                x0bRe = out[(i_b0)*2+0]; x0bIm = out[(i_b0)*2+1];   //########       01  |   01  |   01  |   01  |
                x1bRe = out[(i_b1)*2+0]; x1bIm = out[(i_b1)*2+1];   //########      +05  |  -05  |  +05  |  -05  |
                x2bRe = out[(i_b2)*2+0]; x2bIm = out[(i_b2)*2+1];   //########       09  |   09  |   09  |   09  |
                x3bRe = out[(i_b3)*2+0]; x3bIm = out[(i_b3)*2+1];   //########      +13  |  -13  |  +13  |  -13  |
                //console.log( "(i_b0)",(i_b0),"(i_b1)",(i_b1),"(i_b2)",(i_b2),"(i_b3)",(i_b3) ); 
            }

            jk++;

            if(p>0 && (i_%4) == 0){
                                                                    //########    +02\\  |+06\\  |-10\\  |-14\\  |
                x0cRe = out[(i_c0)*2+0]; x0cIm = out[(i_c0)*2+1];   //########       02  |   02  |   02  |   02  |
                x1cRe = out[(i_c1)*2+0]; x1cIm = out[(i_c1)*2+1];   //########      +06  |  -06  |  +06  |  -06  |
                x2cRe = out[(i_c2)*2+0]; x2cIm = out[(i_c2)*2+1];   //########       10  |   10  |   10  |   10  |
                x3cRe = out[(i_c3)*2+0]; x3cIm = out[(i_c3)*2+1];   //########      +14  |  -14  |  +14  |  -14  |
                //console.log( "(i_c0)",(i_c0),"(i_c1)",(i_c1),"(i_c2)",(i_c2),"(i_c3)",(i_c3) ); 
            }

            jk++;

            if(p>0 && (i_%4) == 0){
                                                                    //########    +03\\  |+07\\  |-11\\  |-15\\  |
                x0dRe = out[(i_d0)*2+0]; x0dIm = out[(i_d0)*2+1];   //########       03  |   03  |   03  |   03  | 
                x1dRe = out[(i_d1)*2+0]; x1dIm = out[(i_d1)*2+1];   //########      +07  |  -07  |  +07  |  -07  |
                x2dRe = out[(i_d2)*2+0]; x2dIm = out[(i_d2)*2+1];   //########       11  |   11  |   11  |   11  |
                x3dRe = out[(i_d3)*2+0]; x3dIm = out[(i_d3)*2+1];   //########      +15  |  -15  |  +15  |  -15  |
                //console.log( "(i_d0)",(i_d0),"(i_d1)",(i_d1),"(i_d2)",(i_d2),"(i_d3)",(i_d3) ); 
            }
            */
            jk++;

            if(true){
            //if(size1 == 2){
              x0bRe = x0aRe; x0bIm = x0aIm;  
              x1bRe = x1aRe; x1bIm = x1aIm; 
              x2bRe = x2aRe; x2bIm = x2aIm;  
              x3bRe = x3aRe; x3bIm = x3aIm;                              
              x0cRe = x0aRe; x0cIm = x0aIm; 
              x1cRe = x1aRe; x1cIm = x1aIm; 
              x2cRe = x2aRe; x2cIm = x2aIm; 
              x3cRe = x3aRe; x3cIm = x3aIm; 
              x0dRe = x0bRe; x0dIm = x0bIm; 
              x1dRe = x1bRe; x1dIm = x1bIm; 
              x2dRe = x2bRe; x2dIm = x2bIm; 
              x3dRe = x3bRe; x3dIm = x3bIm;
            } 

            /*                                                                                             
              xM0ReA = x0aRe + (x1aRe * tRe_1a - x1aIm * tIm_1a) * sign1a;
              xM0ImA = x0aIm + (x1aRe * tIm_1a + x1aIm * tRe_1a) * sign1a;                    
              xM2ReA = x2aRe + (x3aRe * tRe_1a - x3aIm * tIm_1a) * sign1a;
              xM2ImA = x2aIm + (x3aRe * tIm_1a + x3aIm * tRe_1a) * sign1a;
              
              xM1ReB = x0bRe + (x1bRe * tRe_1b - x1bIm * tIm_1b) * sign1b; 
              xM1ImB = x0bIm + (x1bRe * tIm_1b + x1bIm * tRe_1b) * sign1b; 
              xM3ReB = x2bRe + (x3bRe * tRe_1b - x3bIm * tIm_1b) * sign1b; 
              xM3ImB = x2bIm + (x3bRe * tIm_1b + x3bIm * tRe_1b) * sign1b; 
              
              xM0ReC = x0cRe + (x1cRe * tRe_1c - x1cIm * tIm_1c) * sign1c;
              xM0ImC = x0cIm + (x1cRe * tIm_1c + x1cIm * tRe_1c) * sign1c; 
              xM2ReC = x2cRe + (x3cRe * tRe_1c - x3cIm * tIm_1c) * sign1c;
              xM2ImC = x2cIm + (x3cRe * tIm_1c + x3cIm * tRe_1c) * sign1c;
              
              xM1ReD = x0dRe + (x1dRe * tRe_1d - x1dIm * tIm_1d) * sign1d;
              xM1ImD = x0dIm + (x1dRe * tIm_1d + x1dIm * tRe_1d) * sign1d;
              xM3ReD = x2dRe + (x3dRe * tRe_1d - x3dIm * tIm_1d) * sign1d;
              xM3ImD = x2dIm + (x3dRe * tIm_1d + x3dIm * tRe_1d) * sign1d;
            */

             // size = 2     ||| size = 8
             ///////////////////////////////// i = 0
             // 00 <- 00 01  |||  00 <-  00 +04          -> xM0ReA
             // 02 <- 02 03  |||  08 <-  08 +12          -> xM2ReA
             ///////////////////////////////// i = 4                            
             // 04 <- 04 05  |||  04 <-  00 +04          -> xM0ReA          
             // 06 <- 06 07  |||  12 <-  08 +12          -> xM2ReA          
             ///////////////////////////////// i = 8                             
             // 08 <- 08 09  |||                         -> xM0ReA (skip writing)       
             // 10 <- 10 11  |||                         -> xM2ReA (skip writing)  
             ///////////////////////////////// i = 12
             // 12 <- 12 13  |||                         -> xM0ReA (skip writing)  
             // 14 <- 14 15  |||                         -> xM2ReA (skip writing)  
             //console.log(size1, (i+0).toString().padStart(2),"--->", ((i+0)%size1 + w).toString().padStart(2),         ".re =", "[",i_a0.toString().padStart(2),"].re ",(sign1a<0)?"-":"+"," ([",i_a1.toString().padStart(2),"].re * t[",j1a.toString().padStart(2),"].re - [",i_a1.toString().padStart(2),"].im * t[",j1a.toString().padStart(2),"].im ) <-> ", "{",x0aRe.toFixed(2),"}",(sign1a<0)?"-":"+","({",x1aRe.toFixed(2),"} * t{",tRe_1a.toFixed(2),"} - {",x1aIm.toFixed(2),"} * {",tIm_1a.toFixed(2),"} ) = ",xM0ReA.toFixed(2));
             //console.log(size1, (i+0).toString().padStart(2),"--->", ((i+0)%size1 + w + size1).toString().padStart(2), ".re =", "[",i_a2.toString().padStart(2),"].re ",(sign1a<0)?"-":"+"," ([",i_a3.toString().padStart(2),"].re * t[",j1a.toString().padStart(2),"].re - [",i_a3.toString().padStart(2),"].im * t[",j1a.toString().padStart(2),"].im ) <-> ", "{",x2aRe.toFixed(2),"}",(sign1a<0)?"-":"+","({",x3aRe.toFixed(2),"} * t{",tRe_1a.toFixed(2),"} - {",x3aIm.toFixed(2),"} * {",tIm_1a.toFixed(2),"} ) = ",xM2ReA.toFixed(2)); 
             
             // size = 2     ||| size = 8
             ///////////////////////////////// i = 0
             // 01 <- 00 01  |||  01 <-  01  05          -> xM1ReB
             // 03 <- 02 03  |||  09 <-  09  13          -> xM3ReB
             ///////////////////////////////// i = 4
             // 05 <- 04 05  |||  05 <-  01  05
             // 07 <- 06 07  |||  13 <-  09  13
             ///////////////////////////////// i = 8
             // 09 <- 08 09  |||
             // 11 <- 10 11  |||
             ///////////////////////////////// i = 12
             // 13 <- 12 13  |||
             // 15 <- 14 15  |||
             //console.log(size1, (i+1).toString().padStart(2),"--->", ((i+1)%size1 + w).toString().padStart(2),         ".re =", "[",i_b0.toString().padStart(2),"].re ",(sign1b<0)?"-":"+"," ([",i_b1.toString().padStart(2),"].re * t[",j1b.toString().padStart(2),"].re - [",i_b1.toString().padStart(2),"].im * t[",j1b.toString().padStart(2),"].im ) <-> ", "{",x0bRe.toFixed(2),"}",(sign1b<0)?"-":"+","({",x1bRe.toFixed(2),"} * t{",tRe_1b.toFixed(2),"} - {",x1bIm.toFixed(2),"} * {",tIm_1b.toFixed(2),"} ) = ",xM1ReB.toFixed(2));
             //console.log(size1, (i+1).toString().padStart(2),"--->", ((i+1)%size1 + w + size1).toString().padStart(2), ".re =", "[",i_b2.toString().padStart(2),"].re ",(sign1b<0)?"-":"+"," ([",i_b3.toString().padStart(2),"].re * t[",j1b.toString().padStart(2),"].re - [",i_b3.toString().padStart(2),"].im * t[",j1b.toString().padStart(2),"].im ) <-> ", "{",x2bRe.toFixed(2),"}",(sign1b<0)?"-":"+","({",x3bRe.toFixed(2),"} * t{",tRe_1b.toFixed(2),"} - {",x3bIm.toFixed(2),"} * {",tIm_1b.toFixed(2),"} ) = ",xM3ReB.toFixed(2));  
             

             // size = 2     ||| size = 8
             ///////////////////////////////// i = 0
             // 00 <- 00 01  |||  02 <-  02  06
             // 02 <- 02 03  |||  10 <-  10  14
             ///////////////////////////////// i = 4
             // 04 <- 04 05  |||  06 <-  02  06
             // 06 <- 06 07  |||  14 <-  10  14
             ///////////////////////////////// i = 8
             // 08 <- 08 09  |||    
             // 10 <- 10 11  |||
             ///////////////////////////////// i = 12
             // 12 <- 12 13  |||
             // 14 <- 14 15  |||
             //console.log(size1, (i+2).toString().padStart(2),"--->", ((i+2)%size1 + w).toString().padStart(2),         ".re =", "[",i_c0.toString().padStart(2),"].re ",(sign1c<0)?"-":"+"," ([",i_c1.toString().padStart(2),"].re * t[",j1c.toString().padStart(2),"].re - [",i_c1.toString().padStart(2),"].im * t[",j1c.toString().padStart(2),"].im ) <-> ", "{",x0cRe.toFixed(2),"}",(sign1c<0)?"-":"+","({",x1cRe.toFixed(2),"} * t{",tRe_1c.toFixed(2),"} - {",x1cIm.toFixed(2),"} * {",tIm_1c.toFixed(2),"} ) = ",xM0ReC.toFixed(2));  
             //console.log(size1, (i+2).toString().padStart(2),"--->", ((i+2)%size1 + w + size1).toString().padStart(2), ".re =", "[",i_c2.toString().padStart(2),"].re ",(sign1c<0)?"-":"+"," ([",i_c3.toString().padStart(2),"].re * t[",j1c.toString().padStart(2),"].re - [",i_c3.toString().padStart(2),"].im * t[",j1c.toString().padStart(2),"].im ) <-> ", "{",x2cRe.toFixed(2),"}",(sign1c<0)?"-":"+","({",x3cRe.toFixed(2),"} * t{",tRe_1c.toFixed(2),"} - {",x3cIm.toFixed(2),"} * {",tIm_1c.toFixed(2),"} ) = ",xM2ReC.toFixed(2));


             // size = 2     ||| size = 8
             ///////////////////////////////// i = 0
             // 01 <- 00 01  |||  03 <-  03  07
             // 03 <- 02 03  |||  11 <-  11  15
             ///////////////////////////////// i = 4
             // 05 <- 04 05  |||  07 <-  03  07
             // 07 <- 06 07  |||  15 <-  11  15
             ///////////////////////////////// i = 8
             // 09 <- 08 09  |||
             // 11 <- 10 11  |||
             ///////////////////////////////// i = 12
             // 13 <- 12 13  |||
             // 15 <- 14 15  |||
             //console.log(size1, (i+3).toString().padStart(2),"--->", ((i+3)%size1 + w).toString().padStart(2),         ".re =", "[",i_d0.toString().padStart(2),"].re ",(sign1d<0)?"-":"+"," ([",i_d1.toString().padStart(2),"].re * t[",j1d.toString().padStart(2),"].re - [",i_d1.toString().padStart(2),"].im * t[",j1d.toString().padStart(2),"].im ) <-> ", "{",x0dRe.toFixed(2),"}",(sign1d<0)?"-":"+","({",x1dRe.toFixed(2),"} * t{",tRe_1d.toFixed(2),"} - {",x1dIm.toFixed(2),"} * {",tIm_1d.toFixed(2),"} ) = ",xM1ReD.toFixed(2)); 
             //console.log(size1, (i+3).toString().padStart(2),"--->", ((i+3)%size1 + w + size1).toString().padStart(2), ".re =", "[",i_d2.toString().padStart(2),"].re ",(sign1d<0)?"-":"+"," ([",i_d3.toString().padStart(2),"].re * t[",j1d.toString().padStart(2),"].re - [",i_d3.toString().padStart(2),"].im * t[",j1d.toString().padStart(2),"].im ) <-> ", "{",x2dRe.toFixed(2),"}",(sign1d<0)?"-":"+","({",x3dRe.toFixed(2),"} * t{",tRe_1d.toFixed(2),"} - {",x3dIm.toFixed(2),"} * {",tIm_1d.toFixed(2),"} ) = ",xM3ReD.toFixed(2)); 
             

             out[(0+i)*2+0] = xM0ReA + ((xM2ReA)*tRe_2a - ((xM2ImA)*tIm_2a)) * sign2a;
             out[(0+i)*2+1] = xM0ImA + ((xM2ReA)*tIm_2a + ((xM2ImA)*tRe_2a)) * sign2a; 
             out[(1+i)*2+0] = xM1ReB + ((xM3ReB)*tRe_2b - ((xM3ImB)*tIm_2b)) * sign2b;
             out[(1+i)*2+1] = xM1ImB + ((xM3ReB)*tIm_2b + ((xM3ImB)*tRe_2b)) * sign2b; 
             out[(2+i)*2+0] = xM0ReC + ((xM2ReC)*tRe_2c - ((xM2ImC)*tIm_2c)) * sign2c;
             out[(2+i)*2+1] = xM0ImC + ((xM2ReC)*tIm_2c + ((xM2ImC)*tRe_2c)) * sign2c;
             out[(3+i)*2+0] = xM1ReD + ((xM3ReD)*tRe_2d - ((xM3ImD)*tIm_2d)) * sign2d;
             out[(3+i)*2+1] = xM1ImD + ((xM3ReD)*tIm_2d + ((xM3ImD)*tRe_2d)) * sign2d;

             
             //console.log(size2, (i+0).toString().padStart(2),"--->", xM0ReA.toFixed(2), (sign2a<0)?"-":"+","(",xM2ReA.toFixed(2),"*",tRe_2a.toFixed(2), j2a,"-",xM2ImA.toFixed(2),"*",tIm_2a.toFixed(2),") = ", out[(0+i)*2+0].toFixed(2));
             //console.log(size2, (i+1).toString().padStart(2),"--->", xM1ReB.toFixed(2), (sign2b<0)?"-":"+","(",xM3ReB.toFixed(2),"*",tRe_2b.toFixed(2), j2b,"-",xM3ImB.toFixed(2),"*",tIm_2b.toFixed(2),") = ", out[(1+i)*2+0].toFixed(2));
             //console.log(size2, (i+2).toString().padStart(2),"--->", xM0ReC.toFixed(2), (sign2c<0)?"-":"+","(",xM2ReC.toFixed(2),"*",tRe_2c.toFixed(2), j2c,"-",xM2ImC.toFixed(2),"*",tIm_2c.toFixed(2),") = ", out[(2+i)*2+0].toFixed(2));
             //console.log(size2, (i+3).toString().padStart(2),"--->", xM1ReD.toFixed(2), (sign2d<0)?"-":"+","(",xM3ReD.toFixed(2),"*",tRe_2d.toFixed(2), j2d,"-",xM3ImD.toFixed(2),"*",tIm_2d.toFixed(2),") = ", out[(3+i)*2+0].toFixed(2));



            //console.log( "-----------------------------" );
            if( (i) % (z) == 0 ){ s += z; }
            if( (i) % size2 == 0 ){  w += size2; } 
          }
        } 
        pre1 += (2 << 2*p) + (2 << 2*p+1);
        pre2 += (2 << 2*p+1) + (2 << 2*p+2);

        
        /*for(let i=0; i<N; i++){
             console.log("after size ",size2," : ",i," -> ", out[i*2], out[i*2+1]); 
        }*/

    }
    return out;
}

//  1  2| 3  4| 5  6
//------------------  
// 00 00 00 00 00 00
// 00 01 01 01 01 01
// 00 00 02 02 02 02
// 00 01 03 03 03 03
//------------------
// 00 00 00 04 04 04
// 00 01 01 05 05 05
// 00 00 02 06 06 06
// 00 01 03 07 07 07
//------------------
// 00 00 00 00 08 08
// 00 01 01 01 09 09
// 00 00 02 02 10 10
// 00 01 03 03 11 11
//------------------
// 00 00 00 04 12 12
// 00 01 01 05 13 13
// 00 00 02 06 14 14
// 00 01 03 07 15 15
//------------------
// 00 00 00 00 00 16
// 00 01 01 01 01 17
// 00 00 02 02 02 18
// 00 01 03 03 03 19
//------------------
// 00 00 00 04 04 20
// 00 01 01 05 05 21
// 00 00 02 06 06 22
// 00 01 03 07 07 23
//------------------
// 00 00 00 00 08 24
// 00 01 01 01 09 25
// 00 00 02 02 10 26
// 00 01 03 03 11 27
//------------------
// 00 00 00 04 12 28
// 00 01 01 05 13 29
// 00 00 02 06 14 30
// 00 01 03 07 15 31
//------------------


//----------     4     ----     16    ----     64    ----
//----------  Factor 1 ----  Factor 2 ----  Factor 3 ----
// 00 <- // 00 01 02 03 // 00 04 08 12 // 00 16 32 48 // 
// 01 <- // 00 01 02 03 // 01 05 09 13 // 01 17 33 49 //    
// 02 <- // 00 01 02 03 // 02 06 10 14 // 02 18 34 50 // 
// 03 <- // 00 01 02 03 // 03 07 11 15 // 03 19 35 51 // 
//-------------------------------------------------------
// 04 <- // 04 05 06 07 // 00 04 08 12 // 04 20 36 52 // 
// 05 <- // 04 05 06 07 // 01 05 09 13 // 05 21 37 53 // 
// 06 <- // 04 05 06 07 // 02 06 10 14 // 06 22 38 54 // 
// 07 <- // 04 05 06 07 // 03 07 11 15 // 07 23 39 55 // 
//-------------------------------------------------------
// 08 <- // 08 09 10 11 // 00 04 08 12 // 08 24 40 56 // 
// 09 <- // 08 09 10 11 // 01 05 09 13 // 09 25 41 57 // 
// 10 <- // 08 09 10 11 // 02 06 10 14 // 10 26 42 58 // 
// 11 <- // 08 09 10 11 // 03 07 11 15 // 11 27 43 59 // 
//-------------------------------------------------------
// 12 <- // 12 13 14 15 // 00 04 08 12 // 12 28 44 60 // 
// 13 <- // 12 13 14 15 // 01 05 09 13 // 13 29 45 61 // 
// 14 <- // 12 13 14 15 // 02 06 10 14 // 14 30 46 62 // 
// 15 <- // 12 13 14 15 // 03 07 11 15 // 15 31 47 63 // 
//----------  Factor 1 ----  Factor 2 ----  Factor 3 ----
// 16 <- // 16 17 18 19 // 16 20 24 28 // 00 16 32 48 //
// 17 <- // 16 17 18 19 // 17 21 25 29 // 01 17 33 49 // 
// 18 <- // 16 17 18 19 // 18 22 26 30 // 02 18 34 50 // 
// 19 <- // 16 17 18 19 // 19 23 27 31 // 03 19 35 51 // 
//-------------------------------------------------------
// 20 <- // 20 21 22 23 // 16 20 24 28 // 04 20 36 52 // 
// 21 <- // 20 21 22 23 // 17 21 25 29 // 05 21 37 53 // 
// 22 <- // 20 21 22 23 // 18 22 26 30 // 06 22 38 54 // 
// 23 <- // 20 21 22 23 // 19 23 27 31 // 07 23 39 55 // 
//-------------------------------------------------------
// 24 <- // 24 25 26 27 // 16 20 24 28 // 08 24 40 56 // 
// 25 <- // 24 25 26 27 // 17 21 25 29 // 09 25 41 57 // 
// 26 <- // 24 25 26 27 // 18 22 26 30 // 10 26 42 58 // 
// 27 <- // 24 25 26 27 // 19 23 27 31 // 11 27 43 59 // 
//-------------------------------------------------------
// 28 <- // 28 29 30 31 // 16 20 24 28 // 12 28 44 60 // 
// 29 <- // 28 29 30 31 // 17 21 25 29 // 13 29 45 61 // 
// 30 <- // 28 29 30 31 // 18 22 26 30 // 14 30 46 62 // 
// 31 <- // 28 29 30 31 // 19 23 27 31 // 15 31 47 63 // 
//----------  Factor 1 ----  Factor 2 ----  Factor 3 ----
// 32 <- // 32 33 34 35 // 32 36 40 44 // 00 16 32 48 // 
// 33 <- // 32 33 34 35 // 33 37 41 45 // 01 17 33 49 // 
// 34 <- // 32 33 34 35 // 34 38 42 46 // 02 18 34 50 // 
// 35 <- // 32 33 34 35 // 35 39 43 47 // 03 19 35 51 // 
//-------------------------------------------------------
// 36 <- // 36 37 38 39 // 32 36 40 44 // 04 20 36 52 // 
// 37 <- // 36 37 38 39 // 33 37 41 45 // 05 21 37 53 // 
// 38 <- // 36 37 38 39 // 34 38 42 46 // 06 22 38 54 // 
// 39 <- // 36 37 38 39 // 35 39 43 47 // 07 23 39 55 // 
//-------------------------------------------------------
// 40 <- // 40 41 42 43 // 32 36 40 44 // 08 24 40 56 // 
// 41 <- // 40 41 42 43 // 33 37 41 45 // 09 25 41 57 // 
// 42 <- // 40 41 42 43 // 34 38 42 46 // 10 26 42 58 // 
// 43 <- // 40 41 42 43 // 35 39 43 47 // 11 27 43 59 // 
//-------------------------------------------------------
// 44 <- // 44 45 46 47 // 32 36 40 44 // 12 28 44 60 // 
// 45 <- // 44 45 46 47 // 33 37 41 45 // 13 29 45 61 // 
// 46 <- // 44 45 46 47 // 34 38 42 46 // 14 30 46 62 // 
// 47 <- // 44 45 46 47 // 35 39 43 47 // 15 31 47 63 // 
//----------  Factor 1 ----  Factor 2 ----  Factor 3 ----
// 48 <- // 48 49 50 51 // 48 52 56 60 // 00 16 32 48 //  
// 49 <- // 48 49 50 51 // 49 53 57 61 // 01 17 33 49 // 
// 50 <- // 48 49 50 51 // 50 54 58 62 // 02 18 34 50 // 
// 51 <- // 48 49 50 51 // 51 55 59 63 // 03 19 35 51 //
//-------------------------------------------------------
// 52 <- // 52 53 54 55 // 48 52 56 60 // 04 20 36 52 // 
// 53 <- // 52 53 54 55 // 49 53 57 61 // 05 21 37 53 // 
// 54 <- // 52 53 54 55 // 50 54 58 62 // 06 22 38 54 // 
// 55 <- // 52 53 54 55 // 51 55 59 63 // 07 23 39 55 // 
//-------------------------------------------------------
// 56 <- // 56 57 58 59 // 48 52 56 60 // 08 24 40 56 // 
// 57 <- // 56 57 58 59 // 49 53 57 61 // 09 25 41 57 // 
// 58 <- // 56 57 58 59 // 50 54 58 62 // 10 26 42 58 // 
// 59 <- // 56 57 58 59 // 51 55 59 63 // 11 27 43 59 // 
//-------------------------------------------------------
// 60 <- // 60 61 62 63 // 48 52 56 60 // 12 28 44 60 // 
// 61 <- // 60 61 62 63 // 49 53 57 61 // 13 29 45 61 // 
// 62 <- // 60 61 62 63 // 50 54 58 62 // 14 30 46 62 // 
// 63 <- // 60 61 62 63 // 51 55 59 63 // 15 31 47 63 // 
//-------------------------------------------------------









// loop len per N
// N=2  -> (2 * 2)  = 4
// N=4  -> (3 * 4)  = 12
// N=8  -> (4 * 8)  = 32
// N=16 -> (5 * 16) = 80
// N=32 -> (6 * 32) = 192
// N=64 -> (7 * 64) = 448

//2 + 4 + 8 + 16 + 32 + 64 + 128 + 256
//(array accesses = i++ jumps)

// Iterations for N = 64
// 448 (loop len) /   2 (twiddles) =  224  -- Array Accesses:   2    <- power 1 structure --  (2*1) =    2 twiddles per iteration
// 448 (loop len) /   8 (twiddles) = ~     -- Array Accesses:   4    <- power 2 structure --  (4*2) =    8 twiddles per iteration
// 448 (loop len) /  24 (twiddles) = ~     -- Array Accesses:   8    <- power 3 structure --  (8*3) =   24 twiddles per iteration 
// 448 (loop len) /  64 (twiddles) = ~     -- Array Accesses:  16    <- power 4 structure -- (16*4) =   64 twiddles per iteration
// 448 (loop len) / 160 (twiddles) = ~     -- Array Accesses:  32    <- power 5 structure -- (32*5) =  160 twiddles per iteration 
// 448 (loop len) / 384 (twiddles) = ~     -- Array Accesses:  64    <- power 6 structure -- (64*6) =  384 twiddles per iteration 
// 448 (loop len) / 896 (twiddles) = ~     -- Array Accesses: 128    <- power 7 structure --(128*7) =  896 twiddles per iteration 
// 448 (loop len) /2048 (twiddles) = ~     -- Array Accesses: 256    <- power 8 structure --(256*8) = 2048 twiddles per iteration 

// Array Accesses PER Twiddles for N = 64    (Must be as low as possible for Efficency)

// ps 1 -> 2   /    2   =  1
// ps 2 -> 4   /    8   =  1/2
// ps 3 -> 8   /   24   =  1/3
// ps 4 -> 16  /   64   =  1/4
// ps 5 -> 32  /  160   =  1/5
// ps 6 -> 64  /  384   =  1/6
// ps 7 -> 128 /  896   =  1/7
// ps 8 -> 256 / 2048   =  1/8



// Power 3 -> 
// Power 4 ->
// Power 5 -> 3800 
// Power 6 -> 4600
// Power 7 -> 4000


function eff_p(){
   const max_p = 8;
   console.log("Efficiency For Powers"); 
   for(let p = 1; p<=max_p; p++){
        const accesses_per_it = (2<<(p-1));
        const t_per_it = (2<<(p-1)) * p;
        const ratio =  accesses_per_it / t_per_it;
        console.log("ps ",p,": Access Rate ->",ratio.toFixed(2), 
            "\tTwiddle Declarations ->",t_per_it,
            "\tTwiddlelizers per Iteration ->",t_per_it/2,
            "\tTwiddles per Iteration ->", t_per_it,
            "\tAccesses per Iteration ->", accesses_per_it
        );
   }
}

function eff(N){
   const max_p = 8;
   let sum = 0;
   let bits = Math.log2(N);

   let looplen = (N>>1)*bits;
   console.log("Efficiency For N=",N); 
   for(let p = 1; p<=max_p; p++){
        const accesses_per_it = (2<<(p-1));
        const t_per_it = (2<<(p-1)) * p;
        const iterations = looplen * 2 / (t_per_it);  
        const accesses = accesses_per_it * looplen * 2 / (t_per_it);
        const twiddles = t_per_it * looplen * 2 / (t_per_it);
        const twiddlelizers = twiddles / 2;
        const ratio =  accesses_per_it / t_per_it;
        console.log("ps ",p,": Iterations ->",iterations.toFixed(0),
            "\tTotal Twiddelizers ->",twiddlelizers.toFixed(0),
            "\tTotal Accesses ->",accesses.toFixed(0),
            "\t\tTotal Accesses (without Recycling) ->", twiddles.toFixed(0)
        );
   }
}

/*
eff_p();
eff(512);
eff(1024);
eff(2048);
*/

function fftComplexInPlace_flexi(out) {
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
        //  ev  j odd          ev  j odd     
        // _0   0   1          0   0   2     
        // (2)  0   3         _(1) 1   3     
        //    
        // _block = 2         _block = 4    
        // max_bn =4/2        max_bn =4/4   


        //  For N = 8, the indices must look like this after each iteration
        //  
        //  power = 1          power = 2         power = 3       
        //  size = 2           size = 4          size = 8
        //  half = 1           half = 2          half = 4
        //  ev  j odd          ev  j odd         ev  j odd
        // _0   0   1          0   0   2         0   0   4
        //  2   0   3         _1   1   3         1   1   5
        // (4)  0   5         (4)  0   6        (2)  2   6
        //  6   0   7          5   1   7        _3   3   7
        //    
        // _block = 2         _block = 4         _block = 8      
        // max_bn =8/2        max_bn =8/4        max_bn =8/2


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
let map = bitReversalMap1024.get(1024);
const N = 1024;
const bits = 10;
const inputBR = new Float64Array(N);
const complexOut = new Float64Array(N * 2);
function fftRealInPlaceRADIX4(realInput) {
    //const N = realInput.length;
    //const bits = Math.log2(N);
    
    if (N !== nextPowerOf2(N)) {
        console.error("FFT FRAME must have power of 2");
        return;
    }
    
    // Create a copy of the input array
    const input = realInput.slice();
    
    /*
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
    */

    // Perform bit reversal
    //const inputBR = new Float64Array(N);
    for (let i = 0; i < N; i++) {
        inputBR[i] = input[map[i]];
    }

    // Convert the real-valued input to a complex-valued Float32Array
    //const complexOut = new Float64Array(N * 2);
    for (let i = 0; i < N; i++) {
        complexOut[i * 2] = inputBR[i];
        complexOut[i * 2 + 1] = 0; // Imaginary part is set to 0
    }

    //return fftComplexInPlace_radix2(complexOut);
    //return fftComplexInPlace_flexi(complexOut);
    return fftComplexInPlace_seq_4(complexOut);
    //if(type == 5){ return fftComplexInPlace_seq_5(complexOut); }
    //if(type == 6){ return fftComplexInPlace_seq_6(complexOut); }
    //if(type == 7){ return fftComplexInPlace_seq_7(complexOut); }
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

    return new Float64Array(factors);
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
    const out = new Float64Array(N * 2);
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

    /*for(let i=0; i<16; i++){
        console.log("INIT:",i," -> ", out[i*2], out[i*2+1]); 
    }*/
    // Recursively calculate FFT
    for (let size = 2; size <= N; size *= 2) {
        if(size > 128){ break; }
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

                //if(size==2||size==8){ console.log(evenIndex, ".re =", "[",evenIndex,"].re + ([",oddIndex,"].re * t[",j,"].re - [",oddIndex,"].im * t[",j,"].im ) <-> ", "{",eRe.toFixed(2),"} + ({",oRe.toFixed(2),"} * t{",twiddleRe.toFixed(2),"} - {",oIm.toFixed(2),"} * {",twiddleIm.toFixed(2),"} ) = ",out[evenIndex * 2].toFixed(2)); }
                //if(size==2||size==8){ console.log(oddIndex,  ".re =", "[",evenIndex,"].re - ([",oddIndex,"].re * t[",j,"].re - [",oddIndex,"].im * t[",j,"].im ) <-> ", "{",eRe.toFixed(2),"} - ({",oRe.toFixed(2),"} * t{",twiddleRe.toFixed(2),"} - {",oIm.toFixed(2),"} * {",twiddleIm.toFixed(2),"} ) = ",out[oddIndex * 2].toFixed(2)); }
                //if(size==128){ console.log(evenIndex, ".re =", "[",evenIndex,"].re + ([",oddIndex,"].re * t[",j,"].re - [",oddIndex,"].im * t[",j,"].im ) <-> ", "{",eRe.toFixed(2),"} + ({",oRe.toFixed(2),"} * t{",twiddleRe.toFixed(2),"} - {",oIm.toFixed(2),"} * {",twiddleIm.toFixed(2),"} ) = ",out[evenIndex * 2].toFixed(2)); }
                //if(size==128){ console.log(oddIndex,  ".re =", "[",evenIndex,"].re - ([",oddIndex,"].re * t[",j,"].re - [",oddIndex,"].im * t[",j,"].im ) <-> ", "{",eRe.toFixed(2),"} - ({",oRe.toFixed(2),"} * t{",twiddleRe.toFixed(2),"} - {",oIm.toFixed(2),"} * {",twiddleIm.toFixed(2),"} ) = ",out[oddIndex * 2].toFixed(2)); }

            }
        }
        /*if(size==128){ 
            for(let i=0; i<N; i++){
                console.log("after size: ",size," : ",i," -> ", out[i*2], out[i*2+1]); 
            }
        }*/
        //console.log("size:"+size, output);
        //console.log("size:"+size, js);
        //js = [];
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

    const paddedInput = new Float64Array(FFT_SIZE).fill(0);
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
const numOperations = 20000; // You can adjust this number based on your requirements

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
    if(fftSize ==  256){ testData = testData256; }
    if(fftSize ==  512){ testData = testData512; } 
    if(fftSize == 1024){ testData = testData1024; } 
    if(fftSize == 2048){ testData = testData2048; } 
    if(fftSize == 4096){ testData = testData4096; } 

    // Perform FFT operations numOperations times
    for (let i = 0; i < numOperations; i++) {
        //fftRealInPlace_ref(testData);
        fftRealInPlaceRADIX4(testData);
    }

};

// Measure the time taken to perform FFT operations
const measureTime = (fftSize,type) => {
    const startTime = performance.now(); // Start time
    performFFTOperations(fftSize,type); // Perform FFT operations
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

measureTime(1024);
measureTime(1024);
measureTime(1024);
measureTime(1024);
measureTime(1024);
//measureTime(512,5);
//measureTime(512,6);
//measureTime(512,7);
//measureTime(1024);
//measureTime(2048);
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
const signal5 = [ 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1, 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1, 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1, 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1 ];


console.log("1024:  ",compareFFTResults(fftRealInPlace_ref(testData1024),fftRealInPlaceRADIX4(testData1024)));

/*
console.log(signal1);
console.log(computeInverseFFT(computeFFT(signal1)));
console.log(signal2);
console.log(computeInverseFFT(computeFFT(signal2)));
console.log(signal3);
console.log(computeInverseFFT(computeFFT(signal3)));
*/

//console.log(computeFFT(signal1));


//console.log(fftRealInPlace_ref(testData256));
console.log(fftRealInPlaceRADIX4(testData1024));



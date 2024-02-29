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

function fftComplexInPlace_seq_4(out) {
    const N = out.length/2;
    const bits = Math.log2(N);

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


    let its = 0, accs = 0;

    let tRe1, tIm1, eReI1, eImI1, oReI1, oImI1;
    let tRe2, tIm2, eReI2, eImI2, oReI2, oImI2;
    let tRe3, tIm3, eReI3, eImI3, oReI3, oImI3;
    let tRe4, tIm4, eReI4, eImI4, oReI4, oImI4;
    let tRe5, tIm5, eReI5, eImI5, oReI5, oImI5;
    let tRe6, tIm6, eReI6, eImI6, oReI6, oImI6;
    let tRe7, tIm7, eReI7, eImI7, oReI7, oImI7;
    let tRe8, tIm8, eReI8, eImI8, oReI8, oImI8;
    let tRe001_1,tIm001_1,tRe002_1,tIm002_1,tRe003_1,tIm003_1,tRe004_1,tIm004_1,tRe005_1,tIm005_1,tRe006_1,tIm006_1,tRe007_1,tIm007_1,tRe008_1,tIm008_1,tRe009_1,tIm009_1,tRe010_1,tIm010_1,tRe011_1,tIm011_1,tRe012_1,tIm012_1,tRe013_1,tIm013_1,tRe014_1,tIm014_1,tRe015_1,tIm015_1,tRe016_1,tIm016_1; 
    let tRe001_2,tIm001_2,tRe002_2,tIm002_2,tRe003_2,tIm003_2,tRe004_2,tIm004_2,tRe005_2,tIm005_2,tRe006_2,tIm006_2,tRe007_2,tIm007_2,tRe008_2,tIm008_2,tRe009_2,tIm009_2,tRe010_2,tIm010_2,tRe011_2,tIm011_2,tRe012_2,tIm012_2,tRe013_2,tIm013_2,tRe014_2,tIm014_2,tRe015_2,tIm015_2,tRe016_2,tIm016_2; 
    let tRe001_3,tIm001_3,tRe002_3,tIm002_3,tRe003_3,tIm003_3,tRe004_3,tIm004_3,tRe005_3,tIm005_3,tRe006_3,tIm006_3,tRe007_3,tIm007_3,tRe008_3,tIm008_3,tRe009_3,tIm009_3,tRe010_3,tIm010_3,tRe011_3,tIm011_3,tRe012_3,tIm012_3,tRe013_3,tIm013_3,tRe014_3,tIm014_3,tRe015_3,tIm015_3,tRe016_3,tIm016_3; 
    let tRe001_4,tIm001_4,tRe002_4,tIm002_4,tRe003_4,tIm003_4,tRe004_4,tIm004_4,tRe005_4,tIm005_4,tRe006_4,tIm006_4,tRe007_4,tIm007_4,tRe008_4,tIm008_4,tRe009_4,tIm009_4,tRe010_4,tIm010_4,tRe011_4,tIm011_4,tRe012_4,tIm012_4,tRe013_4,tIm013_4,tRe014_4,tIm014_4,tRe015_4,tIm015_4,tRe016_4,tIm016_4; 
    let tRe001_5,tIm001_5,tRe002_5,tIm002_5,tRe003_5,tIm003_5,tRe004_5,tIm004_5,tRe005_5,tIm005_5,tRe006_5,tIm006_5,tRe007_5,tIm007_5,tRe008_5,tIm008_5,tRe009_5,tIm009_5,tRe010_5,tIm010_5,tRe011_5,tIm011_5,tRe012_5,tIm012_5,tRe013_5,tIm013_5,tRe014_5,tIm014_5,tRe015_5,tIm015_5,tRe016_5,tIm016_5; 


    while(i < (N>>1)*bits){
        its++; accs+=32;
        tRe001_1=____F[i];tIm001_1=____F[i];tRe001_2=tRe001_2;tIm001_2=tIm001_2;tRe001_3=tRe001_3;tIm001_3=tIm001_3;tRe001_4=tRe001_4;tIm001_4=tIm001_4;tRe001_5=tRe001_5;tIm001_5=tIm001_5;
        tRe002_1=tRe002_1;tIm002_1=tIm002_1;tRe002_2=____F[i];tIm002_2=____F[i];tRe002_3=tRe002_3;tIm002_3=tIm002_3;tRe002_4=tRe002_4;tIm002_4=tIm002_4;tRe002_5=tRe002_5;tIm002_5=tIm002_5;
        tRe003_1=tRe003_1;tIm003_1=tIm003_1;tRe003_2=tRe003_2;tIm003_2=tIm003_2;tRe003_3=____F[i];tIm003_3=____F[i];tRe003_4=tRe003_4;tIm003_4=tIm003_4;tRe003_5=tRe003_5;tIm003_5=tIm003_5;
        tRe004_1=tRe004_1;tIm004_1=tIm004_1;tRe004_2=tRe004_2;tIm004_2=tIm004_2;tRe004_3=____F[i];tIm004_3=____F[i];tRe004_4=tRe004_4;tIm004_4=tIm004_4;tRe004_5=tRe004_5;tIm004_5=tIm004_5;
        tRe005_1=tRe005_1;tIm005_1=tIm005_1;tRe005_2=tRe005_2;tIm005_2=tIm005_2;tRe005_3=tRe005_3;tIm005_3=tIm005_3;tRe005_4=____F[i];tIm005_4=____F[i];tRe005_5=tRe005_5;tIm005_5=tIm005_5;
        tRe006_1=tRe006_1;tIm006_1=tIm006_1;tRe006_2=tRe006_2;tIm006_2=tIm006_2;tRe006_3=tRe006_3;tIm006_3=tIm006_3;tRe006_4=____F[i];tIm006_4=____F[i];tRe006_5=tRe006_5;tIm006_5=tIm006_5;
        tRe007_1=tRe007_1;tIm007_1=tIm007_1;tRe007_2=tRe007_2;tIm007_2=tIm007_2;tRe007_3=tRe007_3;tIm007_3=tIm007_3;tRe007_4=____F[i];tIm007_4=____F[i];tRe007_5=tRe007_5;tIm007_5=tIm007_5;
        tRe008_1=tRe008_1;tIm008_1=tIm008_1;tRe008_2=tRe008_2;tIm008_2=tIm008_2;tRe008_3=tRe008_3;tIm008_3=tIm008_3;tRe008_4=____F[i];tIm008_4=____F[i];tRe008_5=tRe008_5;tIm008_5=tIm008_5;
        tRe009_1=tRe009_1;tIm009_1=tIm009_1;tRe009_2=tRe009_2;tIm009_2=tIm009_2;tRe009_3=tRe009_3;tIm009_3=tIm009_3;tRe009_4=tRe009_4;tIm009_4=tIm009_4;tRe009_5=____F[i];tIm009_5=____F[i];
        tRe010_1=tRe010_1;tIm010_1=tIm010_1;tRe010_2=tRe010_2;tIm010_2=tIm010_2;tRe010_3=tRe010_3;tIm010_3=tIm010_3;tRe010_4=tRe010_4;tIm010_4=tIm010_4;tRe010_5=____F[i];tIm010_5=____F[i];
        tRe011_1=tRe011_1;tIm011_1=tIm011_1;tRe011_2=tRe011_2;tIm011_2=tIm011_2;tRe011_3=tRe011_3;tIm011_3=tIm011_3;tRe011_4=tRe011_4;tIm011_4=tIm011_4;tRe011_5=____F[i];tIm011_5=____F[i];
        tRe012_1=tRe012_1;tIm012_1=tIm012_1;tRe012_2=tRe012_2;tIm012_2=tIm012_2;tRe012_3=tRe012_3;tIm012_3=tIm012_3;tRe012_4=tRe012_4;tIm012_4=tIm012_4;tRe012_5=____F[i];tIm012_5=____F[i];
        tRe013_1=tRe013_1;tIm013_1=tIm013_1;tRe013_2=tRe013_2;tIm013_2=tIm013_2;tRe013_3=tRe013_3;tIm013_3=tIm013_3;tRe013_4=tRe013_4;tIm013_4=tIm013_4;tRe013_5=____F[i];tIm013_5=____F[i];
        tRe014_1=tRe014_1;tIm014_1=tIm014_1;tRe014_2=tRe014_2;tIm014_2=tIm014_2;tRe014_3=tRe014_3;tIm014_3=tIm014_3;tRe014_4=tRe014_4;tIm014_4=tIm014_4;tRe014_5=____F[i];tIm014_5=____F[i];
        tRe015_1=tRe015_1;tIm015_1=tIm015_1;tRe015_2=tRe015_2;tIm015_2=tIm015_2;tRe015_3=tRe015_3;tIm015_3=tIm015_3;tRe015_4=tRe015_4;tIm015_4=tIm015_4;tRe015_5=____F[i];tIm015_5=____F[i];
        tRe016_1=tRe016_1;tIm016_1=tIm016_1;tRe016_2=tRe016_2;tIm016_2=tIm016_2;tRe016_3=tRe016_3;tIm016_3=tIm016_3;tRe016_4=tRe016_4;tIm016_4=tIm016_4;tRe016_5=____F[i];tIm016_5=____F[i];
        

        i+=160;

        // Power 1
        twiddlelizer(out, tRe001_1,tIm001_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_1,tIm002_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_1,tIm003_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_1,tIm004_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_1,tIm005_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_1,tIm006_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_1,tIm007_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_1,tIm008_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_1,tIm009_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_1,tIm010_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_1,tIm011_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_1,tIm012_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_1,tIm013_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_1,tIm014_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_1,tIm015_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_1,tIm016_1, eReI1, eImI1, oReI1, oImI1);

        // Power 2
        twiddlelizer(out, tRe001_2,tIm001_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_2,tIm002_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_2,tIm003_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_2,tIm004_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_2,tIm005_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_2,tIm006_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_2,tIm007_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_2,tIm008_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_2,tIm009_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_2,tIm010_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_2,tIm011_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_2,tIm012_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_2,tIm013_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_2,tIm014_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_2,tIm015_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_2,tIm016_2, eReI1, eImI1, oReI1, oImI1);

        // Power 3
        twiddlelizer(out, tRe001_3,tIm001_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_3,tIm002_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_3,tIm003_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_3,tIm004_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_3,tIm005_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_3,tIm006_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_3,tIm007_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_3,tIm008_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_3,tIm009_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_3,tIm010_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_3,tIm011_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_3,tIm012_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_3,tIm013_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_3,tIm014_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_3,tIm015_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_3,tIm016_3, eReI1, eImI1, oReI1, oImI1);

        // Power 4
        twiddlelizer(out, tRe001_4,tIm001_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_4,tIm002_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_4,tIm003_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_4,tIm004_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_4,tIm005_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_4,tIm006_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_4,tIm007_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_4,tIm008_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_4,tIm009_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_4,tIm010_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_4,tIm011_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_4,tIm012_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_4,tIm013_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_4,tIm014_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_4,tIm015_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_4,tIm016_4, eReI1, eImI1, oReI1, oImI1);

        // Power 5
        twiddlelizer(out, tRe001_5,tIm001_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_5,tIm002_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_5,tIm003_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_5,tIm004_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_5,tIm005_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_5,tIm006_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_5,tIm007_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_5,tIm008_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_5,tIm009_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_5,tIm010_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_5,tIm011_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_5,tIm012_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_5,tIm013_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_5,tIm014_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_5,tIm015_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_5,tIm016_5, eReI1, eImI1, oReI1, oImI1);

    }
    console.log("Iterations: ",its,"\tAccesses",accs);

    return out;
}

function fftComplexInPlace_seq_5(out) {
    const N = out.length/2;
    const bits = Math.log2(N);

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


    let its = 0, accs = 0;

    let tRe1, tIm1, eReI1, eImI1, oReI1, oImI1;
    let tRe2, tIm2, eReI2, eImI2, oReI2, oImI2;
    let tRe3, tIm3, eReI3, eImI3, oReI3, oImI3;
    let tRe4, tIm4, eReI4, eImI4, oReI4, oImI4;
    let tRe5, tIm5, eReI5, eImI5, oReI5, oImI5;
    let tRe6, tIm6, eReI6, eImI6, oReI6, oImI6;
    let tRe7, tIm7, eReI7, eImI7, oReI7, oImI7;
    let tRe8, tIm8, eReI8, eImI8, oReI8, oImI8;
    let tRe001_1,tIm001_1,tRe002_1,tIm002_1,tRe003_1,tIm003_1,tRe004_1,tIm004_1,tRe005_1,tIm005_1,tRe006_1,tIm006_1,tRe007_1,tIm007_1,tRe008_1,tIm008_1,tRe009_1,tIm009_1,tRe010_1,tIm010_1,tRe011_1,tIm011_1,tRe012_1,tIm012_1,tRe013_1,tIm013_1,tRe014_1,tIm014_1,tRe015_1,tIm015_1,tRe016_1,tIm016_1; 
    let tRe001_2,tIm001_2,tRe002_2,tIm002_2,tRe003_2,tIm003_2,tRe004_2,tIm004_2,tRe005_2,tIm005_2,tRe006_2,tIm006_2,tRe007_2,tIm007_2,tRe008_2,tIm008_2,tRe009_2,tIm009_2,tRe010_2,tIm010_2,tRe011_2,tIm011_2,tRe012_2,tIm012_2,tRe013_2,tIm013_2,tRe014_2,tIm014_2,tRe015_2,tIm015_2,tRe016_2,tIm016_2; 
    let tRe001_3,tIm001_3,tRe002_3,tIm002_3,tRe003_3,tIm003_3,tRe004_3,tIm004_3,tRe005_3,tIm005_3,tRe006_3,tIm006_3,tRe007_3,tIm007_3,tRe008_3,tIm008_3,tRe009_3,tIm009_3,tRe010_3,tIm010_3,tRe011_3,tIm011_3,tRe012_3,tIm012_3,tRe013_3,tIm013_3,tRe014_3,tIm014_3,tRe015_3,tIm015_3,tRe016_3,tIm016_3; 
    let tRe001_4,tIm001_4,tRe002_4,tIm002_4,tRe003_4,tIm003_4,tRe004_4,tIm004_4,tRe005_4,tIm005_4,tRe006_4,tIm006_4,tRe007_4,tIm007_4,tRe008_4,tIm008_4,tRe009_4,tIm009_4,tRe010_4,tIm010_4,tRe011_4,tIm011_4,tRe012_4,tIm012_4,tRe013_4,tIm013_4,tRe014_4,tIm014_4,tRe015_4,tIm015_4,tRe016_4,tIm016_4; 
    let tRe001_5,tIm001_5,tRe002_5,tIm002_5,tRe003_5,tIm003_5,tRe004_5,tIm004_5,tRe005_5,tIm005_5,tRe006_5,tIm006_5,tRe007_5,tIm007_5,tRe008_5,tIm008_5,tRe009_5,tIm009_5,tRe010_5,tIm010_5,tRe011_5,tIm011_5,tRe012_5,tIm012_5,tRe013_5,tIm013_5,tRe014_5,tIm014_5,tRe015_5,tIm015_5,tRe016_5,tIm016_5; 


    while(i < (N>>1)*bits){
        its++; accs+=32;
        tRe001_1=____F[i];tIm001_1=____F[i];tRe001_2=tRe001_2;tIm001_2=tIm001_2;tRe001_3=tRe001_3;tIm001_3=tIm001_3;tRe001_4=tRe001_4;tIm001_4=tIm001_4;tRe001_5=tRe001_5;tIm001_5=tIm001_5;
        tRe002_1=tRe002_1;tIm002_1=tIm002_1;tRe002_2=____F[i];tIm002_2=____F[i];tRe002_3=tRe002_3;tIm002_3=tIm002_3;tRe002_4=tRe002_4;tIm002_4=tIm002_4;tRe002_5=tRe002_5;tIm002_5=tIm002_5;
        tRe003_1=tRe003_1;tIm003_1=tIm003_1;tRe003_2=tRe003_2;tIm003_2=tIm003_2;tRe003_3=____F[i];tIm003_3=____F[i];tRe003_4=tRe003_4;tIm003_4=tIm003_4;tRe003_5=tRe003_5;tIm003_5=tIm003_5;
        tRe004_1=tRe004_1;tIm004_1=tIm004_1;tRe004_2=tRe004_2;tIm004_2=tIm004_2;tRe004_3=____F[i];tIm004_3=____F[i];tRe004_4=tRe004_4;tIm004_4=tIm004_4;tRe004_5=tRe004_5;tIm004_5=tIm004_5;
        tRe005_1=tRe005_1;tIm005_1=tIm005_1;tRe005_2=tRe005_2;tIm005_2=tIm005_2;tRe005_3=tRe005_3;tIm005_3=tIm005_3;tRe005_4=____F[i];tIm005_4=____F[i];tRe005_5=tRe005_5;tIm005_5=tIm005_5;
        tRe006_1=tRe006_1;tIm006_1=tIm006_1;tRe006_2=tRe006_2;tIm006_2=tIm006_2;tRe006_3=tRe006_3;tIm006_3=tIm006_3;tRe006_4=____F[i];tIm006_4=____F[i];tRe006_5=tRe006_5;tIm006_5=tIm006_5;
        tRe007_1=tRe007_1;tIm007_1=tIm007_1;tRe007_2=tRe007_2;tIm007_2=tIm007_2;tRe007_3=tRe007_3;tIm007_3=tIm007_3;tRe007_4=____F[i];tIm007_4=____F[i];tRe007_5=tRe007_5;tIm007_5=tIm007_5;
        tRe008_1=tRe008_1;tIm008_1=tIm008_1;tRe008_2=tRe008_2;tIm008_2=tIm008_2;tRe008_3=tRe008_3;tIm008_3=tIm008_3;tRe008_4=____F[i];tIm008_4=____F[i];tRe008_5=tRe008_5;tIm008_5=tIm008_5;
        tRe009_1=tRe009_1;tIm009_1=tIm009_1;tRe009_2=tRe009_2;tIm009_2=tIm009_2;tRe009_3=tRe009_3;tIm009_3=tIm009_3;tRe009_4=tRe009_4;tIm009_4=tIm009_4;tRe009_5=____F[i];tIm009_5=____F[i];
        tRe010_1=tRe010_1;tIm010_1=tIm010_1;tRe010_2=tRe010_2;tIm010_2=tIm010_2;tRe010_3=tRe010_3;tIm010_3=tIm010_3;tRe010_4=tRe010_4;tIm010_4=tIm010_4;tRe010_5=____F[i];tIm010_5=____F[i];
        tRe011_1=tRe011_1;tIm011_1=tIm011_1;tRe011_2=tRe011_2;tIm011_2=tIm011_2;tRe011_3=tRe011_3;tIm011_3=tIm011_3;tRe011_4=tRe011_4;tIm011_4=tIm011_4;tRe011_5=____F[i];tIm011_5=____F[i];
        tRe012_1=tRe012_1;tIm012_1=tIm012_1;tRe012_2=tRe012_2;tIm012_2=tIm012_2;tRe012_3=tRe012_3;tIm012_3=tIm012_3;tRe012_4=tRe012_4;tIm012_4=tIm012_4;tRe012_5=____F[i];tIm012_5=____F[i];
        tRe013_1=tRe013_1;tIm013_1=tIm013_1;tRe013_2=tRe013_2;tIm013_2=tIm013_2;tRe013_3=tRe013_3;tIm013_3=tIm013_3;tRe013_4=tRe013_4;tIm013_4=tIm013_4;tRe013_5=____F[i];tIm013_5=____F[i];
        tRe014_1=tRe014_1;tIm014_1=tIm014_1;tRe014_2=tRe014_2;tIm014_2=tIm014_2;tRe014_3=tRe014_3;tIm014_3=tIm014_3;tRe014_4=tRe014_4;tIm014_4=tIm014_4;tRe014_5=____F[i];tIm014_5=____F[i];
        tRe015_1=tRe015_1;tIm015_1=tIm015_1;tRe015_2=tRe015_2;tIm015_2=tIm015_2;tRe015_3=tRe015_3;tIm015_3=tIm015_3;tRe015_4=tRe015_4;tIm015_4=tIm015_4;tRe015_5=____F[i];tIm015_5=____F[i];
        tRe016_1=tRe016_1;tIm016_1=tIm016_1;tRe016_2=tRe016_2;tIm016_2=tIm016_2;tRe016_3=tRe016_3;tIm016_3=tIm016_3;tRe016_4=tRe016_4;tIm016_4=tIm016_4;tRe016_5=____F[i];tIm016_5=____F[i];
        

        i+=160;

        // Power 1
        twiddlelizer(out, tRe001_1,tIm001_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_1,tIm002_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_1,tIm003_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_1,tIm004_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_1,tIm005_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_1,tIm006_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_1,tIm007_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_1,tIm008_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_1,tIm009_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_1,tIm010_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_1,tIm011_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_1,tIm012_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_1,tIm013_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_1,tIm014_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_1,tIm015_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_1,tIm016_1, eReI1, eImI1, oReI1, oImI1);

        // Power 2
        twiddlelizer(out, tRe001_2,tIm001_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_2,tIm002_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_2,tIm003_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_2,tIm004_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_2,tIm005_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_2,tIm006_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_2,tIm007_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_2,tIm008_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_2,tIm009_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_2,tIm010_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_2,tIm011_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_2,tIm012_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_2,tIm013_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_2,tIm014_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_2,tIm015_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_2,tIm016_2, eReI1, eImI1, oReI1, oImI1);

        // Power 3
        twiddlelizer(out, tRe001_3,tIm001_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_3,tIm002_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_3,tIm003_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_3,tIm004_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_3,tIm005_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_3,tIm006_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_3,tIm007_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_3,tIm008_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_3,tIm009_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_3,tIm010_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_3,tIm011_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_3,tIm012_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_3,tIm013_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_3,tIm014_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_3,tIm015_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_3,tIm016_3, eReI1, eImI1, oReI1, oImI1);

        // Power 4
        twiddlelizer(out, tRe001_4,tIm001_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_4,tIm002_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_4,tIm003_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_4,tIm004_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_4,tIm005_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_4,tIm006_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_4,tIm007_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_4,tIm008_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_4,tIm009_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_4,tIm010_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_4,tIm011_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_4,tIm012_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_4,tIm013_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_4,tIm014_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_4,tIm015_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_4,tIm016_4, eReI1, eImI1, oReI1, oImI1);

        // Power 5
        twiddlelizer(out, tRe001_5,tIm001_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_5,tIm002_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_5,tIm003_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_5,tIm004_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_5,tIm005_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_5,tIm006_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_5,tIm007_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_5,tIm008_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_5,tIm009_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_5,tIm010_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_5,tIm011_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_5,tIm012_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_5,tIm013_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_5,tIm014_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_5,tIm015_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_5,tIm016_5, eReI1, eImI1, oReI1, oImI1);

    }
    console.log("Iterations: ",its,"\tAccesses",accs);

    return out;
}


function fftComplexInPlace_seq_6(out) {
    const N = out.length/2;
    const bits = Math.log2(N);

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


    let its = 0, accs = 0;

    let tRe1, tIm1, eReI1, eImI1, oReI1, oImI1;
    let tRe2, tIm2, eReI2, eImI2, oReI2, oImI2;
    let tRe3, tIm3, eReI3, eImI3, oReI3, oImI3;
    let tRe4, tIm4, eReI4, eImI4, oReI4, oImI4;
    let tRe5, tIm5, eReI5, eImI5, oReI5, oImI5;
    let tRe6, tIm6, eReI6, eImI6, oReI6, oImI6;
    let tRe7, tIm7, eReI7, eImI7, oReI7, oImI7;
    let tRe8, tIm8, eReI8, eImI8, oReI8, oImI8;
    let tRe001_1,tIm001_1,tRe002_1,tIm002_1,tRe003_1,tIm003_1,tRe004_1,tIm004_1,tRe005_1,tIm005_1,tRe006_1,tIm006_1,tRe007_1,tIm007_1,tRe008_1,tIm008_1,tRe009_1,tIm009_1,tRe010_1,tIm010_1,tRe011_1,tIm011_1,tRe012_1,tIm012_1,tRe013_1,tIm013_1,tRe014_1,tIm014_1,tRe015_1,tIm015_1,tRe016_1,tIm016_1,tRe017_1,tIm017_1,tRe018_1,tIm018_1,tRe019_1,tIm019_1,tRe020_1,tIm020_1,tRe021_1,tIm021_1,tRe022_1,tIm022_1,tRe023_1,tIm023_1,tRe024_1,tIm024_1,tRe025_1,tIm025_1,tRe026_1,tIm026_1,tRe027_1,tIm027_1,tRe028_1,tIm028_1,tRe029_1,tIm029_1,tRe030_1,tIm030_1,tRe031_1,tIm031_1,tRe032_1,tIm032_1; 
    let tRe001_2,tIm001_2,tRe002_2,tIm002_2,tRe003_2,tIm003_2,tRe004_2,tIm004_2,tRe005_2,tIm005_2,tRe006_2,tIm006_2,tRe007_2,tIm007_2,tRe008_2,tIm008_2,tRe009_2,tIm009_2,tRe010_2,tIm010_2,tRe011_2,tIm011_2,tRe012_2,tIm012_2,tRe013_2,tIm013_2,tRe014_2,tIm014_2,tRe015_2,tIm015_2,tRe016_2,tIm016_2,tRe017_2,tIm017_2,tRe018_2,tIm018_2,tRe019_2,tIm019_2,tRe020_2,tIm020_2,tRe021_2,tIm021_2,tRe022_2,tIm022_2,tRe023_2,tIm023_2,tRe024_2,tIm024_2,tRe025_2,tIm025_2,tRe026_2,tIm026_2,tRe027_2,tIm027_2,tRe028_2,tIm028_2,tRe029_2,tIm029_2,tRe030_2,tIm030_2,tRe031_2,tIm031_2,tRe032_2,tIm032_2; 
    let tRe001_3,tIm001_3,tRe002_3,tIm002_3,tRe003_3,tIm003_3,tRe004_3,tIm004_3,tRe005_3,tIm005_3,tRe006_3,tIm006_3,tRe007_3,tIm007_3,tRe008_3,tIm008_3,tRe009_3,tIm009_3,tRe010_3,tIm010_3,tRe011_3,tIm011_3,tRe012_3,tIm012_3,tRe013_3,tIm013_3,tRe014_3,tIm014_3,tRe015_3,tIm015_3,tRe016_3,tIm016_3,tRe017_3,tIm017_3,tRe018_3,tIm018_3,tRe019_3,tIm019_3,tRe020_3,tIm020_3,tRe021_3,tIm021_3,tRe022_3,tIm022_3,tRe023_3,tIm023_3,tRe024_3,tIm024_3,tRe025_3,tIm025_3,tRe026_3,tIm026_3,tRe027_3,tIm027_3,tRe028_3,tIm028_3,tRe029_3,tIm029_3,tRe030_3,tIm030_3,tRe031_3,tIm031_3,tRe032_3,tIm032_3; 
    let tRe001_4,tIm001_4,tRe002_4,tIm002_4,tRe003_4,tIm003_4,tRe004_4,tIm004_4,tRe005_4,tIm005_4,tRe006_4,tIm006_4,tRe007_4,tIm007_4,tRe008_4,tIm008_4,tRe009_4,tIm009_4,tRe010_4,tIm010_4,tRe011_4,tIm011_4,tRe012_4,tIm012_4,tRe013_4,tIm013_4,tRe014_4,tIm014_4,tRe015_4,tIm015_4,tRe016_4,tIm016_4,tRe017_4,tIm017_4,tRe018_4,tIm018_4,tRe019_4,tIm019_4,tRe020_4,tIm020_4,tRe021_4,tIm021_4,tRe022_4,tIm022_4,tRe023_4,tIm023_4,tRe024_4,tIm024_4,tRe025_4,tIm025_4,tRe026_4,tIm026_4,tRe027_4,tIm027_4,tRe028_4,tIm028_4,tRe029_4,tIm029_4,tRe030_4,tIm030_4,tRe031_4,tIm031_4,tRe032_4,tIm032_4; 
    let tRe001_5,tIm001_5,tRe002_5,tIm002_5,tRe003_5,tIm003_5,tRe004_5,tIm004_5,tRe005_5,tIm005_5,tRe006_5,tIm006_5,tRe007_5,tIm007_5,tRe008_5,tIm008_5,tRe009_5,tIm009_5,tRe010_5,tIm010_5,tRe011_5,tIm011_5,tRe012_5,tIm012_5,tRe013_5,tIm013_5,tRe014_5,tIm014_5,tRe015_5,tIm015_5,tRe016_5,tIm016_5,tRe017_5,tIm017_5,tRe018_5,tIm018_5,tRe019_5,tIm019_5,tRe020_5,tIm020_5,tRe021_5,tIm021_5,tRe022_5,tIm022_5,tRe023_5,tIm023_5,tRe024_5,tIm024_5,tRe025_5,tIm025_5,tRe026_5,tIm026_5,tRe027_5,tIm027_5,tRe028_5,tIm028_5,tRe029_5,tIm029_5,tRe030_5,tIm030_5,tRe031_5,tIm031_5,tRe032_5,tIm032_5; 
    let tRe001_6,tIm001_6,tRe002_6,tIm002_6,tRe003_6,tIm003_6,tRe004_6,tIm004_6,tRe005_6,tIm005_6,tRe006_6,tIm006_6,tRe007_6,tIm007_6,tRe008_6,tIm008_6,tRe009_6,tIm009_6,tRe010_6,tIm010_6,tRe011_6,tIm011_6,tRe012_6,tIm012_6,tRe013_6,tIm013_6,tRe014_6,tIm014_6,tRe015_6,tIm015_6,tRe016_6,tIm016_6,tRe017_6,tIm017_6,tRe018_6,tIm018_6,tRe019_6,tIm019_6,tRe020_6,tIm020_6,tRe021_6,tIm021_6,tRe022_6,tIm022_6,tRe023_6,tIm023_6,tRe024_6,tIm024_6,tRe025_6,tIm025_6,tRe026_6,tIm026_6,tRe027_6,tIm027_6,tRe028_6,tIm028_6,tRe029_6,tIm029_6,tRe030_6,tIm030_6,tRe031_6,tIm031_6,tRe032_6,tIm032_6; 



    while(i < (N>>1)*bits){
        its++; accs+=64;
        tRe001_1=____F[i];tIm001_1=____F[i];tRe001_2=tRe001_2;tIm001_2=tIm001_2;tRe001_3=tRe001_3;tIm001_3=tIm001_3;tRe001_4=tRe001_4;tIm001_4=tIm001_4;tRe001_5=tRe001_5;tIm001_5=tIm001_5;tRe001_6=tRe001_6;tIm001_6=tIm001_6;
        tRe002_1=tRe002_1;tIm002_1=tIm002_1;tRe002_2=____F[i];tIm002_2=____F[i];tRe002_3=tRe002_3;tIm002_3=tIm002_3;tRe002_4=tRe002_4;tIm002_4=tIm002_4;tRe002_5=tRe002_5;tIm002_5=tIm002_5;tRe002_6=tRe002_6;tIm002_6=tIm002_6;
        tRe003_1=tRe003_1;tIm003_1=tIm003_1;tRe003_2=tRe003_2;tIm003_2=tIm003_2;tRe003_3=____F[i];tIm003_3=____F[i];tRe003_4=tRe003_4;tIm003_4=tIm003_4;tRe003_5=tRe003_5;tIm003_5=tIm003_5;tRe003_6=tRe003_6;tIm003_6=tIm003_6;
        tRe004_1=tRe004_1;tIm004_1=tIm004_1;tRe004_2=tRe004_2;tIm004_2=tIm004_2;tRe004_3=____F[i];tIm004_3=____F[i];tRe004_4=tRe004_4;tIm004_4=tIm004_4;tRe004_5=tRe004_5;tIm004_5=tIm004_5;tRe004_6=tRe004_6;tIm004_6=tIm004_6;
        tRe005_1=tRe005_1;tIm005_1=tIm005_1;tRe005_2=tRe005_2;tIm005_2=tIm005_2;tRe005_3=tRe005_3;tIm005_3=tIm005_3;tRe005_4=____F[i];tIm005_4=____F[i];tRe005_5=tRe005_5;tIm005_5=tIm005_5;tRe005_6=tRe005_6;tIm005_6=tIm005_6;
        tRe006_1=tRe006_1;tIm006_1=tIm006_1;tRe006_2=tRe006_2;tIm006_2=tIm006_2;tRe006_3=tRe006_3;tIm006_3=tIm006_3;tRe006_4=____F[i];tIm006_4=____F[i];tRe006_5=tRe006_5;tIm006_5=tIm006_5;tRe006_6=tRe006_6;tIm006_6=tIm006_6;
        tRe007_1=tRe007_1;tIm007_1=tIm007_1;tRe007_2=tRe007_2;tIm007_2=tIm007_2;tRe007_3=tRe007_3;tIm007_3=tIm007_3;tRe007_4=____F[i];tIm007_4=____F[i];tRe007_5=tRe007_5;tIm007_5=tIm007_5;tRe007_6=tRe007_6;tIm007_6=tIm007_6;
        tRe008_1=tRe008_1;tIm008_1=tIm008_1;tRe008_2=tRe008_2;tIm008_2=tIm008_2;tRe008_3=tRe008_3;tIm008_3=tIm008_3;tRe008_4=____F[i];tIm008_4=____F[i];tRe008_5=tRe008_5;tIm008_5=tIm008_5;tRe008_6=tRe008_6;tIm008_6=tIm008_6;
        tRe009_1=tRe009_1;tIm009_1=tIm009_1;tRe009_2=tRe009_2;tIm009_2=tIm009_2;tRe009_3=tRe009_3;tIm009_3=tIm009_3;tRe009_4=tRe009_4;tIm009_4=tIm009_4;tRe009_5=____F[i];tIm009_5=____F[i];tRe009_6=tRe009_6;tIm009_6=tIm009_6;
        tRe010_1=tRe010_1;tIm010_1=tIm010_1;tRe010_2=tRe010_2;tIm010_2=tIm010_2;tRe010_3=tRe010_3;tIm010_3=tIm010_3;tRe010_4=tRe010_4;tIm010_4=tIm010_4;tRe010_5=____F[i];tIm010_5=____F[i];tRe010_6=tRe010_6;tIm010_6=tIm010_6;
        tRe011_1=tRe011_1;tIm011_1=tIm011_1;tRe011_2=tRe011_2;tIm011_2=tIm011_2;tRe011_3=tRe011_3;tIm011_3=tIm011_3;tRe011_4=tRe011_4;tIm011_4=tIm011_4;tRe011_5=____F[i];tIm011_5=____F[i];tRe011_6=tRe011_6;tIm011_6=tIm011_6;
        tRe012_1=tRe012_1;tIm012_1=tIm012_1;tRe012_2=tRe012_2;tIm012_2=tIm012_2;tRe012_3=tRe012_3;tIm012_3=tIm012_3;tRe012_4=tRe012_4;tIm012_4=tIm012_4;tRe012_5=____F[i];tIm012_5=____F[i];tRe012_6=tRe012_6;tIm012_6=tIm012_6;
        tRe013_1=tRe013_1;tIm013_1=tIm013_1;tRe013_2=tRe013_2;tIm013_2=tIm013_2;tRe013_3=tRe013_3;tIm013_3=tIm013_3;tRe013_4=tRe013_4;tIm013_4=tIm013_4;tRe013_5=____F[i];tIm013_5=____F[i];tRe013_6=tRe013_6;tIm013_6=tIm013_6;
        tRe014_1=tRe014_1;tIm014_1=tIm014_1;tRe014_2=tRe014_2;tIm014_2=tIm014_2;tRe014_3=tRe014_3;tIm014_3=tIm014_3;tRe014_4=tRe014_4;tIm014_4=tIm014_4;tRe014_5=____F[i];tIm014_5=____F[i];tRe014_6=tRe014_6;tIm014_6=tIm014_6;
        tRe015_1=tRe015_1;tIm015_1=tIm015_1;tRe015_2=tRe015_2;tIm015_2=tIm015_2;tRe015_3=tRe015_3;tIm015_3=tIm015_3;tRe015_4=tRe015_4;tIm015_4=tIm015_4;tRe015_5=____F[i];tIm015_5=____F[i];tRe015_6=tRe015_6;tIm015_6=tIm015_6;
        tRe016_1=tRe016_1;tIm016_1=tIm016_1;tRe016_2=tRe016_2;tIm016_2=tIm016_2;tRe016_3=tRe016_3;tIm016_3=tIm016_3;tRe016_4=tRe016_4;tIm016_4=tIm016_4;tRe016_5=____F[i];tIm016_5=____F[i];tRe016_6=tRe016_6;tIm016_6=tIm016_6;
        tRe017_1=tRe017_1;tIm017_1=tIm017_1;tRe017_2=tRe017_2;tIm017_2=tIm017_2;tRe017_3=tRe017_3;tIm017_3=tIm017_3;tRe017_4=tRe017_4;tIm017_4=tIm017_4;tRe017_5=tRe017_5;tIm017_5=tIm017_5;tRe017_6=____F[i];tIm017_6=____F[i];
        tRe018_1=tRe018_1;tIm018_1=tIm018_1;tRe018_2=tRe018_2;tIm018_2=tIm018_2;tRe018_3=tRe018_3;tIm018_3=tIm018_3;tRe018_4=tRe018_4;tIm018_4=tIm018_4;tRe018_5=tRe018_5;tIm018_5=tIm018_5;tRe018_6=____F[i];tIm018_6=____F[i];
        tRe019_1=tRe019_1;tIm019_1=tIm019_1;tRe019_2=tRe019_2;tIm019_2=tIm019_2;tRe019_3=tRe019_3;tIm019_3=tIm019_3;tRe019_4=tRe019_4;tIm019_4=tIm019_4;tRe019_5=tRe019_5;tIm019_5=tIm019_5;tRe019_6=____F[i];tIm019_6=____F[i];
        tRe020_1=tRe020_1;tIm020_1=tIm020_1;tRe020_2=tRe020_2;tIm020_2=tIm020_2;tRe020_3=tRe020_3;tIm020_3=tIm020_3;tRe020_4=tRe020_4;tIm020_4=tIm020_4;tRe020_5=tRe020_5;tIm020_5=tIm020_5;tRe020_6=____F[i];tIm020_6=____F[i];
        tRe021_1=tRe021_1;tIm021_1=tIm021_1;tRe021_2=tRe021_2;tIm021_2=tIm021_2;tRe021_3=tRe021_3;tIm021_3=tIm021_3;tRe021_4=tRe021_4;tIm021_4=tIm021_4;tRe021_5=tRe021_5;tIm021_5=tIm021_5;tRe021_6=____F[i];tIm021_6=____F[i];
        tRe022_1=tRe022_1;tIm022_1=tIm022_1;tRe022_2=tRe022_2;tIm022_2=tIm022_2;tRe022_3=tRe022_3;tIm022_3=tIm022_3;tRe022_4=tRe022_4;tIm022_4=tIm022_4;tRe022_5=tRe022_5;tIm022_5=tIm022_5;tRe022_6=____F[i];tIm022_6=____F[i];
        tRe023_1=tRe023_1;tIm023_1=tIm023_1;tRe023_2=tRe023_2;tIm023_2=tIm023_2;tRe023_3=tRe023_3;tIm023_3=tIm023_3;tRe023_4=tRe023_4;tIm023_4=tIm023_4;tRe023_5=tRe023_5;tIm023_5=tIm023_5;tRe023_6=____F[i];tIm023_6=____F[i];
        tRe024_1=tRe024_1;tIm024_1=tIm024_1;tRe024_2=tRe024_2;tIm024_2=tIm024_2;tRe024_3=tRe024_3;tIm024_3=tIm024_3;tRe024_4=tRe024_4;tIm024_4=tIm024_4;tRe024_5=tRe024_5;tIm024_5=tIm024_5;tRe024_6=____F[i];tIm024_6=____F[i];
        tRe025_1=tRe025_1;tIm025_1=tIm025_1;tRe025_2=tRe025_2;tIm025_2=tIm025_2;tRe025_3=tRe025_3;tIm025_3=tIm025_3;tRe025_4=tRe025_4;tIm025_4=tIm025_4;tRe025_5=tRe025_5;tIm025_5=tIm025_5;tRe025_6=____F[i];tIm025_6=____F[i];
        tRe026_1=tRe026_1;tIm026_1=tIm026_1;tRe026_2=tRe026_2;tIm026_2=tIm026_2;tRe026_3=tRe026_3;tIm026_3=tIm026_3;tRe026_4=tRe026_4;tIm026_4=tIm026_4;tRe026_5=tRe026_5;tIm026_5=tIm026_5;tRe026_6=____F[i];tIm026_6=____F[i];
        tRe027_1=tRe027_1;tIm027_1=tIm027_1;tRe027_2=tRe027_2;tIm027_2=tIm027_2;tRe027_3=tRe027_3;tIm027_3=tIm027_3;tRe027_4=tRe027_4;tIm027_4=tIm027_4;tRe027_5=tRe027_5;tIm027_5=tIm027_5;tRe027_6=____F[i];tIm027_6=____F[i];
        tRe028_1=tRe028_1;tIm028_1=tIm028_1;tRe028_2=tRe028_2;tIm028_2=tIm028_2;tRe028_3=tRe028_3;tIm028_3=tIm028_3;tRe028_4=tRe028_4;tIm028_4=tIm028_4;tRe028_5=tRe028_5;tIm028_5=tIm028_5;tRe028_6=____F[i];tIm028_6=____F[i];
        tRe029_1=tRe029_1;tIm029_1=tIm029_1;tRe029_2=tRe029_2;tIm029_2=tIm029_2;tRe029_3=tRe029_3;tIm029_3=tIm029_3;tRe029_4=tRe029_4;tIm029_4=tIm029_4;tRe029_5=tRe029_5;tIm029_5=tIm029_5;tRe029_6=____F[i];tIm029_6=____F[i];
        tRe030_1=tRe030_1;tIm030_1=tIm030_1;tRe030_2=tRe030_2;tIm030_2=tIm030_2;tRe030_3=tRe030_3;tIm030_3=tIm030_3;tRe030_4=tRe030_4;tIm030_4=tIm030_4;tRe030_5=tRe030_5;tIm030_5=tIm030_5;tRe030_6=____F[i];tIm030_6=____F[i];
        tRe031_1=tRe031_1;tIm031_1=tIm031_1;tRe031_2=tRe031_2;tIm031_2=tIm031_2;tRe031_3=tRe031_3;tIm031_3=tIm031_3;tRe031_4=tRe031_4;tIm031_4=tIm031_4;tRe031_5=tRe031_5;tIm031_5=tIm031_5;tRe031_6=____F[i];tIm031_6=____F[i];
        tRe032_1=tRe032_1;tIm032_1=tIm032_1;tRe032_2=tRe032_2;tIm032_2=tIm032_2;tRe032_3=tRe032_3;tIm032_3=tIm032_3;tRe032_4=tRe032_4;tIm032_4=tIm032_4;tRe032_5=tRe032_5;tIm032_5=tIm032_5;tRe032_6=____F[i];tIm032_6=____F[i];
        

        i+=192;

        // Power 1
        twiddlelizer(out, tRe001_1,tIm001_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_1,tIm002_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_1,tIm003_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_1,tIm004_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_1,tIm005_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_1,tIm006_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_1,tIm007_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_1,tIm008_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_1,tIm009_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_1,tIm010_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_1,tIm011_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_1,tIm012_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_1,tIm013_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_1,tIm014_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_1,tIm015_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_1,tIm016_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe017_1,tIm017_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe018_1,tIm018_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe019_1,tIm019_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe020_1,tIm020_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe021_1,tIm021_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe022_1,tIm022_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe023_1,tIm023_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe024_1,tIm024_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe025_1,tIm025_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe026_1,tIm026_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe027_1,tIm027_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe028_1,tIm028_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe029_1,tIm029_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe030_1,tIm030_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe031_1,tIm031_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe032_1,tIm032_1, eReI1, eImI1, oReI1, oImI1);

        // Power 2
        twiddlelizer(out, tRe001_2,tIm001_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_2,tIm002_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_2,tIm003_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_2,tIm004_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_2,tIm005_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_2,tIm006_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_2,tIm007_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_2,tIm008_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_2,tIm009_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_2,tIm010_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_2,tIm011_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_2,tIm012_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_2,tIm013_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_2,tIm014_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_2,tIm015_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_2,tIm016_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe017_2,tIm017_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe018_2,tIm018_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe019_2,tIm019_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe020_2,tIm020_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe021_2,tIm021_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe022_2,tIm022_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe023_2,tIm023_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe024_2,tIm024_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe025_2,tIm025_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe026_2,tIm026_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe027_2,tIm027_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe028_2,tIm028_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe029_2,tIm029_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe030_2,tIm030_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe031_2,tIm031_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe032_2,tIm032_2, eReI1, eImI1, oReI1, oImI1);

        // Power 3
        twiddlelizer(out, tRe001_3,tIm001_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_3,tIm002_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_3,tIm003_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_3,tIm004_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_3,tIm005_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_3,tIm006_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_3,tIm007_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_3,tIm008_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_3,tIm009_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_3,tIm010_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_3,tIm011_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_3,tIm012_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_3,tIm013_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_3,tIm014_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_3,tIm015_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_3,tIm016_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe017_3,tIm017_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe018_3,tIm018_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe019_3,tIm019_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe020_3,tIm020_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe021_3,tIm021_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe022_3,tIm022_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe023_3,tIm023_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe024_3,tIm024_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe025_3,tIm025_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe026_3,tIm026_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe027_3,tIm027_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe028_3,tIm028_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe029_3,tIm029_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe030_3,tIm030_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe031_3,tIm031_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe032_3,tIm032_3, eReI1, eImI1, oReI1, oImI1);

        // Power 4
        twiddlelizer(out, tRe001_4,tIm001_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_4,tIm002_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_4,tIm003_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_4,tIm004_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_4,tIm005_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_4,tIm006_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_4,tIm007_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_4,tIm008_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_4,tIm009_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_4,tIm010_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_4,tIm011_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_4,tIm012_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_4,tIm013_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_4,tIm014_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_4,tIm015_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_4,tIm016_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe017_4,tIm017_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe018_4,tIm018_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe019_4,tIm019_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe020_4,tIm020_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe021_4,tIm021_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe022_4,tIm022_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe023_4,tIm023_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe024_4,tIm024_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe025_4,tIm025_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe026_4,tIm026_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe027_4,tIm027_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe028_4,tIm028_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe029_4,tIm029_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe030_4,tIm030_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe031_4,tIm031_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe032_4,tIm032_4, eReI1, eImI1, oReI1, oImI1);

        // Power 5
        twiddlelizer(out, tRe001_5,tIm001_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_5,tIm002_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_5,tIm003_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_5,tIm004_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_5,tIm005_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_5,tIm006_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_5,tIm007_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_5,tIm008_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_5,tIm009_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_5,tIm010_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_5,tIm011_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_5,tIm012_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_5,tIm013_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_5,tIm014_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_5,tIm015_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_5,tIm016_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe017_5,tIm017_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe018_5,tIm018_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe019_5,tIm019_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe020_5,tIm020_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe021_5,tIm021_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe022_5,tIm022_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe023_5,tIm023_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe024_5,tIm024_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe025_5,tIm025_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe026_5,tIm026_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe027_5,tIm027_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe028_5,tIm028_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe029_5,tIm029_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe030_5,tIm030_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe031_5,tIm031_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe032_5,tIm032_5, eReI1, eImI1, oReI1, oImI1);

        // Power 6
        twiddlelizer(out, tRe001_6,tIm001_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_6,tIm002_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_6,tIm003_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_6,tIm004_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_6,tIm005_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_6,tIm006_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_6,tIm007_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_6,tIm008_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_6,tIm009_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_6,tIm010_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_6,tIm011_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_6,tIm012_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_6,tIm013_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_6,tIm014_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_6,tIm015_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_6,tIm016_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe017_6,tIm017_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe018_6,tIm018_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe019_6,tIm019_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe020_6,tIm020_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe021_6,tIm021_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe022_6,tIm022_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe023_6,tIm023_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe024_6,tIm024_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe025_6,tIm025_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe026_6,tIm026_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe027_6,tIm027_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe028_6,tIm028_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe029_6,tIm029_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe030_6,tIm030_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe031_6,tIm031_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe032_6,tIm032_6, eReI1, eImI1, oReI1, oImI1);

    }
    console.log("Iterations: ",its,"\tAccesses",accs);

    return out;
}

function fftComplexInPlace_seq_7(out) {
    const N = out.length/2;
    const bits = Math.log2(N);

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


    let its = 0, accs = 0;

    let tRe1, tIm1, eReI1, eImI1, oReI1, oImI1;
    let tRe2, tIm2, eReI2, eImI2, oReI2, oImI2;
    let tRe3, tIm3, eReI3, eImI3, oReI3, oImI3;
    let tRe4, tIm4, eReI4, eImI4, oReI4, oImI4;
    let tRe5, tIm5, eReI5, eImI5, oReI5, oImI5;
    let tRe6, tIm6, eReI6, eImI6, oReI6, oImI6;
    let tRe7, tIm7, eReI7, eImI7, oReI7, oImI7;
    let tRe8, tIm8, eReI8, eImI8, oReI8, oImI8;
    let tRe001_1,tIm001_1,tRe002_1,tIm002_1,tRe003_1,tIm003_1,tRe004_1,tIm004_1,tRe005_1,tIm005_1,tRe006_1,tIm006_1,tRe007_1,tIm007_1,tRe008_1,tIm008_1,tRe009_1,tIm009_1,tRe010_1,tIm010_1,tRe011_1,tIm011_1,tRe012_1,tIm012_1,tRe013_1,tIm013_1,tRe014_1,tIm014_1,tRe015_1,tIm015_1,tRe016_1,tIm016_1,tRe017_1,tIm017_1,tRe018_1,tIm018_1,tRe019_1,tIm019_1,tRe020_1,tIm020_1,tRe021_1,tIm021_1,tRe022_1,tIm022_1,tRe023_1,tIm023_1,tRe024_1,tIm024_1,tRe025_1,tIm025_1,tRe026_1,tIm026_1,tRe027_1,tIm027_1,tRe028_1,tIm028_1,tRe029_1,tIm029_1,tRe030_1,tIm030_1,tRe031_1,tIm031_1,tRe032_1,tIm032_1,tRe033_1,tIm033_1,tRe034_1,tIm034_1,tRe035_1,tIm035_1,tRe036_1,tIm036_1,tRe037_1,tIm037_1,tRe038_1,tIm038_1,tRe039_1,tIm039_1,tRe040_1,tIm040_1,tRe041_1,tIm041_1,tRe042_1,tIm042_1,tRe043_1,tIm043_1,tRe044_1,tIm044_1,tRe045_1,tIm045_1,tRe046_1,tIm046_1,tRe047_1,tIm047_1,tRe048_1,tIm048_1,tRe049_1,tIm049_1,tRe050_1,tIm050_1,tRe051_1,tIm051_1,tRe052_1,tIm052_1,tRe053_1,tIm053_1,tRe054_1,tIm054_1,tRe055_1,tIm055_1,tRe056_1,tIm056_1,tRe057_1,tIm057_1,tRe058_1,tIm058_1,tRe059_1,tIm059_1,tRe060_1,tIm060_1,tRe061_1,tIm061_1,tRe062_1,tIm062_1,tRe063_1,tIm063_1,tRe064_1,tIm064_1; 
    let tRe001_2,tIm001_2,tRe002_2,tIm002_2,tRe003_2,tIm003_2,tRe004_2,tIm004_2,tRe005_2,tIm005_2,tRe006_2,tIm006_2,tRe007_2,tIm007_2,tRe008_2,tIm008_2,tRe009_2,tIm009_2,tRe010_2,tIm010_2,tRe011_2,tIm011_2,tRe012_2,tIm012_2,tRe013_2,tIm013_2,tRe014_2,tIm014_2,tRe015_2,tIm015_2,tRe016_2,tIm016_2,tRe017_2,tIm017_2,tRe018_2,tIm018_2,tRe019_2,tIm019_2,tRe020_2,tIm020_2,tRe021_2,tIm021_2,tRe022_2,tIm022_2,tRe023_2,tIm023_2,tRe024_2,tIm024_2,tRe025_2,tIm025_2,tRe026_2,tIm026_2,tRe027_2,tIm027_2,tRe028_2,tIm028_2,tRe029_2,tIm029_2,tRe030_2,tIm030_2,tRe031_2,tIm031_2,tRe032_2,tIm032_2,tRe033_2,tIm033_2,tRe034_2,tIm034_2,tRe035_2,tIm035_2,tRe036_2,tIm036_2,tRe037_2,tIm037_2,tRe038_2,tIm038_2,tRe039_2,tIm039_2,tRe040_2,tIm040_2,tRe041_2,tIm041_2,tRe042_2,tIm042_2,tRe043_2,tIm043_2,tRe044_2,tIm044_2,tRe045_2,tIm045_2,tRe046_2,tIm046_2,tRe047_2,tIm047_2,tRe048_2,tIm048_2,tRe049_2,tIm049_2,tRe050_2,tIm050_2,tRe051_2,tIm051_2,tRe052_2,tIm052_2,tRe053_2,tIm053_2,tRe054_2,tIm054_2,tRe055_2,tIm055_2,tRe056_2,tIm056_2,tRe057_2,tIm057_2,tRe058_2,tIm058_2,tRe059_2,tIm059_2,tRe060_2,tIm060_2,tRe061_2,tIm061_2,tRe062_2,tIm062_2,tRe063_2,tIm063_2,tRe064_2,tIm064_2; 
    let tRe001_3,tIm001_3,tRe002_3,tIm002_3,tRe003_3,tIm003_3,tRe004_3,tIm004_3,tRe005_3,tIm005_3,tRe006_3,tIm006_3,tRe007_3,tIm007_3,tRe008_3,tIm008_3,tRe009_3,tIm009_3,tRe010_3,tIm010_3,tRe011_3,tIm011_3,tRe012_3,tIm012_3,tRe013_3,tIm013_3,tRe014_3,tIm014_3,tRe015_3,tIm015_3,tRe016_3,tIm016_3,tRe017_3,tIm017_3,tRe018_3,tIm018_3,tRe019_3,tIm019_3,tRe020_3,tIm020_3,tRe021_3,tIm021_3,tRe022_3,tIm022_3,tRe023_3,tIm023_3,tRe024_3,tIm024_3,tRe025_3,tIm025_3,tRe026_3,tIm026_3,tRe027_3,tIm027_3,tRe028_3,tIm028_3,tRe029_3,tIm029_3,tRe030_3,tIm030_3,tRe031_3,tIm031_3,tRe032_3,tIm032_3,tRe033_3,tIm033_3,tRe034_3,tIm034_3,tRe035_3,tIm035_3,tRe036_3,tIm036_3,tRe037_3,tIm037_3,tRe038_3,tIm038_3,tRe039_3,tIm039_3,tRe040_3,tIm040_3,tRe041_3,tIm041_3,tRe042_3,tIm042_3,tRe043_3,tIm043_3,tRe044_3,tIm044_3,tRe045_3,tIm045_3,tRe046_3,tIm046_3,tRe047_3,tIm047_3,tRe048_3,tIm048_3,tRe049_3,tIm049_3,tRe050_3,tIm050_3,tRe051_3,tIm051_3,tRe052_3,tIm052_3,tRe053_3,tIm053_3,tRe054_3,tIm054_3,tRe055_3,tIm055_3,tRe056_3,tIm056_3,tRe057_3,tIm057_3,tRe058_3,tIm058_3,tRe059_3,tIm059_3,tRe060_3,tIm060_3,tRe061_3,tIm061_3,tRe062_3,tIm062_3,tRe063_3,tIm063_3,tRe064_3,tIm064_3; 
    let tRe001_4,tIm001_4,tRe002_4,tIm002_4,tRe003_4,tIm003_4,tRe004_4,tIm004_4,tRe005_4,tIm005_4,tRe006_4,tIm006_4,tRe007_4,tIm007_4,tRe008_4,tIm008_4,tRe009_4,tIm009_4,tRe010_4,tIm010_4,tRe011_4,tIm011_4,tRe012_4,tIm012_4,tRe013_4,tIm013_4,tRe014_4,tIm014_4,tRe015_4,tIm015_4,tRe016_4,tIm016_4,tRe017_4,tIm017_4,tRe018_4,tIm018_4,tRe019_4,tIm019_4,tRe020_4,tIm020_4,tRe021_4,tIm021_4,tRe022_4,tIm022_4,tRe023_4,tIm023_4,tRe024_4,tIm024_4,tRe025_4,tIm025_4,tRe026_4,tIm026_4,tRe027_4,tIm027_4,tRe028_4,tIm028_4,tRe029_4,tIm029_4,tRe030_4,tIm030_4,tRe031_4,tIm031_4,tRe032_4,tIm032_4,tRe033_4,tIm033_4,tRe034_4,tIm034_4,tRe035_4,tIm035_4,tRe036_4,tIm036_4,tRe037_4,tIm037_4,tRe038_4,tIm038_4,tRe039_4,tIm039_4,tRe040_4,tIm040_4,tRe041_4,tIm041_4,tRe042_4,tIm042_4,tRe043_4,tIm043_4,tRe044_4,tIm044_4,tRe045_4,tIm045_4,tRe046_4,tIm046_4,tRe047_4,tIm047_4,tRe048_4,tIm048_4,tRe049_4,tIm049_4,tRe050_4,tIm050_4,tRe051_4,tIm051_4,tRe052_4,tIm052_4,tRe053_4,tIm053_4,tRe054_4,tIm054_4,tRe055_4,tIm055_4,tRe056_4,tIm056_4,tRe057_4,tIm057_4,tRe058_4,tIm058_4,tRe059_4,tIm059_4,tRe060_4,tIm060_4,tRe061_4,tIm061_4,tRe062_4,tIm062_4,tRe063_4,tIm063_4,tRe064_4,tIm064_4; 
    let tRe001_5,tIm001_5,tRe002_5,tIm002_5,tRe003_5,tIm003_5,tRe004_5,tIm004_5,tRe005_5,tIm005_5,tRe006_5,tIm006_5,tRe007_5,tIm007_5,tRe008_5,tIm008_5,tRe009_5,tIm009_5,tRe010_5,tIm010_5,tRe011_5,tIm011_5,tRe012_5,tIm012_5,tRe013_5,tIm013_5,tRe014_5,tIm014_5,tRe015_5,tIm015_5,tRe016_5,tIm016_5,tRe017_5,tIm017_5,tRe018_5,tIm018_5,tRe019_5,tIm019_5,tRe020_5,tIm020_5,tRe021_5,tIm021_5,tRe022_5,tIm022_5,tRe023_5,tIm023_5,tRe024_5,tIm024_5,tRe025_5,tIm025_5,tRe026_5,tIm026_5,tRe027_5,tIm027_5,tRe028_5,tIm028_5,tRe029_5,tIm029_5,tRe030_5,tIm030_5,tRe031_5,tIm031_5,tRe032_5,tIm032_5,tRe033_5,tIm033_5,tRe034_5,tIm034_5,tRe035_5,tIm035_5,tRe036_5,tIm036_5,tRe037_5,tIm037_5,tRe038_5,tIm038_5,tRe039_5,tIm039_5,tRe040_5,tIm040_5,tRe041_5,tIm041_5,tRe042_5,tIm042_5,tRe043_5,tIm043_5,tRe044_5,tIm044_5,tRe045_5,tIm045_5,tRe046_5,tIm046_5,tRe047_5,tIm047_5,tRe048_5,tIm048_5,tRe049_5,tIm049_5,tRe050_5,tIm050_5,tRe051_5,tIm051_5,tRe052_5,tIm052_5,tRe053_5,tIm053_5,tRe054_5,tIm054_5,tRe055_5,tIm055_5,tRe056_5,tIm056_5,tRe057_5,tIm057_5,tRe058_5,tIm058_5,tRe059_5,tIm059_5,tRe060_5,tIm060_5,tRe061_5,tIm061_5,tRe062_5,tIm062_5,tRe063_5,tIm063_5,tRe064_5,tIm064_5; 
    let tRe001_6,tIm001_6,tRe002_6,tIm002_6,tRe003_6,tIm003_6,tRe004_6,tIm004_6,tRe005_6,tIm005_6,tRe006_6,tIm006_6,tRe007_6,tIm007_6,tRe008_6,tIm008_6,tRe009_6,tIm009_6,tRe010_6,tIm010_6,tRe011_6,tIm011_6,tRe012_6,tIm012_6,tRe013_6,tIm013_6,tRe014_6,tIm014_6,tRe015_6,tIm015_6,tRe016_6,tIm016_6,tRe017_6,tIm017_6,tRe018_6,tIm018_6,tRe019_6,tIm019_6,tRe020_6,tIm020_6,tRe021_6,tIm021_6,tRe022_6,tIm022_6,tRe023_6,tIm023_6,tRe024_6,tIm024_6,tRe025_6,tIm025_6,tRe026_6,tIm026_6,tRe027_6,tIm027_6,tRe028_6,tIm028_6,tRe029_6,tIm029_6,tRe030_6,tIm030_6,tRe031_6,tIm031_6,tRe032_6,tIm032_6,tRe033_6,tIm033_6,tRe034_6,tIm034_6,tRe035_6,tIm035_6,tRe036_6,tIm036_6,tRe037_6,tIm037_6,tRe038_6,tIm038_6,tRe039_6,tIm039_6,tRe040_6,tIm040_6,tRe041_6,tIm041_6,tRe042_6,tIm042_6,tRe043_6,tIm043_6,tRe044_6,tIm044_6,tRe045_6,tIm045_6,tRe046_6,tIm046_6,tRe047_6,tIm047_6,tRe048_6,tIm048_6,tRe049_6,tIm049_6,tRe050_6,tIm050_6,tRe051_6,tIm051_6,tRe052_6,tIm052_6,tRe053_6,tIm053_6,tRe054_6,tIm054_6,tRe055_6,tIm055_6,tRe056_6,tIm056_6,tRe057_6,tIm057_6,tRe058_6,tIm058_6,tRe059_6,tIm059_6,tRe060_6,tIm060_6,tRe061_6,tIm061_6,tRe062_6,tIm062_6,tRe063_6,tIm063_6,tRe064_6,tIm064_6; 
    let tRe001_7,tIm001_7,tRe002_7,tIm002_7,tRe003_7,tIm003_7,tRe004_7,tIm004_7,tRe005_7,tIm005_7,tRe006_7,tIm006_7,tRe007_7,tIm007_7,tRe008_7,tIm008_7,tRe009_7,tIm009_7,tRe010_7,tIm010_7,tRe011_7,tIm011_7,tRe012_7,tIm012_7,tRe013_7,tIm013_7,tRe014_7,tIm014_7,tRe015_7,tIm015_7,tRe016_7,tIm016_7,tRe017_7,tIm017_7,tRe018_7,tIm018_7,tRe019_7,tIm019_7,tRe020_7,tIm020_7,tRe021_7,tIm021_7,tRe022_7,tIm022_7,tRe023_7,tIm023_7,tRe024_7,tIm024_7,tRe025_7,tIm025_7,tRe026_7,tIm026_7,tRe027_7,tIm027_7,tRe028_7,tIm028_7,tRe029_7,tIm029_7,tRe030_7,tIm030_7,tRe031_7,tIm031_7,tRe032_7,tIm032_7,tRe033_7,tIm033_7,tRe034_7,tIm034_7,tRe035_7,tIm035_7,tRe036_7,tIm036_7,tRe037_7,tIm037_7,tRe038_7,tIm038_7,tRe039_7,tIm039_7,tRe040_7,tIm040_7,tRe041_7,tIm041_7,tRe042_7,tIm042_7,tRe043_7,tIm043_7,tRe044_7,tIm044_7,tRe045_7,tIm045_7,tRe046_7,tIm046_7,tRe047_7,tIm047_7,tRe048_7,tIm048_7,tRe049_7,tIm049_7,tRe050_7,tIm050_7,tRe051_7,tIm051_7,tRe052_7,tIm052_7,tRe053_7,tIm053_7,tRe054_7,tIm054_7,tRe055_7,tIm055_7,tRe056_7,tIm056_7,tRe057_7,tIm057_7,tRe058_7,tIm058_7,tRe059_7,tIm059_7,tRe060_7,tIm060_7,tRe061_7,tIm061_7,tRe062_7,tIm062_7,tRe063_7,tIm063_7,tRe064_7,tIm064_7; 



    while(i < (N>>1)*bits){
        its++; accs+=128;

        tRe001_1=____F[i];tIm001_1=____F[i];tRe001_2=tRe001_2;tIm001_2=tIm001_2;tRe001_3=tRe001_3;tIm001_3=tIm001_3;tRe001_4=tRe001_4;tIm001_4=tIm001_4;tRe001_5=tRe001_5;tIm001_5=tIm001_5;tRe001_6=tRe001_6;tIm001_6=tIm001_6;tRe001_7=tRe001_7;tIm001_7=tIm001_7;
        tRe002_1=tRe002_1;tIm002_1=tIm002_1;tRe002_2=____F[i];tIm002_2=____F[i];tRe002_3=tRe002_3;tIm002_3=tIm002_3;tRe002_4=tRe002_4;tIm002_4=tIm002_4;tRe002_5=tRe002_5;tIm002_5=tIm002_5;tRe002_6=tRe002_6;tIm002_6=tIm002_6;tRe002_7=tRe002_7;tIm002_7=tIm002_7;
        tRe003_1=tRe003_1;tIm003_1=tIm003_1;tRe003_2=tRe003_2;tIm003_2=tIm003_2;tRe003_3=____F[i];tIm003_3=____F[i];tRe003_4=tRe003_4;tIm003_4=tIm003_4;tRe003_5=tRe003_5;tIm003_5=tIm003_5;tRe003_6=tRe003_6;tIm003_6=tIm003_6;tRe003_7=tRe003_7;tIm003_7=tIm003_7;
        tRe004_1=tRe004_1;tIm004_1=tIm004_1;tRe004_2=tRe004_2;tIm004_2=tIm004_2;tRe004_3=____F[i];tIm004_3=____F[i];tRe004_4=tRe004_4;tIm004_4=tIm004_4;tRe004_5=tRe004_5;tIm004_5=tIm004_5;tRe004_6=tRe004_6;tIm004_6=tIm004_6;tRe004_7=tRe004_7;tIm004_7=tIm004_7;
        tRe005_1=tRe005_1;tIm005_1=tIm005_1;tRe005_2=tRe005_2;tIm005_2=tIm005_2;tRe005_3=tRe005_3;tIm005_3=tIm005_3;tRe005_4=____F[i];tIm005_4=____F[i];tRe005_5=tRe005_5;tIm005_5=tIm005_5;tRe005_6=tRe005_6;tIm005_6=tIm005_6;tRe005_7=tRe005_7;tIm005_7=tIm005_7;
        tRe006_1=tRe006_1;tIm006_1=tIm006_1;tRe006_2=tRe006_2;tIm006_2=tIm006_2;tRe006_3=tRe006_3;tIm006_3=tIm006_3;tRe006_4=____F[i];tIm006_4=____F[i];tRe006_5=tRe006_5;tIm006_5=tIm006_5;tRe006_6=tRe006_6;tIm006_6=tIm006_6;tRe006_7=tRe006_7;tIm006_7=tIm006_7;
        tRe007_1=tRe007_1;tIm007_1=tIm007_1;tRe007_2=tRe007_2;tIm007_2=tIm007_2;tRe007_3=tRe007_3;tIm007_3=tIm007_3;tRe007_4=____F[i];tIm007_4=____F[i];tRe007_5=tRe007_5;tIm007_5=tIm007_5;tRe007_6=tRe007_6;tIm007_6=tIm007_6;tRe007_7=tRe007_7;tIm007_7=tIm007_7;
        tRe008_1=tRe008_1;tIm008_1=tIm008_1;tRe008_2=tRe008_2;tIm008_2=tIm008_2;tRe008_3=tRe008_3;tIm008_3=tIm008_3;tRe008_4=____F[i];tIm008_4=____F[i];tRe008_5=tRe008_5;tIm008_5=tIm008_5;tRe008_6=tRe008_6;tIm008_6=tIm008_6;tRe008_7=tRe008_7;tIm008_7=tIm008_7;
        tRe009_1=tRe009_1;tIm009_1=tIm009_1;tRe009_2=tRe009_2;tIm009_2=tIm009_2;tRe009_3=tRe009_3;tIm009_3=tIm009_3;tRe009_4=tRe009_4;tIm009_4=tIm009_4;tRe009_5=____F[i];tIm009_5=____F[i];tRe009_6=tRe009_6;tIm009_6=tIm009_6;tRe009_7=tRe009_7;tIm009_7=tIm009_7;
        tRe010_1=tRe010_1;tIm010_1=tIm010_1;tRe010_2=tRe010_2;tIm010_2=tIm010_2;tRe010_3=tRe010_3;tIm010_3=tIm010_3;tRe010_4=tRe010_4;tIm010_4=tIm010_4;tRe010_5=____F[i];tIm010_5=____F[i];tRe010_6=tRe010_6;tIm010_6=tIm010_6;tRe010_7=tRe010_7;tIm010_7=tIm010_7;
        tRe011_1=tRe011_1;tIm011_1=tIm011_1;tRe011_2=tRe011_2;tIm011_2=tIm011_2;tRe011_3=tRe011_3;tIm011_3=tIm011_3;tRe011_4=tRe011_4;tIm011_4=tIm011_4;tRe011_5=____F[i];tIm011_5=____F[i];tRe011_6=tRe011_6;tIm011_6=tIm011_6;tRe011_7=tRe011_7;tIm011_7=tIm011_7;
        tRe012_1=tRe012_1;tIm012_1=tIm012_1;tRe012_2=tRe012_2;tIm012_2=tIm012_2;tRe012_3=tRe012_3;tIm012_3=tIm012_3;tRe012_4=tRe012_4;tIm012_4=tIm012_4;tRe012_5=____F[i];tIm012_5=____F[i];tRe012_6=tRe012_6;tIm012_6=tIm012_6;tRe012_7=tRe012_7;tIm012_7=tIm012_7;
        tRe013_1=tRe013_1;tIm013_1=tIm013_1;tRe013_2=tRe013_2;tIm013_2=tIm013_2;tRe013_3=tRe013_3;tIm013_3=tIm013_3;tRe013_4=tRe013_4;tIm013_4=tIm013_4;tRe013_5=____F[i];tIm013_5=____F[i];tRe013_6=tRe013_6;tIm013_6=tIm013_6;tRe013_7=tRe013_7;tIm013_7=tIm013_7;
        tRe014_1=tRe014_1;tIm014_1=tIm014_1;tRe014_2=tRe014_2;tIm014_2=tIm014_2;tRe014_3=tRe014_3;tIm014_3=tIm014_3;tRe014_4=tRe014_4;tIm014_4=tIm014_4;tRe014_5=____F[i];tIm014_5=____F[i];tRe014_6=tRe014_6;tIm014_6=tIm014_6;tRe014_7=tRe014_7;tIm014_7=tIm014_7;
        tRe015_1=tRe015_1;tIm015_1=tIm015_1;tRe015_2=tRe015_2;tIm015_2=tIm015_2;tRe015_3=tRe015_3;tIm015_3=tIm015_3;tRe015_4=tRe015_4;tIm015_4=tIm015_4;tRe015_5=____F[i];tIm015_5=____F[i];tRe015_6=tRe015_6;tIm015_6=tIm015_6;tRe015_7=tRe015_7;tIm015_7=tIm015_7;
        tRe016_1=tRe016_1;tIm016_1=tIm016_1;tRe016_2=tRe016_2;tIm016_2=tIm016_2;tRe016_3=tRe016_3;tIm016_3=tIm016_3;tRe016_4=tRe016_4;tIm016_4=tIm016_4;tRe016_5=____F[i];tIm016_5=____F[i];tRe016_6=tRe016_6;tIm016_6=tIm016_6;tRe016_7=tRe016_7;tIm016_7=tIm016_7;
        tRe017_1=tRe017_1;tIm017_1=tIm017_1;tRe017_2=tRe017_2;tIm017_2=tIm017_2;tRe017_3=tRe017_3;tIm017_3=tIm017_3;tRe017_4=tRe017_4;tIm017_4=tIm017_4;tRe017_5=tRe017_5;tIm017_5=tIm017_5;tRe017_6=____F[i];tIm017_6=____F[i];tRe017_7=tRe017_7;tIm017_7=tIm017_7;
        tRe018_1=tRe018_1;tIm018_1=tIm018_1;tRe018_2=tRe018_2;tIm018_2=tIm018_2;tRe018_3=tRe018_3;tIm018_3=tIm018_3;tRe018_4=tRe018_4;tIm018_4=tIm018_4;tRe018_5=tRe018_5;tIm018_5=tIm018_5;tRe018_6=____F[i];tIm018_6=____F[i];tRe018_7=tRe018_7;tIm018_7=tIm018_7;
        tRe019_1=tRe019_1;tIm019_1=tIm019_1;tRe019_2=tRe019_2;tIm019_2=tIm019_2;tRe019_3=tRe019_3;tIm019_3=tIm019_3;tRe019_4=tRe019_4;tIm019_4=tIm019_4;tRe019_5=tRe019_5;tIm019_5=tIm019_5;tRe019_6=____F[i];tIm019_6=____F[i];tRe019_7=tRe019_7;tIm019_7=tIm019_7;
        tRe020_1=tRe020_1;tIm020_1=tIm020_1;tRe020_2=tRe020_2;tIm020_2=tIm020_2;tRe020_3=tRe020_3;tIm020_3=tIm020_3;tRe020_4=tRe020_4;tIm020_4=tIm020_4;tRe020_5=tRe020_5;tIm020_5=tIm020_5;tRe020_6=____F[i];tIm020_6=____F[i];tRe020_7=tRe020_7;tIm020_7=tIm020_7;
        tRe021_1=tRe021_1;tIm021_1=tIm021_1;tRe021_2=tRe021_2;tIm021_2=tIm021_2;tRe021_3=tRe021_3;tIm021_3=tIm021_3;tRe021_4=tRe021_4;tIm021_4=tIm021_4;tRe021_5=tRe021_5;tIm021_5=tIm021_5;tRe021_6=____F[i];tIm021_6=____F[i];tRe021_7=tRe021_7;tIm021_7=tIm021_7;
        tRe022_1=tRe022_1;tIm022_1=tIm022_1;tRe022_2=tRe022_2;tIm022_2=tIm022_2;tRe022_3=tRe022_3;tIm022_3=tIm022_3;tRe022_4=tRe022_4;tIm022_4=tIm022_4;tRe022_5=tRe022_5;tIm022_5=tIm022_5;tRe022_6=____F[i];tIm022_6=____F[i];tRe022_7=tRe022_7;tIm022_7=tIm022_7;
        tRe023_1=tRe023_1;tIm023_1=tIm023_1;tRe023_2=tRe023_2;tIm023_2=tIm023_2;tRe023_3=tRe023_3;tIm023_3=tIm023_3;tRe023_4=tRe023_4;tIm023_4=tIm023_4;tRe023_5=tRe023_5;tIm023_5=tIm023_5;tRe023_6=____F[i];tIm023_6=____F[i];tRe023_7=tRe023_7;tIm023_7=tIm023_7;
        tRe024_1=tRe024_1;tIm024_1=tIm024_1;tRe024_2=tRe024_2;tIm024_2=tIm024_2;tRe024_3=tRe024_3;tIm024_3=tIm024_3;tRe024_4=tRe024_4;tIm024_4=tIm024_4;tRe024_5=tRe024_5;tIm024_5=tIm024_5;tRe024_6=____F[i];tIm024_6=____F[i];tRe024_7=tRe024_7;tIm024_7=tIm024_7;
        tRe025_1=tRe025_1;tIm025_1=tIm025_1;tRe025_2=tRe025_2;tIm025_2=tIm025_2;tRe025_3=tRe025_3;tIm025_3=tIm025_3;tRe025_4=tRe025_4;tIm025_4=tIm025_4;tRe025_5=tRe025_5;tIm025_5=tIm025_5;tRe025_6=____F[i];tIm025_6=____F[i];tRe025_7=tRe025_7;tIm025_7=tIm025_7;
        tRe026_1=tRe026_1;tIm026_1=tIm026_1;tRe026_2=tRe026_2;tIm026_2=tIm026_2;tRe026_3=tRe026_3;tIm026_3=tIm026_3;tRe026_4=tRe026_4;tIm026_4=tIm026_4;tRe026_5=tRe026_5;tIm026_5=tIm026_5;tRe026_6=____F[i];tIm026_6=____F[i];tRe026_7=tRe026_7;tIm026_7=tIm026_7;
        tRe027_1=tRe027_1;tIm027_1=tIm027_1;tRe027_2=tRe027_2;tIm027_2=tIm027_2;tRe027_3=tRe027_3;tIm027_3=tIm027_3;tRe027_4=tRe027_4;tIm027_4=tIm027_4;tRe027_5=tRe027_5;tIm027_5=tIm027_5;tRe027_6=____F[i];tIm027_6=____F[i];tRe027_7=tRe027_7;tIm027_7=tIm027_7;
        tRe028_1=tRe028_1;tIm028_1=tIm028_1;tRe028_2=tRe028_2;tIm028_2=tIm028_2;tRe028_3=tRe028_3;tIm028_3=tIm028_3;tRe028_4=tRe028_4;tIm028_4=tIm028_4;tRe028_5=tRe028_5;tIm028_5=tIm028_5;tRe028_6=____F[i];tIm028_6=____F[i];tRe028_7=tRe028_7;tIm028_7=tIm028_7;
        tRe029_1=tRe029_1;tIm029_1=tIm029_1;tRe029_2=tRe029_2;tIm029_2=tIm029_2;tRe029_3=tRe029_3;tIm029_3=tIm029_3;tRe029_4=tRe029_4;tIm029_4=tIm029_4;tRe029_5=tRe029_5;tIm029_5=tIm029_5;tRe029_6=____F[i];tIm029_6=____F[i];tRe029_7=tRe029_7;tIm029_7=tIm029_7;
        tRe030_1=tRe030_1;tIm030_1=tIm030_1;tRe030_2=tRe030_2;tIm030_2=tIm030_2;tRe030_3=tRe030_3;tIm030_3=tIm030_3;tRe030_4=tRe030_4;tIm030_4=tIm030_4;tRe030_5=tRe030_5;tIm030_5=tIm030_5;tRe030_6=____F[i];tIm030_6=____F[i];tRe030_7=tRe030_7;tIm030_7=tIm030_7;
        tRe031_1=tRe031_1;tIm031_1=tIm031_1;tRe031_2=tRe031_2;tIm031_2=tIm031_2;tRe031_3=tRe031_3;tIm031_3=tIm031_3;tRe031_4=tRe031_4;tIm031_4=tIm031_4;tRe031_5=tRe031_5;tIm031_5=tIm031_5;tRe031_6=____F[i];tIm031_6=____F[i];tRe031_7=tRe031_7;tIm031_7=tIm031_7;
        tRe032_1=tRe032_1;tIm032_1=tIm032_1;tRe032_2=tRe032_2;tIm032_2=tIm032_2;tRe032_3=tRe032_3;tIm032_3=tIm032_3;tRe032_4=tRe032_4;tIm032_4=tIm032_4;tRe032_5=tRe032_5;tIm032_5=tIm032_5;tRe032_6=____F[i];tIm032_6=____F[i];tRe032_7=tRe032_7;tIm032_7=tIm032_7;
        tRe033_1=tRe033_1;tIm033_1=tIm033_1;tRe033_2=tRe033_2;tIm033_2=tIm033_2;tRe033_3=tRe033_3;tIm033_3=tIm033_3;tRe033_4=tRe033_4;tIm033_4=tIm033_4;tRe033_5=tRe033_5;tIm033_5=tIm033_5;tRe033_6=tRe033_6;tIm033_6=tIm033_6;tRe033_7=____F[i];tIm033_7=____F[i];
        tRe034_1=tRe034_1;tIm034_1=tIm034_1;tRe034_2=tRe034_2;tIm034_2=tIm034_2;tRe034_3=tRe034_3;tIm034_3=tIm034_3;tRe034_4=tRe034_4;tIm034_4=tIm034_4;tRe034_5=tRe034_5;tIm034_5=tIm034_5;tRe034_6=tRe034_6;tIm034_6=tIm034_6;tRe034_7=____F[i];tIm034_7=____F[i];
        tRe035_1=tRe035_1;tIm035_1=tIm035_1;tRe035_2=tRe035_2;tIm035_2=tIm035_2;tRe035_3=tRe035_3;tIm035_3=tIm035_3;tRe035_4=tRe035_4;tIm035_4=tIm035_4;tRe035_5=tRe035_5;tIm035_5=tIm035_5;tRe035_6=tRe035_6;tIm035_6=tIm035_6;tRe035_7=____F[i];tIm035_7=____F[i];
        tRe036_1=tRe036_1;tIm036_1=tIm036_1;tRe036_2=tRe036_2;tIm036_2=tIm036_2;tRe036_3=tRe036_3;tIm036_3=tIm036_3;tRe036_4=tRe036_4;tIm036_4=tIm036_4;tRe036_5=tRe036_5;tIm036_5=tIm036_5;tRe036_6=tRe036_6;tIm036_6=tIm036_6;tRe036_7=____F[i];tIm036_7=____F[i];
        tRe037_1=tRe037_1;tIm037_1=tIm037_1;tRe037_2=tRe037_2;tIm037_2=tIm037_2;tRe037_3=tRe037_3;tIm037_3=tIm037_3;tRe037_4=tRe037_4;tIm037_4=tIm037_4;tRe037_5=tRe037_5;tIm037_5=tIm037_5;tRe037_6=tRe037_6;tIm037_6=tIm037_6;tRe037_7=____F[i];tIm037_7=____F[i];
        tRe038_1=tRe038_1;tIm038_1=tIm038_1;tRe038_2=tRe038_2;tIm038_2=tIm038_2;tRe038_3=tRe038_3;tIm038_3=tIm038_3;tRe038_4=tRe038_4;tIm038_4=tIm038_4;tRe038_5=tRe038_5;tIm038_5=tIm038_5;tRe038_6=tRe038_6;tIm038_6=tIm038_6;tRe038_7=____F[i];tIm038_7=____F[i];
        tRe039_1=tRe039_1;tIm039_1=tIm039_1;tRe039_2=tRe039_2;tIm039_2=tIm039_2;tRe039_3=tRe039_3;tIm039_3=tIm039_3;tRe039_4=tRe039_4;tIm039_4=tIm039_4;tRe039_5=tRe039_5;tIm039_5=tIm039_5;tRe039_6=tRe039_6;tIm039_6=tIm039_6;tRe039_7=____F[i];tIm039_7=____F[i];
        tRe040_1=tRe040_1;tIm040_1=tIm040_1;tRe040_2=tRe040_2;tIm040_2=tIm040_2;tRe040_3=tRe040_3;tIm040_3=tIm040_3;tRe040_4=tRe040_4;tIm040_4=tIm040_4;tRe040_5=tRe040_5;tIm040_5=tIm040_5;tRe040_6=tRe040_6;tIm040_6=tIm040_6;tRe040_7=____F[i];tIm040_7=____F[i];
        tRe041_1=tRe041_1;tIm041_1=tIm041_1;tRe041_2=tRe041_2;tIm041_2=tIm041_2;tRe041_3=tRe041_3;tIm041_3=tIm041_3;tRe041_4=tRe041_4;tIm041_4=tIm041_4;tRe041_5=tRe041_5;tIm041_5=tIm041_5;tRe041_6=tRe041_6;tIm041_6=tIm041_6;tRe041_7=____F[i];tIm041_7=____F[i];
        tRe042_1=tRe042_1;tIm042_1=tIm042_1;tRe042_2=tRe042_2;tIm042_2=tIm042_2;tRe042_3=tRe042_3;tIm042_3=tIm042_3;tRe042_4=tRe042_4;tIm042_4=tIm042_4;tRe042_5=tRe042_5;tIm042_5=tIm042_5;tRe042_6=tRe042_6;tIm042_6=tIm042_6;tRe042_7=____F[i];tIm042_7=____F[i];
        tRe043_1=tRe043_1;tIm043_1=tIm043_1;tRe043_2=tRe043_2;tIm043_2=tIm043_2;tRe043_3=tRe043_3;tIm043_3=tIm043_3;tRe043_4=tRe043_4;tIm043_4=tIm043_4;tRe043_5=tRe043_5;tIm043_5=tIm043_5;tRe043_6=tRe043_6;tIm043_6=tIm043_6;tRe043_7=____F[i];tIm043_7=____F[i];
        tRe044_1=tRe044_1;tIm044_1=tIm044_1;tRe044_2=tRe044_2;tIm044_2=tIm044_2;tRe044_3=tRe044_3;tIm044_3=tIm044_3;tRe044_4=tRe044_4;tIm044_4=tIm044_4;tRe044_5=tRe044_5;tIm044_5=tIm044_5;tRe044_6=tRe044_6;tIm044_6=tIm044_6;tRe044_7=____F[i];tIm044_7=____F[i];
        tRe045_1=tRe045_1;tIm045_1=tIm045_1;tRe045_2=tRe045_2;tIm045_2=tIm045_2;tRe045_3=tRe045_3;tIm045_3=tIm045_3;tRe045_4=tRe045_4;tIm045_4=tIm045_4;tRe045_5=tRe045_5;tIm045_5=tIm045_5;tRe045_6=tRe045_6;tIm045_6=tIm045_6;tRe045_7=____F[i];tIm045_7=____F[i];
        tRe046_1=tRe046_1;tIm046_1=tIm046_1;tRe046_2=tRe046_2;tIm046_2=tIm046_2;tRe046_3=tRe046_3;tIm046_3=tIm046_3;tRe046_4=tRe046_4;tIm046_4=tIm046_4;tRe046_5=tRe046_5;tIm046_5=tIm046_5;tRe046_6=tRe046_6;tIm046_6=tIm046_6;tRe046_7=____F[i];tIm046_7=____F[i];
        tRe047_1=tRe047_1;tIm047_1=tIm047_1;tRe047_2=tRe047_2;tIm047_2=tIm047_2;tRe047_3=tRe047_3;tIm047_3=tIm047_3;tRe047_4=tRe047_4;tIm047_4=tIm047_4;tRe047_5=tRe047_5;tIm047_5=tIm047_5;tRe047_6=tRe047_6;tIm047_6=tIm047_6;tRe047_7=____F[i];tIm047_7=____F[i];
        tRe048_1=tRe048_1;tIm048_1=tIm048_1;tRe048_2=tRe048_2;tIm048_2=tIm048_2;tRe048_3=tRe048_3;tIm048_3=tIm048_3;tRe048_4=tRe048_4;tIm048_4=tIm048_4;tRe048_5=tRe048_5;tIm048_5=tIm048_5;tRe048_6=tRe048_6;tIm048_6=tIm048_6;tRe048_7=____F[i];tIm048_7=____F[i];
        tRe049_1=tRe049_1;tIm049_1=tIm049_1;tRe049_2=tRe049_2;tIm049_2=tIm049_2;tRe049_3=tRe049_3;tIm049_3=tIm049_3;tRe049_4=tRe049_4;tIm049_4=tIm049_4;tRe049_5=tRe049_5;tIm049_5=tIm049_5;tRe049_6=tRe049_6;tIm049_6=tIm049_6;tRe049_7=____F[i];tIm049_7=____F[i];
        tRe050_1=tRe050_1;tIm050_1=tIm050_1;tRe050_2=tRe050_2;tIm050_2=tIm050_2;tRe050_3=tRe050_3;tIm050_3=tIm050_3;tRe050_4=tRe050_4;tIm050_4=tIm050_4;tRe050_5=tRe050_5;tIm050_5=tIm050_5;tRe050_6=tRe050_6;tIm050_6=tIm050_6;tRe050_7=____F[i];tIm050_7=____F[i];
        tRe051_1=tRe051_1;tIm051_1=tIm051_1;tRe051_2=tRe051_2;tIm051_2=tIm051_2;tRe051_3=tRe051_3;tIm051_3=tIm051_3;tRe051_4=tRe051_4;tIm051_4=tIm051_4;tRe051_5=tRe051_5;tIm051_5=tIm051_5;tRe051_6=tRe051_6;tIm051_6=tIm051_6;tRe051_7=____F[i];tIm051_7=____F[i];
        tRe052_1=tRe052_1;tIm052_1=tIm052_1;tRe052_2=tRe052_2;tIm052_2=tIm052_2;tRe052_3=tRe052_3;tIm052_3=tIm052_3;tRe052_4=tRe052_4;tIm052_4=tIm052_4;tRe052_5=tRe052_5;tIm052_5=tIm052_5;tRe052_6=tRe052_6;tIm052_6=tIm052_6;tRe052_7=____F[i];tIm052_7=____F[i];
        tRe053_1=tRe053_1;tIm053_1=tIm053_1;tRe053_2=tRe053_2;tIm053_2=tIm053_2;tRe053_3=tRe053_3;tIm053_3=tIm053_3;tRe053_4=tRe053_4;tIm053_4=tIm053_4;tRe053_5=tRe053_5;tIm053_5=tIm053_5;tRe053_6=tRe053_6;tIm053_6=tIm053_6;tRe053_7=____F[i];tIm053_7=____F[i];
        tRe054_1=tRe054_1;tIm054_1=tIm054_1;tRe054_2=tRe054_2;tIm054_2=tIm054_2;tRe054_3=tRe054_3;tIm054_3=tIm054_3;tRe054_4=tRe054_4;tIm054_4=tIm054_4;tRe054_5=tRe054_5;tIm054_5=tIm054_5;tRe054_6=tRe054_6;tIm054_6=tIm054_6;tRe054_7=____F[i];tIm054_7=____F[i];
        tRe055_1=tRe055_1;tIm055_1=tIm055_1;tRe055_2=tRe055_2;tIm055_2=tIm055_2;tRe055_3=tRe055_3;tIm055_3=tIm055_3;tRe055_4=tRe055_4;tIm055_4=tIm055_4;tRe055_5=tRe055_5;tIm055_5=tIm055_5;tRe055_6=tRe055_6;tIm055_6=tIm055_6;tRe055_7=____F[i];tIm055_7=____F[i];
        tRe056_1=tRe056_1;tIm056_1=tIm056_1;tRe056_2=tRe056_2;tIm056_2=tIm056_2;tRe056_3=tRe056_3;tIm056_3=tIm056_3;tRe056_4=tRe056_4;tIm056_4=tIm056_4;tRe056_5=tRe056_5;tIm056_5=tIm056_5;tRe056_6=tRe056_6;tIm056_6=tIm056_6;tRe056_7=____F[i];tIm056_7=____F[i];
        tRe057_1=tRe057_1;tIm057_1=tIm057_1;tRe057_2=tRe057_2;tIm057_2=tIm057_2;tRe057_3=tRe057_3;tIm057_3=tIm057_3;tRe057_4=tRe057_4;tIm057_4=tIm057_4;tRe057_5=tRe057_5;tIm057_5=tIm057_5;tRe057_6=tRe057_6;tIm057_6=tIm057_6;tRe057_7=____F[i];tIm057_7=____F[i];
        tRe058_1=tRe058_1;tIm058_1=tIm058_1;tRe058_2=tRe058_2;tIm058_2=tIm058_2;tRe058_3=tRe058_3;tIm058_3=tIm058_3;tRe058_4=tRe058_4;tIm058_4=tIm058_4;tRe058_5=tRe058_5;tIm058_5=tIm058_5;tRe058_6=tRe058_6;tIm058_6=tIm058_6;tRe058_7=____F[i];tIm058_7=____F[i];
        tRe059_1=tRe059_1;tIm059_1=tIm059_1;tRe059_2=tRe059_2;tIm059_2=tIm059_2;tRe059_3=tRe059_3;tIm059_3=tIm059_3;tRe059_4=tRe059_4;tIm059_4=tIm059_4;tRe059_5=tRe059_5;tIm059_5=tIm059_5;tRe059_6=tRe059_6;tIm059_6=tIm059_6;tRe059_7=____F[i];tIm059_7=____F[i];
        tRe060_1=tRe060_1;tIm060_1=tIm060_1;tRe060_2=tRe060_2;tIm060_2=tIm060_2;tRe060_3=tRe060_3;tIm060_3=tIm060_3;tRe060_4=tRe060_4;tIm060_4=tIm060_4;tRe060_5=tRe060_5;tIm060_5=tIm060_5;tRe060_6=tRe060_6;tIm060_6=tIm060_6;tRe060_7=____F[i];tIm060_7=____F[i];
        tRe061_1=tRe061_1;tIm061_1=tIm061_1;tRe061_2=tRe061_2;tIm061_2=tIm061_2;tRe061_3=tRe061_3;tIm061_3=tIm061_3;tRe061_4=tRe061_4;tIm061_4=tIm061_4;tRe061_5=tRe061_5;tIm061_5=tIm061_5;tRe061_6=tRe061_6;tIm061_6=tIm061_6;tRe061_7=____F[i];tIm061_7=____F[i];
        tRe062_1=tRe062_1;tIm062_1=tIm062_1;tRe062_2=tRe062_2;tIm062_2=tIm062_2;tRe062_3=tRe062_3;tIm062_3=tIm062_3;tRe062_4=tRe062_4;tIm062_4=tIm062_4;tRe062_5=tRe062_5;tIm062_5=tIm062_5;tRe062_6=tRe062_6;tIm062_6=tIm062_6;tRe062_7=____F[i];tIm062_7=____F[i];
        tRe063_1=tRe063_1;tIm063_1=tIm063_1;tRe063_2=tRe063_2;tIm063_2=tIm063_2;tRe063_3=tRe063_3;tIm063_3=tIm063_3;tRe063_4=tRe063_4;tIm063_4=tIm063_4;tRe063_5=tRe063_5;tIm063_5=tIm063_5;tRe063_6=tRe063_6;tIm063_6=tIm063_6;tRe063_7=____F[i];tIm063_7=____F[i];
        tRe064_1=tRe064_1;tIm064_1=tIm064_1;tRe064_2=tRe064_2;tIm064_2=tIm064_2;tRe064_3=tRe064_3;tIm064_3=tIm064_3;tRe064_4=tRe064_4;tIm064_4=tIm064_4;tRe064_5=tRe064_5;tIm064_5=tIm064_5;tRe064_6=tRe064_6;tIm064_6=tIm064_6;tRe064_7=____F[i];tIm064_7=____F[i];
        

        i+=448;

        // Power 1
        twiddlelizer(out, tRe001_1,tIm001_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_1,tIm002_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_1,tIm003_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_1,tIm004_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_1,tIm005_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_1,tIm006_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_1,tIm007_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_1,tIm008_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_1,tIm009_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_1,tIm010_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_1,tIm011_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_1,tIm012_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_1,tIm013_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_1,tIm014_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_1,tIm015_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_1,tIm016_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe017_1,tIm017_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe018_1,tIm018_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe019_1,tIm019_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe020_1,tIm020_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe021_1,tIm021_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe022_1,tIm022_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe023_1,tIm023_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe024_1,tIm024_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe025_1,tIm025_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe026_1,tIm026_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe027_1,tIm027_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe028_1,tIm028_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe029_1,tIm029_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe030_1,tIm030_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe031_1,tIm031_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe032_1,tIm032_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe033_1,tIm033_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe034_1,tIm034_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe035_1,tIm035_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe036_1,tIm036_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe037_1,tIm037_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe038_1,tIm038_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe039_1,tIm039_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe040_1,tIm040_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe041_1,tIm041_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe042_1,tIm042_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe043_1,tIm043_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe044_1,tIm044_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe045_1,tIm045_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe046_1,tIm046_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe047_1,tIm047_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe048_1,tIm048_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe049_1,tIm049_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe050_1,tIm050_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe051_1,tIm051_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe052_1,tIm052_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe053_1,tIm053_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe054_1,tIm054_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe055_1,tIm055_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe056_1,tIm056_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe057_1,tIm057_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe058_1,tIm058_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe059_1,tIm059_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe060_1,tIm060_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe061_1,tIm061_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe062_1,tIm062_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe063_1,tIm063_1, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe064_1,tIm064_1, eReI1, eImI1, oReI1, oImI1);

        // Power 2
        twiddlelizer(out, tRe001_2,tIm001_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_2,tIm002_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_2,tIm003_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_2,tIm004_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_2,tIm005_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_2,tIm006_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_2,tIm007_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_2,tIm008_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_2,tIm009_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_2,tIm010_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_2,tIm011_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_2,tIm012_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_2,tIm013_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_2,tIm014_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_2,tIm015_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_2,tIm016_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe017_2,tIm017_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe018_2,tIm018_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe019_2,tIm019_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe020_2,tIm020_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe021_2,tIm021_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe022_2,tIm022_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe023_2,tIm023_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe024_2,tIm024_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe025_2,tIm025_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe026_2,tIm026_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe027_2,tIm027_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe028_2,tIm028_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe029_2,tIm029_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe030_2,tIm030_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe031_2,tIm031_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe032_2,tIm032_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe033_2,tIm033_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe034_2,tIm034_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe035_2,tIm035_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe036_2,tIm036_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe037_2,tIm037_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe038_2,tIm038_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe039_2,tIm039_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe040_2,tIm040_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe041_2,tIm041_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe042_2,tIm042_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe043_2,tIm043_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe044_2,tIm044_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe045_2,tIm045_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe046_2,tIm046_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe047_2,tIm047_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe048_2,tIm048_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe049_2,tIm049_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe050_2,tIm050_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe051_2,tIm051_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe052_2,tIm052_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe053_2,tIm053_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe054_2,tIm054_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe055_2,tIm055_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe056_2,tIm056_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe057_2,tIm057_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe058_2,tIm058_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe059_2,tIm059_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe060_2,tIm060_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe061_2,tIm061_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe062_2,tIm062_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe063_2,tIm063_2, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe064_2,tIm064_2, eReI1, eImI1, oReI1, oImI1);

        // Power 3
        twiddlelizer(out, tRe001_3,tIm001_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_3,tIm002_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_3,tIm003_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_3,tIm004_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_3,tIm005_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_3,tIm006_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_3,tIm007_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_3,tIm008_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_3,tIm009_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_3,tIm010_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_3,tIm011_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_3,tIm012_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_3,tIm013_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_3,tIm014_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_3,tIm015_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_3,tIm016_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe017_3,tIm017_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe018_3,tIm018_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe019_3,tIm019_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe020_3,tIm020_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe021_3,tIm021_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe022_3,tIm022_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe023_3,tIm023_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe024_3,tIm024_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe025_3,tIm025_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe026_3,tIm026_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe027_3,tIm027_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe028_3,tIm028_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe029_3,tIm029_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe030_3,tIm030_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe031_3,tIm031_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe032_3,tIm032_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe033_3,tIm033_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe034_3,tIm034_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe035_3,tIm035_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe036_3,tIm036_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe037_3,tIm037_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe038_3,tIm038_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe039_3,tIm039_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe040_3,tIm040_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe041_3,tIm041_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe042_3,tIm042_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe043_3,tIm043_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe044_3,tIm044_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe045_3,tIm045_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe046_3,tIm046_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe047_3,tIm047_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe048_3,tIm048_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe049_3,tIm049_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe050_3,tIm050_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe051_3,tIm051_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe052_3,tIm052_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe053_3,tIm053_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe054_3,tIm054_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe055_3,tIm055_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe056_3,tIm056_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe057_3,tIm057_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe058_3,tIm058_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe059_3,tIm059_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe060_3,tIm060_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe061_3,tIm061_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe062_3,tIm062_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe063_3,tIm063_3, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe064_3,tIm064_3, eReI1, eImI1, oReI1, oImI1);

        // Power 4
        twiddlelizer(out, tRe001_4,tIm001_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_4,tIm002_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_4,tIm003_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_4,tIm004_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_4,tIm005_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_4,tIm006_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_4,tIm007_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_4,tIm008_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_4,tIm009_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_4,tIm010_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_4,tIm011_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_4,tIm012_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_4,tIm013_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_4,tIm014_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_4,tIm015_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_4,tIm016_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe017_4,tIm017_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe018_4,tIm018_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe019_4,tIm019_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe020_4,tIm020_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe021_4,tIm021_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe022_4,tIm022_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe023_4,tIm023_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe024_4,tIm024_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe025_4,tIm025_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe026_4,tIm026_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe027_4,tIm027_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe028_4,tIm028_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe029_4,tIm029_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe030_4,tIm030_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe031_4,tIm031_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe032_4,tIm032_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe033_4,tIm033_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe034_4,tIm034_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe035_4,tIm035_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe036_4,tIm036_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe037_4,tIm037_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe038_4,tIm038_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe039_4,tIm039_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe040_4,tIm040_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe041_4,tIm041_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe042_4,tIm042_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe043_4,tIm043_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe044_4,tIm044_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe045_4,tIm045_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe046_4,tIm046_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe047_4,tIm047_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe048_4,tIm048_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe049_4,tIm049_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe050_4,tIm050_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe051_4,tIm051_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe052_4,tIm052_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe053_4,tIm053_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe054_4,tIm054_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe055_4,tIm055_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe056_4,tIm056_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe057_4,tIm057_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe058_4,tIm058_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe059_4,tIm059_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe060_4,tIm060_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe061_4,tIm061_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe062_4,tIm062_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe063_4,tIm063_4, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe064_4,tIm064_4, eReI1, eImI1, oReI1, oImI1);

        // Power 5
        twiddlelizer(out, tRe001_5,tIm001_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_5,tIm002_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_5,tIm003_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_5,tIm004_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_5,tIm005_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_5,tIm006_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_5,tIm007_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_5,tIm008_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_5,tIm009_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_5,tIm010_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_5,tIm011_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_5,tIm012_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_5,tIm013_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_5,tIm014_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_5,tIm015_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_5,tIm016_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe017_5,tIm017_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe018_5,tIm018_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe019_5,tIm019_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe020_5,tIm020_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe021_5,tIm021_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe022_5,tIm022_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe023_5,tIm023_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe024_5,tIm024_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe025_5,tIm025_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe026_5,tIm026_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe027_5,tIm027_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe028_5,tIm028_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe029_5,tIm029_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe030_5,tIm030_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe031_5,tIm031_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe032_5,tIm032_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe033_5,tIm033_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe034_5,tIm034_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe035_5,tIm035_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe036_5,tIm036_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe037_5,tIm037_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe038_5,tIm038_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe039_5,tIm039_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe040_5,tIm040_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe041_5,tIm041_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe042_5,tIm042_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe043_5,tIm043_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe044_5,tIm044_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe045_5,tIm045_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe046_5,tIm046_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe047_5,tIm047_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe048_5,tIm048_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe049_5,tIm049_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe050_5,tIm050_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe051_5,tIm051_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe052_5,tIm052_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe053_5,tIm053_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe054_5,tIm054_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe055_5,tIm055_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe056_5,tIm056_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe057_5,tIm057_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe058_5,tIm058_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe059_5,tIm059_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe060_5,tIm060_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe061_5,tIm061_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe062_5,tIm062_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe063_5,tIm063_5, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe064_5,tIm064_5, eReI1, eImI1, oReI1, oImI1);

        // Power 6
        twiddlelizer(out, tRe001_6,tIm001_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_6,tIm002_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_6,tIm003_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_6,tIm004_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_6,tIm005_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_6,tIm006_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_6,tIm007_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_6,tIm008_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_6,tIm009_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_6,tIm010_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_6,tIm011_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_6,tIm012_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_6,tIm013_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_6,tIm014_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_6,tIm015_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_6,tIm016_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe017_6,tIm017_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe018_6,tIm018_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe019_6,tIm019_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe020_6,tIm020_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe021_6,tIm021_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe022_6,tIm022_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe023_6,tIm023_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe024_6,tIm024_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe025_6,tIm025_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe026_6,tIm026_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe027_6,tIm027_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe028_6,tIm028_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe029_6,tIm029_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe030_6,tIm030_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe031_6,tIm031_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe032_6,tIm032_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe033_6,tIm033_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe034_6,tIm034_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe035_6,tIm035_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe036_6,tIm036_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe037_6,tIm037_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe038_6,tIm038_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe039_6,tIm039_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe040_6,tIm040_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe041_6,tIm041_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe042_6,tIm042_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe043_6,tIm043_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe044_6,tIm044_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe045_6,tIm045_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe046_6,tIm046_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe047_6,tIm047_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe048_6,tIm048_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe049_6,tIm049_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe050_6,tIm050_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe051_6,tIm051_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe052_6,tIm052_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe053_6,tIm053_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe054_6,tIm054_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe055_6,tIm055_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe056_6,tIm056_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe057_6,tIm057_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe058_6,tIm058_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe059_6,tIm059_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe060_6,tIm060_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe061_6,tIm061_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe062_6,tIm062_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe063_6,tIm063_6, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe064_6,tIm064_6, eReI1, eImI1, oReI1, oImI1);

        // Power 7
        twiddlelizer(out, tRe001_7,tIm001_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe002_7,tIm002_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe003_7,tIm003_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe004_7,tIm004_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe005_7,tIm005_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe006_7,tIm006_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe007_7,tIm007_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe008_7,tIm008_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe009_7,tIm009_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe010_7,tIm010_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe011_7,tIm011_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe012_7,tIm012_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe013_7,tIm013_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe014_7,tIm014_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe015_7,tIm015_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe016_7,tIm016_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe017_7,tIm017_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe018_7,tIm018_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe019_7,tIm019_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe020_7,tIm020_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe021_7,tIm021_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe022_7,tIm022_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe023_7,tIm023_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe024_7,tIm024_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe025_7,tIm025_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe026_7,tIm026_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe027_7,tIm027_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe028_7,tIm028_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe029_7,tIm029_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe030_7,tIm030_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe031_7,tIm031_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe032_7,tIm032_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe033_7,tIm033_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe034_7,tIm034_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe035_7,tIm035_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe036_7,tIm036_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe037_7,tIm037_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe038_7,tIm038_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe039_7,tIm039_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe040_7,tIm040_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe041_7,tIm041_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe042_7,tIm042_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe043_7,tIm043_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe044_7,tIm044_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe045_7,tIm045_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe046_7,tIm046_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe047_7,tIm047_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe048_7,tIm048_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe049_7,tIm049_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe050_7,tIm050_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe051_7,tIm051_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe052_7,tIm052_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe053_7,tIm053_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe054_7,tIm054_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe055_7,tIm055_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe056_7,tIm056_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe057_7,tIm057_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe058_7,tIm058_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe059_7,tIm059_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe060_7,tIm060_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe061_7,tIm061_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe062_7,tIm062_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe063_7,tIm063_7, eReI1, eImI1, oReI1, oImI1);
        twiddlelizer(out, tRe064_7,tIm064_7, eReI1, eImI1, oReI1, oImI1);

    }
    console.log("Iterations: ",its,"\tAccesses",accs);

    return out;
}
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

eff_p();
eff(512);
eff(1024);
eff(2048);

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
        //  ev  odd            ev odd     
        // _0     1            0    2     
        // (2)    3           _(1)  3     
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

function fftRealInPlaceRADIX4(realInput,type) {
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

    //return fftComplexInPlace_radix2(complexOut);
    //return fftComplexInPlace_flexi(complexOut);
    if(type == 4){ return fftComplexInPlace_seq_4(complexOut); }
    if(type == 5){ return fftComplexInPlace_seq_5(complexOut); }
    if(type == 6){ return fftComplexInPlace_seq_6(complexOut); }
    if(type == 7){ return fftComplexInPlace_seq_7(complexOut); }
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
const performFFTOperations = (fftSize,type) => {
    let testData;
    if(fftSize ==  512){ testData = testData512; } 
    if(fftSize == 1024){ testData = testData1024; } 
    if(fftSize == 2048){ testData = testData2048; } 
    if(fftSize == 4096){ testData = testData4096; } 

    // Perform FFT operations numOperations times
    for (let i = 0; i < numOperations; i++) {
        fftRealInPlaceRADIX4(testData,type);
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

measureTime(512,4);
measureTime(512,5);
measureTime(512,6);
measureTime(512,7);
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

/*
console.log(signal1);
console.log(computeInverseFFT(computeFFT(signal1)));
console.log(signal2);
console.log(computeInverseFFT(computeFFT(signal2)));
console.log(signal3);
console.log(computeInverseFFT(computeFFT(signal3)));
*/

//console.log(computeFFT(signal1));


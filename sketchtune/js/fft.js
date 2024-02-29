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


function fftComplexInPlace_seq(out) {
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


    let its = 0, accs = 0;
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
        

        i+=80;

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



// Power 3 -> 5500
// Power 4 ->
// Power 5 -> 5200 
// Power 6 -> 5000
// Power 7 -> 4200


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
   let bits = (Math.log2(N)+1);

   let looplen = (N>>1)*bits;
   console.log("Efficiency For N=",N); 
   for(let p = 1; p<=max_p; p++){
        const accesses_per_it = (2<<(p-1));
        const t_per_it = (2<<(p-1)) * p;
        const iterations = looplen / (t_per_it/2);  
        const accesses = accesses_per_it * iterations;
        const twiddles = t_per_it * iterations;
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

    //return fftComplexInPlace_radix2(complexOut);
    //return fftComplexInPlace_flexi(complexOut);
    return fftComplexInPlace_seq(complexOut);
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


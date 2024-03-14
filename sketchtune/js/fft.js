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


let factors  = LOOKUP_RADIX2_1024;
let ____F    = LOOKUP_RADIX2_1024;

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

let tRe0  = ____F[126 + ( 0)]; let tIm0  = ____F[126 + ( 1)];
let tRe1  = ____F[126 + ( 2)]; let tIm1  = ____F[126 + ( 3)];
let tRe2  = ____F[126 + ( 4)]; let tIm2  = ____F[126 + ( 5)];
let tRe3  = ____F[126 + ( 6)]; let tIm3  = ____F[126 + ( 7)];
let tRe4  = ____F[126 + ( 8)]; let tIm4  = ____F[126 + ( 9)];
let tRe5  = ____F[126 + (10)]; let tIm5  = ____F[126 + (11)];
let tRe6  = ____F[126 + (12)]; let tIm6  = ____F[126 + (13)];
let tRe7  = ____F[126 + (14)]; let tIm7  = ____F[126 + (15)];
let tRe8  = ____F[126 + (16)]; let tIm8  = ____F[126 + (17)];
let tRe9  = ____F[126 + (18)]; let tIm9  = ____F[126 + (19)];
let tRe10 = ____F[126 + (20)]; let tIm10 = ____F[126 + (21)];
let tRe11 = ____F[126 + (22)]; let tIm11 = ____F[126 + (23)];
let tRe12 = ____F[126 + (24)]; let tIm12 = ____F[126 + (25)];
let tRe13 = ____F[126 + (26)]; let tIm13 = ____F[126 + (27)];
let tRe14 = ____F[126 + (28)]; let tIm14 = ____F[126 + (29)];
let tRe15 = ____F[126 + (30)]; let tIm15 = ____F[126 + (31)];
let tRe16 = ____F[126 + (32)]; let tIm16 = ____F[126 + (33)];
let tRe17 = ____F[126 + (34)]; let tIm17 = ____F[126 + (35)];
let tRe18 = ____F[126 + (36)]; let tIm18 = ____F[126 + (37)];
let tRe19 = ____F[126 + (38)]; let tIm19 = ____F[126 + (39)];
let tRe20 = ____F[126 + (40)]; let tIm20 = ____F[126 + (41)];
let tRe21 = ____F[126 + (42)]; let tIm21 = ____F[126 + (43)];
let tRe22 = ____F[126 + (44)]; let tIm22 = ____F[126 + (45)];
let tRe23 = ____F[126 + (46)]; let tIm23 = ____F[126 + (47)];
let tRe24 = ____F[126 + (48)]; let tIm24 = ____F[126 + (49)];
let tRe25 = ____F[126 + (50)]; let tIm25 = ____F[126 + (51)];
let tRe26 = ____F[126 + (52)]; let tIm26 = ____F[126 + (53)];
let tRe27 = ____F[126 + (54)]; let tIm27 = ____F[126 + (55)];
let tRe28 = ____F[126 + (56)]; let tIm28 = ____F[126 + (57)];
let tRe29 = ____F[126 + (58)]; let tIm29 = ____F[126 + (59)];
let tRe30 = ____F[126 + (60)]; let tIm30 = ____F[126 + (61)];
let tRe31 = ____F[126 + (62)]; let tIm31 = ____F[126 + (63)];


// function fftComplex512(complexInput) {
//     // Create a copy of the input array
//     //const inputCopy = complexInput.slice();

//     // Perform bit reversal
//     for (let i = 0; i < 512; i++) {
//         out[i*2  ] = complexInput[map[i]*2  ];
//         out[i*2+1] = complexInput[map[i]*2+1];
//     }

//     /////////////////////////////////////////////
//     // P = 0  -> 4
//     //

//     for(let idx = 0; idx < 1024; idx+=8){
//     //for(let idx = 0; idx < 1024; idx+=4){
//           let x0aRe = out[idx    ]; let x0aIm = out[idx + 1]; 
//           let x1aRe = out[idx + 2]; let x1aIm = out[idx + 3]; 
//           let x2aRe = out[idx + 4]; let x2aIm = out[idx + 5]; 
//           let x3aRe = out[idx + 6]; let x3aIm = out[idx + 7]; 
//           out[idx      ] =  x0aRe + x1aRe + x2aRe + x3aRe;
//           out[idx  +  1] =  x0aIm + x1aIm + x2aIm + x3aIm; 
//           out[idx  +  2] =  x0aRe - x1aRe - x2aIm - x3aIm;
//           out[idx  +  3] =  x0aIm - x1aIm + x2aRe - x3aRe; 

//           out[idx  +  4] =  x0aRe + x1aRe - x2aRe - x3aRe; 
//           out[idx  +  5] =  x0aIm + x1aIm - x2aIm - x3aIm;
//           out[idx  +  6] =  x0aRe - x1aRe - x2aIm - x3aIm;
//           out[idx  +  7] = -(x0aIm - x1aIm + x2aRe - x3aRe);
//     }

//     /////////////////////////////////////////////
//     // P = 1  -> 16
//     //
//     for(let idx = 0; idx < 1024; idx+=32){
//     //for(let idx = 0; idx < 2048; idx+=32){
//           let x0aRe = out[idx     ];
//           let x0bRe = out[idx +  2]; 
//           let x0bIm = out[idx +  3];
//           let x0cRe = out[idx +  4];

//           let x1aRe = out[idx +  8];
//           out[idx +   8] = x0aRe - x1aRe; 
//           let x1bRe = out[idx + 10];
//           let x1bIm = out[idx + 11];
//           let x1cRe = out[idx + 12];

//           let x2aRe = out[idx + 16];
//           let x2bRe = out[idx + 18];
//           let x2bIm = out[idx + 19];
//           let x2cRe = out[idx + 20];

//           let x3aRe = out[idx + 24];
//           out[idx +  24] = x0aRe - x1aRe;
//           out[idx +  25] = x3aRe - x2aRe;  
//           let x3bRe = out[idx + 26];
//           let x3bIm = out[idx + 27];
//           let x3cRe = out[idx + 28];

//           out[idx      ] = x0aRe + x1aRe + x2aRe + x3aRe;  
//           out[idx +   9] = x2aRe - x3aRe;      
//           out[idx +  16] = x0aRe + x1aRe - x2aRe - x3aRe;

//           let x2cRe_tRe_2c = x2cRe * t1Re_2c;
//           let x3cRe_tRe_2c = x3cRe * t1Re_2c;

//           let resReC1 = x0cRe + x2cRe_tRe_2c - x3cRe_tRe_2c;
//           out[idx +  28] =   resReC1; 
//           out[idx +   4] =   resReC1; 
//           let resImC1 = x1cRe + x2cRe_tRe_2c + x3cRe_tRe_2c; 
//           out[idx +   5] =   resImC1; 
//           out[idx +  29] = - resImC1;
//           let resReC2 = x0cRe - x2cRe_tRe_2c + x3cRe_tRe_2c; 
//           out[idx +  20] =   resReC2;
//           out[idx +  12] =   resReC2; 
//           let resImC2 = x1cRe - x2cRe_tRe_2c - x3cRe_tRe_2c; 
//           out[idx +  13] = - resImC2; 
//           out[idx +  21] =   resImC2;  

//           let x1dif = (x1bRe-x1bIm);
//           let x1sum = (x1bRe+x1bIm);
//           let x3dif = (x3bRe-x3bIm);
//           let x3sum = (x3bRe+x3bIm);

//           let x1dif_tRe_1b = x1dif * t1Re_1b;
//           let x1sum_tRe_1b = x1sum * t1Re_1b;
          
//           let x3dif_tRe_1b2b = x3dif * t1Re_1b2b;
//           let x3dif_tRe_1b2d = x3dif * t1Re_1b2d;
//           let x3sum_tRe_1b2b = x3sum * t1Re_1b2b;
//           let x3sum_tRe_1b2d = x3sum * t1Re_1b2d;

//           let tempReB = (x3dif_tRe_1b2b - x3sum_tRe_1b2d + x2bRe*t1Re_2b - x2bIm*t1Re_2d);
//           let tempImB = (x3dif_tRe_1b2d + x3sum_tRe_1b2b + x2bRe*t1Re_2d + x2bIm*t1Re_2b);
//           let tempReD = (x3dif_tRe_1b2d + x3sum_tRe_1b2b - x2bRe*t1Re_2d - x2bIm*t1Re_2b);
//           let tempImD = (x3dif_tRe_1b2b - x3sum_tRe_1b2d - x2bRe*t1Re_2b + x2bIm*t1Re_2d);

//           let resReB1 = x0bRe  + x1dif_tRe_1b + tempReB;     
//           out[idx +   2] =   resReB1; 
//           out[idx +  30] =   resReB1;  
//           let resReB2 = x0bRe  + x1dif_tRe_1b - tempReB;     
//           out[idx +  18] =   resReB2;
//           out[idx +  14] =   resReB2; 
//           let resReD1 = x0bRe  - x1dif_tRe_1b - tempReD;     
//           out[idx +   6] =   resReD1; 
//           out[idx +  26] =   resReD1; 
//           let resReD2 = x0bRe  - x1dif_tRe_1b + tempReD;     
//           out[idx +  22] =   resReD2;
//           out[idx +  10] =   resReD2; 

//           let resImB1 = x0bIm  + x1sum_tRe_1b + tempImB;     
//           out[idx +   3] =   resImB1; 
//           out[idx +  31] = - resImB1;  
//           let resImB2 = x0bIm  + x1sum_tRe_1b - tempImB;     
//           out[idx +  19] =   resImB2;
//           out[idx +  15] = - resImB2; 
//           let resImD1 =-x0bIm  + x1sum_tRe_1b - tempImD;     
//           out[idx +   7] =   resImD1; 
//           out[idx +  27] = - resImD1; 
//           let resImD2 =-x0bIm  + x1sum_tRe_1b + tempImD;     
//           out[idx +  23] =   resImD2;  
//           out[idx +  11] = - resImD2; 
//     }


//     /////////////////////////////////////////////
//     // P = 2  -> 64
//     //
//     for(let idx = 0; idx < 1024; idx+=128){
//     //for(let idx = 0; idx < 2048; idx+=128){
          
//           let x0aRe_0 = out[idx       ];
//           let x0bRe_0 = out[idx   +  2]; let x0bIm_0 = out[idx   +  3];
//           let x0cRe_0 = out[idx   +  4]; let x0cIm_0 = out[idx   +  5];
//           let x0dRe_0 = out[idx   +  6]; let x0dIm_0 = out[idx   +  7];
//           let x0aRe_4 = out[idx   +  8]; let x0aIm_4 = out[idx   +  9];
//           let x0bRe_4 = out[idx   + 10]; let x0bIm_4 = out[idx   + 11];
//           let x0cRe_4 = out[idx   + 12]; let x0cIm_4 = out[idx   + 13];
//           let x0dRe_4 = out[idx   + 14]; let x0dIm_4 = out[idx   + 15];
//           let x0aRe_8 = out[idx   + 16];                                       //turning point

//           let x1aRe_0 = out[idx   + 32];
//           let x1bRe_0 = out[idx   + 34]; let x1bIm_0 = out[idx   + 35];
//           let x1cRe_0 = out[idx   + 36]; let x1cIm_0 = out[idx   + 37];
//           let x1dRe_0 = out[idx   + 38]; let x1dIm_0 = out[idx   + 39];
//           let x1aRe_4 = out[idx   + 40]; let x1aIm_4 = out[idx   + 41];
//           let x1bRe_4 = out[idx   + 42]; let x1bIm_4 = out[idx   + 43];
//           let x1cRe_4 = out[idx   + 44]; let x1cIm_4 = out[idx   + 45];
//           let x1dRe_4 = out[idx   + 46]; let x1dIm_4 = out[idx   + 47];
//           let x1aRe_8 = out[idx   + 48]; let x1aIm_8 = out[idx   + 49];        //turning point

//           let x2aRe_0 = out[idx   + 64]; let x2aIm_0 = out[idx   + 65];
//           let x2bRe_0 = out[idx   + 66]; let x2bIm_0 = out[idx   + 67];
//           let x2cRe_0 = out[idx   + 68]; let x2cIm_0 = out[idx   + 69];
//           let x2dRe_0 = out[idx   + 70]; let x2dIm_0 = out[idx   + 71];
//           let x2aRe_4 = out[idx   + 72]; let x2aIm_4 = out[idx   + 73];
//           let x2bRe_4 = out[idx   + 74]; let x2bIm_4 = out[idx   + 75];
//           let x2cRe_4 = out[idx   + 76]; let x2cIm_4 = out[idx   + 77];
//           let x2dRe_4 = out[idx   + 78]; let x2dIm_4 = out[idx   + 79];
//           let x2aRe_8 = out[idx   + 80]; let x2aIm_8 = out[idx   + 81];        //turning point

//           let x3aRe_0 = out[idx   + 96]; let x3aIm_0 = out[idx   + 97];
//           let x3bRe_0 = out[idx   + 98]; let x3bIm_0 = out[idx   + 99];
//           let x3cRe_0 = out[idx   +100]; let x3cIm_0 = out[idx   +101];
//           let x3dRe_0 = out[idx   +102]; let x3dIm_0 = out[idx   +103];
//           let x3aRe_4 = out[idx   +104]; let x3aIm_4 = out[idx   +105];
//           let x3bRe_4 = out[idx   +106]; let x3bIm_4 = out[idx   +107];
//           let x3cRe_4 = out[idx   +108]; let x3cIm_4 = out[idx   +109];
//           let x3dRe_4 = out[idx   +110]; let x3dIm_4 = out[idx   +111];
//           let x3aRe_8 = out[idx   +112]; let x3aIm_8 = out[idx   +113];        //turning point

//           let T0x1bRe = (x1bRe_0 * t2Re_1b - x1bIm_0 * t2Re_1h);
//           let T0x1bIm = (x1bRe_0 * t2Re_1h + x1bIm_0 * t2Re_1b);
//           let T0x3bRe = (x3bRe_0 * t2Re_1b - x3bIm_0 * t2Re_1h);
//           let T0x3bIm = (x3bRe_0 * t2Re_1h + x3bIm_0 * t2Re_1b);

//           let T0x0cRe = (x1cRe_0 * t2Re_1c - x1cIm_0 * t2Re_1g);
//           let T0x0cIm = (x1cRe_0 * t2Re_1g + x1cIm_0 * t2Re_1c);
//           let T0x2cRe = (x3cRe_0 * t2Re_1c - x3cIm_0 * t2Re_1g);
//           let T0x2cIm = (x3cRe_0 * t2Re_1g + x3cIm_0 * t2Re_1c);

//           let T0x1dRe = (x1dRe_0 * t2Re_1d - x1dIm_0 * t2Re_1f);
//           let T0x1dIm = (x1dRe_0 * t2Re_1f + x1dIm_0 * t2Re_1d);
//           let T0x3dRe = (x3dRe_0 * t2Re_1d - x3dIm_0 * t2Re_1f);
//           let T0x3dIm = (x3dRe_0 * t2Re_1f + x3dIm_0 * t2Re_1d);

//           out[idx       ] =   (x0aRe_0 + x1aRe_0) + (x2aRe_0 + x3aRe_0);
//           out[idx  +  64] =   (x0aRe_0 + x1aRe_0) - (x2aRe_0 + x3aRe_0);
//           out[idx  +  65] =                       - (x2aIm_0 + x3aIm_0);
//           out[idx  +   1] =                         (x2aIm_0 + x3aIm_0); 
//           let res0ReB = x0bRe_0 + T0x1bRe + ((x2bRe_0 + T0x3bRe)*  t2Re_2b - ((x2bIm_0 + T0x3bIm)*  t2Re_2p));
//           out[idx  +   2] =   res0ReB;
//           out[idx  + 126] =   res0ReB; 
//           let res0ImB = x0bIm_0 + T0x1bIm + ((x2bRe_0 + T0x3bRe)*  t2Re_2p + ((x2bIm_0 + T0x3bIm)*  t2Re_2b)); 
//           out[idx  + 127] = - res0ImB;
//           out[idx  +   3] =   res0ImB;
//           let res0ReC = x0cRe_0 + T0x0cRe + ((x2cRe_0 + T0x2cRe)*  t2Re_2c - ((x2cIm_0 + T0x2cIm)*  t2Re_2o));  
//           out[idx  +   4] =   res0ReC;
//           out[idx  + 124] =   res0ReC;
//           let res0ImC = x0cIm_0 + T0x0cIm + ((x2cRe_0 + T0x2cRe)*  t2Re_2o + ((x2cIm_0 + T0x2cIm)*  t2Re_2c));
//           out[idx  + 125] = - res0ImC;
//           out[idx  +   5] =   res0ImC; 
//           let res0ReD = x0dRe_0 + T0x1dRe + ((x2dRe_0 + T0x3dRe)*  t2Re_2d - ((x2dIm_0 + T0x3dIm)*  t2Re_2n));  
//           out[idx  +   6] =   res0ReD;
//           out[idx  + 122] =   res0ReD;
//           let res0ImD = x0dIm_0 + T0x1dIm + ((x2dRe_0 + T0x3dRe)*  t2Re_2n + ((x2dIm_0 + T0x3dIm)*  t2Re_2d)); 
//           out[idx  + 123] = - res0ImD;
//           out[idx  +   7] =   res0ImD;  
//           let res1ReA =    (x0aRe_0 - x1aRe_0) - (x2aIm_0 - x3aIm_0);
//           out[idx  +  32] =   res1ReA;
//           out[idx  +  96] =   res1ReA;
//           let res1ImA =                          (x2aRe_0 - x3aRe_0); 
//           out[idx  +  97] = - res1ImA;
//           out[idx  +  33] =   res1ImA;
//           let res1ReB = x0bRe_0 - T0x1bRe + ((x2bRe_0 - T0x3bRe)* -t2Re_2p  - ((x2bIm_0 - T0x3bIm)*  t2Re_2b ));
//           out[idx  +  34] =   res1ReB;
//           out[idx  +  94] =   res1ReB;
//           let res1ImB = x0bIm_0 - T0x1bIm + ((x2bRe_0 - T0x3bRe)*  t2Re_2b  + ((x2bIm_0 - T0x3bIm)* -t2Re_2p )); 
//           out[idx  +  95] = - res1ImB; 
//           out[idx  +  35] =   res1ImB;
//           let res1ReC = x0cRe_0 - T0x0cRe + ((x2cRe_0 - T0x2cRe)* -t2Re_2o  - ((x2cIm_0 - T0x2cIm)*  t2Re_2c )); 
//           out[idx  +  36] =   res1ReC;
//           out[idx  +  92] =   res1ReC;
//           let res1ImC = x0cIm_0 - T0x0cIm + ((x2cRe_0 - T0x2cRe)*  t2Re_2c  + ((x2cIm_0 - T0x2cIm)* -t2Re_2o ));
//           out[idx  +  93] = - res1ImC;  
//           out[idx  +  37] =   res1ImC; 
//           let res1ReD = x0dRe_0 - T0x1dRe + ((x2dRe_0 - T0x3dRe)* -t2Re_2n  - ((x2dIm_0 - T0x3dIm)*  t2Re_2d ));
//           out[idx  +  38] =   res1ReD;
//           out[idx  +  90] =   res1ReD;
//           let res1ImD = x0dIm_0 - T0x1dIm + ((x2dRe_0 - T0x3dRe)*  t2Re_2d  + ((x2dIm_0 - T0x3dIm)* -t2Re_2n ));  
//           out[idx  +  91] = - res1ImD; 
//           out[idx  +  39] =   res1ImD;

//           let T1x0aRe = (x1aRe_4 * t2Re_1e - x1aIm_4 * t2Re_1e);
//           let T1x0aIm = (x1aRe_4 * t2Re_1e + x1aIm_4 * t2Re_1e);
//           let T1x2aRe = (x3aRe_4 * t2Re_1e - x3aIm_4 * t2Re_1e);
//           let T1x2aIm = (x3aRe_4 * t2Re_1e + x3aIm_4 * t2Re_1e);

//           let T1x1bRe = (x1bRe_4 * t2Re_1f - x1bIm_4 * t2Re_1d);
//           let T1x1bIm = (x1bRe_4 * t2Re_1d + x1bIm_4 * t2Re_1f);
//           let T1x3bRe = (x3bRe_4 * t2Re_1f - x3bIm_4 * t2Re_1d);
//           let T1x3bIm = (x3bRe_4 * t2Re_1d + x3bIm_4 * t2Re_1f);

//           let T1x0cRe = (x1cRe_4 * t2Re_1g - x1cIm_4 * t2Re_1c);
//           let T1x0cIm = (x1cRe_4 * t2Re_1c + x1cIm_4 * t2Re_1g);
//           let T1x2cRe = (x3cRe_4 * t2Re_1g - x3cIm_4 * t2Re_1c);
//           let T1x2cIm = (x3cRe_4 * t2Re_1c + x3cIm_4 * t2Re_1g);

//           let T1x1dRe = (x1dRe_4 * t2Re_1h - x1dIm_4 * t2Re_1b);
//           let T1x1dIm = (x1dRe_4 * t2Re_1b + x1dIm_4 * t2Re_1h);
//           let T1x3dRe = (x3dRe_4 * t2Re_1h - x3dIm_4 * t2Re_1b);
//           let T1x3dIm = (x3dRe_4 * t2Re_1b + x3dIm_4 * t2Re_1h);

//           let res2ReA = x0aRe_4 + T1x0aRe + ((x2aRe_4 + T1x2aRe)*  t2Re_2e - ((x2aIm_4 + T1x2aIm)*  t2Re_2m));  
//           out[idx  +   8] =   res2ReA;
//           out[idx  + 120] =   res2ReA;
//           let res2ImA = x0aIm_4 + T1x0aIm + ((x2aRe_4 + T1x2aRe)*  t2Re_2m + ((x2aIm_4 + T1x2aIm)*  t2Re_2e)); 
//           out[idx  + 121] = - res2ImA; 
//           out[idx  +   9] =   res2ImA;
//           let res2ReB = x0bRe_4 + T1x1bRe + ((x2bRe_4 + T1x3bRe)*  t2Re_2f - ((x2bIm_4 + T1x3bIm)*  t2Re_2l));
//           out[idx  +  10] =   res2ReB;
//           out[idx  + 118] =   res2ReB; 
//           let res2ImB = x0bIm_4 + T1x1bIm + ((x2bRe_4 + T1x3bRe)*  t2Re_2l + ((x2bIm_4 + T1x3bIm)*  t2Re_2f));  
//           out[idx  + 119] = - res2ImB; 
//           out[idx  +  11] =   res2ImB; 
//           let res2ReC = x0cRe_4 + T1x0cRe + ((x2cRe_4 + T1x2cRe)*  t2Re_2g - ((x2cIm_4 + T1x2cIm)*  t2Re_2k));
//           out[idx  +  12] =   res2ReC;
//           out[idx  + 116] =   res2ReC;  
//           let res2ImC = x0cIm_4 + T1x0cIm + ((x2cRe_4 + T1x2cRe)*  t2Re_2k + ((x2cIm_4 + T1x2cIm)*  t2Re_2g)); 
//           out[idx  + 117] = - res2ImC; 
//           out[idx  +  13] =   res2ImC; 
//           let res2ReD = x0dRe_4 + T1x1dRe + ((x2dRe_4 + T1x3dRe)*  t2Re_2h - ((x2dIm_4 + T1x3dIm)*  t2Re_2j));  
//           out[idx  +  14] =   res2ReD;
//           out[idx  + 114] =   res2ReD;
//           let res2ImD = x0dIm_4 + T1x1dIm + ((x2dRe_4 + T1x3dRe)*  t2Re_2j + ((x2dIm_4 + T1x3dIm)*  t2Re_2h));
//           out[idx  + 115] = - res2ImD; 
//           out[idx  +  15] =   res2ImD;
//           let res3ReA = x0aRe_4 - T1x0aRe + ((x2aRe_4 - T1x2aRe)* -t2Re_2m  - ((x2aIm_4 - T1x2aIm)*  t2Re_2e ));
//           out[idx  +  40] =   res3ReA;
//           out[idx  +  88] =   res3ReA;
//           let res3ImA = x0aIm_4 - T1x0aIm + ((x2aRe_4 - T1x2aRe)*  t2Re_2e  + ((x2aIm_4 - T1x2aIm)* -t2Re_2m )); 
//           out[idx  +  89] = - res3ImA;
//           out[idx  +  41] =   res3ImA; 
//           let res3ReB = x0bRe_4 - T1x1bRe + ((x2bRe_4 - T1x3bRe)* -t2Re_2l  - ((x2bIm_4 - T1x3bIm)*  t2Re_2f ));
//           out[idx  +  42] =   res3ReB; 
//           out[idx  +  86] =   res3ReB;
//           let res3ImB = x0bIm_4 - T1x1bIm + ((x2bRe_4 - T1x3bRe)*  t2Re_2f  + ((x2bIm_4 - T1x3bIm)* -t2Re_2l ));
//           out[idx  +  87] = - res3ImB; 
//           out[idx  +  43] =   res3ImB; 
//           let res3ReC = x0cRe_4 - T1x0cRe + ((x2cRe_4 - T1x2cRe)* -t2Re_2k  - ((x2cIm_4 - T1x2cIm)*  t2Re_2g ));
//           out[idx  +  44] =   res3ReC;
//           out[idx  +  84] =   res3ReC;
//           let res3ImC = x0cIm_4 - T1x0cIm + ((x2cRe_4 - T1x2cRe)*  t2Re_2g  + ((x2cIm_4 - T1x2cIm)* -t2Re_2k )); 
//           out[idx  +  85] = - res3ImC;
//           out[idx  +  45] =   res3ImC;
//           let res3ReD = x0dRe_4 - T1x1dRe + ((x2dRe_4 - T1x3dRe)* -t2Re_2j  - ((x2dIm_4 - T1x3dIm)*  t2Re_2h ));
//           out[idx  +  46] =   res3ReD;
//           out[idx  +  82] =   res3ReD;
//           let res3ImD = x0dIm_4 - T1x1dIm + ((x2dRe_4 - T1x3dRe)*  t2Re_2h  + ((x2dIm_4 - T1x3dIm)* -t2Re_2j ));
//           out[idx  +  83] = - res3ImD;
//           out[idx  +  47] =   res3ImD; 

//           let T2x0aRe = - x1aIm_8;
//           let T2x0aIm =   x1aRe_8;
//           let T2x2aRe = - x3aIm_8;
//           let T2x2aIm =   x3aRe_8;

//           let T2x1bRe = (x1dRe_4 * -t2Re_1h - -x1dIm_4 *  t2Re_1b);
//           let T2x1bIm = (x1dRe_4 *  t2Re_1b + -x1dIm_4 * -t2Re_1h);
//           let T2x3bRe = (x3dRe_4 * -t2Re_1h - -x3dIm_4 *  t2Re_1b);
//           let T2x3bIm = (x3dRe_4 *  t2Re_1b + -x3dIm_4 * -t2Re_1h);

//           let T2x0cRe = (x1cRe_4 * -t2Re_1g - -x1cIm_4 *  t2Re_1c);
//           let T2x0cIm = (x1cRe_4 *  t2Re_1c + -x1cIm_4 * -t2Re_1g);
//           let T2x2cRe = (x3cRe_4 * -t2Re_1g - -x3cIm_4 *  t2Re_1c);
//           let T2x2cIm = (x3cRe_4 *  t2Re_1c + -x3cIm_4 * -t2Re_1g);

//           let T2x1dRe = (x1bRe_4 * -t2Re_1f - -x1bIm_4 *  t2Re_1d);
//           let T2x1dIm = (x1bRe_4 *  t2Re_1d + -x1bIm_4 * -t2Re_1f);
//           let T2x3dRe = (x3bRe_4 * -t2Re_1f - -x3bIm_4 *  t2Re_1d);
//           let T2x3dIm = (x3bRe_4 *  t2Re_1d + -x3bIm_4 * -t2Re_1f);

//           let res4ReA =  x0aRe_8 + T2x0aRe + ((x2aRe_8 + T2x2aRe)*  t2Re_2i - (( x2aIm_8 + T2x2aIm)*  t2Re_2i)); 
//           out[idx  +  16] =   res4ReA;
//           out[idx  + 112] =   res4ReA; 
//           let res4ImA =  0       + T2x0aIm + ((x2aRe_8 + T2x2aRe)*  t2Re_2i + (( x2aIm_8 + T2x2aIm)*  t2Re_2i)); 
//           out[idx  + 113] = - res4ImA; 
//           out[idx  +  17] =   res4ImA;
//           let res4ReB =  x0dRe_4 + T2x1bRe + ((x2dRe_4 + T2x3bRe)*  t2Re_2j - ((-x2dIm_4 + T2x3bIm)*  t2Re_2h)); 
//           out[idx  +  18] =   res4ReB;
//           out[idx  + 110] =   res4ReB;
//           let res4ImB = -x0dIm_4 + T2x1bIm + ((x2dRe_4 + T2x3bRe)*  t2Re_2h + ((-x2dIm_4 + T2x3bIm)*  t2Re_2j)); 
//           out[idx  + 111] = - res4ImB; 
//           out[idx  +  19] =   res4ImB; 
//           let res4ReC =  x0cRe_4 + T2x0cRe + ((x2cRe_4 + T2x2cRe)*  t2Re_2k - ((-x2cIm_4 + T2x2cIm)*  t2Re_2g)); 
//           out[idx  +  20] =   res4ReC;
//           out[idx  + 108] =   res4ReC; 
//           let res4ImC = -x0cIm_4 + T2x0cIm + ((x2cRe_4 + T2x2cRe)*  t2Re_2g + ((-x2cIm_4 + T2x2cIm)*  t2Re_2k));   
//           out[idx  + 109] = - res4ImC;
//           out[idx  +  21] =   res4ImC;
//           let res4ReD =  x0bRe_4 + T2x1dRe + ((x2bRe_4 + T2x3dRe)*  t2Re_2l - ((-x2bIm_4 + T2x3dIm)*  t2Re_2f)); 
//           out[idx  +  22] =   res4ReD;
//           out[idx  + 106] =   res4ReD; 
//           let res4ImD = -x0bIm_4 + T2x1dIm + ((x2bRe_4 + T2x3dRe)*  t2Re_2f + ((-x2bIm_4 + T2x3dIm)*  t2Re_2l)); 
//           out[idx  + 107] = - res4ImD;
//           out[idx  +  23] =   res4ImD;
//           let res5ReA =  x0aRe_8 - T2x0aRe + ((x2aRe_8 - T2x2aRe)* -t2Re_2i  - (( x2aIm_8 - T2x2aIm)*  t2Re_2i ));
//           out[idx  +  48] =   res5ReA;
//           out[idx  +  80] =   res5ReA;
//           let res5ImA =  0       - T2x0aIm + ((x2aRe_8 - T2x2aRe)*  t2Re_2i  + (( x2aIm_8 - T2x2aIm)* -t2Re_2i ));
//           out[idx  +  81] = - res5ImA;
//           out[idx  +  49] =   res5ImA; 
//           let res5ReB =  x0dRe_4 - T2x1bRe + ((x2dRe_4 - T2x3bRe)* -t2Re_2h  - ((-x2dIm_4 - T2x3bIm)*  t2Re_2j ));
//           out[idx  +  50] =   res5ReB;
//           out[idx  +  78] =   res5ReB;
//           let res5ImB = -x0dIm_4 - T2x1bIm + ((x2dRe_4 - T2x3bRe)*  t2Re_2j  + ((-x2dIm_4 - T2x3bIm)* -t2Re_2h ));
//           out[idx  +  79] = - res5ImB;
//           out[idx  +  51] =   res5ImB; 
//           let res5ReC =  x0cRe_4 - T2x0cRe + ((x2cRe_4 - T2x2cRe)* -t2Re_2g  - ((-x2cIm_4 - T2x2cIm)*  t2Re_2k ));
//           out[idx  +  52] =   res5ReC;
//           out[idx  +  76] =   res5ReC;
//           let res5ImC = -x0cIm_4 - T2x0cIm + ((x2cRe_4 - T2x2cRe)*  t2Re_2k  + ((-x2cIm_4 - T2x2cIm)* -t2Re_2g ));
//           out[idx  +  77] = - res5ImC; 
//           out[idx  +  53] =   res5ImC;
//           let res5ReD =  x0bRe_4 - T2x1dRe + ((x2bRe_4 - T2x3dRe)* -t2Re_2f  - ((-x2bIm_4 - T2x3dIm)*  t2Re_2l ));
//           out[idx  +  54] =   res5ReD;
//           out[idx  +  74] =   res5ReD;
//           let res5ImD = -x0bIm_4 - T2x1dIm + ((x2bRe_4 - T2x3dRe)*  t2Re_2l  + ((-x2bIm_4 - T2x3dIm)* -t2Re_2f ));
//           out[idx  +  75] = - res5ImD;
//           out[idx  +  55] =   res5ImD;

//           let T3x0aRe = (x1aRe_4  * -t2Re_1e - -x1aIm_4 *  t2Re_1e);
//           let T3x0aIm = (x1aRe_4  *  t2Re_1e + -x1aIm_4 * -t2Re_1e);
//           let T3x2aRe = (x3aRe_4  * -t2Re_1e - -x3aIm_4 *  t2Re_1e);
//           let T3x2aIm = (x3aRe_4  *  t2Re_1e + -x3aIm_4 * -t2Re_1e);

//           let T3x1bRe = (x1dRe_0  * -t2Re_1d - -x1dIm_0 *  t2Re_1f);
//           let T3x1bIm = (x1dRe_0  *  t2Re_1f + -x1dIm_0 * -t2Re_1d);
//           let T3x3bRe = (x3dRe_0  * -t2Re_1d - -x3dIm_0 *  t2Re_1f);
//           let T3x3bIm = (x3dRe_0  *  t2Re_1f + -x3dIm_0 * -t2Re_1d);

//           let T3x0cRe = (x1cRe_0  * -t2Re_1c - -x1cIm_0 *  t2Re_1g);
//           let T3x0cIm = (x1cRe_0  *  t2Re_1g + -x1cIm_0 * -t2Re_1c);
//           let T3x2cRe = (x3cRe_0  * -t2Re_1c - -x3cIm_0 *  t2Re_1g);
//           let T3x2cIm = (x3cRe_0  *  t2Re_1g + -x3cIm_0 * -t2Re_1c);

//           let T3x1dRe = (x1bRe_0  * -t2Re_1b - -x1bIm_0 *  t2Re_1h);
//           let T3x1dIm = (x1bRe_0  *  t2Re_1h + -x1bIm_0 * -t2Re_1b);
//           let T3x3dRe = (x3bRe_0  * -t2Re_1b - -x3bIm_0 *  t2Re_1h);
//           let T3x3dIm = (x3bRe_0  *  t2Re_1h + -x3bIm_0 * -t2Re_1b);

//           let res6ReA =  x0aRe_4 + T3x0aRe + ((x2aRe_4 + T3x2aRe)*  t2Re_2m - ((-x2aIm_4 + T3x2aIm)*  t2Re_2e));  
//           out[idx  +  24] =   res6ReA;
//           out[idx  + 104] =   res6ReA;
//           let res6ImA = -x0aIm_4 + T3x0aIm + ((x2aRe_4 + T3x2aRe)*  t2Re_2e + ((-x2aIm_4 + T3x2aIm)*  t2Re_2m)); 
//           out[idx  + 105] = - res6ImA; 
//           out[idx  +  25] =   res6ImA;
//           let res6ReB =  x0dRe_0 + T3x1bRe + ((x2dRe_0 + T3x3bRe)*  t2Re_2n - ((-x2dIm_0 + T3x3bIm)*  t2Re_2d)); 
//           out[idx  +  26] =   res6ReB;
//           out[idx  + 102] =   res6ReB;
//           let res6ImB = -x0dIm_0 + T3x1bIm + ((x2dRe_0 + T3x3bRe)*  t2Re_2d + ((-x2dIm_0 + T3x3bIm)*  t2Re_2n)); 
//           out[idx  + 103] = - res6ImB; 
//           out[idx  +  27] =   res6ImB; 
//           let res6ReC =  x0cRe_0 + T3x0cRe + ((x2cRe_0 + T3x2cRe)*  t2Re_2o - ((-x2cIm_0 + T3x2cIm)*  t2Re_2c));  
//           out[idx  +  28] =   res6ReC;
//           out[idx  + 100] =   res6ReC;
//           let res6ImC = -x0cIm_0 + T3x0cIm + ((x2cRe_0 + T3x2cRe)*  t2Re_2c + ((-x2cIm_0 + T3x2cIm)*  t2Re_2o)); 
//           out[idx  + 101] = - res6ImC; 
//           out[idx  +  29] =   res6ImC; 
//           let res6ReD =  x0bRe_0 + T3x1dRe + ((x2bRe_0 + T3x3dRe)*  t2Re_2p - ((-x2bIm_0 + T3x3dIm)*  t2Re_2b)); 
//           out[idx  +  30] =   res6ReD;
//           out[idx  +  98] =   res6ReD; 
//           let res6ImD = -x0bIm_0 + T3x1dIm + ((x2bRe_0 + T3x3dRe)*  t2Re_2b + ((-x2bIm_0 + T3x3dIm)*  t2Re_2p)); 
//           out[idx  +  99] = - res6ImD;
//           out[idx  +  31] =   res6ImD;
//           let res7ReA =  x0aRe_4 - T3x0aRe + ((x2aRe_4 - T3x2aRe)* -t2Re_2e  - ((-x2aIm_4 - T3x2aIm)*  t2Re_2m ));
//           out[idx  +  56] =   res7ReA;
//           out[idx  +  72] =   res7ReA;
//           let res7ImA = -x0aIm_4 - T3x0aIm + ((x2aRe_4 - T3x2aRe)*  t2Re_2m  + ((-x2aIm_4 - T3x2aIm)* -t2Re_2e ));
//           out[idx  +  73] = - res7ImA;
//           out[idx  +  57] =   res7ImA;
//           let res7ReB =  x0dRe_0 - T3x1bRe + ((x2dRe_0 - T3x3bRe)* -t2Re_2d  - ((-x2dIm_0 - T3x3bIm)*  t2Re_2n ));
//           out[idx  +  58] =   res7ReB;
//           out[idx  +  70] =   res7ReB;
//           let res7ImB = -x0dIm_0 - T3x1bIm + ((x2dRe_0 - T3x3bRe)*  t2Re_2n  + ((-x2dIm_0 - T3x3bIm)* -t2Re_2d ));
//           out[idx  +  71] = - res7ImB; 
//           out[idx  +  59] =   res7ImB;
//           let res7ReC =  x0cRe_0 - T3x0cRe + ((x2cRe_0 - T3x2cRe)* -t2Re_2c  - ((-x2cIm_0 - T3x2cIm)*  t2Re_2o ));
//           out[idx  +  60] =   res7ReC;
//           out[idx  +  68] =   res7ReC;
//           let res7ImC = -x0cIm_0 - T3x0cIm + ((x2cRe_0 - T3x2cRe)*  t2Re_2o  + ((-x2cIm_0 - T3x2cIm)* -t2Re_2c ));
//           out[idx  +  69] = - res7ImC;
//           out[idx  +  61] =   res7ImC;
//           let res7ReD =  x0bRe_0 - T3x1dRe + ((x2bRe_0 - T3x3dRe)* -t2Re_2b  - ((-x2bIm_0 - T3x3dIm)*  t2Re_2p ));
//           out[idx  +  62] =   res7ReD;
//           out[idx  +  66] =   res7ReD;
//           let res7ImD = -x0bIm_0 - T3x1dIm + ((x2bRe_0 - T3x3dRe)*  t2Re_2p  + ((-x2bIm_0 - T3x3dIm)* -t2Re_2b ));
//           out[idx  +  67] = - res7ImD;
//           out[idx  +  63] =   res7ImD;
//     }

    
//     /////////////////////////////////////////////
//     // P = 2.5  -> 128
//     //
//             for(let idx = 0; idx < 1024; idx += 256){
//             //for(let idx = 0; idx < 2048; idx += 256){
//                 let oRe0   = out[idx +  128]; 
//                 let oIm0  = out[idx +  129];
//                 let eRe0   = out[idx +    0]; 
//                 let eIm0  = out[idx +    1];
//                 let resRe0_s = eRe0 + oRe0;
//                 out[idx +   0] = resRe0_s;
//                 let resIm0_s = eIm0 + oIm0;
//                 out[idx +   1] = resIm0_s;
//                 let resRe0_d = eRe0 - oRe0;
//                 out[idx + 128] = resRe0_d;
//                 let resIm0_d = eIm0 - oIm0
//                 out[idx + 129] = resIm0_d;

//                 let oRe1   = out[idx +  130]; 
//                 let oIm1  = out[idx +  131];
//                 let eRe1   = out[idx +    2]; 
//                 let eIm1  = out[idx +    3];
//                 let resIm1_s = eIm1 + (oRe1 * tRe31 + oIm1 * tRe1);
//                 out[idx +   3] =  resIm1_s;
//                 out[idx + 255] = -resIm1_s;  
//                 let resRe1_s = eRe1 + (oRe1 * tRe1 - oIm1 * tRe31);
//                 out[idx + 254] =  resRe1_s;
//                 out[idx +   2] =  resRe1_s; 
//                 let resRe63_s = eRe1 - (oRe1 *  tRe1 - oIm1 * tRe31);
//                 out[idx + 130] =  resRe63_s; 
//                 out[idx + 126] =  resRe63_s;  
//                 let resIm63_s = -eIm1 + (oRe1 * tRe31 + oIm1 * tRe1);
//                 out[idx + 127] =  resIm63_s;
//                 out[idx + 131] = -resIm63_s;

//                 let oRe2   = out[idx +  132]; 
//                 let oIm2  = out[idx +  133];
//                 let eRe2   = out[idx +    4]; 
//                 let eIm2  = out[idx +    5];
//                 let resIm2_s = eIm2 + (oRe2 * tRe30 + oIm2 * tRe2);
//                 out[idx +   5] =  resIm2_s;
//                 out[idx + 253] = -resIm2_s;
//                 let resRe2_s = eRe2 + (oRe2 * tRe2 - oIm2 * tRe30);
//                 out[idx + 252] =  resRe2_s;
//                 out[idx +   4] =  resRe2_s; 
//                 let resRe62_s = eRe2 - (oRe2 * tRe2 - oIm2 * tRe30);
//                 out[idx + 132] =  resRe62_s;
//                 out[idx + 124] =  resRe62_s; 
//                 let resIm62_s = -eIm2 + (oRe2 * tRe30 + oIm2 * tRe2);
//                 out[idx + 125] =  resIm62_s;
//                 out[idx + 133] = -resIm62_s;

//                 let oRe3   = out[idx +  134]; 
//                 let oIm3  = out[idx +  135];
//                 let eRe3   = out[idx +    6]; 
//                 let eIm3  = out[idx +    7];
//                 let resIm3_s = eIm3 + (oRe3 * tRe29 + oIm3 * tRe3);
//                 out[idx +   7] =  resIm3_s;
//                 out[idx + 251] = -resIm3_s;
//                 let resRe3_s = eRe3 + (oRe3 * tRe3 - oIm3 * tRe29);
//                 out[idx + 250] =  resRe3_s;
//                 out[idx +   6] =  resRe3_s; 
//                 let resRe61_s = eRe3 - (oRe3 * tRe3 - oIm3 * tRe29);
//                 out[idx + 134] =  resRe61_s;
//                 out[idx + 122] =  resRe61_s; 
//                 let resIm61_s = -eIm3 + (oRe3 * tRe29 + oIm3 * tRe3);
//                 out[idx + 123] =  resIm61_s;
//                 out[idx + 135] = -resIm61_s;

//                 let oRe4   = out[idx +  136]; 
//                 let oIm4  = out[idx +  137];
//                 let eRe4   = out[idx +    8]; 
//                 let eIm4  = out[idx +    9];
//                 let resIm4_s = eIm4 + (oRe4 * tRe28 + oIm4 * tRe4);
//                 out[idx + 9] = resIm4_s;
//                 out[idx + 249] = -resIm4_s;
//                 let resRe4_s = eRe4 + (oRe4 * tRe4 - oIm4 * tRe28);
//                 out[idx + 248] = resRe4_s;
//                 out[idx + 8] = resRe4_s; 
//                 let resRe60_s = eRe4 - (oRe4 * tRe4 - oIm4 * tRe28);
//                 out[idx + 136] = resRe60_s;
//                 out[idx + 120] = resRe60_s; 
//                 let resIm60_s = -eIm4 + (oRe4 * tRe28 + oIm4 * tRe4);
//                 out[idx + 121] = resIm60_s;
//                 out[idx + 137] = -resIm60_s;

//                 let oRe5 = out[idx + 138]; 
//                 let oIm5 = out[idx + 139];
//                 let eRe5 = out[idx + 10]; 
//                 let eIm5 = out[idx + 11];
//                 let resIm5_s = eIm5 + (oRe5 * tRe27 + oIm5 * tRe5);
//                 out[idx + 11] = resIm5_s;
//                 out[idx + 247] = -resIm5_s;
//                 let resRe5_s = eRe5 + (oRe5 * tRe5 - oIm5 * tRe27);
//                 out[idx + 246] = resRe5_s;
//                 out[idx + 10] = resRe5_s; 
//                 let resRe59_s = eRe5 - (oRe5 * tRe5 - oIm5 * tRe27);
//                 out[idx + 138] = resRe59_s;
//                 out[idx + 118] = resRe59_s; 
//                 let resIm59_s = -eIm5 + (oRe5 * tRe27 + oIm5 * tRe5);
//                 out[idx + 119] = resIm59_s;
//                 out[idx + 139] = -resIm59_s;

//                 // For elements 9 to 10
//                 let oRe6 = out[idx + 140]; 
//                 let oIm6 = out[idx + 141];
//                 let eRe6 = out[idx + 12]; 
//                 let eIm6 = out[idx + 13];
//                 let resIm6_s = eIm6 + (oRe6 * tRe26 + oIm6 * tRe6);
//                 out[idx + 13] = resIm6_s;
//                 out[idx + 245] = -resIm6_s;
//                 let resRe6_s = eRe6 + (oRe6 * tRe6 - oIm6 * tRe26);
//                 out[idx + 244] = resRe6_s;
//                 out[idx + 12] = resRe6_s; 
//                 let resRe58_s = eRe6 - (oRe6 * tRe6 - oIm6 * tRe26);
//                 out[idx + 140] = resRe58_s;
//                 out[idx + 116] = resRe58_s; 
//                 let resIm58_s = -eIm6 + (oRe6 * tRe26 + oIm6 * tRe6);
//                 out[idx + 117] = resIm58_s;
//                 out[idx + 141] = -resIm58_s;

//                 // For elements 11 to 12
//                 let oRe7 = out[idx + 142]; 
//                 let oIm7 = out[idx + 143];
//                 let eRe7 = out[idx + 14]; 
//                 let eIm7 = out[idx + 15];
//                 let resIm7_s = eIm7 + (oRe7 * tRe25 + oIm7 * tRe7);
//                 out[idx + 15] = resIm7_s;
//                 out[idx + 243] = -resIm7_s;
//                 let resRe7_s = eRe7 + (oRe7 * tRe7 - oIm7 * tRe25);
//                 out[idx + 242] = resRe7_s;
//                 out[idx + 14] = resRe7_s; 
//                 let resRe57_s = eRe7 - (oRe7 * tRe7 - oIm7 * tRe25);
//                 out[idx + 142] = resRe57_s;
//                 out[idx + 114] = resRe57_s; 
//                 let resIm57_s = -eIm7 + (oRe7 * tRe25 + oIm7 * tRe7);
//                 out[idx + 115] = resIm57_s;
//                 out[idx + 143] = -resIm57_s;

//                 // For elements 13 to 14
//                 let oRe8 = out[idx + 144]; 
//                 let oIm8 = out[idx + 145];
//                 let eRe8 = out[idx + 16]; 
//                 let eIm8 = out[idx + 17];
//                 let resIm8_s = eIm8 + (oRe8 * tRe24 + oIm8 * tRe8);
//                 out[idx + 17] = resIm8_s;
//                 out[idx + 241] = -resIm8_s;
//                 let resRe8_s = eRe8 + (oRe8 * tRe8 - oIm8 * tRe24);
//                 out[idx + 240] = resRe8_s;
//                 out[idx + 16] = resRe8_s; 
//                 let resRe56_s = eRe8 - (oRe8 * tRe8 - oIm8 * tRe24);
//                 out[idx + 144] = resRe56_s;
//                 out[idx + 112] = resRe56_s; 
//                 let resIm56_s = -eIm8 + (oRe8 * tRe24 + oIm8 * tRe8);
//                 out[idx + 113] = resIm56_s;
//                 out[idx + 145] = -resIm56_s;

//                 // For elements 15 to 16
//                 let oRe9 = out[idx + 146]; 
//                 let oIm9 = out[idx + 147];
//                 let eRe9 = out[idx + 18]; 
//                 let eIm9 = out[idx + 19];
//                 let resIm9_s = eIm9 + (oRe9 * tRe23 + oIm9 * tRe9);
//                 out[idx + 19] = resIm9_s;
//                 out[idx + 239] = -resIm9_s;
//                 let resRe9_s = eRe9 + (oRe9 * tRe9 - oIm9 * tRe23);
//                 out[idx + 238] = resRe9_s;
//                 out[idx + 18] = resRe9_s; 
//                 let resRe55_s = eRe9 - (oRe9 * tRe9 - oIm9 * tRe23);
//                 out[idx + 146] = resRe55_s;
//                 out[idx + 110] = resRe55_s; 
//                 let resIm55_s = -eIm9 + (oRe9 * tRe23 + oIm9 * tRe9);
//                 out[idx + 111] = resIm55_s;
//                 out[idx + 147] = -resIm55_s;

//                 // For elements 17 to 18
//                 let oRe10 = out[idx + 148]; 
//                 let oIm10 = out[idx + 149];
//                 let eRe10 = out[idx + 20]; 
//                 let eIm10 = out[idx + 21];
//                 let resIm10_s = eIm10 + (oRe10 * tRe22 + oIm10 * tRe10);
//                 out[idx + 21] = resIm10_s;
//                 out[idx + 237] = -resIm10_s;
//                 let resRe10_s = eRe10 + (oRe10 * tRe10 - oIm10 * tRe22);
//                 out[idx + 236] = resRe10_s;
//                 out[idx + 20] = resRe10_s; 
//                 let resRe54_s = eRe10 - (oRe10 * tRe10 - oIm10 * tRe22);
//                 out[idx + 148] = resRe54_s;
//                 out[idx + 108] = resRe54_s; 
//                 let resIm54_s = -eIm10 + (oRe10 * tRe22 + oIm10 * tRe10);
//                 out[idx + 109] = resIm54_s;
//                 out[idx + 149] = -resIm54_s;

//                 // For elements 19 to 20
//                 let oRe11 = out[idx + 150]; 
//                 let oIm11 = out[idx + 151];
//                 let eRe11 = out[idx + 22]; 
//                 let eIm11 = out[idx + 23];
//                 let resIm11_s = eIm11 + (oRe11 * tRe21 + oIm11 * tRe11);
//                 out[idx + 23] = resIm11_s;
//                 out[idx + 235] = -resIm11_s;
//                 let resRe11_s = eRe11 + (oRe11 * tRe11 - oIm11 * tRe21);
//                 out[idx + 234] = resRe11_s;
//                 out[idx + 22] = resRe11_s; 
//                 let resRe53_s = eRe11 - (oRe11 * tRe11 - oIm11 * tRe21);
//                 out[idx + 150] = resRe53_s;
//                 out[idx + 106] = resRe53_s; 
//                 let resIm53_s = -eIm11 + (oRe11 * tRe21 + oIm11 * tRe11);
//                 out[idx + 107] = resIm53_s;
//                 out[idx + 151] = -resIm53_s;

//                 // For elements 21 to 22
//                 let oRe12 = out[idx + 152]; 
//                 let oIm12 = out[idx + 153];
//                 let eRe12 = out[idx + 24]; 
//                 let eIm12 = out[idx + 25];
//                 let resIm12_s = eIm12 + (oRe12 * tRe20 + oIm12 * tRe12);
//                 out[idx + 25] = resIm12_s;
//                 out[idx + 233] = -resIm12_s;
//                 let resRe12_s = eRe12 + (oRe12 * tRe12 - oIm12 * tRe20);
//                 out[idx + 232] = resRe12_s;
//                 out[idx + 24] = resRe12_s; 
//                 let resRe52_s = eRe12 - (oRe12 * tRe12 - oIm12 * tRe20);
//                 out[idx + 152] = resRe52_s;
//                 out[idx + 104] = resRe52_s; 
//                 let resIm52_s = -eIm12 + (oRe12 * tRe20 + oIm12 * tRe12);
//                 out[idx + 105] = resIm52_s;
//                 out[idx + 153] = -resIm52_s;

//                 // For elements 23 to 24
//                 let oRe13 = out[idx + 154]; 
//                 let oIm13 = out[idx + 155];
//                 let eRe13 = out[idx + 26]; 
//                 let eIm13 = out[idx + 27];
//                 let resIm13_s = eIm13 + (oRe13 * tRe19 + oIm13 * tRe13);
//                 out[idx + 27] = resIm13_s;
//                 out[idx + 231] = -resIm13_s;
//                 let resRe13_s = eRe13 + (oRe13 * tRe13 - oIm13 * tRe19);
//                 out[idx + 230] = resRe13_s;
//                 out[idx + 26] = resRe13_s; 
//                 let resRe51_s = eRe13 - (oRe13 * tRe13 - oIm13 * tRe19);
//                 out[idx + 154] = resRe51_s;
//                 out[idx + 102] = resRe51_s; 
//                 let resIm51_s = -eIm13 + (oRe13 * tRe19 + oIm13 * tRe13);
//                 out[idx + 103] = resIm51_s;
//                 out[idx + 155] = -resIm51_s;

//                 // For elements 25 to 26
//                 let oRe14 = out[idx + 156]; 
//                 let oIm14 = out[idx + 157];
//                 let eRe14 = out[idx + 28]; 
//                 let eIm14 = out[idx + 29];
//                 let resIm14_s = eIm14 + (oRe14 * tRe18 + oIm14 * tRe14);
//                 out[idx + 29] = resIm14_s;
//                 out[idx + 229] = -resIm14_s;
//                 let resRe14_s = eRe14 + (oRe14 * tRe14 - oIm14 * tRe18);
//                 out[idx + 228] = resRe14_s;
//                 out[idx + 28] = resRe14_s; 
//                 let resRe50_s = eRe14 - (oRe14 * tRe14 - oIm14 * tRe18);
//                 out[idx + 156] = resRe50_s;
//                 out[idx + 100] = resRe50_s; 
//                 let resIm50_s = -eIm14 + (oRe14 * tRe18 + oIm14 * tRe14);
//                 out[idx + 101] = resIm50_s;
//                 out[idx + 157] = -resIm50_s;

//                 // For elements 27 to 28
//                 let oRe15 = out[idx + 158]; 
//                 let oIm15 = out[idx + 159];
//                 let eRe15 = out[idx + 30]; 
//                 let eIm15 = out[idx + 31];
//                 let resIm15_s = eIm15 + (oRe15 * tRe17 + oIm15 * tRe15);
//                 out[idx + 31] = resIm15_s;
//                 out[idx + 227] = -resIm15_s;
//                 let resRe15_s = eRe15 + (oRe15 * tRe15 - oIm15 * tRe17);
//                 out[idx + 226] = resRe15_s;
//                 out[idx + 30] = resRe15_s; 
//                 let resRe49_s = eRe15 - (oRe15 * tRe15 - oIm15 * tRe17);
//                 out[idx + 158] = resRe49_s;
//                 out[idx + 98] = resRe49_s; 
//                 let resIm49_s = -eIm15 + (oRe15 * tRe17 + oIm15 * tRe15);
//                 out[idx + 99] = resIm49_s;
//                 out[idx + 159] = -resIm49_s;

//                 // For elements 29 to 30
//                 let oRe16 = out[idx + 160]; 
//                 let oIm16 = out[idx + 161];
//                 let eRe16 = out[idx + 32]; 
//                 let eIm16 = out[idx + 33];
//                 let resIm16_s = eIm16 + (oRe16 * tRe16 + oIm16 * tRe16);
//                 out[idx + 33] = resIm16_s;
//                 out[idx + 225] = -resIm16_s;
//                 let resRe16_s = eRe16 + (oRe16 * tRe16 - oIm16 * tRe16);
//                 out[idx + 224] = resRe16_s;
//                 out[idx + 32] = resRe16_s; 
//                 let resRe48_s = eRe16 - (oRe16 * tRe16 - oIm16 * tRe16);
//                 out[idx + 160] = resRe48_s;
//                 out[idx + 96] = resRe48_s; 
//                 let resIm48_s = -eIm16 + (oRe16 * tRe16 + oIm16 * tRe16);
//                 out[idx + 97] = resIm48_s;
//                 out[idx + 161] = -resIm48_s;

//                 // For elements 31 to 32
//                 let oRe17 = out[idx + 162]; 
//                 let oIm17 = out[idx + 163];
//                 let eRe17 = out[idx + 34]; 
//                 let eIm17 = out[idx + 35];
//                 let resIm17_s = eIm17 + (oRe17 * tRe15 + oIm17 * tRe17);
//                 out[idx + 35] = resIm17_s;
//                 out[idx + 223] = -resIm17_s;
//                 let resRe17_s = eRe17 + (oRe17 * tRe17 - oIm17 * tRe15);
//                 out[idx + 222] = resRe17_s;
//                 out[idx + 34] = resRe17_s; 
//                 let resRe47_s = eRe17 - (oRe17 * tRe17 - oIm17 * tRe15);
//                 out[idx + 162] = resRe47_s;
//                 out[idx + 94] = resRe47_s; 
//                 let resIm47_s = -eIm17 + (oRe17 * tRe15 + oIm17 * tRe17);
//                 out[idx + 95] = resIm47_s;
//                 out[idx + 163] = -resIm47_s;

//                 // For elements 33 to 34
//                 let oRe18 = out[idx + 164]; 
//                 let oIm18 = out[idx + 165];
//                 let eRe18 = out[idx + 36]; 
//                 let eIm18 = out[idx + 37];
//                 let resIm18_s = eIm18 + (oRe18 * tRe14 + oIm18 * tRe18);
//                 out[idx + 37] = resIm18_s;
//                 out[idx + 221] = -resIm18_s;
//                 let resRe18_s = eRe18 + (oRe18 * tRe18 - oIm18 * tRe14);
//                 out[idx + 220] = resRe18_s;
//                 out[idx + 36] = resRe18_s; 
//                 let resRe46_s = eRe18 - (oRe18 * tRe18 - oIm18 * tRe14);
//                 out[idx + 164] = resRe46_s;
//                 out[idx + 92] = resRe46_s; 
//                 let resIm46_s = -eIm18 + (oRe18 * tRe14 + oIm18 * tRe18);
//                 out[idx + 93] = resIm46_s;
//                 out[idx + 165] = -resIm46_s;

//                 // For elements 35 to 36
//                 let oRe19 = out[idx + 166]; 
//                 let oIm19 = out[idx + 167];
//                 let eRe19 = out[idx + 38]; 
//                 let eIm19 = out[idx + 39];
//                 let resIm19_s = eIm19 + (oRe19 * tRe13 + oIm19 * tRe19);
//                 out[idx + 39] = resIm19_s;
//                 out[idx + 219] = -resIm19_s;
//                 let resRe19_s = eRe19 + (oRe19 * tRe19 - oIm19 * tRe13);
//                 out[idx + 218] = resRe19_s;
//                 out[idx + 38] = resRe19_s; 
//                 let resRe45_s = eRe19 - (oRe19 * tRe19 - oIm19 * tRe13);
//                 out[idx + 166] = resRe45_s;
//                 out[idx + 90] = resRe45_s; 
//                 let resIm45_s = -eIm19 + (oRe19 * tRe13 + oIm19 * tRe19);
//                 out[idx + 91] = resIm45_s;
//                 out[idx + 167] = -resIm45_s;

//                 // For elements 37 to 38
//                 let oRe20 = out[idx + 168]; 
//                 let oIm20 = out[idx + 169];
//                 let eRe20 = out[idx + 40]; 
//                 let eIm20 = out[idx + 41];
//                 let resIm20_s = eIm20 + (oRe20 * tRe12 + oIm20 * tRe20);
//                 out[idx + 41] = resIm20_s;
//                 out[idx + 217] = -resIm20_s;
//                 let resRe20_s = eRe20 + (oRe20 * tRe20 - oIm20 * tRe12);
//                 out[idx + 216] = resRe20_s;
//                 out[idx + 40] = resRe20_s; 
//                 let resRe44_s = eRe20 - (oRe20 * tRe20 - oIm20 * tRe12);
//                 out[idx + 168] = resRe44_s;
//                 out[idx + 88] = resRe44_s; 
//                 let resIm44_s = -eIm20 + (oRe20 * tRe12 + oIm20 * tRe20);
//                 out[idx + 89] = resIm44_s;
//                 out[idx + 169] = -resIm44_s;

//                 // For elements 39 to 40
//                 let oRe21 = out[idx + 170]; 
//                 let oIm21 = out[idx + 171];
//                 let eRe21 = out[idx + 42]; 
//                 let eIm21 = out[idx + 43];
//                 let resIm21_s = eIm21 + (oRe21 * tRe11 + oIm21 * tRe21);
//                 out[idx + 43] = resIm21_s;
//                 out[idx + 215] = -resIm21_s;
//                 let resRe21_s = eRe21 + (oRe21 * tRe21 - oIm21 * tRe11);
//                 out[idx + 214] = resRe21_s;
//                 out[idx + 42] = resRe21_s; 
//                 let resRe43_s = eRe21 - (oRe21 * tRe21 - oIm21 * tRe11);
//                 out[idx + 170] = resRe43_s;
//                 out[idx + 86] = resRe43_s; 
//                 let resIm43_s = -eIm21 + (oRe21 * tRe11 + oIm21 * tRe21);
//                 out[idx + 87] = resIm43_s;
//                 out[idx + 171] = -resIm43_s;

//                 // For elements 41 to 42
//                 let oRe22 = out[idx + 172]; 
//                 let oIm22 = out[idx + 173];
//                 let eRe22 = out[idx + 44]; 
//                 let eIm22 = out[idx + 45];
//                 let resIm22_s = eIm22 + (oRe22 * tRe10 + oIm22 * tRe22);
//                 out[idx + 45] = resIm22_s;
//                 out[idx + 213] = -resIm22_s;
//                 let resRe22_s = eRe22 + (oRe22 * tRe22 - oIm22 * tRe10);
//                 out[idx + 212] = resRe22_s;
//                 out[idx + 44] = resRe22_s; 
//                 let resRe42_s = eRe22 - (oRe22 * tRe22 - oIm22 * tRe10);
//                 out[idx + 172] = resRe42_s;
//                 out[idx + 84] = resRe42_s; 
//                 let resIm42_s = -eIm22 + (oRe22 * tRe10 + oIm22 * tRe22);
//                 out[idx + 85] = resIm42_s;
//                 out[idx + 173] = -resIm42_s;

//                 // For elements 43 to 44
//                 let oRe23 = out[idx + 174]; 
//                 let oIm23 = out[idx + 175];
//                 let eRe23 = out[idx + 46]; 
//                 let eIm23 = out[idx + 47];
//                 let resIm23_s = eIm23 + (oRe23 * tRe9 + oIm23 * tRe23);
//                 out[idx + 47] = resIm23_s;
//                 out[idx + 211] = -resIm23_s;
//                 let resRe23_s = eRe23 + (oRe23 * tRe23 - oIm23 * tRe9);
//                 out[idx + 210] = resRe23_s;
//                 out[idx + 46] = resRe23_s; 
//                 let resRe41_s = eRe23 - (oRe23 * tRe23 - oIm23 * tRe9);
//                 out[idx + 174] = resRe41_s;
//                 out[idx + 82] = resRe41_s; 
//                 let resIm41_s = -eIm23 + (oRe23 * tRe9 + oIm23 * tRe23);
//                 out[idx + 83] = resIm41_s;
//                 out[idx + 175] = -resIm41_s;

//                 // For elements 45 to 46
//                 let oRe24 = out[idx + 176]; 
//                 let oIm24 = out[idx + 177];
//                 let eRe24 = out[idx + 48]; 
//                 let eIm24 = out[idx + 49];
//                 let resIm24_s = eIm24 + (oRe24 * tRe8 + oIm24 * tRe24);
//                 out[idx + 49] = resIm24_s;
//                 out[idx + 209] = -resIm24_s;
//                 let resRe24_s = eRe24 + (oRe24 * tRe24 - oIm24 * tRe8);
//                 out[idx + 208] = resRe24_s;
//                 out[idx + 48] = resRe24_s; 
//                 let resRe40_s = eRe24 - (oRe24 * tRe24 - oIm24 * tRe8);
//                 out[idx + 176] = resRe40_s;
//                 out[idx + 80] = resRe40_s; 
//                 let resIm40_s = -eIm24 + (oRe24 * tRe8 + oIm24 * tRe24);
//                 out[idx + 81] = resIm40_s;
//                 out[idx + 177] = -resIm40_s;

//                 // For elements 47 to 48
//                 let oRe25 = out[idx + 178]; 
//                 let oIm25 = out[idx + 179];
//                 let eRe25 = out[idx + 50]; 
//                 let eIm25 = out[idx + 51];
//                 let resIm25_s = eIm25 + (oRe25 * tRe7 + oIm25 * tRe25);
//                 out[idx + 51] = resIm25_s;
//                 out[idx + 207] = -resIm25_s;
//                 let resRe25_s = eRe25 + (oRe25 * tRe25 - oIm25 * tRe7);
//                 out[idx + 206] = resRe25_s;
//                 out[idx + 50] = resRe25_s; 
//                 let resRe39_s = eRe25 - (oRe25 * tRe25 - oIm25 * tRe7);
//                 out[idx + 178] = resRe39_s;
//                 out[idx + 78] = resRe39_s; 
//                 let resIm39_s = -eIm25 + (oRe25 * tRe7 + oIm25 * tRe25);
//                 out[idx + 79] = resIm39_s;
//                 out[idx + 179] = -resIm39_s;

//                 // For elements 49 to 50
//                 let oRe26 = out[idx + 180]; 
//                 let oIm26 = out[idx + 181];
//                 let eRe26 = out[idx + 52]; 
//                 let eIm26 = out[idx + 53];
//                 let resIm26_s = eIm26 + (oRe26 * tRe6 + oIm26 * tRe26);
//                 out[idx + 53] = resIm26_s;
//                 out[idx + 205] = -resIm26_s;
//                 let resRe26_s = eRe26 + (oRe26 * tRe26 - oIm26 * tRe6);
//                 out[idx + 204] = resRe26_s;
//                 out[idx + 52] = resRe26_s; 
//                 let resRe38_s = eRe26 - (oRe26 * tRe26 - oIm26 * tRe6);
//                 out[idx + 180] = resRe38_s;
//                 out[idx + 76] = resRe38_s; 
//                 let resIm38_s = -eIm26 + (oRe26 * tRe6 + oIm26 * tRe26);
//                 out[idx + 77] = resIm38_s;
//                 out[idx + 181] = -resIm38_s;

//                 // For elements 51 to 52
//                 let oRe27 = out[idx + 182]; 
//                 let oIm27 = out[idx + 183];
//                 let eRe27 = out[idx + 54]; 
//                 let eIm27 = out[idx + 55];
//                 let resIm27_s = eIm27 + (oRe27 * tRe5 + oIm27 * tRe27);
//                 out[idx + 55] = resIm27_s;
//                 out[idx + 203] = -resIm27_s;
//                 let resRe27_s = eRe27 + (oRe27 * tRe27 - oIm27 * tRe5);
//                 out[idx + 202] = resRe27_s;
//                 out[idx + 54] = resRe27_s; 
//                 let resRe37_s = eRe27 - (oRe27 * tRe27 - oIm27 * tRe5);
//                 out[idx + 182] = resRe37_s;
//                 out[idx + 74] = resRe37_s; 
//                 let resIm37_s = -eIm27 + (oRe27 * tRe5 + oIm27 * tRe27);
//                 out[idx + 75] = resIm37_s;
//                 out[idx + 183] = -resIm37_s;

//                 // For elements 53 to 54
//                 let oRe28 = out[idx + 184]; 
//                 let oIm28 = out[idx + 185];
//                 let eRe28 = out[idx + 56]; 
//                 let eIm28 = out[idx + 57];
//                 let resIm28_s = eIm28 + (oRe28 * tRe4 + oIm28 * tRe28);
//                 out[idx + 57] = resIm28_s;
//                 out[idx + 201] = -resIm28_s;
//                 let resRe28_s = eRe28 + (oRe28 * tRe28 - oIm28 * tRe4);
//                 out[idx + 200] = resRe28_s;
//                 out[idx + 56] = resRe28_s; 
//                 let resRe36_s = eRe28 - (oRe28 * tRe28 - oIm28 * tRe4);
//                 out[idx + 184] = resRe36_s;
//                 out[idx + 72] = resRe36_s; 
//                 let resIm36_s = -eIm28 + (oRe28 * tRe4 + oIm28 * tRe28);
//                 out[idx + 73] = resIm36_s;
//                 out[idx + 185] = -resIm36_s;

//                 // For elements 55 to 56
//                 let oRe29 = out[idx + 186]; 
//                 let oIm29 = out[idx + 187];
//                 let eRe29 = out[idx + 58]; 
//                 let eIm29 = out[idx + 59];
//                 let resIm29_s = eIm29 + (oRe29 * tRe3 + oIm29 * tRe29);
//                 out[idx + 59] = resIm29_s;
//                 out[idx + 199] = -resIm29_s;
//                 let resRe29_s = eRe29 + (oRe29 * tRe29 - oIm29 * tRe3);
//                 out[idx + 198] = resRe29_s;
//                 out[idx + 58] = resRe29_s; 
//                 let resRe35_s = eRe29 - (oRe29 * tRe29 - oIm29 * tRe3);
//                 out[idx + 186] = resRe35_s;
//                 out[idx + 70] = resRe35_s; 
//                 let resIm35_s = -eIm29 + (oRe29 * tRe3 + oIm29 * tRe29);
//                 out[idx + 71] = resIm35_s;
//                 out[idx + 187] = -resIm35_s;

//                 // For elements 57 to 58
//                 let oRe30 = out[idx + 188]; 
//                 let oIm30 = out[idx + 189];
//                 let eRe30 = out[idx + 60]; 
//                 let eIm30 = out[idx + 61];
//                 let resIm30_s = eIm30 + (oRe30 * tRe2 + oIm30 * tRe30);
//                 out[idx + 61] = resIm30_s;
//                 out[idx + 197] = -resIm30_s;
//                 let resRe30_s = eRe30 + (oRe30 * tRe30 - oIm30 * tRe2);
//                 out[idx + 196] = resRe30_s;
//                 out[idx + 60] = resRe30_s; 
//                 let resRe34_s = eRe30 - (oRe30 * tRe30 - oIm30 * tRe2);
//                 out[idx + 188] = resRe34_s;
//                 out[idx + 68] = resRe34_s; 
//                 let resIm34_s = -eIm30 + (oRe30 * tRe2 + oIm30 * tRe30);
//                 out[idx + 69] = resIm34_s;
//                 out[idx + 189] = -resIm34_s;

//                 // For elements 59 to 60
//                 let oRe31 = out[idx + 190]; 
//                 let oIm31 = out[idx + 191];
//                 let eRe31 = out[idx + 62]; 
//                 let eIm31 = out[idx + 63];
//                 let resIm31_s = eIm31 + (oRe31 * tRe1 + oIm31 * tRe31);
//                 out[idx + 63] = resIm31_s;
//                 out[idx + 195] = -resIm31_s;
//                 let resRe31_s = eRe31 + (oRe31 * tRe31 - oIm31 * tRe1);
//                 out[idx + 194] = resRe31_s;
//                 out[idx + 62] = resRe31_s; 
//                 let resRe33_s = eRe31 - (oRe31 * tRe31 - oIm31 * tRe1);
//                 out[idx + 190] = resRe33_s;
//                 out[idx + 66] = resRe33_s; 
//                 let resIm33_s = -eIm31 + (oRe31 * tRe1 + oIm31 * tRe31);
//                 out[idx + 67] = resIm33_s;
//                 out[idx + 191] = -resIm33_s;

//                 // For elements 61 to 62
//                 let oRe32  = out[idx +  192]; 
//                 let oIm32 = out[idx +  193];
//                 let eRe32  = out[idx +   64]; 
//                 let eIm32 = out[idx +   65];
//                 let resIm32_s = eIm32 + oRe32;
//                 out[idx +  65] =  resIm32_s;
//                 out[idx + 193] = -resIm32_s;
//                 let resRe32_s = eRe32 - oIm32;
//                 out[idx + 192] =  resRe32_s;
//                 out[idx +  64] =  resRe32_s; 
//             }
        
    
//     /////////////////////////////////////////////
//     // P = 3  -> 256
//     //

//         for (let j = 0; j < 128; j++) {
//             const evenIndex = j;
//             const oddIndex  = j + 128;

//             if(j > 64){
//               out[evenIndex * 2]     =  out[512 - evenIndex * 2] ;
//               out[evenIndex * 2 + 1] = -out[512 - evenIndex * 2 + 1];
//               out[oddIndex * 2]      =  out[512 - oddIndex * 2];
//               out[oddIndex * 2 + 1]  = -out[512 - oddIndex * 2 + 1];
//               continue;
//             }

//             const evenPartRe = out[evenIndex * 2];
//             const evenPartIm = out[evenIndex * 2 + 1];
//             const oddPartRe  = out[oddIndex * 2];
//             const oddPartIm  = out[oddIndex * 2 + 1];

//             const twiddleRe = ____F[254 + (j * 2 + 0)];
//             const twiddleIm = ____F[254 + (j * 2 + 1)];

//             const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
//             const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

//             out[evenIndex * 2]     = evenPartRe + twiddledOddRe;
//             out[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
//             out[oddIndex * 2]      = evenPartRe - twiddledOddRe;
//             out[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
//         }

//         for (let j = 0; j < 128; j++) {
//             const evenIndex = 256 + j;
//             const oddIndex  = 256 + j + 128;

//             const evenPartRe = out[evenIndex * 2];
//             const evenPartIm = out[evenIndex * 2 + 1];
//             const oddPartRe  = out[oddIndex * 2];
//             const oddPartIm  = out[oddIndex * 2 + 1];

//             const twiddleRe = ____F[254 + (j * 2 + 0)];
//             const twiddleIm = ____F[254 + (j * 2 + 1)];

//             const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
//             const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

//             out[evenIndex * 2]     = evenPartRe + twiddledOddRe;
//             out[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
//             out[oddIndex * 2]      = evenPartRe - twiddledOddRe;
//             out[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
//         }
// /*
//         for (let j = 0; j < 128; j++) {
//             const evenIndex = 512 + j;
//             const oddIndex  = 512 + j + 128;

//             const evenPartRe = out[evenIndex * 2];
//             const evenPartIm = out[evenIndex * 2 + 1];
//             const oddPartRe  = out[oddIndex * 2];
//             const oddPartIm  = out[oddIndex * 2 + 1];

//             const twiddleRe = ____F[254 + (j * 2 + 0)];
//             const twiddleIm = ____F[254 + (j * 2 + 1)];

//             const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
//             const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

//             out[evenIndex * 2]     = evenPartRe + twiddledOddRe;
//             out[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
//             out[oddIndex * 2]      = evenPartRe - twiddledOddRe;
//             out[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
//         }

//         for (let j = 0; j < 128; j++) {
//             const evenIndex = 768 + j;
//             const oddIndex  = 768 + j + 128;

//             const evenPartRe = out[evenIndex * 2];
//             const evenPartIm = out[evenIndex * 2 + 1];
//             const oddPartRe  = out[oddIndex * 2];
//             const oddPartIm  = out[oddIndex * 2 + 1];

//             const twiddleRe = ____F[254 + (j * 2 + 0)];
//             const twiddleIm = ____F[254 + (j * 2 + 1)];

//             const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
//             const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

//             out[evenIndex * 2]     = evenPartRe + twiddledOddRe;
//             out[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
//             out[oddIndex * 2]      = evenPartRe - twiddledOddRe;
//             out[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
//         }
// */

//     /////////////////////////////////////////////
//     // P = 4  -> 512
//     //

//         for (let j = 0; j < 256; j++) {
//             const evenIndex = j;
//             const oddIndex  = j + 256;

//             if(j > 128){
//               out[evenIndex * 2]     =  out[1024 - evenIndex * 2] ;
//               out[evenIndex * 2 + 1] = -out[1024 - evenIndex * 2 + 1];
//               out[oddIndex * 2]      =  out[1024 - oddIndex * 2];
//               out[oddIndex * 2 + 1]  = -out[1024 - oddIndex * 2 + 1];
//               continue;
//             }

//             const evenPartRe = out[evenIndex * 2];
//             const evenPartIm = out[evenIndex * 2 + 1];
//             const oddPartRe  = out[oddIndex * 2];
//             const oddPartIm  = out[oddIndex * 2 + 1];

//             const twiddleRe = ____F[510 + (j * 2 + 0)];
//             const twiddleIm = ____F[510 + (j * 2 + 1)];

//             const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
//             const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

//             out[evenIndex * 2]     = evenPartRe + twiddledOddRe;
//             out[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
//             out[oddIndex * 2]      = evenPartRe - twiddledOddRe;
//             out[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
//         }

//         return out;

    
// }

let paddedInput;
let map512  = bitReversalMap512.get(512);
const inputBR512  = new Float32Array(512);
const out512      = new Float32Array(1024);
function fftReal512(realInput) {

    if(realInput.length != 512){
        paddedInput = new Float32Array(512).fill(0);
        realInput.forEach((value, index) => paddedInput[index] = value);
    }else{
        // Create a copy of the input array
        paddedInput = realInput.slice();
    }

    // Perform bit reversal
    for (let i = 0; i < 512; i++) {
        inputBR512[i] = paddedInput[map512[i]];
    }

    /*
    // Convert the real-valued input to a complex-valued Float32Array
    for (let i = 0; i < N; i++) {
        out512[i * 2] = inputBR[i];
        out512[i * 2 + 1] = 0; // Imaginary part is set to 0
    }*/

    /////////////////////////////////////////////
    // P = 0  -> 4
    //

    for(let idx = 0; idx < 512; idx+=4){
    //for(let idx = 0; idx < 1024; idx+=4){
          let x0aRe = inputBR512[idx    ];
          let x1aRe = inputBR512[idx + 1];
          let x2aRe = inputBR512[idx + 2];
          let x3aRe = inputBR512[idx + 3];
          out512[2*idx      ] =  x0aRe + x1aRe + x2aRe + x3aRe;
          out512[2*idx  +  1] =  0; 
          out512[2*idx  +  2] =  x0aRe - x1aRe;
          out512[2*idx  +  3] =  x2aRe - x3aRe; 
          out512[2*idx  +  4] =  x0aRe + x1aRe - x2aRe - x3aRe; 
          out512[2*idx  +  5] =  0;
          out512[2*idx  +  6] =  x0aRe - x1aRe; 
          out512[2*idx  +  7] = -x2aRe + x3aRe;
    }

/*
    for (let idx = 0; idx < 2048; idx += 32) {
    // Unrolled loop iteration 1
    let x0aRe_1 = out512[idx];
    let x1aRe_1 = out512[idx + 2];
    out512[idx + 2] = x0aRe_1 - x1aRe_1;
    let x3aRe_1 = out512[idx + 6];
    out512[idx + 6] = x0aRe_1 - x1aRe_1;

    let x2aRe_1 = out512[idx + 4];
    out512[idx + 4] = x0aRe_1 + x1aRe_1 - x2aRe_1 - x3aRe_1; 
    out512[idx + 3] = x2aRe_1 - x3aRe_1;
    out512[idx] = x0aRe_1 + x1aRe_1 + x2aRe_1 + x3aRe_1;
    out512[idx + 7] = -x2aRe_1 + x3aRe_1;

    // Unrolled loop iteration 2
    let x0aRe_2 = out512[idx + 8];
    let x1aRe_2 = out512[idx + 10];
    out512[idx + 10] = x0aRe_2 - x1aRe_2;
    let x3aRe_2 = out512[idx + 14];
    out512[idx + 14] = x0aRe_2 - x1aRe_2;
    let x2aRe_2 = out512[idx + 12];
    out512[idx + 12] = x0aRe_2 + x1aRe_2 - x2aRe_2 - x3aRe_2; 
    out512[idx + 11] = x2aRe_2 - x3aRe_2;
    out512[idx + 8] = x0aRe_2 + x1aRe_2 + x2aRe_2 + x3aRe_2;
    out512[idx + 15] = -x2aRe_2 + x3aRe_2;

    // Unrolled loop iteration 3
    let x0aRe_3 = out512[idx + 16];
    let x1aRe_3 = out512[idx + 18];
    out512[idx + 18] = x0aRe_3 - x1aRe_3;
    let x3aRe_3 = out512[idx + 22];
    out512[idx + 22] = x0aRe_3 - x1aRe_3;
    let x2aRe_3 = out512[idx + 20];
    out512[idx + 20] = x0aRe_3 + x1aRe_3 - x2aRe_3 - x3aRe_3; 
    out512[idx + 16] = x0aRe_3 + x1aRe_3 + x2aRe_3 + x3aRe_3;
    out512[idx + 19] = x2aRe_3 - x3aRe_3;
    out512[idx + 23] = -x2aRe_3 + x3aRe_3;

    // Unrolled loop iteration 4
    let x0aRe_4 = out512[idx + 24];
    let x1aRe_4 = out512[idx + 26];
    out512[idx + 26] = x0aRe_4 - x1aRe_4;
    let x3aRe_4 = out512[idx + 30];
    out512[idx + 30] = x0aRe_4 - x1aRe_4;
    let x2aRe_4 = out512[idx + 28];
    out512[idx + 28] = x0aRe_4 + x1aRe_4 - x2aRe_4 - x3aRe_4; 
    out512[idx + 24] = x0aRe_4 + x1aRe_4 + x2aRe_4 + x3aRe_4;
    out512[idx + 27] = x2aRe_4 - x3aRe_4;
    out512[idx + 31] = -x2aRe_4 + x3aRe_4;
}
*/


    /////////////////////////////////////////////
    // P = 1  -> 16
    //
    for(let idx = 0; idx < 1024; idx+=32){
    //for(let idx = 0; idx < 2048; idx+=32){
          let x0aRe = out512[idx     ];
          let x0bRe = out512[idx +  2]; 
          let x0bIm = out512[idx +  3];
          let x0cRe = out512[idx +  4];

          let x1aRe = out512[idx +  8];
          out512[idx +   8] = x0aRe - x1aRe; 
          let x1bRe = out512[idx + 10];
          let x1bIm = out512[idx + 11];
          let x1cRe = out512[idx + 12];

          let x2aRe = out512[idx + 16];
          let x2bRe = out512[idx + 18];
          let x2bIm = out512[idx + 19];
          let x2cRe = out512[idx + 20];

          let x3aRe = out512[idx + 24];
          out512[idx +  24] = x0aRe - x1aRe;
          out512[idx +  25] = x3aRe - x2aRe;  
          let x3bRe = out512[idx + 26];
          let x3bIm = out512[idx + 27];
          let x3cRe = out512[idx + 28];

          out512[idx      ] = x0aRe + x1aRe + x2aRe + x3aRe;  
          out512[idx +   9] = x2aRe - x3aRe;      
          out512[idx +  16] = x0aRe + x1aRe - x2aRe - x3aRe;

          let x2cRe_tRe_2c = x2cRe * t1Re_2c;
          let x3cRe_tRe_2c = x3cRe * t1Re_2c;

          let resReC1 = x0cRe + x2cRe_tRe_2c - x3cRe_tRe_2c;
          out512[idx +  28] =   resReC1; 
          out512[idx +   4] =   resReC1; 
          let resImC1 = x1cRe + x2cRe_tRe_2c + x3cRe_tRe_2c; 
          out512[idx +   5] =   resImC1; 
          out512[idx +  29] = - resImC1;
          let resReC2 = x0cRe - x2cRe_tRe_2c + x3cRe_tRe_2c; 
          out512[idx +  20] =   resReC2;
          out512[idx +  12] =   resReC2; 
          let resImC2 = x1cRe - x2cRe_tRe_2c - x3cRe_tRe_2c; 
          out512[idx +  13] = - resImC2; 
          out512[idx +  21] =   resImC2;  

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

          let resReB1 = x0bRe  + x1dif_tRe_1b + tempReB;     
          out512[idx +   2] =   resReB1; 
          out512[idx +  30] =   resReB1;  
          let resReB2 = x0bRe  + x1dif_tRe_1b - tempReB;     
          out512[idx +  18] =   resReB2;
          out512[idx +  14] =   resReB2; 
          let resReD1 = x0bRe  - x1dif_tRe_1b - tempReD;     
          out512[idx +   6] =   resReD1; 
          out512[idx +  26] =   resReD1; 
          let resReD2 = x0bRe  - x1dif_tRe_1b + tempReD;     
          out512[idx +  22] =   resReD2;
          out512[idx +  10] =   resReD2; 

          let resImB1 = x0bIm  + x1sum_tRe_1b + tempImB;     
          out512[idx +   3] =   resImB1; 
          out512[idx +  31] = - resImB1;  
          let resImB2 = x0bIm  + x1sum_tRe_1b - tempImB;     
          out512[idx +  19] =   resImB2;
          out512[idx +  15] = - resImB2; 
          let resImD1 =-x0bIm  + x1sum_tRe_1b - tempImD;     
          out512[idx +   7] =   resImD1; 
          out512[idx +  27] = - resImD1; 
          let resImD2 =-x0bIm  + x1sum_tRe_1b + tempImD;     
          out512[idx +  23] =   resImD2;  
          out512[idx +  11] = - resImD2; 
    }


    /////////////////////////////////////////////
    // P = 2  -> 64
    //
    for(let idx = 0; idx < 1024; idx+=128){
    //for(let idx = 0; idx < 2048; idx+=128){
          
          let x0aRe_0 = out512[idx       ];
          let x0bRe_0 = out512[idx   +  2]; let x0bIm_0 = out512[idx   +  3];
          let x0cRe_0 = out512[idx   +  4]; let x0cIm_0 = out512[idx   +  5];
          let x0dRe_0 = out512[idx   +  6]; let x0dIm_0 = out512[idx   +  7];
          let x0aRe_4 = out512[idx   +  8]; let x0aIm_4 = out512[idx   +  9];
          let x0bRe_4 = out512[idx   + 10]; let x0bIm_4 = out512[idx   + 11];
          let x0cRe_4 = out512[idx   + 12]; let x0cIm_4 = out512[idx   + 13];
          let x0dRe_4 = out512[idx   + 14]; let x0dIm_4 = out512[idx   + 15];
          let x0aRe_8 = out512[idx   + 16];                                       //turning point

          let x1aRe_0 = out512[idx   + 32];
          let x1bRe_0 = out512[idx   + 34]; let x1bIm_0 = out512[idx   + 35];
          let x1cRe_0 = out512[idx   + 36]; let x1cIm_0 = out512[idx   + 37];
          let x1dRe_0 = out512[idx   + 38]; let x1dIm_0 = out512[idx   + 39];
          let x1aRe_4 = out512[idx   + 40]; let x1aIm_4 = out512[idx   + 41];
          let x1bRe_4 = out512[idx   + 42]; let x1bIm_4 = out512[idx   + 43];
          let x1cRe_4 = out512[idx   + 44]; let x1cIm_4 = out512[idx   + 45];
          let x1dRe_4 = out512[idx   + 46]; let x1dIm_4 = out512[idx   + 47];
          let x1aRe_8 = out512[idx   + 48]; let x1aIm_8 = out512[idx   + 49];        //turning point

          let x2aRe_0 = out512[idx   + 64]; let x2aIm_0 = out512[idx   + 65];
          let x2bRe_0 = out512[idx   + 66]; let x2bIm_0 = out512[idx   + 67];
          let x2cRe_0 = out512[idx   + 68]; let x2cIm_0 = out512[idx   + 69];
          let x2dRe_0 = out512[idx   + 70]; let x2dIm_0 = out512[idx   + 71];
          let x2aRe_4 = out512[idx   + 72]; let x2aIm_4 = out512[idx   + 73];
          let x2bRe_4 = out512[idx   + 74]; let x2bIm_4 = out512[idx   + 75];
          let x2cRe_4 = out512[idx   + 76]; let x2cIm_4 = out512[idx   + 77];
          let x2dRe_4 = out512[idx   + 78]; let x2dIm_4 = out512[idx   + 79];
          let x2aRe_8 = out512[idx   + 80]; let x2aIm_8 = out512[idx   + 81];        //turning point

          let x3aRe_0 = out512[idx   + 96]; let x3aIm_0 = out512[idx   + 97];
          let x3bRe_0 = out512[idx   + 98]; let x3bIm_0 = out512[idx   + 99];
          let x3cRe_0 = out512[idx   +100]; let x3cIm_0 = out512[idx   +101];
          let x3dRe_0 = out512[idx   +102]; let x3dIm_0 = out512[idx   +103];
          let x3aRe_4 = out512[idx   +104]; let x3aIm_4 = out512[idx   +105];
          let x3bRe_4 = out512[idx   +106]; let x3bIm_4 = out512[idx   +107];
          let x3cRe_4 = out512[idx   +108]; let x3cIm_4 = out512[idx   +109];
          let x3dRe_4 = out512[idx   +110]; let x3dIm_4 = out512[idx   +111];
          let x3aRe_8 = out512[idx   +112]; let x3aIm_8 = out512[idx   +113];        //turning point

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

          out512[idx       ] =   (x0aRe_0 + x1aRe_0) + (x2aRe_0 + x3aRe_0);
          out512[idx  +  64] =   (x0aRe_0 + x1aRe_0) - (x2aRe_0 + x3aRe_0);
          out512[idx  +  65] =                       - (x2aIm_0 + x3aIm_0);
          out512[idx  +   1] =                         (x2aIm_0 + x3aIm_0); 
          let res0ReB = x0bRe_0 + T0x1bRe + ((x2bRe_0 + T0x3bRe)*  t2Re_2b - ((x2bIm_0 + T0x3bIm)*  t2Re_2p));
          out512[idx  +   2] =   res0ReB;
          out512[idx  + 126] =   res0ReB; 
          let res0ImB = x0bIm_0 + T0x1bIm + ((x2bRe_0 + T0x3bRe)*  t2Re_2p + ((x2bIm_0 + T0x3bIm)*  t2Re_2b)); 
          out512[idx  + 127] = - res0ImB;
          out512[idx  +   3] =   res0ImB;
          let res0ReC = x0cRe_0 + T0x0cRe + ((x2cRe_0 + T0x2cRe)*  t2Re_2c - ((x2cIm_0 + T0x2cIm)*  t2Re_2o));  
          out512[idx  +   4] =   res0ReC;
          out512[idx  + 124] =   res0ReC;
          let res0ImC = x0cIm_0 + T0x0cIm + ((x2cRe_0 + T0x2cRe)*  t2Re_2o + ((x2cIm_0 + T0x2cIm)*  t2Re_2c));
          out512[idx  + 125] = - res0ImC;
          out512[idx  +   5] =   res0ImC; 
          let res0ReD = x0dRe_0 + T0x1dRe + ((x2dRe_0 + T0x3dRe)*  t2Re_2d - ((x2dIm_0 + T0x3dIm)*  t2Re_2n));  
          out512[idx  +   6] =   res0ReD;
          out512[idx  + 122] =   res0ReD;
          let res0ImD = x0dIm_0 + T0x1dIm + ((x2dRe_0 + T0x3dRe)*  t2Re_2n + ((x2dIm_0 + T0x3dIm)*  t2Re_2d)); 
          out512[idx  + 123] = - res0ImD;
          out512[idx  +   7] =   res0ImD;  
          let res1ReA =    (x0aRe_0 - x1aRe_0) - (x2aIm_0 - x3aIm_0);
          out512[idx  +  32] =   res1ReA;
          out512[idx  +  96] =   res1ReA;
          let res1ImA =                          (x2aRe_0 - x3aRe_0); 
          out512[idx  +  97] = - res1ImA;
          out512[idx  +  33] =   res1ImA;
          let res1ReB = x0bRe_0 - T0x1bRe + ((x2bRe_0 - T0x3bRe)* -t2Re_2p  - ((x2bIm_0 - T0x3bIm)*  t2Re_2b ));
          out512[idx  +  34] =   res1ReB;
          out512[idx  +  94] =   res1ReB;
          let res1ImB = x0bIm_0 - T0x1bIm + ((x2bRe_0 - T0x3bRe)*  t2Re_2b  + ((x2bIm_0 - T0x3bIm)* -t2Re_2p )); 
          out512[idx  +  95] = - res1ImB; 
          out512[idx  +  35] =   res1ImB;
          let res1ReC = x0cRe_0 - T0x0cRe + ((x2cRe_0 - T0x2cRe)* -t2Re_2o  - ((x2cIm_0 - T0x2cIm)*  t2Re_2c )); 
          out512[idx  +  36] =   res1ReC;
          out512[idx  +  92] =   res1ReC;
          let res1ImC = x0cIm_0 - T0x0cIm + ((x2cRe_0 - T0x2cRe)*  t2Re_2c  + ((x2cIm_0 - T0x2cIm)* -t2Re_2o ));
          out512[idx  +  93] = - res1ImC;  
          out512[idx  +  37] =   res1ImC; 
          let res1ReD = x0dRe_0 - T0x1dRe + ((x2dRe_0 - T0x3dRe)* -t2Re_2n  - ((x2dIm_0 - T0x3dIm)*  t2Re_2d ));
          out512[idx  +  38] =   res1ReD;
          out512[idx  +  90] =   res1ReD;
          let res1ImD = x0dIm_0 - T0x1dIm + ((x2dRe_0 - T0x3dRe)*  t2Re_2d  + ((x2dIm_0 - T0x3dIm)* -t2Re_2n ));  
          out512[idx  +  91] = - res1ImD; 
          out512[idx  +  39] =   res1ImD;

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
          out512[idx  +   8] =   res2ReA;
          out512[idx  + 120] =   res2ReA;
          let res2ImA = x0aIm_4 + T1x0aIm + ((x2aRe_4 + T1x2aRe)*  t2Re_2m + ((x2aIm_4 + T1x2aIm)*  t2Re_2e)); 
          out512[idx  + 121] = - res2ImA; 
          out512[idx  +   9] =   res2ImA;
          let res2ReB = x0bRe_4 + T1x1bRe + ((x2bRe_4 + T1x3bRe)*  t2Re_2f - ((x2bIm_4 + T1x3bIm)*  t2Re_2l));
          out512[idx  +  10] =   res2ReB;
          out512[idx  + 118] =   res2ReB; 
          let res2ImB = x0bIm_4 + T1x1bIm + ((x2bRe_4 + T1x3bRe)*  t2Re_2l + ((x2bIm_4 + T1x3bIm)*  t2Re_2f));  
          out512[idx  + 119] = - res2ImB; 
          out512[idx  +  11] =   res2ImB; 
          let res2ReC = x0cRe_4 + T1x0cRe + ((x2cRe_4 + T1x2cRe)*  t2Re_2g - ((x2cIm_4 + T1x2cIm)*  t2Re_2k));
          out512[idx  +  12] =   res2ReC;
          out512[idx  + 116] =   res2ReC;  
          let res2ImC = x0cIm_4 + T1x0cIm + ((x2cRe_4 + T1x2cRe)*  t2Re_2k + ((x2cIm_4 + T1x2cIm)*  t2Re_2g)); 
          out512[idx  + 117] = - res2ImC; 
          out512[idx  +  13] =   res2ImC; 
          let res2ReD = x0dRe_4 + T1x1dRe + ((x2dRe_4 + T1x3dRe)*  t2Re_2h - ((x2dIm_4 + T1x3dIm)*  t2Re_2j));  
          out512[idx  +  14] =   res2ReD;
          out512[idx  + 114] =   res2ReD;
          let res2ImD = x0dIm_4 + T1x1dIm + ((x2dRe_4 + T1x3dRe)*  t2Re_2j + ((x2dIm_4 + T1x3dIm)*  t2Re_2h));
          out512[idx  + 115] = - res2ImD; 
          out512[idx  +  15] =   res2ImD;
          let res3ReA = x0aRe_4 - T1x0aRe + ((x2aRe_4 - T1x2aRe)* -t2Re_2m  - ((x2aIm_4 - T1x2aIm)*  t2Re_2e ));
          out512[idx  +  40] =   res3ReA;
          out512[idx  +  88] =   res3ReA;
          let res3ImA = x0aIm_4 - T1x0aIm + ((x2aRe_4 - T1x2aRe)*  t2Re_2e  + ((x2aIm_4 - T1x2aIm)* -t2Re_2m )); 
          out512[idx  +  89] = - res3ImA;
          out512[idx  +  41] =   res3ImA; 
          let res3ReB = x0bRe_4 - T1x1bRe + ((x2bRe_4 - T1x3bRe)* -t2Re_2l  - ((x2bIm_4 - T1x3bIm)*  t2Re_2f ));
          out512[idx  +  42] =   res3ReB; 
          out512[idx  +  86] =   res3ReB;
          let res3ImB = x0bIm_4 - T1x1bIm + ((x2bRe_4 - T1x3bRe)*  t2Re_2f  + ((x2bIm_4 - T1x3bIm)* -t2Re_2l ));
          out512[idx  +  87] = - res3ImB; 
          out512[idx  +  43] =   res3ImB; 
          let res3ReC = x0cRe_4 - T1x0cRe + ((x2cRe_4 - T1x2cRe)* -t2Re_2k  - ((x2cIm_4 - T1x2cIm)*  t2Re_2g ));
          out512[idx  +  44] =   res3ReC;
          out512[idx  +  84] =   res3ReC;
          let res3ImC = x0cIm_4 - T1x0cIm + ((x2cRe_4 - T1x2cRe)*  t2Re_2g  + ((x2cIm_4 - T1x2cIm)* -t2Re_2k )); 
          out512[idx  +  85] = - res3ImC;
          out512[idx  +  45] =   res3ImC;
          let res3ReD = x0dRe_4 - T1x1dRe + ((x2dRe_4 - T1x3dRe)* -t2Re_2j  - ((x2dIm_4 - T1x3dIm)*  t2Re_2h ));
          out512[idx  +  46] =   res3ReD;
          out512[idx  +  82] =   res3ReD;
          let res3ImD = x0dIm_4 - T1x1dIm + ((x2dRe_4 - T1x3dRe)*  t2Re_2h  + ((x2dIm_4 - T1x3dIm)* -t2Re_2j ));
          out512[idx  +  83] = - res3ImD;
          out512[idx  +  47] =   res3ImD; 

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
          out512[idx  +  16] =   res4ReA;
          out512[idx  + 112] =   res4ReA; 
          let res4ImA =  0       + T2x0aIm + ((x2aRe_8 + T2x2aRe)*  t2Re_2i + (( x2aIm_8 + T2x2aIm)*  t2Re_2i)); 
          out512[idx  + 113] = - res4ImA; 
          out512[idx  +  17] =   res4ImA;
          let res4ReB =  x0dRe_4 + T2x1bRe + ((x2dRe_4 + T2x3bRe)*  t2Re_2j - ((-x2dIm_4 + T2x3bIm)*  t2Re_2h)); 
          out512[idx  +  18] =   res4ReB;
          out512[idx  + 110] =   res4ReB;
          let res4ImB = -x0dIm_4 + T2x1bIm + ((x2dRe_4 + T2x3bRe)*  t2Re_2h + ((-x2dIm_4 + T2x3bIm)*  t2Re_2j)); 
          out512[idx  + 111] = - res4ImB; 
          out512[idx  +  19] =   res4ImB; 
          let res4ReC =  x0cRe_4 + T2x0cRe + ((x2cRe_4 + T2x2cRe)*  t2Re_2k - ((-x2cIm_4 + T2x2cIm)*  t2Re_2g)); 
          out512[idx  +  20] =   res4ReC;
          out512[idx  + 108] =   res4ReC; 
          let res4ImC = -x0cIm_4 + T2x0cIm + ((x2cRe_4 + T2x2cRe)*  t2Re_2g + ((-x2cIm_4 + T2x2cIm)*  t2Re_2k));   
          out512[idx  + 109] = - res4ImC;
          out512[idx  +  21] =   res4ImC;
          let res4ReD =  x0bRe_4 + T2x1dRe + ((x2bRe_4 + T2x3dRe)*  t2Re_2l - ((-x2bIm_4 + T2x3dIm)*  t2Re_2f)); 
          out512[idx  +  22] =   res4ReD;
          out512[idx  + 106] =   res4ReD; 
          let res4ImD = -x0bIm_4 + T2x1dIm + ((x2bRe_4 + T2x3dRe)*  t2Re_2f + ((-x2bIm_4 + T2x3dIm)*  t2Re_2l)); 
          out512[idx  + 107] = - res4ImD;
          out512[idx  +  23] =   res4ImD;
          let res5ReA =  x0aRe_8 - T2x0aRe + ((x2aRe_8 - T2x2aRe)* -t2Re_2i  - (( x2aIm_8 - T2x2aIm)*  t2Re_2i ));
          out512[idx  +  48] =   res5ReA;
          out512[idx  +  80] =   res5ReA;
          let res5ImA =  0       - T2x0aIm + ((x2aRe_8 - T2x2aRe)*  t2Re_2i  + (( x2aIm_8 - T2x2aIm)* -t2Re_2i ));
          out512[idx  +  81] = - res5ImA;
          out512[idx  +  49] =   res5ImA; 
          let res5ReB =  x0dRe_4 - T2x1bRe + ((x2dRe_4 - T2x3bRe)* -t2Re_2h  - ((-x2dIm_4 - T2x3bIm)*  t2Re_2j ));
          out512[idx  +  50] =   res5ReB;
          out512[idx  +  78] =   res5ReB;
          let res5ImB = -x0dIm_4 - T2x1bIm + ((x2dRe_4 - T2x3bRe)*  t2Re_2j  + ((-x2dIm_4 - T2x3bIm)* -t2Re_2h ));
          out512[idx  +  79] = - res5ImB;
          out512[idx  +  51] =   res5ImB; 
          let res5ReC =  x0cRe_4 - T2x0cRe + ((x2cRe_4 - T2x2cRe)* -t2Re_2g  - ((-x2cIm_4 - T2x2cIm)*  t2Re_2k ));
          out512[idx  +  52] =   res5ReC;
          out512[idx  +  76] =   res5ReC;
          let res5ImC = -x0cIm_4 - T2x0cIm + ((x2cRe_4 - T2x2cRe)*  t2Re_2k  + ((-x2cIm_4 - T2x2cIm)* -t2Re_2g ));
          out512[idx  +  77] = - res5ImC; 
          out512[idx  +  53] =   res5ImC;
          let res5ReD =  x0bRe_4 - T2x1dRe + ((x2bRe_4 - T2x3dRe)* -t2Re_2f  - ((-x2bIm_4 - T2x3dIm)*  t2Re_2l ));
          out512[idx  +  54] =   res5ReD;
          out512[idx  +  74] =   res5ReD;
          let res5ImD = -x0bIm_4 - T2x1dIm + ((x2bRe_4 - T2x3dRe)*  t2Re_2l  + ((-x2bIm_4 - T2x3dIm)* -t2Re_2f ));
          out512[idx  +  75] = - res5ImD;
          out512[idx  +  55] =   res5ImD;

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
          out512[idx  +  24] =   res6ReA;
          out512[idx  + 104] =   res6ReA;
          let res6ImA = -x0aIm_4 + T3x0aIm + ((x2aRe_4 + T3x2aRe)*  t2Re_2e + ((-x2aIm_4 + T3x2aIm)*  t2Re_2m)); 
          out512[idx  + 105] = - res6ImA; 
          out512[idx  +  25] =   res6ImA;
          let res6ReB =  x0dRe_0 + T3x1bRe + ((x2dRe_0 + T3x3bRe)*  t2Re_2n - ((-x2dIm_0 + T3x3bIm)*  t2Re_2d)); 
          out512[idx  +  26] =   res6ReB;
          out512[idx  + 102] =   res6ReB;
          let res6ImB = -x0dIm_0 + T3x1bIm + ((x2dRe_0 + T3x3bRe)*  t2Re_2d + ((-x2dIm_0 + T3x3bIm)*  t2Re_2n)); 
          out512[idx  + 103] = - res6ImB; 
          out512[idx  +  27] =   res6ImB; 
          let res6ReC =  x0cRe_0 + T3x0cRe + ((x2cRe_0 + T3x2cRe)*  t2Re_2o - ((-x2cIm_0 + T3x2cIm)*  t2Re_2c));  
          out512[idx  +  28] =   res6ReC;
          out512[idx  + 100] =   res6ReC;
          let res6ImC = -x0cIm_0 + T3x0cIm + ((x2cRe_0 + T3x2cRe)*  t2Re_2c + ((-x2cIm_0 + T3x2cIm)*  t2Re_2o)); 
          out512[idx  + 101] = - res6ImC; 
          out512[idx  +  29] =   res6ImC; 
          let res6ReD =  x0bRe_0 + T3x1dRe + ((x2bRe_0 + T3x3dRe)*  t2Re_2p - ((-x2bIm_0 + T3x3dIm)*  t2Re_2b)); 
          out512[idx  +  30] =   res6ReD;
          out512[idx  +  98] =   res6ReD; 
          let res6ImD = -x0bIm_0 + T3x1dIm + ((x2bRe_0 + T3x3dRe)*  t2Re_2b + ((-x2bIm_0 + T3x3dIm)*  t2Re_2p)); 
          out512[idx  +  99] = - res6ImD;
          out512[idx  +  31] =   res6ImD;
          let res7ReA =  x0aRe_4 - T3x0aRe + ((x2aRe_4 - T3x2aRe)* -t2Re_2e  - ((-x2aIm_4 - T3x2aIm)*  t2Re_2m ));
          out512[idx  +  56] =   res7ReA;
          out512[idx  +  72] =   res7ReA;
          let res7ImA = -x0aIm_4 - T3x0aIm + ((x2aRe_4 - T3x2aRe)*  t2Re_2m  + ((-x2aIm_4 - T3x2aIm)* -t2Re_2e ));
          out512[idx  +  73] = - res7ImA;
          out512[idx  +  57] =   res7ImA;
          let res7ReB =  x0dRe_0 - T3x1bRe + ((x2dRe_0 - T3x3bRe)* -t2Re_2d  - ((-x2dIm_0 - T3x3bIm)*  t2Re_2n ));
          out512[idx  +  58] =   res7ReB;
          out512[idx  +  70] =   res7ReB;
          let res7ImB = -x0dIm_0 - T3x1bIm + ((x2dRe_0 - T3x3bRe)*  t2Re_2n  + ((-x2dIm_0 - T3x3bIm)* -t2Re_2d ));
          out512[idx  +  71] = - res7ImB; 
          out512[idx  +  59] =   res7ImB;
          let res7ReC =  x0cRe_0 - T3x0cRe + ((x2cRe_0 - T3x2cRe)* -t2Re_2c  - ((-x2cIm_0 - T3x2cIm)*  t2Re_2o ));
          out512[idx  +  60] =   res7ReC;
          out512[idx  +  68] =   res7ReC;
          let res7ImC = -x0cIm_0 - T3x0cIm + ((x2cRe_0 - T3x2cRe)*  t2Re_2o  + ((-x2cIm_0 - T3x2cIm)* -t2Re_2c ));
          out512[idx  +  69] = - res7ImC;
          out512[idx  +  61] =   res7ImC;
          let res7ReD =  x0bRe_0 - T3x1dRe + ((x2bRe_0 - T3x3dRe)* -t2Re_2b  - ((-x2bIm_0 - T3x3dIm)*  t2Re_2p ));
          out512[idx  +  62] =   res7ReD;
          out512[idx  +  66] =   res7ReD;
          let res7ImD = -x0bIm_0 - T3x1dIm + ((x2bRe_0 - T3x3dRe)*  t2Re_2p  + ((-x2bIm_0 - T3x3dIm)* -t2Re_2b ));
          out512[idx  +  67] = - res7ImD;
          out512[idx  +  63] =   res7ImD;
    }

    
    /////////////////////////////////////////////
    // P = 2.5  -> 128
    //
            for(let idx = 0; idx < 1024; idx += 256){
            //for(let idx = 0; idx < 2048; idx += 256){
                let oRe0   = out512[idx +  128]; 
                let oIm0  = out512[idx +  129];
                let eRe0   = out512[idx +    0]; 
                let eIm0  = out512[idx +    1];
                let resRe0_s = eRe0 + oRe0;
                out512[idx +   0] = resRe0_s;
                let resIm0_s = eIm0 + oIm0;
                out512[idx +   1] = resIm0_s;
                let resRe0_d = eRe0 - oRe0;
                out512[idx + 128] = resRe0_d;
                let resIm0_d = eIm0 - oIm0
                out512[idx + 129] = resIm0_d;

                let oRe1   = out512[idx +  130]; 
                let oIm1  = out512[idx +  131];
                let eRe1   = out512[idx +    2]; 
                let eIm1  = out512[idx +    3];
                let resIm1_s = eIm1 + (oRe1 * tRe31 + oIm1 * tRe1);
                out512[idx +   3] =  resIm1_s;
                out512[idx + 255] = -resIm1_s;  
                let resRe1_s = eRe1 + (oRe1 * tRe1 - oIm1 * tRe31);
                out512[idx + 254] =  resRe1_s;
                out512[idx +   2] =  resRe1_s; 
                let resRe63_s = eRe1 - (oRe1 *  tRe1 - oIm1 * tRe31);
                out512[idx + 130] =  resRe63_s; 
                out512[idx + 126] =  resRe63_s;  
                let resIm63_s = -eIm1 + (oRe1 * tRe31 + oIm1 * tRe1);
                out512[idx + 127] =  resIm63_s;
                out512[idx + 131] = -resIm63_s;

                let oRe2   = out512[idx +  132]; 
                let oIm2  = out512[idx +  133];
                let eRe2   = out512[idx +    4]; 
                let eIm2  = out512[idx +    5];
                let resIm2_s = eIm2 + (oRe2 * tRe30 + oIm2 * tRe2);
                out512[idx +   5] =  resIm2_s;
                out512[idx + 253] = -resIm2_s;
                let resRe2_s = eRe2 + (oRe2 * tRe2 - oIm2 * tRe30);
                out512[idx + 252] =  resRe2_s;
                out512[idx +   4] =  resRe2_s; 
                let resRe62_s = eRe2 - (oRe2 * tRe2 - oIm2 * tRe30);
                out512[idx + 132] =  resRe62_s;
                out512[idx + 124] =  resRe62_s; 
                let resIm62_s = -eIm2 + (oRe2 * tRe30 + oIm2 * tRe2);
                out512[idx + 125] =  resIm62_s;
                out512[idx + 133] = -resIm62_s;

                let oRe3   = out512[idx +  134]; 
                let oIm3  = out512[idx +  135];
                let eRe3   = out512[idx +    6]; 
                let eIm3  = out512[idx +    7];
                let resIm3_s = eIm3 + (oRe3 * tRe29 + oIm3 * tRe3);
                out512[idx +   7] =  resIm3_s;
                out512[idx + 251] = -resIm3_s;
                let resRe3_s = eRe3 + (oRe3 * tRe3 - oIm3 * tRe29);
                out512[idx + 250] =  resRe3_s;
                out512[idx +   6] =  resRe3_s; 
                let resRe61_s = eRe3 - (oRe3 * tRe3 - oIm3 * tRe29);
                out512[idx + 134] =  resRe61_s;
                out512[idx + 122] =  resRe61_s; 
                let resIm61_s = -eIm3 + (oRe3 * tRe29 + oIm3 * tRe3);
                out512[idx + 123] =  resIm61_s;
                out512[idx + 135] = -resIm61_s;

                let oRe4   = out512[idx +  136]; 
                let oIm4  = out512[idx +  137];
                let eRe4   = out512[idx +    8]; 
                let eIm4  = out512[idx +    9];
                let resIm4_s = eIm4 + (oRe4 * tRe28 + oIm4 * tRe4);
                out512[idx + 9] = resIm4_s;
                out512[idx + 249] = -resIm4_s;
                let resRe4_s = eRe4 + (oRe4 * tRe4 - oIm4 * tRe28);
                out512[idx + 248] = resRe4_s;
                out512[idx + 8] = resRe4_s; 
                let resRe60_s = eRe4 - (oRe4 * tRe4 - oIm4 * tRe28);
                out512[idx + 136] = resRe60_s;
                out512[idx + 120] = resRe60_s; 
                let resIm60_s = -eIm4 + (oRe4 * tRe28 + oIm4 * tRe4);
                out512[idx + 121] = resIm60_s;
                out512[idx + 137] = -resIm60_s;

                let oRe5 = out512[idx + 138]; 
                let oIm5 = out512[idx + 139];
                let eRe5 = out512[idx + 10]; 
                let eIm5 = out512[idx + 11];
                let resIm5_s = eIm5 + (oRe5 * tRe27 + oIm5 * tRe5);
                out512[idx + 11] = resIm5_s;
                out512[idx + 247] = -resIm5_s;
                let resRe5_s = eRe5 + (oRe5 * tRe5 - oIm5 * tRe27);
                out512[idx + 246] = resRe5_s;
                out512[idx + 10] = resRe5_s; 
                let resRe59_s = eRe5 - (oRe5 * tRe5 - oIm5 * tRe27);
                out512[idx + 138] = resRe59_s;
                out512[idx + 118] = resRe59_s; 
                let resIm59_s = -eIm5 + (oRe5 * tRe27 + oIm5 * tRe5);
                out512[idx + 119] = resIm59_s;
                out512[idx + 139] = -resIm59_s;

                // For elements 9 to 10
                let oRe6 = out512[idx + 140]; 
                let oIm6 = out512[idx + 141];
                let eRe6 = out512[idx + 12]; 
                let eIm6 = out512[idx + 13];
                let resIm6_s = eIm6 + (oRe6 * tRe26 + oIm6 * tRe6);
                out512[idx + 13] = resIm6_s;
                out512[idx + 245] = -resIm6_s;
                let resRe6_s = eRe6 + (oRe6 * tRe6 - oIm6 * tRe26);
                out512[idx + 244] = resRe6_s;
                out512[idx + 12] = resRe6_s; 
                let resRe58_s = eRe6 - (oRe6 * tRe6 - oIm6 * tRe26);
                out512[idx + 140] = resRe58_s;
                out512[idx + 116] = resRe58_s; 
                let resIm58_s = -eIm6 + (oRe6 * tRe26 + oIm6 * tRe6);
                out512[idx + 117] = resIm58_s;
                out512[idx + 141] = -resIm58_s;

                // For elements 11 to 12
                let oRe7 = out512[idx + 142]; 
                let oIm7 = out512[idx + 143];
                let eRe7 = out512[idx + 14]; 
                let eIm7 = out512[idx + 15];
                let resIm7_s = eIm7 + (oRe7 * tRe25 + oIm7 * tRe7);
                out512[idx + 15] = resIm7_s;
                out512[idx + 243] = -resIm7_s;
                let resRe7_s = eRe7 + (oRe7 * tRe7 - oIm7 * tRe25);
                out512[idx + 242] = resRe7_s;
                out512[idx + 14] = resRe7_s; 
                let resRe57_s = eRe7 - (oRe7 * tRe7 - oIm7 * tRe25);
                out512[idx + 142] = resRe57_s;
                out512[idx + 114] = resRe57_s; 
                let resIm57_s = -eIm7 + (oRe7 * tRe25 + oIm7 * tRe7);
                out512[idx + 115] = resIm57_s;
                out512[idx + 143] = -resIm57_s;

                // For elements 13 to 14
                let oRe8 = out512[idx + 144]; 
                let oIm8 = out512[idx + 145];
                let eRe8 = out512[idx + 16]; 
                let eIm8 = out512[idx + 17];
                let resIm8_s = eIm8 + (oRe8 * tRe24 + oIm8 * tRe8);
                out512[idx + 17] = resIm8_s;
                out512[idx + 241] = -resIm8_s;
                let resRe8_s = eRe8 + (oRe8 * tRe8 - oIm8 * tRe24);
                out512[idx + 240] = resRe8_s;
                out512[idx + 16] = resRe8_s; 
                let resRe56_s = eRe8 - (oRe8 * tRe8 - oIm8 * tRe24);
                out512[idx + 144] = resRe56_s;
                out512[idx + 112] = resRe56_s; 
                let resIm56_s = -eIm8 + (oRe8 * tRe24 + oIm8 * tRe8);
                out512[idx + 113] = resIm56_s;
                out512[idx + 145] = -resIm56_s;

                // For elements 15 to 16
                let oRe9 = out512[idx + 146]; 
                let oIm9 = out512[idx + 147];
                let eRe9 = out512[idx + 18]; 
                let eIm9 = out512[idx + 19];
                let resIm9_s = eIm9 + (oRe9 * tRe23 + oIm9 * tRe9);
                out512[idx + 19] = resIm9_s;
                out512[idx + 239] = -resIm9_s;
                let resRe9_s = eRe9 + (oRe9 * tRe9 - oIm9 * tRe23);
                out512[idx + 238] = resRe9_s;
                out512[idx + 18] = resRe9_s; 
                let resRe55_s = eRe9 - (oRe9 * tRe9 - oIm9 * tRe23);
                out512[idx + 146] = resRe55_s;
                out512[idx + 110] = resRe55_s; 
                let resIm55_s = -eIm9 + (oRe9 * tRe23 + oIm9 * tRe9);
                out512[idx + 111] = resIm55_s;
                out512[idx + 147] = -resIm55_s;

                // For elements 17 to 18
                let oRe10 = out512[idx + 148]; 
                let oIm10 = out512[idx + 149];
                let eRe10 = out512[idx + 20]; 
                let eIm10 = out512[idx + 21];
                let resIm10_s = eIm10 + (oRe10 * tRe22 + oIm10 * tRe10);
                out512[idx + 21] = resIm10_s;
                out512[idx + 237] = -resIm10_s;
                let resRe10_s = eRe10 + (oRe10 * tRe10 - oIm10 * tRe22);
                out512[idx + 236] = resRe10_s;
                out512[idx + 20] = resRe10_s; 
                let resRe54_s = eRe10 - (oRe10 * tRe10 - oIm10 * tRe22);
                out512[idx + 148] = resRe54_s;
                out512[idx + 108] = resRe54_s; 
                let resIm54_s = -eIm10 + (oRe10 * tRe22 + oIm10 * tRe10);
                out512[idx + 109] = resIm54_s;
                out512[idx + 149] = -resIm54_s;

                // For elements 19 to 20
                let oRe11 = out512[idx + 150]; 
                let oIm11 = out512[idx + 151];
                let eRe11 = out512[idx + 22]; 
                let eIm11 = out512[idx + 23];
                let resIm11_s = eIm11 + (oRe11 * tRe21 + oIm11 * tRe11);
                out512[idx + 23] = resIm11_s;
                out512[idx + 235] = -resIm11_s;
                let resRe11_s = eRe11 + (oRe11 * tRe11 - oIm11 * tRe21);
                out512[idx + 234] = resRe11_s;
                out512[idx + 22] = resRe11_s; 
                let resRe53_s = eRe11 - (oRe11 * tRe11 - oIm11 * tRe21);
                out512[idx + 150] = resRe53_s;
                out512[idx + 106] = resRe53_s; 
                let resIm53_s = -eIm11 + (oRe11 * tRe21 + oIm11 * tRe11);
                out512[idx + 107] = resIm53_s;
                out512[idx + 151] = -resIm53_s;

                // For elements 21 to 22
                let oRe12 = out512[idx + 152]; 
                let oIm12 = out512[idx + 153];
                let eRe12 = out512[idx + 24]; 
                let eIm12 = out512[idx + 25];
                let resIm12_s = eIm12 + (oRe12 * tRe20 + oIm12 * tRe12);
                out512[idx + 25] = resIm12_s;
                out512[idx + 233] = -resIm12_s;
                let resRe12_s = eRe12 + (oRe12 * tRe12 - oIm12 * tRe20);
                out512[idx + 232] = resRe12_s;
                out512[idx + 24] = resRe12_s; 
                let resRe52_s = eRe12 - (oRe12 * tRe12 - oIm12 * tRe20);
                out512[idx + 152] = resRe52_s;
                out512[idx + 104] = resRe52_s; 
                let resIm52_s = -eIm12 + (oRe12 * tRe20 + oIm12 * tRe12);
                out512[idx + 105] = resIm52_s;
                out512[idx + 153] = -resIm52_s;

                // For elements 23 to 24
                let oRe13 = out512[idx + 154]; 
                let oIm13 = out512[idx + 155];
                let eRe13 = out512[idx + 26]; 
                let eIm13 = out512[idx + 27];
                let resIm13_s = eIm13 + (oRe13 * tRe19 + oIm13 * tRe13);
                out512[idx + 27] = resIm13_s;
                out512[idx + 231] = -resIm13_s;
                let resRe13_s = eRe13 + (oRe13 * tRe13 - oIm13 * tRe19);
                out512[idx + 230] = resRe13_s;
                out512[idx + 26] = resRe13_s; 
                let resRe51_s = eRe13 - (oRe13 * tRe13 - oIm13 * tRe19);
                out512[idx + 154] = resRe51_s;
                out512[idx + 102] = resRe51_s; 
                let resIm51_s = -eIm13 + (oRe13 * tRe19 + oIm13 * tRe13);
                out512[idx + 103] = resIm51_s;
                out512[idx + 155] = -resIm51_s;

                // For elements 25 to 26
                let oRe14 = out512[idx + 156]; 
                let oIm14 = out512[idx + 157];
                let eRe14 = out512[idx + 28]; 
                let eIm14 = out512[idx + 29];
                let resIm14_s = eIm14 + (oRe14 * tRe18 + oIm14 * tRe14);
                out512[idx + 29] = resIm14_s;
                out512[idx + 229] = -resIm14_s;
                let resRe14_s = eRe14 + (oRe14 * tRe14 - oIm14 * tRe18);
                out512[idx + 228] = resRe14_s;
                out512[idx + 28] = resRe14_s; 
                let resRe50_s = eRe14 - (oRe14 * tRe14 - oIm14 * tRe18);
                out512[idx + 156] = resRe50_s;
                out512[idx + 100] = resRe50_s; 
                let resIm50_s = -eIm14 + (oRe14 * tRe18 + oIm14 * tRe14);
                out512[idx + 101] = resIm50_s;
                out512[idx + 157] = -resIm50_s;

                // For elements 27 to 28
                let oRe15 = out512[idx + 158]; 
                let oIm15 = out512[idx + 159];
                let eRe15 = out512[idx + 30]; 
                let eIm15 = out512[idx + 31];
                let resIm15_s = eIm15 + (oRe15 * tRe17 + oIm15 * tRe15);
                out512[idx + 31] = resIm15_s;
                out512[idx + 227] = -resIm15_s;
                let resRe15_s = eRe15 + (oRe15 * tRe15 - oIm15 * tRe17);
                out512[idx + 226] = resRe15_s;
                out512[idx + 30] = resRe15_s; 
                let resRe49_s = eRe15 - (oRe15 * tRe15 - oIm15 * tRe17);
                out512[idx + 158] = resRe49_s;
                out512[idx + 98] = resRe49_s; 
                let resIm49_s = -eIm15 + (oRe15 * tRe17 + oIm15 * tRe15);
                out512[idx + 99] = resIm49_s;
                out512[idx + 159] = -resIm49_s;

                // For elements 29 to 30
                let oRe16 = out512[idx + 160]; 
                let oIm16 = out512[idx + 161];
                let eRe16 = out512[idx + 32]; 
                let eIm16 = out512[idx + 33];
                let resIm16_s = eIm16 + (oRe16 * tRe16 + oIm16 * tRe16);
                out512[idx + 33] = resIm16_s;
                out512[idx + 225] = -resIm16_s;
                let resRe16_s = eRe16 + (oRe16 * tRe16 - oIm16 * tRe16);
                out512[idx + 224] = resRe16_s;
                out512[idx + 32] = resRe16_s; 
                let resRe48_s = eRe16 - (oRe16 * tRe16 - oIm16 * tRe16);
                out512[idx + 160] = resRe48_s;
                out512[idx + 96] = resRe48_s; 
                let resIm48_s = -eIm16 + (oRe16 * tRe16 + oIm16 * tRe16);
                out512[idx + 97] = resIm48_s;
                out512[idx + 161] = -resIm48_s;

                // For elements 31 to 32
                let oRe17 = out512[idx + 162]; 
                let oIm17 = out512[idx + 163];
                let eRe17 = out512[idx + 34]; 
                let eIm17 = out512[idx + 35];
                let resIm17_s = eIm17 + (oRe17 * tRe15 + oIm17 * tRe17);
                out512[idx + 35] = resIm17_s;
                out512[idx + 223] = -resIm17_s;
                let resRe17_s = eRe17 + (oRe17 * tRe17 - oIm17 * tRe15);
                out512[idx + 222] = resRe17_s;
                out512[idx + 34] = resRe17_s; 
                let resRe47_s = eRe17 - (oRe17 * tRe17 - oIm17 * tRe15);
                out512[idx + 162] = resRe47_s;
                out512[idx + 94] = resRe47_s; 
                let resIm47_s = -eIm17 + (oRe17 * tRe15 + oIm17 * tRe17);
                out512[idx + 95] = resIm47_s;
                out512[idx + 163] = -resIm47_s;

                // For elements 33 to 34
                let oRe18 = out512[idx + 164]; 
                let oIm18 = out512[idx + 165];
                let eRe18 = out512[idx + 36]; 
                let eIm18 = out512[idx + 37];
                let resIm18_s = eIm18 + (oRe18 * tRe14 + oIm18 * tRe18);
                out512[idx + 37] = resIm18_s;
                out512[idx + 221] = -resIm18_s;
                let resRe18_s = eRe18 + (oRe18 * tRe18 - oIm18 * tRe14);
                out512[idx + 220] = resRe18_s;
                out512[idx + 36] = resRe18_s; 
                let resRe46_s = eRe18 - (oRe18 * tRe18 - oIm18 * tRe14);
                out512[idx + 164] = resRe46_s;
                out512[idx + 92] = resRe46_s; 
                let resIm46_s = -eIm18 + (oRe18 * tRe14 + oIm18 * tRe18);
                out512[idx + 93] = resIm46_s;
                out512[idx + 165] = -resIm46_s;

                // For elements 35 to 36
                let oRe19 = out512[idx + 166]; 
                let oIm19 = out512[idx + 167];
                let eRe19 = out512[idx + 38]; 
                let eIm19 = out512[idx + 39];
                let resIm19_s = eIm19 + (oRe19 * tRe13 + oIm19 * tRe19);
                out512[idx + 39] = resIm19_s;
                out512[idx + 219] = -resIm19_s;
                let resRe19_s = eRe19 + (oRe19 * tRe19 - oIm19 * tRe13);
                out512[idx + 218] = resRe19_s;
                out512[idx + 38] = resRe19_s; 
                let resRe45_s = eRe19 - (oRe19 * tRe19 - oIm19 * tRe13);
                out512[idx + 166] = resRe45_s;
                out512[idx + 90] = resRe45_s; 
                let resIm45_s = -eIm19 + (oRe19 * tRe13 + oIm19 * tRe19);
                out512[idx + 91] = resIm45_s;
                out512[idx + 167] = -resIm45_s;

                // For elements 37 to 38
                let oRe20 = out512[idx + 168]; 
                let oIm20 = out512[idx + 169];
                let eRe20 = out512[idx + 40]; 
                let eIm20 = out512[idx + 41];
                let resIm20_s = eIm20 + (oRe20 * tRe12 + oIm20 * tRe20);
                out512[idx + 41] = resIm20_s;
                out512[idx + 217] = -resIm20_s;
                let resRe20_s = eRe20 + (oRe20 * tRe20 - oIm20 * tRe12);
                out512[idx + 216] = resRe20_s;
                out512[idx + 40] = resRe20_s; 
                let resRe44_s = eRe20 - (oRe20 * tRe20 - oIm20 * tRe12);
                out512[idx + 168] = resRe44_s;
                out512[idx + 88] = resRe44_s; 
                let resIm44_s = -eIm20 + (oRe20 * tRe12 + oIm20 * tRe20);
                out512[idx + 89] = resIm44_s;
                out512[idx + 169] = -resIm44_s;

                // For elements 39 to 40
                let oRe21 = out512[idx + 170]; 
                let oIm21 = out512[idx + 171];
                let eRe21 = out512[idx + 42]; 
                let eIm21 = out512[idx + 43];
                let resIm21_s = eIm21 + (oRe21 * tRe11 + oIm21 * tRe21);
                out512[idx + 43] = resIm21_s;
                out512[idx + 215] = -resIm21_s;
                let resRe21_s = eRe21 + (oRe21 * tRe21 - oIm21 * tRe11);
                out512[idx + 214] = resRe21_s;
                out512[idx + 42] = resRe21_s; 
                let resRe43_s = eRe21 - (oRe21 * tRe21 - oIm21 * tRe11);
                out512[idx + 170] = resRe43_s;
                out512[idx + 86] = resRe43_s; 
                let resIm43_s = -eIm21 + (oRe21 * tRe11 + oIm21 * tRe21);
                out512[idx + 87] = resIm43_s;
                out512[idx + 171] = -resIm43_s;

                // For elements 41 to 42
                let oRe22 = out512[idx + 172]; 
                let oIm22 = out512[idx + 173];
                let eRe22 = out512[idx + 44]; 
                let eIm22 = out512[idx + 45];
                let resIm22_s = eIm22 + (oRe22 * tRe10 + oIm22 * tRe22);
                out512[idx + 45] = resIm22_s;
                out512[idx + 213] = -resIm22_s;
                let resRe22_s = eRe22 + (oRe22 * tRe22 - oIm22 * tRe10);
                out512[idx + 212] = resRe22_s;
                out512[idx + 44] = resRe22_s; 
                let resRe42_s = eRe22 - (oRe22 * tRe22 - oIm22 * tRe10);
                out512[idx + 172] = resRe42_s;
                out512[idx + 84] = resRe42_s; 
                let resIm42_s = -eIm22 + (oRe22 * tRe10 + oIm22 * tRe22);
                out512[idx + 85] = resIm42_s;
                out512[idx + 173] = -resIm42_s;

                // For elements 43 to 44
                let oRe23 = out512[idx + 174]; 
                let oIm23 = out512[idx + 175];
                let eRe23 = out512[idx + 46]; 
                let eIm23 = out512[idx + 47];
                let resIm23_s = eIm23 + (oRe23 * tRe9 + oIm23 * tRe23);
                out512[idx + 47] = resIm23_s;
                out512[idx + 211] = -resIm23_s;
                let resRe23_s = eRe23 + (oRe23 * tRe23 - oIm23 * tRe9);
                out512[idx + 210] = resRe23_s;
                out512[idx + 46] = resRe23_s; 
                let resRe41_s = eRe23 - (oRe23 * tRe23 - oIm23 * tRe9);
                out512[idx + 174] = resRe41_s;
                out512[idx + 82] = resRe41_s; 
                let resIm41_s = -eIm23 + (oRe23 * tRe9 + oIm23 * tRe23);
                out512[idx + 83] = resIm41_s;
                out512[idx + 175] = -resIm41_s;

                // For elements 45 to 46
                let oRe24 = out512[idx + 176]; 
                let oIm24 = out512[idx + 177];
                let eRe24 = out512[idx + 48]; 
                let eIm24 = out512[idx + 49];
                let resIm24_s = eIm24 + (oRe24 * tRe8 + oIm24 * tRe24);
                out512[idx + 49] = resIm24_s;
                out512[idx + 209] = -resIm24_s;
                let resRe24_s = eRe24 + (oRe24 * tRe24 - oIm24 * tRe8);
                out512[idx + 208] = resRe24_s;
                out512[idx + 48] = resRe24_s; 
                let resRe40_s = eRe24 - (oRe24 * tRe24 - oIm24 * tRe8);
                out512[idx + 176] = resRe40_s;
                out512[idx + 80] = resRe40_s; 
                let resIm40_s = -eIm24 + (oRe24 * tRe8 + oIm24 * tRe24);
                out512[idx + 81] = resIm40_s;
                out512[idx + 177] = -resIm40_s;

                // For elements 47 to 48
                let oRe25 = out512[idx + 178]; 
                let oIm25 = out512[idx + 179];
                let eRe25 = out512[idx + 50]; 
                let eIm25 = out512[idx + 51];
                let resIm25_s = eIm25 + (oRe25 * tRe7 + oIm25 * tRe25);
                out512[idx + 51] = resIm25_s;
                out512[idx + 207] = -resIm25_s;
                let resRe25_s = eRe25 + (oRe25 * tRe25 - oIm25 * tRe7);
                out512[idx + 206] = resRe25_s;
                out512[idx + 50] = resRe25_s; 
                let resRe39_s = eRe25 - (oRe25 * tRe25 - oIm25 * tRe7);
                out512[idx + 178] = resRe39_s;
                out512[idx + 78] = resRe39_s; 
                let resIm39_s = -eIm25 + (oRe25 * tRe7 + oIm25 * tRe25);
                out512[idx + 79] = resIm39_s;
                out512[idx + 179] = -resIm39_s;

                // For elements 49 to 50
                let oRe26 = out512[idx + 180]; 
                let oIm26 = out512[idx + 181];
                let eRe26 = out512[idx + 52]; 
                let eIm26 = out512[idx + 53];
                let resIm26_s = eIm26 + (oRe26 * tRe6 + oIm26 * tRe26);
                out512[idx + 53] = resIm26_s;
                out512[idx + 205] = -resIm26_s;
                let resRe26_s = eRe26 + (oRe26 * tRe26 - oIm26 * tRe6);
                out512[idx + 204] = resRe26_s;
                out512[idx + 52] = resRe26_s; 
                let resRe38_s = eRe26 - (oRe26 * tRe26 - oIm26 * tRe6);
                out512[idx + 180] = resRe38_s;
                out512[idx + 76] = resRe38_s; 
                let resIm38_s = -eIm26 + (oRe26 * tRe6 + oIm26 * tRe26);
                out512[idx + 77] = resIm38_s;
                out512[idx + 181] = -resIm38_s;

                // For elements 51 to 52
                let oRe27 = out512[idx + 182]; 
                let oIm27 = out512[idx + 183];
                let eRe27 = out512[idx + 54]; 
                let eIm27 = out512[idx + 55];
                let resIm27_s = eIm27 + (oRe27 * tRe5 + oIm27 * tRe27);
                out512[idx + 55] = resIm27_s;
                out512[idx + 203] = -resIm27_s;
                let resRe27_s = eRe27 + (oRe27 * tRe27 - oIm27 * tRe5);
                out512[idx + 202] = resRe27_s;
                out512[idx + 54] = resRe27_s; 
                let resRe37_s = eRe27 - (oRe27 * tRe27 - oIm27 * tRe5);
                out512[idx + 182] = resRe37_s;
                out512[idx + 74] = resRe37_s; 
                let resIm37_s = -eIm27 + (oRe27 * tRe5 + oIm27 * tRe27);
                out512[idx + 75] = resIm37_s;
                out512[idx + 183] = -resIm37_s;

                // For elements 53 to 54
                let oRe28 = out512[idx + 184]; 
                let oIm28 = out512[idx + 185];
                let eRe28 = out512[idx + 56]; 
                let eIm28 = out512[idx + 57];
                let resIm28_s = eIm28 + (oRe28 * tRe4 + oIm28 * tRe28);
                out512[idx + 57] = resIm28_s;
                out512[idx + 201] = -resIm28_s;
                let resRe28_s = eRe28 + (oRe28 * tRe28 - oIm28 * tRe4);
                out512[idx + 200] = resRe28_s;
                out512[idx + 56] = resRe28_s; 
                let resRe36_s = eRe28 - (oRe28 * tRe28 - oIm28 * tRe4);
                out512[idx + 184] = resRe36_s;
                out512[idx + 72] = resRe36_s; 
                let resIm36_s = -eIm28 + (oRe28 * tRe4 + oIm28 * tRe28);
                out512[idx + 73] = resIm36_s;
                out512[idx + 185] = -resIm36_s;

                // For elements 55 to 56
                let oRe29 = out512[idx + 186]; 
                let oIm29 = out512[idx + 187];
                let eRe29 = out512[idx + 58]; 
                let eIm29 = out512[idx + 59];
                let resIm29_s = eIm29 + (oRe29 * tRe3 + oIm29 * tRe29);
                out512[idx + 59] = resIm29_s;
                out512[idx + 199] = -resIm29_s;
                let resRe29_s = eRe29 + (oRe29 * tRe29 - oIm29 * tRe3);
                out512[idx + 198] = resRe29_s;
                out512[idx + 58] = resRe29_s; 
                let resRe35_s = eRe29 - (oRe29 * tRe29 - oIm29 * tRe3);
                out512[idx + 186] = resRe35_s;
                out512[idx + 70] = resRe35_s; 
                let resIm35_s = -eIm29 + (oRe29 * tRe3 + oIm29 * tRe29);
                out512[idx + 71] = resIm35_s;
                out512[idx + 187] = -resIm35_s;

                // For elements 57 to 58
                let oRe30 = out512[idx + 188]; 
                let oIm30 = out512[idx + 189];
                let eRe30 = out512[idx + 60]; 
                let eIm30 = out512[idx + 61];
                let resIm30_s = eIm30 + (oRe30 * tRe2 + oIm30 * tRe30);
                out512[idx + 61] = resIm30_s;
                out512[idx + 197] = -resIm30_s;
                let resRe30_s = eRe30 + (oRe30 * tRe30 - oIm30 * tRe2);
                out512[idx + 196] = resRe30_s;
                out512[idx + 60] = resRe30_s; 
                let resRe34_s = eRe30 - (oRe30 * tRe30 - oIm30 * tRe2);
                out512[idx + 188] = resRe34_s;
                out512[idx + 68] = resRe34_s; 
                let resIm34_s = -eIm30 + (oRe30 * tRe2 + oIm30 * tRe30);
                out512[idx + 69] = resIm34_s;
                out512[idx + 189] = -resIm34_s;

                // For elements 59 to 60
                let oRe31 = out512[idx + 190]; 
                let oIm31 = out512[idx + 191];
                let eRe31 = out512[idx + 62]; 
                let eIm31 = out512[idx + 63];
                let resIm31_s = eIm31 + (oRe31 * tRe1 + oIm31 * tRe31);
                out512[idx + 63] = resIm31_s;
                out512[idx + 195] = -resIm31_s;
                let resRe31_s = eRe31 + (oRe31 * tRe31 - oIm31 * tRe1);
                out512[idx + 194] = resRe31_s;
                out512[idx + 62] = resRe31_s; 
                let resRe33_s = eRe31 - (oRe31 * tRe31 - oIm31 * tRe1);
                out512[idx + 190] = resRe33_s;
                out512[idx + 66] = resRe33_s; 
                let resIm33_s = -eIm31 + (oRe31 * tRe1 + oIm31 * tRe31);
                out512[idx + 67] = resIm33_s;
                out512[idx + 191] = -resIm33_s;

                // For elements 61 to 62
                let oRe32  = out512[idx +  192]; 
                let oIm32 = out512[idx +  193];
                let eRe32  = out512[idx +   64]; 
                let eIm32 = out512[idx +   65];
                let resIm32_s = eIm32 + oRe32;
                out512[idx +  65] =  resIm32_s;
                out512[idx + 193] = -resIm32_s;
                let resRe32_s = eRe32 - oIm32;
                out512[idx + 192] =  resRe32_s;
                out512[idx +  64] =  resRe32_s; 
            }
        
    
    /////////////////////////////////////////////
    // P = 3  -> 256
    //

        for (let j = 0; j < 128; j++) {
            const evenIndex = j;
            const oddIndex  = j + 128;

            if(j > 64){
              out512[evenIndex * 2]     =  out512[512 - evenIndex * 2] ;
              out512[evenIndex * 2 + 1] = -out512[512 - evenIndex * 2 + 1];
              out512[oddIndex * 2]      =  out512[512 - oddIndex * 2];
              out512[oddIndex * 2 + 1]  = -out512[512 - oddIndex * 2 + 1];
              continue;
            }

            const evenPartRe = out512[evenIndex * 2];
            const evenPartIm = out512[evenIndex * 2 + 1];
            const oddPartRe  = out512[oddIndex * 2];
            const oddPartIm  = out512[oddIndex * 2 + 1];

            const twiddleRe = ____F[254 + (j * 2 + 0)];
            const twiddleIm = ____F[254 + (j * 2 + 1)];

            const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
            const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

            out512[evenIndex * 2]     = evenPartRe + twiddledOddRe;
            out512[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
            out512[oddIndex * 2]      = evenPartRe - twiddledOddRe;
            out512[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
        }

        for (let j = 0; j < 128; j++) {
            const evenIndex = 256 + j;
            const oddIndex  = 256 + j + 128;

            const evenPartRe = out512[evenIndex * 2];
            const evenPartIm = out512[evenIndex * 2 + 1];
            const oddPartRe  = out512[oddIndex * 2];
            const oddPartIm  = out512[oddIndex * 2 + 1];

            const twiddleRe = ____F[254 + (j * 2 + 0)];
            const twiddleIm = ____F[254 + (j * 2 + 1)];

            const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
            const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

            out512[evenIndex * 2]     = evenPartRe + twiddledOddRe;
            out512[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
            out512[oddIndex * 2]      = evenPartRe - twiddledOddRe;
            out512[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
        }
/*
        for (let j = 0; j < 128; j++) {
            const evenIndex = 512 + j;
            const oddIndex  = 512 + j + 128;

            const evenPartRe = out512[evenIndex * 2];
            const evenPartIm = out512[evenIndex * 2 + 1];
            const oddPartRe  = out512[oddIndex * 2];
            const oddPartIm  = out512[oddIndex * 2 + 1];

            const twiddleRe = ____F[254 + (j * 2 + 0)];
            const twiddleIm = ____F[254 + (j * 2 + 1)];

            const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
            const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

            out512[evenIndex * 2]     = evenPartRe + twiddledOddRe;
            out512[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
            out512[oddIndex * 2]      = evenPartRe - twiddledOddRe;
            out512[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
        }

        for (let j = 0; j < 128; j++) {
            const evenIndex = 768 + j;
            const oddIndex  = 768 + j + 128;

            const evenPartRe = out512[evenIndex * 2];
            const evenPartIm = out512[evenIndex * 2 + 1];
            const oddPartRe  = out512[oddIndex * 2];
            const oddPartIm  = out512[oddIndex * 2 + 1];

            const twiddleRe = ____F[254 + (j * 2 + 0)];
            const twiddleIm = ____F[254 + (j * 2 + 1)];

            const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
            const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

            out512[evenIndex * 2]     = evenPartRe + twiddledOddRe;
            out512[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
            out512[oddIndex * 2]      = evenPartRe - twiddledOddRe;
            out512[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
        }
*/

    /////////////////////////////////////////////
    // P = 4  -> 512
    //

        for (let j = 0; j < 256; j++) {
            const evenIndex = j;
            const oddIndex  = j + 256;

            if(j > 128){
              out512[evenIndex * 2]     =  out512[1024 - evenIndex * 2] ;
              out512[evenIndex * 2 + 1] = -out512[1024 - evenIndex * 2 + 1];
              out512[oddIndex * 2]      =  out512[1024 - oddIndex * 2];
              out512[oddIndex * 2 + 1]  = -out512[1024 - oddIndex * 2 + 1];
              continue;
            }

            const evenPartRe = out512[evenIndex * 2];
            const evenPartIm = out512[evenIndex * 2 + 1];
            const oddPartRe  = out512[oddIndex * 2];
            const oddPartIm  = out512[oddIndex * 2 + 1];

            const twiddleRe = ____F[510 + (j * 2 + 0)];
            const twiddleIm = ____F[510 + (j * 2 + 1)];

            const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
            const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

            out512[evenIndex * 2]     = evenPartRe + twiddledOddRe;
            out512[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
            out512[oddIndex * 2]      = evenPartRe - twiddledOddRe;
            out512[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
        }
/*
        for (let j = 0; j < 256; j++) {
            const evenIndex = 512 + j;
            const oddIndex  = 512 + j + 256;

            const evenPartRe = out512[evenIndex * 2];
            const evenPartIm = out512[evenIndex * 2 + 1];
            const oddPartRe  = out512[oddIndex * 2];
            const oddPartIm  = out512[oddIndex * 2 + 1];

            const twiddleRe = ____F[510 + (j * 2 + 0)];
            const twiddleIm = ____F[510 + (j * 2 + 1)];

            const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
            const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

            out512[evenIndex * 2]     = evenPartRe + twiddledOddRe;
            out512[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
            out512[oddIndex * 2]      = evenPartRe - twiddledOddRe;
            out512[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
        }
/*
    /////////////////////////////////////////////
    // P = 5  -> 1024
    //

        for (let j = 0; j < 512; j++) {
            const evenIndex = j;
            const oddIndex  = j + 512;

            if(j > 256){
              out512[evenIndex * 2]     =  out512[2048 - evenIndex * 2] ;
              out512[evenIndex * 2 + 1] = -out512[2048 - evenIndex * 2 + 1];
              out512[oddIndex * 2]      =  out512[2048 - oddIndex * 2];
              out512[oddIndex * 2 + 1]  = -out512[2048 - oddIndex * 2 + 1];
              continue;
            }

            const evenPartRe = out512[evenIndex * 2];
            const evenPartIm = out512[evenIndex * 2 + 1];
            const oddPartRe  = out512[oddIndex * 2];
            const oddPartIm  = out512[oddIndex * 2 + 1];

            const twiddleRe = ____F[1022 + (j * 2 + 0)];
            const twiddleIm = ____F[1022 + (j * 2 + 1)];

            const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
            const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

            out512[evenIndex * 2]     = evenPartRe + twiddledOddRe;
            out512[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
            out512[oddIndex * 2]      = evenPartRe - twiddledOddRe;
            out512[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
        }*/

    return out512;
}

/*
function fftReal1024(realInput) {
    var ptr_in = Module._malloc(realInput.length * Float32Array.BYTES_PER_ELEMENT);
    Module.HEAPF32.set(realInput, ptr_in / Float32Array.BYTES_PER_ELEMENT);
    var ptr_out = Module._malloc(2048 * Float32Array.BYTES_PER_ELEMENT);

    fft_wasm(ptr_in, realInput.length, ptr_out);

    // Allocate memory for the JavaScript array
    var result = new Float32Array(2048);
    // Copy data from ptr_out to the JavaScript array
    result.set(Module.HEAPF32.subarray(ptr_out / Float32Array.BYTES_PER_ELEMENT, (ptr_out + 2048 * Float32Array.BYTES_PER_ELEMENT) / Float32Array.BYTES_PER_ELEMENT));
    // Free the memory allocated for ptr_out
    Module._free(ptr_out);
    // Return the JavaScript array
    return result;
}*/





let map1024       = bitReversalMap1024.get(1024);
const inputBR1024 = new Float32Array(1024);
const out1024     = new Float32Array(2048);
function fftReal1024(realInput) {

    if(realInput.length != 1024){
        paddedInput = new Float32Array(1024).fill(0);
        realInput.forEach((value, index) => paddedInput[index] = value);
    }else{
        // Create a copy of the input array
        paddedInput = realInput.slice();
    }

    // Perform bit reversal
    for (let i = 0; i < 1024; i++) {
        inputBR1024[i] = paddedInput[map1024[i]];
    }

    /////////////////////////////////////////////
    // P = 0  -> 4
    //

    for(let idx = 0; idx < 1024; idx+=4){
    //for(let idx = 0; idx < 1024; idx+=4){
          let x0aRe = inputBR1024[idx    ];
          let x1aRe = inputBR1024[idx + 1];
          let x2aRe = inputBR1024[idx + 2];
          let x3aRe = inputBR1024[idx + 3];
          out1024[2*idx      ] =  x0aRe + x1aRe + x2aRe + x3aRe;
          out1024[2*idx  +  1] =  0; 
          out1024[2*idx  +  2] =  x0aRe - x1aRe;
          out1024[2*idx  +  3] =  x2aRe - x3aRe; 
          out1024[2*idx  +  4] =  x0aRe + x1aRe - x2aRe - x3aRe; 
          out1024[2*idx  +  5] =  0;
          out1024[2*idx  +  6] =  x0aRe - x1aRe; 
          out1024[2*idx  +  7] = -x2aRe + x3aRe;
    }

    /////////////////////////////////////////////
    // P = 1  -> 16
    //
    for(let idx = 0; idx < 2048; idx+=32){
    //for(let idx = 0; idx < 2048; idx+=32){
          let x0aRe = out1024[idx     ];
          let x0bRe = out1024[idx +  2]; 
          let x0bIm = out1024[idx +  3];
          let x0cRe = out1024[idx +  4];

          let x1aRe = out1024[idx +  8];
          out1024[idx +   8] = x0aRe - x1aRe; 
          let x1bRe = out1024[idx + 10];
          let x1bIm = out1024[idx + 11];
          let x1cRe = out1024[idx + 12];

          let x2aRe = out1024[idx + 16];
          let x2bRe = out1024[idx + 18];
          let x2bIm = out1024[idx + 19];
          let x2cRe = out1024[idx + 20];

          let x3aRe = out1024[idx + 24];
          out1024[idx +  24] = x0aRe - x1aRe;
          out1024[idx +  25] = x3aRe - x2aRe;  
          let x3bRe = out1024[idx + 26];
          let x3bIm = out1024[idx + 27];
          let x3cRe = out1024[idx + 28];

          out1024[idx      ] = x0aRe + x1aRe + x2aRe + x3aRe;  
          out1024[idx +   9] = x2aRe - x3aRe;      
          out1024[idx +  16] = x0aRe + x1aRe - x2aRe - x3aRe;

          let x2cRe_tRe_2c = x2cRe * t1Re_2c;
          let x3cRe_tRe_2c = x3cRe * t1Re_2c;

          let resReC1 = x0cRe + x2cRe_tRe_2c - x3cRe_tRe_2c;
          out1024[idx +  28] =   resReC1; 
          out1024[idx +   4] =   resReC1; 
          let resImC1 = x1cRe + x2cRe_tRe_2c + x3cRe_tRe_2c; 
          out1024[idx +   5] =   resImC1; 
          out1024[idx +  29] = - resImC1;
          let resReC2 = x0cRe - x2cRe_tRe_2c + x3cRe_tRe_2c; 
          out1024[idx +  20] =   resReC2;
          out1024[idx +  12] =   resReC2; 
          let resImC2 = x1cRe - x2cRe_tRe_2c - x3cRe_tRe_2c; 
          out1024[idx +  13] = - resImC2; 
          out1024[idx +  21] =   resImC2;  

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

          let resReB1 = x0bRe  + x1dif_tRe_1b + tempReB;     
          out1024[idx +   2] =   resReB1; 
          out1024[idx +  30] =   resReB1;  
          let resReB2 = x0bRe  + x1dif_tRe_1b - tempReB;     
          out1024[idx +  18] =   resReB2;
          out1024[idx +  14] =   resReB2; 
          let resReD1 = x0bRe  - x1dif_tRe_1b - tempReD;     
          out1024[idx +   6] =   resReD1; 
          out1024[idx +  26] =   resReD1; 
          let resReD2 = x0bRe  - x1dif_tRe_1b + tempReD;     
          out1024[idx +  22] =   resReD2;
          out1024[idx +  10] =   resReD2; 

          let resImB1 = x0bIm  + x1sum_tRe_1b + tempImB;     
          out1024[idx +   3] =   resImB1; 
          out1024[idx +  31] = - resImB1;  
          let resImB2 = x0bIm  + x1sum_tRe_1b - tempImB;     
          out1024[idx +  19] =   resImB2;
          out1024[idx +  15] = - resImB2; 
          let resImD1 =-x0bIm  + x1sum_tRe_1b - tempImD;     
          out1024[idx +   7] =   resImD1; 
          out1024[idx +  27] = - resImD1; 
          let resImD2 =-x0bIm  + x1sum_tRe_1b + tempImD;     
          out1024[idx +  23] =   resImD2;  
          out1024[idx +  11] = - resImD2; 
    }


    /////////////////////////////////////////////
    // P = 2  -> 64
    //
    for(let idx = 0; idx < 2048; idx+=128){
    //for(let idx = 0; idx < 2048; idx+=128){
          
          let x0aRe_0 = out1024[idx       ];
          let x0bRe_0 = out1024[idx   +  2]; let x0bIm_0 = out1024[idx   +  3];
          let x0cRe_0 = out1024[idx   +  4]; let x0cIm_0 = out1024[idx   +  5];
          let x0dRe_0 = out1024[idx   +  6]; let x0dIm_0 = out1024[idx   +  7];
          let x0aRe_4 = out1024[idx   +  8]; let x0aIm_4 = out1024[idx   +  9];
          let x0bRe_4 = out1024[idx   + 10]; let x0bIm_4 = out1024[idx   + 11];
          let x0cRe_4 = out1024[idx   + 12]; let x0cIm_4 = out1024[idx   + 13];
          let x0dRe_4 = out1024[idx   + 14]; let x0dIm_4 = out1024[idx   + 15];
          let x0aRe_8 = out1024[idx   + 16];                                       //turning point

          let x1aRe_0 = out1024[idx   + 32];
          let x1bRe_0 = out1024[idx   + 34]; let x1bIm_0 = out1024[idx   + 35];
          let x1cRe_0 = out1024[idx   + 36]; let x1cIm_0 = out1024[idx   + 37];
          let x1dRe_0 = out1024[idx   + 38]; let x1dIm_0 = out1024[idx   + 39];
          let x1aRe_4 = out1024[idx   + 40]; let x1aIm_4 = out1024[idx   + 41];
          let x1bRe_4 = out1024[idx   + 42]; let x1bIm_4 = out1024[idx   + 43];
          let x1cRe_4 = out1024[idx   + 44]; let x1cIm_4 = out1024[idx   + 45];
          let x1dRe_4 = out1024[idx   + 46]; let x1dIm_4 = out1024[idx   + 47];
          let x1aRe_8 = out1024[idx   + 48]; let x1aIm_8 = out1024[idx   + 49];        //turning point

          let x2aRe_0 = out1024[idx   + 64]; let x2aIm_0 = out1024[idx   + 65];
          let x2bRe_0 = out1024[idx   + 66]; let x2bIm_0 = out1024[idx   + 67];
          let x2cRe_0 = out1024[idx   + 68]; let x2cIm_0 = out1024[idx   + 69];
          let x2dRe_0 = out1024[idx   + 70]; let x2dIm_0 = out1024[idx   + 71];
          let x2aRe_4 = out1024[idx   + 72]; let x2aIm_4 = out1024[idx   + 73];
          let x2bRe_4 = out1024[idx   + 74]; let x2bIm_4 = out1024[idx   + 75];
          let x2cRe_4 = out1024[idx   + 76]; let x2cIm_4 = out1024[idx   + 77];
          let x2dRe_4 = out1024[idx   + 78]; let x2dIm_4 = out1024[idx   + 79];
          let x2aRe_8 = out1024[idx   + 80]; let x2aIm_8 = out1024[idx   + 81];        //turning point

          let x3aRe_0 = out1024[idx   + 96]; let x3aIm_0 = out1024[idx   + 97];
          let x3bRe_0 = out1024[idx   + 98]; let x3bIm_0 = out1024[idx   + 99];
          let x3cRe_0 = out1024[idx   +100]; let x3cIm_0 = out1024[idx   +101];
          let x3dRe_0 = out1024[idx   +102]; let x3dIm_0 = out1024[idx   +103];
          let x3aRe_4 = out1024[idx   +104]; let x3aIm_4 = out1024[idx   +105];
          let x3bRe_4 = out1024[idx   +106]; let x3bIm_4 = out1024[idx   +107];
          let x3cRe_4 = out1024[idx   +108]; let x3cIm_4 = out1024[idx   +109];
          let x3dRe_4 = out1024[idx   +110]; let x3dIm_4 = out1024[idx   +111];
          let x3aRe_8 = out1024[idx   +112]; let x3aIm_8 = out1024[idx   +113];        //turning point

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

          out1024[idx       ] =   (x0aRe_0 + x1aRe_0) + (x2aRe_0 + x3aRe_0);
          out1024[idx  +  64] =   (x0aRe_0 + x1aRe_0) - (x2aRe_0 + x3aRe_0);
          out1024[idx  +  65] =                       - (x2aIm_0 + x3aIm_0);
          out1024[idx  +   1] =                         (x2aIm_0 + x3aIm_0); 
          let res0ReB = x0bRe_0 + T0x1bRe + ((x2bRe_0 + T0x3bRe)*  t2Re_2b - ((x2bIm_0 + T0x3bIm)*  t2Re_2p));
          out1024[idx  +   2] =   res0ReB;
          out1024[idx  + 126] =   res0ReB; 
          let res0ImB = x0bIm_0 + T0x1bIm + ((x2bRe_0 + T0x3bRe)*  t2Re_2p + ((x2bIm_0 + T0x3bIm)*  t2Re_2b)); 
          out1024[idx  + 127] = - res0ImB;
          out1024[idx  +   3] =   res0ImB;
          let res0ReC = x0cRe_0 + T0x0cRe + ((x2cRe_0 + T0x2cRe)*  t2Re_2c - ((x2cIm_0 + T0x2cIm)*  t2Re_2o));  
          out1024[idx  +   4] =   res0ReC;
          out1024[idx  + 124] =   res0ReC;
          let res0ImC = x0cIm_0 + T0x0cIm + ((x2cRe_0 + T0x2cRe)*  t2Re_2o + ((x2cIm_0 + T0x2cIm)*  t2Re_2c));
          out1024[idx  + 125] = - res0ImC;
          out1024[idx  +   5] =   res0ImC; 
          let res0ReD = x0dRe_0 + T0x1dRe + ((x2dRe_0 + T0x3dRe)*  t2Re_2d - ((x2dIm_0 + T0x3dIm)*  t2Re_2n));  
          out1024[idx  +   6] =   res0ReD;
          out1024[idx  + 122] =   res0ReD;
          let res0ImD = x0dIm_0 + T0x1dIm + ((x2dRe_0 + T0x3dRe)*  t2Re_2n + ((x2dIm_0 + T0x3dIm)*  t2Re_2d)); 
          out1024[idx  + 123] = - res0ImD;
          out1024[idx  +   7] =   res0ImD;  
          let res1ReA =    (x0aRe_0 - x1aRe_0) - (x2aIm_0 - x3aIm_0);
          out1024[idx  +  32] =   res1ReA;
          out1024[idx  +  96] =   res1ReA;
          let res1ImA =                          (x2aRe_0 - x3aRe_0); 
          out1024[idx  +  97] = - res1ImA;
          out1024[idx  +  33] =   res1ImA;
          let res1ReB = x0bRe_0 - T0x1bRe + ((x2bRe_0 - T0x3bRe)* -t2Re_2p  - ((x2bIm_0 - T0x3bIm)*  t2Re_2b ));
          out1024[idx  +  34] =   res1ReB;
          out1024[idx  +  94] =   res1ReB;
          let res1ImB = x0bIm_0 - T0x1bIm + ((x2bRe_0 - T0x3bRe)*  t2Re_2b  + ((x2bIm_0 - T0x3bIm)* -t2Re_2p )); 
          out1024[idx  +  95] = - res1ImB; 
          out1024[idx  +  35] =   res1ImB;
          let res1ReC = x0cRe_0 - T0x0cRe + ((x2cRe_0 - T0x2cRe)* -t2Re_2o  - ((x2cIm_0 - T0x2cIm)*  t2Re_2c )); 
          out1024[idx  +  36] =   res1ReC;
          out1024[idx  +  92] =   res1ReC;
          let res1ImC = x0cIm_0 - T0x0cIm + ((x2cRe_0 - T0x2cRe)*  t2Re_2c  + ((x2cIm_0 - T0x2cIm)* -t2Re_2o ));
          out1024[idx  +  93] = - res1ImC;  
          out1024[idx  +  37] =   res1ImC; 
          let res1ReD = x0dRe_0 - T0x1dRe + ((x2dRe_0 - T0x3dRe)* -t2Re_2n  - ((x2dIm_0 - T0x3dIm)*  t2Re_2d ));
          out1024[idx  +  38] =   res1ReD;
          out1024[idx  +  90] =   res1ReD;
          let res1ImD = x0dIm_0 - T0x1dIm + ((x2dRe_0 - T0x3dRe)*  t2Re_2d  + ((x2dIm_0 - T0x3dIm)* -t2Re_2n ));  
          out1024[idx  +  91] = - res1ImD; 
          out1024[idx  +  39] =   res1ImD;

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
          out1024[idx  +   8] =   res2ReA;
          out1024[idx  + 120] =   res2ReA;
          let res2ImA = x0aIm_4 + T1x0aIm + ((x2aRe_4 + T1x2aRe)*  t2Re_2m + ((x2aIm_4 + T1x2aIm)*  t2Re_2e)); 
          out1024[idx  + 121] = - res2ImA; 
          out1024[idx  +   9] =   res2ImA;
          let res2ReB = x0bRe_4 + T1x1bRe + ((x2bRe_4 + T1x3bRe)*  t2Re_2f - ((x2bIm_4 + T1x3bIm)*  t2Re_2l));
          out1024[idx  +  10] =   res2ReB;
          out1024[idx  + 118] =   res2ReB; 
          let res2ImB = x0bIm_4 + T1x1bIm + ((x2bRe_4 + T1x3bRe)*  t2Re_2l + ((x2bIm_4 + T1x3bIm)*  t2Re_2f));  
          out1024[idx  + 119] = - res2ImB; 
          out1024[idx  +  11] =   res2ImB; 
          let res2ReC = x0cRe_4 + T1x0cRe + ((x2cRe_4 + T1x2cRe)*  t2Re_2g - ((x2cIm_4 + T1x2cIm)*  t2Re_2k));
          out1024[idx  +  12] =   res2ReC;
          out1024[idx  + 116] =   res2ReC;  
          let res2ImC = x0cIm_4 + T1x0cIm + ((x2cRe_4 + T1x2cRe)*  t2Re_2k + ((x2cIm_4 + T1x2cIm)*  t2Re_2g)); 
          out1024[idx  + 117] = - res2ImC; 
          out1024[idx  +  13] =   res2ImC; 
          let res2ReD = x0dRe_4 + T1x1dRe + ((x2dRe_4 + T1x3dRe)*  t2Re_2h - ((x2dIm_4 + T1x3dIm)*  t2Re_2j));  
          out1024[idx  +  14] =   res2ReD;
          out1024[idx  + 114] =   res2ReD;
          let res2ImD = x0dIm_4 + T1x1dIm + ((x2dRe_4 + T1x3dRe)*  t2Re_2j + ((x2dIm_4 + T1x3dIm)*  t2Re_2h));
          out1024[idx  + 115] = - res2ImD; 
          out1024[idx  +  15] =   res2ImD;
          let res3ReA = x0aRe_4 - T1x0aRe + ((x2aRe_4 - T1x2aRe)* -t2Re_2m  - ((x2aIm_4 - T1x2aIm)*  t2Re_2e ));
          out1024[idx  +  40] =   res3ReA;
          out1024[idx  +  88] =   res3ReA;
          let res3ImA = x0aIm_4 - T1x0aIm + ((x2aRe_4 - T1x2aRe)*  t2Re_2e  + ((x2aIm_4 - T1x2aIm)* -t2Re_2m )); 
          out1024[idx  +  89] = - res3ImA;
          out1024[idx  +  41] =   res3ImA; 
          let res3ReB = x0bRe_4 - T1x1bRe + ((x2bRe_4 - T1x3bRe)* -t2Re_2l  - ((x2bIm_4 - T1x3bIm)*  t2Re_2f ));
          out1024[idx  +  42] =   res3ReB; 
          out1024[idx  +  86] =   res3ReB;
          let res3ImB = x0bIm_4 - T1x1bIm + ((x2bRe_4 - T1x3bRe)*  t2Re_2f  + ((x2bIm_4 - T1x3bIm)* -t2Re_2l ));
          out1024[idx  +  87] = - res3ImB; 
          out1024[idx  +  43] =   res3ImB; 
          let res3ReC = x0cRe_4 - T1x0cRe + ((x2cRe_4 - T1x2cRe)* -t2Re_2k  - ((x2cIm_4 - T1x2cIm)*  t2Re_2g ));
          out1024[idx  +  44] =   res3ReC;
          out1024[idx  +  84] =   res3ReC;
          let res3ImC = x0cIm_4 - T1x0cIm + ((x2cRe_4 - T1x2cRe)*  t2Re_2g  + ((x2cIm_4 - T1x2cIm)* -t2Re_2k )); 
          out1024[idx  +  85] = - res3ImC;
          out1024[idx  +  45] =   res3ImC;
          let res3ReD = x0dRe_4 - T1x1dRe + ((x2dRe_4 - T1x3dRe)* -t2Re_2j  - ((x2dIm_4 - T1x3dIm)*  t2Re_2h ));
          out1024[idx  +  46] =   res3ReD;
          out1024[idx  +  82] =   res3ReD;
          let res3ImD = x0dIm_4 - T1x1dIm + ((x2dRe_4 - T1x3dRe)*  t2Re_2h  + ((x2dIm_4 - T1x3dIm)* -t2Re_2j ));
          out1024[idx  +  83] = - res3ImD;
          out1024[idx  +  47] =   res3ImD; 

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
          out1024[idx  +  16] =   res4ReA;
          out1024[idx  + 112] =   res4ReA; 
          let res4ImA =  0       + T2x0aIm + ((x2aRe_8 + T2x2aRe)*  t2Re_2i + (( x2aIm_8 + T2x2aIm)*  t2Re_2i)); 
          out1024[idx  + 113] = - res4ImA; 
          out1024[idx  +  17] =   res4ImA;
          let res4ReB =  x0dRe_4 + T2x1bRe + ((x2dRe_4 + T2x3bRe)*  t2Re_2j - ((-x2dIm_4 + T2x3bIm)*  t2Re_2h)); 
          out1024[idx  +  18] =   res4ReB;
          out1024[idx  + 110] =   res4ReB;
          let res4ImB = -x0dIm_4 + T2x1bIm + ((x2dRe_4 + T2x3bRe)*  t2Re_2h + ((-x2dIm_4 + T2x3bIm)*  t2Re_2j)); 
          out1024[idx  + 111] = - res4ImB; 
          out1024[idx  +  19] =   res4ImB; 
          let res4ReC =  x0cRe_4 + T2x0cRe + ((x2cRe_4 + T2x2cRe)*  t2Re_2k - ((-x2cIm_4 + T2x2cIm)*  t2Re_2g)); 
          out1024[idx  +  20] =   res4ReC;
          out1024[idx  + 108] =   res4ReC; 
          let res4ImC = -x0cIm_4 + T2x0cIm + ((x2cRe_4 + T2x2cRe)*  t2Re_2g + ((-x2cIm_4 + T2x2cIm)*  t2Re_2k));   
          out1024[idx  + 109] = - res4ImC;
          out1024[idx  +  21] =   res4ImC;
          let res4ReD =  x0bRe_4 + T2x1dRe + ((x2bRe_4 + T2x3dRe)*  t2Re_2l - ((-x2bIm_4 + T2x3dIm)*  t2Re_2f)); 
          out1024[idx  +  22] =   res4ReD;
          out1024[idx  + 106] =   res4ReD; 
          let res4ImD = -x0bIm_4 + T2x1dIm + ((x2bRe_4 + T2x3dRe)*  t2Re_2f + ((-x2bIm_4 + T2x3dIm)*  t2Re_2l)); 
          out1024[idx  + 107] = - res4ImD;
          out1024[idx  +  23] =   res4ImD;
          let res5ReA =  x0aRe_8 - T2x0aRe + ((x2aRe_8 - T2x2aRe)* -t2Re_2i  - (( x2aIm_8 - T2x2aIm)*  t2Re_2i ));
          out1024[idx  +  48] =   res5ReA;
          out1024[idx  +  80] =   res5ReA;
          let res5ImA =  0       - T2x0aIm + ((x2aRe_8 - T2x2aRe)*  t2Re_2i  + (( x2aIm_8 - T2x2aIm)* -t2Re_2i ));
          out1024[idx  +  81] = - res5ImA;
          out1024[idx  +  49] =   res5ImA; 
          let res5ReB =  x0dRe_4 - T2x1bRe + ((x2dRe_4 - T2x3bRe)* -t2Re_2h  - ((-x2dIm_4 - T2x3bIm)*  t2Re_2j ));
          out1024[idx  +  50] =   res5ReB;
          out1024[idx  +  78] =   res5ReB;
          let res5ImB = -x0dIm_4 - T2x1bIm + ((x2dRe_4 - T2x3bRe)*  t2Re_2j  + ((-x2dIm_4 - T2x3bIm)* -t2Re_2h ));
          out1024[idx  +  79] = - res5ImB;
          out1024[idx  +  51] =   res5ImB; 
          let res5ReC =  x0cRe_4 - T2x0cRe + ((x2cRe_4 - T2x2cRe)* -t2Re_2g  - ((-x2cIm_4 - T2x2cIm)*  t2Re_2k ));
          out1024[idx  +  52] =   res5ReC;
          out1024[idx  +  76] =   res5ReC;
          let res5ImC = -x0cIm_4 - T2x0cIm + ((x2cRe_4 - T2x2cRe)*  t2Re_2k  + ((-x2cIm_4 - T2x2cIm)* -t2Re_2g ));
          out1024[idx  +  77] = - res5ImC; 
          out1024[idx  +  53] =   res5ImC;
          let res5ReD =  x0bRe_4 - T2x1dRe + ((x2bRe_4 - T2x3dRe)* -t2Re_2f  - ((-x2bIm_4 - T2x3dIm)*  t2Re_2l ));
          out1024[idx  +  54] =   res5ReD;
          out1024[idx  +  74] =   res5ReD;
          let res5ImD = -x0bIm_4 - T2x1dIm + ((x2bRe_4 - T2x3dRe)*  t2Re_2l  + ((-x2bIm_4 - T2x3dIm)* -t2Re_2f ));
          out1024[idx  +  75] = - res5ImD;
          out1024[idx  +  55] =   res5ImD;

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
          out1024[idx  +  24] =   res6ReA;
          out1024[idx  + 104] =   res6ReA;
          let res6ImA = -x0aIm_4 + T3x0aIm + ((x2aRe_4 + T3x2aRe)*  t2Re_2e + ((-x2aIm_4 + T3x2aIm)*  t2Re_2m)); 
          out1024[idx  + 105] = - res6ImA; 
          out1024[idx  +  25] =   res6ImA;
          let res6ReB =  x0dRe_0 + T3x1bRe + ((x2dRe_0 + T3x3bRe)*  t2Re_2n - ((-x2dIm_0 + T3x3bIm)*  t2Re_2d)); 
          out1024[idx  +  26] =   res6ReB;
          out1024[idx  + 102] =   res6ReB;
          let res6ImB = -x0dIm_0 + T3x1bIm + ((x2dRe_0 + T3x3bRe)*  t2Re_2d + ((-x2dIm_0 + T3x3bIm)*  t2Re_2n)); 
          out1024[idx  + 103] = - res6ImB; 
          out1024[idx  +  27] =   res6ImB; 
          let res6ReC =  x0cRe_0 + T3x0cRe + ((x2cRe_0 + T3x2cRe)*  t2Re_2o - ((-x2cIm_0 + T3x2cIm)*  t2Re_2c));  
          out1024[idx  +  28] =   res6ReC;
          out1024[idx  + 100] =   res6ReC;
          let res6ImC = -x0cIm_0 + T3x0cIm + ((x2cRe_0 + T3x2cRe)*  t2Re_2c + ((-x2cIm_0 + T3x2cIm)*  t2Re_2o)); 
          out1024[idx  + 101] = - res6ImC; 
          out1024[idx  +  29] =   res6ImC; 
          let res6ReD =  x0bRe_0 + T3x1dRe + ((x2bRe_0 + T3x3dRe)*  t2Re_2p - ((-x2bIm_0 + T3x3dIm)*  t2Re_2b)); 
          out1024[idx  +  30] =   res6ReD;
          out1024[idx  +  98] =   res6ReD; 
          let res6ImD = -x0bIm_0 + T3x1dIm + ((x2bRe_0 + T3x3dRe)*  t2Re_2b + ((-x2bIm_0 + T3x3dIm)*  t2Re_2p)); 
          out1024[idx  +  99] = - res6ImD;
          out1024[idx  +  31] =   res6ImD;
          let res7ReA =  x0aRe_4 - T3x0aRe + ((x2aRe_4 - T3x2aRe)* -t2Re_2e  - ((-x2aIm_4 - T3x2aIm)*  t2Re_2m ));
          out1024[idx  +  56] =   res7ReA;
          out1024[idx  +  72] =   res7ReA;
          let res7ImA = -x0aIm_4 - T3x0aIm + ((x2aRe_4 - T3x2aRe)*  t2Re_2m  + ((-x2aIm_4 - T3x2aIm)* -t2Re_2e ));
          out1024[idx  +  73] = - res7ImA;
          out1024[idx  +  57] =   res7ImA;
          let res7ReB =  x0dRe_0 - T3x1bRe + ((x2dRe_0 - T3x3bRe)* -t2Re_2d  - ((-x2dIm_0 - T3x3bIm)*  t2Re_2n ));
          out1024[idx  +  58] =   res7ReB;
          out1024[idx  +  70] =   res7ReB;
          let res7ImB = -x0dIm_0 - T3x1bIm + ((x2dRe_0 - T3x3bRe)*  t2Re_2n  + ((-x2dIm_0 - T3x3bIm)* -t2Re_2d ));
          out1024[idx  +  71] = - res7ImB; 
          out1024[idx  +  59] =   res7ImB;
          let res7ReC =  x0cRe_0 - T3x0cRe + ((x2cRe_0 - T3x2cRe)* -t2Re_2c  - ((-x2cIm_0 - T3x2cIm)*  t2Re_2o ));
          out1024[idx  +  60] =   res7ReC;
          out1024[idx  +  68] =   res7ReC;
          let res7ImC = -x0cIm_0 - T3x0cIm + ((x2cRe_0 - T3x2cRe)*  t2Re_2o  + ((-x2cIm_0 - T3x2cIm)* -t2Re_2c ));
          out1024[idx  +  69] = - res7ImC;
          out1024[idx  +  61] =   res7ImC;
          let res7ReD =  x0bRe_0 - T3x1dRe + ((x2bRe_0 - T3x3dRe)* -t2Re_2b  - ((-x2bIm_0 - T3x3dIm)*  t2Re_2p ));
          out1024[idx  +  62] =   res7ReD;
          out1024[idx  +  66] =   res7ReD;
          let res7ImD = -x0bIm_0 - T3x1dIm + ((x2bRe_0 - T3x3dRe)*  t2Re_2p  + ((-x2bIm_0 - T3x3dIm)* -t2Re_2b ));
          out1024[idx  +  67] = - res7ImD;
          out1024[idx  +  63] =   res7ImD;
    }

    
    /////////////////////////////////////////////
    // P = 2.5  -> 128
    //
            for(let idx = 0; idx < 2048; idx += 256){
                let oRe0   = out1024[idx +  128]; 
                let oIm0  = out1024[idx +  129];
                let eRe0   = out1024[idx +    0]; 
                let eIm0  = out1024[idx +    1];
                let resRe0_s = eRe0 + oRe0;
                out1024[idx +   0] = resRe0_s;
                let resIm0_s = eIm0 + oIm0;
                out1024[idx +   1] = resIm0_s;
                let resRe0_d = eRe0 - oRe0;
                out1024[idx + 128] = resRe0_d;
                let resIm0_d = eIm0 - oIm0
                out1024[idx + 129] = resIm0_d;

                let oRe1   = out1024[idx +  130]; 
                let oIm1  = out1024[idx +  131];
                let eRe1   = out1024[idx +    2]; 
                let eIm1  = out1024[idx +    3];
                let resIm1_s = eIm1 + (oRe1 * tRe31 + oIm1 * tRe1);
                out1024[idx +   3] =  resIm1_s;
                out1024[idx + 255] = -resIm1_s;  
                let resRe1_s = eRe1 + (oRe1 * tRe1 - oIm1 * tRe31);
                out1024[idx + 254] =  resRe1_s;
                out1024[idx +   2] =  resRe1_s; 
                let resRe63_s = eRe1 - (oRe1 *  tRe1 - oIm1 * tRe31);
                out1024[idx + 130] =  resRe63_s; 
                out1024[idx + 126] =  resRe63_s;  
                let resIm63_s = -eIm1 + (oRe1 * tRe31 + oIm1 * tRe1);
                out1024[idx + 127] =  resIm63_s;
                out1024[idx + 131] = -resIm63_s;

                let oRe2   = out1024[idx +  132]; 
                let oIm2  = out1024[idx +  133];
                let eRe2   = out1024[idx +    4]; 
                let eIm2  = out1024[idx +    5];
                let resIm2_s = eIm2 + (oRe2 * tRe30 + oIm2 * tRe2);
                out1024[idx +   5] =  resIm2_s;
                out1024[idx + 253] = -resIm2_s;
                let resRe2_s = eRe2 + (oRe2 * tRe2 - oIm2 * tRe30);
                out1024[idx + 252] =  resRe2_s;
                out1024[idx +   4] =  resRe2_s; 
                let resRe62_s = eRe2 - (oRe2 * tRe2 - oIm2 * tRe30);
                out1024[idx + 132] =  resRe62_s;
                out1024[idx + 124] =  resRe62_s; 
                let resIm62_s = -eIm2 + (oRe2 * tRe30 + oIm2 * tRe2);
                out1024[idx + 125] =  resIm62_s;
                out1024[idx + 133] = -resIm62_s;

                let oRe3   = out1024[idx +  134]; 
                let oIm3  = out1024[idx +  135];
                let eRe3   = out1024[idx +    6]; 
                let eIm3  = out1024[idx +    7];
                let resIm3_s = eIm3 + (oRe3 * tRe29 + oIm3 * tRe3);
                out1024[idx +   7] =  resIm3_s;
                out1024[idx + 251] = -resIm3_s;
                let resRe3_s = eRe3 + (oRe3 * tRe3 - oIm3 * tRe29);
                out1024[idx + 250] =  resRe3_s;
                out1024[idx +   6] =  resRe3_s; 
                let resRe61_s = eRe3 - (oRe3 * tRe3 - oIm3 * tRe29);
                out1024[idx + 134] =  resRe61_s;
                out1024[idx + 122] =  resRe61_s; 
                let resIm61_s = -eIm3 + (oRe3 * tRe29 + oIm3 * tRe3);
                out1024[idx + 123] =  resIm61_s;
                out1024[idx + 135] = -resIm61_s;

                let oRe4   = out1024[idx +  136]; 
                let oIm4  = out1024[idx +  137];
                let eRe4   = out1024[idx +    8]; 
                let eIm4  = out1024[idx +    9];
                let resIm4_s = eIm4 + (oRe4 * tRe28 + oIm4 * tRe4);
                out1024[idx + 9] = resIm4_s;
                out1024[idx + 249] = -resIm4_s;
                let resRe4_s = eRe4 + (oRe4 * tRe4 - oIm4 * tRe28);
                out1024[idx + 248] = resRe4_s;
                out1024[idx + 8] = resRe4_s; 
                let resRe60_s = eRe4 - (oRe4 * tRe4 - oIm4 * tRe28);
                out1024[idx + 136] = resRe60_s;
                out1024[idx + 120] = resRe60_s; 
                let resIm60_s = -eIm4 + (oRe4 * tRe28 + oIm4 * tRe4);
                out1024[idx + 121] = resIm60_s;
                out1024[idx + 137] = -resIm60_s;

                let oRe5 = out1024[idx + 138]; 
                let oIm5 = out1024[idx + 139];
                let eRe5 = out1024[idx + 10]; 
                let eIm5 = out1024[idx + 11];
                let resIm5_s = eIm5 + (oRe5 * tRe27 + oIm5 * tRe5);
                out1024[idx + 11] = resIm5_s;
                out1024[idx + 247] = -resIm5_s;
                let resRe5_s = eRe5 + (oRe5 * tRe5 - oIm5 * tRe27);
                out1024[idx + 246] = resRe5_s;
                out1024[idx + 10] = resRe5_s; 
                let resRe59_s = eRe5 - (oRe5 * tRe5 - oIm5 * tRe27);
                out1024[idx + 138] = resRe59_s;
                out1024[idx + 118] = resRe59_s; 
                let resIm59_s = -eIm5 + (oRe5 * tRe27 + oIm5 * tRe5);
                out1024[idx + 119] = resIm59_s;
                out1024[idx + 139] = -resIm59_s;

                // For elements 9 to 10
                let oRe6 = out1024[idx + 140]; 
                let oIm6 = out1024[idx + 141];
                let eRe6 = out1024[idx + 12]; 
                let eIm6 = out1024[idx + 13];
                let resIm6_s = eIm6 + (oRe6 * tRe26 + oIm6 * tRe6);
                out1024[idx + 13] = resIm6_s;
                out1024[idx + 245] = -resIm6_s;
                let resRe6_s = eRe6 + (oRe6 * tRe6 - oIm6 * tRe26);
                out1024[idx + 244] = resRe6_s;
                out1024[idx + 12] = resRe6_s; 
                let resRe58_s = eRe6 - (oRe6 * tRe6 - oIm6 * tRe26);
                out1024[idx + 140] = resRe58_s;
                out1024[idx + 116] = resRe58_s; 
                let resIm58_s = -eIm6 + (oRe6 * tRe26 + oIm6 * tRe6);
                out1024[idx + 117] = resIm58_s;
                out1024[idx + 141] = -resIm58_s;

                // For elements 11 to 12
                let oRe7 = out1024[idx + 142]; 
                let oIm7 = out1024[idx + 143];
                let eRe7 = out1024[idx + 14]; 
                let eIm7 = out1024[idx + 15];
                let resIm7_s = eIm7 + (oRe7 * tRe25 + oIm7 * tRe7);
                out1024[idx + 15] = resIm7_s;
                out1024[idx + 243] = -resIm7_s;
                let resRe7_s = eRe7 + (oRe7 * tRe7 - oIm7 * tRe25);
                out1024[idx + 242] = resRe7_s;
                out1024[idx + 14] = resRe7_s; 
                let resRe57_s = eRe7 - (oRe7 * tRe7 - oIm7 * tRe25);
                out1024[idx + 142] = resRe57_s;
                out1024[idx + 114] = resRe57_s; 
                let resIm57_s = -eIm7 + (oRe7 * tRe25 + oIm7 * tRe7);
                out1024[idx + 115] = resIm57_s;
                out1024[idx + 143] = -resIm57_s;

                // For elements 13 to 14
                let oRe8 = out1024[idx + 144]; 
                let oIm8 = out1024[idx + 145];
                let eRe8 = out1024[idx + 16]; 
                let eIm8 = out1024[idx + 17];
                let resIm8_s = eIm8 + (oRe8 * tRe24 + oIm8 * tRe8);
                out1024[idx + 17] = resIm8_s;
                out1024[idx + 241] = -resIm8_s;
                let resRe8_s = eRe8 + (oRe8 * tRe8 - oIm8 * tRe24);
                out1024[idx + 240] = resRe8_s;
                out1024[idx + 16] = resRe8_s; 
                let resRe56_s = eRe8 - (oRe8 * tRe8 - oIm8 * tRe24);
                out1024[idx + 144] = resRe56_s;
                out1024[idx + 112] = resRe56_s; 
                let resIm56_s = -eIm8 + (oRe8 * tRe24 + oIm8 * tRe8);
                out1024[idx + 113] = resIm56_s;
                out1024[idx + 145] = -resIm56_s;

                // For elements 15 to 16
                let oRe9 = out1024[idx + 146]; 
                let oIm9 = out1024[idx + 147];
                let eRe9 = out1024[idx + 18]; 
                let eIm9 = out1024[idx + 19];
                let resIm9_s = eIm9 + (oRe9 * tRe23 + oIm9 * tRe9);
                out1024[idx + 19] = resIm9_s;
                out1024[idx + 239] = -resIm9_s;
                let resRe9_s = eRe9 + (oRe9 * tRe9 - oIm9 * tRe23);
                out1024[idx + 238] = resRe9_s;
                out1024[idx + 18] = resRe9_s; 
                let resRe55_s = eRe9 - (oRe9 * tRe9 - oIm9 * tRe23);
                out1024[idx + 146] = resRe55_s;
                out1024[idx + 110] = resRe55_s; 
                let resIm55_s = -eIm9 + (oRe9 * tRe23 + oIm9 * tRe9);
                out1024[idx + 111] = resIm55_s;
                out1024[idx + 147] = -resIm55_s;

                // For elements 17 to 18
                let oRe10 = out1024[idx + 148]; 
                let oIm10 = out1024[idx + 149];
                let eRe10 = out1024[idx + 20]; 
                let eIm10 = out1024[idx + 21];
                let resIm10_s = eIm10 + (oRe10 * tRe22 + oIm10 * tRe10);
                out1024[idx + 21] = resIm10_s;
                out1024[idx + 237] = -resIm10_s;
                let resRe10_s = eRe10 + (oRe10 * tRe10 - oIm10 * tRe22);
                out1024[idx + 236] = resRe10_s;
                out1024[idx + 20] = resRe10_s; 
                let resRe54_s = eRe10 - (oRe10 * tRe10 - oIm10 * tRe22);
                out1024[idx + 148] = resRe54_s;
                out1024[idx + 108] = resRe54_s; 
                let resIm54_s = -eIm10 + (oRe10 * tRe22 + oIm10 * tRe10);
                out1024[idx + 109] = resIm54_s;
                out1024[idx + 149] = -resIm54_s;

                // For elements 19 to 20
                let oRe11 = out1024[idx + 150]; 
                let oIm11 = out1024[idx + 151];
                let eRe11 = out1024[idx + 22]; 
                let eIm11 = out1024[idx + 23];
                let resIm11_s = eIm11 + (oRe11 * tRe21 + oIm11 * tRe11);
                out1024[idx + 23] = resIm11_s;
                out1024[idx + 235] = -resIm11_s;
                let resRe11_s = eRe11 + (oRe11 * tRe11 - oIm11 * tRe21);
                out1024[idx + 234] = resRe11_s;
                out1024[idx + 22] = resRe11_s; 
                let resRe53_s = eRe11 - (oRe11 * tRe11 - oIm11 * tRe21);
                out1024[idx + 150] = resRe53_s;
                out1024[idx + 106] = resRe53_s; 
                let resIm53_s = -eIm11 + (oRe11 * tRe21 + oIm11 * tRe11);
                out1024[idx + 107] = resIm53_s;
                out1024[idx + 151] = -resIm53_s;

                // For elements 21 to 22
                let oRe12 = out1024[idx + 152]; 
                let oIm12 = out1024[idx + 153];
                let eRe12 = out1024[idx + 24]; 
                let eIm12 = out1024[idx + 25];
                let resIm12_s = eIm12 + (oRe12 * tRe20 + oIm12 * tRe12);
                out1024[idx + 25] = resIm12_s;
                out1024[idx + 233] = -resIm12_s;
                let resRe12_s = eRe12 + (oRe12 * tRe12 - oIm12 * tRe20);
                out1024[idx + 232] = resRe12_s;
                out1024[idx + 24] = resRe12_s; 
                let resRe52_s = eRe12 - (oRe12 * tRe12 - oIm12 * tRe20);
                out1024[idx + 152] = resRe52_s;
                out1024[idx + 104] = resRe52_s; 
                let resIm52_s = -eIm12 + (oRe12 * tRe20 + oIm12 * tRe12);
                out1024[idx + 105] = resIm52_s;
                out1024[idx + 153] = -resIm52_s;

                // For elements 23 to 24
                let oRe13 = out1024[idx + 154]; 
                let oIm13 = out1024[idx + 155];
                let eRe13 = out1024[idx + 26]; 
                let eIm13 = out1024[idx + 27];
                let resIm13_s = eIm13 + (oRe13 * tRe19 + oIm13 * tRe13);
                out1024[idx + 27] = resIm13_s;
                out1024[idx + 231] = -resIm13_s;
                let resRe13_s = eRe13 + (oRe13 * tRe13 - oIm13 * tRe19);
                out1024[idx + 230] = resRe13_s;
                out1024[idx + 26] = resRe13_s; 
                let resRe51_s = eRe13 - (oRe13 * tRe13 - oIm13 * tRe19);
                out1024[idx + 154] = resRe51_s;
                out1024[idx + 102] = resRe51_s; 
                let resIm51_s = -eIm13 + (oRe13 * tRe19 + oIm13 * tRe13);
                out1024[idx + 103] = resIm51_s;
                out1024[idx + 155] = -resIm51_s;

                // For elements 25 to 26
                let oRe14 = out1024[idx + 156]; 
                let oIm14 = out1024[idx + 157];
                let eRe14 = out1024[idx + 28]; 
                let eIm14 = out1024[idx + 29];
                let resIm14_s = eIm14 + (oRe14 * tRe18 + oIm14 * tRe14);
                out1024[idx + 29] = resIm14_s;
                out1024[idx + 229] = -resIm14_s;
                let resRe14_s = eRe14 + (oRe14 * tRe14 - oIm14 * tRe18);
                out1024[idx + 228] = resRe14_s;
                out1024[idx + 28] = resRe14_s; 
                let resRe50_s = eRe14 - (oRe14 * tRe14 - oIm14 * tRe18);
                out1024[idx + 156] = resRe50_s;
                out1024[idx + 100] = resRe50_s; 
                let resIm50_s = -eIm14 + (oRe14 * tRe18 + oIm14 * tRe14);
                out1024[idx + 101] = resIm50_s;
                out1024[idx + 157] = -resIm50_s;

                // For elements 27 to 28
                let oRe15 = out1024[idx + 158]; 
                let oIm15 = out1024[idx + 159];
                let eRe15 = out1024[idx + 30]; 
                let eIm15 = out1024[idx + 31];
                let resIm15_s = eIm15 + (oRe15 * tRe17 + oIm15 * tRe15);
                out1024[idx + 31] = resIm15_s;
                out1024[idx + 227] = -resIm15_s;
                let resRe15_s = eRe15 + (oRe15 * tRe15 - oIm15 * tRe17);
                out1024[idx + 226] = resRe15_s;
                out1024[idx + 30] = resRe15_s; 
                let resRe49_s = eRe15 - (oRe15 * tRe15 - oIm15 * tRe17);
                out1024[idx + 158] = resRe49_s;
                out1024[idx + 98] = resRe49_s; 
                let resIm49_s = -eIm15 + (oRe15 * tRe17 + oIm15 * tRe15);
                out1024[idx + 99] = resIm49_s;
                out1024[idx + 159] = -resIm49_s;

                // For elements 29 to 30
                let oRe16 = out1024[idx + 160]; 
                let oIm16 = out1024[idx + 161];
                let eRe16 = out1024[idx + 32]; 
                let eIm16 = out1024[idx + 33];
                let resIm16_s = eIm16 + (oRe16 * tRe16 + oIm16 * tRe16);
                out1024[idx + 33] = resIm16_s;
                out1024[idx + 225] = -resIm16_s;
                let resRe16_s = eRe16 + (oRe16 * tRe16 - oIm16 * tRe16);
                out1024[idx + 224] = resRe16_s;
                out1024[idx + 32] = resRe16_s; 
                let resRe48_s = eRe16 - (oRe16 * tRe16 - oIm16 * tRe16);
                out1024[idx + 160] = resRe48_s;
                out1024[idx + 96] = resRe48_s; 
                let resIm48_s = -eIm16 + (oRe16 * tRe16 + oIm16 * tRe16);
                out1024[idx + 97] = resIm48_s;
                out1024[idx + 161] = -resIm48_s;

                // For elements 31 to 32
                let oRe17 = out1024[idx + 162]; 
                let oIm17 = out1024[idx + 163];
                let eRe17 = out1024[idx + 34]; 
                let eIm17 = out1024[idx + 35];
                let resIm17_s = eIm17 + (oRe17 * tRe15 + oIm17 * tRe17);
                out1024[idx + 35] = resIm17_s;
                out1024[idx + 223] = -resIm17_s;
                let resRe17_s = eRe17 + (oRe17 * tRe17 - oIm17 * tRe15);
                out1024[idx + 222] = resRe17_s;
                out1024[idx + 34] = resRe17_s; 
                let resRe47_s = eRe17 - (oRe17 * tRe17 - oIm17 * tRe15);
                out1024[idx + 162] = resRe47_s;
                out1024[idx + 94] = resRe47_s; 
                let resIm47_s = -eIm17 + (oRe17 * tRe15 + oIm17 * tRe17);
                out1024[idx + 95] = resIm47_s;
                out1024[idx + 163] = -resIm47_s;

                // For elements 33 to 34
                let oRe18 = out1024[idx + 164]; 
                let oIm18 = out1024[idx + 165];
                let eRe18 = out1024[idx + 36]; 
                let eIm18 = out1024[idx + 37];
                let resIm18_s = eIm18 + (oRe18 * tRe14 + oIm18 * tRe18);
                out1024[idx + 37] = resIm18_s;
                out1024[idx + 221] = -resIm18_s;
                let resRe18_s = eRe18 + (oRe18 * tRe18 - oIm18 * tRe14);
                out1024[idx + 220] = resRe18_s;
                out1024[idx + 36] = resRe18_s; 
                let resRe46_s = eRe18 - (oRe18 * tRe18 - oIm18 * tRe14);
                out1024[idx + 164] = resRe46_s;
                out1024[idx + 92] = resRe46_s; 
                let resIm46_s = -eIm18 + (oRe18 * tRe14 + oIm18 * tRe18);
                out1024[idx + 93] = resIm46_s;
                out1024[idx + 165] = -resIm46_s;

                // For elements 35 to 36
                let oRe19 = out1024[idx + 166]; 
                let oIm19 = out1024[idx + 167];
                let eRe19 = out1024[idx + 38]; 
                let eIm19 = out1024[idx + 39];
                let resIm19_s = eIm19 + (oRe19 * tRe13 + oIm19 * tRe19);
                out1024[idx + 39] = resIm19_s;
                out1024[idx + 219] = -resIm19_s;
                let resRe19_s = eRe19 + (oRe19 * tRe19 - oIm19 * tRe13);
                out1024[idx + 218] = resRe19_s;
                out1024[idx + 38] = resRe19_s; 
                let resRe45_s = eRe19 - (oRe19 * tRe19 - oIm19 * tRe13);
                out1024[idx + 166] = resRe45_s;
                out1024[idx + 90] = resRe45_s; 
                let resIm45_s = -eIm19 + (oRe19 * tRe13 + oIm19 * tRe19);
                out1024[idx + 91] = resIm45_s;
                out1024[idx + 167] = -resIm45_s;

                // For elements 37 to 38
                let oRe20 = out1024[idx + 168]; 
                let oIm20 = out1024[idx + 169];
                let eRe20 = out1024[idx + 40]; 
                let eIm20 = out1024[idx + 41];
                let resIm20_s = eIm20 + (oRe20 * tRe12 + oIm20 * tRe20);
                out1024[idx + 41] = resIm20_s;
                out1024[idx + 217] = -resIm20_s;
                let resRe20_s = eRe20 + (oRe20 * tRe20 - oIm20 * tRe12);
                out1024[idx + 216] = resRe20_s;
                out1024[idx + 40] = resRe20_s; 
                let resRe44_s = eRe20 - (oRe20 * tRe20 - oIm20 * tRe12);
                out1024[idx + 168] = resRe44_s;
                out1024[idx + 88] = resRe44_s; 
                let resIm44_s = -eIm20 + (oRe20 * tRe12 + oIm20 * tRe20);
                out1024[idx + 89] = resIm44_s;
                out1024[idx + 169] = -resIm44_s;

                // For elements 39 to 40
                let oRe21 = out1024[idx + 170]; 
                let oIm21 = out1024[idx + 171];
                let eRe21 = out1024[idx + 42]; 
                let eIm21 = out1024[idx + 43];
                let resIm21_s = eIm21 + (oRe21 * tRe11 + oIm21 * tRe21);
                out1024[idx + 43] = resIm21_s;
                out1024[idx + 215] = -resIm21_s;
                let resRe21_s = eRe21 + (oRe21 * tRe21 - oIm21 * tRe11);
                out1024[idx + 214] = resRe21_s;
                out1024[idx + 42] = resRe21_s; 
                let resRe43_s = eRe21 - (oRe21 * tRe21 - oIm21 * tRe11);
                out1024[idx + 170] = resRe43_s;
                out1024[idx + 86] = resRe43_s; 
                let resIm43_s = -eIm21 + (oRe21 * tRe11 + oIm21 * tRe21);
                out1024[idx + 87] = resIm43_s;
                out1024[idx + 171] = -resIm43_s;

                // For elements 41 to 42
                let oRe22 = out1024[idx + 172]; 
                let oIm22 = out1024[idx + 173];
                let eRe22 = out1024[idx + 44]; 
                let eIm22 = out1024[idx + 45];
                let resIm22_s = eIm22 + (oRe22 * tRe10 + oIm22 * tRe22);
                out1024[idx + 45] = resIm22_s;
                out1024[idx + 213] = -resIm22_s;
                let resRe22_s = eRe22 + (oRe22 * tRe22 - oIm22 * tRe10);
                out1024[idx + 212] = resRe22_s;
                out1024[idx + 44] = resRe22_s; 
                let resRe42_s = eRe22 - (oRe22 * tRe22 - oIm22 * tRe10);
                out1024[idx + 172] = resRe42_s;
                out1024[idx + 84] = resRe42_s; 
                let resIm42_s = -eIm22 + (oRe22 * tRe10 + oIm22 * tRe22);
                out1024[idx + 85] = resIm42_s;
                out1024[idx + 173] = -resIm42_s;

                // For elements 43 to 44
                let oRe23 = out1024[idx + 174]; 
                let oIm23 = out1024[idx + 175];
                let eRe23 = out1024[idx + 46]; 
                let eIm23 = out1024[idx + 47];
                let resIm23_s = eIm23 + (oRe23 * tRe9 + oIm23 * tRe23);
                out1024[idx + 47] = resIm23_s;
                out1024[idx + 211] = -resIm23_s;
                let resRe23_s = eRe23 + (oRe23 * tRe23 - oIm23 * tRe9);
                out1024[idx + 210] = resRe23_s;
                out1024[idx + 46] = resRe23_s; 
                let resRe41_s = eRe23 - (oRe23 * tRe23 - oIm23 * tRe9);
                out1024[idx + 174] = resRe41_s;
                out1024[idx + 82] = resRe41_s; 
                let resIm41_s = -eIm23 + (oRe23 * tRe9 + oIm23 * tRe23);
                out1024[idx + 83] = resIm41_s;
                out1024[idx + 175] = -resIm41_s;

                // For elements 45 to 46
                let oRe24 = out1024[idx + 176]; 
                let oIm24 = out1024[idx + 177];
                let eRe24 = out1024[idx + 48]; 
                let eIm24 = out1024[idx + 49];
                let resIm24_s = eIm24 + (oRe24 * tRe8 + oIm24 * tRe24);
                out1024[idx + 49] = resIm24_s;
                out1024[idx + 209] = -resIm24_s;
                let resRe24_s = eRe24 + (oRe24 * tRe24 - oIm24 * tRe8);
                out1024[idx + 208] = resRe24_s;
                out1024[idx + 48] = resRe24_s; 
                let resRe40_s = eRe24 - (oRe24 * tRe24 - oIm24 * tRe8);
                out1024[idx + 176] = resRe40_s;
                out1024[idx + 80] = resRe40_s; 
                let resIm40_s = -eIm24 + (oRe24 * tRe8 + oIm24 * tRe24);
                out1024[idx + 81] = resIm40_s;
                out1024[idx + 177] = -resIm40_s;

                // For elements 47 to 48
                let oRe25 = out1024[idx + 178]; 
                let oIm25 = out1024[idx + 179];
                let eRe25 = out1024[idx + 50]; 
                let eIm25 = out1024[idx + 51];
                let resIm25_s = eIm25 + (oRe25 * tRe7 + oIm25 * tRe25);
                out1024[idx + 51] = resIm25_s;
                out1024[idx + 207] = -resIm25_s;
                let resRe25_s = eRe25 + (oRe25 * tRe25 - oIm25 * tRe7);
                out1024[idx + 206] = resRe25_s;
                out1024[idx + 50] = resRe25_s; 
                let resRe39_s = eRe25 - (oRe25 * tRe25 - oIm25 * tRe7);
                out1024[idx + 178] = resRe39_s;
                out1024[idx + 78] = resRe39_s; 
                let resIm39_s = -eIm25 + (oRe25 * tRe7 + oIm25 * tRe25);
                out1024[idx + 79] = resIm39_s;
                out1024[idx + 179] = -resIm39_s;

                // For elements 49 to 50
                let oRe26 = out1024[idx + 180]; 
                let oIm26 = out1024[idx + 181];
                let eRe26 = out1024[idx + 52]; 
                let eIm26 = out1024[idx + 53];
                let resIm26_s = eIm26 + (oRe26 * tRe6 + oIm26 * tRe26);
                out1024[idx + 53] = resIm26_s;
                out1024[idx + 205] = -resIm26_s;
                let resRe26_s = eRe26 + (oRe26 * tRe26 - oIm26 * tRe6);
                out1024[idx + 204] = resRe26_s;
                out1024[idx + 52] = resRe26_s; 
                let resRe38_s = eRe26 - (oRe26 * tRe26 - oIm26 * tRe6);
                out1024[idx + 180] = resRe38_s;
                out1024[idx + 76] = resRe38_s; 
                let resIm38_s = -eIm26 + (oRe26 * tRe6 + oIm26 * tRe26);
                out1024[idx + 77] = resIm38_s;
                out1024[idx + 181] = -resIm38_s;

                // For elements 51 to 52
                let oRe27 = out1024[idx + 182]; 
                let oIm27 = out1024[idx + 183];
                let eRe27 = out1024[idx + 54]; 
                let eIm27 = out1024[idx + 55];
                let resIm27_s = eIm27 + (oRe27 * tRe5 + oIm27 * tRe27);
                out1024[idx + 55] = resIm27_s;
                out1024[idx + 203] = -resIm27_s;
                let resRe27_s = eRe27 + (oRe27 * tRe27 - oIm27 * tRe5);
                out1024[idx + 202] = resRe27_s;
                out1024[idx + 54] = resRe27_s; 
                let resRe37_s = eRe27 - (oRe27 * tRe27 - oIm27 * tRe5);
                out1024[idx + 182] = resRe37_s;
                out1024[idx + 74] = resRe37_s; 
                let resIm37_s = -eIm27 + (oRe27 * tRe5 + oIm27 * tRe27);
                out1024[idx + 75] = resIm37_s;
                out1024[idx + 183] = -resIm37_s;

                // For elements 53 to 54
                let oRe28 = out1024[idx + 184]; 
                let oIm28 = out1024[idx + 185];
                let eRe28 = out1024[idx + 56]; 
                let eIm28 = out1024[idx + 57];
                let resIm28_s = eIm28 + (oRe28 * tRe4 + oIm28 * tRe28);
                out1024[idx + 57] = resIm28_s;
                out1024[idx + 201] = -resIm28_s;
                let resRe28_s = eRe28 + (oRe28 * tRe28 - oIm28 * tRe4);
                out1024[idx + 200] = resRe28_s;
                out1024[idx + 56] = resRe28_s; 
                let resRe36_s = eRe28 - (oRe28 * tRe28 - oIm28 * tRe4);
                out1024[idx + 184] = resRe36_s;
                out1024[idx + 72] = resRe36_s; 
                let resIm36_s = -eIm28 + (oRe28 * tRe4 + oIm28 * tRe28);
                out1024[idx + 73] = resIm36_s;
                out1024[idx + 185] = -resIm36_s;

                // For elements 55 to 56
                let oRe29 = out1024[idx + 186]; 
                let oIm29 = out1024[idx + 187];
                let eRe29 = out1024[idx + 58]; 
                let eIm29 = out1024[idx + 59];
                let resIm29_s = eIm29 + (oRe29 * tRe3 + oIm29 * tRe29);
                out1024[idx + 59] = resIm29_s;
                out1024[idx + 199] = -resIm29_s;
                let resRe29_s = eRe29 + (oRe29 * tRe29 - oIm29 * tRe3);
                out1024[idx + 198] = resRe29_s;
                out1024[idx + 58] = resRe29_s; 
                let resRe35_s = eRe29 - (oRe29 * tRe29 - oIm29 * tRe3);
                out1024[idx + 186] = resRe35_s;
                out1024[idx + 70] = resRe35_s; 
                let resIm35_s = -eIm29 + (oRe29 * tRe3 + oIm29 * tRe29);
                out1024[idx + 71] = resIm35_s;
                out1024[idx + 187] = -resIm35_s;

                // For elements 57 to 58
                let oRe30 = out1024[idx + 188]; 
                let oIm30 = out1024[idx + 189];
                let eRe30 = out1024[idx + 60]; 
                let eIm30 = out1024[idx + 61];
                let resIm30_s = eIm30 + (oRe30 * tRe2 + oIm30 * tRe30);
                out1024[idx + 61] = resIm30_s;
                out1024[idx + 197] = -resIm30_s;
                let resRe30_s = eRe30 + (oRe30 * tRe30 - oIm30 * tRe2);
                out1024[idx + 196] = resRe30_s;
                out1024[idx + 60] = resRe30_s; 
                let resRe34_s = eRe30 - (oRe30 * tRe30 - oIm30 * tRe2);
                out1024[idx + 188] = resRe34_s;
                out1024[idx + 68] = resRe34_s; 
                let resIm34_s = -eIm30 + (oRe30 * tRe2 + oIm30 * tRe30);
                out1024[idx + 69] = resIm34_s;
                out1024[idx + 189] = -resIm34_s;

                // For elements 59 to 60
                let oRe31 = out1024[idx + 190]; 
                let oIm31 = out1024[idx + 191];
                let eRe31 = out1024[idx + 62]; 
                let eIm31 = out1024[idx + 63];
                let resIm31_s = eIm31 + (oRe31 * tRe1 + oIm31 * tRe31);
                out1024[idx + 63] = resIm31_s;
                out1024[idx + 195] = -resIm31_s;
                let resRe31_s = eRe31 + (oRe31 * tRe31 - oIm31 * tRe1);
                out1024[idx + 194] = resRe31_s;
                out1024[idx + 62] = resRe31_s; 
                let resRe33_s = eRe31 - (oRe31 * tRe31 - oIm31 * tRe1);
                out1024[idx + 190] = resRe33_s;
                out1024[idx + 66] = resRe33_s; 
                let resIm33_s = -eIm31 + (oRe31 * tRe1 + oIm31 * tRe31);
                out1024[idx + 67] = resIm33_s;
                out1024[idx + 191] = -resIm33_s;

                // For elements 61 to 62
                let oRe32  = out1024[idx +  192]; 
                let oIm32 = out1024[idx +  193];
                let eRe32  = out1024[idx +   64]; 
                let eIm32 = out1024[idx +   65];
                let resIm32_s = eIm32 + oRe32;
                out1024[idx +  65] =  resIm32_s;
                out1024[idx + 193] = -resIm32_s;
                let resRe32_s = eRe32 - oIm32;
                out1024[idx + 192] =  resRe32_s;
                out1024[idx +  64] =  resRe32_s; 
            }
        
    
    /////////////////////////////////////////////
    // P = 3  -> 256
    //

        for (let j = 0; j < 128; j++) {
            const evenIndex = j;
            const oddIndex  = j + 128;

            if(j > 64){
              out1024[evenIndex * 2]     =  out1024[512 - evenIndex * 2] ;
              out1024[evenIndex * 2 + 1] = -out1024[512 - evenIndex * 2 + 1];
              out1024[oddIndex * 2]      =  out1024[512 - oddIndex * 2];
              out1024[oddIndex * 2 + 1]  = -out1024[512 - oddIndex * 2 + 1];
              continue;
            }

            const evenPartRe = out1024[evenIndex * 2];
            const evenPartIm = out1024[evenIndex * 2 + 1];
            const oddPartRe  = out1024[oddIndex * 2];
            const oddPartIm  = out1024[oddIndex * 2 + 1];

            const twiddleRe = ____F[254 + (j * 2 + 0)];
            const twiddleIm = ____F[254 + (j * 2 + 1)];

            const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
            const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

            out1024[evenIndex * 2]     = evenPartRe + twiddledOddRe;
            out1024[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
            out1024[oddIndex * 2]      = evenPartRe - twiddledOddRe;
            out1024[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
        }

        for (let j = 0; j < 128; j++) {
            const evenIndex = 256 + j;
            const oddIndex  = 256 + j + 128;

            const evenPartRe = out1024[evenIndex * 2];
            const evenPartIm = out1024[evenIndex * 2 + 1];
            const oddPartRe  = out1024[oddIndex * 2];
            const oddPartIm  = out1024[oddIndex * 2 + 1];

            const twiddleRe = ____F[254 + (j * 2 + 0)];
            const twiddleIm = ____F[254 + (j * 2 + 1)];

            const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
            const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

            out1024[evenIndex * 2]     = evenPartRe + twiddledOddRe;
            out1024[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
            out1024[oddIndex * 2]      = evenPartRe - twiddledOddRe;
            out1024[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
        }

        for (let j = 0; j < 128; j++) {
            const evenIndex = 512 + j;
            const oddIndex  = 512 + j + 128;

            const evenPartRe = out1024[evenIndex * 2];
            const evenPartIm = out1024[evenIndex * 2 + 1];
            const oddPartRe  = out1024[oddIndex * 2];
            const oddPartIm  = out1024[oddIndex * 2 + 1];

            const twiddleRe = ____F[254 + (j * 2 + 0)];
            const twiddleIm = ____F[254 + (j * 2 + 1)];

            const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
            const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

            out1024[evenIndex * 2]     = evenPartRe + twiddledOddRe;
            out1024[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
            out1024[oddIndex * 2]      = evenPartRe - twiddledOddRe;
            out1024[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
        }

        for (let j = 0; j < 128; j++) {
            const evenIndex = 768 + j;
            const oddIndex  = 768 + j + 128;

            const evenPartRe = out1024[evenIndex * 2];
            const evenPartIm = out1024[evenIndex * 2 + 1];
            const oddPartRe  = out1024[oddIndex * 2];
            const oddPartIm  = out1024[oddIndex * 2 + 1];

            const twiddleRe = ____F[254 + (j * 2 + 0)];
            const twiddleIm = ____F[254 + (j * 2 + 1)];

            const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
            const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

            out1024[evenIndex * 2]     = evenPartRe + twiddledOddRe;
            out1024[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
            out1024[oddIndex * 2]      = evenPartRe - twiddledOddRe;
            out1024[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
        }


    /////////////////////////////////////////////
    // P = 4  -> 512
    //

        for (let j = 0; j < 256; j++) {
            const evenIndex = j;
            const oddIndex  = j + 256;

            if(j > 128){
              out1024[evenIndex * 2]     =  out1024[1024 - evenIndex * 2] ;
              out1024[evenIndex * 2 + 1] = -out1024[1024 - evenIndex * 2 + 1];
              out1024[oddIndex * 2]      =  out1024[1024 - oddIndex * 2];
              out1024[oddIndex * 2 + 1]  = -out1024[1024 - oddIndex * 2 + 1];
              continue;
            }

            const evenPartRe = out1024[evenIndex * 2];
            const evenPartIm = out1024[evenIndex * 2 + 1];
            const oddPartRe  = out1024[oddIndex * 2];
            const oddPartIm  = out1024[oddIndex * 2 + 1];

            const twiddleRe = ____F[510 + (j * 2 + 0)];
            const twiddleIm = ____F[510 + (j * 2 + 1)];

            const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
            const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

            out1024[evenIndex * 2]     = evenPartRe + twiddledOddRe;
            out1024[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
            out1024[oddIndex * 2]      = evenPartRe - twiddledOddRe;
            out1024[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
        }

        for (let j = 0; j < 256; j++) {
            const evenIndex = 512 + j;
            const oddIndex  = 512 + j + 256;

            const evenPartRe = out1024[evenIndex * 2];
            const evenPartIm = out1024[evenIndex * 2 + 1];
            const oddPartRe  = out1024[oddIndex * 2];
            const oddPartIm  = out1024[oddIndex * 2 + 1];

            const twiddleRe = ____F[510 + (j * 2 + 0)];
            const twiddleIm = ____F[510 + (j * 2 + 1)];

            const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
            const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

            out1024[evenIndex * 2]     = evenPartRe + twiddledOddRe;
            out1024[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
            out1024[oddIndex * 2]      = evenPartRe - twiddledOddRe;
            out1024[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
        }

    /////////////////////////////////////////////
    // P = 5  -> 1024
    //

        for (let j = 0; j < 512; j++) {
            const evenIndex = j;
            const oddIndex  = j + 512;

            if(j > 256){
              out1024[evenIndex * 2]     =  out1024[2048 - evenIndex * 2] ;
              out1024[evenIndex * 2 + 1] = -out1024[2048 - evenIndex * 2 + 1];
              out1024[oddIndex * 2]      =  out1024[2048 - oddIndex * 2];
              out1024[oddIndex * 2 + 1]  = -out1024[2048 - oddIndex * 2 + 1];
              continue;
            }

            const evenPartRe = out1024[evenIndex * 2];
            const evenPartIm = out1024[evenIndex * 2 + 1];
            const oddPartRe  = out1024[oddIndex * 2];
            const oddPartIm  = out1024[oddIndex * 2 + 1];

            const twiddleRe = ____F[1022 + (j * 2 + 0)];
            const twiddleIm = ____F[1022 + (j * 2 + 1)];

            const twiddledOddRe = oddPartRe * twiddleRe - oddPartIm * twiddleIm;
            const twiddledOddIm = oddPartRe * twiddleIm + oddPartIm * twiddleRe;

            out1024[evenIndex * 2]     = evenPartRe + twiddledOddRe;
            out1024[evenIndex * 2 + 1] = evenPartIm + twiddledOddIm;
            out1024[oddIndex * 2]      = evenPartRe - twiddledOddRe;
            out1024[oddIndex * 2 + 1]  = evenPartIm - twiddledOddIm;
        }

    return out1024;
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


function fftComplexInPlace_ref(complexInput) {
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

    /*for(let i=0; i<16; i++){
        console.log("INIT:",i," -> ", out[i*2], out[i*2+1]); 
    }*/
    // Recursively calculate FFT
    for (let size = 2; size <= N; size *= 2) {
        //if(size > 1024){ break; }
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
        /*if(size==256){
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



/******************** INVERSE *********************/
//const pi = Math.PI;

let result512 = new Float32Array(512);
function ifft512(input) {
    // Take the complex conjugate of the input spectrum in place
    for (let i = 0; i < 1024; i += 2) {
        input[i + 1] = -input[i + 1]; // Negate the imaginary part
    }

    // Apply FFT to the conjugate spectrum
    const result_ = fftComplexInPlace_ref(input);
    for (let i = 0; i < 512; i++) {
        result512[i] = result_[i*2] / 512; // Scale the real part
    }
    return result512;
}

let result1024 = new Float32Array(1024);
function ifft1024(input) {
    // Take the complex conjugate of the input spectrum in place
    for (let i = 0; i < 2048; i += 2) {
        input[i + 1] = -input[i + 1]; // Negate the imaginary part
    }

    // Apply FFT to the conjugate spectrum
    const result_ = fftComplexInPlace_ref(input);
    for (let i = 0; i < 1024; i++) {
        result1024[i] = result_[i*2] / 1024; // Scale the real part
    }
    return result1024;
}



let fullSpectrum512 = new Float32Array(1024);
// Function to compute inverse FFT of a spectrum
function computeInverseFFTonHalf512(halfSpectrum) {
    // Copy DC component (index 0)
    fullSpectrum512[0] = halfSpectrum[0]; // Copy the real part
    fullSpectrum512[1] = halfSpectrum[1]; // Copy the imaginary part

    // Copy Nyquist frequency component (index paddedSize)
    fullSpectrum512[512    ] = 0; // Copy the real part
    fullSpectrum512[512 + 1] = 0; // Invert the imaginary part

    // Apply symmetry to fill the rest of the spectrum
    for (let i = 1; i < 256; i++) {
        let re = halfSpectrum[i * 2    ];
        let im = halfSpectrum[i * 2 + 1];
        fullSpectrum512[i * 2    ] = re; // Copy the real part
        fullSpectrum512[i * 2 + 1] = im; // Copy imaginary part
        // Fill the mirrored part of the spectrum
        fullSpectrum512[1024 - (i * 2)    ] =  re;     // Copy the real part
        fullSpectrum512[1024 - (i * 2) + 1] = -im; // Invert the imaginary part
    }
    
    // Perform the IFFT on the full spectrum
    const audioSignal = ifft512(fullSpectrum512);

    // Extract only the real parts of the time-domain signal
    /*const audioSignal = new Float32Array(timeDomainSignal.length / 2);
    for (let i = 0; i < audioSignal.length; i++) {
        audioSignal[i] = timeDomainSignal[i * 2];
    }*/

    return audioSignal;
}

let fullSpectrum1024 = new Float32Array(2048);
// Function to compute inverse FFT of a spectrum
function computeInverseFFTonHalf1024(halfSpectrum) {
    // Copy DC component (index 0)
    fullSpectrum1024[0] = halfSpectrum[0]; // Copy the real part
    fullSpectrum1024[1] = halfSpectrum[1]; // Copy the imaginary part
    
    // Copy Nyquist frequency component (index paddedSize)
    fullSpectrum1024[1024    ] = 0; // Copy the real part
    fullSpectrum1024[1024 + 1] = 0; // Invert the imaginary part

    // Apply symmetry to fill the rest of the spectrum
    for (let i = 1; i < 512; i++) {
        let re = halfSpectrum[i * 2    ];
        let im = halfSpectrum[i * 2 + 1];
        fullSpectrum1024[i * 2    ] = re; // Copy the real part
        fullSpectrum1024[i * 2 + 1] = im; // Copy imaginary part
        // Fill the mirrored part of the spectrum
        fullSpectrum1024[2048 - (i * 2)    ] =  re;     // Copy the real part
        fullSpectrum1024[2048 - (i * 2) + 1] = -im; // Invert the imaginary part
    }

    // Perform the IFFT on the full spectrum
    const audioSignal = ifft1024(fullSpectrum1024);

    /*// Extract only the real parts of the time-domain signal
    const audioSignal = new Float32Array(timeDomainSignal.length / 2);
    for (let i = 0; i < audioSignal.length; i++) {
        audioSignal[i] = timeDomainSignal[i * 2];
    }*/

    return audioSignal;
}






/**********************************************************************************************/
/**********************************************************************************************/
/**********************************************************************************************/
/********************************* TESTING PERFORMANCE ****************************************/

let fft_wasm;
function initializeModule() {
    fft_wasm = Module.cwrap('fftReal1024', null, ['number', 'number', 'number']);
}




/*
// Define your initialization logic
function initializeModule() {

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



    // Call your memory-related functions after initialization
    const inputArray = testData1024;
    let fft_wasm = Module.cwrap('fftReal1024', null, ['number', 'number', 'number']);
    var ptr_in = Module._malloc(inputArray.length * Float32Array.BYTES_PER_ELEMENT);
    Module.HEAPF32.set(inputArray, ptr_in / Float32Array.BYTES_PER_ELEMENT);
    var ptr_out = Module._malloc(2048 * Float32Array.BYTES_PER_ELEMENT);




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
            //fftReal512(testData);
            //fftReal1024(testData);
            fft_wasm(ptr_in, inputArray.length, ptr_out);
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

    //measureTime(512);
    //measureTime(512);
    //measureTime(512);
    //measureTime(512);
    //measureTime(512);
    //measureTime(1024);
    //measureTime(2048);
    //measureTime(4096);

    //console.log("8:    ",compareFFTResults(fftRealInPlace_ref(testData8),fftRealInPlaceRADIX4(testData8)));
    //console.log("16:   ",compareFFTResults(fftRealInPlace_ref(testData16),fftRealInPlaceRADIX4(testData16)));
    //console.log("32:   ",compareFFTResults(fftRealInPlace_ref(testData32),fftRealInPlaceRADIX4(testData32)));
    //console.log("64:   ",compareFFTResults(fftRealInPlace_ref(testData64),fftRealInPlaceRADIX4(testData64)));
    //console.log("128:  ",compareFFTResults(fftRealInPlace_ref(testData128),fftRealInPlaceRADIX4(testData128)));
    //console.log("256:  ",compareFFTResults(fftRealInPlace_ref(testData256),fftRealInPlaceRADIX4(testData256)));
    //console.log("512:  ",compareFFTResults(fftRealInPlace_ref(testData512),fftRealInPlaceRADIX4(testData512)));
    //console.log("1024: ",compareFFTResults(fftRealInPlace_ref(testData1024),fftRealInPlaceRADIX4(testData1024)));
    //console.log("2048: ",compareFFTResults(fftRealInPlace_ref(testData2048),fftRealInPlaceRADIX4(testData2048)));
    //console.log("4096: ",compareFFTResults(fftRealInPlace_ref(testData4096),fftRealInPlaceRADIX4(testData4096)));
    
    //const signal1 = [ 1.0, 0.4, 0.0, 0.2 ];
    //const signal2 = [ 0.0, 0.5, 1.0, 0.5, 0.0,-0.5, 1.0,-0.5 ];
    //const signal3 = [ 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1 ];
    //const signal4 = [ 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1, 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1 ];
    //const signal5 = [ 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1, 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1, 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1, 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1 ];
    

    //console.log("512:  ",compareFFTResults(fftRealInPlace_ref(testData512),fftReal512(testData512)));
    //console.log("1024:  ",compareFFTResults(fftRealInPlace_ref(testData1024),fftReal512(testData1024)));

    
    //console.log(signal1);
    //console.log(computeInverseFFT(computeFFT(signal1)));
    //console.log(signal2);
    //console.log(computeInverseFFT(computeFFT(signal2)));
    //console.log(signal3);
    //console.log(computeInverseFFT(computeFFT(signal3)));
    

    //console.log("1024:  ",compareFFTResults(testData1024,ifft1024(fftRealInPlace_ref(testData1024))));
    //console.log("1024:  ",compareFFTResults(testData1024,ifft1024(fftReal1024(testData1024))));

    //console.log(computeFFT(signal1));

    //console.log(fftRealInPlace_ref(testData256));
    //console.log(fftReal512(testData512));
    //console.log(fftReal512(testData1024));


    try {
        measureTime(1024);
        measureTime(1024);
        measureTime(1024);
        measureTime(1024);
        measureTime(1024);
    } finally {
        Module._free(ptr_in);
        Module._free(ptr_out);
    }
}
*/

// Check if the module is already initialized, otherwise wait for initialization
if (Module.isRuntimeInitialized) {
    initializeModule();
} else {
    Module.onRuntimeInitialized = initializeModule;
}



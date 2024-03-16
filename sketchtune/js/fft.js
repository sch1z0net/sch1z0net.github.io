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




/**********************************************************************************************/
/**********************************************************************************************/
/**********************************************************************************************/
/**********************************************************************************************/
/*******************************  WASM FFT MIXED RADIX      ***********************************/
/**********************************************************************************************/
/**********************************************************************************************/
/**********************************************************************************************/
/**********************************************************************************************/

var p_in_128, fft_wasm_128;
var p_in_256, fft_wasm_256;
var p_in_512, fft_wasm_512;
var p_in_1024, fft_wasm_1024;

function initializeModule() {
    fft_wasm_128 = Module.cwrap('fftReal128', null, ['number', 'number', 'number']);
    p_in_128     = Module._malloc(128 * Float32Array.BYTES_PER_ELEMENT);

    fft_wasm_256 = Module.cwrap('fftReal256', null, ['number', 'number', 'number']);
    p_in_256     = Module._malloc(256 * Float32Array.BYTES_PER_ELEMENT);

    fft_wasm_512 = Module.cwrap('fftReal512', null, ['number', 'number', 'number']);
    p_in_512     = Module._malloc(512 * Float32Array.BYTES_PER_ELEMENT);

    fft_wasm_1024= Module.cwrap('fftReal1024', null, ['number', 'number', 'number']);
    p_in_1024    = Module._malloc(1024* Float32Array.BYTES_PER_ELEMENT);
}

function fftReal1024(realInput) {
    // Check if the input length exceeds the maximum length
    if (realInput.length > 1024) { throw new Error("Input length exceeds maximum length"); }
    // Copy input data to the preallocated memory buffer
    Module.HEAPF32.set(realInput, p_in_1024 / Float32Array.BYTES_PER_ELEMENT);
    // Perform FFT
    fft_wasm_1024(p_in_1024, realInput.length);
    var p_out_1024 = Module.ccall('getOut1024Ptr', 'number', [], []);
    // Return the result array
    return new Float32Array(Module.HEAPF32.buffer, p_out_1024, 2048);
}


function fftReal512(realInput) {
    // Check if the input length exceeds the maximum length
    if (realInput.length > 512) { throw new Error("Input length exceeds maximum length"); }
    // Copy input data to the preallocated memory buffer
    Module.HEAPF32.set(realInput, p_in_512 / Float32Array.BYTES_PER_ELEMENT);
    // Perform FFT
    fft_wasm_512(p_in_512, realInput.length);
    var p_out_512 = Module.ccall('getOut512Ptr', 'number', [], []);
    // Return the result array
    return new Float32Array(Module.HEAPF32.buffer, p_out_512, 1024);
}

function fftReal256(realInput) {
    // Check if the input length exceeds the maximum length
    if (realInput.length > 256) { throw new Error("Input length exceeds maximum length"); }
    // Copy input data to the preallocated memory buffer
    Module.HEAPF32.set(realInput, p_in_256 / Float32Array.BYTES_PER_ELEMENT);
    // Perform FFT
    fft_wasm_256(p_in_256, realInput.length);
    var p_out_256 = Module.ccall('getOut256Ptr', 'number', [], []);
    // Return the result array
    return new Float32Array(Module.HEAPF32.buffer, p_out_256, 512);
}

function fftReal128(realInput) {
    // Check if the input length exceeds the maximum length
    if (realInput.length > 128) { throw new Error("Input length exceeds maximum length"); }
    // Copy input data to the preallocated memory buffer
    Module.HEAPF32.set(realInput, p_in_128 / Float32Array.BYTES_PER_ELEMENT);
    // Perform FFT
    fft_wasm_128(p_in_128, realInput.length);
    var p_out_128 = Module.ccall('getOut128Ptr', 'number', [], []);
    // Return the result array
    return new Float32Array(Module.HEAPF32.buffer, p_out_128, 256);
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


function fftComplex_ref(complexInput) {
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

function fftComplex_ref_d(complexInput) {
    const N = complexInput.length / 2;
    const bits = Math.floor(Math.log2(N));

    if (N !== nextPowerOf2(N)) {
        console.error("FFT FRAME must have power of 2");
        return;
    }

    // Perform bit reversal
    const out = new Float64Array(N * 2);
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
        //const factors = computeFFTFactorsWithCache(size);
        for (let i = 0; i < N; i += size) {
            for (let j = 0; j < halfSize; j++) {
                const evenIndex = i + j;
                const oddIndex = i + j + halfSize;
                const evenPartRe = out[evenIndex * 2    ];
                const evenPartIm = out[evenIndex * 2 + 1];
                const oddPartRe  = out[oddIndex  * 2    ];
                const oddPartIm  = out[oddIndex  * 2 + 1];

                const twiddleRe = Math.cos((2 * Math.PI * j) / size);
                const twiddleIm = Math.sin((2 * Math.PI * j) / size);
                //const twiddleRe = factors[2 * j    ];
                //const twiddleIm = factors[2 * j + 1];

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

function fftReal_ref_d(realInput) {
    const N = realInput.length;
    const bits = Math.floor(Math.log2(N));

    if (N !== nextPowerOf2(N)) {
        console.error("FFT FRAME must have power of 2");
        return;
    }

    // Perform bit reversal
    const out = new Float64Array(N * 2);
    for (let i = 0; i < N; i++) {
        const reversedIndex = bitReverse(i, bits);
        out[reversedIndex * 2    ] = realInput[i]; // Copy real part
        out[reversedIndex * 2 + 1] = 0;            // Copy imaginary part
    }
    
    if (N <= 1) {
        return out;
    }

    // Recursively calculate FFT
    for (let size = 2; size <= N; size *= 2) {
        const halfSize = size / 2;
        //const factors = computeFFTFactorsWithCache(size);
        for (let i = 0; i < N; i += size) {
            for (let j = 0; j < halfSize; j++) {
                const evenIndex = i + j;
                const oddIndex = i + j + halfSize;

                const eRe = out[evenIndex * 2];
                const eIm = out[evenIndex * 2 + 1];
                const oRe = out[oddIndex * 2];
                const oIm = out[oddIndex * 2 + 1];

                const twiddleRe = Math.cos((2 * Math.PI * j) / size);
                const twiddleIm = Math.sin((2 * Math.PI * j) / size);
                //const twiddleRe = factors[2 * j    ];
                //const twiddleIm = factors[2 * j + 1];

                // Multiply by twiddle factors
                const t_oRe = oRe * twiddleRe - oIm * twiddleIm;
                const t_oIm = oRe * twiddleIm + oIm * twiddleRe;

                // Combine results of even and odd parts in place
                out[evenIndex * 2    ] = eRe + t_oRe;
                out[evenIndex * 2 + 1] = eIm + t_oIm;
                out[oddIndex  * 2    ] = eRe - t_oRe;
                out[oddIndex  * 2 + 1] = eIm - t_oIm;
            }
        }
    }

    return out;
}

function fftReal_ref(realInput) {
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
        return out;
    }

    let js = [];

    /*for(let i=0; i<16; i++){
        console.log("INIT:",i," -> ", out[i*2], out[i*2+1]); 
    }*/
    // Recursively calculate FFT
    for (let size = 2; size <= N; size *= 2) {
        //if(size > 64){ break; }
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
let result128 = new Float32Array(128);
function ifft128(input) {
    // Take the complex conjugate of the input spectrum in place
    for (let i = 0; i < 256; i += 2) {
        input[i + 1] = -input[i + 1]; // Negate the imaginary part
    }

    // Apply FFT to the conjugate spectrum
    const result_ = fftComplex_ref(input);
    for (let i = 0; i < 128; i++) {
        result128[i] = result_[i*2] / 128; // Scale the real part
    }
    return result128;
}

let result256 = new Float32Array(256);
function ifft256(input) {
    // Take the complex conjugate of the input spectrum in place
    for (let i = 0; i < 512; i += 2) {
        input[i + 1] = -input[i + 1]; // Negate the imaginary part
    }

    // Apply FFT to the conjugate spectrum
    const result_ = fftComplex_ref(input);
    for (let i = 0; i < 256; i++) {
        result256[i] = result_[i*2] / 256; // Scale the real part
    }
    return result256;
}

let result512 = new Float32Array(512);
function ifft512(input) {
    // Take the complex conjugate of the input spectrum in place
    for (let i = 0; i < 1024; i += 2) {
        input[i + 1] = -input[i + 1]; // Negate the imaginary part
    }

    // Apply FFT to the conjugate spectrum
    const result_ = fftComplex_ref(input);
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
    const result_ = fftComplex_ref(input);
    for (let i = 0; i < 1024; i++) {
        result1024[i] = result_[i*2] / 1024; // Scale the real part
    }
    return result1024;
}

let fullSpectrum128 = new Float32Array(256);
// Function to compute inverse FFT of a spectrum
function IFFT128onHalf(halfSpectrum) {
    // Copy DC component (index 0)
    fullSpectrum128[0] = halfSpectrum[0]; // Copy the real part
    fullSpectrum128[1] = halfSpectrum[1]; // Copy the imaginary part

    // Copy Nyquist frequency component (index paddedSize)
    fullSpectrum128[128    ] = 0; // Copy the real part
    fullSpectrum128[128 + 1] = 0; // Invert the imaginary part

    // Apply symmetry to fill the rest of the spectrum
    for (let i = 1; i < 64; i++) {
        let re = halfSpectrum[i * 2    ];
        let im = halfSpectrum[i * 2 + 1];
        fullSpectrum128[i * 2    ] = re; // Copy the real part
        fullSpectrum128[i * 2 + 1] = im; // Copy imaginary part
        // Fill the mirrored part of the spectrum
        fullSpectrum128[256 - (i * 2)    ] =  re;     // Copy the real part
        fullSpectrum128[256 - (i * 2) + 1] = -im; // Invert the imaginary part
    }
    
    // Perform the IFFT on the full spectrum
    const audioSignal = ifft128(fullSpectrum128);

    return audioSignal;
}


let fullSpectrum256 = new Float32Array(512);
// Function to compute inverse FFT of a spectrum
function IFFT256onHalf(halfSpectrum) {
    // Copy DC component (index 0)
    fullSpectrum256[0] = halfSpectrum[0]; // Copy the real part
    fullSpectrum256[1] = halfSpectrum[1]; // Copy the imaginary part

    // Copy Nyquist frequency component (index paddedSize)
    fullSpectrum256[256    ] = 0; // Copy the real part
    fullSpectrum256[256 + 1] = 0; // Invert the imaginary part

    // Apply symmetry to fill the rest of the spectrum
    for (let i = 1; i < 128; i++) {
        let re = halfSpectrum[i * 2    ];
        let im = halfSpectrum[i * 2 + 1];
        fullSpectrum256[i * 2    ] = re; // Copy the real part
        fullSpectrum256[i * 2 + 1] = im; // Copy imaginary part
        // Fill the mirrored part of the spectrum
        fullSpectrum256[512 - (i * 2)    ] =  re;     // Copy the real part
        fullSpectrum256[512 - (i * 2) + 1] = -im; // Invert the imaginary part
    }
    
    // Perform the IFFT on the full spectrum
    const audioSignal = ifft256(fullSpectrum256);

    return audioSignal;
}

let fullSpectrum512 = new Float32Array(1024);
// Function to compute inverse FFT of a spectrum
function IFFT512onHalf(halfSpectrum) {
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

    return audioSignal;
}

let fullSpectrum1024 = new Float32Array(2048);
// Function to compute inverse FFT of a spectrum
function IFFT1024onHalf(halfSpectrum) {
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

let testData8      = generateTestData(8);
let testData16     = generateTestData(16);
let testData32     = generateTestData(32);
let testData64     = generateTestData(64);
let testData128    = generateTestData(128);
let testData256    = generateTestData(256);
let testData512    = generateTestData(512);
let testData1024   = generateTestData(1024);
let testData2048   = generateTestData(2048);
let testData4096   = generateTestData(4096);

// Perform FFT operations
const performFFTOperations = (fftSize) => {
    if(fftSize == 128){
        for (let i = 0; i < numOperations; i++) {
             fftReal128(testData128);
        }
    }
    if(fftSize == 256){
        for (let i = 0; i < numOperations; i++) {
             fftReal256(testData256);
        }
    }
    if(fftSize == 512){
        for (let i = 0; i < numOperations; i++) {
             fftReal512(testData512);
        }
    }
    if(fftSize == 1024){
        for (let i = 0; i < numOperations; i++) {
             fftReal1024(testData1024);
        }
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

function runPerformance(){
        console.log("\n\nPerformance Test:");

        measureTime(1024);
        measureTime(1024);
        measureTime(1024);
        testData1024 = generateTestData(1024);
        measureTime(1024);
        measureTime(1024);
        measureTime(1024);
        testData1024 = generateTestData(1024);
        measureTime(1024);
        measureTime(1024);
        measureTime(1024);

        measureTime(512);
        measureTime(512);
        measureTime(512);
        testData512  = generateTestData(512);
        measureTime(512);
        measureTime(512);
        measureTime(512);
        testData512  = generateTestData(512);
        measureTime(512);
        measureTime(512);
        measureTime(512);

        measureTime(256);
        measureTime(256);
        measureTime(256);
        testData256  = generateTestData(256);
        measureTime(256);
        measureTime(256);
        measureTime(256);
        testData256  = generateTestData(256);
        measureTime(256);
        measureTime(256);
        measureTime(256);
    
        measureTime(128);
        measureTime(128);
        measureTime(128);
        testData256  = generateTestData(128);
        measureTime(128);
        measureTime(128);
        measureTime(128);
        testData256  = generateTestData(128);
        measureTime(128);
        measureTime(128);
        measureTime(128);
}

function compareFFTResults(array1, array2, error) {
    // Check if arrays have the same length
    if (array1.length !== array2.length) {
        return false;
    }

    // Check each element in the arrays for equality
    for (let i = 0; i < array1.length; i++) {
        // Compare elements with a small tolerance for floating-point imprecision
        if (Math.abs(array1[i] - array2[i]) > error) { //1e-6
            console.log("Mismatch at ",i," between ",array1[i],array2[i]);
            return false;
        }
    }

    // If all elements are equal within tolerance, arrays are considered equal
    return true;
}

//const signal1 = [ 1.0, 0.4, 0.0, 0.2 ];
//const signal2 = [ 0.0, 0.5, 1.0, 0.5, 0.0,-0.5, 1.0,-0.5 ];
//const signal3 = [ 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1 ];
//const signal4 = [ 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1, 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1 ];
//const signal5 = [ 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1, 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1, 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1, 0.0, 0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1, 0.0,-0.1,-0.5,-0.9,-1.0,-0.9,-0.5,-0.1 ];

function runComparison(){
    let error;
    error = 1e-3;
    console.log("\n\nCompare to Reference with acceptable Error ",error," :");
    console.log("128:  ",compareFFTResults(fftReal_ref(testData128), fftReal128(testData128),error));
    console.log("256:  ",compareFFTResults(fftReal_ref(testData256), fftReal256(testData256),error));
    console.log("512:  ",compareFFTResults(fftReal_ref(testData512), fftReal512(testData512),error));
    console.log("1024: ",compareFFTResults(fftReal_ref(testData1024),fftReal1024(testData1024),error));

    error = 1e-4;
    console.log("\n\nCompare to Reference with acceptable Error ",error," :");
    console.log("128:  ",compareFFTResults(fftReal_ref(testData128), fftReal128(testData128),error));
    console.log("256:  ",compareFFTResults(fftReal_ref(testData256), fftReal256(testData256),error));
    console.log("512:  ",compareFFTResults(fftReal_ref(testData512), fftReal512(testData512),error));
    console.log("1024: ",compareFFTResults(fftReal_ref(testData1024),fftReal1024(testData1024),error));

    error = 1e-5;
    console.log("\n\nCompare to Reference with acceptable Error ",error," :");
    console.log("128:  ",compareFFTResults(fftReal_ref(testData128), fftReal128(testData128),error));
    console.log("256:  ",compareFFTResults(fftReal_ref(testData256), fftReal256(testData256),error));
    console.log("512:  ",compareFFTResults(fftReal_ref(testData512), fftReal512(testData512),error));
    console.log("1024: ",compareFFTResults(fftReal_ref(testData1024),fftReal1024(testData1024),error));

    error = 1e-6;
    console.log("\n\nCompare to Reference with acceptable Error ",error," :");
    console.log("128:  ",compareFFTResults(fftReal_ref(testData128), fftReal128(testData128),error));
    console.log("256:  ",compareFFTResults(fftReal_ref(testData256), fftReal256(testData256),error));
    console.log("512:  ",compareFFTResults(fftReal_ref(testData512), fftReal512(testData512),error));
    console.log("1024: ",compareFFTResults(fftReal_ref(testData1024),fftReal1024(testData1024),error));
}

function runForthAndBack(){
    let error;
    
    let signal128  = ifft128(fftReal_ref(testData128));
    let signal256  = ifft256(fftReal_ref(testData256));
    let signal512  = ifft512(fftReal_ref(testData512));
    let signal1024 = ifft1024(fftReal_ref(testData1024));

    error = 1e-3;
    console.log("\n\nCompare after Forth and Back with acceptable Error ",error," :");
    console.log("128:   ",compareFFTResults(testData128, signal128 ,error));
    console.log("256:   ",compareFFTResults(testData256, signal256 ,error));
    console.log("512:   ",compareFFTResults(testData512, signal512 ,error));
    console.log("1024:  ",compareFFTResults(testData1024, signal1024 ,error));

    error = 1e-4;
    console.log("\n\nCompare after Forth and Back with acceptable Error ",error," :");
    console.log("128:   ",compareFFTResults(testData128, signal128 ,error));
    console.log("256:   ",compareFFTResults(testData256, signal256 ,error));
    console.log("512:   ",compareFFTResults(testData512, signal512 ,error));
    console.log("1024:  ",compareFFTResults(testData1024, signal1024 ,error));

    error = 1e-5;
    console.log("\n\nCompare after Forth and Back with acceptable Error ",error," :");
    console.log("128:   ",compareFFTResults(testData128, signal128 ,error));
    console.log("256:   ",compareFFTResults(testData256, signal256 ,error));
    console.log("512:   ",compareFFTResults(testData512, signal512 ,error));
    console.log("1024:  ",compareFFTResults(testData1024, signal1024 ,error));

    error = 1e-6;
    console.log("\n\nCompare after Forth and Back with acceptable Error ",error," :");
    console.log("128:   ",compareFFTResults(testData128, signal128 ,error));
    console.log("256:   ",compareFFTResults(testData256, signal256 ,error));
    console.log("512:   ",compareFFTResults(testData512, signal512 ,error));
    console.log("1024:  ",compareFFTResults(testData1024, signal1024 ,error));
}




// Check if the module is already initialized, otherwise wait for initialization
if (Module.isRuntimeInitialized) {
    initializeModule();
    //runPerformance();
    runComparison();
    runForthAndBack();
} else {
    Module.onRuntimeInitialized = function(){
        initializeModule();
        //runPerformance();
        runComparison();
        runForthAndBack();
    };
}



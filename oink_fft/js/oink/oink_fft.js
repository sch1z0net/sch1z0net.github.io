function nextPowerOf2(n) {
    return Math.pow(2, Math.ceil(Math.log2(n)));
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
var p_in_2048, fft_wasm_2048;

function initializeModuleOINK() {
    fft_wasm_128 = Module_OINK_.cwrap('fftReal128', null, ['number', 'number', 'number']);
    p_in_128     = Module_OINK_._malloc(128 * Float32Array.BYTES_PER_ELEMENT);

    fft_wasm_256 = Module_OINK_.cwrap('fftReal256', null, ['number', 'number', 'number']);
    p_in_256     = Module_OINK_._malloc(256 * Float32Array.BYTES_PER_ELEMENT);

    fft_wasm_512 = Module_OINK_.cwrap('fftReal512', null, ['number', 'number', 'number']);
    p_in_512     = Module_OINK_._malloc(512 * Float32Array.BYTES_PER_ELEMENT);

    fft_wasm_1024= Module_OINK_.cwrap('fftReal1024', null, ['number', 'number', 'number']);
    p_in_1024    = Module_OINK_._malloc(1024* Float32Array.BYTES_PER_ELEMENT);

    fft_wasm_2048= Module_OINK_.cwrap('fftReal2048', null, ['number', 'number', 'number']);
    p_in_2048    = Module_OINK_._malloc(2048* Float32Array.BYTES_PER_ELEMENT);
}

function fftReal2048(realInput) {
    // Check if the input length exceeds the maximum length
    if (realInput.length > 2048) { throw new Error("Input length exceeds maximum length"); }
    // Copy input data to the preallocated memory buffer
    Module_OINK_.HEAPF32.set(realInput, p_in_2048 / Float32Array.BYTES_PER_ELEMENT);
    // Perform FFT
    fft_wasm_2048(p_in_2048, realInput.length);
    var p_out_2048 = Module_OINK_.ccall('getOut2048Ptr', 'number', [], []);
    // Return the result array
    return new Float32Array(Module_OINK_.HEAPF32.buffer, p_out_2048, 4096);
}

function fftReal1024(realInput) {
    // Check if the input length exceeds the maximum length
    if (realInput.length > 1024) { throw new Error("Input length exceeds maximum length"); }
    // Copy input data to the preallocated memory buffer
    Module_OINK_.HEAPF32.set(realInput, p_in_1024 / Float32Array.BYTES_PER_ELEMENT);
    // Perform FFT
    fft_wasm_1024(p_in_1024, realInput.length);
    var p_out_1024 = Module_OINK_.ccall('getOut1024Ptr', 'number', [], []);
    // Return the result array
    return new Float32Array(Module_OINK_.HEAPF32.buffer, p_out_1024, 2048);
}

function fftReal512(realInput) {
    // Check if the input length exceeds the maximum length
    if (realInput.length > 512) { throw new Error("Input length exceeds maximum length"); }
    // Copy input data to the preallocated memory buffer
    Module_OINK_.HEAPF32.set(realInput, p_in_512 / Float32Array.BYTES_PER_ELEMENT);
    // Perform FFT
    fft_wasm_512(p_in_512, realInput.length);
    var p_out_512 = Module_OINK_.ccall('getOut512Ptr', 'number', [], []);
    // Return the result array
    return new Float32Array(Module_OINK_.HEAPF32.buffer, p_out_512, 1024);
}

function fftReal256(realInput) {
    // Check if the input length exceeds the maximum length
    if (realInput.length > 256) { throw new Error("Input length exceeds maximum length"); }
    // Copy input data to the preallocated memory buffer
    Module_OINK_.HEAPF32.set(realInput, p_in_256 / Float32Array.BYTES_PER_ELEMENT);
    // Perform FFT
    fft_wasm_256(p_in_256, realInput.length);
    var p_out_256 = Module_OINK_.ccall('getOut256Ptr', 'number', [], []);
    // Return the result array
    return new Float32Array(Module_OINK_.HEAPF32.buffer, p_out_256, 512);
}

function fftReal128(realInput) {
    // Check if the input length exceeds the maximum length
    if (realInput.length > 128) { throw new Error("Input length exceeds maximum length"); }
    // Copy input data to the preallocated memory buffer
    Module_OINK_.HEAPF32.set(realInput, p_in_128 / Float32Array.BYTES_PER_ELEMENT);
    // Perform FFT
    fft_wasm_128(p_in_128, realInput.length);
    var p_out_128 = Module_OINK_.ccall('getOut128Ptr', 'number', [], []);
    // Return the result array
    return new Float32Array(Module_OINK_.HEAPF32.buffer, p_out_128, 256);
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
        out[reversedIndex * 2    ] = realInput[i];
        out[reversedIndex * 2 + 1] = 0;           
    }

    if (N <= 1) {
        return out;
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

let result2048 = new Float32Array(2048);
function ifft2048(input) {
    // Take the complex conjugate of the input spectrum in place
    for (let i = 0; i < 4096; i += 2) {
        input[i + 1] = -input[i + 1]; // Negate the imaginary part
    }

    // Apply FFT to the conjugate spectrum
    const result_ = fftComplex_ref(input);
    for (let i = 0; i < 2048; i++) {
        result2048[i] = result_[i*2] / 2048; // Scale the real part
    }
    return result2048;
}

let fullSpectrum128 = new Float32Array(256);
// Function to compute inverse FFT of a spectrum
function IFFT128onHalf(halfSpectrum) {
    // Copy DC component (index 0)
    fullSpectrum128[0] = halfSpectrum[0]; // Copy the real part
    fullSpectrum128[1] = halfSpectrum[1]; // Copy the imaginary part

    // Copy Nyquist frequency component (index paddedSize)
    fullSpectrum128[128    ] = halfSpectrum[128];     // Copy the real part
    fullSpectrum128[128 + 1] = halfSpectrum[128 + 1]; // Invert the imaginary part

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
    fullSpectrum256[256    ] = halfSpectrum[256]; // Copy the real part
    fullSpectrum256[256 + 1] = halfSpectrum[256 + 1]; // Invert the imaginary part

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
    fullSpectrum512[512    ] = halfSpectrum[512]; // Copy the real part
    fullSpectrum512[512 + 1] = halfSpectrum[512 + 1]; // Invert the imaginary part

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
    fullSpectrum1024[1024    ] = halfSpectrum[1024]; // Copy the real part
    fullSpectrum1024[1024 + 1] = halfSpectrum[1024 + 1]; // Invert the imaginary part

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

let fullSpectrum2048 = new Float32Array(4096);
// Function to compute inverse FFT of a spectrum
function IFFT2048onHalf(halfSpectrum) {
    // Copy DC component (index 0)
    fullSpectrum2048[0] = halfSpectrum[0]; // Copy the real part
    fullSpectrum2048[1] = halfSpectrum[1]; // Copy the imaginary part
    
    // Copy Nyquist frequency component (index paddedSize)
    fullSpectrum2048[2048    ] = halfSpectrum[2048]; // Copy the real part
    fullSpectrum2048[2048 + 1] = halfSpectrum[2048 + 1]; // Invert the imaginary part

    // Apply symmetry to fill the rest of the spectrum
    for (let i = 1; i < 1024; i++) {
        let re = halfSpectrum[i * 2    ];
        let im = halfSpectrum[i * 2 + 1];
        fullSpectrum2048[i * 2    ] = re; // Copy the real part
        fullSpectrum2048[i * 2 + 1] = im; // Copy imaginary part
        // Fill the mirrored part of the spectrum
        fullSpectrum2048[4096 - (i * 2)    ] =  re;     // Copy the real part
        fullSpectrum2048[4096 - (i * 2) + 1] = -im; // Invert the imaginary part
    }

    // Perform the IFFT on the full spectrum
    const audioSignal = ifft2048(fullSpectrum2048);

    return audioSignal;
}




export { initializeModuleOINK, fftReal2048, fftReal1024, fftReal512, fftReal256, fftReal128 };
function convertToComplex(inputSignal) {
    return inputSignal.map(value => ({ re: value, im: 0 }));
}

function nextPowerOf2(n) {
    return Math.pow(2, Math.ceil(Math.log2(n)));
}

/******************** UTILS *********************/
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

const maxSampleLength = 60 * 44100; // 60 seconds at 44100 Hz sample rate
const fftFactorLookup = generateFFTFactorLookup(maxSampleLength);

console.log("PRECALCULATE FFT LOOKUP TABLE", fftFactorLookup);





/******************** INVERSE *********************/

function ifft(input) {
    const N = input.length;
    const pi = Math.PI;

    // Take the complex conjugate of the input spectrum
    const conjugateSpectrum = input.map(({ re, im }) => ({ re, im: -im }));

    // Apply FFT to the conjugate spectrum
    const fftResult = fft(conjugateSpectrum);

    // Take the complex conjugate of the FFT result
    const ifftResult = fftResult.map(({ re, im }) => ({ re: re / N, im: -im / N }));

    return ifftResult;
}

function IFFT(spectrum){
    return ifft(spectrum).map(({ re }) => re);
} 

// Function to compute inverse FFT of a spectrum
function computeInverseFFT(spectrum) {
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
    const timeDomainSignal = IFFT(paddedSpectrum);
    return timeDomainSignal;
}


/******************** FORWARD *********************/



// Modified FFT function to use precalculated FFT factors
// input was zero padded before to a length N = PowerOf2
function fft(input) {
    const N = input.length;

    if (N <= 1) {
        return input;
    }

    const even = [];
    const odd = [];
    for (let i = 0; i < N; i++) {
        if (i % 2 === 0) {
            even.push(input[i]);
        } else {
            odd.push(input[i]);
        }
    }

    const evenFFT = fft(even);
    const oddFFT = fft(odd);

    const output = [];
    for (let k = 0; k < N / 2; k++) {
        //const theta = -2 * Math.PI * k / N;
        //const exp = { re: Math.cos(theta), im: Math.sin(theta) };
        const exp = fftFactorLookup[N][k];
        const t = { re: exp.re * oddFFT[k].re - exp.im * oddFFT[k].im, im: exp.re * oddFFT[k].im + exp.im * oddFFT[k].re };
        output[k] = { re: evenFFT[k].re + t.re, im: evenFFT[k].im + t.im };
        output[k + N / 2] = { re: evenFFT[k].re - t.re, im: evenFFT[k].im - t.im };
    }

    return output;
}


function prepare_and_fft(inputSignal) {
    // Apply Hanning window to the input signal
    //const windowedSignal = applyHanningWindow(inputSignal);
    const windowedSignal = inputSignal;

    // Zero-padding to the next power of 2
    const FFT_SIZE = nextPowerOf2(windowedSignal.length);
    const paddedInput = new Array(FFT_SIZE).fill({ re: 0, im: 0 });
    windowedSignal.forEach((value, index) => (paddedInput[index] = { re: value, im: 0 }));

    // Perform FFT
    return fft(paddedInput);
}


function FFT(inputSignal) {
    return prepare_and_fft(inputSignal);
}

// Function to compute FFT of a frame
function computeFFT(frame) {
    // Perform FFT on the frame (you can use your FFT implementation here)
    // For simplicity, let's assume computeFFT returns the magnitude spectrum
    const spectrum = FFT(frame);
    return spectrum;
}
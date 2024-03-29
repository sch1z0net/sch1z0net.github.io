//import * as OINK from "https://cdn.jsdelivr.net/gh/sch1z0net/oink@v0.1.4-alpha/oink_fft.js";
import * as OINK from "./oink_fft.js";

function hanningWindow(windowSize) {
    const window = new Float32Array(windowSize);
    const alpha = 0.5;
    for (let i = 0; i < windowSize; i++) {
        window[i] = (1 - alpha) - (alpha * Math.cos(2 * Math.PI * i / (windowSize - 1)));
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



const NUM_WORKERS = 4;
const maxWorkers = navigator.hardwareConcurrency || 1; // Fallback to 1 if hardwareConcurrency is not available
//console.log("Maximum number of workers:", maxWorkers);
//console.log("Current workers:", NUM_WORKERS);


// Precalculate FFT lookup table
const maxSampleLength = 60 * 44100; // 60 seconds at 44100 Hz sample rate
//const fftFactorLookup = generateFFTFactorLookup(maxSampleLength);
//console.log("PRECALCULATED FFT LOOKUP TABLE", fftFactorLookup);








function generateTestDataSignal(durationSeconds, sampleRate) {
    const numSamples = durationSeconds * sampleRate;
    const signal = new Float32Array(numSamples);

    for (let i = 0; i < numSamples; i++) {
        // Generate a simple sine wave with a frequency of 440 Hz (A4 note)
        const t = i / sampleRate; // Time in seconds
        signal[i] = Math.sin(2 * Math.PI * 440 * t);
    }

    return signal;
}

async function testSTFT(inputSignal, mode){
    const startTime = performance.now();
    const result = await STFTWithWebWorkers(inputSignal, windowSize, hopSize, mode);
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;
    //console.log(`Mode ${mode}, Calculating the Spectrogram: Elapsed time: ${elapsedTime} milliseconds`); 
    return elapsedTime;
}

async function testAverage(testSignal, mode) {
    const numIterations = 10;
    let totalTime = 0;

    for (let i = 0; i < numIterations; i++) {
        const startTime = performance.now();
        // Call testSTFT and await its result
        const result = await testSTFT(testSignal, mode);
        const endTime = performance.now();
        const elapsedTime = endTime - startTime;
        //console.log(`Iteration ${i + 1}: Elapsed time: ${elapsedTime} milliseconds`);
        totalTime += elapsedTime;
    }
    const averageTime = totalTime / numIterations;
    console.log(`------- Mode: ${mode}, Average time for ${numIterations} iterations: ${averageTime} milliseconds`);
}

async function test(){
    for(let i = 0; i < 10; i++){
        await testAverage(testDataSignal, 0);
        await testAverage(testDataSignal, 1);
        await testAverage(testDataSignal, 2);
    }
}

/*
const windowSize = 512 * 4; // Size of the analysis window
const hopSize = windowSize / 4; // 25% overlap

const durationSeconds = 3; // Length of the signal in seconds
const sampleRate = 44100; // Sample rate in Hz
const testDataSignal = generateTestDataSignal(durationSeconds, sampleRate);


test();
*/












/*
// Function to perform Short-Time Fourier Transform (STFT) using Web Workers
function STFTWithWebWorkers(inputSignal, windowSize, hopSize, mode) {
    const numFrames = Math.floor((inputSignal.length - windowSize) / hopSize) + 1;
    const receivedChunks = [];
    let finalSpectrogram = [];

    // Define the number of workers (you can adjust this based on performance testing)
    const numWorkers = NUM_WORKERS;

    // Calculate frames per worker
    const framesPerWorker = Math.ceil(numFrames / numWorkers);
    //console.log("Input Signal Length",inputSignal.length);
    //console.log("Number of Frames", numFrames);
    //console.log("Frames per Worker", framesPerWorker);

    // Initialize a counter for finished workers
    let numFinishedWorkers = 0;

    // Create and run workers
    for (let i = 0; i < numWorkers; i++) {
        const startFrame = i * framesPerWorker;
        const endFrame = Math.min(startFrame + framesPerWorker, numFrames);

        // Slice inputSignal array to create a smaller chunk for this worker
        const chunk = inputSignal.slice(startFrame * hopSize, (endFrame - 1) * hopSize + windowSize);
        //console.log("CALL WORKER",i,"Chunk from",startFrame * hopSize,"to",(endFrame - 1) * hopSize + windowSize);

        // Create worker and send the chunk of inputSignal
        const worker = new Worker('./js/stftWorker.js');
        //worker.postMessage({ inputSignal: chunk, windowSize, hopSize, fftFactorLookup });

        // Convert chunk array to Float32Array (assuming it contains float values)
        const chunky = new Float32Array(chunk);

        // Construct the message object
        const message = {
            inputSignal: chunky.buffer, // Transfer ownership of the ArrayBuffer
            windowSize: windowSize,
            hopSize: hopSize,
            numFrames: numFrames,
            workerID: i,
            mode: mode
        };

        // Send the message to the worker
        worker.postMessage(message, [chunky.buffer]); // Transfer ownership of the ArrayBuffer

        // Listen for messages from the worker
        worker.onmessage = function (e) {
            const {id, chunk} = e.data;
            receivedChunks.push({id, chunk});

            // Increment the counter for finished workers
            numFinishedWorkers++;

            // Check if all workers have finished processing
            if (numFinishedWorkers === numWorkers) {
                // All workers have finished processing

                // Sort the spectrogram data based on the worker id
                receivedChunks.sort((a, b) => a.id - b.id);

                // Combine receivedChunks data into the final spectrogram array
                for (const { id, chunk } of receivedChunks) {
                    finalSpectrogram.push(...chunk);
                }

                // Now you can use the finalSpectrogram array
            }

            // Close the worker after it completes its work
            worker.terminate();
        };
    }


    // Return a promise that resolves when all workers finish processing
    return new Promise((resolve) => {
        const checkCompletion = () => {
            if(numFinishedWorkers === numWorkers) {
                //console.log("Spectrogram completed.");
                if (finalSpectrogram.length != numFrames) { console.error("Spectrogram not as long as expected"); }
                resolve(finalSpectrogram);
            } else {
                setTimeout(checkCompletion, 100); // Check again after a short delay
            }
        };
        checkCompletion(); // Start checking for completion
    });
}
*/





function STFTWithWebWorkers(inputSignal, windowSize, hopSize, mode, halfSpec) {
    return new Promise((resolve) => {
        const frames = Math.floor((inputSignal.length - windowSize) / hopSize) + 1;
        const spectrogram = new Array(frames); // Preallocate memory
        
        const processFrames = async () => {
            try {
                for (let i = 0; i <= frames; i++) {
                    const startIdx = i * hopSize;
                    const endIdx = startIdx + windowSize;
                    let frame = inputSignal.slice(startIdx, endIdx);
                    let windowedFrame = applyHanningWindow(frame);
                    const spectrum = fftReal512(windowedFrame);
                    // Assuming spectrum is the array containing the full spectrum obtained from FFT
                    const halfSpectrum = spectrum.slice(0, 512+2);
                    spectrogram[i] = halfSpectrum;
                    
                    /*
                    // Store the result in the spectrogram chunk
                    if(halfSpec){
                        //spectrogram[i] = halfSpectrum;
                    }else{
                        spectrogram[i] = spectrum.slice();
                    }*/

                    // Clear memory by reusing variables
                    frame = null;
                    windowedFrame = null;
                }

                // Resolve the promise with the final spectrogram
                resolve(spectrogram);
            } catch (error) {
                throw error;
            }
        };

        processFrames();
        
    });
}

function STFT_128(inputSignal, hopSize) {
    return new Promise((resolve) => {
        const frames = Math.floor((inputSignal.length - 128) / hopSize) + 1;
        const spectrogram = new Array(frames); // Preallocate memory
        
        const processFrames = async () => {
            try {
                for (let i = 0; i <= frames; i++) {
                    const startIdx = i * hopSize;
                    const endIdx = startIdx + 128;
                    let frame = inputSignal.slice(startIdx, endIdx);
                    let windowedFrame = applyHanningWindow(frame);
                    const spectrum = OINK.fftReal128(windowedFrame);
                    // Assuming spectrum is the array containing the full spectrum obtained from FFT
                    const halfSpectrum = spectrum.slice(0, 128+2);
                    spectrogram[i] = halfSpectrum;
                    // Clear memory by reusing variables
                    frame = null;
                    windowedFrame = null;
                }

                // Resolve the promise with the final spectrogram
                resolve(spectrogram);
            } catch (error) {
                throw error;
            }
        };

        processFrames();
        
    });
}

function STFT_256(inputSignal, hopSize) {
    return new Promise((resolve) => {
        const frames = Math.floor((inputSignal.length - 256) / hopSize) + 1;
        const spectrogram = new Array(frames); // Preallocate memory
        
        const processFrames = async () => {
            try {
                for (let i = 0; i <= frames; i++) {
                    const startIdx = i * hopSize;
                    const endIdx = startIdx + 256;
                    let frame = inputSignal.slice(startIdx, endIdx);
                    let windowedFrame = applyHanningWindow(frame);
                    const spectrum = OINK.fftReal256(windowedFrame);
                    // Assuming spectrum is the array containing the full spectrum obtained from FFT
                    const halfSpectrum = spectrum.slice(0, 256+2);
                    spectrogram[i] = halfSpectrum;
                    // Clear memory by reusing variables
                    frame = null;
                    windowedFrame = null;
                }

                // Resolve the promise with the final spectrogram
                resolve(spectrogram);
            } catch (error) {
                throw error;
            }
        };

        processFrames();
        
    });
}

function STFT_512(inputSignal, hopSize) {
    return new Promise((resolve) => {
        const frames = Math.floor((inputSignal.length - 512) / hopSize) + 1;
        const spectrogram = new Array(frames); // Preallocate memory
        
        const processFrames = async () => {
            try {
                for (let i = 0; i <= frames; i++) {
                    const startIdx = i * hopSize;
                    const endIdx = startIdx + 512;
                    let frame = inputSignal.slice(startIdx, endIdx);
                    let windowedFrame = applyHanningWindow(frame);
                    const spectrum = OINK.fftReal512(windowedFrame);
                    // Assuming spectrum is the array containing the full spectrum obtained from FFT
                    const halfSpectrum = spectrum.slice(0, 512+2);
                    spectrogram[i] = halfSpectrum;
                    // Clear memory by reusing variables
                    frame = null;
                    windowedFrame = null;
                }

                // Resolve the promise with the final spectrogram
                resolve(spectrogram);
            } catch (error) {
                throw error;
            }
        };

        processFrames();
        
    });
}

function STFT_1024(inputSignal, hopSize) {
    return new Promise((resolve) => {
        const frames = Math.floor((inputSignal.length - 1024) / hopSize) + 1;
        const spectrogram = new Array(frames); // Preallocate memory
        
        const processFrames = async () => {
            try {
                for (let i = 0; i <= frames; i++) {
                    const startIdx = i * hopSize;
                    const endIdx = startIdx + 1024;
                    let frame = inputSignal.slice(startIdx, endIdx);
                    let windowedFrame = applyHanningWindow(frame);

                    const spectrum = OINK.fftReal1024(windowedFrame);
                    // Assuming spectrum is the array containing the full spectrum obtained from FFT
                    const halfSpectrum = spectrum.slice(0, 1024+2);
                    spectrogram[i] = halfSpectrum;
                    // Clear memory by reusing variables
                    frame = null;
                    windowedFrame = null;
                }

                // Resolve the promise with the final spectrogram
                resolve(spectrogram);
            } catch (error) {
                throw error;
            }
        };

        processFrames();
        
    });
}

function STFT_2048(inputSignal, hopSize) {
    return new Promise((resolve) => {
        const frames = Math.floor((inputSignal.length - 2048) / hopSize) + 1;
        const spectrogram = new Array(frames); // Preallocate memory
        
        const processFrames = async () => {
            try {
                for (let i = 0; i <= frames; i++) {
                    const startIdx = i * hopSize;
                    const endIdx = startIdx + 2048;
                    let frame = inputSignal.slice(startIdx, endIdx);
                    let windowedFrame = applyHanningWindow(frame);

                    const spectrum = OINK.fftReal2048(windowedFrame);
                    // Assuming spectrum is the array containing the full spectrum obtained from FFT
                    const halfSpectrum = spectrum.slice(0, 2048+2);
                    spectrogram[i] = halfSpectrum;
                    // Clear memory by reusing variables
                    frame = null;
                    windowedFrame = null;
                }

                // Resolve the promise with the final spectrogram
                resolve(spectrogram);
            } catch (error) {
                throw error;
            }
        };

        processFrames();
        
    });
}



/*
// Function to perform Inverse Short-Time Fourier Transform (ISTFT) using Web Workers
function ISTFTWithWebWorkers(spectrogram, windowSize, hopSize, windowType, halfSpec) {
    const numFrames = spectrogram.length;
    const outputSignal = new Float32Array((numFrames - 1) * hopSize + windowSize);

    // Define the number of workers (you can adjust this based on performance testing)
    const numWorkers = NUM_WORKERS;

    // Calculate frames per worker
    const framesPerWorker = Math.ceil(numFrames / numWorkers);
    //console.log("Number of Frames", numFrames);
    //console.log("Frames per Worker", framesPerWorker);

    // Create and run workers
    const processingPromises = [];
    for (let i = 0; i < numWorkers; i++) {
        const startFrame = i * framesPerWorker;
        const endFrame = Math.min(startFrame + framesPerWorker, numFrames);

        // Slice spectrogram array to create a smaller chunk for this worker
        const chunk = spectrogram.slice(startFrame, endFrame);

        const flattenedChunk = chunk.flatMap(frame => frame.flatMap(spectrum => [spectrum.re, spectrum.im]) );
        // Convert the flattened array to a Float32Array
        const float32Array = new Float32Array(flattenedChunk);
        // Convert the Float32Array to an ArrayBuffer
        const arrayBuffer = float32Array.buffer;

        // Create worker and send the chunk of spectrogram
        const worker = new Worker('./js/istftWorker.js');

        // Construct the message object
        const message = {
            flattenedChunk: arrayBuffer,
            windowSize: windowSize,
            hopSize: hopSize,
            workerID: i,
            windowType: windowType,
            halfSpec: halfSpec
        };

        // Send the message to the worker
        worker.postMessage(message, [arrayBuffer]);

        // Push the promise for processing this chunk into the array
        processingPromises.push(new Promise((resolve, reject) => {
            // Listen for messages from the worker
            worker.onmessage = function (e) {
                const {id, buffer} = e.data;

                // Convert the ArrayBuffer back to a Float32Array
                const outputChunk = new Float32Array(buffer);
                // Copy the processed signal chunk to the output signal
                const startIdx = id * framesPerWorker * hopSize;
                outputSignal.set(outputChunk, startIdx);
                // Close the worker after it completes its work
                worker.terminate();
                resolve(); // Resolve the promise
            };
            // Listen for errors from the worker
            worker.onerror = function (error) {
                console.error('Error in worker:', error);
                reject(error); // Reject the promise
            };
        }));
    }

    // Return a promise that resolves when all workers finish processing
    return Promise.all(processingPromises).then(() => {
        //console.log("ISTFT completed.");
        return outputSignal;
    });
}
*/

// Apply synthesis window to the frame
const synthesisWindow_128 = hanningWindow(128);
// Function to perform Inverse Short-Time Fourier Transform (ISTFT) using Web Workers
function ISTFT_128(spectrogram, hopSize) {
        let spectra = spectrogram.length;
        const outputSignal = new Float32Array(spectra * hopSize);

        for (let i = 0; i < spectra; i++) {
            // Compute inverse FFT of the spectrum to obtain the frame in time domain
            let spectrum = spectrogram[i];
            let frame = OINK.IFFT128onHalf(spectrum);
            const weightedFrame = applySynthesisWindow(frame, synthesisWindow_128);
            // Overlap-add the weighted frame to the output signal
            const startIdx = i * hopSize;
            for (let j = 0; j < 128; j++) {
                // Check if there's no existing value at the current index in the output signal chunk
                if (!outputSignal[startIdx + j]) {
                    // If there's no existing value, initialize it with the value from the current frame
                    outputSignal[startIdx + j] = frame[j];
                } else {
                    outputSignal[startIdx + j] += weightedFrame[j];
                }
            }
        }

        // Normalize the output signal
        normalizeOutput(outputSignal);

        return outputSignal;
}


// Apply synthesis window to the frame
const synthesisWindow_256 = hanningWindow(256);
// Function to perform Inverse Short-Time Fourier Transform (ISTFT) using Web Workers
function ISTFT_256(spectrogram, hopSize) {
        let spectra = spectrogram.length;
        const outputSignal = new Float32Array(spectra * hopSize);

        for (let i = 0; i < spectra; i++) {
            // Compute inverse FFT of the spectrum to obtain the frame in time domain
            let spectrum = spectrogram[i];
            let frame = OINK.IFFT256onHalf(spectrum);
            const weightedFrame = applySynthesisWindow(frame, synthesisWindow_256);
            // Overlap-add the weighted frame to the output signal
            const startIdx = i * hopSize;
            for (let j = 0; j < 256; j++) {
                // Check if there's no existing value at the current index in the output signal chunk
                if (!outputSignal[startIdx + j]) {
                    // If there's no existing value, initialize it with the value from the current frame
                    outputSignal[startIdx + j] = frame[j];
                } else {
                    outputSignal[startIdx + j] += weightedFrame[j];
                }
            }
        }

        // Normalize the output signal
        normalizeOutput(outputSignal);

        return outputSignal;
}


// Apply synthesis window to the frame
const synthesisWindow_512 = hanningWindow(512);
// Function to perform Inverse Short-Time Fourier Transform (ISTFT) using Web Workers
function ISTFT_512(spectrogram, hopSize) {
        let spectra = spectrogram.length;
        const outputSignal = new Float32Array(spectra * hopSize);

        for (let i = 0; i < spectra; i++) {
            // Compute inverse FFT of the spectrum to obtain the frame in time domain
            let spectrum = spectrogram[i];
            let frame = OINK.IFFT512onHalf(spectrum);
            const weightedFrame = applySynthesisWindow(frame, synthesisWindow_512);
            // Overlap-add the weighted frame to the output signal
            const startIdx = i * hopSize;
            for (let j = 0; j < 512; j++) {
                // Check if there's no existing value at the current index in the output signal chunk
                if (!outputSignal[startIdx + j]) {
                    // If there's no existing value, initialize it with the value from the current frame
                    outputSignal[startIdx + j] = frame[j];
                } else {
                    outputSignal[startIdx + j] += weightedFrame[j];
                }
            }
        }

        // Normalize the output signal
        normalizeOutput(outputSignal);

        return outputSignal;
}


const synthesisWindow_1024 = hanningWindow(1024);
// Function to perform Inverse Short-Time Fourier Transform (ISTFT) using Web Workers
function ISTFT_1024(spectrogram, hopSize) {
        let spectra = spectrogram.length;
        const outputSignal = new Float32Array(spectra * hopSize);

        for (let i = 0; i < spectra; i++) {
            // Compute inverse FFT of the spectrum to obtain the frame in time domain
            let spectrum = spectrogram[i];
            let frame = OINK.IFFT1024onHalf(spectrum);
            const weightedFrame = applySynthesisWindow(frame, synthesisWindow_1024);
            // Overlap-add the weighted frame to the output signal
            const startIdx = i * hopSize;
            for (let j = 0; j < 1024; j++) {
                // Check if there's no existing value at the current index in the output signal chunk
                if (!outputSignal[startIdx + j]) {
                    // If there's no existing value, initialize it with the value from the current frame
                    outputSignal[startIdx + j] = frame[j];
                } else {
                    outputSignal[startIdx + j] += weightedFrame[j];
                }
            }
        }

        // Normalize the output signal
        normalizeOutput(outputSignal);

        return outputSignal;
}



const synthesisWindow_2048 = hanningWindow(2048);
// Function to perform Inverse Short-Time Fourier Transform (ISTFT) using Web Workers
function ISTFT_2048(spectrogram, hopSize) {
        let spectra = spectrogram.length;
        const outputSignal = new Float32Array(spectra * hopSize);

        for (let i = 0; i < spectra; i++) {
            // Compute inverse FFT of the spectrum to obtain the frame in time domain
            let spectrum = spectrogram[i];
            let frame = OINK.IFFT2048onHalf(spectrum);
            const weightedFrame = applySynthesisWindow(frame, synthesisWindow_2048);
            // Overlap-add the weighted frame to the output signal
            const startIdx = i * hopSize;
            for (let j = 0; j < 2048; j++) {
                // Check if there's no existing value at the current index in the output signal chunk
                if (!outputSignal[startIdx + j]) {
                    // If there's no existing value, initialize it with the value from the current frame
                    outputSignal[startIdx + j] = frame[j];
                } else {
                    outputSignal[startIdx + j] += weightedFrame[j];
                }
            }
        }

        // Normalize the output signal
        normalizeOutput(outputSignal);

        return outputSignal;
}









// Function to interpolate magnitudes between frames in the entire spectrogram
function interpolateMagnitudes(spectrogram, stretchFactor, interpolatedMagnitudes) {
    const numFrames = spectrogram.length;
    const numBins = spectrogram[0].length/2;

    
    let originalFrameIndex = 0;
    for (let i = 0; originalFrameIndex < numFrames; i++) {
        originalFrameIndex = i / stretchFactor;
        // Get the indices of the adjacent frames
        var frameIndex1 = Math.floor(originalFrameIndex);
        var frameIndex2 = Math.ceil(originalFrameIndex);

        // Handle edge cases where frameIndex2 exceeds the maximum index
        if (frameIndex2 >= numFrames) {
            frameIndex2 = numFrames - 1;
            frameIndex1 = numFrames - 2;
        }

        // Calculate the fraction between the two frames
        const fraction = originalFrameIndex - frameIndex1;

        const currentInterpolatedMagnitudes = new Float32Array(numBins);
        
        for (let j = 0; j < numBins; j++) {
            const magnitude1 = spectrogram[frameIndex1][j*2];
            const magnitude2 = spectrogram[frameIndex2][j*2];
            currentInterpolatedMagnitudes[j] = (1 - fraction) * magnitude1 + fraction * magnitude2;
        }

        // Store the interpolated magnitudes in the spectrogram
        //interpolatedMagnitudes[i] = currentInterpolatedMagnitudes.slice();
        interpolatedMagnitudes.push(currentInterpolatedMagnitudes.slice());
    }
}

// Function to synchronize phase values between frames in the entire spectrogram
function synchronizePhase(spectrogram, stretchFactor, synchronizedPhases) {
    const numFrames = spectrogram.length;
    const numBins = spectrogram[0].length/2;

    let originalFrameIndex = 0;
    for (let i = 0; originalFrameIndex < numFrames; i++) {
        originalFrameIndex = i / stretchFactor;
        // Get the indices of the adjacent frames
        var frameIndex1 = Math.floor(originalFrameIndex);
        var frameIndex2 = Math.ceil(originalFrameIndex);

        // Handle edge cases where frameIndex2 exceeds the maximum index
        if (frameIndex2 >= numFrames) {
            frameIndex2 = numFrames - 1;
            frameIndex1 = numFrames - 2;
        }

        // Calculate the fraction between the two frames
        const fraction = originalFrameIndex - frameIndex1;

        const currentSynchronizedPhases = new Float32Array(numBins);

        for (let j = 0; j < numBins; j++) {
            const phase1 = spectrogram[frameIndex1][j*2+1];
            const phase2 = spectrogram[frameIndex2][j*2+1];
            let phaseDiff = phase2 - phase1;

            // Wrap phase difference to [-π, π] range
            if (phaseDiff > Math.PI) {
                phaseDiff -= 2 * Math.PI;
            } else if (phaseDiff < -Math.PI) {
                phaseDiff += 2 * Math.PI;
            }

            currentSynchronizedPhases[j] = phase1 + fraction * phaseDiff;
        }

        // Store the synchronized phases in the synchronizedPhases array
        //synchronizedPhases[i] = currentSynchronizedPhases.slice();
        synchronizedPhases.push(currentSynchronizedPhases.slice());
    }
}

/*
function deepCopySpectrogram(preSpectrogram) {
    const spectrogramCopy = [];
    for (let i = 0; i < preSpectrogram.length; i++) {
        const frameCopy = [];
        for (let j = 0; j < preSpectrogram[i].length; j++) {
            frameCopy.push({...preSpectrogram[i][j]});
        }
        spectrogramCopy.push(frameCopy);
    }
    return spectrogramCopy;
}*/


// Function to stretch spectrogram
function stretchSpectrogram(preSpectrogram, stretchFactor) {
    // Make a deep copy of the preSpectrogram for modification
    const spectrogramCopy = preSpectrogram.map(frame => [...frame]);
    //const spectrogramCopy = deepCopySpectrogram(preSpectrogram);

    const interpolatedMagnitudes = [];
    const synchronizedPhases = [];

    interpolateMagnitudes(spectrogramCopy, stretchFactor, interpolatedMagnitudes);
    synchronizePhase(spectrogramCopy, stretchFactor, synchronizedPhases);

    if(interpolatedMagnitudes.length != synchronizedPhases.length){ throw Error("Spectograms don't match after stretching"); }
    var stretchedSpecLength = interpolatedMagnitudes.length;

    const stretchedSpectrogram = [];
    for (let i = 0; i < stretchedSpecLength; i++) {
        const frameWithMagnitudes = interpolatedMagnitudes[i];
        const frameWithPhases = synchronizedPhases[i];
        const frame = [];

        for (let j = 0; j < frameWithMagnitudes.length; j++) {
            //const pair = { re: frameWithMagnitudes[j], im: frameWithPhases[j] };
            frame.push(frameWithMagnitudes[j]);
            frame.push(frameWithPhases[j]);
        }

        stretchedSpectrogram.push(frame);
    }

    return stretchedSpectrogram;
}








// Function to apply time-domain smoothing to an audio signal
function applyTimeDomainSmoothing(inputSignal, hopSize) {
    const smoothedSignal = [];

    // Create a Hanning window for smoothing
    const smoothingWindow = createHanningWindow(hopSize);

    // Apply overlap-add with smoothing
    for (let i = 0; i < inputSignal.length; i++) {
        // Initialize the value at the current index in the smoothed signal
        smoothedSignal[i] = 0;

        // Apply overlap-add with smoothing and window
        for (let j = 0; j < hopSize; j++) {
            // Calculate the index in the input signal considering overlap
            const index = i - j; // Adjusted index calculation
            
            // Ensure the index is within the bounds of the input signal
            if (index >= 0 && index < inputSignal.length) {
                smoothedSignal[i] += inputSignal[index] * smoothingWindow[j];
            }
        }
    }
    return smoothedSignal;
}








function normalizeDBspectrogram(spectrogram) {
    const numFrames = spectrogram.length;
    const numBins   = spectrogram[0].length;

    // Find the minimum and maximum magnitude values in the spectrogram
    let minDB = Number.POSITIVE_INFINITY;
    let maxDB = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < numFrames; i++) {
        for (let j = 0; j < numBins; j++) {
            const dB = spectrogram[i][j];
            if (dB < minDB) {  minDB = dB;  }
            if (dB > maxDB) {  maxDB = dB;  }
        }
    }

    // Calculate the range of magnitudes
    const range = maxDB - minDB;

    // Normalize the magnitudes to the range [0, 1]
    const normalizedSpectrogram = [];
    if (range !== 0) {
        for (let i = 0; i < numFrames; i++) {
            const spectrum = [];
            for (let j = 0; j < numBins; j++) {
                const value = spectrogram[i][j];
                const normalized = (value - minDB) / range;
                spectrum.push(normalized);
            }
            normalizedSpectrogram.push(spectrum);
        }
    } else {
        for (let i = 0; i < numFrames; i++) {
            const spectrum = new Array(numBins).fill(0);
            normalizedSpectrogram.push(spectrum);
        }
    }

    //console.log(spectrogram, normalizedSpectrogram);


    return normalizedSpectrogram;
}


// Returns dB in form of negative values up to 0 (max)
function normalizeSpectrogramToDB(spectrogram, dBmin = -20) {
    const normalizedSpectrogram = [];

    // Iterate over each frame in the spectrogram
    for (const frame of spectrogram) {

        const framePower = [];
        for (let i = 0; i < frame.length; i += 2) {
            const re = frame[i];
            const im = frame[i + 1];
            const power = Math.abs(re * re + im * im);
            framePower.push(power);
        }
        //const framePower = frame.map(bin => Math.abs(bin.re * bin.re + bin.im * bin.im));

        const maxPower = Math.max(...framePower);
        const minDB = dBmin; // Set a minimum value for dB to avoid infinity or negative infinity
        const frameDB = [];

        // Check if maxPower is 0
        if (maxPower === 0) {
            // Handle the case where maxPower is 0
            // For example, you can set all dB values to a default value
            for (const power of framePower) {
                frameDB.push(minDB);
            }
        } else {
            // Convert power to dB for each bin in the frame
            for (const power of framePower) {
                const dB = 10 * Math.log10(power / maxPower);
                // Clip dB values to minDB to avoid infinity or negative infinity
                const clippedDB = Math.max(dB, minDB);
                frameDB.push(clippedDB);
            }
        }

        // Add the dB values for the frame to the normalized spectrogram
        normalizedSpectrogram.push(frameDB);
    }

    return normalizedSpectrogram;
}





// Define color map array with colors from black to white through a gradient of blue, violet, red, orange, yellow, and white
const colorMap = [
        [0, 0, 0],       // Black
        [0, 0, 255],     // Blue
        [138, 43, 226],  // Violet
        [255, 0, 0],     // Red
        [255, 165, 0],   // Orange
        [255, 255, 0],   // Yellow
        [255, 255, 255]  // White
];

function linearToMelody(frequency) {
    return 2595 * Math.log10(1 + frequency / 700);
}

function melodyToLinear(melody) {
    return 700 * (Math.pow(10, melody / 2595) - 1);
}

// Convert spectrogram data to image data with interpolated colors
function spectrogramToImageData(spectrogram) {
    // Assume spectrogram is a 2D array of magnitudes or intensities
    const numFrames = spectrogram.length;
    //const numBins = spectrogram[0].length / 2;  // Only need half the FFT size due to Nyquist theorem
    const numBins = spectrogram[0].length;

    // Create a new ImageData object with the same dimensions as the spectrogram
    var h = 1000; //16000;
    var w = Math.min(4000,numFrames);
    //var w = numFrames;
    const imageData = new ImageData(w, h);
    
    // Calculate the frequency range corresponding to each bin on a logarithmic scale
    const minFreq = 0; // Minimum frequency
    const maxFreq = 22050; // Maximum frequency (assuming audio sampled at 44100 Hz)
    const logMinFreq = Math.log(minFreq + 1); // Logarithm of the minimum frequency (avoiding log(0))
    const logMaxFreq = Math.log(maxFreq + 1); // Logarithm of the maximum frequency (avoiding log(0))
    const melMaxFreq = linearToMelody(maxFreq);

    // Convert spectrogram data to grayscale image data
    for (let x = 0; x < w; x++) {
        var i = Math.floor((x/(w-1))*(numFrames-1));
        if(i<0 || i>spectrogram.length-1){ console.error(i," in wrong range"); }
        var spectrum = spectrogram[i];
        if(spectrum == null){ console.error("no spectrum"); }
        for (let y = 0; y < h; y++) {
            // Calculate the frequency corresponding to the current row (on a logarithmic scale)
            //const logFreq = logMinFreq + (logMaxFreq - logMinFreq) * (y / h);
            
            const freq = melodyToLinear(melMaxFreq * (y / h));
            //console.log(melMaxFreq * (y / h), freq);
            //const freq = Math.exp(logFreq) - 1; // Convert back to linear scale
            // Find the closest bin index in the spectrogram for the current frequency
            const binIndex = Math.round((numBins - 1) * (freq - minFreq) / (maxFreq - minFreq));
            if(binIndex<0 || binIndex>numBins-1){ console.error(binIndex, "in wrong bin range [",numBins,"]"); }
            // Get the value from the spectrogram for the closest bin index
            var val = spectrum[binIndex];
            if(val<0 || val>1){ console.error(val, "in wrong intensity range"); }

            // Calculate the index in the image data array
            //const index = ((numBins - binIndex - 1) * numFrames + i) * 4; // Reverse
            const index = ((h - y - 1) * w + x) * 4; // Reverse

            var rgbColor;
            if(val != 0 && val != 1){
              const ci1 = Math.floor(val * (colorMap.length - 1));
              const ci2 = Math.ceil(val * (colorMap.length - 1));
              //console.log(freq, binIndex, val, ci1, ci2);
              const color1 = colorMap[ci1];
              const color2 = colorMap[ci2];
              const val1 = ci1 / (colorMap.length - 1);
              const val2 = ci2 / (colorMap.length - 1);
              const fraction = (val-val1)/(val2-val1);
              const interpolatedColor = interpolateColor(color1, color2, fraction);
              // Convert interpolated HSL color to RGB
              rgbColor = hslToRgb(interpolatedColor[0], interpolatedColor[1], interpolatedColor[2]);
            }else{
              rgbColor = colorMap[val * (colorMap.length - 1)];
            }

            imageData.data[index] = rgbColor[0];     // Red channel
            imageData.data[index + 1] = rgbColor[1]; // Green channel
            imageData.data[index + 2] = rgbColor[2]; // Blue channel
            imageData.data[index + 3] = 255;         // Alpha channel (fully opaque)
        }
    }

    return imageData;
}

// Function to interpolate between two colors
function interpolateColor(color1, color2, fraction) {
    const hsl1 = rgbToHsl(color1[0], color1[1], color1[2]);
    const hsl2 = rgbToHsl(color2[0], color2[1], color2[2]);

    // Handle hue wrapping
    var deltaHue = (hsl2[0] - hsl1[0] + 180) % 360 - 180;
    var h = (hsl1[0] + deltaHue * fraction + 360) % 360;

    // Interpolate saturation and lightness
    var s1 = hsl1[1];
    var s2 = hsl2[1];
    var s = interpolate(hsl1[1], hsl2[1], fraction);
    if(s2 == 0){  h = hsl1[0];  }  //If going to to greyscale, keep hue of source
    if(s1 == 0){  h = hsl2[0];  }  //If coming from greyscale, keep hue of target
    var l = interpolate(hsl1[2], hsl2[2], fraction);

    return [h, s, l];
}


// Function to interpolate between two values
function interpolate(value1, value2, fraction) {
    return value1 + fraction * (value2 - value1);
}

// Function to convert RGB color to HSL
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

// Function to convert HSL color to RGB
function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}







// Draw image data on canvas
function drawImageDataOnCanvas(imageData, canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match the image data dimensions
    canvas.width = imageData.width;
    canvas.height = imageData.height;

    // Clear canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the image data onto the canvas
    ctx.putImageData(imageData, 0, 0);
}








/*
function timeStretch(inputSignal, stretchFactor, windowSize, hopSize, smoothFactor, ch) {
    return Promise.resolve()
        .then(async () => {
            const startTime = performance.now();
            const spectrogram = await STFTWithWebWorkers(inputSignal, windowSize, hopSize, 1);
            const endTime = performance.now();
            const elapsedTime = endTime - startTime;
            console.log(`CH ${ch}: Calculating the Spectrogram: Elapsed time: ${elapsedTime} milliseconds`);
            return spectrogram;
        })
        .then(async (spectrogram) => {
            // Normalize Spectrogram
            const normalizedDBSpectrogram = normalizeSpectrogramToDB(spectrogram,-80);
            const normalizedSpectrogram = normalizeDBspectrogram(normalizedDBSpectrogram);
            //console.log(normalizedSpectrogram);
            // Convert spectrogram data to image data
            const imageData = spectrogramToImageData(normalizedSpectrogram);
            // Draw image data on canvas
            drawImageDataOnCanvas(imageData, "spectrogramA");

            const startTime = performance.now();
            const result = await stretchSpectrogram(spectrogram, stretchFactor)
            const endTime = performance.now();
            const elapsedTime = endTime - startTime;
            console.log(`CH ${ch}: Now Stretching the Spectrogram: Elapsed time: ${elapsedTime} milliseconds`);

            return result;
        })
        .then(async (stretchedSpectrogram) => {
            const startTime = performance.now();
            const result =  await ISTFTWithWebWorkers(stretchedSpectrogram, windowSize, hopSize);
            const endTime = performance.now();
            const elapsedTime = endTime - startTime;
            console.log(`CH ${ch}: Now Reconstructing the Audio Signal: Elapsed time: ${elapsedTime} milliseconds`);
            return result;
        })
        //.then((processedSignal) => {
        //    const smoothedSignal = applyTimeDomainSmoothing(processedSignal, hopSize*smoothFactor/32);
        //    console.log("Smoothing finished");
        //    return smoothedSignal;
        //})
        //.catch((error) => {
        //    console.error('Error:', error);
        //    return null; // or handle the error appropriately
        //});
}*/



async function timeStretch(inputSignal, stretchFactor, windowSize, windowType, hopSize, smoothFactor, halfSpec, ch) {
    try {
        const startTime1 = performance.now();
        let preSpectrogram; 
        if(windowSize == 128){   preSpectrogram = await STFT_128(inputSignal, hopSize); }
        if(windowSize == 256){   preSpectrogram = await STFT_256(inputSignal, hopSize); }
        if(windowSize == 512){   preSpectrogram = await STFT_512(inputSignal, hopSize); }
        if(windowSize == 1024){  preSpectrogram = await STFT_1024(inputSignal, hopSize); }
        if(windowSize == 2048){  preSpectrogram = await STFT_2048(inputSignal, hopSize); }

        const endTime1 = performance.now();

        const startTime2 = performance.now();
        const postSpectrogram = await stretchSpectrogram(preSpectrogram, stretchFactor);
        const endTime2 = performance.now();

        const startTime3 = performance.now();
        let processedSignal;
        if(windowSize == 128){   processedSignal = await ISTFT_128(postSpectrogram, hopSize); }
        if(windowSize == 256){   processedSignal = await ISTFT_256(postSpectrogram, hopSize); }
        if(windowSize == 512){   processedSignal = await ISTFT_512(postSpectrogram, hopSize); }
        if(windowSize == 1024){  processedSignal = await ISTFT_1024(postSpectrogram, hopSize); }
        if(windowSize == 2048){  processedSignal = await ISTFT_2048(postSpectrogram, hopSize); }
        const endTime3 = performance.now();
        
        if(ch == 0){
            console.log(`CH ${ch}: Calculating the Spectrogram: Elapsed time: ${endTime1 - startTime1} milliseconds`);
            console.log(`CH ${ch}: Now Stretching the Spectrogram: Elapsed time: ${endTime2 - startTime2} milliseconds`);
            console.log(`CH ${ch}: Now Reconstructing the Audio Signal: Elapsed time: ${endTime3 - startTime3} milliseconds`);
        }

        return {processedSignal, preSpectrogram, postSpectrogram};
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}










function plotSpectrogram(spectrogramA,spectrogramB){
    
    const startTimeD = performance.now();
    
    try{
        // SPECTROGRAM A
        const normalizedDBSpectrogramA = normalizeSpectrogramToDB(spectrogramA, -80);
        const normalizedSpectrogramA = normalizeDBspectrogram(normalizedDBSpectrogramA);
        const imageDataA = spectrogramToImageData(normalizedSpectrogramA);
        // SPECTROGRAM B
        const normalizedDBSpectrogramB = normalizeSpectrogramToDB(spectrogramB, -80);
        const normalizedSpectrogramB = normalizeDBspectrogram(normalizedDBSpectrogramB);
        const imageDataB = spectrogramToImageData(normalizedSpectrogramB);

        drawImageDataOnCanvas(imageDataA, "spectrogramA");
        drawImageDataOnCanvas(imageDataB, "spectrogramB");
    }catch(e){
        console.error(e);
    }

    const endTimeD = performance.now();
    console.log(`Plotting the Spectrogram: Elapsed time: ${endTimeD - startTimeD} milliseconds`); 
     
}




// windowSize = 512, hopSize = windowSize / 4
// Is pretty good for beats and if the signal is compressed, but the freqs will be quite wrong

// FOR COMPRESSING: 
// windowSize = 512*4, hopSize = windowSize / 8
async function phaseVocoder(audioContext, inputBuffer, stretchFactor, windowSize=1024, hopFactor=4, smoothFactor=1, windowType=0, halfSpec = false) {
    //For beats with a clear BPM, where the goal is to preserve rhythmic structure and transient characteristics, 
    //it's often beneficial to prioritize temporal resolution over frequency resolution. 
    //In this case, using a smaller window size in the Short-Time Fourier Transform (STFT) analysis would be more suitable. 
    //A smaller window size allows for better time localization, 
    //capturing the transient features and rhythmic nuances of the beats more accurately.

    //const hopSize = windowSize / 1; // 100% overlap
    //const hopSize = windowSize / 2; // 50% overlap
    //const hopSize = windowSize / 4; // 25% overlap
    //const hopSize = windowSize / 8; // 12.5% overlap
    const hopSize = windowSize / hopFactor; // 12.5% overlap
    //Low Hop Size (High Overlap):
    //Advantages:
    //    Higher temporal resolution: Lower hop sizes result in more overlap between consecutive windows, 
    //    providing better time resolution in the analysis.
    //    Smoother spectral representation: Increased overlap can lead to smoother spectrograms, 
    //    which may be desirable for certain applications such as audio synthesis or time-stretching.
    //Disadvantages:
    //    Increased computational complexity: More overlap means more computations per time step, 
    //    which can increase the computational cost of the analysis.
    //    Potential spectral leakage: Higher overlap can exacerbate spectral leakage effects, 
    //    especially with certain window functions, potentially affecting frequency resolution.


    // Create a new AudioBuffer with the same properties as the original one
    const copyBuffer = audioContext.createBuffer(
       inputBuffer.numberOfChannels,
       inputBuffer.length,
       inputBuffer.sampleRate
    );

    console.log("SAMPLE RATE: ",inputBuffer.sampleRate);

    // Copy the data from the original buffer to the new one
    for (let channel = 0; channel < inputBuffer.numberOfChannels; channel++) {
       const channelData = inputBuffer.getChannelData(channel);
       copyBuffer.copyToChannel(channelData.slice(), channel);
    }


    const numChannels = copyBuffer.numberOfChannels;
    const inputLength = copyBuffer.length;
    const resampledLength = Math.ceil(inputLength * stretchFactor);
    const resampledBuffer = audioContext.createBuffer(numChannels, resampledLength, audioContext.sampleRate);

    // Array to store promises for each channel processing
    const processingPromises = [];

    let spectrogramA = [];
    let spectrogramB = [];
    
    // Record the start time
    const startTime = performance.now();

    // Process inputBuffer frame by frame for each channel
    for (let ch = 0; ch < numChannels; ch++) {
        const inputData = new Float32Array(copyBuffer.getChannelData(ch));
        // SEQUENCIALLY
        /*let spectrogram = await processChannel(audioContext, inputData, outputBuffer, ch, stretchFactor, windowSize, hopSize, smoothFactor);
        if(ch == 0){ spectrogramA = spectrogram; }
        if(ch == 1){ spectrogramB = spectrogram; }*/
        
        // PARALLEL 
        // Push the promise for processing this channel into the array
        processingPromises.push(
            processChannel(audioContext, inputData, resampledBuffer, ch, stretchFactor, windowSize, hopSize, smoothFactor, windowType, halfSpec)
            .then(spectrogram => {
                if (ch === 0) { spectrogramA = spectrogram; }
                if (ch === 1) { spectrogramB = spectrogram; }
            })
            .catch(error => {
                // Handle errors if needed
                console.error("Error processing channel:", error);
            })
        );
    }

    // Wait for all promises to resolve
    await Promise.all(processingPromises);

    // Record the end time
    const endTime = performance.now();
    // Calculate the elapsed time
    const elapsedTime = endTime - startTime;
    // Output the elapsed time
    console.log(`PhaseVocoder: Elapsed time: ${elapsedTime} milliseconds`);

    // All channels processed, return the output buffer
    return {resampledBuffer, spectrogramA, spectrogramB};
}

async function processChannel(audioContext, inputData, outputBuffer, ch, stretchFactor, windowSize, hopSize, smoothFactor, windowType, halfSpec) {
    // Time-stretch the input data
    const startTimeCH = performance.now();

    const {processedSignal, preSpectrogram, postSpectrogram} = await timeStretch(inputData, stretchFactor, windowSize, windowType, hopSize, smoothFactor, halfSpec, ch);
    const processedSignalFloat32 = new Float32Array(processedSignal);  // Convert processedSignal to Float32Array if necessary
    
    const endTimeCH = performance.now();
    const elapsedTimeCH = endTimeCH - startTimeCH;
    //console.log(`TimeStretch: CH ${ch} Elapsed time: ${elapsedTimeCH} milliseconds`);

    // Copy the processed signal to the output buffer
    outputBuffer.copyToChannel(processedSignalFloat32, ch);

    return postSpectrogram;
}


























/*



// Function to perform sinusoidal spectral modeling for time stretching
function timeStretchSpectralModeling(inputSignal, stretchFactor, windowSize, hopSize) {
    // Perform STFT on the input signal
    const spectrogram = STFT(inputSignal, windowSize, hopSize);
    
    // Extract peaks from the spectrogram
    const peaks = extractPeaks(spectrogram);
    
    // Create sinusoidal tracks from the peaks
    const tracks = createTracks(peaks);
    
    // Resynthesize the tracks at the desired time scale
    const resynthesizedSignal = resynthesizeTracks(tracks, stretchFactor, hopSize);
    
    return resynthesizedSignal;
}

// Function to extract peaks from the spectrogram
function extractPeaks(spectrogram) {
    // Implement peak detection algorithm (e.g., finding local maxima)
    // Return an array of peak frequencies and magnitudes
    // For simplicity, we'll just return an empty array in this example
    return [];
}

// Function to create sinusoidal tracks from the peaks
function createTracks(peaks) {
    // Implement track creation algorithm (e.g., connecting adjacent peaks)
    // Return an array of sinusoidal tracks
    // For simplicity, we'll just return an empty array in this example
    return [];
}

// Function to resynthesize tracks at the desired time scale
function resynthesizeTracks(tracks, stretchFactor, hopSize) {
    // Implement track resynthesis algorithm (e.g., time-scaling and overlap-add)
    // Return the resynthesized signal
    // For simplicity, we'll just return an empty array in this example
    return [];
}

// Example usage
const inputSignal = []; // Your input audio signal
const stretchFactor = 1.5; // Desired time stretch factor
const windowSize = 512; // Size of the analysis window
const hopSize = windowSize / 2; // 50% overlap

const resynthesizedSignal = timeStretchSpectralModeling(inputSignal, stretchFactor, windowSize, hopSize);

*/

export { phaseVocoder, plotSpectrogram };


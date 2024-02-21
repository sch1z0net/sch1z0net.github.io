const NUM_WORKERS = 4;
const maxWorkers = navigator.hardwareConcurrency || 1; // Fallback to 1 if hardwareConcurrency is not available
console.log("Maximum number of workers:", maxWorkers);
console.log("Current workers:", NUM_WORKERS);


// Precalculate FFT lookup table
const maxSampleLength = 60 * 44100; // 60 seconds at 44100 Hz sample rate
const fftFactorLookup = generateFFTFactorLookup(maxSampleLength);
console.log("PRECALCULATED FFT LOOKUP TABLE", fftFactorLookup);


// Function to perform Short-Time Fourier Transform (STFT) using Web Workers
function STFTWithWebWorkers(inputSignal, windowSize, hopSize) {
    const numFrames = Math.floor((inputSignal.length - windowSize) / hopSize) + 1;
    const spectrogram = [];

    // Define the number of workers (you can adjust this based on performance testing)
    const numWorkers = NUM_WORKERS;

    // Calculate frames per worker
    const framesPerWorker = Math.ceil(numFrames / numWorkers);
    //console.log("Input Signal Length",inputSignal.length);
    //console.log("Number of Frames", numFrames);
    //console.log("Frames per Worker", framesPerWorker);

    // Create and run workers
    for (let i = 0; i < numWorkers; i++) {
        const startFrame = i * framesPerWorker;
        const endFrame = Math.min(startFrame + framesPerWorker, numFrames);

        // Slice inputSignal array to create a smaller chunk for this worker
        const chunk = inputSignal.slice(startFrame * hopSize, (endFrame - 1) * hopSize + windowSize);

        // Create worker and send the chunk of inputSignal
        const worker = new Worker('./js/stftWorker.js');
        //worker.postMessage({ inputSignal: chunk, windowSize, hopSize, fftFactorLookup });

        // Convert chunk array to Float32Array (assuming it contains float values)
        const chunky = new Float32Array(chunk);
        //const lookup = new Float32Array(fftFactorLookup);

        // Construct the message object
        const message = {
            inputSignal: chunky.buffer, // Transfer ownership of the ArrayBuffer
            windowSize: windowSize,
            hopSize: hopSize,
            numFrames: numFrames,
            workerID: i
            //fftFactorLookup: lookup.buffer // Transfer ownership of the ArrayBuffer
        };

        // Send the message to the worker
        worker.postMessage(message, [chunky.buffer/*, lookup.buffer*/]); // Transfer ownership of the ArrayBuffer


        // Listen for messages from the worker
        worker.onmessage = function (e) {
            //console.log( "WORKER finished." )
            const workerSpectrogram = e.data;
            spectrogram.push(...workerSpectrogram);

            // Close the worker after it completes its work
            worker.terminate();
        };


    }

    // Return a promise that resolves when all workers finish processing
    return new Promise((resolve) => {
        const checkCompletion = () => {
            if (spectrogram.length === numFrames) {
                //console.log("Spectrogram completed.");
                resolve(spectrogram);
            } else {
                setTimeout(checkCompletion, 100); // Check again after a short delay
            }
        };
        checkCompletion(); // Start checking for completion
    });
}




// Function to perform Inverse Short-Time Fourier Transform (ISTFT) using Web Workers
function ISTFTWithWebWorkers(spectrogram, windowSize, hopSize) {
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

        // Create worker and send the chunk of spectrogram
        const worker = new Worker('./js/istftWorker.js');

        // Construct the message object
        const message = {
            spectrogramChunk: chunk,
            windowSize: windowSize,
            hopSize: hopSize,
            workerID: i
        };

        // Send the message to the worker
        worker.postMessage(message);

        // Push the promise for processing this chunk into the array
        processingPromises.push(new Promise((resolve, reject) => {
            // Listen for messages from the worker
            worker.onmessage = function (e) {
                const outputSignalChunk = e.data;
                // Copy the processed signal chunk to the output signal
                const startIdx = startFrame * hopSize;
                outputSignal.set(outputSignalChunk, startIdx);
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














// Function to interpolate magnitudes between frames in the entire spectrogram
function interpolateMagnitudes(spectrogram, stretchFactor, interpolatedMagnitudes) {
    const numFrames = spectrogram.length;
    const numBins = spectrogram[0].length;

    for (let i = 0; i < numFrames; i++) {
        const originalFrameIndex = i / stretchFactor;
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
            const magnitude1 = spectrogram[frameIndex1][j].re;
            const magnitude2 = spectrogram[frameIndex2][j].re;
            currentInterpolatedMagnitudes[j] = (1 - fraction) * magnitude1 + fraction * magnitude2;
        }

        // Store the interpolated magnitudes in the spectrogram
        interpolatedMagnitudes[i] = currentInterpolatedMagnitudes.slice();
    }

    return spectrogram;
}

// Function to synchronize phase values between frames in the entire spectrogram
function synchronizePhase(spectrogram, stretchFactor, synchronizedPhases) {
    const numFrames = spectrogram.length;
    const numBins = spectrogram[0].length;

    for (let i = 0; i < numFrames; i++) {
        const originalFrameIndex = i / stretchFactor;
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
            const phase1 = spectrogram[frameIndex1][j].im;
            const phase2 = spectrogram[frameIndex2][j].im;
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
        synchronizedPhases[i] = currentSynchronizedPhases.slice();
    }

    // Update the spectrogram with the synchronized phases
    for (let i = 0; i < numFrames; i++) {
        for (let j = 0; j < numBins; j++) {
            spectrogram[i][j].im = synchronizedPhases[i][j];
        }
    }

    return spectrogram;
}




// Function to stretch spectrogram
function stretchSpectrogram(spectrogram, stretchFactor) {
    const interpolatedMagnitudes = [];
    const synchronizedPhases = [];

    interpolateMagnitudes(spectrogram, stretchFactor, interpolatedMagnitudes);
    synchronizePhase(spectrogram, stretchFactor, synchronizedPhases);

    const stretchedSpectrogram = [];
    for (let i = 0; i < spectrogram.length; i++) {
        const frameWithMagnitudes = interpolatedMagnitudes[i];
        const frameWithPhases = synchronizedPhases[i];
        const frameWithPairs = [];

        for (let j = 0; j < frameWithMagnitudes.length; j++) {
            const pair = { re: frameWithMagnitudes[j], im: frameWithPhases[j] };
            frameWithPairs.push(pair);
        }

        stretchedSpectrogram.push(frameWithPairs);
    }

    return stretchedSpectrogram;
}









function timeStretch(inputSignal, stretchFactor, windowSize, hopSize) {
    return Promise.resolve()
        .then(async () => {
            const startTime = performance.now();
            const result = await STFTWithWebWorkers(inputSignal, windowSize, hopSize);
            const endTime = performance.now();
            const elapsedTime = endTime - startTime;
            console.log(`Calculating the Spectrogram: Elapsed time: ${elapsedTime} milliseconds`);
            return result;
        })
        .then(async (spectrogram) => {
            const startTime = performance.now();
            const result = await stretchSpectrogram(spectrogram, stretchFactor)
            const endTime = performance.now();
            const elapsedTime = endTime - startTime;
            console.log(`Now Stretching the Spectrogram: Elapsed time: ${elapsedTime} milliseconds`);
            return result;
        })
        .then(async (stretchedSpectrogram) => {
            const startTime = performance.now();
            const result =  await ISTFTWithWebWorkers(stretchedSpectrogram, windowSize, hopSize);
            const endTime = performance.now();
            const elapsedTime = endTime - startTime;
            console.log(`Now Reconstructing the Audio Signal: Elapsed time: ${elapsedTime} milliseconds`);
            return result;
        })
        .then((processedSignal) => {
            console.log("Reconstruction finished");
            return processedSignal;
        })
        .catch((error) => {
            console.error('Error:', error);
            return null; // or handle the error appropriately
        });
}





// windowSize = 512, hopSize = windowSize / 4
// Is pretty good for beats and if the signal is compressed, but the freqs will be quite wrong

// FOR COMPRESSING: 
// windowSize = 512*4, hopSize = windowSize / 8
async function phaseVocoder(audioContext, inputBuffer, stretchFactor) {
    const windowSize = 512 * 4; // Size of the analysis window
    //For beats with a clear BPM, where the goal is to preserve rhythmic structure and transient characteristics, 
    //it's often beneficial to prioritize temporal resolution over frequency resolution. 
    //In this case, using a smaller window size in the Short-Time Fourier Transform (STFT) analysis would be more suitable. 
    //A smaller window size allows for better time localization, 
    //capturing the transient features and rhythmic nuances of the beats more accurately.


    //const hopSize = windowSize / 2; // 50% overlap
    const hopSize = windowSize / 4; // 25% overlap
    //const hopSize = windowSize / 8; // 12.5% overlap
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



    const numChannels = inputBuffer.numberOfChannels;
    const inputLength = inputBuffer.length;
    const outputLength = Math.ceil(inputLength * stretchFactor);
    const outputBuffer = audioContext.createBuffer(numChannels, outputLength, audioContext.sampleRate);

    // Array to store promises for each channel processing
    const processingPromises = [];

    
    // Record the start time
    const startTime = performance.now();

    // Process inputBuffer frame by frame for each channel
    for (let ch = 0; ch < numChannels; ch++) {
        const inputData = inputBuffer.getChannelData(ch);
        // Push the promise for processing this channel into the array
        processingPromises.push(processChannel(audioContext, inputData, outputBuffer, ch, stretchFactor, windowSize, hopSize));
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
    return outputBuffer;
}

async function processChannel(audioContext, inputData, outputBuffer, ch, stretchFactor, windowSize, hopSize) {
    // Time-stretch the input data
    console.log("TimeStretching the Input Channel", ch);
    const processedSignal = await timeStretch(inputData, stretchFactor, windowSize, hopSize);
    // Convert processedSignal to Float32Array if necessary
    const processedSignalFloat32 = new Float32Array(processedSignal);
    console.log("Ready Processed Input Channel", ch);

    // Copy the processed signal to the output buffer
    outputBuffer.copyToChannel(processedSignalFloat32, ch);
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



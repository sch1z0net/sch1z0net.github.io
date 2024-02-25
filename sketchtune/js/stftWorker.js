importScripts('./fft.js');




/****** SOLUTION 1: SEQUENCE ********/


// Function to perform Short-Time Fourier Transform (STFT)
function STFT_1(inputSignalChunk, windowSize, hopSize, numFrames) {
    return new Promise((resolve, reject) => {
        const frames = Math.floor((inputSignalChunk.length - windowSize) / hopSize) + 1;
        
        const spectrogramChunk = [];
        // Process each frame in the chunk asynchronously
        const processFrames = async () => {
            try {
                var frames = inputSignalChunk.length - windowSize;
                for (let i = 0; i <= inputSignalChunk.length - windowSize; i += hopSize) {
                    const frame = inputSignalChunk.slice(i, i + windowSize);
                    const windowedFrame = applyHanningWindow(frame);
                    const spectrum = computeFFT(windowedFrame,i,frames); // Assuming computeFFT has an asynchronous version
                    spectrogramChunk.push(spectrum);
                }
                resolve(spectrogramChunk);
            } catch (error) {
                reject(error);
            }
        };

        processFrames();     
    });
}



/****** SOLUTION 2: CONCURRENCY ********/


// Function to perform Short-Time Fourier Transform (STFT)
function STFT_2(inputSignalChunk, windowSize, hopSize, numFrames, halfSpec) {
    return new Promise((resolve, reject) => {
        var frames = (inputSignalChunk.length - windowSize)/hopSize;
        const spectrogramChunk = new Array(frames); // Preallocate memory

        // Array to hold promises for each computation
        const computationPromises = [];

        
        //  PARALLEL
        /*
        const processFrames = async () => {
            try {
                for (let i = 0; i <= frames; i++) {
                    const startIdx = i * hopSize;
                    const endIdx = startIdx + windowSize;
                    const frame = inputSignalChunk.slice(startIdx, endIdx);
                    const windowedFrame = applyHanningWindow(frame);

                    // Create a promise for each computation
                    const spectrumPromise = computeFFTasync(windowedFrame, i, frames);
                    
                    // Push the promise into the array
                    computationPromises.push(spectrumPromise.then(spectrum => {
                        //console.log("SPECTROGRAM CHUNK",i);
                        spectrogramChunk[i] = spectrum; // Store the result
                    }));
                }

                // Wait for all promises to resolve
                await Promise.all(computationPromises);

                resolve(spectrogramChunk);
            } catch (error) {
                reject(error);
            }
        };*/
        

        //  SEQUENCIALLY
        const processFrames = async () => {
            try {
                for (let i = 0; i <= frames; i++) {
                    const startIdx = i * hopSize;
                    const endIdx = startIdx + windowSize;
                    let frame = inputSignalChunk.slice(startIdx, endIdx);
                    let windowedFrame = applyHanningWindow(frame);
                    const spectrum = computeFFT(windowedFrame, i, frames);
                    // Assuming spectrum is the array containing the full spectrum obtained from FFT
                    const halfSpectrum = spectrum.slice(0, spectrum.length / 2);

                    // Store the result in the spectrogram chunk
                    if(halfSpec){
                        spectrogramChunk[i] = halfSpectrum;
                    }else{
                        spectrogramChunk[i] = spectrum;
                    }
                    

                    // Clear memory by reusing variables
                    frame = null;
                    windowedFrame = null;
                }

                resolve(spectrogramChunk);
            } catch (error) {
                throw error;
            }
        };


        processFrames();
    });
}



/****** SOLUTION 3: BATCHING ********/



// Function to perform Short-Time Fourier Transform (STFT) with batch processing
function STFT_3(inputSignalChunk, windowSize, hopSize) {
    return new Promise((resolve, reject) => {
        const frames = Math.floor((inputSignalChunk.length - windowSize) / hopSize) + 1;
        const spectrogramChunk = new Array(frames); // Preallocate memory

        // Array to hold promises for each batch of computations
        const batchPromises = [];

        const processBatch = async (startFrame, endFrame) => {
            try {
                // Process each frame in the batch concurrently
                const batchComputationPromises = [];
                for (let i = startFrame; i < endFrame; i++) {
                    const startIdx = i * hopSize;
                    const endIdx = startIdx + windowSize;
                    const frame = inputSignalChunk.slice(startIdx, endIdx);
                    const windowedFrame = applyHanningWindow(frame);

                    // Create a promise for each computation
                    const spectrumPromise = computeFFT(windowedFrame, i, frames);
                    batchComputationPromises.push(spectrumPromise);
                }

                // Wait for all promises in the batch to resolve
                const batchResults = await Promise.all(batchComputationPromises);

                // Store the results in the spectrogram chunk
                for (let i = startFrame; i < endFrame; i++) {
                    spectrogramChunk[i] = batchResults[i - startFrame];
                }
            } catch (error) {
                reject(error);
            }
        };

        // Define the batch size (adjust as needed)
        //console.log("Frames:",frames);
        const batchSize = Math.floor(frames/4);
        //console.log("STFT: Batch Size",batchSize);

        // Process batches of frames concurrently
        for (let i = 0; i < frames; i += batchSize) {
            const startFrame = i;
            const endFrame = Math.min(i + batchSize, frames);
            batchPromises.push(processBatch(startFrame, endFrame));
        }

        // Wait for all batch promises to resolve
        Promise.all(batchPromises)
            .then(() => {
                resolve(spectrogramChunk);
            })
            .catch((error) => {
                reject(error);
            });
    });
}



function STFT(chunk, windowSize, hopSize, numFrames, mode, halfSpec){
    //if(mode==0){ return STFT_1(chunk, windowSize, hopSize, numFrames); }
    if(mode==1){ return STFT_2(chunk, windowSize, hopSize, numFrames, halfSpec); }
    //if(mode==2){ return STFT_3(chunk, windowSize, hopSize, numFrames); }
}



// Listen for messages from the main thread
onmessage = function (e) {
    const startTime = performance.now();

    const { inputSignal, windowSize, hopSize, numFrames, workerID, mode, halfSpec } = e.data;

    // Convert back
    const chunk = new Float32Array(inputSignal);

    STFT(chunk, windowSize, hopSize, numFrames, mode, halfSpec)
        .then((spectrogramChunk) => {
            const flattenedChunk = spectrogramChunk.flatMap(frame => frame.flatMap(spectrum => [spectrum.re, spectrum.im]) );
            // Convert the flattened array to a Float32Array
            const float32Array = new Float32Array(flattenedChunk);
            // Convert the Float32Array to an ArrayBuffer
            const arrayBuffer = float32Array.buffer;
            // Send the ArrayBuffer back to the main thread, transferring ownership
            postMessage({ id: workerID, buffer: arrayBuffer }, [arrayBuffer]);

            const endTime = performance.now();
            const elapsedTime = endTime - startTime;
            if(workerID == 0){
                console.log("Worker ", workerID, " finished in", elapsedTime, "ms");
            }
        })
        .catch((error) => {
            console.log("WORKER", workerID, 'Error:', error);
            // Optionally, handle the error and send back an error message to the main thread
        });
};



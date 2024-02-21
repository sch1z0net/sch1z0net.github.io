importScripts('./fft.js');

/*
// Function to perform Short-Time Fourier Transform (STFT)
function STFT(inputSignalChunk, windowSize, hopSize, numFrames, workerID) {
    return new Promise((resolve, reject) => {
        const spectrogramChunk = [];
        
        // Process each frame in the chunk asynchronously
        const processFrames = async () => {
            try {
                console.log("WORKER",workerID,"STFT on Chunk with length",inputSignalChunk.length);
                var frames = (inputSignalChunk.length - windowSize)/hopSize;
                for (let i = 0; i <= frames; i += 1) {
                    const frame = inputSignalChunk.slice(i*hopSize, i*hopSize + windowSize);
                    const windowedFrame = applyHanningWindow(frame);
                    //console.log("WORKER: process Frame",windowedFrame);
                    const spectrum = await computeFFT(windowedFrame, i, frames); // Assuming computeFFT has an asynchronous version
                    //console.log("WORKER",workerID,"push Frame to Spectrum [",i,"/",(inputSignalChunk.length - windowSize)/hopSize,"]");
                    spectrogramChunk.push(spectrum);
                }
                //console.log("WORKER",workerID,"resolve Spectrogram Chunk");
                resolve(spectrogramChunk);
            } catch (error) {
                reject(error);
            }
        };

        processFrames();
    }
}
*/

/*
// Function to perform Short-Time Fourier Transform (STFT)
function STFT(inputSignalChunk, windowSize, hopSize, numFrames) {
    return new Promise((resolve, reject) => {
        var frames = (inputSignalChunk.length - windowSize)/hopSize;
        
        const spectrogramChunk = [];
        // Process each frame in the chunk asynchronously
        const processFrames = async () => {
            try {
                var frames = inputSignalChunk.length - windowSize;
                for (let i = 0; i <= inputSignalChunk.length - windowSize; i += hopSize) {
                    const frame = inputSignalChunk.slice(i, i + windowSize);
                    const windowedFrame = applyHanningWindow(frame);
                    const spectrum = await computeFFT(windowedFrame,i,frames); // Assuming computeFFT has an asynchronous version
                    spectrogramChunk.push(spectrum);
                }
                resolve(spectrogramChunk);
            } catch (error) {
                reject(error);
            }
        };

        processFrames();     
    });
}*/


/*
// Function to perform Short-Time Fourier Transform (STFT)
function STFT(inputSignalChunk, windowSize, hopSize, numFrames) {
    return new Promise((resolve, reject) => {
        var frames = (inputSignalChunk.length - windowSize)/hopSize;
        const spectrogramChunk = new Array(frames); // Preallocate memory

        // Array to hold promises for each computation
        const computationPromises = [];

        const processFrames = async () => {
            try {
                for (let i = 0; i <= frames; i++) {
                    const startIdx = i * hopSize;
                    const endIdx = startIdx + windowSize;
                    const frame = inputSignalChunk.slice(startIdx, endIdx);
                    const windowedFrame = applyHanningWindow(frame);

                    // Create a promise for each computation
                    const spectrumPromise = computeFFT(windowedFrame, i, frames);
                    
                    // Push the promise into the array
                    computationPromises.push(spectrumPromise.then(spectrum => {
                        spectrogramChunk[i] = spectrum; // Store the result
                    }));
                }

                // Wait for all promises to resolve
                await Promise.all(computationPromises);

                resolve(spectrogramChunk);
            } catch (error) {
                reject(error);
            }
        };

        processFrames();
    });
}*/







// Function to perform Short-Time Fourier Transform (STFT) with batch processing
function STFT(inputSignalChunk, windowSize, hopSize) {
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
        const batchSize = 10;

        // Process batches of frames concurrently
        for (let i = 0; i < frames; i += batchSize) {
            const startFrame = i;
            const endFrame = Math.min(i + batchSize, frames);
            batchPromises.push(processBatch(startFrame, endFrame));
        }

        // Wait for all batch promises to resolve
        Promise.all(batchPromises)
            .then(() => {
                //console.log(spectrogramChunk);
                resolve(spectrogramChunk);
            })
            .catch((error) => {
                reject(error);
            });
    });
}






// Listen for messages from the main thread
onmessage = function (e) {
    const { inputSignal, windowSize, hopSize, numFrames, workerID } = e.data;

    console.log("WORKER",workerID,"received message.")
    // Convert back
    const chunk = new Float32Array(inputSignal);

    STFT(chunk, windowSize, hopSize, numFrames)
        .then((spectrogramChunk) => {
            // Send the result back to the main thread
            console.log("WORKER",workerID,"Spectrogram on Chunk ready");
            postMessage(spectrogramChunk);
        })
        .catch((error) => {
            console.log("WORKER",workerID,'Error:', error);
            // Optionally, handle the error and send back an error message to the main thread
        });
};

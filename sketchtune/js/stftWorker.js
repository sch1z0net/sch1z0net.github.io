importScripts('./fft.js');

// Function to perform Short-Time Fourier Transform (STFT)
function STFT(inputSignalChunk, windowSize, hopSize, workerID) {
    return new Promise((resolve, reject) => {
        const spectrogramChunk = [];
        
        // Process each frame in the chunk asynchronously
        const processFrames = async () => {
            try {
                //console.log("WORKER",workerID,"STFT on Chunk with length",inputSignalChunk.length);
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



/*
function STFT(inputSignalChunk, windowSize, hopSize, numFrames, workerID) {
    return new Promise(async (resolve, reject) => {
        try {
            var frames = (inputSignalChunk.length - windowSize) / hopSize;
            //var frameLastIndex = numFrames-1;
            const spectrogramChunk = new Array(numFrames); // Preallocate memory
            
            // Array to hold promises for each computation
            const computationPromises = [];

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

            //console.log(spectrogramChunk);
            // Resolve with the spectrogram chunk
            resolve(spectrogramChunk);
        } catch (error) {
            reject(error);
        }
    });
}



// Listen for messages from the main thread
onmessage = function (e) {
    const { inputSignal, windowSize, hopSize, numFrames, workerID } = e.data;
    
    //console.log("WORKER",workerID,"received message.")
    // Convert back
    const chunk = new Float32Array(inputSignal);

    // Use fftFactorLookup for computations
    STFT(chunk, windowSize, hopSize, numFrames, workerID)
        .then((spectrogramChunk) => {
            // Send the result back to the main thread
            console.log("WORKER",workerID,"Spectrogram on Chunk ready");
            postMessage(spectrogramChunk);
        })
        .catch((error) => {
            console.log("WORKER",workerID,'Error:', error);
            // Optionally, handle the error and send back an error message to the main thread
        });
};*/

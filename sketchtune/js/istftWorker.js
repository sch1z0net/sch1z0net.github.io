importScripts('./fft.js');

// Function to perform Inverse Short-Time Fourier Transform (ISTFT)
function ISTFT(spectrogramChunk, windowSize, hopSize, workerID) {
    return new Promise((resolve, reject) => {
        const outputSignalChunk = [];
        
        // Process each frame in the spectrogram chunk asynchronously
        const processFrames = async () => {
            try {
                //console.log("WORKER", workerID, "ISTFT on Spectrogram Chunk with length", spectrogramChunk.length);
                for (let i = 0; i < spectrogramChunk.length; i++) {
                    // Compute inverse FFT of the spectrum to obtain the frame in time domain
                    const frame = await computeInverseFFT(spectrogramChunk[i]);
                    // Apply overlap-add to reconstruct the output signal
                    const startIdx = i * hopSize;
                    for (let j = 0; j < windowSize; j++) {
                        if (!outputSignalChunk[startIdx + j]) {
                            outputSignalChunk[startIdx + j] = frame[j];
                        } else {
                            outputSignalChunk[startIdx + j] += frame[j] * 0.5 * (1 - Math.cos(2 * Math.PI * j / (windowSize - 1)));
                        }
                    }
                }
                //console.log("WORKER", workerID, "resolve Output Signal Chunk");
                resolve(outputSignalChunk);
            } catch (error) {
                reject(error);
            }
        };

        processFrames();
    });
}

// Listen for messages from the main thread
onmessage = function (e) {
    const { spectrogramChunk, windowSize, hopSize, workerID } = e.data;
    
    //console.log("WORKER", workerID, "received message.")
    
    // Use fftFactorLookup for computations
    ISTFT(spectrogramChunk, windowSize, hopSize, workerID)
        .then((outputSignalChunk) => {
            // Send the result back to the main thread
            //console.log("WORKER", workerID, "Output Signal Chunk ready");
            postMessage({id:workerID, chunk:outputSignalChunk});
        })
        .catch((error) => {
            console.log("WORKER", workerID, 'Error:', error);
            // Optionally, handle the error and send back an error message to the main thread
        });
};

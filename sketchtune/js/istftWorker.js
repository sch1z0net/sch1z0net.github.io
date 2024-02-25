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
    console.log(spectrogramChunk);
    // Convert the flattened chunk back to the original nested structure
    const binsPerFrame = windowSize;
    const reconstructedChunk = [];
    for (let i = 0; i < spectrogramChunk.length; i += binsPerFrame * 2) {
        const frame = [];
        for (let j = 0; j < binsPerFrame; j++) {
            const spectrum = {
                re: spectrogramChunk[i + j * 2],
                im: spectrogramChunk[i + j * 2 + 1]
            };
            frame.push(spectrum);
        }
        reconstructedChunk.push(frame);
    }
    console.log(reconstructedChunk);
    
    ISTFT(reconstructedChunk, windowSize, hopSize, workerID)
        .then((outputSignalChunk) => {
            // Convert the output signal chunk to Float32Array
            const float32Array = new Float32Array(outputSignalChunk);
            // Convert the Float32Array to an ArrayBuffer
            const arrayBuffer = float32Array.buffer;
            // Send the ArrayBuffer back to the main thread, transferring ownership
            postMessage({ id: workerID, buffer: arrayBuffer }, [arrayBuffer]);
        })
        .catch((error) => {
            console.log("WORKER", workerID, 'Error:', error);
            // Optionally, handle the error and send back an error message to the main thread
        });
};


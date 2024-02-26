importScripts('./fft.js');

/*// Function to perform Inverse Short-Time Fourier Transform (ISTFT)
function ISTFT_OLA(spectrogramChunk, windowSize, hopSize, workerID) {
    return new Promise((resolve, reject) => {
        const outputSignalChunk = [];
        
        // Process each frame in the spectrogram chunk asynchronously
        const processFrames = async () => {
            try {
                //console.log("WORKER", workerID, "ISTFT on Spectrogram Chunk with length", spectrogramChunk.length);
                for (let i = 0; i < spectrogramChunk.length; i++) {
                    // Compute inverse FFT of the spectrum to obtain the frame in time domain
                    const frame = await computeInverseFFT(spectrogramChunk[i]);
                    // Apply overlap-add to reconstruct the output signal [OLA]
                    const startIdx = i * hopSize;
                    for (let j = 0; j < windowSize; j++) {
                        if (!outputSignalChunk[startIdx + j]) {
                            outputSignalChunk[startIdx + j] = frame[j];
                        } else {
                            outputSignalChunk[startIdx + j] += frame[j] * 0.5 * (1 - Math.cos(2 * Math.PI * j / (windowSize - 1)));
                        }
                    }
                }
                resolve(outputSignalChunk);
            } catch (error) {
                reject(error);
            }
        };

        processFrames();
    });
}*/

/*
// Function to perform Inverse Short-Time Fourier Transform (ISTFT)
function ISTFT_OLA_NORMALIZED(spectrogramChunk, windowSize, hopSize, workerID) {
    return new Promise((resolve, reject) => {
        const outputSignalChunk = [];
        
        // Process each frame in the spectrogram chunk asynchronously
        const processFrames = async () => {
            try {
                // Compute the maximum absolute value of the output signal
                let maxAbsValue = 0;

                for (let i = 0; i < spectrogramChunk.length; i++) {
                    const frame = await computeInverseFFT(spectrogramChunk[i]);
                    const startIdx = i * hopSize;
                    for (let j = 0; j < windowSize; j++) {
                        // Check if there's no existing value at the current index in the output signal chunk
                        if (!outputSignalChunk[startIdx + j]) {
                            // If there's no existing value, initialize it with the value from the current frame
                            outputSignalChunk[startIdx + j] = frame[j];
                            // Update maxAbsValue if necessary
                            maxAbsValue = Math.max(maxAbsValue, Math.abs(frame[j]));
                        } else {
                            outputSignalChunk[startIdx + j] += frame[j] * 0.5 * (1 - Math.cos(2 * Math.PI * j / (windowSize - 1)));
                            // Update maxAbsValue if necessary
                            maxAbsValue = Math.max(maxAbsValue, Math.abs(outputSignalChunk[startIdx + j]));
                        }
                    }
                }

                // Normalize the output signal
                for (let i = 0; i < outputSignalChunk.length; i++) {
                    outputSignalChunk[i] /= maxAbsValue;
                }

                resolve(outputSignalChunk);
            } catch (error) {
                reject(error);
            }
        };

        processFrames();
    });
}
*/




// Function to perform Weighted Overlap-Add (WOLA) for signal reconstruction from STFT
function ISTFT_WOLA(spectrogramChunk, windowSize, hopSize, workerID, windowType, halfSpec) {
    return new Promise((resolve, reject) => {
        let spectra = spectrogramChunk.length;

        const outputSignalChunk = new Float32Array(spectra * hopSize);
        
        // Process each frame in the spectrogram chunk asynchronously
        const processFrames = async () => {
            try {
                for (let i = 0; i < spectra; i++) {
                    // Compute inverse FFT of the spectrum to obtain the frame in time domain
                    let spectrum = spectrogramChunk[i];
                    let frame;
                    if(halfSpec){  frame = await computeInverseFFTonHalf(spectrum);
                    }else{         frame = await computeInverseFFT(spectrum);        }

                    if(workerID==0 && i == 10){ console.log(frame); }

                    // Apply synthesis window to the frame
                    const synthesisWindow = hanningWindow(windowSize);
                    //const synthesisWindow = hammingWindow(windowSize);
                    //const synthesisWindow = blackmanWindow(windowSize);
                    const weightedFrame = applySynthesisWindow(frame, synthesisWindow);

                    // Overlap-add the weighted frame to the output signal
                    const startIdx = i * hopSize;
                    for (let j = 0; j < windowSize; j++) {
                        // Check if there's no existing value at the current index in the output signal chunk
                        if (!outputSignalChunk[startIdx + j]) {
                            // If there's no existing value, initialize it with the value from the current frame
                            outputSignalChunk[startIdx + j] = frame[j];
                        } else {
                            outputSignalChunk[startIdx + j] += weightedFrame[j];
                        }
                    }
                }

                // Normalize the output signal
                normalizeOutput(outputSignalChunk);

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
    const { flattenedChunk, windowSize, hopSize, workerID, windowType, halfSpec } = e.data;
    // Convert back
    const spectrogramChunk = new Float32Array(flattenedChunk);

    // Convert the flattened chunk back to the original nested structure
    let binsPerFrame = windowSize;
    if(halfSpec){
        binsPerFrame = windowSize / 2;
    }

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
    
    //ISTFT_OLA(reconstructedChunk, windowSize, hopSize, workerID, halfSpec)
    //ISTFT_OLA_NORMALIZED(reconstructedChunk, windowSize, hopSize, workerID, halfSpec)
    ISTFT_WOLA(reconstructedChunk, windowSize, hopSize, workerID, windowType, halfSpec)
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


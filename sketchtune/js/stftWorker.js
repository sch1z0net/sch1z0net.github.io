importScripts('./fft.js');

// Function to perform Short-Time Fourier Transform (STFT)
function STFT(inputSignalChunk, windowSize, hopSize, fftFactorLookup) {
    return new Promise((resolve, reject) => {
        const spectrogramChunk = [];

        // Process each frame in the chunk asynchronously
        const processFrames = async () => {
            try {
                for (let i = 0; i <= inputSignalChunk.length - windowSize; i += hopSize) {
                    const frame = inputSignalChunk.slice(i, i + windowSize);
                    const windowedFrame = applyHanningWindow(frame);
                    const spectrum = await computeFFT(windowedFrame, fftFactorLookup); // Assuming computeFFT has an asynchronous version
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

// Listen for messages from the main thread
onmessage = function (e) {
    console.log("Worker received message.")

    const { inputSignal, windowSize, hopSize, fftFactorLookup } = e.data;
    // Use fftFactorLookup for computations
    STFT(inputSignal, windowSize, hopSize, fftFactorLookup)
        .then((spectrogramChunk) => {
            // Send the result back to the main thread
            postMessage(spectrogramChunk);
        })
        .catch((error) => {
            console.error('Error:', error);
            // Optionally, handle the error and send back an error message to the main thread
        });
};

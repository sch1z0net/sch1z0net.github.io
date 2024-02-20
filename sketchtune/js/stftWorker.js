importScripts('./fft.js');

// Function to perform Short-Time Fourier Transform (STFT)
function STFT(inputSignalChunk, windowSize, hopSize) {
    const spectrogramChunk = [];

    // Process each frame in the chunk
    for (let i = 0; i <= inputSignalChunk.length - windowSize; i += hopSize) {
        const frame = inputSignalChunk.slice(i, i + windowSize);
        const windowedFrame = applyHanningWindow(frame);
        const spectrum = computeFFT(windowedFrame);
        spectrogramChunk.push(spectrum);
    }

    // Send the result back to the main thread
    postMessage(spectrogramChunk);
}

// Listen for messages from the main thread
onmessage = function (e) {
    const { inputSignal, windowSize, hopSize } = e.data;
    STFT(inputSignal, windowSize, hopSize);
};

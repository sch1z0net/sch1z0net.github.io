importScripts('./js/fft.js');

// Function to perform Short-Time Fourier Transform (STFT)
function STFT(inputSignal, windowSize, hopSize, startFrame, endFrame) {
    const spectrogram = [];

    for (let i = startFrame; i < endFrame; i++) {
        const startIdx = i * hopSize;
        const frame = inputSignal.slice(startIdx, startIdx + windowSize);
        const windowedFrame = applyHanningWindow(frame);
        const spectrum = computeFFT(windowedFrame);
        spectrogram.push(spectrum);
    }

    // Send the result back to the main thread
    postMessage(spectrogram);
}

// Listen for messages from the main thread
onmessage = function (e) {
    const { inputSignal, windowSize, hopSize, startFrame, endFrame } = e.data;
    STFT(inputSignal, windowSize, hopSize, startFrame, endFrame);
};

importScripts('./fft.js');

// Function to perform Short-Time Fourier Transform (STFT)
function STFT(inputSignalChunk, windowSize, hopSize, workerID) {
    return new Promise((resolve, reject) => {
        const spectrogramChunk = [];
        
        // Process each frame in the chunk asynchronously
        const processFrames = async () => {
            try {
                console.log("WORKER",workerID,"STFT on Chunk with length",inputSignalChunk.length);
                for (let i = 0; i <= (inputSignalChunk.length - windowSize)/hopSize; i += 1) {
                    const frame = inputSignalChunk.slice(i*hopSize, i*hopSize + windowSize);
                    const windowedFrame = applyHanningWindow(frame);
                    //console.log("WORKER: process Frame",windowedFrame);
                    const spectrum = await computeFFT(windowedFrame); // Assuming computeFFT has an asynchronous version
                    //console.log("WORKER",workerID,"computed FFT",spectrum);
                    console.log("WORKER",workerID,"push to Spectrum [",i,"/",(inputSignalChunk.length - windowSize)/hopSize,"]");
                    spectrogramChunk.push(spectrum);
                }
                //console.log("WORKER",workerID,"resolve Spectrogram Chunk");
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
    const { inputSignal, windowSize, hopSize, workerID } = e.data;
    
    console.log("WORKER",workerID,"received message.")
    // Convert back
    const chunk = new Float32Array(inputSignal);

    // Use fftFactorLookup for computations
    STFT(chunk, windowSize, hopSize, workerID)
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

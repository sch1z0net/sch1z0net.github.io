importScripts('./fft.js');

// Function to perform Short-Time Fourier Transform (STFT)
function STFT(inputSignalChunk, windowSize, hopSize, fftFactorLookup) {
    return new Promise((resolve, reject) => {
        const spectrogramChunk = [];
        
        // Process each frame in the chunk asynchronously
        const processFrames = async () => {
            try {
                console.log("STFT on Chunk with length",inputSignalChunk.length);
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


var lock; // Separate lock for synchronization

onmessage = function (e) {
    console.log("Worker received message.");
    const { inputSignal, windowSize, hopSize, sharedLookup } = e.data;

    lock = new Int32Array(new SharedArrayBuffer(sharedLookup.byteLength));

    // Synchronize access to shared memory
    acquireLock();

    // Access sharedLookup directly in the worker
    console.log(sharedLookup);

    // Convert back
    const chunk = new Float32Array(inputSignal);

    // Use fftFactorLookup for computations
    STFT(chunk, windowSize, hopSize, lookup)
        .then((spectrogramChunk) => {
            // Send the result back to the main thread
            console.log("Spectrogram on Chunk ready");
            postMessage(spectrogramChunk);
            // Release the lock after accessing shared memory
            releaseLock();
        })
        .catch((error) => {
            console.error('Error:', error);
            // Optionally, handle the error and send back an error message to the main thread
            // Release the lock after encountering an error
            releaseLock();
        });
};

// Function to acquire the lock
function acquireLock() {
    while (Atomics.compareExchange(lock, 0, 0, 1) !== 0) {
        // Wait until the lock is acquired
    }
}

// Function to release the lock
function releaseLock() {
    Atomics.store(lock, 0, 0); // Release the lock
}





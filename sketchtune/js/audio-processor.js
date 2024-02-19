// audio-processor.js (AudioWorkletProcessor)
class AudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0]; // Get the input audio data
    const output = outputs[0]; // Get the output audio data

    // Extract audio samples from the input array
    const leftChannel = input[0];
    const rightChannel = input[1];

    // Convert stereo to mono by averaging the samples from both channels
    const numSamples = Math.min(leftChannel.length, rightChannel.length);
    const monoSamples = new Float32Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      monoSamples[i] = (leftChannel[i] + rightChannel[i]) / 2;
    }

    console.log(numSamples);

    /*
    // Pass the mono audio data to the output
    output.forEach(channel => {
      for (let i = 0; i < numSamples; i++) {
        channel[i] = monoSamples[i]; // Pass the mono samples through unchanged
      }
    });
    */


    return true; // Keep the processor alive
  }
}

registerProcessor('audio-processor', AudioProcessor);
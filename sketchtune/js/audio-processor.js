// audio-processor.js (AudioWorkletProcessor)
class AudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0]; // Get the input audio data
    const output = outputs[0]; // Get the output audio data

    // Check if input data is null or empty
    if (!input || input.length === 0) {
      console.log("no audio to process but keep processor running");
      return true; // Keep the processor alive without processing any audio data
    }

    // Extract audio samples from the input array
    const numChannels = input.length;
    const numSamples = input[0].length;
    console.log('Number of channels:', numChannels);
    console.log('Number of samples:', numSamples);

    // Process each channel separately
    for (let ch = 0; ch < numChannels; ch++) {
      const channelData = input[ch];

      // Do processing for each channel here
    }

    return true; // Keep the processor alive
  }
}

registerProcessor('audio-processor', AudioProcessor);

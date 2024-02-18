  /***************************************************************/
  // SOUND PROCESSING



function generateSineWaveBuffer(durationInSeconds, sampleRate, frequency) {
    const numSamples = durationInSeconds * sampleRate;
    const buffer = new Float32Array(numSamples);
    const amplitude = 0.5; // Amplitude of the sine wave

    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate; // Time in seconds
        buffer[i] = amplitude * Math.sin(2 * Math.PI * frequency * t);
    }

    return buffer;
}

function nextPowerOf2(n) {
    return Math.pow(2, Math.ceil(Math.log2(n)));
}

function fft(input) {
    const N = input.length;

    if (N <= 1) {
        return input;
    }

    const even = [];
    const odd = [];
    for (let i = 0; i < N; i++) {
        if (i % 2 === 0) {
            even.push(input[i]);
        } else {
            odd.push(input[i]);
        }
    }

    const evenFFT = fft(even);
    const oddFFT = fft(odd);

    const output = [];
    for (let k = 0; k < N / 2; k++) {
        const theta = -2 * Math.PI * k / N;
        const exp = { re: Math.cos(theta), im: Math.sin(theta) };
        const t = { re: exp.re * oddFFT[k].re - exp.im * oddFFT[k].im, im: exp.re * oddFFT[k].im + exp.im * oddFFT[k].re };
        output[k] = { re: evenFFT[k].re + t.re, im: evenFFT[k].im + t.im };
        output[k + N / 2] = { re: evenFFT[k].re - t.re, im: evenFFT[k].im - t.im };
    }

    return output;
}

function fft_audio_buffer(input) {
    // Zero-padding to the next power of 2
    const N = nextPowerOf2(input.length);
    const paddedInput = new Array(N).fill(0);
    input.forEach((value, index) => paddedInput[index] = value);
    const complexInput = convertToComplex(paddedInput);

    return fft(complexInput);
}

function convertToComplex(inputSignal) {
    return inputSignal.map(value => ({ re: value, im: 0 }));
}

// Example parameters
const durationInSeconds = 0.0091; // Duration of the audio in seconds
const sampleRate = 44100; // Sample rate (samples per second)
const frequency = 440; // Frequency of the sine wave in Hz

// Generate sine wave buffer
const sineWaveBuffer = generateSineWaveBuffer(durationInSeconds, sampleRate, frequency);
const spectrum = fft_audio_buffer(sineWaveBuffer);
console.log("FFT result:", spectrum);









        $(document).ready(function() {
            // Plot waveform on canvas
            function plotWaveform(canvas, buffer) {
                const ctx = canvas.getContext('2d');

                const width = canvas.width;
                const height = canvas.height;

                ctx.clearRect(0, 0, width, height);
                ctx.beginPath();
                ctx.moveTo(0, height / 2);

                for (let i = 0; i < buffer.length; i++) {
                    const x = (i / buffer.length) * width;
                    const y = (1 - buffer[i]) * height / 2;
                    ctx.lineTo(x, y);
                }

                ctx.strokeStyle = 'blue';
                ctx.stroke();
            }

            // Plot spectrum on canvas
            function plotSpectrum(canvas, spectrum) {
                const ctx = canvas.getContext('2d');

                const width = canvas.width;
                const height = canvas.height;

                ctx.clearRect(0, 0, width, height);
                ctx.beginPath();

                // Find the maximum magnitude in the spectrum
                let maxMagnitude = 0;
                for (let i = 0; i < spectrum.length; i++) {
                    const magnitude = Math.sqrt(spectrum[i].re * spectrum[i].re + spectrum[i].im * spectrum[i].im);
                    if (magnitude > maxMagnitude) {
                        maxMagnitude = magnitude;
                    }
                }

                // Plot normalized spectrum
                const binWidth = width / spectrum.length;
                for (let i = 0; i < spectrum.length; i++) {
                    const magnitude = Math.sqrt(spectrum[i].re * spectrum[i].re + spectrum[i].im * spectrum[i].im);
                    const normalizedMagnitude = magnitude / maxMagnitude;
                    const x = i * binWidth;
                    const y = height - normalizedMagnitude * height; // Invert Y-axis
                    ctx.moveTo(x, height);
                    ctx.lineTo(x, y);
                }

                ctx.strokeStyle = 'red';
                ctx.stroke();
            }

            const sineWaveBuffer = generateSineWaveBuffer(durationInSeconds, sampleRate, frequency);

            // Plot waveform
            const waveformCanvas = document.getElementById('waveformCanvas');
            plotWaveform(waveformCanvas, sineWaveBuffer);
            // Plot spectrum
            const spectrumCanvas = document.getElementById('spectrumCanvas');
            plotSpectrum(spectrumCanvas, spectrum);
        });









/*
  function timeStretchSample(audioContext, audioBuffer, resamplingRatio){
    // Create an AudioBuffer to hold the resampled data
    const resampledBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      Math.ceil(audioBuffer.length * resamplingRatio),
      audioBuffer.sampleRate
    );

    // Copy and stretch the audio data to the resampled buffer
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      const resampledChannelData = resampledBuffer.getChannelData(channel);
      for (let i = 0; i < resampledBuffer.length; i++) {
        const position = i / resamplingRatio;
        const leftIndex = Math.floor(position);
        const rightIndex = Math.ceil(position);
        const frac = position - leftIndex;
        resampledChannelData[i] = (1 - frac) * channelData[leftIndex] + frac * channelData[rightIndex];
      }
    }

    return resampledBuffer;
  }*/



/*
  function granularSynthesis(audioBuffer, stretchFactor, grainSize, overlap) {
    const audioContext = new AudioContext();
    const bufferLength = audioBuffer.length;
    const resampledBuffer = audioContext.createBuffer(audioBuffer.numberOfChannels, bufferLength * stretchFactor, audioBuffer.sampleRate);

    const grainSamples = Math.floor(grainSize * audioContext.sampleRate);
    const hopSize = Math.floor(grainSamples * (1 - overlap));

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const inputChannelData = audioBuffer.getChannelData(channel);
      const outputChannelData = resampledBuffer.getChannelData(channel);

      for (let i = 0; i < bufferLength * stretchFactor; i++) {
        let index = Math.floor(i / stretchFactor);
        let sum = 0;
        let count = 0;
        for (let j = 0; j < grainSamples; j++) {
          if (index + j < bufferLength) {
            sum += inputChannelData[index + j];
            count++;
          }
        }
        outputChannelData[i] = count > 0 ? sum / count : 0;
      }
    }

    return resampledBuffer;
  }
  */


  // Function to perform phase vocoding
  function phaseVocoder(inputBuffer, stretchFactor) {
    const windowSize = 2048; // Size of the analysis window
    const hopSize = Math.floor(windowSize / 4); // Hop size for overlap-add
    const analysisWindow = new Float32Array(windowSize); // Analysis window
    // Initialize analysis window with Hanning window function
    for (let i = 0; i < windowSize; i++) {
        analysisWindow[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / windowSize));
    }
    
    const numChannels = inputBuffer.numberOfChannels;
    const numFrames = Math.ceil(inputBuffer.length / hopSize);
    const outputBuffer = audioContext.createBuffer(numChannels, numFrames * hopSize, audioContext.sampleRate);
    
    // Process inputBuffer frame by frame for each channel
    for (let ch = 0; ch < numChannels; ch++) {
        const inputData = inputBuffer.getChannelData(ch);
        const outputData = outputBuffer.getChannelData(ch);
        for (let i = 0; i < numFrames; i++) {
            // Extract frame
            const start = i * hopSize;
            const end = Math.min(start + windowSize, inputData.length);
            const frame = inputData.subarray(start, end);
            
            // Apply window function
            for (let j = 0; j < frame.length; j++) {
                frame[j] *= analysisWindow[j];
            }
            
            // Perform FFT (you need to implement FFT function)
            const spectrum = FFT(frame);
            
            // Modify spectrum phase and magnitude (time stretching)
            // You would typically interpolate between frames to change the phase and magnitude
            
            // Perform IFFT (you need to implement IFFT function)
            const processedFrame = IFFT(spectrum);
            
            // Overlap-add
            for (let j = 0; j < processedFrame.length; j++) {
                outputData[i * hopSize + j] += processedFrame[j];
            }
        }
    }
    
    return outputBuffer;
  }









  /***************************************************************/
  // MAIN APP

  let isDragging = false;
  let isResizingR = false;
  let isResizingL = false;
  let isDraggingTitle = false;
  let isSelectingPatterns = false;
  let isMouseDownOnTrackRow = false;

  let activePattern = null;
  let activeTrack = null;
  let focusTrack = null;
  let activeInsertSlot = null;
  let activeInsertPosition = null;
  let activePattern_oldmargin = null;
  let xOffsetOnPattern = null;

  let selectRootX = null;
  let selectRootY = null;

  let isDraggingSound = false;
  let draggedSoundElement = null;


  var BEAT_WIDTH = parseInt($("#root").css("--beat-width"));
  var ROOT_PADDING;

  var clockStartInMS;
  var startOffsetInSec = 0;
  var startOffsetInBeats = 0;
  var initScheduling;
  var is_playing = false;

  var time_marker_in_sec = 0;
  var time_marker_in_beats = 0;

  var BPM = 128;           //60      120      240
  var MPB = 1 / BPM;       //1/60    1/120    1/240
  var SPB = 60 * MPB;      //1       0.5      0.25
  var BPS = 1 / SPB;       //1       2        4
  var WPS = BEAT_WIDTH * BPS;
  var WPB = BEAT_WIDTH;

  let GLOBAL_PLAYBACK_RATE = 1;

  function reScheduleSamples(){
    initScheduling = true;
  }

  function updateBPM(bpm){
    BPM = bpm;
    MPB = 1 / BPM;
    SPB = 60 * MPB;
    BPS = 1 / SPB;
    WPS = BEAT_WIDTH * BPS;
    WPB = BEAT_WIDTH;

    GLOBAL_PLAYBACK_RATE = BPM / 128;

    $("#bpm").val(BPM);
    resizeTimeBar();
    console.log("----------SETTINGS----------");
    console.log("⚙︎ BPM",BPM,"at",(Math.floor(time_marker_in_beats/4)+1)+"."+(Math.floor(time_marker_in_beats%4)+1));
    resetClock();
    setStartOffsetInBeats(time_marker_in_beats); 
    updateTimeMarker();
    reScheduleSamples();
  }

  function updateBeatWidth() {
    BEAT_WIDTH = parseInt($("#root").css("--beat-width"));
  }

  function updateRootPadding(){
    ROOT_PADDING = $("grid-window")[0].getBoundingClientRect().left;
  }

  function resizeTimeBar(){
      var sec_length = WPS;
      var dsec_length = sec_length/10;
      $("time-bar-sec").css("width",sec_length);
      $("time-bar-dsec").css("width",dsec_length);
  }

  // Attach resize event listener to window
  $(window).on("resize", function() {
     updateRootPadding();
  });

  function resetClock(){
    clockStartInMS = performance.now();
  }

  function elapsedSec(){
    return (performance.now() - clockStartInMS) / 1000;
  }

  function elapsedBeats(){
    return elapsedSec()*BPS;
  }

  function updateTimeMarker(){
      time_marker_in_beats = startOffsetInBeats;
      if(is_playing){ 
        time_marker_in_beats += elapsedBeats();
      }
      time_marker_in_sec = time_marker_in_beats * SPB;
      $("time-marker").css("margin-left",time_marker_in_beats*WPB);
  }
  /*
  function updateTimeMarker(){
      time_marker_in_sec   = startOffsetInSec;
      if(is_playing){ time_marker_in_sec += (performance.now() - clockStartInMS) / 1000; }
      time_marker_in_beats = time_marker_in_sec * BPS;
      $("time-marker").css("margin-left",time_marker_in_beats*WPB);
  }*/

  function setStartOffsetInSec(offset){
     startOffsetInSec = offset;
     startOffsetInBeats = startOffsetInSec*BPS;
  }

  function setStartOffsetInBeats(offset){
     startOffsetInBeats = offset;
     startOffsetInSec = startOffsetInBeats*SPB;
  }


  /**** CONTEXT MENU ****/
    // Create context menu
    var contextMenu = $("<div>", {id: "context-menu", "class": "context-menu", css: { display: "none" }});

    // Define colors for the palette
var colors = [
    "#fe9aaa", "#fea741", "#d19d3a", "#f7f58c", "#c1fc40", "#2dfe50", "#34feaf", "#65ffea", "#90c7fc", "#5c86e1",
    "#97abfb", "#d975e2", "#e55ca2", "#ffffff", "#fe3e40", "#f76f23", "#9f7752", "#fff054", "#8dff79", "#42c52e",
    "#11c2b2", "#28e9fd", "#1aa6eb", "#5c86e1", "#8e74e2", "#ba81c7", "#fe41d1", "#d9d9d9", "#e26f64", "#fea67e",
    "#d6b27f", "#eeffb7", "#d6e6a6", "#bfd383", "#a4c99a", "#d9fde5", "#d2f3f9", "#c2c9e6", "#d3c4e5", "#b5a1e4",
    "#eae3e7", "#b3b3b3", "#cb9b96", "#bb8862", "#9f8a75", "#c3be78", "#a9c12f", "#84b45d", "#93c7c0", "#a5bbc9",
    "#8facc5", "#8d9ccd", "#ae9fbb", "#c6a9c4", "#bf7a9c", "#838383", "#b53637", "#ae5437", "#775345", "#dec633",
    "#899b31", "#57a53f", "#139f91", "#256686", "#1a3096", "#3155a4", "#6751ae", "#a752af", "#ce3571", "#3f3f3f"
];




    // Function to create color palette
    function createColorPalette() {
        var palette = $("<div>", {"class": "color-palette"});
        colors.forEach(function (color) {
            var colorItem = $("<div>", {
                "class": "color-item",
                css: { backgroundColor: color }
            });
            palette.append(colorItem);

            colorItem.on("click",function(){
                var id = $(focusTrack).attr("data-id");
                $("#track_"+id).attr("data-stdcolor",color);
                $("#track_"+id+">track-pattern").css("background-color",color);
                $(focusTrack).css("background-color",color);
                focusTrack = null;
            });

        });
        return palette;
    }

    // Append color palette and target to the body
    $("body").append(contextMenu.append(createColorPalette()));



    $(document).on("click", function (event) {
        if (event.button !== 2) {
            contextMenu.css("display", "none");
            focusTrack = null;
        }
    });

    $(document).on("scroll", function () {
        contextMenu.css("display", "none");
        focusTrack = null;
    });

    $(document).on("contextmenu", function (event) {
        event.stopPropagation();
        event.preventDefault();
    });




    // Create selection area
    var selectionArea = $("<div>", {id: "selectionArea", css: { display: "none" }});
    $("body").append(selectionArea);


  document.addEventListener('mousemove', (event) => {
    if(isMouseDownOnTrackRow){
       isSelectingPatterns = true;
    }
    
    //DRAG PATTERN (single or multiple)
    if (isDragging) {
      $(activePattern).addClass("multiSelectedPattern");

      const x = event.clientX + $("beat-bar").scrollLeft() - ROOT_PADDING;
      var newmarginA = x - xOffsetOnPattern;
      var dx = newmarginA - activePattern_oldmargin;

      var overborder = 0;
      $(".multiSelectedPattern").each(function(){
          var newmargin = this.getBoundingClientRect().left + $("beat-bar").scrollLeft() - ROOT_PADDING + dx;
          if(newmargin < 0){ 
            if(newmargin < overborder){ overborder = newmargin; }
          }
      });
      overborder = -overborder;

      newmarginA = activePattern.getBoundingClientRect().left + $("beat-bar").scrollLeft() - ROOT_PADDING + dx + overborder;
      if(newmarginA < 0){ newmarginA = 0; }
      activePattern_oldmargin = newmarginA; 
      activePattern.style.marginLeft = newmarginA + 'px';

      $(".multiSelectedPattern").each(function(){
          if(this != activePattern){
            var newmargin = this.getBoundingClientRect().left + $("beat-bar").scrollLeft()  - ROOT_PADDING + dx + overborder;
            this.style.marginLeft = newmargin + 'px';
          }
      });
    }

    //Resize on Right side
    if (isResizingR) {
      const x = event.clientX + $("beat-bar").scrollLeft() - ROOT_PADDING;
      var posStart = parseInt(activePattern.style.marginLeft);

      var newwidth = x - posStart;
      if(newwidth < BEAT_WIDTH){ newwidth = BEAT_WIDTH; }
      activePattern.style.width = newwidth + 'px';
    }
    //Resize on Left side
    if (isResizingL) {
      const x = event.clientX + $("beat-bar").scrollLeft() - ROOT_PADDING;

      var posEnd = parseInt(activePattern.style.marginLeft) + activePattern.offsetWidth;
      var newmargin = x;
      if(newmargin < 0){ newmargin = 0; }
      var posStart = newmargin;

      var newwidth = posEnd - posStart;
      if(newwidth < BEAT_WIDTH){ newwidth = BEAT_WIDTH; }
      activePattern.style.marginLeft = newmargin + 'px';
      activePattern.style.width = newwidth + 'px';
    }

    if (isDraggingTitle) {
      const y = event.clientY;
      
      $('track-title').each(function(){
          $(this).removeClass("insertMarkB");
          $(this).removeClass("insertMarkT");
          if($(this).is(':hover')) { 
            activeInsertSlot = this;
            var clientRect = this.getBoundingClientRect();
            var clientT = clientRect.top;
            var clientB = clientRect.bottom;
            if(Math.abs(y-clientB) > Math.abs(y-clientT)){
               $(this).addClass("insertMarkT"); 
               activeInsertPos  = "top";
            }else{
               $(this).addClass("insertMarkB"); 
               activeInsertPos  = "bot";
            }
          }
      });
    }

    if (isSelectingPatterns) {
      var x2 = event.clientX;
      var y2 = event.clientY;
      var x1 = selectRootX;
      var y1 = selectRootY;   
      var w = x2 - x1;
      var h = y2 - y1;  

      if(w < 0){ w = -w; x2 = x1; x1 = x1 - w;}
      if(h < 0){ h = -h; y2 = y1; y1 = y1 - h;}

      selectionArea.css("display", "block");
      selectionArea.css("left", x1 + "px");
      selectionArea.css("top", y1 + "px");
      selectionArea.css("width", w);
      selectionArea.css("height", h);

      $("track-pattern").each(function(){
          $(this).removeClass("multiSelectedPattern");
      });

      $("track-pattern").each(function(){
          var clientRect = this.getBoundingClientRect();
          var clientT = clientRect.top;
          var clientB = clientRect.bottom;
          var clientL = clientRect.left;
          var clientR = clientRect.right;

          if( !(x2 < clientL || clientR < x1) && !(y2 < clientT || clientB < y1)){
             $(this).addClass("multiSelectedPattern");
          }
      });
    }

  });

  document.addEventListener('mouseup', (event) => {
     isDragging = false;
     isResizingR = false;
     isResizingL = false;
     isDraggingTitle = false;

     // SNAPPING PATTERNS
     // WHEN RESIZING THEM OR MOVING THEM
     if(activePattern != null){
        $(".multiSelectedPattern").each(function(){
          var pos = Math.round(parseInt(this.style.marginLeft) / BEAT_WIDTH);
          $(this).attr('data-pos',pos);
          this.style.marginLeft = (pos * BEAT_WIDTH) + "px";

          var length = Math.round($(this).width() / BEAT_WIDTH);
          $(this).attr('data-length',length);
          this.style.width = (length * BEAT_WIDTH) + "px";
        });

        reScheduleSamples();
     }

     if(activeTrack != null){
        $(activeTrack).removeClass("selected");
         var id = $(activeTrack).attr("data-id");
         $("#track_"+id).removeClass("selected");
     }

     $('track-title').each(function(){
          $(this).removeClass("insertMarkB");
          $(this).removeClass("insertMarkT");
     });

     if(activeInsertSlot != null){
        var id = $(activeTrack).attr("data-id");
        var idSlot = $(activeInsertSlot).attr("data-id");
        if(activeInsertPos == "top"){
           $(activeTrack).insertBefore($(activeInsertSlot));
           $("#track_"+id).insertBefore($("#track_"+idSlot));
        }else if(activeInsertPos == "bot"){
           $(activeTrack).insertAfter($(activeInsertSlot));
           $("#track_"+id).insertAfter($("#track_"+idSlot));
        }
     }

     // Reposition Time Marker
     if(isMouseDownOnTrackRow && !isSelectingPatterns){
        const x = event.clientX + $("beat-bar").scrollLeft() - ROOT_PADDING;
        var beats_from_start = x / BEAT_WIDTH;
        var sec_from_start  = SPB*beats_from_start ;

        resetClock();
        setStartOffsetInSec(sec_from_start);
        updateTimeMarker();

        reScheduleSamples();
     }

     activePattern = null;
     activeTrack = null;
     activeInsertSlot = null;
     activeInsertPosition = null;

     isMouseDownOnTrackRow = false;
     isSelectingPatterns = false;
     selectionArea.css("display", "none");
  });

  $(document).on('keydown', function(event) {
      var isInputFocused = $('input:focus').length > 0;

      if(activeTrack != null){ 
        if (event.key === "Backspace" || event.key === "Delete") {
          var id = $(activeTrack).attr("data-id");
          $("#track_"+id).remove();
          $(activeTrack).remove(); 
        }
      }

      if(isDragging){ 
        if (event.key === "Backspace" || event.key === "Delete") {
          activePattern.remove(); 
          $(".multiSelectedPattern").remove(); 
        }
      }

      if($(".multiSelectedPattern").length > 0){
        if (event.key === "Backspace" || event.key === "Delete") {
           $(".multiSelectedPattern").remove();
        }
      }
      
      if(!isInputFocused){
         event.preventDefault();
      }
  });

  var tracks_row_length = 0;

  class BeatCol extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");

      var bar = $(this).attr('data-bar');
      var beat = $(this).attr('data-beat');
      if(beat == 1){
        $(this).addClass("fullbar");
      }
      if(bar % 2 == 0){
        $(this).addClass("col_b");
      }else{
        $(this).addClass("col_a");
      }
      var beat_marker = $('<span>').text(bar+"."+beat);
      if(beat!=1){
         beat_marker.addClass("extended_beat_marker");
      }
      $(this).append(beat_marker); 
      tracks_row_length += 20; //+2 Because of border
    }
  }

  class BeatBar extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
      for(var bar = 1; bar<=300; bar++){
         for(var beat = 1; beat<=4; beat++){
             $(this).append($("<beat-col>").attr('data-bar', bar).attr('data-beat', beat));
         }
      }
    }
  }

  function resizePatterns(){
    $("track-pattern").each(function(){
      var pos = $(this).attr('data-pos');
      this.style.marginLeft = (pos * BEAT_WIDTH) + "px";
      var length = $(this).attr('data-length');
      this.style.width = (length * BEAT_WIDTH) + "px"; 
    });
  }

  class BeatBarHeader extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
      var zoom_in = $("<div id='zoom_in_grid'>+</div>");
      zoom_in.on("click",function(){
         updateBeatWidth();
         BEAT_WIDTH += 5;
         if(BEAT_WIDTH >= 30){ BEAT_WIDTH = 30; }
         if(BEAT_WIDTH > 15){ $(".extended_beat_marker").css("display","block"); }
         $("#root")[0].style.setProperty("--beat-width", BEAT_WIDTH+"px");
         WPS = BEAT_WIDTH * BPS;
         WPB = BEAT_WIDTH;
         resizePatterns();
         resizeTimeBar();
      });

      var zoom_out = $("<div id='zoom_out_grid'>-</div>");
      zoom_out.on("click",function(){
         updateBeatWidth();
         BEAT_WIDTH -= 5;
         if(BEAT_WIDTH <= 5){ BEAT_WIDTH = 5; }
         if(BEAT_WIDTH <= 15){ $(".extended_beat_marker").css("display","none"); }
         $("#root")[0].style.setProperty("--beat-width", BEAT_WIDTH+"px");
         WPS = BEAT_WIDTH * BPS;
         WPB = BEAT_WIDTH;
         resizePatterns();
         resizeTimeBar();
      });

      $(this).append(zoom_in);
      $(this).append(zoom_out);
    }
  }

  class BeatBarContainer extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
      $(this).append($("<beat-bar-header>"));
      $(this).append($("<beat-bar>"));
    }
  }









  class TrackPatternBl extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.addEventListener('mousedown', (event) => {
         event.stopPropagation();
         isResizingL = true;
         activePattern = $(this).parent()[0];
         $(activePattern).addClass("multiSelectedPattern");
      });
    }
  }

  class TrackPatternBr extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.addEventListener('mousedown', (event) => {
         event.stopPropagation();
         isResizingR = true;
         activePattern = $(this).parent()[0];
         $(activePattern).addClass("multiSelectedPattern");
      });
    }
  }

  class TrackPattern extends HTMLElement {
    constructor() {
      super();
      this.initialized = false;
    }

    connectedCallback() {
      if (!this.initialized) {
        $(this).dblclick(function(event) {
          event.stopPropagation(); 
        });

        this.addEventListener('mousedown', (event) => {
          event.stopPropagation();
          isDragging = true;
          activePattern = this;
          activePattern_oldmargin = this.getBoundingClientRect().left + $("beat-bar").scrollLeft() - ROOT_PADDING;
          const x = event.clientX + $("beat-bar").scrollLeft() - ROOT_PADDING;
          xOffsetOnPattern = x - activePattern_oldmargin;
        });

        // Initialize width based on data-length attribute
        this.updateWidth();

        $(this).append($('<track-pattern-bl>'));
        $(this).append($('<track-pattern-br>'));
        this.initialized = true;
      }
    }

    // Listen for changes in the data-length attribute
    static get observedAttributes() {
        return ['data-length'];
    }

    // Handle attribute changes
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-length') {
            // Update width when data-length attribute changes
            this.updateWidth();
        }
    }

    // Update width based on data-length attribute
    updateWidth() {
        const dataLength = this.getAttribute('data-length');
        if (dataLength) {
            this.style.width = dataLength*BEAT_WIDTH + 'px';
        }
    }
  }

  class TrackRowEmpty extends HTMLElement {
    constructor() {
      super();
      this.initialized = false;
    }

    connectedCallback() {
      if (!this.initialized) {
        $(this).addClass("unselectable");
        $(this).append("<span>Create New Track</span>");

        $(this).on("click",function(){
           var color = "hsl(0,0%,85%)";
           var tt = $("<track-title text='Track #"+trackID+"'>").css("background-color",color).attr("data-id",trackID);
           $("track-title-container").append(tt);
           var tr = $("<track-row>").attr('data-stdcolor',color).attr('id','track_'+trackID);
           $("track-row-container").append(tr);
           trackID++;

           $("track-window").scrollTop($("track-window")[0].scrollHeight);
           $("track-title-container").scrollTop($("track-title-container")[0].scrollHeight);
        });

        this.initialized = true;
      }
    }
  }

  function updateGridHeight(){
    var tracks_height_sum = $("track-row").length * 20;
    $('beat-bar').css("max-height",tracks_height_sum+"px");
    $('time-marker').css("height",tracks_height_sum+"px");
  }


  class TrackRow extends HTMLElement {
    constructor() {
      super();
      this.initialized = false;
    }

    disconnectedCallback() {
      updateGridHeight();
    }

    connectedCallback() {
      updateGridHeight();

      if (!this.initialized) {
          $(this).addClass("unselectable");

          $(this).dblclick(function(event) {
             const x = event.clientX + $("beat-bar").scrollLeft() - ROOT_PADDING;

             var beatpos = Math.floor(x / BEAT_WIDTH);
             var newmargin = (beatpos * BEAT_WIDTH); //Snap to Grid
             var newpat = $('<track-pattern>');
             newpat.attr('data-pos',beatpos);
             newpat.attr('data-length',4);
             newpat.css("margin-left",newmargin+"px");
             newpat.css("background-color",$(this).attr('data-stdcolor'));

             $(this).append(newpat);
          });

          $(this).on('mousedown', (event) => {
            if(!isSelectingPatterns){
             $("track-pattern").each(function(){
               $(this).removeClass("multiSelectedPattern");
             });
             isMouseDownOnTrackRow = true;
             selectRootX = event.clientX;
             selectRootY = event.clientY;
            }
          });

          $(this).on('mouseup', (event) => {
             if(isDraggingSound){
                const x = event.clientX + $("beat-bar").scrollLeft() - ROOT_PADDING;

                var beatpos = Math.floor(x / BEAT_WIDTH);
                var newmargin = (beatpos * BEAT_WIDTH); //Snap to Grid
                var newpat = $('<track-pattern>');
                newpat.attr('data-pos',beatpos);
                var soundid = draggedSoundElement.soundid;
                var fulldur = draggedSoundElement.fulldur;
                var beats = fulldur/SPB;
                newpat.attr('data-length',beats);
                newpat.attr('data-soundid',soundid);
                newpat.css("margin-left",newmargin+"px");
                newpat.css("background-color",$(this).attr('data-stdcolor'));
                
                $(this).append(newpat);
                isDraggingSound = false;

                reScheduleSamples();
             }
          });

          this.initialized = true;
      }
    }
  }

  class TrackRowContainer extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
      $(this).css("width",tracks_row_length+"px")
    }
  }

  class TrackWindow extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
      $(this).append($("<track-row-container>"));
      $(this).append($("<track-row-empty>"));
      $(this).append($("<time-marker>"));
    }
  }

  class TimeBarSec extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
    }
  }

  class TimeBarDsec extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
    }
  }

  class TimeBar extends HTMLElement {
    constructor() {
      super();
    }
    
    connectedCallback() {
      $(this).addClass("unselectable");
      var sec_div = $("<div>");
      var dsec_div = $("<div>");
      $("time-bar").append(sec_div);
      $("time-bar").append(dsec_div);
      for(var second = 0; second <=60*15; second++){
         var minutestr = Math.floor(second/60);
         var secondstr = (second%60)<10 ? "0"+second%60 : second%60;
         sec_div.append($("<time-bar-sec>").append($("<span>"+minutestr+":"+secondstr+"</span>")));
         for(var ds = 0; ds<10; ds++){
             dsec_div.append($("<time-bar-dsec>"));
         }
      }
      resizeTimeBar();
    }
  }

  class TimeBarContainer extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
      $(this).append($("<time-bar>"));
    }
  }



  class GridWindow extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      updateRootPadding();
      $(this).addClass("unselectable");
      $(this).append($("<beat-bar-container>"));
      $(this).append($("<track-window>"));
      $(this).append($("<time-bar-container>"));
    }
  }










  class TrackTitle extends HTMLElement {
    constructor() {
      super();
      this.initialized = false;
      this.text = this.getAttribute('text') || '';
    }

    connectedCallback() {
      if (!this.initialized) {
        $(this).addClass("unselectable");
        
        var input = $("<input/>");
        input.addClass("unselectable");
        input.val(this.text);
        $(this).append(input);

        this.addEventListener('mousedown', (event) => {
           event.stopPropagation();

           activeTrack = this;
           $(activeTrack).addClass("selected");
           var id = $(activeTrack).attr("data-id");
           $("#track_"+id).addClass("selected");

           isDraggingTitle = true;
        });

        this.addEventListener('dblclick', (event) => {
           event.stopPropagation();
           
           input.data('disabled', true);
           input.focus();

           activeTrack = null;
           isDraggingTitle = false;
        });

        input.on("mousedown", function(event){
           event.preventDefault();
           input.data('disabled', true);
           input.blur();
        });

        input.on('keypress',function(e) {
           if(e.which == 13) {
              input.data('disabled', true);
              input.blur();
           }
        });

        input.on({ 
          focus: function() { if (!$(this).data('disabled')) this.blur() },
          //dblclick: function() { $(this).data('disabled', true); this.focus() },
          blur: function() { $(this).data('disabled', false); } 
        });



        $(this).on("contextmenu", function (event) {
          event.preventDefault();
          var posX = event.clientX;
          var posY = event.clientY;
          contextMenu.css("display", "block");
          contextMenu.css("left", posX-100 + "px");
          contextMenu.css("top", posY + "px");
          focusTrack = this;
        });


        this.initialized = true;
      }

    }
  }

  var trackID = 0;
  class TrackTitleContainer extends HTMLElement {
    constructor() {
      super();
      this.initialized = false;
    }

    connectedCallback() {
      if (!this.initialized) {

        

        $(this).addClass("unselectable");
        for(var i = 1; i<10; i++){
           var color = "hsl(0,0%,85%)";
           var tt = $("<track-title text='Track #"+trackID+"'>").css("background-color",color).attr("data-id",trackID);
           $(this).append(tt);
           var tr = $("<track-row>").attr('data-stdcolor',color).attr('id','track_'+trackID);
           $("track-row-container").append(tr);
           trackID++;
        }

        this.initialized = true;
      }
    }
  }


  class TrackTitleHeader extends HTMLElement {
    constructor() {
      super();
      this.initialized = false;
    }

    connectedCallback() {
      if (!this.initialized) {
      }
    }
  }


  class TrackTitleFooter extends HTMLElement {
    constructor() {
      super();
      this.initialized = false;
    }

    connectedCallback() {
      if (!this.initialized) {
      }
    }
  }

  class SideWindow extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
      $(this).append("<track-title-header>");
      $(this).append("<track-title-container>");
      $(this).append("<track-title-footer>");
    }
  }

  class TopWindow extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
      var bpm_input = $("<input id='bpm'>");
      var bpm_div = $("<div id='bpm_div'>BPM</div>").prepend(bpm_input);
      bpm_input.on('change', function() {
         // Get the entered value
         var inputValue = $(this).val();
         // Define a regular expression for the valid format (integer or float)
         var validFormat = /^\d+(\.\d+)?$/;
         // Check if the entered value matches the valid format
         if (validFormat.test(inputValue)) {
            var newbpm = parseFloat(inputValue);
            if(newbpm < 60){ newbpm = 60; }
            if(newbpm > 240){ newbpm = 240; }
            updateBPM(newbpm);
         } else { updateBPM(BPM); } // Invalid format 
      });
      bpm_input.on('keypress', function(event) {
          // Check if Enter key is pressed (key code 13)
          if (event.which === 13) {  $(this).blur();  }
      });
      $(this).append(bpm_div);
      updateBPM(BPM);

      var play_div = $("<div id='play_div'>");
      play_div.append("<i id='load' class='material-icons'>play_circle_filled</i>");
      play_div.append("<i id='play' class='material-icons'>play_circle_filled</i>")
      play_div.append("<i id='pause' class='material-icons'>pause_circle_filled</i>");
      play_div.append("<i id='stop' class='material-icons'>stop_circle</i>");
      $(this).append(play_div);
    }
  }

  var ready_sounds = [];
  var queue_sounds = [];

  class LoadingCircle extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
    } 
  }

  class SoundElement extends HTMLElement {
    constructor() {
      super();
      this.name = this.getAttribute('name') || '';
      this.soundid = this.getAttribute('data-soundid') || '';
      this.fulldur = this.getAttribute('data-fulldur') || '';
      this.innerHTML = this.name;
      $(this).prop("draggable",true);
    }

    connectedCallback() {
        this.addEventListener('dragstart', function(event) {
           event.preventDefault();
        });

        this.addEventListener('mousedown', (event) => {
          event.stopPropagation();
          isDraggingSound = true;
          draggedSoundElement = this;
        });

        $(this).prepend("<loading-circle>");
    }
  }

  var soundID = 0;


  function getAudioDuration(url) {
    return new Promise((resolve, reject) => {
        var audio = new Audio();
        audio.src = url;

        audio.onloadedmetadata = function() {
            // Once metadata is loaded, resolve with the duration
            resolve(audio.duration);
        };

        audio.onerror = function(e) {
            // If an error occurs while loading the audio, reject with the error
            reject(e);
        };
    });
  }

  class SoundBrowser extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");

      $(this).on('dragover', function(event) {
         event.preventDefault();
      });

      $(this).on('drop', function(event) {
          event.preventDefault();
          
          var that = this;          
          const files = event.originalEvent.dataTransfer.files;

          console.log("------LOADING SOUNDS INTO BROWSER------");
          var processed = 0;
          for (let i = 0; i < files.length; i++) {
            const reader = new FileReader();

            reader.onload = function(event) {
              var file = files[i];
              if (file.type === 'audio/x-wav' || file.type === 'audio/mpeg'){
                 //const url = event.target.result;
                 const url = URL.createObjectURL(file);

                 getAudioDuration(url).then(duration => { 
                    var sound = { 
                       name: files[i].name,
                       url: url,
                       type: files[i].type,
                       size: files[i].size,
                       duration: duration,
                       id: soundID
                    };
                    queue_sounds.push(sound);
                    console.log(sound.id, sound.name, sound.type, sound.size, sound.duration);
                    $(that).append($("<sound-element name='"+files[i].name+"' data-soundid='"+soundID+"' data-fulldur='"+duration+"'>"));
                    soundID++;
                    processed++;
                    if(processed >= files.length){
                        
                    }
                 }).catch(error => {
                     // Error: handle the rejected promise
                     console.log("Couldn't get Duration of: ",files[i].name);
                     processed++;
                     if(processed >= files.length){
                        
                     }
                 });
              }
            };

            reader.onerror = function(event) {
               console.log("Couldn't read: ",files[i].name);
            };

            reader.readAsDataURL(files[i]);
          } 

      });
    }
  }

  class TimeMarker extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
    }
  }


$(document).ready(function(){

  // Define the custom element
  customElements.define('beat-col'    , BeatCol);
  customElements.define('beat-bar'    , BeatBar);
  customElements.define('beat-bar-header' , BeatBarHeader);
  customElements.define('beat-bar-container'    , BeatBarContainer);

  customElements.define('track-pattern-bl' , TrackPatternBl);
  customElements.define('track-pattern-br' , TrackPatternBr);
  customElements.define('track-pattern' , TrackPattern);
  customElements.define('track-row'   , TrackRow);
  customElements.define('track-row-empty'   , TrackRowEmpty);
  customElements.define('track-row-container'  , TrackRowContainer);
  customElements.define('track-window', TrackWindow);

  customElements.define('time-bar-dsec', TimeBarDsec);
  customElements.define('time-bar-sec', TimeBarSec);
  customElements.define('time-bar-container', TimeBarContainer);
  customElements.define('time-bar', TimeBar);

  customElements.define('grid-window' , GridWindow);

  customElements.define('track-title' , TrackTitle);
  customElements.define('track-title-container', TrackTitleContainer);
  customElements.define('track-title-header', TrackTitleHeader);
  customElements.define('track-title-footer', TrackTitleFooter);
  customElements.define('side-window' , SideWindow);

  customElements.define('top-window' , TopWindow);
  customElements.define('time-marker' , TimeMarker);

  customElements.define('loading-circle', LoadingCircle);
  customElements.define('sound-element', SoundElement);
  customElements.define('sound-browser', SoundBrowser);
  
  $("#root").append($("<sound-browser>"));
  var side_layout = $("<div>").css("height","100%").css("width","85%").css("display","inline-block");
  $("#root").append(side_layout);
  side_layout.append($("<top-window>"));
  side_layout.append($("<grid-window>"));
  side_layout.append($("<side-window>"));

  $("beat-bar").scrollLeft(0);
  $("#root").bind('wheel', function(e) {
       $("track-window").scrollTop(e.originalEvent.deltaY + $("track-window").scrollTop());
       $("track-title-container").scrollTop(e.originalEvent.deltaY + $("track-title-container").scrollTop());

       $("beat-bar").scrollLeft(e.originalEvent.deltaX + $("beat-bar").scrollLeft());
       $("track-window").scrollLeft($("beat-bar").scrollLeft());
       $("time-bar-container").scrollLeft($("beat-bar").scrollLeft());
  });

  



  async function getFile(audioContext, filepath) {
    const response = await fetch(filepath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  }


  let samplesMap = {}; // Define a map to store samples with soundid as the key

  async function setupSamples(audioCtx) {
    while(queue_sounds.length > 0) {
        var sound = queue_sounds.pop();
        const sample = await getFile(audioCtx, sound.url);
        samplesMap[sound.id] = sample; // Store the sample in the map with soundid as the key
        ready_sounds.push(sound);
        console.log("✔︎ Ready",sound.id); 
        var lc = $('sound-element[data-soundid="' + sound.id + '"]').find('loading-circle');
        if (lc.length > 0) { lc.remove(); }
    }
  }

   // Function to retrieve a sample by providing the soundid
   function getSample(soundid) {
      return samplesMap[soundid]; // Retrieve the sample from the map using soundid as the key
   }



  // Array to store references to all playing audio nodes
  let playingAudioNodes = [];

  function playSample(audioContext, audioBuffer, time, offset, duration) {
    
    // Calculate the resampling ratio
    //const originalDuration = audioBuffer.duration;
    //const resamplingRatio = desiredDuration / originalDuration;
    //var resampledBuffer = timeStretchSample(audioContext, audioBuffer, 1/GLOBAL_PLAYBACK_RATE);
    
    /*
    const originalAudioBuffer = audioBuffer;
    const stretchFactor = 1/GLOBAL_PLAYBACK_RATE;
    const grainSize = 0.01;
    const overlap = 0.5;

    const resampledBuffer = granularSynthesis(originalAudioBuffer, stretchFactor, grainSize, overlap);
    */

    const stretchFactor = 1/GLOBAL_PLAYBACK_RATE;
    const resampledBuffer = phaseVocoder(audioBuffer, stretchFactor);

    const sampleSource = new AudioBufferSourceNode(audioContext, {
      buffer: resampledBuffer,
      playbackRate: 1.0,
    });
    /*
    const sampleSource = new AudioBufferSourceNode(audioContext, {
      buffer: audioBuffer,
      playbackRate: GLOBAL_PLAYBACK_RATE,
    });*/

    //console.log(duration, sampleSource.buffer.duration);
    sampleSource.connect(audioContext.destination);
    sampleSource.start(time, offset, duration);

    // Add the source node to the list of playing audio nodes
    playingAudioNodes.push(sampleSource);

    return sampleSource;
  }

  // Function to stop all playing samples
  function stopAllSamples() {
    // Iterate over the list of playing audio nodes and stop each one
    playingAudioNodes.forEach(source => {
        source.stop();
    });

    // Clear the list of playing audio nodes
    playingAudioNodes = [];
  }

  const button_load  = $("#load");
  const button_play  = $("#play");
  const button_pause = $("#pause");
  const button_stop  = $("#stop");
  button_play.css("display","none");
  button_pause.css("display","none");

  let context;
  var init = false;
  var samples;

  button_load.on("click", function(){
      if(context != null){
        context.close();
      }
      button_load.css("display","none");
      button_pause.css("display","inline-block");
      context = new AudioContext();
      setupSamplesInQueue();

      button_play.on("click", function(){ 
        button_play.css("display","none");
        button_pause.css("display","inline-block");
        reScheduleSamples();
        // Record the start time
        resetClock();
        requestAnimationFrame(renderloop);
      });

      button_pause.on("click", function(){ 
        button_pause.css("display","none");
        button_play.css("display","inline-block");
        is_playing = false;
        stopAllSamples();

        setStartOffsetInBeats(startOffsetInBeats + elapsedBeats());
        updateTimeMarker();
      });

      button_stop.on("click", function(){ 
        button_pause.css("display","none");
        button_play.css("display","inline-block");
        is_playing = false;
        stopAllSamples();

        setStartOffsetInBeats(0);
        updateTimeMarker();
      });

      button_play.click();
  });

  var samplesSetupProcess = false;
  function setupSamplesInQueue(){
      console.log("-----SETUP SAMPLES IN QUEUE-----");
      $(queue_sounds).each(function(){
         var sound = this;
         $('sound-element[data-id="' + sound.id + '"]').prepend("<loading-circle>");
         console.log("⟲ Setup",sound.id); 
      });

      setupSamples(context).then((soundamt) => {
          samplesSetupProcess = false;
          reScheduleSamples();
      });
  }
  

  function schedule(){
    console.log("----------RESCHEDULE----------");
    $("track-pattern").each(function(){
        var soundid = $(this).attr("data-soundid");
        if(soundid != null){
          var start = parseFloat($(this).attr("data-pos"));
          var duration = parseFloat($(this).attr("data-length"));
          var sample = getSample(soundid);
          if(sample==null){ 
            console.log("⟲ Load",soundid); 
          } else {
            var sampleStartTimeInSec = start*SPB;
            var sampleDurationInSec = duration*SPB;
            var sampleEndTimeInSec = sampleStartTimeInSec + sampleDurationInSec;

            //console.log(start, duration, SPB, time_marker_in_sec, sampleStartTimeInSec);

            if(time_marker_in_sec >= sampleEndTimeInSec){
               //Marker has passed the sample
            }else if(time_marker_in_sec <= sampleStartTimeInSec){
               //Marker hasn't reached sample yet
               var waitSecUntilPlay = sampleStartTimeInSec - time_marker_in_sec;
               var offset = 0;

               var sample_play_offset   = offset * GLOBAL_PLAYBACK_RATE;
               var sample_play_start    = context.currentTime + waitSecUntilPlay;
               var sample_play_duration = (sampleDurationInSec - offset) * GLOBAL_PLAYBACK_RATE;

               playSample(context, getSample(soundid), sample_play_start, sample_play_offset, sample_play_duration);
               console.log(
                "►", soundid, 
                "in",   waitSecUntilPlay.toFixed(2), "sec.",
                "from", sample_play_offset.toFixed(2), "sec.",
                "for",  sample_play_duration.toFixed(2), "sec.",
               );
            }else{
               //Marker is on sample
               var waitSecUntilPlay = 0;
               var offset = time_marker_in_sec - sampleStartTimeInSec;

               var sample_play_offset   = offset * GLOBAL_PLAYBACK_RATE;
               var sample_play_start    = context.currentTime + waitSecUntilPlay;
               var sample_play_duration = (sampleDurationInSec - offset) * GLOBAL_PLAYBACK_RATE;

               playSample(context, getSample(soundid), sample_play_start, sample_play_offset, sample_play_duration);
               console.log(
                "►", soundid, 
                "in",   waitSecUntilPlay.toFixed(2), "sec.",
                "from", sample_play_offset.toFixed(2), "sec.",
                "for",  sample_play_duration.toFixed(2), "sec.",
               );
            }
             
          }
        }
    });
  }

  function renderloop(){
        updateTimeMarker();

       if(initScheduling == true){
          is_playing = true;
          stopAllSamples();
          schedule();
          initScheduling = false;
       }

       if(!samplesSetupProcess && queue_sounds.length > 0){
          samplesSetupProcess = true;
          setupSamplesInQueue();
       }

       if(is_playing){ requestAnimationFrame(renderloop); }
  }
});
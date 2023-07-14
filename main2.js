//STFT Stuff, In Progress

// Function to load a local WAV file
function loadWavFile(file, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const arrayBuffer = e.target.result;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContext.decodeAudioData(arrayBuffer, function(buffer) {
      callback(buffer);
    });
  };
  reader.readAsArrayBuffer(file);
}

function generateShortTimeSpectrogram(audioBuffer, windowSize, hopSize) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const numFrames = Math.floor((audioBuffer.length - windowSize) / hopSize) + 1;
  const frequencyData = new Uint8Array(windowSize);
  const spectrogramData = new Uint8Array(numFrames * windowSize);

  let frame = 0;
  console.log("SR ", audioBuffer.sampleRate)
  function processNextFrame() {
    const offlineContext = new OfflineAudioContext(2, windowSize, audioBuffer.sampleRate);
    const source = offlineContext.createBufferSource();
    const analyzer = offlineContext.createAnalyser();
    analyzer.fftSize = windowSize;
    source.buffer = audioBuffer;
    analyzer.connect(offlineContext.destination);

    const frameOffset = frame * windowSize;

    source.connect(analyzer);

    source.start();

    offlineContext.startRendering().then(function (renderedBuffer) {
      analyzer.getByteFrequencyData(frequencyData);

      spectrogramData.set(frequencyData, frameOffset);

      frame++;
      if (frame < numFrames) {
        audioBuffer.copyFromChannel(source.buffer.getChannelData(0), 0, frame * hopSize);
        setTimeout(processNextFrame, 0);
      } else {
        drawSpectrogram(spectrogramData, numFrames, windowSize);
      }
    });
  }

  processNextFrame();
}

function drawSpectrogram(spectrogramData, numFrames, windowSize, canvasId) {
  const canvas = document.getElementById("spectrogram");
  const context = canvas.getContext("2d");

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  const frequencyBins = windowSize / 2;
  const binWidth = Math.ceil(numFrames / canvasWidth);
  const binHeight = Math.ceil(frequencyBins / canvasHeight);

  for (let i = 0; i < numFrames; i += binWidth) {
    for (let j = 0; j < frequencyBins; j += binHeight) {
      let maxIntensity = 0;
      for (let x = i; x < i + binWidth && x < numFrames; x++) {
        for (let y = j; y < j + binHeight && y < frequencyBins; y++) {
          const value = spectrogramData[x * frequencyBins + y];
          maxIntensity = Math.max(maxIntensity, value);
        }
      }
      const color = getColor(maxIntensity);
      context.fillStyle = color;

      // Calculate the position on the canvas
      const canvasX = Math.floor((i / numFrames) * canvasWidth);
      const canvasY = Math.floor((j / frequencyBins) * canvasHeight);

      context.fillRect(canvasX, canvasHeight - canvasY - 1, 1, 1);
    }
  }
}

function getColor(intensity) {
  // Define the color gradient
  const gradient = [
    { percent: 0, color: [0, 0, 0] },
    { percent: 0.5, color: [255, 0, 0] },
    { percent: 1, color: [255, 255, 0] }
  ];

  // Find the corresponding color based on intensity
  for (let i = 1; i < gradient.length; i++) {
    if (intensity <= gradient[i].percent) {
      const lowerColor = gradient[i - 1].color;
      const upperColor = gradient[i].color;
      const range = gradient[i].percent - gradient[i - 1].percent;
      const fraction = (intensity - gradient[i - 1].percent) / range;
      const color = interpolateColor(lowerColor, upperColor, fraction);
      return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    }
  }

  // If intensity is greater than the highest percent, return the color of the last gradient stop
  const lastColor = gradient[gradient.length - 1].color;
  return `rgb(${lastColor[0]}, ${lastColor[1]}, ${lastColor[2]})`;
}

function interpolateColor(color1, color2, fraction) {
  const r = Math.round(color1[0] + (color2[0] - color1[0]) * fraction);
  const g = Math.round(color1[1] + (color2[1] - color1[1]) * fraction);
  const b = Math.round(color1[2] + (color2[2] - color1[2]) * fraction);
  return [r, g, b];
}


// Example usage
const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file.type === 'audio/wav') {
    loadWavFile(file, function(audioBuffer) {
      generateShortTimeSpectrogram(audioBuffer, 2048, 512);
    });
  } else {
    console.error('Invalid file format. Please select a WAV file.');
  }
});

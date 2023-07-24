import * as THREE from 'three';
const { OrbitControls } = require('three/examples/jsm/controls/OrbitControls.js');
const fft = require('fft-js').fft;

let isPlaying = false;
const planeSplits = 75;
const planeSize = 10;
let songDuration = 0.0;
const waveTailPercentage = 0.05;
const TEXTURE_PATH = "./colorMap.jpg";
const clock = new THREE.Clock();

// Main Camera and Scene controls
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls( camera, renderer.domElement );

camera.position.z = 5;

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


let geometry = new THREE.PlaneGeometry(planeSize, planeSize, planeSplits, planeSplits);
let specGeo = null; //buffer for saved spectrogram geometry
let progress = 0.0;

// Load Plane w Texture
var textureLoader = new THREE.TextureLoader();
textureLoader.load(TEXTURE_PATH, function (texture) {
    // Create the material and set the color map texture
    var planeMaterial = new THREE.MeshBasicMaterial({ map: texture, wireframe: true });
    // Create the plane mesh
    var planeMesh = new THREE.Mesh(geometry, planeMaterial);
    // Add the plane mesh to the scene
    scene.add(planeMesh);
});

// Load Play Indicator
const coneHeight = .3;
const coneGeometry = new THREE.ConeGeometry(coneHeight/2, coneHeight, 32);
const coneMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cone = new THREE.Mesh(coneGeometry, coneMaterial);
const upperCone = new THREE.Mesh(coneGeometry, coneMaterial);
let conePositionX = -planeSize/2;
cone.position.x = upperCone.position.x = conePositionX;
cone.position.y = -planeSize/2 - coneHeight/2;
upperCone.position.y = planeSize/2 + coneHeight/2;
upperCone.scale.y = -1;
scene.add(cone);
scene.add(upperCone);

// TEXTURE MANIPULATION

function saveCanvasAsImage(canvas, filename) {
  // Convert canvas to data URL
  const dataURL = canvas.toDataURL("image/jpeg");

  // Create a link element
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = filename;

  // Trigger the download
  link.click();
}

function spectrogramToTexture(spectrogram) {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = spectrogram.length;
  canvas.height = Math.floor(spectrogram[0].length/2) + 1; //mirrored frequencies

  // Get the 2D rendering context of the canvas
  const ctx = canvas.getContext('2d');

  // Normalize the array values between 0 and 1
  const normalizedArray = normalize2DArray(spectrogram);
  // Create image data object from the normalized array
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < canvas.height; i++) {
    for (let j = 0; j < canvas.width; j++) {
      const value = normalizedArray[j][canvas.height - i];
      const index = (i * canvas.width + j) * 4;
      data[index] = data[index + 1] = data[index + 2] = Math.floor(value * 255);
      data[index + 3] = 255; // Alpha channel
    }
  }

  // Draw the image data onto the canvas
  ctx.putImageData(imageData, 0, 0);
  textureToHeight(canvas);

  // Example usage
  //const filename = "myImage.jpg";
  //saveCanvasAsImage(canvas, filename);
}

function textureToHeight(canvas) {
  //draw to canvas in order to grab pixels
  const ctx = canvas.getContext('2d');
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Height map texture has finished loading
  let geo = geometry.attributes.position;
  for (let i = 0; i < geo.count*3; i+=3) {
      // Get the height value from the texture at the current vertex position
      var x = (geo.array[i] / planeSize + 0.5) * (canvas.width - 1);
      var y = (-geo.array[i+1] / planeSize + 0.5) * (canvas.height - 1);
      var pixelIndex = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
      var r = data.data[pixelIndex] / 255; // Red channel (assuming grayscale)
      var g = data.data[pixelIndex + 1] / 255; // Green channel (assuming grayscale)
      var b = data.data[pixelIndex + 2] / 255; // Blue channel (assuming grayscale)
      var height = (r + g + b) / 3; // Average of the RGB channels
      if (isNaN(height)) {
        height = 0;
      }
      // Modify the vertex position based on the height value
      geo.array[i+2] = height * planeSize/4;
    }
    //deep copy for wave convolution animation
    specGeo = new THREE.BufferGeometry();
    const positionAttribute = geometry.getAttribute("position");
    const positionArray = positionAttribute.array.slice();
    const newPositionAttribute = new THREE.BufferAttribute(positionArray, positionAttribute.itemSize, positionAttribute.normalized);
    specGeo.setAttribute("position", newPositionAttribute);
    geometry.attributes.position.needsUpdate = true;
}

function normalize2DArray(array) {
  for (let i = 0; i < array.length; i++) {
    // Find the maximum and minimum values in the inner array
    let max = -Infinity;
    let min = Infinity;

    for (let j = 0; j < array[i].length; j++) {
      if (array[i][j] > max) {
        max = array[i][j];
      }
      if (array[i][j] < min) {
        min = array[i][j];
      }
    }

    // Normalize the inner array values
    const range = max - min;

    for (let j = 0; j < array[i].length; j++) {
      array[i][j] = (array[i][j] - min) / range;
    }
  }

  return array;
}

// UI
var dropzone = document.getElementById('fileDrop');
window.addEventListener('dragover', function(e) {
  e.preventDefault();
});
window.addEventListener('dragleave', function(e) {
  e.preventDefault();
  dropzone.style.backgroundColor = 'transparent';
});
window.addEventListener('drop', function(e) {
  e.preventDefault();
  dropzone.style.backgroundColor = 'transparent';

  const file = e.dataTransfer.files[0];
  if (file.type === 'audio/wav') {
    //load audio player
    const audioPlayer = document.getElementById('audioPlayer');
    const file = e.dataTransfer.files[0];
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
        const audioBlob = event.target.result;
        audioPlayer.src = URL.createObjectURL(new Blob([audioBlob], { type: 'audio/wav' }));
        audioPlayer.addEventListener('ended', audioPlaybackEnded);
        //audioPlayer.addEventListener("timeupdate", correctConeSlider);
    };
    fileReader.readAsArrayBuffer(file);

    //load file for spectrogram
    loadWavFile(file, function(audioBuffer) {
      const spectrogram = generateShortTimeSpectrogram(audioBuffer, 2048, 512);
      spectrogramToTexture(spectrogram);
    });

    isPlaying = false;
  } else {
    console.error('Invalid file format. Please select a WAV file.');
  }
});

// Function to load a local WAV file
function loadWavFile(file, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const arrayBuffer = e.target.result;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContext.decodeAudioData(arrayBuffer, function(buffer) {
      songDuration = buffer.duration;
      callback(buffer);
    });
  };
  reader.readAsArrayBuffer(file);
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
      e.preventDefault();
      if (songDuration > 0) {
        toggleAudioPlayback();
        isPlaying = !isPlaying;
        if (isPlaying) {
            cone.material.color.set(0x00ff00);
        }
        else {
            cone.material.color.set(0xff0000);
        }
      }
  }
});

function toggleAudioPlayback() {
  if (audioPlayer.paused) {
      audioPlayer.play();
  } else {
      audioPlayer.pause();
  }
}

function audioPlaybackEnded() {
  //reset cursor
  isPlaying = false;
  conePositionX = -planeSize/2;
  cone.material.color.set(0xff0000);
  cone.position.x = upperCone.position.x = conePositionX;
  resetSpectrogramHeight();
}

function generateShortTimeSpectrogram(audioBuffer, windowSize, hopSize) {
  const audioData = audioBuffer.getChannelData(0); // Assuming mono audio
  const frameSize = windowSize; // Size of each FFT window

  // Step 2: Apply a window function (e.g., Hann window) to audio data
  const window = new Float32Array(frameSize);
  for (let i = 0; i < frameSize; i++) {
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (frameSize - 1)));
  }

  // Step 3: Compute spectrogram using fft-js library
  const frames = [];
  let offset = 0;
  while (offset + frameSize < audioData.length) {
    const frame = new Float32Array(frameSize);
    for (let i = 0; i < frameSize; i++) {
      frame[i] = audioData[offset + i] * window[i];
    }
    frames.push(frame);
    offset += hopSize;
  }

  const spectrogram = frames.map((frame) => {
    const spectrum = fft(frame);
    const magnitude = spectrum.map((c) => Math.sqrt(c[0] ** 2 + c[1] ** 2));
    return Array.from(magnitude);
  });

  return spectrogram;
}

// RENDERING
//correct slider based on actual track timestamp
function correctConeSlider() {
  const audio = document.getElementById('audioPlayer');
  const progress = (audio.currentTime / audio.duration);
  cone.position.x = upperCone.position.x = -planeSize/2 + planeSize*progress;
}

//move slider based off time spent in track
function animateConeSlider(deltaTime) {
  conePositionX += deltaTime*planeSize/songDuration;
  progress = (conePositionX + planeSize/2)/(planeSize);
  // If the cone moves off the screen, reset its position ASSUME CALCULATION PERFECT
  //if (conePositionX > planeSize/2) {
  //    conePositionX = -planeSize/2;
  //}
  // Update the cone's position
  cone.position.x = upperCone.position.x = conePositionX;
}

function generateWave() {
  let specGeoPos = specGeo.attributes.position;
  let geo = geometry.attributes.position;
  for (let i = 0; i < specGeoPos.count*3; i+=3) {
      var x = (geo.array[i] / planeSize + 0.5);
      let dist = Math.abs(progress-x)/waveTailPercentage;
      if (x <= progress) {
        // normalizes a range to a cos modified to look wavelike
        geo.array[i+2] = specGeoPos.array[i+2];
      }
      else if ((x-progress) < waveTailPercentage) {
        geo.array[i+2] = specGeoPos.array[i+2] * (Math.cos(3.1415*dist)/2 + 0.5);
      }
      else {
        geo.array[i+2] = 0;
      }
  }
  geometry.attributes.position.needsUpdate = true;
}

function resetSpectrogramHeight() {
  let specGeoPos = specGeo.attributes.position;
  let geo = geometry.attributes.position;
  for (let i = 0; i < specGeoPos.count*3; i+=3) {
    geo.array[i+2] = specGeoPos.array[i+2];
  }
  geometry.attributes.position.needsUpdate = true;
}

function animate() {
  const deltaTime = clock.getDelta();
	requestAnimationFrame( animate );
	controls.update();
	if (isPlaying) {
    animateConeSlider(deltaTime);
    generateWave();
  }
  render();
}

function render(){
  renderer.autoClear = true;
  // Update main scene
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}

animate();

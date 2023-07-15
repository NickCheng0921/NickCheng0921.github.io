import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Main Camera and Scene controls
const scene = new THREE.Scene();
const sliderScene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls( camera, renderer.domElement );

camera.position.z = 5;

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const planeSplits = 50;
const planeSize = 10;
const TEXTURE_PATH = "./colorMap.jpg";
let time = 0;
let geometry = new THREE.PlaneGeometry(planeSize, planeSize, planeSplits, planeSplits);

// Texture Load Color
var textureLoader = new THREE.TextureLoader();
// Load the color map texture
textureLoader.load(TEXTURE_PATH, function (texture) {
    // Create the material and set the color map texture
    var planeMaterial = new THREE.MeshBasicMaterial({ map: texture, wireframe: true });
    // Create the plane mesh
    var planeMesh = new THREE.Mesh(geometry, planeMaterial);
    // Add the plane mesh to the scene
    scene.add(planeMesh);
});

// Load Heights through Texture
var heightMapTexture = new THREE.TextureLoader();
var heightMapTexture = textureLoader.load(TEXTURE_PATH, function(texture) {
  //draw to canvas in order to grab pixels
  const canvas = document.createElement( 'canvas' );
  canvas.width = texture.image.width;
  canvas.height = texture.image.height;
  const context = canvas.getContext( '2d' );
  context.drawImage( texture.image, 0, 0 );
  const data = context.getImageData( 0, 0, canvas.width, canvas.height );

  // Height map texture has finished loading
  let geo = geometry.attributes.position;
  for (let i = 0; i < geo.count*3; i+=3) {
      // Get the height value from the texture at the current vertex position
      var x = (geo.array[i] / planeSize + 0.5) * (texture.image.width - 1);
      var y = (-geo.array[i+1] / planeSize + 0.5) * (texture.image.height - 1);
      var pixelIndex = (Math.floor(y) * texture.image.width + Math.floor(x)) * 4;
      var r = data.data[pixelIndex] / 255; // Red channel (assuming grayscale)
      var g = data.data[pixelIndex + 1] / 255; // Green channel (assuming grayscale)
      var b = data.data[pixelIndex + 2] / 255; // Blue channel (assuming grayscale)
      var height = (r + g + b) / 3; // Average of the RGB channels
      if (isNaN(height)) {
        height = 0;
      }
      // Modify the vertex position based on the height value
      geo.array[i+2] = height * planeSize/2;
    }
    geometry.attributes.position.needsUpdate = true;
});

// Handle potential error while loading the texture
heightMapTexture.onerror = function () {
    console.error('Failed to load the height map texture.');
};


function animate() {
	time += .01;
	requestAnimationFrame( animate );
	controls.update();
	//updateVertices();
  render();
}

function render(){
  renderer.autoClear = true;
  // Update main scene
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}

animate();

// Update the vertices of the plane in the animation loop TODO
let g_old = geometry.attributes.position;
function updateVertices() {
	let g = geometry.attributes.position;
	for (let i = 0; i < g.count*3; i+=3) {
		let x = g.array[i];
		let y = g.array[i+1];
		g.array[i+2] = Math.sin(time+x+y);
	}
	geometry.attributes.position.needsUpdate = true;
}

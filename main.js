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

const planeSplits = [2, 10, 25, 100];
let planeSplitIdx = 2;
let geometry = new THREE.PlaneGeometry(10, 10, planeSplits[planeSplitIdx], planeSplits[planeSplitIdx]);
let time = 0;

// Create a texture loader
var textureLoader = new THREE.TextureLoader();
// Load the color map texture
textureLoader.load('./colorMap.jpg', function (texture) {
    // Create the material and set the color map texture
    var planeMaterial = new THREE.MeshBasicMaterial({ map: texture, wireframe: true });
    // Create the plane mesh
    var planeMesh = new THREE.Mesh(geometry, planeMaterial);
    // Add the plane mesh to the scene
    scene.add(planeMesh);
});


function animate() {
	time += .01;
	requestAnimationFrame( animate );
	controls.update();
	updateVertices();
  render();
}

function render(){
  renderer.autoClear = true;
  // Update main scene
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}

animate();

// Update the vertices of the plane in the animation loop
function updateVertices() {
	let g = geometry.attributes.position;
	for (let i = 0; i < g.count*3; i+=3) {
		let x = g.array[i];
		let y = g.array[i+1];
		g.array[i+2] = Math.sin(time+x+y);
	}
	geometry.attributes.position.needsUpdate = true;
}

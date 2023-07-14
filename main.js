import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Main Camera and Scene controls
const scene = new THREE.Scene();
const sliderScene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls( camera, renderer.domElement );

// Set up the slider camera
const sliderSize = 2; // Adjust this value to control the size of the slider
const aspectRatio = window.innerWidth / window.innerHeight;
const sliderCamera = new THREE.OrthographicCamera(
  -sliderSize * aspectRatio,
  sliderSize * aspectRatio,
  sliderSize,
  -sliderSize,
  1,
  1000
);
sliderCamera.position.z = 5;
camera.position.z = 5;

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const planeSplits = [2, 10, 25, 100];
let planeSplitIdx = 0;
let geometry = new THREE.PlaneGeometry(10, 10, planeSplits[planeSplitIdx], planeSplits[planeSplitIdx]);
let material = new THREE.MeshBasicMaterial( {color: 0x00ff00, side: THREE.DoubleSide, wireframe: true} );
let plane = new THREE.Mesh( geometry, material );
let time = 0;
scene.add( plane );

// Circle Buttons
for (let i = 0; i < 4; i++) {
  const sliderGeometry = new THREE.CircleGeometry( .3, 10, 0, Math.PI * 2 );
  const sliderMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true});
  const slider = new THREE.Mesh(sliderGeometry, sliderMaterial);
  slider.position.x = i-1.5; // Initial position of the slider
  //sliderScene.add(slider);
}

onmousedown = (event) => {
  if (event.button == 0) {
    scene.remove(plane);
    planeSplitIdx += 1;
    geometry = new THREE.PlaneGeometry(10, 10, 
      planeSplits[planeSplitIdx%planeSplits.length], planeSplits[planeSplitIdx%planeSplits.length]);
    plane = new THREE.Mesh( geometry, material );
    scene.add(plane);
  }
};

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

  //prevent canvas from being erased with next .render call
  renderer.autoClear = false;

  // Update slider scene
  //renderer.clearDepth(); in case of clipping between viewports
  renderer.setViewport(0, -window.innerHeight*.1, window.innerWidth*.5, window.innerHeight*.5);
  renderer.render(sliderScene, sliderCamera);
}

animate();

// Update the vertices of the plane in the animation loop
function updateVertices() {
	let g = geometry.attributes.position;
	for (let i = 0; i < g.count*3; i+=3) {
		let x = g.array[i];
		let y = g.array[i+1];
		//let z = g.array[i+2];
		g.array[i+2] = Math.sin(time+x+y);
	}
	geometry.attributes.position.needsUpdate = true;
}

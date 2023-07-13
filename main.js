import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls( camera, renderer.domElement );

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let geometry = new THREE.PlaneGeometry(10, 10, 100, 100);
let material = new THREE.MeshBasicMaterial( {color: 0x00ff00, side: THREE.DoubleSide, wireframe: true} );
let plane = new THREE.Mesh( geometry, material );
let time = 0;

scene.add( plane );

camera.position.z = 5;
controls.update();

function animate() {
	time += .01;
	requestAnimationFrame( animate );
	controls.update();
	updateVertices();
	renderer.render( scene, camera );
}

animate();

// Update the vertices of the plane in the animation loop
function updateVertices() {
	let g = geometry.attributes.position;
	for (let i = 0; i < g.count*3; i+=3) {
		let x = g.array[i];
		let y = g.array[i+1];
		let z = g.array[i+2];
		g.array[i+2] = Math.sin(time+x+y);
	}
	geometry.attributes.position.needsUpdate = true;
}

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls( camera, renderer.domElement );

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let sub = 75;
let geometry = new THREE.PlaneGeometry(10, 10, sub, sub);
let material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide, wireframe: true} );
let plane = new THREE.Mesh( geometry, material );
let time = 0;
scene.add( plane );

const coneHeight = .3;
const coneGeometry = new THREE.ConeGeometry(coneHeight/2, coneHeight, 32);
const coneMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cone = new THREE.Mesh(coneGeometry, coneMaterial);
const upperCone = new THREE.Mesh(coneGeometry, coneMaterial);
let conePositionX = -5;
cone.position.x = upperCone.position.x = conePositionX;
cone.position.y = -5 - coneHeight/2;
upperCone.position.y = 5 + coneHeight/2;
upperCone.scale.y = -1;
scene.add(cone);
scene.add(upperCone);

camera.position.z = 5;
camera.rotation.z = Math.PI / 2;
controls.update();

function animate() {
	time += .01;
	requestAnimationFrame( animate );
	controls.update();
	if (isPlaying) {
        animateCone();
    }
	renderer.render( scene, camera );
}


const coneSpeed = 0.01;
let isPlaying = false;
function animateCone() {
    // Update the position of the cone
    conePositionX += coneSpeed;

    // If the cone moves off the screen, reset its position
    if (conePositionX > 5) {
        conePositionX = -5;
    }

    // Update the cone's position
    cone.position.x = upperCone.position.x = conePositionX;
}

function handleKeyUp(event) {
    if (event.code === "Space") {
        isPlaying = !isPlaying;
        if (isPlaying) {
            cone.material.color.set(0x00ff00);
        }
        else {
            cone.material.color.set(0xff0000);
        }
    }
}
document.addEventListener("keyup", handleKeyUp);

animate();
// Main Three.js code module
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { fetchAllFiles, getOrientationByIndex, getMessageByTimestamp } from './motion.js';

let camera, scene, renderer, videoMesh;
const allMotions = await fetchAllFiles();

init();
animate();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 4;

    // Renderer setup
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Video texture setup
    const video = document.createElement('video');
    video.loop = true;
    video.muted = true; // Required to play without user interaction
    video.src = 'assets/happyCenter.mp4'; // Set the video source.
    video.load(); // Must call after setting/changing source.
    video.play().then(() => {
        console.log("Video playback started successfully.");
    }).catch(error => {
        console.error("Error attempting to play video:", error);
    });

    const texture = new THREE.VideoTexture(video);

    // Plane geometry with video texture
    const geometry = new THREE.PlaneGeometry(2.5, 1.5);  // Dimensions of the plane
    const material = new THREE.MeshBasicMaterial({ map: texture });
    videoMesh = new THREE.Mesh(geometry, material);
    scene.add(videoMesh);

    // Handle window resizing
    window.addEventListener('resize', onWindowResize, false);

}

let pitch, yaw, roll;
function animate() {
    // requestAnimationFrame(animate);
    // Random orientation for debugging. 
    const orientation = {
        pitch : Math.sin(Date.now() * 0.001) * Math.PI,
        yaw : Math.sin(Date.now() * 0.001) * Math.PI,
        roll : Math.cos(Date.now() * 0.001) * Math.PI,
    }
    let message = getMessageByTimestamp(Date.now());
    if (message) {
        print(message);
    } else {
        print(message);
    }

    // const orientation = getOrientationByIndex(currentIndex++);
    updateOrientation(orientation.pitch, orientation.yaw, orientation.roll);
    renderer.render(scene, camera);
}

let currentIndex = 1;
const startTime = performance.now()
function loopThroughMotion(motionName) {
    const motion = allMotions[motionName];
    if (!motion || !motion.length) return;
    const now = performance.now();
    const elapsedTime = now - startTime;
    if (currentIndex < motion.length - 1 && elapsedTime > motion[currentIndex + 1].timestamp){
        const message = motion[currentIndex + 1];
        updateOrientationMessage(message);
        currentIndex = currentIndex + 1;
    }
    if (currentIndex >= motion.length - 1) {
        console.log("Animation over.")
    } else {
        requestAnimationFrame(() => loopThroughMotion(motionName));
    }
}

function updateOrientationMessage(message) {
    switch (message.motor) {
        // Pitch.
        case 1:
            videoMesh.rotation.x = THREE.MathUtils.degToRad(message.value);
        // Yaw.
        case 2:
            videoMesh.rotation.x = THREE.MathUtils.degToRad(message.value);
        // Roll.
        case 3:
            videoMesh.rotation.x = THREE.MathUtils.degToRad(message.value);
    }
}

function updateOrientation(pitch, yaw, roll) {
    videoMesh.rotation.x = THREE.MathUtils.degToRad(pitch);
    videoMesh.rotation.y = THREE.MathUtils.degToRad(yaw);
    videoMesh.rotation.z = THREE.MathUtils.degToRad(roll);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

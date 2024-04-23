// Main Three.js code module
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { fetchAllFiles } from './motion.js';

let camera, scene, renderer, videoMesh;
const allMotions = await fetchAllFiles();
let currentIndex = 1;
let lastMessageTime = 0;
const startTime = performance.now();
let pitch = 0;
let yaw = 0;
let roll = 0;

const states = {
    opening: "opening",
    yes: "yesSequence",
}

init();
animate();

function init() {
    // Scene setup.
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 4;

    // Renderer setup.
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Video texture setup.
    const video = document.createElement('video');
    video.loop = true;
    video.muted = true; // Required to play without user interaction
    video.src = '../assets/happyCenter.mp4'; // Set the video source.
    video.load(); // Must call after setting/changing source.
    video.play().then(() => {
        console.log("Video playback started successfully.");
    }).catch(error => {
        console.error("Error attempting to play video:", error);
    });

    const texture = new THREE.VideoTexture(video);

    // Plane geometry with video texture.
    const geometry = new THREE.PlaneGeometry(2.5, 1.5);  // Dimensions of the plane
    const material = new THREE.MeshBasicMaterial({ map: texture });
    videoMesh = new THREE.Mesh(geometry, material);
    scene.add(videoMesh);

    // Handle window resizing.
    window.addEventListener('resize', onWindowResize, false);

    // Handle debug view toggle.
    document.addEventListener('keydown', function (event) {
        if (event.code === 'Space') { // Checks if the spacebar is pressed
            event.preventDefault(); // Prevent any default action associated with the Space key
            const debugView = document.getElementById('debugView');
            if (debugView.style.display === 'none') {
                debugView.style.display = 'block'; // Show the debug view
            } else {
                debugView.style.display = 'none'; // Hide the debug view
            }
        }
    });

}

function animate() {
    requestAnimationFrame(animate);
    // Random orientation for debugging. 
    const orientation = {
        pitch: Math.sin(Date.now() * 0.001) * Math.PI,
        yaw: Math.sin(Date.now() * 0.001) * Math.PI,
        roll: Math.cos(Date.now() * 0.001) * Math.PI,
    }
    loopThroughMotion("opening")
    // let message = getMessageByTimestamp(Date.now());

    // // const orientation = getOrientationByIndex(currentIndex++);
    // updateOrientation(orientation.pitch, orientation.yaw, orientation.roll);
    renderer.render(scene, camera);
}

function loopThroughMotion(motionName) {
    const motion = allMotions[motionName];
    if (!motion || !motion.length) {
        console.error("Error: no motion detected for: motion_name")
        return;
    }
    const now = performance.now();
    const elapsedTime = now - lastMessageTime;
    console.log(elapsedTime, lastMessageTime, motion[currentIndex].timestamp)
    // Start_time
    if (currentIndex < motion.length - 1 && elapsedTime > motion[currentIndex + 1].timestamp - motion[currentIndex].timestamp) {
        const message = motion[currentIndex + 1];
        currentIndex = currentIndex + 1;
        lastMessageTime = now;
        updateOrientationMessage(message);
    }
    if (currentIndex >= motion.length - 1) {
        console.log("Animation over.")
        currentIndex = 0;
    } else {
        // requestAnimationFrame(() => loopThroughMotion(motionName));
    }
}

function updateOrientationMessage(message) {
    switch (message.motor) {
        case 0:
            // pitch = message.value; 
            // pitch = message.value;
            yaw = message.value;
            break;
        case 1:
            pitch = message.value;
            break;
        case 2:
            roll = message.value;
            break;
    }

    videoMesh.rotation.x = THREE.MathUtils.degToRad(pitch);
    videoMesh.rotation.y = THREE.MathUtils.degToRad(yaw);
    videoMesh.rotation.z = THREE.MathUtils.degToRad(roll);
}

function updateDebugInfo(pitch, yaw, roll, state) {
    document.getElementById('pitchValue').textContent = pitch.toFixed(2);
    document.getElementById('yawValue').textContent = yaw.toFixed(2);
    document.getElementById('rollValue').textContent = roll.toFixed(2);
    document.getElementById('timestamp').textContent = performance.now().toFixed(2);
    document.getElementById('currentState').textContent = state;
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

setInterval(() => {
    updateDebugInfo(pitch, yaw, roll, "testState");
}, 33);  // Update every second for demonstration

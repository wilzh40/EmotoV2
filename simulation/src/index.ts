// Main Three.js code module
import * as THREE from 'three';
import {  fetchAllMotions } from './motion.js';
import { fetchAllEyes } from './eyes.ts';
import OpenAI from "openai";

// Init variables for our renderer and display.
let camera, scene, renderer, videoMesh;
const video = document.createElement('video');
const debugUpdateRate = 1000.0 / 30.0; // 30 fps.

// Init variables for animating motion.
const startTime = performance.now();
let currentMotionFrameIndex = 0;
let lastMessageTime = 0;
let pitch = 0;
let yaw = 0;
let roll = 0;

// Global code for tracking motion and eye states.
const allMotions = await fetchAllMotions();
const allEyes = await fetchAllEyes();
const motionStates = Object.keys(allMotions);
const eyeStates = Object.keys(allEyes);
let currentMotionStateIndex = 0;
let currentEyeStateIndex = 0;
let motionState = motionStates[currentMotionStateIndex];
let eyeState = eyeStates[currentEyeStateIndex];
console.log("Motion states:", motionStates);
console.log("Eye states:", eyeStates);

function cycleMotionState() {
    // TODO: Add motion interpolation code.
    currentMotionFrameIndex = 0;
    currentMotionStateIndex = (currentMotionStateIndex + 1) % motionStates.length;
    motionState = motionStates[currentMotionStateIndex];
}

function cycleEyeState() {
    // TODO: Add eye interpolation code.
    currentEyeStateIndex = (currentEyeStateIndex + 1) % eyeStates.length;
    eyeState = eyeStates[currentEyeStateIndex];
    video.src = allEyes[eyeState];
    video.load(); // Must call after setting/changing source.
    video.play().then(() => {
        console.log("Video playback started successfully.");
    }).catch(error => {
        console.error("Error attempting to play video:", error);
    });
}

const openai = new OpenAI(
    {
        apiKey: import.meta.env.VITE_OAI_API_KEY,
        // TODO: Abstract this into a backend call eventually...
        dangerouslyAllowBrowser: true
    }
);

init();
animate();

  /**
   * type safe getElement utility function
   *
   * @param id safe getElement utility function
   * @returns the HTML element if found
   */
  function getElementById<T extends HTMLElement>(id: string): T | null {
    const element = document.getElementById(id);
    return element as T | null;
  }

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
    video.loop = true;
    video.muted = true; // Required to play without user interaction
    video.src = allEyes[eyeState];

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
        if (event.code === "KeyE") {
            event.preventDefault(); // Prevent any default action associated with the Space key
            cycleEyeState();
            console.log("Cycling eye state.")
        }
        if (event.code === "KeyM") {
            event.preventDefault();
            cycleMotionState();
            console.log("Cycling motion state.")
        }

    });

    // Add actions to certain buttons.
    const gptBtn = getElementById<HTMLButtonElement>('gpt-btn');
    gptBtn?.addEventListener('click', fetchChatCompletion);

}

function animate() {
    requestAnimationFrame(animate);
    // Random orientation for debugging. 
    const orientation = {
        pitch: Math.sin(Date.now() * 0.001) * Math.PI,
        yaw: Math.sin(Date.now() * 0.001) * Math.PI,
        roll: Math.cos(Date.now() * 0.001) * Math.PI,
    }
    loopThroughMotion();
    // let message = getMessageByTimestamp(Date.now());

    // // const orientation = getOrientationByIndex(currentIndex++);
    // updateOrientation(orientation.pitch, orientation.yaw, orientation.roll);
    renderer.render(scene, camera);
}

function loopThroughMotion() {
    const motion = allMotions[motionState];
    if (!motion || !motion.length) {
        console.error("Error: no motion detected for:", motion);
        return;
    }
    const now = performance.now();
    const elapsedTime = now - lastMessageTime;
    // Start_time
    if (currentMotionFrameIndex < motion.length - 1 && elapsedTime > motion[currentMotionFrameIndex + 1].timestamp - motion[currentMotionFrameIndex].timestamp) {
        const message = motion[currentMotionFrameIndex + 1];
        currentMotionFrameIndex = currentMotionFrameIndex + 1;
        lastMessageTime = now;
        updateOrientationMessage(message);
    }
    else if (currentMotionFrameIndex >= motion.length - 1) {
        console.log("Animation over.")
        currentMotionFrameIndex = 0;
    } else {
        // console.log("No need to update", currentMotionFrameIndex, lastMessageTime, motion[currentMotionFrameIndex+1].timestamp)
        // requestAnimationFrame(() => loopThroughMotion(motionName));
    }
}

function updateOrientationMessage(message) {
    const scalingFactor = 0.4;
    const shift = 23.0 * 5.0;
    switch (message.motor) {
        case 0:
            // pitch = message.value; 
            // pitch = message.value;
            yaw = (message.value - shift) * scalingFactor;
            break;
        case 1:
            pitch = (message.value - shift) * scalingFactor;
            break;
        case 2:
            roll = message.value * scalingFactor;
            break;
    }

    videoMesh.rotation.x = THREE.MathUtils.degToRad(pitch);
    videoMesh.rotation.y = THREE.MathUtils.degToRad(yaw);
    videoMesh.rotation.z = THREE.MathUtils.degToRad(roll);
}

function updateDebugInfo(pitch, yaw, roll, state): void {
    document.getElementById('pitchValue').textContent = pitch.toFixed(2);
    document.getElementById('yawValue').textContent = yaw.toFixed(2);
    document.getElementById('rollValue').textContent = roll.toFixed(2);
    document.getElementById('timestamp').textContent = performance.now().toFixed(2);
    document.getElementById('currentMotionState').textContent = motionState;
    document.getElementById('currentEyesState').textContent = eyeState;
}


function updateOrientation(pitch, yaw, roll): void {
    videoMesh.rotation.x = THREE.MathUtils.degToRad(pitch);
    videoMesh.rotation.y = THREE.MathUtils.degToRad(yaw);
    videoMesh.rotation.z = THREE.MathUtils.degToRad(roll);
}

function onWindowResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

setInterval(() => {
    updateDebugInfo(pitch, yaw, roll, "testState");
}, debugUpdateRate);  // Update every second for demonstration


async function fetchChatCompletion(): Promise<void> {
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: "You are a helpful assistant." }],
        model: "gpt-3.5-turbo",
      });
    console.log(completion.choices[0]);
    // try {
    //     const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': "application/json",
    //             'Authorization': `Bearer ${OAI_API_KEY}`
    //         },
    //         body: JSON.stringify({
    //             prompt: 'Call ChatGPT4 API',
    //             max_tokens: 100,
    //             temperature: 0.7,
    //             n: 1,
    //             stop: '\n'
    //         })
    //     });

    //     const responseData = await response.json();
    //     const completion = responseData.choices[0].text.trim();
    //     console.log(completion);
    // } catch (error) {
    //     console.error('Error calling ChatGPT4 API:', error);
    // }
}
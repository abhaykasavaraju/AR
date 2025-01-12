import * as THREE from 'three';

let xrSession = null;
let referenceSpace = null;
let hitTestSource = null;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// Function to start the AR session
async function startAR() {
    if (navigator.xr && await navigator.xr.isSessionSupported('immersive-ar')) {
        xrSession = await navigator.xr.requestSession('immersive-ar', {
            requiredFeatures: ['hit-test']
        });

        xrSession.addEventListener('end', onSessionEnded);
        referenceSpace = await xrSession.requestReferenceSpace('local');
        hitTestSource = await xrSession.requestHitTestSource({ space: referenceSpace });

        xrSession.requestAnimationFrame(onXRFrame);
    } else {
        console.error('AR not supported on this device.');
    }
}

// Function to handle the end of the AR session
function onSessionEnded() {
    xrSession = null;
    renderer.setAnimationLoop(null);
}

// Function to handle the XR frame
function onXRFrame(time, frame) {
    const hitTestResults = frame.getHitTestResults(hitTestSource);
    if (hitTestResults.length > 0) {
        const hitPose = hitTestResults[0].getPose(referenceSpace);
        // Update the cube's position based on hit test results
        cube.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z);
    }

    // Update the camera's position and orientation
    const cameraPose = frame.getViewerPose(referenceSpace);
    if (cameraPose) {
        const position = cameraPose.transform.position;
        camera.position.set(position.x, position.y, position.z);
        camera.quaternion.set(cameraPose.transform.orientation.x, cameraPose.transform.orientation.y, cameraPose.transform.orientation.z, cameraPose.transform.orientation.w);
    }

    renderer.render(scene, camera);
    xrSession.requestAnimationFrame(onXRFrame);
}

// Start the AR session when the page loads
window.addEventListener('load', startAR);
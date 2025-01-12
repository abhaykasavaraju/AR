let xrSession = null;
let hitTestSource = null;
let petModel = null;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const loader = new THREE.GLTFLoader();

document.getElementById('enter-ar').addEventListener('click', async () => {
    if (navigator.xr && await navigator.xr.isSessionSupported('immersive-ar')) {
        xrSession = await navigator.xr.requestSession('immersive-ar', {
            requiredFeatures: ['hit-test', 'dom-overlay'],
            domOverlay: { root: document.body }
        });
        xrSession.addEventListener('end', onSessionEnded);
        const referenceSpace = await xrSession.requestReferenceSpace('local');
        hitTestSource = await xrSession.requestHitTestSource({ space: referenceSpace });
        xrSession.requestAnimationFrame(onXRFrame);
    } else {
        console.error('AR not supported on this device.');
    }
});

function onSessionEnded() {
    xrSession = null;
    renderer.setAnimationLoop(null);
}

function onXRFrame(time, frame) {
    const hitTestResults = frame.getHitTestResults(hitTestSource);
    if (hitTestResults.length > 0) {
        const hitPose = hitTestResults[0].getPose(referenceSpace);
        if (petModel) {
            petModel.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z);
        }
    }
    renderer.render(scene, camera);
    xrSession.requestAnimationFrame(onXRFrame);
}

// Load the pet model
loader.load('dog_embedded.gltf', (gltf) => {
    petModel = gltf.scene;
    petModel.scale.set(0.5, 0.5, 0.5); // Adjust scale as needed
    scene.add(petModel);
}, undefined, (error) => {
    console.error('An error occurred while loading the model:', error);
});
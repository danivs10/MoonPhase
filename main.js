import * as THREE from 'three';
import './style.css';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import SunCalc from 'suncalc'; // Import the suncalc library
import { gsap } from 'gsap';

const canvas = document.querySelector('.webgl');
const submitButton = document.querySelector('.submit-button');
const datetimePicker = document.getElementById('datetimePicker');
const panelContainer = document.querySelector('.panel-container');
const purchaseButton = document.querySelector('.purchase-button');
const cancelButton = document.querySelector('.cancel-button');
const scene = new THREE.Scene();

//SETUP


//CREATE LIGHT
const light = new THREE.DirectionalLight(0xffffff, 1); // Use DirectionalLight instead of PointLight
light.position.set(-6, 0, 0); // Directional light doesn't need a position, but we keep it for reference
scene.add(light);

//LOAD MOON 3D
const loader = new GLTFLoader();
let moonModel; // Variable to hold the loaded moon 3D model
loader.load('./assets/moon.glb', (glb) => {
  moonModel = glb.scene;
  moonModel.scale.set(0.0025, 0.0025, 0.0025);
  moonModel.rotation.set(-0.2, -0.3, 0.2);
  scene.add(moonModel);
  const latitude = 53;
  const longitude = -2;
  const date = new Date("2023-07-6"); // Use the selected date from the datetime picker
  // Call the function to set the light to match the sun and move the camera to match the moon positions on the selected day
  setMoonPhaseLight(date, latitude, longitude, moonModel);

}, function (xhr) {
  console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, function (error) {
  console.error(error);
});


//SET WINDOW SIZES
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//CREATE CAMERA
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(-3, 0, 0); // Directional light doesn't need a position, but we keep it for reference
scene.add(camera);


//RENDER CANVAS
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 5));
renderer.shadowMap.enabled = true;
renderer.gammaOutput = true;

//ANIMATIONS

//CONTROLS ON THE ORBIT
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = false;
controls.enablePan = false;
controls.enableZoom = false;
controls.enableRotate = false;
controls.autoRotate = true;
//controls.autoRotateSpeed = 3;

//CALL THE ANIMATION AND THE LOOP
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

const loop = () => {
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(loop);
};
loop();
animate();



//EVENT LISTENERS

//SIZES RECALCULATION
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

//CANCEL INPUT DATE AND HIDE PANNEL
cancelButton.addEventListener('click', () => {
  panelContainer.classList.remove('show');
  controls.autoRotate = true;
  controls.autoRotateSpeed = 3;

  const selector = document.querySelector('.selector');
  selector.classList.remove("topped");
  const canv = document.querySelector('.webgl');
  canv.style.left = "0%";
  canv.style.top = "0%";
  const tl = gsap.timeline({ defaults: { duration: 2 } });
  tl.fromTo(".selector", { top:"20%" }, { top:"90%" });
});

//DATE HAS BEEN SET
datetimePicker.addEventListener('input', () => {
  const selectedDate = new Date(datetimePicker.value);

  // Check if a valid date is selected
  if (!isNaN(selectedDate.getTime())) {

    // Show the button with a delay and add the "show" class
    setTimeout(() => {
      submitButton.disabled = false;
    }, 500);
  } else {
    // Hide the button if an invalid date is selected
      submitButton.disabled = true;
  }
});

//DATE HAS BEEN SUBMITED
submitButton.addEventListener('mousedown', () => {
  controls.enableRotate = false;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0;
  camera.position.set(-3, 0, 0)

  const selector = document.querySelector('.selector');
  if (!selector.classList.contains("topped")) {
    const canv = document.querySelector('.webgl');
    canv.style.left = "-30%";
    canv.style.top = "5%";
    const tl = gsap.timeline({ defaults: { duration: 2 } });
    tl.fromTo(".selector", { top: "90%" }, { top: "20%" });
    selector.classList.add("topped");
  }

  const latitude = 53;
  const longitude = -2;
  const date = new Date(datetimePicker.value); // Use the selected date from the datetime picker


  panelContainer.classList.add('show');

  // Call the function to set the light to match the sun and move the camera to match the moon positions on the selected day
  setMoonPhaseLight(date, latitude, longitude, moonModel);
});



// Sample function to set moon's visibility and illumination based on moon phase
function setMoonPhaseLight(date, latitude, longitude, moonModel) {

  // Calculate the direction of the light (moon's position relative to the observer's position)
  const moonPosition = SunCalc.getMoonPosition(date, latitude, longitude);
  const lightDirection = new THREE.Vector3(
    -Math.cos(moonPosition.azimuth) * Math.cos(moonPosition.altitude),
    Math.sin(moonPosition.altitude),
    Math.sin(moonPosition.azimuth) * Math.cos(moonPosition.altitude)
  );
  lightDirection.normalize();

  // Calculate the angle to position the light to show the visible face of the moon
  const moonToSunDirection = new THREE.Vector3().copy(lightDirection).negate();

  // Create a plane using moonToSunDirection and the vertical plane normal
  const planeNormal = new THREE.Vector3();
  planeNormal.crossVectors(moonToSunDirection, new THREE.Vector3(0, 1, 0)).normalize();

  // Calculate the position of the light (sun) based on the moon angle and fraction of illumination
  const sunDistance = 6;
  const lightPosition = new THREE.Vector3(
    moonModel.position.x - moonToSunDirection.x * sunDistance,
    moonModel.position.y - moonToSunDirection.y * sunDistance,
    moonModel.position.z - moonToSunDirection.z * sunDistance
  );

  light.position.copy(lightPosition);

}

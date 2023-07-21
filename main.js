import * as THREE from 'three';
import './style.css';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import SunCalc from 'suncalc'; // Import the suncalc library
import { gsap } from 'gsap';

const canvas = document.querySelector('.webgl');
const scene = new THREE.Scene();

const light = new THREE.PointLight(0xffffff, 1);
light.position.set(10, 10, 3);
scene.add(light);

const loader = new GLTFLoader();
loader.load('./assets/moon.glb', (glb) => {
  const root = glb.scene;
  root.scale.set(0.0025, 0.0025, 0.0025);
  scene.add(root);

}, function (xhr) {
  console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, function (error) {
  console.error(error);
});

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 3);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 5));
renderer.shadowMap.enabled = true;
renderer.gammaOutput = true;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = false;
controls.enablePan = false;
controls.enableZoom = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 3;

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

// Function to rotate the moon model to face the camera's target
function rotateMoonModelToCameraTarget() {
  const moonModel = scene.getObjectByName("moonModel"); // Assuming the moon model has a name "moonModel"

  if (moonModel) {
    const target = new THREE.Vector3(); // Create a new target vector at the center of the scene (moon's position)
    moonModel.getWorldPosition(target); // Get the current world position of the moon model

    // Calculate the angle between the target vector and the moon model's position
    const angle = Math.atan2(target.y - moonModel.position.y, target.x - moonModel.position.x);

    // Apply the rotation to the moon model to face the camera's target
    gsap.to(moonModel.rotation, {
      z: angle,
    });
  }
}

// Update the camera's position and target based on the provided latitude and longitude
function updateCameraPosition(latitude, longitude) {
  const selectedDate = new Date(datetimePicker.value);
  const moonPosition = SunCalc.getMoonPosition(selectedDate, latitude, longitude);

  // Convert the moon's altitude and azimuth to radians
  const altitude = THREE.MathUtils.degToRad(moonPosition.altitude);
  const azimuth = THREE.MathUtils.degToRad(moonPosition.azimuth);

  // Calculate the camera position based on the moon's position
  const distance = 3; // Replace with the desired distance from the moon
  const x = distance * Math.cos(altitude) * Math.cos(azimuth);
  const y = distance * Math.cos(altitude) * Math.sin(azimuth);
  const z = distance * Math.sin(altitude);

  // Update the camera position and lookAt target

  gsap.to(camera.position, {
    x: x,
    y: y,
    z: z,
  });
  camera.position.set(x, y, z);
  camera.lookAt(0, 0, 0); // Look at the center of the scene (moon's position)
  rotateMoonModelToCameraTarget();
}


const submitButton = document.querySelector('.submit-button');
const loop = () => {

  const submitButton = document.querySelector('.submit-button');
  // Update the camera position at each frame to match the selected date's coordinates

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(loop);
};
function updateLighting(date, latitude, longitude) {
  // Calculate the sun's position based on the given date and location
  const sunPosition = SunCalc.getPosition(date, latitude, longitude);
  const moonPosition = SunCalc.getMoonPosition(date, latitude, longitude); // Calculate the moon's position

  // Convert the sun's altitude and azimuth to radians
  const altitude = THREE.MathUtils.degToRad(sunPosition.altitude);
  const azimuth = THREE.MathUtils.degToRad(sunPosition.azimuth);

  // Calculate the light direction from the altitude and azimuth
  const lightDirection = new THREE.Vector3(
    Math.cos(altitude) * Math.cos(azimuth),
    Math.cos(altitude) * Math.sin(azimuth),
    Math.sin(altitude)
  );

  // Adjust the light position based on the moon's position and direction vector
  const moonPositionVector = new THREE.Vector3(moonPosition.azimuth, moonPosition.altitude, 0);
  gsap.to(light.position, {
    x: moonPositionVector.multiplyScalar(5).x,
    y: moonPositionVector.multiplyScalar(5).y,
    z: moonPositionVector.multiplyScalar(5).z,
    duration: 1
  });
}

loop();
animate();



const datetimePicker = document.getElementById('datetimePicker');

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

submitButton.addEventListener('mousedown', () => {
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0;
  updateLighting(new Date(datetimePicker.value), 40.46527931670784, -3.687180296631809);

  

  const selector = document.querySelector('.selector');
  if (!selector.classList.contains("topped")){
    const canv = document.querySelector('.webgl');
    canv.style.left = "-30%";
    canv.style.top = "5%";
    const tl = gsap.timeline({ defaults: { duration: 2 } });
    tl.fromTo(".selector", { top:"90%" }, { top:"20%" });
    selector.classList.add("topped");
  }
  
  const latitude = 40.46527931670784;
  const longitude = -3.687180296631809; 
  updateCameraPosition(latitude, longitude);

  panelContainer.classList.add('show');
})



const panelContainer = document.querySelector('.panel-container');
const purchaseButton = document.querySelector('.purchase-button');
const cancelButton = document.querySelector('.cancel-button');


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

/*
const geometry = new THREE.SphereGeometry(3, 64, 64);

const material = new THREE.MeshStandardMaterial({
  color: "#00ff83",
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight, 
}

const light = new THREE.PointLight(0xffffff, 1, 100)
light.position.set(0, 10, 10)
scene.add(light)

const camera = new THREE.PerspectiveCamera(45, sizes.width/sizes.height, 0.1, 100);
camera.position.z = 20;
scene.add(camera);


const canvas = document.querySelector('.webgl');
const renderer = new THREE.WebGLRenderer({ canvas });

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(2);
renderer.render(scene, camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 5;

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

const loop = () => {
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(loop);
}
loop();



const tl = gsap.timeline({ defaults: { duration: 1 } });
tl.fromTo(mesh.scale, { z:0, x:0, y:0 }, { z:1, x:1, y:1 });
tl.fromTo("nav", { y:"-100%" }, { y:"0%" });
tl.fromTo(".title", { opacity:0 }, { opacity:1 });

let mouseDown = false;
let rgb = [];
window.addEventListener("mousedown", () => (mouseDown=true))
window.addEventListener("mouseup", () => (mouseDown=false))

window.addEventListener("mousemove", (e) => {
  if (mouseDown) {
    rgb = [
      Math.round((e.pageX/sizes.width)*255),
      Math.round((e.pageY/sizes.height)*255),
      150,
    ]


    let newColor = new THREE.Color(`rgb(${rgb.join(",")})`);
    gsap.to(mesh.material.color, {
      r: newColor.r,
      g: newColor.g,
      b: newColor.b,
    })

    console.log(newColor)
  }
});*/
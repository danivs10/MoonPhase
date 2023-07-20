import * as THREE from 'three';
import './style.css'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector('.webgl');
const scene = new THREE.Scene();


const loader = new GLTFLoader();
loader.load( './assets/moon.glb', ( glb ) => {
  console.log(glb);
  const root = glb.scene;
  root.scale.set(.0025, .0025, .0025);
  scene.add(root);
}, function (xhr){
  console.log((xhr.loaded/xhr.total * 100) + "% loaded")
}, function ( error ) {
	console.error( error );
} );


const light = new THREE.PointLight(0xffffff, 1)
light.position.set(0, 0, 3)
scene.add(light)


const sizes = {
  width: window.innerWidth,
  height: window.innerHeight, 
}


const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 3);
scene.add(camera);
 

const renderer = new THREE.WebGLRenderer({ canvas: canvas });

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true
renderer.gammaOutput = true;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

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
animate()
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
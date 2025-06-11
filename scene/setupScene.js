import * as THREE from 'three';

export function setupScene() {
  const scene = new THREE.Scene();

  // Load background image
  const loader = new THREE.TextureLoader();
  const backgroundTexture = loader.load('images/bg.png');
  scene.background = backgroundTexture;

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(2, 2, 5);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);


  const texture = loader.load('images/logo.png');
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const geometry = new THREE.PlaneGeometry(1, 1); // Adjust size as needed
  const imagePlane = new THREE.Mesh(geometry, material);
  imagePlane.position.set(-0.444, -0.32, -0.9);
  camera.add(imagePlane); 
  scene.add(camera);

  return { scene, camera, renderer };


  
}


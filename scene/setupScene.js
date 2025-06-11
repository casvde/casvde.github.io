import * as THREE from 'three';

export function setupScene() {
  const scene = new THREE.Scene();

  // Load background image
  const loader = new THREE.TextureLoader();
  const backgroundTexture = loader.load('images/bg.png');
  scene.background = backgroundTexture;

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(2, 2, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const texture = loader.load('images/logo.png');
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });

  const logoWidth = 2;
  const logoHeight = 2;
  const geometry = new THREE.PlaneGeometry(logoWidth, logoHeight);
  const imagePlane = new THREE.Mesh(geometry, material);


  function positionLogo() {
    const distance = 2; 
    const vFOV = THREE.MathUtils.degToRad(camera.fov);
    const height = 2 * Math.tan(vFOV / 2) * distance;

    const width = height * camera.aspect;


    const x = -width / 2 + logoWidth / 2 - 0.12;
    const y = -height / 2 + logoHeight / 2 - 0.79;
    const z = -distance;

    imagePlane.position.set(x, y, z);
  }

  camera.add(imagePlane);
  scene.add(camera);
  positionLogo();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    positionLogo();
  });

  return { scene, camera, renderer };
}

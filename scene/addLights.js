import * as THREE from 'three';

export function addLights(scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(3, 4, 5);
  scene.add(dirLight);
}

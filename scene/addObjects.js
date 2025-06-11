import * as THREE from 'three';

import { scene } from '../main.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';



function loadGLBModel(url, position = { x: 0, y: 0, z: 0 }, scale = 1, rotation = { x: 0, y: 0, z: 0 }) {
  const loader = new GLTFLoader();

  loader.load(
    url,
    (gltf) => {
      const model = gltf.scene;
      model.position.set(position.x, position.y, position.z);
      model.scale.setScalar(scale);
      model.rotation.set(rotation.x, rotation.y, rotation.z);

      scene.add(model);

        model.traverse((child) => {
            if (child.isMesh) {
              const original = child.material;
              child.material = new THREE.MeshBasicMaterial({
                map: original.map || null,
                color: original.color || new THREE.Color(0xffffff),
                transparent: original.transparent,
                opacity: original.opacity,
              });
            }
          });
        },
    undefined,
    (error) => {
      console.error('Error loading model:', error);
    }
  );
}




export function addObjects(scene) {
  const geometry = new THREE.PlaneGeometry(500, 500, 256, 256); 
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
      uniform float time;
      varying vec2 vUv;
      varying float vWave;

      void main() {
        vUv = uv;
        vec3 pos = position;
        float freq = 0.9;
        float amp = 0.03;
        pos.y += sin(pos.x * freq + time) * amp;
        pos.y += cos(pos.z * freq + time * 0.5) * amp * 0.5;
        vWave = pos.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying float vWave;

      void main() {
        vec3 color = vec3(0.2, 0.7, 1.0); // cyan
        color += vWave * 0.3; // slight shading by wave height
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.DoubleSide,
    flatShading: true,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = -0.2;
  scene.add(mesh);

  scene.userData.animateWater = (delta) => {
    material.uniforms.time.value += delta;
  };



  loadGLBModel(
  './island.glb',
  { x: 0, y: -0.45, z: 0 },         // position
  0.35,                           // scale
  { x: 0, y: Math.PI / 2, z: 0 } // rotation
);
}

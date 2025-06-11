import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';


import { setupScene } from './scene/setupScene.js';
import { addLights } from './scene/addLights.js';
import { addObjects } from './scene/addObjects.js';
import { createInstancedBillboards } from './scene/billboardPlaneHandler.js';



export let scene, camera, renderer, controls, composer;

async function init() {
  ({ scene, camera, renderer } = setupScene());

  setupControls();
  addLights(scene);
  addObjects(scene);
  setupPostprocessing();


  await loadBillboards();

  animate();
}

function setupControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enabled = true; 
}

function setupPostprocessing() {
  const renderPass = new RenderPass(scene, camera);

  const bayerShader = {
    uniforms: {
      tDiffuse: { value: null },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      pixelSize: { value:1 } 
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D tDiffuse;
      uniform vec2 resolution;
      uniform float pixelSize;

      float bayerDither4x4(int x, int y) {
        int index = y * 4 + x;
        float bayer[16];
        bayer[0] = 0.0 / 16.0;  bayer[1] = 8.0 / 16.0;  bayer[2] = 2.0 / 16.0;  bayer[3] = 10.0 / 16.0;
        bayer[4] = 12.0 / 16.0; bayer[5] = 4.0 / 16.0;  bayer[6] = 14.0 / 16.0; bayer[7] = 6.0 / 16.0;
        bayer[8] = 3.0 / 16.0;  bayer[9] = 11.0 / 16.0; bayer[10] = 1.0 / 16.0; bayer[11] = 9.0 / 16.0;
        bayer[12] = 15.0 / 16.0; bayer[13] = 7.0 / 16.0; bayer[14] = 13.0 / 16.0; bayer[15] = 5.0 / 16.0;
        return bayer[index];
      }

      float orderedDither(float color, float threshold) {
        float levels = 4.0;
        float quantized = floor(color * levels + threshold);
        return quantized / (levels - 1.0);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution;

        // Pixelation step
        vec2 pixelatedUV = floor(uv * resolution / pixelSize) * pixelSize / resolution;
        vec3 color = texture2D(tDiffuse, pixelatedUV).rgb;

        // Bayer dithering
        ivec2 pixelPos = ivec2(mod(gl_FragCoord.xy, 4.0));
        float threshold = bayerDither4x4(pixelPos.x, pixelPos.y);

        color.r = orderedDither(color.r, threshold);
        color.g = orderedDither(color.g, threshold);
        color.b = orderedDither(color.b, threshold);

        gl_FragColor = vec4(color, 1.0);
      }
    `
  };

  const bayerPass = new ShaderPass(bayerShader);


  composer = new EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(bayerPass);


  // Handle resizing
  window.addEventListener('resize', () => {
    bayerPass.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  });
}



async function loadBillboards() {
  const billboardConfigs = [
    {
      path: './images/WolfPilot.png',
      data: [
        { position: new THREE.Vector3(1.1, -0.13, 1.93), scale: 0.63, rotationOptions: { x: 0.5, y: 1, z: 1 } },
      ],
    },
    {
      path: './images/cas.png',
      data: [
        { position: new THREE.Vector3(1.5, -0.13, -1), scale: 0.8, rotationOptions: { x: 0.5, y: 1, z: 1 } },
      ],
    },
    {
      path: './images/LumiWhori2.png',
      data: [
        { position: new THREE.Vector3(0, -0.01, 0), scale: 1, rotationOptions: { x: 0.5, y: 1, z: 1 } },
      ],
    },
    {
      path: './images/yote.png',
      data: [
        { position: new THREE.Vector3(0.2, 0.03, -0.4), scale: 0.6, rotationOptions: { x: 0.5, y: 1, z: 1 } },
      ],
    },
    {
      path: './images/Glexes.png',
      data: [
        { position: new THREE.Vector3(1.8, -0.4, -1.4), scale: 0.6, rotationOptions: { x: 0.5, y: 1, z: 1 } },
      ],
    },
      {
      path: './images/melondragon.png',
      data: [
        { position: new THREE.Vector3(-0.6, -0.02, -1.3), scale: 1, rotationOptions: { x: 0.5, y: 1, z: 1 } },
      ],
    },
    {
      path: './images/tree.png',
      data: [
        { position: new THREE.Vector3(1, -0.01, 1.5), scale: 2.3, rotationOptions: { x: 0.5, y: 1, z: 1 } },
      ],
    },
    {
      path: './images/shack.png',
      data: [
        { position: new THREE.Vector3(-0.3, -0.5, 1.2), scale: 2, rotationOptions: { x: 0.5, y: 1, z: 1 } },
      ],
    },
  ];

  

  for (const { path, data } of billboardConfigs) {
    const billboard = await createInstancedBillboards(path, camera, data);
    scene.add(billboard);
  }
}


const audio = new Audio('./moozik.mp3');
audio.loop = true;
audio.muted = true;
audio.play(); 

document.body.addEventListener('click', () => {
  audio.volume = 0.5;
  audio.muted = false;
  audio.play();
});


let angle = 0;
let radius = 4.2;
let rotationSpeed = 0.0003;


const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  scene.userData.animateWater?.(delta);

  const elapsed = performance.now() / 1000;



  angle += rotationSpeed;
  camera.position.x = radius * Math.cos(angle);
  camera.position.z = radius * Math.sin(angle);
  camera.position.y = 1.4; 
  camera.lookAt(0, 0, 0);
    


  controls.update();
  composer.render();
}

init();

animate();

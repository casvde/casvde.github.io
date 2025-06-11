import * as THREE from 'three';
import { paTextureLoader } from './textureLoader.js';

/**
 * Creates a group of instanced billboards that always face the camera.
 *
 * @param {string} textureURL - URL to the texture image.
 * @param {THREE.Camera} camera - The camera the billboards will face.
 * @param {Array<Object>} instances - Array of instance config objects:
 *        - {THREE.Vector3} position
 *        - {number|THREE.Vector3} scale
 *        - {Object} rotationOptions
 * @returns {Promise<THREE.InstancedMesh>} The instanced mesh.
 */
export async function createInstancedBillboards(textureURL, camera, instances) {
	const textureLoader = new paTextureLoader();

	return new Promise((resolve, reject) => {
		textureLoader.load(
			textureURL,
			(texture) => {
				const aspect = texture.image.width / texture.image.height;
				const height = 1;
				const width = aspect * height;

				const geometry = new THREE.PlaneGeometry(width, height);
				geometry.translate(0, height / 2, 0);

				const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    alphaTest: 0.5,
				});

				const count = instances.length;
				const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
				const dummy = new THREE.Object3D();


				instancedMesh.userData.rotationOptionsArray = [];
				instancedMesh.userData.wawaArray = [];


				instances.forEach((config, i) => {
					const { position, scale, rotationOptions, wawa = 0 } = config;
				
					dummy.position.copy(position || new THREE.Vector3());
				
					if (typeof scale === 'number') {
						dummy.scale.set(scale, scale, scale);
					} else if (scale) {
						dummy.scale.copy(scale);
					}
				
					dummy.updateMatrix();
					instancedMesh.setMatrixAt(i, dummy.matrix);
				
					instancedMesh.userData.rotationOptionsArray[i] = rotationOptions;
					instancedMesh.userData.wawaArray[i] = wawa;
				});

				instancedMesh.onBeforeRender = function () {
					for (let i = 0; i < count; i++) {
						instancedMesh.getMatrixAt(i, dummy.matrix);
						dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

						const cameraQuat = camera.quaternion.clone();
						const euler = new THREE.Euler().setFromQuaternion(cameraQuat, 'YXZ');
						const ro = instancedMesh.userData.rotationOptionsArray[i] || {};
						const wawa = instancedMesh.userData.wawaArray[i];

                        const rx = ro.x ?? 1;
                        const ry = ro.y ?? 1;
                        const rz = ro.z ?? 1;
						

						if(wawa == 0){
							euler.x *= rx;
							euler.y *= ry;
							euler.z *= rz;
						}
						else{
							euler.x *= rx;
							euler.y = THREE.MathUtils.degToRad(wawa);
							euler.z *= rz;
						}


						dummy.quaternion.setFromEuler(euler);
						dummy.updateMatrix();

						instancedMesh.setMatrixAt(i, dummy.matrix);

					}
					instancedMesh.instanceMatrix.needsUpdate = true;
				};

				resolve(instancedMesh);
			},
			undefined,
			(err) => reject(err)
		);
	});
}

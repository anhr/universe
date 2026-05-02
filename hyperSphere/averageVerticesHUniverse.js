/**
 * @module averageVerticesHUniverse
 * @description average vertices for hyperspherical universe.
 *
 * @author [Andrej Hristoliubov]{@link https://github.com/anhr}
 *
 * @copyright 2011 Data Arts Team, Google Creative Lab
 *
 * @license under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
*/

import averageVertices from '../../../commonNodeJS/master/HyperSphere/distanceOfVertices/averageVerticesHSphere.js';
import WebGPUHUniverse from './webGPUHUniverse.js';

averageVertices.WebGPU = WebGPUHUniverse;
/*
const sAverageVerticesHUniverse = 'averageVerticesHUniverse';

const webGPUHUniverse = new WebGPUHUniverse();
try {
	await webGPUHUniverse.findAdapters();
} catch (e) {
	const sError = sAverageVerticesHUniverse + ': ' + e.message;
	//console.error(sError);
alert(sError);
}
*/
export default averageVertices;
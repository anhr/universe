/**
 * @module GPUThomsonEngine
 * @description Solving the [Thomson Problem]{@link https://en.wikipedia.org/wiki/Thomson_problem} for a [hypersphere]{@link https://en.wikipedia.org/wiki/N-sphere} on a graphics processing unit (GPU).
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

import GPUEngine from './GPUEngine.js'

class GPUThomsonEngine extends GPUEngine {
	constructor (){
     super();
     this.engineName = () => { return 'Thomson problen for hypersphere'; }
     this.addElements = () => { return `
		<div>PROGRESS: <span id="stepCounter">0</span> / <span id="totalStepsDisplay">0</span> | R: <span id="radVal">0.00</span> </div>
		<div>Points Per Step: <span id="pointsPerStep">---</span></div>
      `; }
    }
}
export default GPUThomsonEngine
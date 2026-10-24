/**
 * @module GPUTAEngine
 * @description GPU (WebGPU) ускорение анализа распределения точек [Thomson Problem]{@link https://en.wikipedia.org/wiki/Thomson_problem} на S^3.
 *
 * Архитектура: tiled reduction.
 *  - Каждая воркгруппа из TILE=256 потоков обрабатывает один тайл из TILE точек i
 *    для одного timeId t.
 *  - Внутри проходим по всем j, используя shared memory для координат.
 *  - Глобальные буферы только O(marks*N), без marks*N².
 *  - Радиус r индивидуален для каждого timeId (storage-буфер rArray).
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

class GPUTAEngine extends GPUEngine {
	constructor (){
		super();
		this.engineName = () => { return 'Thomson Analysis for hypersphere'; }
		this.type = () => { return 'gpuThomsonAnalysis'; }
		this.addElements = () => { return `
	<div>PROGRESS: <span id="stepCounter">0</span> / <span id="totalStepsDisplay">0</span> | R: <span id="radVal">0.00</span> </div>
	<div>Points Per Step: <span id="pointsPerStep">---</span></div>
		`; }
	}
}
export default GPUTAEngine
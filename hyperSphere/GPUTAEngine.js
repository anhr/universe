/**
 * @module GPUTAEngine
 * @description GPU (WebGPU) ускорение анализа распределения точек [Thomson Problem]{@link https://en.wikipedia.org/wiki/Thomson_problem} на S^3
 * на отдельной веб станице.
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
import * as ThomsonAnalysisGPU from './TAGPU.js';

class GPUTAEngine extends GPUEngine {
	constructor (){
		super();
		this.engineName = () => { return 'Thomson Analysis for hypersphere'; }
		this.type = () => { return 'gpuThomsonAnalysis'; }
		this.createShaderCode = () => { return ThomsonAnalysisGPU.tiledShaderWGSL; }
		this.paramsBufferSize = ThomsonAnalysisGPU.paramsBufferSize;
		this.createEntries = () => { ThomsonAnalysisGPU.createEntries(this); }
	}
}
export default GPUTAEngine
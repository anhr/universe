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
/*
		this.onmessage = async (event) => {
			if (typeof event.data === 'string') {
				const data = JSON.parse(event.data);
				switch (data.type) {
					case "START_COMPUTE":
						this.config = data;
						count = this.config.totalSteps * this.config.pointsPerStep;
						document.getElementById('pointsPerStep').innerText = this.config.pointsPerStep;
						document.getElementById('totalStepsDisplay').innerText = this.config.totalSteps;
						this.elStatus.innerText = "CONFIG RECEIVED";
						const clientText = event.origin || "Localhost";
						this.elClient.innerText = clientText;

						const stateText = document.getElementById('stateText');
						stateText.innerHTML = 'Main page ' + clientText;
						stateText.style.color = "#00ffcc";

						currentStep = 1;
						this.log('Start compute. Source: ' + clientText);
						break;
					case "MAIN_DISCONNECTED":
						this.elStatus.innerText = "IDLE";
						if (this.config) currentStep = this.config.totalSteps - 1;
						this.log('Main page disconnected.');
						break;
					case "PROGRESS":
						progressStep(data.currentStep);
						break;
					default:
						const error = 'socket message: Invalid data.type: ' + data.type;
						this.setState(error, true);
				}
			} else {
				// Двоичные данные
				this.elStatus.innerText = "Binary data received";
				positionArray = new Float32Array(event.data);
				try {
					await this.runAuto();
				} catch (e) {
					this.elStatus.innerText = "ERROR";
					this.cleanupGpuResources();
					this.setState(this.sError + e.message, true);
				}
			}
		}
*/
		this.engineName = () => { return 'Thomson Analysis for hypersphere'; }
		this.type = () => { return 'gpuThomsonAnalysis'; }
	}
}
export default GPUTAEngine
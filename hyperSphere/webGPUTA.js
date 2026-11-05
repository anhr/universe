/**
 * @module WebGPUTA
 * @description GPU (WebGPU) ускорение анализа распределения точек [Thomson Problem]{@link https://en.wikipedia.org/wiki/Thomson_problem} на S^3.
 * <pre>
 * 
 * Analysis the iterative process known as [Thomson problem]{@link https://en.wikipedia.org/wiki/Thomson_problem} in which, at each step, all vertices gradually move toward a position in which the vertices are at the maximum distance from each other on the hypersphere.
 * You can see results of Analysis in the console of the web page and on a small graph in the rigth top corner of the canvas.
 * 
 * Архитектура: tiled reduction.
 *  - Каждая воркгруппа из TILE=256 потоков обрабатывает один тайл из TILE точек i
 *    для одного timeId t.
 *  - Внутри проходим по всем j, используя shared memory для координат.
 *  - Глобальные буферы только O(marks*N), без marks*N².
 *  - Радиус r индивидуален для каждого timeId (storage-буфер rArray).
 *
 * </pre>
 * @license under the Apache License, Version 2.0
 */

//import * as Spinner from '../../Spinner.js';
import * as Spinner from '../../../commonNodeJS/master/Spinner.js';
import WebGPUClient from './webGPUClient.js'
//import { dat } from '../../../commonNodeJS/master/dat/dat.module.js';

//const sWebGPUTA = 'WebGPUTA';


// ============================================================================
// 2. WEBGPU-ОЦЕНЩИК (tiled reduction)
// ============================================================================

class WebGPUTA extends WebGPUClient {

	/**
	 * Analysis the iterative process known as [Thomson problem]{@link https://en.wikipedia.org/wiki/Thomson_problem} in which, at each step, all vertices gradually move toward a position in which the vertices are at the maximum distance from each other on the hypersphere.
	 * You can see results of Analysis in the console of the web page and on a small graph in the rigth top corner of the canvas.
	 */
	constructor(classSettings, createGraph) {
		super();
		const marks = classSettings.settings.options.playerOptions.marks;
		this.webGPUPage = () => { return '<a href="../webGPUTA.html" target="_blank" style="color: blue;">Thomson Analysis Engine</a>'; }
		this.pageType = () => { return 'mainThomsonAnalysis'; }
		this.name = () => { return ' Thomson Analysis' }
		this.onmessageString = (aTomsonAnalysisRes) => {
			createGraph(aTomsonAnalysisRes);
			Spinner.hide();
		}
		this.setElRow = () => {}
		this.createCProgress = () => {}
		this.setCurrentStep = () => {}
		this.sendData = () => {
			Spinner.show();
			const rArray = new Float32Array(marks);
			
			for (let timeId = 0; timeId < marks; timeId++) {
				rArray[timeId] = classSettings.overriddenProperties.rTime(timeId);
			}
/*            
			for (let t = 0; t < marks; t++) {
				const r = rTimeResolver ? rTimeResolver(t) : 1;
				rArray[t] = (typeof r === 'number' && r > 0) ? r : 1;
			}
*/   
			this.sendBinary("RADS", rArray);
		}
	}
}
export default WebGPUTA;

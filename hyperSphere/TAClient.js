/**
 * @module ThomsonAnalysisWebGPU
 * @description GPU (WebGPU) ускорение анализа распределения точек [Thomson Problem]{@link https://en.wikipedia.org/wiki/Thomson_problem} на S^3.
 *
 * Архитектура: tiled reduction.
 *  - Каждая воркгруппа из TILE=256 потоков обрабатывает один тайл из TILE точек i
 *    для одного timeId t.
 *  - Внутри проходим по всем j, используя shared memory для координат.
 *  - Глобальные буферы только O(marks*N), без marks*N².
 *  - Радиус r индивидуален для каждого timeId (storage-буфер rArray).
 *
 * @license under the Apache License, Version 2.0
 */

//import * as Spinner from '../../Spinner.js';
import * as Spinner from '../../../commonNodeJS/master/Spinner.js';
import WebGPUClient from './webGPUClient.js'

const sThomsonAnalysisWebGPU = 'ThomsonAnalysisWebGPU';


// ============================================================================
// 2. WEBGPU-ОЦЕНЩИК (tiled reduction)
// ============================================================================

class WebGPUTA extends WebGPUClient {

    constructor(classSettings) {
		super();
	    this.webGPUPage = () => { return '<a href="../webGPUTA.html" target="_blank" style="color: blue;">Thomson Analysis Engine</a>'; }
	    this.pageType = () => { return 'mainThomsonAnalysis'; }
        this.name = () => { return ' Thomson Analysis' }
        this.setElRow = () => {}
        this.createCProgress = () => {}
        this.setCurrentStep = () => {}
        this.sendData = () => {
            const marks = classSettings.settings.options.playerOptions.marks;
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

/**
 * @module GPUEngine
 * @description [WebGPU]{@link https://gpuweb.github.io/gpuweb/}. GPU Compute on the web.
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

class GPUEngine {
	constructor() {
     this.engineStatusElement = () => { return `
	<div class="engine-status">
		<h3>ENGINE: ` + this.engineName() + `</h3>
		<div>VIDEO CARD: <select id="gpuSelect"><option value="-1">Search for video cards...</option></select></div>
		<div>STATUS: <span id="status">IDLE</span></div>
		<div>SOURCE: <span id="client">---</span></div>
        ` + (this.addElements ? this.addElements() : '') + `
		<div>ELAPSE TIME: <span id="timeResult" class="timer">---</span></div>
		<div id="socket-status">
			<strong>Socket Status:</strong> <span id="stateText">Waiting for connection to server...</span><br>
		</div>
	</div>
	<div id="log"></div>
  `; }
    }
}
export default GPUEngine;
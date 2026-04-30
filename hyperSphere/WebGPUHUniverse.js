/**
 * @module WebGPU
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

const sWebGPU = 'WebGPU';

class WebGPUHUniverse {

	constructor() {

		// --- WebGPU: СЕРДЦЕ СИСТЕМЫ ---
		let device, pipeline, posBuf, velBuf, paramBuf, debugBuf, messageArray,
			anglesBufGPU, bindGroup;
		let availableAdapters = [];
		const adaptersName = [];
		async function getSafeAdapterName(adapter, index) {
			if (!adapter) return `${index + 1}. Unknown device`;
			let name = sWebGPU + " Adapter";
			if (adapter.info) name = adapter.info.description || adapter.info.vendor || name;
			return `${index + 1}. ${name}`;
		}

		this.findAdapters = async () => {
			const sFindAdaptersFailed = 'Find adapters failed.';
			if (!navigator.gpu) {
				throw new Error(sWebGPU + ': ' + sFindAdaptersFailed + ' ' + sWebGPU + ' is not supported');
				return false;
			}
			if (navigator.gpu.enumerateAdapters) availableAdapters = await navigator.gpu.enumerateAdapters();
			if (availableAdapters.length === 0) {
				const high = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
				if (high) availableAdapters.push(high);
                else {
					throw new Error(sWebGPU + ': ' + sFindAdaptersFailed + ' No available adapters');
					return false;
				}
			}

			//adapters name array
			for (let i = 0; i < availableAdapters.length; i++) {
				const displayName = await getSafeAdapterName(availableAdapters[i], i);
				adaptersName.push(displayName);
			}
			return true;
		}

	}

}

export default WebGPUHUniverse;

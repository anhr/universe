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

/*
Technical Guide: Enabling High-Performance GPU for Google Chrome
If you notice that your WebGPU computations are running slower in Google Chrome compared to other browsers, it is likely because Windows is running Chrome on the integrated (Power Saving) GPU instead of your dedicated (High Performance) Graphics Card.

Follow these steps to force Google Chrome to use your high-performance GPU:

Step 1: Open Graphics Settings
Press the Windows Key on your keyboard or click the Start icon.

Type "Graphics settings" in the search bar and press Enter.

This will open the System > Display > Graphics menu.

Step 2: Locate or Add Google Chrome
Scroll down to the "Custom options for apps" section.

Look for Google Chrome in the list.

If Chrome is NOT in the list:

Click the "Browse" button under "Add an app".

Navigate to the following path (copy and paste this into the address bar of the file picker):
C:\Program Files\Google\Chrome\Application\

Select chrome.exe and click Add.

Step 3: Set High Performance Preference
Once Google Chrome appears in the list, click on it once to expand the options.

Click the "Options" button.

A "Graphics preference" window will pop up. Select "High performance" (this should list your dedicated GPU, e.g., NVIDIA or AMD).

Click "Save".

Step 4: Restart Chrome
Close all open Google Chrome windows.

Relaunch the browser for the changes to take effect.

You can verify the active GPU by typing chrome://gpu in the address bar and looking for the "GL_RENDERER" field.
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

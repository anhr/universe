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

//import MyThree from '../../../commonNodeJS/master/myThree/myThree.js';
//import MyThree from '../../../commonNodeJS/master/myThree/build/myThree.module.js';
//import MyThree from '../../../commonNodeJS/master/myThree/build/myThree.module.min.js';
//import MyThree from 'https://raw.githack.com/anhr/commonNodeJS/master/myThree/myThree.js';
//import MyThree from 'https://raw.githack.com/anhr/commonNodeJS/master/myThree/build/myThree.module.js';
//import MyThree from 'https://raw.githack.com/anhr/commonNodeJS/master/myThree/build/myThree.module.min.js';
const MyThree = window.__myThree__;

import ProgressBar from '../../../commonNodeJS/master/ProgressBar/ProgressBar.js'
import * as utils from '../../../commonNodeJS/master/HyperSphere/utilsHSphere.js'
import WebGPUClient from '../../../commonNodeJS/master/HyperSphere/webGPUClient.js'


const sWebGPU = 'WebGPUHUniverse';

class WebGPUHUniverse extends WebGPUClient {

	constructor() {
		super();
		let //socket
//			elRow,//окно статуса выполнения вычислений на GPU
//			setStatus, updateDisplay, start,
			currentStep, radiusPrev, cProgress;
		this.isDataReady//true: вычисление точек на GPU успешно завершено.
		this.pageType = () => { return 'main'; }
	    this.name = () => { return ' Thomson' }
		this.createCProgress = (elProgress, config) => {
			if (cProgress) console.error(sWebGPU + ':createCProgress(). Duplicate cProgress')
			cProgress = document.createElement('input');
			cProgress.min = 0;
			cProgress.max = config.totalSteps - 1;
			cProgress.value = 0;
			cProgress.type = "range";
			cProgress.disabled = true;
			elProgress.appendChild(cProgress);
		}
		this.updateDisplay = () => {
			stepCounter.innerText = currentStep;
			radVal.innerText = radiusPrev.toFixed(2);
			timeResult.innerText = `${((performance.now() - this.start) / 1000).toFixed(3)}`;
			cProgress.value = currentStep;
		}
		this.setCurrentStep = (currentStepNew) => { currentStep = currentStepNew; }
		this.resetSocket = () => {
			if(socket) {
				if(socket.readyState != WebSocket.CLOSED) console.error(sWebGPU + ' reset socket: Invalid socket state = ' + socket.readyState);
				socket = null;
			}
			this.start = performance.now();
			currentStep = 1;
		}
		this.onmessageObject = (event, config, settings) => {
			//Vertices positions

			const posData = new Float32Array(event.data), pointsPerStep = config.pointsPerStep, count = config.totalSteps * pointsPerStep, THREE = MyThree.three.THREE;
			const position = settings.bufferGeometry.attributes.position;
			position.copyArray(posData);
			position.needsUpdate = true;

			if (settings.debug && settings.debug.log) {
				for (let i = 0; i < count; i++) {
					const pointCur = new THREE.Vector4().fromBufferAttribute(position, i);
					const pointAngles = utils.cartesianToPolar(pointCur);
					console.log('Step:' + (parseInt(i / pointsPerStep)) + ' Point:' + i + '. x=' + pointCur.x + ' y=' + pointCur.y + ' z=' + pointCur.z + ' w=' + pointCur.w + ',alt=' + pointAngles.altitude + ' lat=' + pointAngles.latitude + ' lon=' + pointAngles.longitude);
				}
			}

			//color
			let i = pointsPerStep;
			const progressTitle = 'Load vertices<br>Vertice %s / ' + count, progressBar = new ProgressBar(settings.options.renderer.domElement.parentElement, () => {
				if (i >= count) {
					progressBar.remove();
					//								if (settings.onUniverseReady) settings.onUniverseReady();
					return;
				}
				const attributeColor = settings.bufferGeometry.attributes.color;
				const iEnd = i + 100000, times = settings.object.geometry.times, colorItemSize = attributeColor.itemSize;
				let timesLength = times.length,
					// time,Если я буду использовать time вместо times[timeId] то непонято почему time превращается в undefined при angles.count = 124875 и marks = 134 и если GPU выдает предупреждение: Binding size (267732000) of [Buffer (unlabeled)] is larger than the maximum storage buffer binding size (134217728). Не могу поймать этот момент

					//Вершины группируются группами с одинаковым timeId.
					//В этих группах цвет вершин одинаковый.
					//Поэтому нет необходимости вычислять цвет каждой вершины.
					//Вместо этого вычисляется цвет первой вершины в группе time.color = point, а цвет остальных вершин в группе приравнивается цвету первой вершины в группе.
					timeIdGroup,
					color;//Цвет текущей группы вершин
				while ((i < iEnd) && (i < count)) {
					const timeId = parseInt(i / config.pointsPerStep);
					if (timeId >= timesLength) {
						timesLength = times.length;
					}
					let index = i * colorItemSize;
					const point = { x: posData[index++], y: posData[index++], z: posData[index++], w: posData[index++], };
					if (
						(timeIdGroup === undefined) ||//Первая группа вершин
						(timeIdGroup != timeId)//Новая группа вершин
					) {
						timeIdGroup = timeId;
						times[timeId].color = point;
						color = new THREE.Vector4().fromBufferAttribute(attributeColor, i);
					} else attributeColor.setXYZW(i, color.x, color.y, color.z, color.w);
					if (config.LOG) {
						const angles = utils.cartesianToPolar(point, config.DEBUG_MODE);
						const color = new MyThree.three.THREE.Vector4().fromBufferAttribute(attributeColor, i);
						console.log('Step:' + (parseInt(timeId)) + ' Point:' + i + '. x=' + point.x + ' y=' + point.y + ' z=' + point.z + ' w=' + point.w + ',alt=' + angles.altitude + ' lat=' + angles.latitude + ' lon=' + angles.longitude);
						console.log('color: x=' + color.x + ' y=' + color.y + ' z=' + color.z + ' w=' + color.w);
					}
					settings.options.player.setSelectSceneIndex(timeId);
					i++;
				}

				settings.overriddenProperties.setDrawRange(0, i);// * position.itemSize);
				progressBar.value = i;
				progressBar.title(progressTitle.replace('%s', i));
				progressBar.step();
			}, {

				sTitle: progressTitle,
				max: count,

			});

			this.updateDisplay();
			this.socket.close();
			btnClose.style.display = "";//сделать кнопку видимой
			this.isDataReady = true;
			//						if (config.onDataReady) config.onDataReady()
			if (settings.options.onDataReady) settings.options.onDataReady()
		}
		this.onmessageString = (data, hyperSphere) => {
			switch (data.type) {
				case "PROGRESS":
					currentStep = data.currentStep;
					radiusPrev = data.radiusPrev;
					this.updateDisplay();
					hyperSphere.onSelectSceneEnd(currentStep);
					break;
				default: console.error(sWebGPU + ': socket message: Invalid data.type: ' + data.type);
			}
		}
		this.setElRow = (config, settings) => {
			settings.options.player.onStep = () => {
				// Проигрыватель выполнил шаг вперед
				const socket = this.socket;
				if (socket && socket.readyState === WebSocket.OPEN)
					socket.send(JSON.stringify({ type: "PROGRESS", currentStep: currentStep + 1 }));
			}
			
			currentStep = 1;
			radiusPrev = config.baseRadius;
			
//			if (elRow) return;
		}
	}
}

export default WebGPUHUniverse;

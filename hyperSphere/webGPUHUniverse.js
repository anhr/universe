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

import MyThree from '../../../commonNodeJS/master/myThree/myThree.js';
//import MyThree from '../../../commonNodeJS/master/myThree/build/myThree.module.js';
//import MyThree from '../../../commonNodeJS/master/myThree/build/myThree.module.min.js';
//import MyThree from 'https://raw.githack.com/anhr/commonNodeJS/master/myThree/myThree.js';
//import MyThree from 'https://raw.githack.com/anhr/commonNodeJS/master/myThree/build/myThree.module.js';
//import MyThree from 'https://raw.githack.com/anhr/commonNodeJS/master/myThree/build/myThree.module.min.js';

import ProgressBar from '../../../commonNodeJS/master/ProgressBar/ProgressBar.js'
import * as utils from '../../../commonNodeJS/master/HyperSphere/utilsHSphere.js'

const sWebGPU = 'WebGPU';

class WebGPUHUniverse {

	constructor(/*onerror*/) {

		const serverAddress = 'ws://localhost:5000/ws?type=main';
		let socket;
		this.isDataReady//true: вычисление точек на GPU успешно завершено.
		this.compute = (computeCPU, config, settings, hyperSphere) => {
			this.isDataReady = false;
			if (!socket) {

				//progress window
				let cProgress, elProgress, elTitle, elParent = settings.options.renderer.domElement.parentElement;
				const setStatus = (message, code = 1) => {
					let color = "red", display = '';
					//See D:\My documents\MyProjects\webgl\three.js\GitHub\universe\main\hyperSphere\UniverseSocketServer\Program.cs
					switch(code) {
						case 0://error
							socket.close();
							break;
					    case 1://Ready to work.
							color = "black";
							display = 'none';
							break;
					    case 2://Waiting for Hypersphere Universe Engine...
							message += ' Please open <a href="../webGPUHUniverse.html" target="_blank" style="color: blue;">Hypersphere Universe Engine</a> page'
							break;
						default: console.error(sWebGPU + '.compute: Invalud socket status code = ' + code);
					}
					stateText.innerHTML = message;
					stateText.style.color = color;
					btnCPU.style.display = display;
					btnClose.style.display = display;
				}
				
				elProgress = document.createElement('div');
				cProgress = document.createElement('input'),
				elProgress.style.backgroundColor = 'white';
				elProgress.style.margin = '2px';
				elProgress.style.padding = '2px';
				
				elTitle = document.createElement('div');
//					elTitle.innerHTML = 'GPU';
				elTitle.innerHTML = 'GPU<div id="socket-status">'
						+ '<strong>Server Address:</strong> <span>' + serverAddress + '</span><br>'
						+ '<strong>Socket Status:</strong> <span id="stateText">Waiting for connection to server...</span><br>'
						+ '<strong>Step:</strong> <span id="stepCounter">0</span> / <span>' + config.totalSteps + '</span> | R: <span id="radVal">' + config.baseRadius + '</span><br>'
						+ '<strong>Elapsed Time:</strong> <span id="timeResult">---</span> sec.<br>'
/*					
						+ '<div id="info">Step: <span id="stepCounter">0</span> / <span id="totalStepsDisplay">0</span> | R: <span id="radVal">0.0</span>'
				        + '    <span id="timeResult" class="timer"></span>'
//				        + '    <span id="activeGpu"></span>'
				        + '</div>'
*/						
						+ '<button type="button" id="btnCPU" title="Use CPU for computation" style="display: none;">CPU</button>'
						+ '<button type="button" id="btnClose" title="Close this window" style="display: none;">Close</button>'
					+ '</div>';
				
				const btnCPU = elTitle.querySelector("#btnCPU");
				btnCPU.onclick =  () => {
					elcontainer.remove();
					if (socket.readyState === WebSocket.OPEN) socket.close();
					computeCPU();
				}

				const btnClose = elTitle.querySelector("#btnClose");
				btnClose.onclick = () => {
					elcontainer.remove();
					if (socket.readyState === WebSocket.OPEN) socket.close();
				}

				//info
				const stepCounter = elTitle.querySelector("#stepCounter");
				const radVal = elTitle.querySelector("#radVal");
				const timeResult = elTitle.querySelector("#timeResult");
	            const start = performance.now();
				
				elTitle.style.color = 'black';
				elProgress.appendChild(elTitle);

				if (settings.min === undefined) settings.min = 0;
				cProgress.min = 0;
				cProgress.max = config.totalSteps - 1;
				cProgress.value = 0;
				cProgress.type = "range";
				cProgress.disabled = true;
				elProgress.appendChild(cProgress);
		
				let elcontainer;
				const containerName = 'ProgressContainer';
				for (let i = 0; i < elParent.children.length; i++) {
		
					const child = elParent.children[i];
					if (child.name && (child.name === containerName)) {
		
						elcontainer = child;
						break;
		
					}
		
				}
				if (!elcontainer) {
		
					elcontainer = document.createElement('table');
					elcontainer.name = containerName;
					elcontainer.style.position = 'absolute';
					elcontainer.style.top = 0;
					elcontainer.style.left = 0;
					elParent.appendChild(elcontainer);
		
				}
				const elRow = document.createElement('tr');
				elRow.appendChild(elProgress);
				elcontainer.appendChild(elRow);

				//Progress window end
				
		        let currentStep = 1;
		        let radiusPrev = config.baseRadius;
		        const updateDisplay = () => {
		            stepCounter.innerText = currentStep;
		            radVal.innerText = radiusPrev.toFixed(2);
		            timeResult.innerText = `${((performance.now() - start) / 1000).toFixed(3)}`;
					cProgress.value = currentStep;
		        }
				
				socket = new WebSocket(serverAddress);
				socket.binaryType = 'arraybuffer';

				// 1. Обработка ошибок (неверный адрес, отказ в соединении)
				socket.onerror = (error) => {
					setStatus('ERROR: Server unreachable or incorrect address. <a href="https://github.com/anhr/universe/blob/main/hyperSphere/HUniverseEngine.md" target="_blank" style="color: blue;">Help</a>.', 0);
					btnCPU.style.display = "";//сделать кнопку видимой
					btnClose.style.display = "";//сделать кнопку видимой
				};

				// 2. Обработка закрытия соединения (сервер отключился в процессе)
				socket.onclose = (event) => {
					if (typeof stateText === "undefined") return;
					if (event.wasClean) {
                        stateText.innerText = event.reason ? event.reason : "The connection was closed successfully.";
						if (event.code === 4001) stateText.style.color = "#ff4444";  // Эта страница уже открыта
					} else {
                        function rgbToHex(rgbString) {
							// Находим числа. Если совпадений нет, вернется пустой массив [] вместо null
							const rgb = rgbString.match(/\d+/g)?.map(Number) || [];
							// Если это был не RGB формат (массив пустой или в нем не 3 числа)
							if (rgb.length < 3) return rgbString;
							
							// Переводим каждое число в HEX и дополняем нулями слева, если нужно
							return "#" + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
                        }
						const color = rgbToHex(stateText.style.color);
                        if ((color != "#ff4444") && (color != "red")) {//Не маскировать сообщение об ошибке
							let error = '';
							if (event.code != 1006) {
	                            const rfcLink = "https://datatracker.ietf.org/doc/html/rfc6455#section-7.4.1";
	                            const mozillaLink = 'https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code'
	                            const errorDetail = event.reason ? `Reason: ${event.reason}` : `Error Code: ${event.code}`;
	                            error = ` ${errorDetail}. See RFC: ${rfcLink}, mozilla: ${mozillaLink}`;
							}
	                        const sMessage = `The connection was closed.` + error
	
	                        stateText.innerText = sMessage;//"СВЯЗЬ ПРЕРВАНА (Сервер упал или ошибка сети).";
	                        stateText.style.color = "#00ffcc";
                        }
					}
				};
				// 3. Успешное подключение
				socket.onopen = () => {
/*					
					const config = {
						type: 'START_COMPUTE',
						DEBUG_MODE: DEBUG_MODE,
						RANDOM_POINTS: RANDOM_POINTS,
						DAMPING: DAMPING,
						REPULSION_STRENGTH: REPULSION_STRENGTH,
						PSEUDO_RANDOM: PSEUDO_RANDOM,
						p: p,
						baseRadius: baseRadius,
						radiusMax: radiusMax,
						totalSteps: totalSteps,
						pointsPerStep: pointsPerStep
					};
*/
/*
					socket.send(JSON.stringify(config));

					const anglesItemSize = 4, initialAngles = new Float32Array(config.pointsPerStep * anglesItemSize), angles = settings.object.geometry.angles;
					settings.bufferGeometry.userData.timeId--;//Углы вершин брать из предыдущего шага проигрывателя
					for (let i = 0; i < config.pointsPerStep; i++) {
						let index = i * anglesItemSize;
						const vertuceAngles = angles[i];
						initialAngles[index++] = vertuceAngles.latitude; initialAngles[index++] = vertuceAngles.longitude; initialAngles[index++] = vertuceAngles.altitude;
					}
					settings.bufferGeometry.userData.timeId++;
					socket.send(initialAngles.buffer);
*/
					
				};
				settings.options.player.onStep = () => {
					// Проигрыватель выполнил шаг вперед
					if (socket && socket.readyState === WebSocket.OPEN)
						socket.send(JSON.stringify({ type: "PROGRESS", currentStep: currentStep + 1 }));
				}					
				socket.onmessage = (event) => {
//					console.log('socket.onmessage: ' + (typeof event.data === 'string' ? JSON.parse(event.data).type : typeof event.data === 'object' ? 'object' : 'Unknown event.data type'))
					if (typeof event.data === 'string') {
						const data = JSON.parse(event.data);

						switch (data.type) {
							case "STATUS":
								setStatus(data.message, data.code);
								if (data.code === 1) {
									//Connection established. Ready to work.
				/*					
									const config = {
										type: 'START_COMPUTE',
										DEBUG_MODE: DEBUG_MODE,
										RANDOM_POINTS: RANDOM_POINTS,
										DAMPING: DAMPING,
										REPULSION_STRENGTH: REPULSION_STRENGTH,
										PSEUDO_RANDOM: PSEUDO_RANDOM,
										p: p,
										baseRadius: baseRadius,
										radiusMax: radiusMax,
										totalSteps: totalSteps,
										pointsPerStep: pointsPerStep
									};
				*/
									socket.send(JSON.stringify(config));

									const anglesItemSize = 4, initialAngles = new Float32Array(config.pointsPerStep * anglesItemSize), angles = settings.object.geometry.angles;
									settings.bufferGeometry.userData.timeId--;//Углы вершин брать из предыдущего шага проигрывателя
									for (let i = 0; i < config.pointsPerStep; i++) {
										let index = i * anglesItemSize;
										const vertuceAngles = angles[i];
										initialAngles[index++] = vertuceAngles.latitude; initialAngles[index++] = vertuceAngles.longitude; initialAngles[index++] = vertuceAngles.altitude;
									}
									settings.bufferGeometry.userData.timeId++;
									socket.send(initialAngles.buffer);
								}
								break;
							case "PROGRESS":
								currentStep = data.currentStep;
								radiusPrev = data.radiusPrev;
								updateDisplay();
								hyperSphere.onSelectSceneEnd(currentStep);
								break;
							default: console.error(sWebGPU + ': socket message: Invalid data.type: ' + data.type);
						}
					} else if (typeof event.data === 'object') {
						//Vertices positions
						const position = settings.bufferGeometry.attributes.position;
						position.copyArray(new Float32Array(event.data)); 
						position.needsUpdate = true;

						//color
						const posData = new Float32Array(event.data), count = config.totalSteps * config.pointsPerStep;
						let i = config.pointsPerStep;
						const progressTitle = 'Load vertices<br>Vertice %s / ' + count, progressBar = new ProgressBar(settings.options.renderer.domElement.parentElement, () => {
							if (i >= count) {
								progressBar.remove();
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
//									time = times[timeId];//add item to times
									timesLength = times.length;
								}
								let index = i * colorItemSize;
								const point = { x: posData[index++], y: posData[index++], z: posData[index++], w: posData[index++],};
//								times[timeId].color = point;
								if (
									(timeIdGroup === undefined) ||//Первая группа вершин
									(timeIdGroup != timeId)//Новая группа вершин
								) {
									timeIdGroup = timeId;
//									time.color = point;
									times[timeId].color = point;
									color = new MyThree.three.THREE.Vector4().fromBufferAttribute(attributeColor, i);
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
						
						updateDisplay();
						socket.close();
						btnClose.style.display = "";//сделать кнопку видимой
						this.isDataReady = true;
					} else console.error(sWebGPU + ': socket message: Invalid event.data type: ' + (typeof event.data));
				};
				return;
			}
			switch(socket.readyState){
				case WebSocket.CLOSED://3 —  (Закрыто)
					computeCPU();//Не удалось соедениться с сервером вычислений на GPU. Делаем вычисления на CPU.
					break;
				case WebSocket.OPEN://1 —  (Открыто)
					break;//Выполняется следующий шаг проигрывателя
				case WebSocket.CONNECTING://0 —  (Подключение)
				case WebSocket.CLOSING://2 —  (Закрывается)
				default: console.error(sWebGPU + '.compute: Invalid socket.readyState = ' + socket.readyState);
			}
		}
	}
}

export default WebGPUHUniverse;

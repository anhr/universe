/**
 * @module Universe
 * @description Base class for n dimensional hypersphere universe.
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

//Получаю ошибку
//[!] (cleanup plugin) SyntaxError: Unexpected token (88:9)
//..\..\..\three.js\dev\src\Three.js(88: 9)
//При выполнении "npm run build"
//import * as THREE from '../../three.js/dev/src/Three.js';
//////////////////////////////////////////

import * as THREE from '../../three.js/dev/build/three.module.js';
//import * as THREE from 'https://threejs.org/build/three.module.js';
//import * as THREE from 'https://raw.githack.com/anhr/three.js/dev/build/three.module.js';

import MyThree from '../../commonNodeJS/master/myThree/myThree.js';
//import MyThree from '../../../commonNodeJS/master/myThree/build/myThree.module.js';
//import MyThree from '../../../commonNodeJS/master/myThree/build/myThree.module.min.js';
//import MyThree from 'https://raw.githack.com/anhr/commonNodeJS/master/myThree/myThree.js';
//import MyThree from 'https://raw.githack.com/anhr/commonNodeJS/master/myThree/build/myThree.module.js';
//import MyThree from 'https://raw.githack.com/anhr/commonNodeJS/master/myThree/build/myThree.module.min.js';
MyThree.three.THREE = THREE;

import { dat } from '../../commonNodeJS/master/dat/dat.module.js';

const sUniverse = 'Universe';

class Universe
{
	/**
	 * Base class for n dimensional hypersphere universe.
	 * @param {object} [classSettings={}] See <a href="../../../commonNodeJS/master/HyperSphere/jsdoc/module-HyperSphere-HyperSphere.html" target="_blank">HyperSphere classSettings</a> parameter.
	 * @param {Array} [classSettings.settings.object.geometry.timesAngles] Array of vertices angles for different time of the <a href="../../../commonNodeJS/master/player/jsdoc/" target="_blank">player</a>.
	 * Every item of the <b>timeAngles</b> array is array of the vertices angles. See <b>classSettings.settings.object.geometry.angles</b> of the <a href="../../../commonNodeJS/master/HyperSphere/jsdoc/module-HyperSphere-HyperSphere.html" target="_blank">HyperSphere</a> for details
	 * @param {object} [myThreeOptions={}] See <a href="../../../commonNodeJS/master/myThree/jsdoc/module-MyThree-MyThree.html" target="_blank">MyThree optionss</a> parameter.
	 */
	constructor(classSettings = {}, myThreeOptions = {}) {

		const _this = this;
		myThreeOptions.playerOptions ||= {};
		myThreeOptions.playerOptions.interval = myThreeOptions.playerOptions.interval != undefined ? myThreeOptions.playerOptions.interval : Infinity;
		myThreeOptions.scales = myThreeOptions.scales || {};
		myThreeOptions.scales.x = myThreeOptions.scales.x || {};
		myThreeOptions.scales.y = myThreeOptions.scales.y || {};
		myThreeOptions.scales.w = myThreeOptions.scales.w || {};
		myThreeOptions.scales.text = myThreeOptions.scales.text || {};
		myThreeOptions.scales.text.precision = myThreeOptions.scales.text.precision != undefined ? myThreeOptions.scales.text.precision : 1;
		myThreeOptions.scales.text.rect = myThreeOptions.scales.text.rect || {};
		myThreeOptions.scales.text.rect.displayRect = myThreeOptions.scales.text.rect.displayRect != undefined ? myThreeOptions.scales.text.rect.displayRect : false;

		myThreeOptions.playerOptions = myThreeOptions.playerOptions || {};
		if (myThreeOptions.playerOptions.min === undefined) myThreeOptions.playerOptions.min = 0.1;

		//w
		myThreeOptions.scales.w = new Proxy(myThreeOptions.scales.w, {

			get: (rRange, name) => {
				
				switch (name) {

					//цвета вершин зависит от текущего времени в проигрывателе
					case 'min': return rRange.min != undefined ? rRange.min : myThreeOptions.playerOptions.min;
					case 'max': return rRange.max != undefined ? rRange.max : myThreeOptions.playerOptions.max;
					case 'isColor': return false;

				}
				return rRange[name];
				
			},

		});
		classSettings.rRange = classSettings.rRange || myThreeOptions.scales.w;
		myThreeOptions.orbitControls = myThreeOptions.orbitControls || {};
		myThreeOptions.orbitControls.enableRotate = myThreeOptions.orbitControls.enableRotate != undefined ? myThreeOptions.orbitControls.enableRotate : false;

		myThreeOptions.camera = myThreeOptions.camera || {};
		if (myThreeOptions.camera.position) {

			if (myThreeOptions.camera.position instanceof Array === true)
				myThreeOptions.camera.position = new THREE.Vector3(myThreeOptions.camera.position[0], myThreeOptions.camera.position[1], myThreeOptions.camera.position[2]);
		}
		else myThreeOptions.camera.position = new THREE.Vector3(0, 0, 2);

		myThreeOptions.canvas = myThreeOptions.canvas || {};
		myThreeOptions.canvas.noButtonFullScreen = myThreeOptions.canvas.noButtonFullScreen != undefined ? myThreeOptions.canvas.noButtonFullScreen : true;

		new MyThree((scene, options) => {

			//classSettings.projectParams ||= {};//Эта строка выдает ошибку "[!] (cleanup plugin) SyntaxError: Unexpected token (63:36)" при выполнении команды "npm run build"
			classSettings.projectParams = classSettings.projectParams || {};
			classSettings.projectParams.scene = scene;

			classSettings.settings = classSettings.settings || {};
			classSettings.settings.object = classSettings.settings.object || {};
			classSettings.settings.object.name = classSettings.settings.object.name || this.name(options.getLanguageCode);

			if (classSettings.settings.object.color === undefined) classSettings.settings.object.color = (timeId) => { return options.player.getTime(timeId); }

			classSettings.projectParams.scene.userData.endSelect = () => {}

			classSettings.settings.isSetPosition = true;//при выполнении шага в Player не надо вычислять позицию вершин в самом Player
			classSettings.settings.object.geometry.rCount = options.playerOptions.marks;//количество возможных радиусов вселенной
			{//hide times

				const times = classSettings.settings.object.geometry.times;
				if (times) {
					
					const timesLength = times.length;
					if (timesLength > 0 ) classSettings.settings.object.geometry.timesLength = timesLength;

				}
/*				
				const timesAngles = classSettings.settings.object.geometry.timesAngles;
				if (timesAngles) {
					
					const timesAnglesLength = timesAngles.length;
					if (timesAnglesLength > 0 )classSettings.settings.object.geometry.timeAnglesLength = timesAnglesLength;

				}
*/				

			}

			{//hide geometryAngles

				const geometryAngles = classSettings.settings.object.geometry.angles;
//				classSettings.settings.object.geometry.timesAngles = new Proxy(classSettings.settings.object.geometry.timesAngles || [], {
				classSettings.settings.object.geometry.times = new Proxy(classSettings.settings.object.geometry.times || [], {

					get: (times, name) => {

						const timeId = parseInt(name);
						if (!isNaN(timeId)) {

							if (timeId === 0) return times[timeId] || geometryAngles;
							if (!times[timeId]) {

								if (times.length != timeId) console.error(sUniverse + ': get times[' + timeId + '] failed. Invalid timeId = ' + timeId);
								times[timeId] = new Proxy([], {

									get: (timeAngles, name) => {

										const verticeId = parseInt(name);
										if (!isNaN(verticeId))
//											return timeAngles[verticeId];
											return new Proxy(timeAngles[verticeId], {

												get: (verticeAngles, name) => {

													switch (name) {

														case 'edges': return times[0][verticeId].edges;
															
													}
													return verticeAngles[name];
													
												}
												
											});
										switch (name) {

											case 'player': return this.hyperSphere.anglesPlayer(timeId);

										}
										return timeAngles[name];

									},
									set: (timeAngles, name, value) => {

										timeAngles[name] = value;
										const timeAnglesId = parseInt(name);
										if (!isNaN(timeAnglesId)) this.hyperSphere.setPositionAttributeFromPoint(timeAnglesId, undefined, timeId);
										return true;

									},

								});

							}
							return times[timeId];

						}
						switch (name) {

							case 'length': if (times.length === 0) return 1;
								break;

						}
						return times[name];

					},
/*
					get: (timeAngles, name) => {
	
						const timeId = parseInt(name);
						if (!isNaN(timeId)) {
	
							if (timeId === 0) return timeAngles[timeId] || geometryAngles;
							if (!timeAngles[timeId]) {

								if (timeAngles.length != timeId) console.error(sUniverse + ': get timeAngles[' + timeId + '] failed. Invalid timeId = ' + timeId);
								timeAngles[timeId] = new Proxy([], {

									get: (timeAngles, name) => {
										
										const verticeId = parseInt(name);
										if (!isNaN(verticeId)) {

											return timeAngles[verticeId];

										}
										switch (name) {
	
											case 'player': return this.hyperSphere.anglesPlayer(timeId);
												
										}
										return timeAngles[name];
										
									},
									set: (timeAngles, name, value) => {
					
										timeAngles[name] = value;
										const timeAnglesId = parseInt(name);
										if (!isNaN(timeAnglesId)) this.hyperSphere.setPositionAttributeFromPoint(timeAnglesId, undefined, timeId);
										return true;
										
									},
									
								});

							}
							return timeAngles[timeId];
	
						}
						switch (name) {

							case 'length': if (timeAngles.length === 0) return 1;
								break;
								
						}
						return timeAngles[name];
						
					},
*/
					set: (times, name, value) => {

						const timeId = parseInt(name);
						if (!isNaN(timeId)) {

							const timeAngles0 = times[0];
							times[timeId] = new Proxy(value, {

								get: (timeAngles, name) => {

									switch (name) {

										case 'isTimeAnglesProxy': return true;
										case 'player':
											if (!this.hyperSphere) {

//не помню зачем эта строка
//												if (timeId != 0) console.error(sUniverse + ': set timeAngles, get player. Invalid timeId = ' + timeId);
												
												const t = classSettings.settings.options.player.getTime(timeId);
												return {

													id: timeId,
													t: t,
													r: t * classSettings.r,

												}

											};
											return this.hyperSphere.anglesPlayer(timeId);
										case 'forEach': return (item) => {

											for (let verticeId = 0; verticeId < timeAngles0.length; verticeId++) {

												const verticeAngles = timeAngles[verticeId];
												item(verticeAngles ? verticeAngles : timeAngles0[verticeId], verticeId);

											}

										}
										case 'length':
											if (timeId > 0) return timeAngles0.length;
											return timeAngles.length != undefined ? timeAngles.length : 0;

									}
									const verticeId = parseInt(name);
									if (!isNaN(verticeId)) {

										let verticeAngles = timeAngles[verticeId];
										if (!verticeAngles || ((verticeAngles[verticeId] === undefined) && timeId > 0))
//										if (!verticeAngles)
										{

											if (timeId === 0) {

												console.error(sUniverse + ': get vertice angles failed. Invalid timeId = ' + timeId);
												return;

											}
											//похоже если вершины для данного timeId нет, то берется вершина из предыдущего timeId
//											verticeAngles = timeAngles[timeId - 1][verticeId];
											verticeAngles = times[timeId - 1][verticeId];
										}
//										const verticeAnglesLength = timeId > 0 ? times[0][0].length : undefined;
										return new Proxy(verticeAngles, {

											get: (verticeAngles, name) => {

												const angleId = parseInt(name);
												if (!isNaN(angleId)) {

/*													
													if (classSettings.debug) {

														const maxAngles = classSettings.dimension - 1;
														if (verticeAngles.length > maxAngles) console.error(sUniverse + ': Invalid classSettings.settings.object.geometry.times[' + timeId + '][' + verticeId + '].length = ' + verticeAngles.length + '. Every vertice is limited to ' + maxAngles + ' angles.');

													}
*/													
													const angle = verticeAngles[angleId];
													if (angle === undefined) {

														if (timeId === 0) return 0;
														else return times[timeId - 1][verticeId][angleId];
														
													}
													return angle;
													
												}
												switch (name) {

													case 'length': 
														const maxAngles = classSettings.dimension - 1;
														if (classSettings.debug && (verticeAngles.length > maxAngles)) console.error(sUniverse + ': Invalid classSettings.settings.object.geometry.times[' + timeId + '][' + verticeId + '].length = ' + verticeAngles.length + '. Every vertice is limited to ' + maxAngles + ' angles.');
														return maxAngles;
//														return classSettings.dimension - 1;
														//if (verticeAnglesLength != undefined) return verticeAnglesLength;
														//_this.dimension - 1;
														//if (timeId > 0) return times[0][0].length;
														//break;
														
												}
												return verticeAngles[name];
												
											},
											
										});

									}
									return timeAngles[name];

								},

							});

						}
						else times[name] = value;
						return true;

					},
/*
					set: (timeAngles, name, value) => {

						const timeId = parseInt(name);
						if (!isNaN(timeId)) {

							const timeAngles0 = timeAngles[0];
							timeAngles[timeId] = new Proxy(value, {

								get: (timeAngles, name) => {

									switch (name) {

										case 'isTimeAnglesProxy': return true;
										case 'player': 
											if (!this.hyperSphere) {

												if (timeId != 0) console.error(sUniverse + ': set timeAngles, get player. Invalid timeId = ' + timeId);
												const t = classSettings.settings.options.player.getTime(timeId);
												return {

													id: timeId,
													t: t,
													r: t * classSettings.r,
														
												}
												
											};
											return this.hyperSphere.anglesPlayer(timeId);
										case 'forEach': return (item) => {
										
											for (let verticeId = 0; verticeId < timeAngles0.length; verticeId++) {

												const verticeAngles = timeAngles[verticeId];
												item(verticeAngles ? verticeAngles : timeAngles0[verticeId], verticeId);

											}
											
										}
										case 'length':
											if (timeId > 0) return timeAngles0.length;
											return timeAngles.length != undefined ? timeAngles.length : 0;
											
									}
									const verticeId = parseInt(name);
									if (!isNaN(verticeId)) {
										
										let verticeAngles = timeAngles[verticeId];
										if (!verticeAngles) {

											if (timeId === 0) {
												
												console.error(sUniverse + ': get vertice angles failed. Invalid timeId = ' + timeId);
												return;

											}
											verticeAngles = timeAngles[timeId - 1][verticeId];
										}
										return verticeAngles;

									}
									return timeAngles[name];
									
								},
								
							});
							
						}
						else timeAngles[name] = value;
						return true;
						
					},
*/
					
				});

			}
			classSettings.settings.object.geometry = new Proxy(classSettings.settings.object.geometry, {

				get: (geometry, name) => {

					switch (name) {

						case 'angles': 
/*							
							const timesAngles = geometry.timesAngles;
							if (timesAngles.length === 0) return;
							else if (timesAngles.length === 1) return timesAngles[0];
							const timeId = classSettings.settings.guiPoints.timeId, angles0 = timesAngles[0];
							let angles = timesAngles[timeId === undefined ? 0 : timeId];
*/							
							const times = geometry.times;
							if (times.length === 0) return;
							else if (times.length === 1) return times[0];
							const timeId = classSettings.settings.guiPoints.timeId, angles0 = times[0];
							let angles = times[timeId === undefined ? 0 : timeId];
							
							if (!(angles instanceof Array)) {
								
								const array = [];
								Object.keys(angles).forEach((key) => array[key] = angles[key]);
								angles = array;

							}
							
							return new Proxy(angles, {
								
								get: (angles, name) => {

									switch (name) {

										case 'ranges': return angles0[name];
											
									}
									return angles[name];
									
								},
								set: (angles, name, value) => {

									switch (name) {

										case 'ranges': angles0[name] = value; break;
										default: angles[name] = value;
											
									}
									
									return true;
									
								},
								
							});
						case 'position': 
							if (!geometry.playerPosition) {
								
								geometry.playerPosition = new Proxy([], {
	
									get: (playerPosition, name) => {
	
										const timeId = parseInt(name);
										if (!isNaN(timeId)) {
	
											const playerPositionItem0 = playerPosition[0];
											if ((timeId != 0) && !playerPosition[timeId]) return new Proxy([], {
	
												get: (playerPositionItem, name) => {
	
													switch (name) {
	
														case 'length': {

															const length = playerPositionItem0.length;
//															const length = playerPositionItemLength;
															if (classSettings.debug && (length != classSettings.settings.object.geometry.angles.length))
																console.error(sUniverse + ': get player position item failed! Invalid length = ' + length);
															return length;
	
														}
														case 'angles': return classSettings.settings.object.geometry.times[timeId];
//														case 'angles': return classSettings.settings.object.geometry.timesAngles[timeId];
															
													}
													const playerIndexItemId = parseInt(name);
													if (!isNaN(playerIndexItemId)) {
	
														const userData = classSettings.settings.bufferGeometry.userData, playerIndexOld = userData.timeId;
														userData.timeId = timeId;
														const vertice = userData.position[playerIndexItemId];
														userData.timeId = playerIndexOld;
														return vertice;
														
													}
													return playerPositionItem[name];
													
												},
												
											});
											return playerPosition[timeId];
					
										}
										return playerPosition[name];
										
									},
									
								});

								//иммитация наследования классов
								classSettings.overriddenProperties ||= {};
								const overriddenProperties = classSettings.overriddenProperties, settings = classSettings.settings;
								overriddenProperties.oppositeVertice ||= (oppositeAngleId, timeId) => { return geometry.playerPosition[timeId - 1][oppositeAngleId]; }
								if (!overriddenProperties.position) Object.defineProperty(overriddenProperties, 'position', { get: () => { return geometry.playerPosition[settings.bufferGeometry.userData.timeId]; }, });
								if (!overriddenProperties.position0) Object.defineProperty(overriddenProperties, 'position0', { get: () => { return geometry.playerPosition[0]; }, });
								overriddenProperties.updateVertices ||= (vertices) => { this.hyperSphere.bufferGeometry.attributes.position.needsUpdate = true; }
								overriddenProperties.vertices ||= () => {}
								overriddenProperties.r ||= (timeId) => { return settings.object.geometry.times[timeId != undefined ? timeId : 0].player.r; }
								overriddenProperties.pushMiddleVertice ||= (timeId, middleVertice) => { geometry.times[timeId].push(middleVertice); }
								overriddenProperties.angles ||= (anglesId, timeId) => { return settings.object.geometry.times[timeId][anglesId]; }
								overriddenProperties.verticeAngles ||= (anglesCur, verticeId) => {

									const guiPoints = settings.guiPoints;
									return guiPoints.timeAngles[guiPoints.verticeId != undefined ? guiPoints.verticeId : verticeId];
									
								}
								overriddenProperties.verticeText ||= (intersection, text) => {

									const times = settings.object.geometry.times;
									let index = 0;
									for (let i = 0; i < times.length; i++) {

										const timeAngles = times[i];
										index += timeAngles.length;
										if (index > intersection.index) {

											index = intersection.index - index + timeAngles.length;
											return text(timeAngles, index);
											
										}
										
									}
									
								}
								overriddenProperties.text ||= (tab, timeAngles, lang) => {
									
									return '\n' + tab + 'time Id: ' + timeAngles.player.id
										+ '\n' + tab + 't: ' + timeAngles.player.t
										+ '\n' + tab + lang.radius + ': ' + timeAngles.player.r;
								
								}
								overriddenProperties.onSelectSceneEndSetDrawRange ||= (timeId) => {

									const appendTimesChild = classSettings.settings.guiPoints.appendTimesChild;
									if (appendTimesChild) appendTimesChild(undefined, timeId);
									
									if (classSettings.edges.project === false) return;//Ребра не отбражаются на холсте. Не нужно устанавливать bufferGeometry.drawRange в зависимость от индекса ребер.
									this.hyperSphere.setEdgesRange();
/*									
									const bufferGeometry = settings.bufferGeometry, drawRange = bufferGeometry.drawRange;
									bufferGeometry.attributes.position.needsUpdate = true;
									bufferGeometry.setDrawRange(drawRange.start, (settings.object.geometry.indices[0].timeEdgesCount * (timeId + 1) * 2) - drawRange.start);
*/									
									
								}
								settings.overriddenProperties.setDrawRange = (start, count) => { settings.bufferGeometry.setDrawRange(start, count); }
								settings.overriddenProperties.getPlayerTimesLength = () => { return settings.object.geometry.times.length; }

							}
							return geometry.playerPosition[classSettings.settings.options.player.getTimeId()];

					}
					return geometry[name];
					
				},
				set: (geometry, name, value) => {

					switch (name) {

						case 'angles':
//							geometry.timesAngles[0] = value;
							geometry.times[0] = value;
							return true;
						case 'position':
							geometry.playerPosition[0] = value;
							return true;

					}
					geometry[name] = value;
					return true;
					
				},
				
			});
			const block = 'block', none = 'none';
			classSettings.settings.guiPoints = {

				get timeAngles() { return classSettings.settings.object.geometry.times[this.timeId]; },
				//for debug
				//set timeAngles(value) { console.warn(sUniverse + ': set classSettings.settings.guiPoints.timeAngles is deprecated'); },

				seletedIndex: (guiIndexStr) => {

					let guiIndex = parseInt(guiIndexStr);
					if (isNaN(guiIndex)) return guiIndexStr;
					const anglesLength = classSettings.settings.object.geometry.angles.length;
					while (guiIndex > anglesLength) guiIndex -= anglesLength;
					return guiIndex;

				},
				setControllers: (index) => {

					const guiPoints = classSettings.settings.guiPoints;
					guiPoints.getVerticeId(index);
					guiPoints.changeControllers();

				},
				getVerticeId: (index, timesItemCallBack) => {

					if (
						!timesItemCallBack && (
							(index === undefined) ||
							(classSettings.settings.guiPoints.verticeId === undefined)
						)
					) return index;

					//User has mouse clicked a vertice

					let anglesCount = 0, timeIdSelected;
					const guiPoints = classSettings.settings.guiPoints;
					classSettings.settings.object.geometry.times.forEach((timeAngles, timeId) => {

						if (timesItemCallBack) timesItemCallBack(timeAngles, timeId);
						const anglesCountOld = anglesCount;
						anglesCount += timeAngles.length;
						if ((index >= anglesCountOld) && (index < anglesCount)) {

							const verticeId = index - anglesCountOld;
							if ((guiPoints.verticeId != verticeId) || (guiPoints.timeId != timeId)) {

								timeIdSelected = timeId;
								guiPoints.timeId = timeId;
								guiPoints.verticeId = verticeId;

							}

						}

					});
					return guiPoints.verticeId;

				},
				pointsStyleDisplay: none,
				create: (fPoints, cPoints, count, intersectionSelected) => {

					//Localization

					const lang = {

						notSelected: 'Not selected',
						time: 'Time',
						timeTitle: 'Position of vertices at selected time',

					};

					const options = classSettings.settings.options;
					switch (options.getLanguageCode()) {

						case 'ru'://Russian language
							lang.notSelected = 'Не выбран';
							lang.time = 'Время';
							lang.timeTitle = 'Выбрать список вершин в выбранное время';
							break;

					}

					const cTimes = fPoints.add({ Points: lang.notSelected }, 'Points', { [lang.notSelected]: -1 }), guiPoints = classSettings.settings.guiPoints;
					dat.controllerNameAndTitle(cTimes, lang.time, lang.timeTitle);

					//Переместить список Time вверх
					const elBefore = fPoints.__ul.children[1], elLast = fPoints.__ul.children[fPoints.__ul.children.length - 1];
					fPoints.__ul.removeChild(elLast);
					fPoints.__ul.insertBefore(elLast, elBefore);

					const times = classSettings.settings.object.geometry.times, cPointsStyle = cPoints.domElement.parentElement.parentElement.style;
					cTimes.onChange((timeId) => {

						const selectPoints = cPoints.__select;
						options.guiSelectPoint.selectPoint(-1);
						while (selectPoints.length > 1) selectPoints.removeChild(selectPoints.lastChild);
						timeId = parseInt(timeId);
						if (isNaN(timeId)) {

							console.error(sUniverse + ': cTimes.onChange. Invalid timeId = ' + timeId);
							return;

						}
						const anglesLength = classSettings.settings.object.geometry.angles.length, hyperSphereObject = this.hyperSphere.object();
						let display, start, end;
						if (timeId != -1) {
							
							display = block;
							start = timeId;
							end = timeId + 1;
								
							guiPoints.timeId = timeId;
							guiPoints.timeAngles.forEach((verticeAngles, verticeId) => {
	
								const opt = document.createElement('option');
								opt.innerHTML = verticeId;
								opt.setAttribute('value', verticeId);
								selectPoints.appendChild(opt);
	
							});
							hyperSphereObject.userData.myObject.guiPoints.getPositionId = (timeAnglesId) => {
	
								if (timeAnglesId >= anglesLength) {

									//не выводить сообщение об ошибке если пользователь проводит мышкой над вершиной.
									if (!hyperSphereObject.userData.myObject.guiPoints.boMouseOver) console.error(sUniverse + ': guiPoints.getPositionId. Invalid timeAnglesId = ' + timeAnglesId);
									return timeAnglesId;
	
								}
								return timeId * anglesLength + timeAnglesId;
							
							}

						} else {
							
							display = none;
							start = 0;
							end = classSettings.settings.options.player.getTimeId() + 1;
							hyperSphereObject.userData.myObject.guiPoints.getPositionId = (timeAnglesId) => { return timeAnglesId; }
							
						}
						if (classSettings.edges.project)
							this.hyperSphere.setEdgesRange(start, end);
						else this.hyperSphere.setVerticesRange(anglesLength * start, anglesLength * (end - start));
						cPointsStyle.display = display;
						guiPoints.pointsStyleDisplay = cPointsStyle.display;
						let positionOffset = 0;
						for (let i = 0; i < timeId; i++) positionOffset += times[i].length;

						guiPoints.positionOffset = positionOffset;

					});
					guiPoints.appendTimesChild = (time, timeId) => {

						const opt = document.createElement('option');

						if (time === undefined) time = classSettings.settings.options.player.getTime(timeId);
						opt.innerHTML = time;

						if (timeId != undefined) opt.setAttribute('value', timeId);
						cTimes.__select.appendChild(opt);
						return opt;

					}
//						const timeId = guiPoints.timeId;
					guiPoints.getVerticeId(intersectionSelected ? intersectionSelected.index : undefined, (timeAngles, timeId) => { guiPoints.appendTimesChild(timeAngles.player.t, timeId); });
					guiPoints.changeControllers = () => {

						if (guiPoints.timeId === undefined) return;
							
						const timesSelectedIndex = guiPoints.timeId + 1;
//						if (cTimes.selectedIndex === timesSelectedIndex) return;
						if (cTimes.__select.selectedIndex === timesSelectedIndex) return;
						cTimes.__onChange(guiPoints.timeId);
						cTimes.__select[timesSelectedIndex].selected = true;
							
						if (guiPoints.verticeId === undefined) return;
						cPoints.__select[guiPoints.verticeId + 1].selected = true;
							
					}
					guiPoints.changeControllers();

				},
				getValue: (cPoints) => {

					const value = cPoints.getValue();
					if (isNaN(value)) return -1;//точка не выбрана
					return parseInt(value);

				},

			}

			classSettings.anglesObject2Array = () => {

				const settings = classSettings.settings, times = settings.object.geometry.times;
				if (times.length > settings.options.playerOptions.marks) console.warn(sUniverse + ': anglesObject2Array. Invalid classSettings.settings.object.geometry.times.length = ' + times.length);
				times.forEach((timeAngles, timeId) => {

					//Непонятно зачем эта проверка
//					if (timeAngles.isTimeAnglesProxy) return;

					if (timeAngles instanceof Array) {

						if (timeId > 0) times[timeId] = times[timeId];
						return;

					}
					if ((timeId > 0) && (timeAngles.count != undefined)) console.warn(sUniverse + ': anglesObject2Array. classSettings.settings.object.geometry.timesAngles[' + timeId + '].count = ' + timeAngles.count + ' is ignore.');
					const angles = [];
					Object.keys(timeAngles).forEach((key) => angles[key] = timeAngles[key]);
					times[timeId] = angles;

				});
/*
				const settings = classSettings.settings, timesAngles = settings.object.geometry.timesAngles;
				if (timesAngles.length > settings.options.playerOptions.marks) console.warn(sUniverse +': anglesObject2Array. Invalid classSettings.settings.object.geometry.timesAngles.length = ' + timesAngles.length);
				timesAngles.forEach((geometryAngles, timeId) => {

					//Непонятно зачем эта проверка
//					if (geometryAngles.isTimeAnglesProxy) return;
					
					if (geometryAngles instanceof Array) {

						if (timeId > 0) timesAngles[timeId] = timesAngles[timeId];
						return;

					}
					if ((timeId > 0) && (geometryAngles.count != undefined)) console.warn(sUniverse +': anglesObject2Array. classSettings.settings.object.geometry.timesAngles[' + timeId + '].count = ' + geometryAngles.count + ' is ignore.');
					const angles = [];
					Object.keys(geometryAngles).forEach((key) => angles[key] = geometryAngles[key]);
					timesAngles[timeId] = angles;
							
				});
*/
				
			}
			this.hyperSphere = this.getHyperSphere(options, classSettings);
			classSettings.edges = new Proxy(classSettings.edges, {

				set: (edges, name, value) => {

					switch(name) {

						case 'project':
							if (value) 
//								this.hyperSphere.setDrawRange(drawRange.start, settings.object.geometry.indices[0].timeEdgesCount * 2 * times - drawRange.start);
								this.hyperSphere.setEdgesRange();
							else {
								
								//display of vertices
								const settings = classSettings.settings, drawRange = settings.bufferGeometry.drawRange;
//								bufferGeometry.setDrawRange(drawRange.start, classSettings.overriddenProperties.position0.length * (settings.options.player.getTimeId() + 1) - drawRange.start);
								this.hyperSphere.setVerticesRange(drawRange.start, classSettings.overriddenProperties.position0.length * (settings.options.player.getTimeId() + 1) - drawRange.start);
							
							}
							break;
							
					}
					edges[name] = value;
					return true;
					
				}
					
			});
/*			
			Object.defineProperty(classSettings.edges, 'project', {

				set: (projectNew) => { classSettings.edges['project'] = projectNew; },

			});
*/			
			{//hide geometry

				const geometry = classSettings.settings.object.geometry;
				geometry.position = new Proxy(geometry.position, {
		
					get: (positions, name) => {
	
						switch (name) {
		
							case 'intersection': return (i) => {

								const times = geometry.times;
								if (times) {
			
									let timeAnglesId = 0, positionId = times[timeAnglesId].length;
									while(i >= positionId) {
			
										timeAnglesId++;
										positionId += times[timeAnglesId].length;
										
									}
									const guiPoints = classSettings.settings.guiPoints, timeIdOld = guiPoints.timeId;
									guiPoints.timeId = timeAnglesId;
									i -= positionId - geometry.angles.length;
									const position = positions[i];
									guiPoints.timeId = timeIdOld;
									return position;
									
								}
/*								
								const timesAngles = geometry.timesAngles;
								if (timesAngles) {
			
									let timeAnglesId = 0, positionId = timesAngles[timeAnglesId].length;
									while(i >= positionId) {
			
										timeAnglesId++;
										positionId += timesAngles[timeAnglesId].length;
										
									}
									const guiPoints = classSettings.settings.guiPoints, timeIdOld = guiPoints.timeId;
									guiPoints.timeId = timeAnglesId;
									i -= positionId - geometry.angles.length;
									const position = positions[i];
									guiPoints.timeId = timeIdOld;
									return position;
									
								}
*/								
								return positions[i];
							
							}
		
						}
						return positions[name];
						
					},
					
				});
	
			}
			{//hide timeId

				let timeId;
				Object.defineProperty(classSettings.settings.bufferGeometry.userData, 'timeId', {

					get: () => {

						if (timeId === undefined) {

							//Кажется мне сюда на должно попадать
							console.error(sUniverse + ': classSettings.settings.bufferGeometry.userData get timeId. Invalid timeId = ' + timeId);
							timeId = classSettings.settings.options.playerOptions.selectSceneIndex;
							
						}
						return timeId;
//						return timeId != undefined ? timeId : classSettings.settings.options.playerOptions.selectSceneIndex;
					
					},
					set: (playerIndexNew) => { timeId = playerIndexNew; },

				});
				
			}

			classSettings.projectParams.scene.userData = new Proxy(classSettings.projectParams.scene.userData, {
	
				set: (userData, name, value) => {

					//сначала надо установить время
					userData[name] = value;

					//а потом выполнять какие то действия
					switch (name) {
	
						case 't':
							this.hyperSphere.oldR = userData.t;
//							if (!classSettings.onSelectScene) this.onSelectScene.copyAngles(classSettings.settings.bufferGeometry.userData.timeId, value);
							break;
							
					}
					return true;
	
				}
				
			});
			options.onSelectScene = (index, t) => {

				const times = classSettings.settings.object.geometry.times, length = times.length;
				if ((length > 1) && (length > index)) {

					//пользователь передвинул проигрыватель назад
					const settings = classSettings.settings, bufferGeometry = settings.bufferGeometry, drawRange = bufferGeometry.drawRange;
					if (classSettings.edges.project) {

						//Видны ребра
						const timeEdgesCount = settings.object.geometry.indices[0].timeEdgesCount;
						if (timeEdgesCount)
							this.hyperSphere.setEdgesRange();
//							bufferGeometry.setDrawRange(drawRange.start, timeEdgesCount * 2 * (index + 1) - drawRange.start);
						
					} else
						this.hyperSphere.setVerticesRange(drawRange.start, times[0].length * (index + 1) - drawRange.start);
//						bufferGeometry.setDrawRange(drawRange.start, times[0].length * (index + 1) - drawRange.start);
					return false;//Сдедующий шаг проигрывателя выполняется немедленно
					
				}
					
				if (classSettings.onSelectScene) return classSettings.onSelectScene(this.hyperSphere, index, t);
				else return this.onSelectScene.copyAngles(index, t);
				return true;//Сдедующий шаг проигрывателя выполняется только после посторения всех вершин без временной задержки
			
			}
			this.hyperSphere.child = this;

		}, myThreeOptions);
		this.onSelectScene = {

			copyAngles: (timeId, t) => {

				if (timeId === 0) return;
				const geometry = classSettings.settings.object.geometry, times = geometry.times,
					timeAnglesSrc  = times[timeId - 1],
					timeAnglesDest = times[timeId],
					boLog = classSettings.debug && (classSettings.debug != false);
				if (boLog) console.log('timeId = ' + classSettings.settings.bufferGeometry.userData.timeId + ' t = ' + t);
				timeAnglesSrc.forEach((timeAngles, i) => {
					
					timeAnglesDest[i] = timeAngles;
					if (boLog){

						let vertice = classSettings.settings.bufferGeometry.userData.position[i];
						const timeAnglesDestItem = timeAnglesDest[i];
						console.log(' timeVertices[' + i + '] = ' + JSON.stringify(vertice) +
									' angles = ' + JSON.stringify(timeAnglesDestItem) +
									' edges = ' + JSON.stringify(timeAnglesDestItem.edges))
						
					}
				
				});
				const bufferGeometry = this.hyperSphere.bufferGeometry, drawRange = bufferGeometry.drawRange;
				bufferGeometry.attributes.position.needsUpdate = true;
				bufferGeometry.setDrawRange(drawRange.start, geometry.indices[0].timeEdgesCount * (timeId + 1) * 2);
				this.hyperSphere.onSelectSceneEnd(timeId);
/*				
				classSettings.settings.options.player.endSelect();//Нужно, что бы появлялось описание вершины, когда пользователь наведет мышку на вершину, которая появилась, когда проигрыватель передвинулся на шаг
				classSettings.settings.options.player.continue();
*/				
				return false;//Немедленно выпоняется следующий шаг проигрывателя потому что copyAngles выполняется синхронно
				
			},
			
		}
//		const onSelectSceneEnd = () => {}

	}
	name(options) {

		//Localization

		const lang = {

			name: 'Universe',

		};

		switch (options.getLanguageCode()) {

			case 'ru'://Russian language

				lang.name = 'Вселенная';

				break;

		}
		return lang.name;

	}
	arc(aAngleControls, lang, arcAngles) {

		const arcEdges = [];
		for (let i = 0; i < (aAngleControls.MAX_POINTS - 1); i++) arcEdges.push([i, i + 1]);
		aAngleControls.arc = this.hyperSphere.line({

			cookieName: 'arc',//если не задать cookieName, то настройки дуги будут браться из настроек вселенной
			//edges: false,
			object: {

				name: lang.arc,
				geometry: {

					MAX_POINTS: aAngleControls.MAX_POINTS,
					angles: arcAngles,
					//opacity: 0.3,
					indices: {

						edges: arcEdges,

					}

				}

			},

		});

	}

}

export default Universe;
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

			if (classSettings.settings.object.color === undefined) classSettings.settings.object.color = () => { return options.player.getTime(); }

			classSettings.projectParams.scene.userData.endSelect = () => {}

			classSettings.settings.isSetPosition = true;//при выполнении шага в Player не надо вычислять позицию вершин в самом Player
			classSettings.settings.object.geometry.rCount = options.playerOptions.marks;//количество возможных радиусов вселенной
			{//hide timesAngles
				
				const timesAngles = classSettings.settings.object.geometry.timesAngles;
				if (timesAngles) {
					
					const timesAnglesLength = timesAngles.length;
					if (timesAnglesLength > 0 )classSettings.settings.object.geometry.timeAnglesLength = timesAnglesLength;

				}

			}

			{//hide geometryAngles

				const geometryAngles = classSettings.settings.object.geometry.angles;
				classSettings.settings.object.geometry.timesAngles = new Proxy(classSettings.settings.object.geometry.timesAngles || [], {
		
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

/*											
											const vertice = new Proxy(timeAngles[verticeId], {
											
												get: (verticeAngles, name) => {

													return verticeAngles[name];
													
												},
														
											});
											return vertice;
*/
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
											return timeAngles.length;
											
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
					
				});

			}
			classSettings.settings.object.geometry = new Proxy(classSettings.settings.object.geometry, {

				get: (geometry, name) => {

					switch (name) {

						case 'angles': 
							const timesAngles = geometry.timesAngles;
							if (timesAngles.length === 0) return;
							else if (timesAngles.length === 1) return timesAngles[0];
							const timeId = classSettings.settings.guiPoints.timeId, angles0 = timesAngles[0];
							let angles = timesAngles[timeId === undefined ? 0 : timeId];
							
							if (!(angles instanceof Array)) {
								
								const array = [];
								Object.keys(angles).forEach((key) => array[key] = angles[key]);
								angles = array;

							}
							
							return new Proxy(angles, {
								
								get: (angles, name) => {

									switch (name) {

										case 'ranges': return angles0[name];
/*
										case 'count':
										case 'length':
										case 'forEach':
										case 'guiLength':
										case 'arguments':
										case 'player':
										case 'pushRandomAngle':
										case 'push':
										case 'isTimeAnglesProxy':
											break;
										default: if (isNaN(name)) console.error(sUniverse + ': get geometry.angles. Invalid name: ' + name);
*/
											
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
	
											if ((timeId != 0) && !playerPosition[timeId]) return new Proxy([], {
	
												get: (playerPositionItem, name) => {
	
													switch (name) {
	
														case 'length': {
	
															const length = playerPosition[0].length;
															if (classSettings.debug && (length != classSettings.settings.object.geometry.angles.length))
																console.error(sUniverse + ': get player position item failed! Invalid length = ' + length);
															return length;
	
														}
														case 'angles': return classSettings.settings.object.geometry.timesAngles[timeId];
															
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
								classSettings.overriddenProperties ||= {};
								classSettings.overriddenProperties.oppositeVertice ||= (oppositeAngleId, timeId) => { return geometry.playerPosition[timeId - 1][oppositeAngleId]; }
								if (!classSettings.overriddenProperties.position) Object.defineProperty(classSettings.overriddenProperties, 'position', { get: () => { return geometry.playerPosition[classSettings.settings.bufferGeometry.userData.timeId]; }, });
								if (!classSettings.overriddenProperties.position0) Object.defineProperty(classSettings.overriddenProperties, 'position0', { get: () => { return geometry.playerPosition[0]; }, });
								classSettings.overriddenProperties.updateVertices ||= (vertices) => { this.hyperSphere.bufferGeometry.attributes.position.needsUpdate = true; }
								classSettings.overriddenProperties.vertices ||= () => {}
//								if (!classSettings.overriddenProperties.r) Object.defineProperty(classSettings.overriddenProperties, 'r', { get: () => { return classSettings.settings.object.geometry.angles.player.r; }, });
//								if (!classSettings.overriddenProperties.r) Object.defineProperty(classSettings.overriddenProperties, 'r', { get: () => { return classSettings.settings.object.geometry.timesAngles[0].player.r; }, });
								classSettings.overriddenProperties.r ||= (timeId) => { return classSettings.settings.object.geometry.timesAngles[timeId != undefined ? timeId : 0].player.r; }
//								classSettings.overriddenProperties.timeR ||= (timeId) => { return classSettings.settings.object.geometry.timesAngles[timeId].player.r; }
								classSettings.overriddenProperties.pushMiddleVertice ||= (timeId, middleVertice) => { geometry.timesAngles[timeId].push(middleVertice); }
								classSettings.overriddenProperties.angles ||= (anglesId, timeId) => { return classSettings.settings.object.geometry.timesAngles[timeId][anglesId]; }
								classSettings.overriddenProperties.verticeAngles ||= (anglesCur, verticeId) => {

/*									
									const timesAngles = classSettings.settings.object.geometry.timesAngles;
									let anglesCount = 0;
//									timesAngles.forEach((timeAngles, timeId) =>
									for (let timeId = 0; timeId < timeAngles.length; timeId++) {

										const timeAnglesItem = timeAngles[timeId];
//										const opt = appendChild(timeAngles.player.t, timeId);
										const anglesCountOld = anglesCount;
										anglesCount += timeAnglesItem.length;
										if((verticeId >= anglesCountOld) && (verticeId < anglesCount)) {

											classSettings.settings.guiPoints.timeAngles = timeAnglesItem;
											return timeAnglesItem[verticeId - anglesCountOld];

										}
										
									}
*/
									const guiPoints = classSettings.settings.guiPoints;
									return guiPoints.timeAngles[guiPoints.verticeId != undefined ? guiPoints.verticeId : verticeId];
									
								}

							}
							return geometry.playerPosition[classSettings.settings.options.player.getTimeId()];

					}
					return geometry[name];
					
				},
				set: (geometry, name, value) => {

					switch (name) {

						case 'angles':
							geometry.timesAngles[0] = value;
							return true;
						case 'position':
							geometry.playerPosition[0] = value;
							return true;

					}
					geometry[name] = value;
					return true;
					
				},
				
			});
			classSettings.settings.guiPoints = {


				seletedIndex: (guiIndexStr) => {

					let guiIndex = parseInt(guiIndexStr);
					if (isNaN(guiIndex)) return guiIndexStr;
					const anglesLength = classSettings.settings.object.geometry.angles.length;
					while (guiIndex > anglesLength) guiIndex -= anglesLength;
					return guiIndex;
				
				},
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
					
					const cTimes = fPoints.add({ Points: lang.notSelected }, 'Points', { [lang.notSelected]: -1 });
					dat.controllerNameAndTitle(cTimes, lang.time, lang.timeTitle);

					//Переместить список Time вверх
					const elBefore = fPoints.__ul.children[1], elLast = fPoints.__ul.children[fPoints.__ul.children.length - 1];
					fPoints.__ul.removeChild(elLast);
					fPoints.__ul.insertBefore(elLast, elBefore);

					const timesAngles = classSettings.settings.object.geometry.timesAngles;
					cTimes.onChange((timeId) => {

						const selectPoints = cPoints.__select;
						options.guiSelectPoint.selectPoint(-1);
						while (selectPoints.length > 1) selectPoints.removeChild(selectPoints.lastChild);
						timeId = parseInt(timeId);
						if (isNaN(timeId)) {

							console.error(sUniverse + ': cTimes.onChange. Invalid timeId = ' + timeId);
							return;
							
						}
						classSettings.settings.guiPoints.timeAngles = timesAngles[timeId];
						classSettings.settings.guiPoints.timeAngles.forEach((verticeAngles, verticeId) => {

							const opt = document.createElement('option');
							opt.innerHTML = verticeId;
							opt.setAttribute('value', verticeId);
							selectPoints.appendChild(opt);

						});
						let positionOffset = 0;
/*						
						for (let i = 0; i < timeId; i++) {

							const timeAngles = timesAngles[i];
							positionOffset += timeAngles.length;
							
						}
*/						
						for (let i = 0; i < timeId; i++) positionOffset += timesAngles[i].length;
						
						classSettings.settings.guiPoints.positionOffset = positionOffset;
						classSettings.settings.guiPoints.timeId = timeId;

					});
//					let pointId = 0;//Порядковый номер вершины в classSettings.settings.bufferGeometry.attributes.position
					const appendChild = (name, pointId) => {
						
						const opt = document.createElement('option');
						opt.innerHTML = name;
						if (pointId != undefined) opt.setAttribute('value', pointId);
						cTimes.__select.appendChild(opt);
						return opt;
						
					}
					let anglesCount = 0, timeIdSelected;
					const index = intersectionSelected ? intersectionSelected.index : undefined;
					timesAngles.forEach((timeAngles, timeId) => {

//						const opt = appendChild(timeAngles.player.t, timeId);
						appendChild(timeAngles.player.t, timeId);
						if (index === undefined) return;
						const anglesCountOld = anglesCount;
						anglesCount += timeAngles.length;
						if((index >= anglesCountOld) && (index < anglesCount)) {

/*							
							opt.selected = true;
							classSettings.settings.guiPoints.positionOffset = anglesCountOld;
							classSettings.settings.guiPoints.timeId = timeId;
							intersectionSelected.index -= anglesCountOld;
*/							
							timeIdSelected = timeId;
							classSettings.settings.guiPoints.verticeId = index - anglesCountOld;

						}
						
					});
/*					
					if (timeIdSelected === undefined) console.error(sUniverse + ': classSettings.settings.guiPoints.create. Invalid timeIdSelected = ' + timeIdSelected);
					else cTimes.__onChange(timeIdSelected);
*/					
					if (timeIdSelected != undefined) cTimes.__onChange(timeIdSelected);
					
				},
				getValue: (cPoints) => {

					const value = cPoints.getValue();
					if (isNaN(value)) return -1;//точка не выбрана
					return value;
				
				},


			}
			classSettings.anglesObject2Array = () => {

				const settings = classSettings.settings, timesAngles = settings.object.geometry.timesAngles;
				if (timesAngles.length > settings.options.playerOptions.marks) console.warn(sUniverse +': anglesObject2Array. Invalid classSettings.settings.object.geometry.timesAngles.length = ' + timesAngles.length);
				timesAngles.forEach((geometryAngles, timeId) => {

					if (geometryAngles.isTimeAnglesProxy) return;
					if (geometryAngles instanceof Array) {

						if (timeId > 0) timesAngles[timeId] = timesAngles[timeId];
						return;

					}
					if ((timeId > 0) && (geometryAngles.count != undefined)) console.warn(sUniverse +': anglesObject2Array. classSettings.settings.object.geometry.timesAngles[' + timeId + '].count = ' + geometryAngles.count + ' is ignore.');
					const angles = [];
					Object.keys(geometryAngles).forEach((key) => angles[key] = geometryAngles[key]);
					timesAngles[timeId] = angles;
							
				});
				
			}
			this.hyperSphere = this.getHyperSphere(options, classSettings);
			{

				let timeId;
				Object.defineProperty(classSettings.settings.bufferGeometry.userData, 'timeId', {

					get: () => { return timeId != undefined ? timeId : settings.options.playerOptions.selectSceneIndex; },
					set: (playerIndexNew) => { timeId = playerIndexNew; },

				});
/*
				let timeId;
				Object.defineProperty(classSettings.settings.bufferGeometry.userData, 'timeId', {
					
					get: () => { return timeId != undefined ? timeId : settings.options.playerOptions.selectSceneIndex; },
					set: (playerIndexNew) => { timeId = playerIndexNew; },
					
				});
*/
				
			}

			classSettings.projectParams.scene.userData = new Proxy(classSettings.projectParams.scene.userData, {
	
				set: (userData, name, value) => {
	
					switch (name) {
	
						case 't':
							this.hyperSphere.oldR = userData.t;
							if (!classSettings.onSelectScene) this.onSelectScene.copyAngles(classSettings.settings.bufferGeometry.userData.timeId, value);
							break;
							
					}
					userData[name] = value;
					return true;
	
				}
				
			});
			{//hide onSelectScene
				
				const onSelectScene = options.onSelectScene;
				options.onSelectScene = (index, t) => {
		
					if (onSelectScene) onSelectScene(index, t);
				
				}

			}
			this.hyperSphere.child = this;

		}, myThreeOptions);
		this.onSelectScene = {

			copyAngles: (timeId, t) => {

				if (timeId === 0) return;
				const geometry = classSettings.settings.object.geometry, timesAngles = geometry.timesAngles,
					timeAnglesSrc  = timesAngles[timeId - 1],
					timeAnglesDest = timesAngles[timeId],
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
				this.hyperSphere.bufferGeometry.attributes.position.needsUpdate = true;
				
			},
			
		}

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
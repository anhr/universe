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

import HyperSphere from '../../commonNodeJS/master/HyperSphere/hyperSphere.js';
//import Player from '../../commonNodeJS/master/player/player.js'
import { dat } from '../../commonNodeJS/master/dat/dat.module.js';

const sUniverse = 'Universe';

class Universe
{
	/**
	 * Base class for n dimensional hypersphere universe.
	 * @param {object} [classSettings={}] See <a href="../../../commonNodeJS/master/HyperSphere/jsdoc/module-HyperSphere-HyperSphere.html" target="_blank">HyperSphere classSettings</a> parameter.
	 * @param {Array} [classSettings.settings.object.geometry.playerAngles] Array of vertices angles for different time of the <a href="../../../commonNodeJS/master/player/jsdoc/" target="_blank">player</a>.
	 * Every item of the <b>playerAngles</b> array is array of the vertices angles. See <b>classSettings.settings.object.geometry.angles</b> of the <a href="../../../commonNodeJS/master/HyperSphere/jsdoc/module-HyperSphere-HyperSphere.html" target="_blank">HyperSphere</a> for details
	 * @param {object} [myThreeOptions={}] See <a href="../../../commonNodeJS/master/myThree/jsdoc/module-MyThree-MyThree.html" target="_blank">MyThree optionss</a> parameter.
	 */
	constructor(classSettings = {}, myThreeOptions = {}) {

		const _this = this;
		//myThreeOptions.scales ||= {};//Эта строка выдает ошибку "[!] (cleanup plugin) SyntaxError: Unexpected token (36:26)" при выполнении команды "npm run build"
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
//		if (myThreeOptions.playerOptions.max === undefined) myThreeOptions.playerOptions.max = 1.0;

		//w
//		if (myThreeOptions.scales.w.isColor === undefined) myThreeOptions.scales.w.isColor = false;
		myThreeOptions.scales.w = new Proxy(myThreeOptions.scales.w, {

			get: (rRange, name) => {
				
				switch (name) {

					//цвета вершин зависит от текущего времени в проигрывателе
					case 'min': return rRange.min != undefined ? rRange.min : myThreeOptions.playerOptions.min;
					case 'max': return rRange.max != undefined ? rRange.max : myThreeOptions.playerOptions.max;
					case 'isColor': return false;

				}
//				console.error(sUniverse + ' get scales.w: Invalid name: ' + name);
				return rRange[name];
				
			},

		});
/*		
		if (!classSettings.onSelectScene) classSettings.onSelectScene = (hyperSphere, index, t) => {
			
			if (hyperSphere.middleVertices) hyperSphere.middleVertices(index, t);

		}
*/		
//		if (classSettings.r === undefined) classSettings.r = myThreeOptions.playerOptions.min;
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

/*			
			{//hide r

				let r = classSettings.r;
				Object.defineProperty(classSettings, 'r', {
					
					get: () => {
					
						if (typeof r === "function") return r();
						return r;
				
					},
					set: (newR) => {
	
						if (r != newR) {

							this.hyperSphere.oldR = r;
							r = newR;
//							if (!classSettings.onSelectScene) this.hyperSphere.setPositionAttributeFromPoints(classSettings.settings.object.geometry.angles, true);
	
						}
					
					}
					
				});
	
			}
*/			
			classSettings.projectParams.scene.userData.endSelect = () => {}

			classSettings.settings.isSetPosition = true;//при выполнении шага в Player не надо вычислять позицию вершин в самом Player
			classSettings.settings.object.geometry.rCount = options.playerOptions.marks;//количество возможных радиусов вселенной
			{//hide playerAnglesLength
				
				const playerAngles = classSettings.settings.object.geometry.playerAngles;
				if (playerAngles) {
					
					const playerAnglesLength = playerAngles.length;
					if (playerAnglesLength > 0 )classSettings.settings.object.geometry.playerAnglesLength = playerAnglesLength;

				}

			}

			{//hide geometryAngles

				const geometryAngles = classSettings.settings.object.geometry.angles;
				classSettings.settings.object.geometry.playerAngles = new Proxy(classSettings.settings.object.geometry.playerAngles || [], {
		
					get: (playerAngles, name) => {
	
						const playerIndex = parseInt(name);
						if (!isNaN(playerIndex)) {
	
//							if (playerIndex === 0) return playerAngles[playerIndex] || geometryAngles;
							if (!playerAngles[playerIndex]) {

								if (playerAngles.length != playerIndex) console.error(sUniverse + ': get playerAngles[' + playerIndex + '] failed. Invalid playerIndex = ' + playerIndex);
								playerAngles[playerIndex] = new Proxy([], {

									get: (timeAngles, name) => {
										
										const verticeId = parseInt(name);
										if (!isNaN(verticeId)) {
											
											const vertice = new Proxy(timeAngles[verticeId], {
											
												get: (verticeAngles, name) => {
													
													switch (name) {
								
														case 'middleVertice': return (oppositeVerticesId, index) => {

/*															
//															const angles = classSettings.settings.object.geometry.playerPosition[0].angles,
															const angles = classSettings.settings.object.geometry.position.angles,
																shift = angles.length * playerIndex,
																startOppositeVerticesId = angles[verticeId].oppositeVerticesId;
															oppositeVerticesId = [];
															for (let i = 0; i < startOppositeVerticesId.length; i++) oppositeVerticesId.push(startOppositeVerticesId[i] + shift);
															//playerPosition[playerIndex - 1].angles[verticeId]
															return angles[verticeId].middleVertice(oppositeVerticesId, playerIndex + 1);
*/															
															const vertice = classSettings.settings.object.geometry.position.angles[verticeId];
															return vertice.middleVertice(vertice.oppositeVerticesId, playerIndex + 1);
															
														}
	
													}
													return verticeAngles[name];
													
												},
														
											});
											return vertice;

										}
										switch (name) {
	
											case 'player': return this.hyperSphere.anglesPlayer(playerIndex);
												
										}
										return timeAngles[name];
										
									},
									set: (timeAngles, name, value) => {
					
										timeAngles[name] = value;
										const timeAnglesId = parseInt(name);
										if (!isNaN(timeAnglesId)) this.hyperSphere.setPositionAttributeFromPoint(timeAnglesId, undefined, playerIndex);
										return true;
										
									},
									
								});

							}
							return playerAngles[playerIndex];
	
						}
						switch (name) {

							case 'length': if (playerAngles.length === 0) return 1;
								break;
								
						}
						return playerAngles[name];
						
					},
					set: (playerAngles, name, value) => {

						const playerIndex = parseInt(name);
						if (!isNaN(playerIndex)) {

							const timeAngles0 = playerAngles[0];
							playerAngles[playerIndex] = new Proxy(value, {

								get: (timeAngles, name) => {

									switch (name) {

										case 'player': 
											if (!this.hyperSphere) return;
											return this.hyperSphere.anglesPlayer(playerIndex);
										case 'forEach': return (item) => {
										
											for (let verticeId = 0; verticeId < timeAngles0.length; verticeId++) {

												const verticeAngles = timeAngles[verticeId];
												item(verticeAngles ? verticeAngles : timeAngles0[verticeId], verticeId);

											}
											
										}
										case 'length':
											if (playerIndex > 0) return timeAngles0.length;
//											if (playerIndex > 0) return playerAngles[playerIndex - 1].length;
											return timeAngles.length;
											
									}
									const verticeId = parseInt(name);
									if (!isNaN(verticeId)) {
										
										let verticeAngles = timeAngles[verticeId];
										if (!verticeAngles) {

											if (playerIndex === 0) {
												
												console.error(sUniverse + ': get vertice angles failed. Invalid playerIndex = ' + playerIndex);
												return;

											}
											verticeAngles = playerAngles[playerIndex - 1][verticeId];
										}
										return verticeAngles;

									}
									return timeAngles[name];
									
								},
								
							});
							
						}
						else playerAngles[name] = value;
						return true;
						
					},
					
				});

			}
			classSettings.settings.object.geometry = new Proxy(classSettings.settings.object.geometry, {

				get: (geometry, name) => {

					switch (name) {

						case 'angles': 
//							return geometry.playerAngles[0];
							const playerAngles = geometry.playerAngles;
							if (playerAngles.length === 0) return;
							else if (playerAngles.length === 1) return playerAngles[0];
							const playerIndex = classSettings.settings.guiPoints.playerIndex, angles0 = playerAngles[0];
							let angles = playerAngles[playerIndex === undefined ? 0 : playerIndex];
							
							if (!(angles instanceof Array)) {
								
								const array = [];
								Object.keys(angles).forEach((key) => array[key] = angles[key]);
								angles = array;

							}
							
							return new Proxy(angles, {
								
								get: (angles, name) => {

									switch (name) {

										case 'ranges': {

//											return classSettings.settings.object.geometry.playerAngles[0].ranges;
//											return geometry.playerAngles[0].ranges;
											return angles0[name];

										}
/*
										case 'object2Array': return () => {

											const array = [];
											Object.keys(angles).forEach((key) => array[key] = angles[key]);
											angles = array;

										}
*/
										case 'count':
										case 'length':
										case 'forEach':
										case 'guiLength':
										case 'arguments':
										case 'player':
										case 'pushRandomAngle':
										case 'push':
											break;
										default: if (isNaN(name)) console.error(sUniverse + ': get geometry.angles. Invalid name: ' + name);
											
									}
									return angles[name];
/*									
									const playerIndex = classSettings.settings.guiPoints.playerIndex;
									if (playerIndex === undefined) return angles[name];
									return playerAngles[playerIndex][name];
*/									
									
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
							if (!geometry.playerPosition) geometry.playerPosition = new Proxy([], {

								get: (playerPosition, name) => {

									const playerIndex = parseInt(name);
									if (!isNaN(playerIndex)) {

										if ((playerIndex != 0) && !playerPosition[playerIndex]) return new Proxy([], {

											get: (playerPositionItem, name) => {

												switch (name) {

													case 'length': {

														const length = playerPosition[0].length;
//														if (classSettings.debug && (length != classSettings.settings.object.geometry.playerAngles[0].length))
														if (classSettings.debug && (length != classSettings.settings.object.geometry.angles.length))
															console.error(sUniverse + ': get player position item failed! Invalid length = ' + length);
														return length;

													}
//													case 'angles': return classSettings.settings.object.geometry.playerAngles[classSettings.playerIndex];
													case 'angles': return classSettings.settings.object.geometry.playerAngles[playerIndex];
														
												}
												const playerIndexItemId = parseInt(name);
												if (!isNaN(playerIndexItemId)) {

//													const angles = classSettings.settings.object.geometry.playerAngles[playerIndex];
//													const vertice = this.hypersphere.bufferGeometry.userData.position[playerIndexItemId];
													const userData = classSettings.settings.bufferGeometry.userData, playerIndexOld = userData.playerIndex;
													userData.playerIndex = playerIndex;
													const vertice = userData.position[playerIndexItemId];
													userData.playerIndex = playerIndexOld;
													return vertice;
													
												}
												return playerPositionItem[name];
												
											},
											
										});
										return playerPosition[playerIndex];
				
									}
									return playerPosition[name];
									
								},
								
							});
							return geometry.playerPosition[0];

					}
					return geometry[name];
					
				},
				set: (geometry, name, value) => {

					switch (name) {

						case 'angles':
							geometry.playerAngles[0] = value;
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
//					const anglesLength = classSettings.settings.object.geometry.playerAngles[0].length;
					const anglesLength = classSettings.settings.object.geometry.angles.length;
					while (guiIndex > anglesLength) guiIndex -= anglesLength;
					return guiIndex;
				
				},
				create: (fPoints, cPoints) => {

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

					const playerAngles = classSettings.settings.object.geometry.playerAngles;
					cTimes.onChange((playerIndex) => {

						const selectPoints = cPoints.__select;
						options.guiSelectPoint.selectPoint(-1);
						while (selectPoints.length > 1) selectPoints.removeChild(selectPoints.lastChild);
						playerIndex = parseInt(playerIndex);
						if (isNaN(playerIndex)) {

							console.error(sUniverse + ': cTimes.onChange. Invalid playerIndex = ' + playerIndex);
							return;
							
						}
						classSettings.settings.guiPoints.timeAngles = playerAngles[playerIndex];
						classSettings.settings.guiPoints.timeAngles.forEach((verticeAngles, verticeId) =>
//						for (let verticeId = 0; verticeId < classSettings.settings.guiPoints.timeAngles.length; verticeId++)
						{

							const opt = document.createElement('option');
							opt.innerHTML = verticeId;
							opt.setAttribute('value', verticeId);
							selectPoints.appendChild(opt);

						});
						let positionOffset = 0;
						for (let i = 0; i < playerIndex; i++) {

							const timeAngles = playerAngles[i];
							positionOffset += timeAngles.length;
							
						}
						
						classSettings.settings.guiPoints.positionOffset = positionOffset;
						classSettings.settings.guiPoints.playerIndex = playerIndex;
/*
						classSettings.settings.guiPoints.onChangeAngle = (verticeId, angleId, angle) => {

							const verticeAngles = playerAngles[playerIndex][verticeId];
							if (verticeAngles[angleId] === angle) return;
							verticeAngles[angleId] = angle;
							_this.hyperSphere.setPositionAttributeFromPoint(verticeId, undefined, playerIndex);
							
						}
*/						

					});
					let pointId = 0;//Порядковый номер вершины в classSettings.settings.bufferGeometry.attributes.position
					//const drawRange = classSettings.settings.bufferGeometry.drawRange,
					const appendChild = (name, pointId) => {
						
						const opt = document.createElement('option');
						opt.innerHTML = name;
						if (pointId != undefined) opt.setAttribute('value', pointId);
						cTimes.__select.appendChild(opt);
						return opt;
						
					}
					playerAngles.forEach((timeAngles, playerIndex) => {

						appendChild(timeAngles.player.t, playerIndex);
						
					});
					
				},
				getValue: (cPoints) => { return cPoints.getValue(); },


			}
			classSettings.anglesObject2Array = () => {

				const settings = classSettings.settings, playerAngles = settings.object.geometry.playerAngles;
				if (playerAngles.length > settings.options.playerOptions.marks) console.warn(sUniverse +': anglesObject2Array. Invalid classSettings.settings.object.geometry.playerAngles.length = ' + playerAngles.length);
				playerAngles.forEach((geometryAngles, playerIndex) => {

					if (geometryAngles instanceof Array) {

						if (playerIndex > 0) playerAngles[playerIndex] = playerAngles[playerIndex];
						return;

					}
					if ((playerIndex > 0) && (geometryAngles.count != undefined)) console.warn(sUniverse +': anglesObject2Array. classSettings.settings.object.geometry.playerAngles[' + playerIndex + '].count = ' + geometryAngles.count + ' is ignore.');
					const angles = [];
					Object.keys(geometryAngles).forEach((key) => angles[key] = geometryAngles[key]);
					playerAngles[playerIndex] = angles;
							
				});
				
			}
			this.hyperSphere = this.getHyperSphere(options, classSettings);
			{
				
				let playerIndex;
				Object.defineProperty(classSettings.settings.bufferGeometry.userData, 'playerIndex', {
					
					get: () => { return playerIndex != undefined ? playerIndex : settings.options.playerOptions.selectSceneIndex; },
					set: (playerIndexNew) => { playerIndex = playerIndexNew; },
					
				});
				
			}

/*			
			classSettings.settings.object.geometry.angles = new Proxy(classSettings.settings.object.geometry.angles, {
				
				get: (angles, name) => {

					return angles[name];
					
				},
				
			});
*/			
//			this.hyperSphere.angles = classSettings.settings.object.geometry.angles;
			
			classSettings.projectParams.scene.userData = new Proxy(classSettings.projectParams.scene.userData, {
	
				set: (userData, name, value) => {
	
					switch (name) {
	
						case 't':
//classSettings.playerIndex = userData.index;//deprecated
//							classSettings.settings.bufferGeometry.userData.playerIndex = userData.index;
//							classSettings.r = value;
/*							
							classSettings.settings.object.geometry.playerAngles[userData.index].player = {

//								index: userData.index,
								t: value,
								
							}
*/							
							if (!classSettings.onSelectScene) this.onSelectScene.copyAngles(classSettings.settings.bufferGeometry.userData.playerIndex, value);
							break;
							
					}
					userData[name] = value;
					return true;
	
				}
				
			});
			{//hide onSelectScene
				
				const onSelectScene = options.onSelectScene;
				options.onSelectScene = (index, t) => {
		
//					classSettings.r = t;
					if (onSelectScene) onSelectScene(index, t);
				
				}

			}
			this.hyperSphere.child = this;

		}, myThreeOptions);
		this.onSelectScene = {

			copyAngles: (playerIndex, t) => {

				if (playerIndex === 0) return;
				const geometry = classSettings.settings.object.geometry, playerAngles = geometry.playerAngles,
					timeAnglesSrc  = playerAngles[playerIndex - 1],
					timeAnglesDest = playerAngles[playerIndex],
					boLog = classSettings.debug && (classSettings.debug != false);
				if (boLog) console.log('playerIndex = ' + classSettings.settings.bufferGeometry.userData.playerIndex + ' t = ' + t);
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
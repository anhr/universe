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

//import HyperSphere from '../../commonNodeJS/master/HyperSphere/hyperSphere.js';
//import Player from '../../commonNodeJS/master/player/player.js'
import { dat } from '../../commonNodeJS/master/dat/dat.module.js';

const sUniverse = 'Universe';

class Universe
{
	/**
	 * Base class for n dimensional hypersphere universe.
	 * @param {object} [universeSettings={}] See <a href="../../../commonNodeJS/master/HyperSphere/jsdoc/module-HyperSphere-HyperSphere.html" target="_blank">HyperSphere classSettings</a> parameter.
	 * @param {object} [myThreeOptions={}] See <a href="../../../commonNodeJS/master/myThree/jsdoc/module-MyThree-MyThree.html" target="_blank">MyThree optionss</a> parameter.
	 */
	constructor(universeSettings = {}, myThreeOptions = {}) {

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
		if (!universeSettings.onSelectScene) universeSettings.onSelectScene = (hyperSphere, index, t) => {
			
			if (hyperSphere.middleVertices) hyperSphere.middleVertices(index, t);

		}
*/		
		if (universeSettings.r === undefined) universeSettings.r = myThreeOptions.playerOptions.min;
		universeSettings.rRange = universeSettings.rRange || myThreeOptions.scales.w;
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

			//universeSettings.projectParams ||= {};//Эта строка выдает ошибку "[!] (cleanup plugin) SyntaxError: Unexpected token (63:36)" при выполнении команды "npm run build"
			universeSettings.projectParams = universeSettings.projectParams || {};
			universeSettings.projectParams.scene = scene;

			universeSettings.settings = universeSettings.settings || {};
			universeSettings.settings.object = universeSettings.settings.object || {};
			universeSettings.settings.object.name = universeSettings.settings.object.name || this.name(options.getLanguageCode);

			if (universeSettings.settings.object.color === undefined) universeSettings.settings.object.color = () => { return options.player.getTime(); }
			
			{//hide r

				let r = universeSettings.r;
				Object.defineProperty(universeSettings, 'r', {
					
					get: () => {
					
						if (typeof r === "function") return r();
						return r;
				
					},
					set: (newR) => {
	
						if (r != newR) {

							this.hyperSphere.oldR = r;
							r = newR;
//							if (!universeSettings.onSelectScene) this.hyperSphere.setPositionAttributeFromPoints(universeSettings.settings.object.geometry.angles, true);
	
						}
					
					}
					
				});
	
			}
			universeSettings.projectParams.scene.userData.endSelect = () => {}

			universeSettings.settings.isSetPosition = true;//при выполнении шага в Player не надо вычислять позицию вершин в самом Player
			universeSettings.settings.object.geometry.rCount = options.playerOptions.marks;//количество возможных радиусов вселенной

			{//hide geometryAngles

				const geometryAngles = universeSettings.settings.object.geometry.angles;
				universeSettings.settings.object.geometry.playerAngles = new Proxy(universeSettings.settings.object.geometry.playerAngles || [], {
		
					get: (playerAngles, name) => {
	
						const playerIndex = parseInt(name);
						if (!isNaN(playerIndex)) {
	
							if (playerIndex === 0) return playerAngles[playerIndex] || geometryAngles;
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
//															const angles = universeSettings.settings.object.geometry.playerPosition[0].angles,
															const angles = universeSettings.settings.object.geometry.position.angles,
																shift = angles.length * playerIndex,
																startOppositeVerticesId = angles[verticeId].oppositeVerticesId;
															oppositeVerticesId = [];
															for (let i = 0; i < startOppositeVerticesId.length; i++) oppositeVerticesId.push(startOppositeVerticesId[i] + shift);
															//playerPosition[playerIndex - 1].angles[verticeId]
															return angles[verticeId].middleVertice(oppositeVerticesId, playerIndex + 1);
*/															
															const vertice = universeSettings.settings.object.geometry.position.angles[verticeId];
															return vertice.middleVertice(vertice.oppositeVerticesId, playerIndex + 1);
															
														}
	
													}
													return verticeAngles[name];
													
												},
														
											});
											return vertice;

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
						return playerAngles[name];
						
					},
	/*				
					set: (playerAngles, name, value) => {
	
						playerAngles[name] = value;
						return true;
						
					},
	*/				
					
				});

			}
			universeSettings.settings.object.geometry = new Proxy(universeSettings.settings.object.geometry, {

				get: (geometry, name) => {

					switch (name) {

						case 'angles': 
//								if (!geometry.playerAngles) geometry.playerAngles = [];
//								return geometry.playerAngles[0] || geometryAngles;
							return geometry.playerAngles[0];
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
														if (universeSettings.debug && (length != universeSettings.settings.object.geometry.playerAngles[0].length))
															console.error(sUniverse + ': get player position item failed! Invalid length = ' + length);
														return length;

													}
//													case 'angles': return universeSettings.settings.object.geometry.playerAngles[universeSettings.playerIndex];
													case 'angles': return universeSettings.settings.object.geometry.playerAngles[playerIndex];
														
												}
												const playerIndexItemId = parseInt(name);
												if (!isNaN(playerIndexItemId)) {

//													const angles = universeSettings.settings.object.geometry.playerAngles[playerIndex];
//													const vertice = this.hypersphere.bufferGeometry.userData.position[playerIndexItemId];
													const userData = universeSettings.settings.bufferGeometry.userData, playerIndexOld = userData.playerIndex;
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
			universeSettings.settings.guiPoints = {


				seletedIndex: (guiIndexStr) => {

					let guiIndex = parseInt(guiIndexStr);
					if (isNaN(guiIndex)) return guiIndexStr;
					const anglesLength = universeSettings.settings.object.geometry.playerAngles[0].length;
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

					const options = universeSettings.settings.options;
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

					const playerAngles = universeSettings.settings.object.geometry.playerAngles;
					cTimes.onChange((playerIndex) => {

						const selectPoints = cPoints.__select;
						options.guiSelectPoint.selectPoint(-1);
						while (selectPoints.length > 1) selectPoints.removeChild(selectPoints.lastChild);
						playerIndex = parseInt(playerIndex);
						if (isNaN(playerIndex)) {

							console.error(sUniverse + ': cTimes.onChange. Invalid playerIndex = ' + playerIndex);
							return;
							
						}
						universeSettings.settings.guiPoints.timeAngles = playerAngles[playerIndex];
//						let referenceNode = optPlayer;
						universeSettings.settings.guiPoints.timeAngles.forEach((verticeAngles, verticeId) => {

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
						universeSettings.settings.guiPoints.positionOffset = positionOffset;// * universeSettings.settings.bufferGeometry.attributes.position.itemSize;

					});
					let pointId = 0;//Порядковый номер вершины в universeSettings.settings.bufferGeometry.attributes.position
					//const drawRange = universeSettings.settings.bufferGeometry.drawRange,
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
					
				}

			}
			this.hyperSphere = this.getHyperSphere(options, universeSettings);
			
			universeSettings.projectParams.scene.userData = new Proxy(universeSettings.projectParams.scene.userData, {
	
				set: (userData, name, value) => {
	
					switch (name) {
	
						case 't':
//universeSettings.playerIndex = userData.index;//deprecated
							universeSettings.settings.bufferGeometry.userData.playerIndex = userData.index;
							universeSettings.r = value;
							universeSettings.settings.object.geometry.playerAngles[userData.index].player = {

//								index: userData.index,
								t: value,
								
							}
							if (!universeSettings.onSelectScene) this.onSelectScene.copyAngles(universeSettings.settings.bufferGeometry.userData.playerIndex, value);
							break;
							
					}
					userData[name] = value;
					return true;
	
				}
				
			});
			{//hide onSelectScene
				
				const onSelectScene = options.onSelectScene;
				options.onSelectScene = (index, t) => {
		
					universeSettings.r = t;
					if (onSelectScene) onSelectScene(index, t);
				
				}

			}
			this.hyperSphere.child = this;

		}, myThreeOptions);
		this.onSelectScene = {

			copyAngles: (playerIndex, t) => {

				if (playerIndex === 0) return;
				const geometry = universeSettings.settings.object.geometry, playerAngles = geometry.playerAngles,
					timeAnglesSrc  = playerAngles[playerIndex - 1],
					timeAnglesDest = playerAngles[playerIndex],
					boLog = universeSettings.debug && (universeSettings.debug != false);
				if (boLog) console.log('playerIndex = ' + universeSettings.settings.bufferGeometry.userData.playerIndex + ' t = ' + t);
				timeAnglesSrc.forEach((timeAngles, i) => {
					
					timeAnglesDest[i] = timeAngles;
					if (boLog){

						let vertice = universeSettings.settings.bufferGeometry.userData.position[i];
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
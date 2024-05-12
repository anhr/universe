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

import * as THREE from '../../three.js/dev/src/Three.js';
//import * as THREE from '../../three.js/dev/build/three.module.js';
//import * as THREE from 'https://threejs.org/build/three.module.js';
//import * as THREE from 'https://raw.githack.com/anhr/three.js/dev/build/three.module.js';

import MyThree from '../../commonNodeJS/master/myThree/myThree.js';
//import MyThree from '../../../commonNodeJS/master/myThree/build/myThree.module.js';
//import MyThree from '../../../commonNodeJS/master/myThree/build/myThree.module.min.js';
//import MyThree from 'https://raw.githack.com/anhr/commonNodeJS/master/myThree/myThree.js';
//import MyThree from 'https://raw.githack.com/anhr/commonNodeJS/master/myThree/build/myThree.module.js';
//import MyThree from 'https://raw.githack.com/anhr/commonNodeJS/master/myThree/build/myThree.module.min.js';
MyThree.three.THREE = THREE;

import HuperSphere from '../../commonNodeJS/master/HuperSphere/huperSphere.js';

class Universe// extends HuperSphere
{

	constructor(universeSettings = {}, myThreeOptions = {}) {

		myThreeOptions.scales ||= {};
		myThreeOptions.scales.x ||= {};
		myThreeOptions.scales.y ||= {};
		myThreeOptions.scales.text ||= {};
		myThreeOptions.scales.text.precision = myThreeOptions.scales.text.precision != undefined ? myThreeOptions.scales.text.precision : 1;
		myThreeOptions.scales.text.rect ||= {};
		myThreeOptions.scales.text.rect.displayRect = myThreeOptions.scales.text.rect.displayRect != undefined ? myThreeOptions.scales.text.rect.displayRect : false;

		myThreeOptions.orbitControls ||= {};
		myThreeOptions.orbitControls.enableRotate = myThreeOptions.orbitControls.enableRotate != undefined ? myThreeOptions.orbitControls.enableRotate : false;

		myThreeOptions.camera ||= {};
		if (myThreeOptions.camera.position) {

			if (myThreeOptions.camera.position instanceof Array === true)
				myThreeOptions.camera.position = new THREE.Vector3(myThreeOptions.camera.position[0], myThreeOptions.camera.position[1], myThreeOptions.camera.position[2]);
		}
		else myThreeOptions.camera.position = new THREE.Vector3(0, 0, 2);

		//		myThreeOptions.stereoEffect = myThreeOptions.stereoEffect != undefined ? myThreeOptions.stereoEffect : false;

		myThreeOptions.canvas ||= {};
		myThreeOptions.canvas.noButtonFullScreen = myThreeOptions.canvas.noButtonFullScreen != undefined ? myThreeOptions.canvas.noButtonFullScreen : true;

		new MyThree((scene, options) => {

			universeSettings.projectParams ||= {};
			universeSettings.projectParams.scene = scene;

			universeSettings.settings ||= {};
			universeSettings.settings.object ||= {};
			universeSettings.settings.object.name ||= this.name(options.getLanguageCode);

			this.huperSphere = this.getHuperSphere(scene, options, universeSettings);
			this.huperSphere.child = this;

		}, myThreeOptions/*{

			//axesHelper: false,
			orbitControls: { enableRotate: false, },
			dat: { guiSelectPoint: { point: (options, dat, fMesh) => { return new HuperSphere.ND.gui(options, dat, fMesh); }, }, },
			//dat: false,
			camera: { position: new THREE.Vector3( 0, 0, 2 ) },
			stereoEffect: false,
			//canvasMenu: false,
			scales: {

				x: {},
				y: {},
				z: undefined,//{},
				//posAxesIntersection: new THREE.Vector3( -1, -1, 0 ),
				text: { precision: 1, rect: { displayRect: false, }, }

			},
			canvas: {

				noButtonFullScreen: true,

			},
			//point: { size: 0.0 },
			playerOptions: {
				
				max: Infinity,
				interval: 100,
				
			}
			
		}*/);

	}
	name(options) {

		//Localization

		const lang = {

			name: 'Universe',

		};

		switch (options.getLanguageCode()) {

			case 'ru'://Russian language

				lang.name = '¬селенна€';

				break;

		}
		return lang.name;

	}
	arc(aAngleControls, lang, arcAngles) {

		const arcEdges = [];
		for (let i = 0; i < (aAngleControls.MAX_POINTS - 1); i++) arcEdges.push([i, i + 1]);
		aAngleControls.arc = this.huperSphere.line({

			cookieName: 'arc',//если не задать cookieName, то настройки дуги будут братьс€ из настроек вселенной
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
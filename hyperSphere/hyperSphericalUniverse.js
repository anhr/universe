/**
 * @module HypersphericalUniverse
 * @description Hyperspherical Universe.
 * All the vertices of the Universe3D form a 3D [hypersphere]{@link https://en.wikipedia.org/wiki/N-sphere}.
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


import SphericalUniverse from '../sphere/sphericalUniverse.js';
import HyperSphere3D from '../../../commonNodeJS/master/HyperSphere/hyperSphere3D.js';

//const sHypersphericalUniverse = 'HypersphericalUniverse',
//	π = Math.PI;

class HypersphericalUniverse extends SphericalUniverse {


	/**
	 * All the vertices of the <b>HypersphericalUniverse</b> form a 3 dimensional [hypersphere]{@link https://en.wikipedia.org/wiki/N-sphere}.
	 * @param {object} [classSettings={}] See <a href="../../../commonNodeJS/master/HyperSphere/jsdoc/module-HyperSphere-HyperSphere.html" target="_blank">HyperSphere classSettings</a> parameter.
	 **/
	constructor(classSettings = {}, myThreeOptions) { super(classSettings, myThreeOptions); }
	getHyperSphere(options, classSettings) { return new HyperSphere3D(options, classSettings); }
	name(getLanguageCode) {

		//Localization

		const lang = {

			name: "Hyperspherical Universe",

		};

		const _languageCode = getLanguageCode();

		switch (_languageCode) {

			case 'ru'://Russian language

				lang.name = 'Гиперсферическая вселенная';

				break;

		}
		return lang.name;

	}

}
export default HypersphericalUniverse;

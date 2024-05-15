/**
 * @module HypersphericalUniverse
 * @description Hyperspherical Universe.
 * All the vertices of the Universe3D form a [hypersphere]{@link https://en.wikipedia.org/wiki/N-sphere}.
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
import HyperSphere3D from '../../../commonNodeJS/master/HyperSphere/HyperSphere3D.js';

//const sHypersphericalUniverse = 'HypersphericalUniverse',
//	π = Math.PI;

class HypersphericalUniverse extends SphericalUniverse {


	/**
	 * 3 dimensional universe.
	 * All the vertices of the Universe3D form a [hypersphere]{@link https://en.wikipedia.org/wiki/N-sphere}.
	 * @param {Options} options See <a href="../../../commonNodeJS/master/jsdoc/Options/Options.html" target="_blank">Options</a>.
	 * @param {object} [classSettings] <b>Universe1D</b> class settings. See <a href="./module-Universe-Universe.html" target="_blank">Universe classSettings</a>.
	 **/
	constructor(options, classSettings) {

		super(options, classSettings);
//		this.logUniverse();

	}
	getHyperSphere(options, universeSettings) { return new HyperSphere3D(options, universeSettings); }
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

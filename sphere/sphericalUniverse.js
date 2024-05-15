/**
 * @module SphericalUniverse
 * @description Spherical universe.
 * All the vertices of the SphericalUniverse form a sphere.
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


import Universe from '../universe.js';
import Sphere from '../../../commonNodeJS/master/HyperSphere/sphere.js';

//const sSphericalUniverse = 'SphericalUniverse',
//	π = Math.PI;

class SphericalUniverse extends Universe {

	/**
	 * SphericalUniverse.
	 * All the vertices of the SphericalUniverse form a sphere.
	 * @param {object} [universeSettings] <b>SphericalUniverse</b> class settings. See <a href="./module-Universe-Universe.html" target="_blank">Universe classSettings</a>.
	 **/
	constructor(universeSettings = {}) {

		universeSettings.continue = () => this.logUniverse2D();
		super(universeSettings, {
			
			scales: { z: {}, },
			orbitControls: { enableRotate: true, },
			camera: { position: [ 0.4, 0.4, 2 ] },
			
		});

	}
	getHyperSphere(options, universeSettings) { return new Sphere(options, universeSettings); }
	name( getLanguageCode ) {

		//Localization
		
		const lang = {

			name: "Spherical universe",

		};

		const _languageCode = getLanguageCode();

		switch (_languageCode) {

			case 'ru'://Russian language

				lang.name = 'Сферическая вселенная';

				break;

		}
		return lang.name;
		
	}

}
export default SphericalUniverse;

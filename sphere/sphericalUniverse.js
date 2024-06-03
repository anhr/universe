/**
 * @module SphericalUniverse
 * @description Spherical Universe.
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
	 * All the vertices of the <b>SphericalUniverse</b> form a sphere.
	 * @param {object} [universeSettings={}] See <a href="../../../commonNodeJS/master/HyperSphere/jsdoc/module-HyperSphere-HyperSphere.html" target="_blank">HyperSphere classSettings</a> parameter.
	 **/
	constructor(universeSettings = {}, myThreeOptions={}) {

		universeSettings.continue = () => this.logUniverse2D();
		myThreeOptions.scales = myThreeOptions.scales || { z: {}, };
		myThreeOptions.orbitControls = myThreeOptions.orbitControls || { enableRotate: true, };
		myThreeOptions.camera = myThreeOptions.camera || { position: [ 0.4, 0.4, 2 ] };
		super(universeSettings, myThreeOptions
/*			  
		{
			
			scales: { z: {}, },
			orbitControls: { enableRotate: true, },
			camera: { position: [ 0.4, 0.4, 2 ] },
			
		}
*/		
		);

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

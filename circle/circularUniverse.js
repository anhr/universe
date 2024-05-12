/**
 * @module CircularUniverse
 * @description All the vertices of the Universe form a circle.
 * All the vertices of the CircularUniverse form a circle.
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

//const sCircularUniverse = 'CircularUniverse';

class CircularUniverse extends Universe {

	/**
	 * CircularUniverse.
	 * All the vertices of the CircularUniverse form a circle.
	 * @param {object} [universeSettings] <b>CircularUniverse</b> class settings. See <a href="./module-Universe-Universe.html" target="_blank">Universe classSettings</a>.
	 **/
	constructor(universeSettings = {}, myThreeOptions = {}) {

		super(universeSettings, myThreeOptions);

	}
	getHuperSphere(scene, options, universeSettings) {

		return new Circle(options, universeSettings);

	}
	name(getLanguageCode) {

		//Localization

		const lang = {

			name: 'Circular Universe',

		};

		switch (getLanguageCode()) {

			case 'ru'://Russian language

				lang.name = 'Круговая вселенная';

				break;

		}
		return lang.name;

	}

}

import Circle from '../../../commonNodeJS/master/HuperSphere/circle.js'
CircularUniverse.ND = Circle.ND;
CircularUniverse.edgesCreationMethod = Circle.edgesCreationMethod;
export default CircularUniverse;
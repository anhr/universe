/**
 * @module CircularUniverse
 * @description Circular Universe.
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
	 * All vertices of the <b>CircularUniverse</b> form a circle.
	 * @param {object} [universeSettings={}] See <a href="../../../commonNodeJS/master/HyperSphere/jsdoc/module-HyperSphere-HyperSphere.html" target="_blank">HyperSphere classSettings</a> parameter.
	 * @param {object} [myThreeOptions={}] See <a href="../../../commonNodeJS/master/myThree/jsdoc/module-MyThree-MyThree.html" target="_blank">MyThree optionss</a> parameter.
	 **/
	constructor(universeSettings = {}, myThreeOptions = {}) {

		super(universeSettings, myThreeOptions);

	}
	getHyperSphere(options, universeSettings) { return new Circle(options, universeSettings); }
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

import Circle from '../../../commonNodeJS/master/HyperSphere/circle.js'
CircularUniverse.ND = Circle.ND;
CircularUniverse.edgesCreationMethod = Circle.edgesCreationMethod;
export default CircularUniverse;
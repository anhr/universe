/**
 * @module Universe1D
 * @description 1 dimensional hypersphere universe.
 * All the vertices of the Universe1D form a circle.
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


import Universe from './universe.js';
import Circle from '../../commonNodeJS/master/HuperSphere/circle.js'
//import three from '../../commonNodeJS/master/three.js'

const sUniverse1D = 'Universe1D';

class Universe1D extends Universe {

	constructor(universeSettings = {}) {


		/*
		//divide circle to segments
		const anglesCount = 10, angle = Math.PI * 2 / anglesCount, angles = [];
		for (let angleId = 0; angleId < anglesCount; angleId++) angles.push([angle * angleId]);
		*/
		
		super(universeSettings);

	}
	getHuperSphere(scene, options, universeSettings) {

		return new Circle(options, universeSettings);

	}
	name(options) {

		//Localization

		const lang = {

			name: '1D Universe',

		};

		switch (options.getLanguageCode()) {

			case 'ru'://Russian language

				lang.name = '1D Вселенная';

				break;

		}
		return lang.name;
		
	}

}

Universe1D.ND = Circle.ND;
Universe1D.edgesCreationMethod = Circle.edgesCreationMethod;

//Примеси
//https://learn.javascript.ru/mixins#:~:text=JavaScript%20%D0%BD%D0%B5%20%D0%BF%D0%BE%D0%B4%D0%B4%D0%B5%D1%80%D0%B6%D0%B8%D0%B2%D0%B0%D0%B5%D1%82%20%D0%BC%D0%BD%D0%BE%D0%B6%D0%B5%D1%81%D1%82%D0%B2%D0%B5%D0%BD%D0%BD%D0%BE%D0%B5%20%D0%BD%D0%B0%D1%81%D0%BB%D0%B5%D0%B4%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5,%D0%BA%D0%B0%D0%BA%20%D0%BC%D1%8B%20%D1%81%D0%B4%D0%B5%D0%BB%D0%B0%D0%BB%D0%B8%20%D1%8D%D1%82%D0%BE%20%D0%B2%D1%8B%D1%88%D0%B5.
/*
let mixin = {
  sayHi() {
    alert(`Привет`);
  },
  sayBye() {
    alert(`Пока`);
  }
};
Object.assign(Universe1D.prototype, mixin);
*/
/*
import Circle from '../../commonNodeJS/master/HuperSphere/circle.js'
Object.assign(Universe1D.prototype, Circle);
Universe1D.ND = Circle.ND;
Universe1D.edgesCreationMethod = Circle.edgesCreationMethod
*/

export default Universe1D;

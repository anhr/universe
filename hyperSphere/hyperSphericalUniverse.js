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

//select one:
//import distanceOfVertices from '../../../commonNodeJS/master/HyperSphere/distanceOfVertices/averageVerticesHSphere.js';
import distanceOfVertices from './averageVerticesHUniverse.js';
//or
//import distanceOfVertices from '../../../commonNodeJS/master/HyperSphere/distanceOfVertices/middleVerticesHSphere.js';

//const sHypersphericalUniverse = 'HypersphericalUniverse',
//	π = Math.PI;

class HypersphericalUniverse extends SphericalUniverse {


	/**
	 * All the vertices of the <b>HypersphericalUniverse</b> form a 3 dimensional [hypersphere]{@link https://en.wikipedia.org/wiki/N-sphere}.
	 * @param {object} [classSettings={}] See <a href="../../../commonNodeJS/master/HyperSphere/jsdoc/module-HyperSphere-HyperSphere.html" target="_blank">HyperSphere classSettings</a> parameter.
	 * <pre>
	 * Additional settings:
	 * </pre>
	 * @param {object} [compute={}] Compute methods
	 * @param {boolean} [compute.isUseCPU] Compute methods
			compute: {
				//isUseCPU: true,
				config: {
//					type: 'START_COMPUTE',//Default 'START_COMPUTE'

					//Select one:
					
					RANDOM_POINTS: 0,//Случайная точка не вычисляется. Вместо этого возвращается PSEUDO_RANDOM.
					
			        //Вычисляется случайное число.
			        //В GPU для получения случайного числа применяется хеширование(Hashing).Простой генератор псевдослучайных чисел(PCG).Permuted Congruential Generator(Перемешанный конгруэнтный генератор).
			        //Этот метод лучше всего вычисляет случайное число, но требует много времени на вычисления если не оптимизировать Google Chrome.
			        //Инструкция по оптимизации находится в Technical Guide: Enabling High-Performance GPU for Google Chrome https://github.com/anhr/universe/blob/main/hyperSphere/HUniverseEngine.md#technical-guide-enabling-high-performance-gpu-for-google-chrome Инструкцию по оттимизации смотри в D:\My documents\MyProjects\webgl\three.js\GitHub\universe\main\hyperSphere\webGPUHUniverse.js
					//Значение по умолчанию
			        //RANDOM_POINTS = 1;
					
					//PSEUDO_RANDOM: 0.1,//Have effect only if RANDOM_POINTS: 0. Default 0.5
					
					//DAMPING: 0.95,//Демпфирование движения. Default 0.95

					//Сила отталкивания. Чем меньше значение, тем слабее силы отталкивания между точками, и тем медленнее они двигаются
					//REPULSION_STRENGTH: 10,//По умолчанию не определено и зависит от количества вершин REPULSION_STRENGTH = config.a / classSettings.settings.object.geometry.angles.length.
					//a: 50,//имеет эффект только если не определен REPULSION_STRENGTH. Default 50
					

					//Hyperbola parametr. See RandomVertice.calculateHyperbola
					//p: 0 Прямая линия: y = x (через точки (0,0) и (π,π)).
					//p: 1 Два отрезка: вертикальный и горизонтальный
					//0 < p < 1 Гипербола. График гиперболы млжно посмотреть на http://localhost/anhr/commonNodeJS/master/HyperSphere/Examples/hyperbola.html
					p: 0.99,//Default 0

					//LOG: true,//log to console all calculated vertices. Default undefined
				},
	 **/
	constructor(classSettings = {}, myThreeOptions) { super(classSettings, myThreeOptions); }
	getHyperSphere(options, classSettings) {
		
		classSettings.distanceOfVertices = distanceOfVertices;
		return new HyperSphere3D(options, classSettings);
	
	}
	get edgesCreationMethod() { return HypersphericalUniverse.edgesCreationMethod; }
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
/**
 * Enums a methods for creating edges:
 * <pre>
 * Random: every vertice of the edge have random position.
 * NearestVertice: Vertices of the edge have nearest position.
 * </pre>
 * */
HypersphericalUniverse.edgesCreationMethod = HyperSphere3D.edgesCreationMethod;

export default HypersphericalUniverse;

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
import * as utils from '../../../commonNodeJS/master/HyperSphere/utilsHSphere.js'
import { evaluateDistribution, graphFolderChild, timeAnalysis } from '../../../commonNodeJS/master/HyperSphere/distanceOfVertices/thomsonAnalysisHSphere.js'
import { dat } from '../../../commonNodeJS/master/dat/dat.module.js';

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
	 * @param {object} [myThreeOptions={}] See <a href="../../../commonNodeJS/master/myThree/jsdoc/module-MyThree-MyThree.html" target="_blank">MyThree options</a> parameter.
	 **/
	constructor(classSettings = {}, myThreeOptions) {
		classSettings.utils = utils;
		super(classSettings, myThreeOptions);

		//Localization

		const lang = {

			thomsonAnalysis: 'Thomson Analysis',
			thomsonAnalysisTitle: 'Analysis of the results of solving the Thomson problem, in which at each step all vertices gradually move to a position in which the vertices are at the maximum distance from each other on the hypersphere.',
			
			thomsonAnalysisGraph: 'Thomson Analysis Graph',
			thomsonAnalysisGraphTitle: 'Graph of analysis of the results of solving the Thomson problem, in which at each step all vertices gradually move to a position in which the vertices are at the maximum distance from each other on the hypersphere.',
			
			step: 'Step: ',

		};
		const options = classSettings.settings.options;
		switch (options.getLanguageCode()) {

			case 'ru'://Russian language
				lang.thomsonAnalysis = 'Анализ задачи Томсона';
				lang.thomsonAnalysisTitle = 'Анализ результатов решения задачи Томсона, в которой на каждом шаге все вершины постепенно перемещаются к положению, в котором вершины находятся на максимальном расстоянии друг от друга на гиперсфере.';
				
				lang.thomsonAnalysisGraph = 'График анализа задачи Томсона';
				lang.thomsonAnalysisGraphTitle = 'График анализа результатов решения задачи Томсона, в которой на каждом шаге все вершины постепенно перемещаются к положению, в котором вершины находятся на максимальном расстоянии друг от друга на гиперсфере.';
				
				lang.step = 'Шаг: ';
				break;

		}

		//Thomson analysis. Analysis the iterative process known as [Thomson problem]{@link https://en.wikipedia.org/wiki/Thomson_problem} in which, at each step, all vertices gradually move toward a position in which the vertices are at the maximum distance from each other on the hypersphere.
		this.timesOnChange = (display) => {
			fThomsonAnalysis.domElement.style.display = display;
//			if (!fThomsonAnalysis.closed) tomsonAnalysis(firstElementChild, lang.step + '%step / ');
			if (!fThomsonAnalysis.closed) timeAnalysis(fThomsonAnalysis, firstElementChild, lang.step + '%step / ', classSettings);
		}
		let tomsonAnalysis;//Функция, которая анализирует вершины для данного шагп проигрывателя на предмет удаленности друг от друга
		let fThomsonAnalysis, fThomsonAnalysisGraph;
		this.tomsonAnalysisFolder = (fPoints) => {
			if (fThomsonAnalysis) return;

			fThomsonAnalysis = fPoints.addFolder(lang.thomsonAnalysis);
			dat.folderNameAndTitle(fThomsonAnalysis, lang.thomsonAnalysis, lang.thomsonAnalysisTitle);
			fThomsonAnalysis.domElement.style.display = 'none';
			
			fThomsonAnalysisGraph = fPoints.addFolder(lang.thomsonAnalysisGraph);
			dat.folderNameAndTitle(fThomsonAnalysisGraph, lang.thomsonAnalysisGraph, lang.thomsonAnalysisGraphTitle);

			const folderClick = (folder, func) => {
				// Находим элемент заголовка папки в DOM
				const folderTitle = folder.domElement.querySelector('.title');

				folderTitle.addEventListener('click', () => {
					// Проверяем свойство .closed, чтобы понять, открылась папка или закрылась
					// Важно: в момент клика состояние .closed меняется не сразу, 
					// поэтому проверяем инвертированное значение либо ставим минимальный setTimeout
					setTimeout(() => {
						if (!folder.closed) {
							//									console.log('Папка "Name" была открыта!');
							const firstElement = textController.__li.firstElementChild.firstElementChild;

							//Растягиваем текст на всю длинну контроллера.
							//Не могу это сделать сразу после создания textController потому что firstElementChild еще не создан
							firstElement.style.width = '100%';
							firstElement.style.float = 'none';
							firstElement.style.maxWidth = '100%'; // На случай жестких ограничений в стилях
//							setFirstElementChild(firstElement);

							func(firstElement, textController);
						} else {
							//									console.log('Папка "Name" была закрыта!');
						}
					}, 0);
				});

				//Добавить в папку строку, в которой будет отображаться текущее состояние процесса анализа результатов выополения задачи Томсона

				// 1. Создаем пустой контроллер-заглушку (привязываем к пустой функции)
				const dummyObj = { fakeFunction: function () { } };
				const textController = folder.add(dummyObj, 'fakeFunction');

				// 2. Отключаем клики, чтобы строка не реагировала на нажатия и не вела себя как кнопка
				textController.domElement.style.pointerEvents = 'none';

				// 3. Прячем правую часть (где у кнопок обычно стрелочка или пустая зона)
				const rightPart = textController.domElement.querySelector('.c');
				if (rightPart) {
					rightPart.style.display = 'none';
				}

				// 4. Задаем начальный текст
				textController.name(lang.step);
			}
			folderClick(fThomsonAnalysis, (firstElementChildNew) => {
					firstElementChild = firstElementChildNew;
					timeAnalysis(fThomsonAnalysis, firstElementChild, lang.step + '%step / ', classSettings);
//					tomsonAnalysis(firstElementChild, lang.step + '%step / ');
				},
//				(firstElementChildNew) => { firstElementChild = firstElementChildNew;}
			);
			folderClick(fThomsonAnalysisGraph, (firstElementChildNew, textController) => {
//					firstElementChildGraph = firstElementChildNew;
					graphFolderChild(fThomsonAnalysisGraph, classSettings, textController);
				},
			);
		}
		let firstElementChild;//, firstElementChildGraph;
/*		
		const tomsonAnalysisRes = {}, aTomsonAnalysisRes = [];
		const anglesLength = classSettings.settings.object.geometry.angles.length;
*/		
//		this.tomsonAnalysis = (timeId) => { console.error('Убрать this.tomsonAnalysis'); }
	}
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

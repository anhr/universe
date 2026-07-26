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
import { evaluateDistribution, graphFolderChild } from '../../../commonNodeJS/master/HyperSphere/distanceOfVertices/thomsonAnalysisHSphere.js'
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
			if (!fThomsonAnalysis.closed) tomsonAnalysis(firstElementChild, lang.step + '%step / ');
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

							func(firstElement);
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
					tomsonAnalysis(firstElementChild, lang.step + '%step / ');
				},
//				(firstElementChildNew) => { firstElementChild = firstElementChildNew;}
			);
			folderClick(fThomsonAnalysisGraph, (firstElementChildNew) => {
//					firstElementChildGraph = firstElementChildNew;
					graphFolderChild(fThomsonAnalysisGraph);
				},
			);
/*
			//Вызов tomsonAnalysis() после открытия папки
			// Находим элемент заголовка папки в DOM
			const folderTitle = fThomsonAnalysis.domElement.querySelector('.title');

			folderTitle.addEventListener('click', () => {
				// Проверяем свойство .closed, чтобы понять, открылась папка или закрылась
				// Важно: в момент клика состояние .closed меняется не сразу, 
				// поэтому проверяем инвертированное значение либо ставим минимальный setTimeout
				setTimeout(() => {
					if (!fThomsonAnalysis.closed) {
						//									console.log('Папка "Name" была открыта!');
						firstElementChild = textController.__li.firstElementChild.firstElementChild;

						//Растягиваем текст на всю длинну контроллера.
						//Не могу это сделать сразу после создания textController потому что firstElementChild еще не создан
						firstElementChild.style.width = '100%';
						firstElementChild.style.float = 'none';
						firstElementChild.style.maxWidth = '100%'; // На случай жестких ограничений в стилях

						tomsonAnalysis(firstElementChild, lang.step + '%step / ');
					} else {
						//									console.log('Папка "Name" была закрыта!');
					}
				}, 0);
			});

			//Добавить в папку строку, в которой будет отображаться текущее состояние процесса анализа результатов выополения задачи Томсона

			// 1. Создаем пустой контроллер-заглушку (привязываем к пустой функции)
			const dummyObj = { fakeFunction: function () { } };
			const textController = fThomsonAnalysis.add(dummyObj, 'fakeFunction');

			// 2. Отключаем клики, чтобы строка не реагировала на нажатия и не вела себя как кнопка
			textController.domElement.style.pointerEvents = 'none';

			// 3. Прячем правую часть (где у кнопок обычно стрелочка или пустая зона)
			const rightPart = textController.domElement.querySelector('.c');
			if (rightPart) {
				rightPart.style.display = 'none';
			}

			// 4. Задаем начальный текст
			textController.name(lang.step);
*/
		}
		const tomsonAnalysisRes = {}, aTomsonAnalysisRes = [];
		let firstElementChild;//, firstElementChildGraph;
		const anglesLength = classSettings.settings.object.geometry.angles.length;
		this.tomsonAnalysis = (timeId) => {
			aTomsonAnalysisRes[timeId] ||= {};
			tomsonAnalysis = async (elStep, stepFormat) => {
				//Копируем результаты анализа в tomsonAnalysisRes
				Object.assign(tomsonAnalysisRes, Object.keys(aTomsonAnalysisRes[timeId]).length === 0 ?
					//Если результаты анализа не готовы, то вычисляем их.
					await evaluateDistribution(timeId, {
						pointsPerStep: anglesLength,
						//								angles: classSettings.settings.object.geometry.angles,
						position: classSettings.settings.bufferGeometry.attributes.position,
						elStep: elStep,
						stepFormat: stepFormat + anglesLength,
						tomsonAnalysisRes: aTomsonAnalysisRes[timeId],
					}) :
					//Результаты анализа уже есть в aTomsonAnalysisRes[timeId]
					aTomsonAnalysisRes[timeId]);

				const createController = (property, title, name) => {
					if (fThomsonAnalysis.__controllers.find(c => c.property === property)) return;

					// 2. Добавляем свойство в папку и заставляем GUI следить за ним (.listen())

					const controller = fThomsonAnalysis.add(tomsonAnalysisRes, property).listen();

					// 3. БЛОКИРОВКА РЕДАКТИРОВАНИЯ:
					// Запрещаем любые клики и ввод в область этого контроллера
					controller.domElement.style.pointerEvents = 'none';

					// Опционально: делаем поле ввода визуально неотличимым от обычного текста
					const inputField = controller.domElement.querySelector('input');
					if (inputField) {
						inputField.style.background = 'transparent';
						inputField.style.border = 'none';
						inputField.style.color = '#fff'; // Оставляем белый цвет текста
						inputField.style.textShadow = 'none';
					}

					// Записываем подсказку в атрибут title всего контейнера строки
					dat.controllerNameAndTitle(controller, name, title);

					// Заставляем браузер правильно обрабатывать переносы строк (\n) внутри всплывающего окна
					controller.domElement.style.whiteSpace = 'pre-line';

					return controller;
				}
				const languageCode = classSettings.settings.options.getLanguageCode();
				createController('totalEnergyPercent', languageCode === 'ru' ?
					`Общая энергия — это суммарная потенциальная электростатическая энергия системы взаимодействующих зарядов (точек), рассчитываемая по закону Кулона как сумма обратных расстояний (1/d) между всеми парами точек. Она служит главным показателем сходимости алгоритма: при оптимальном и равномерном распределении точек на гиперсфере значение общей энергии стремится к своему теоретическому минимуму
Растет от шага к шагу:
 	Ошибка в знаках сил (точки притягиваются вместо отталкивания) либо слишком большой шаг интегрирования (dt).
Энергия totalEnergy уходит в бесконечность или NaN:
 	Ошибка в коде вычислений, при которой две точки заняли абсолютно одинаковые координаты (деление на ноль).
 	Проверьте генератор случайных чисел или начальную инициализацию.` :
					`Total energy is the cumulative potential electrostatic energy of a system of interacting charges (points). Calculated via Coulomb's law as the sum of reciprocal distances (1/d) between all pairs of vertices, it acts as the primary metric for algorithmic convergence, reaching its theoretical minimum when points achieve optimal, uniform distribution across the hypersphere.
Increasing from step to step:
	Error in the force signs (points attract instead of repel) or the integration step (dt) is too large.
TotalEnergy goes to infinity or is NaN:
	Error in the calculation code, causing two points to occupy exactly the same coordinates (division by zero).
	Check the random number generator or initialization.`, 'totalEnergy');
				createController('deviationPercent', languageCode === 'ru' ?
					`Коэффициент вариации (дисбаланс).
Коэффициент вариации (deviationPercent) высокий (например, > 15-20%):
 	Точки распределены хаотично, решетка не сформировалась.
 	Скорее всего, силам отталкивания не хватает итераций, либо коэффициент затухания скорости (DAMPING) гасит движение слишком рано.
deviationPercent стремится к 0% (например, < 2-5%):
 	Алгоритм работает отлично, структура симметрична, точки распределились максимально равномерно.` :
					`Variation coefficient (imbalance).
The variation coefficient (deviationPercent) is high (e.g., > 15-20%):
	The points are distributed randomly, and the lattice has not formed.
	Most likely, the repulsive forces are not receiving enough iterations, or the velocity damping coefficient (DAMPING) is damping the motion too early.
deviationPercent approaches 0% (e.g., < 2-5%):
	The algorithm is working perfectly, the structure is symmetrical, and the points are distributed as evenly as possible.`);
				createController('meanD', languageCode === 'ru' ?
					`Среднее расстояние до ближайшего соседа. Должно постепенно расти, пока не стабилизируется.` :
					`Average distance to nearest neighbor. Should gradually increase until it stabilizes.`);
				createController('stdDev', languageCode === 'ru' ?
					`Среднеквадратичное отклонение (СКО): С каждым шагом алгоритма значение stdDev должно стремиться к нулю` :
					`Standard Deviation (SD): With each step of the algorithm, the stdDev value should tend to zero.`);
				createController('variance', languageCode === 'ru' ?
					`Дисперсия(средний квадрат отклонения). Мера того, насколько сильно расстояния до соседей у разных точек "разбросаны" относительно вычисленного среднего значения meanD` :
					`Variance (mean squared deviation). A measure of how widely the distances to neighbors of different points are "dispersed" relative to the calculated mean value (meanD)..`);
			}
		}
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

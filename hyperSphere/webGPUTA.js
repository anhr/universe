/**
 * @module WebGPUTA
 * @description GPU (WebGPU) ускорение анализа распределения точек [Thomson Problem]{@link https://en.wikipedia.org/wiki/Thomson_problem} на S^3.
 * <pre>
 * 
 * Analysis the iterative process known as [Thomson problem]{@link https://en.wikipedia.org/wiki/Thomson_problem} in which, at each step, all vertices gradually move toward a position in which the vertices are at the maximum distance from each other on the hypersphere.
 * You can see results of Analysis in the console of the web page and on a small graph in the rigth top corner of the canvas.
 * 
 * Архитектура: tiled reduction.
 *  - Каждая воркгруппа из TILE=256 потоков обрабатывает один тайл из TILE точек i
 *    для одного timeId t.
 *  - Внутри проходим по всем j, используя shared memory для координат.
 *  - Глобальные буферы только O(marks*N), без marks*N².
 *  - Радиус r индивидуален для каждого timeId (storage-буфер rArray).
 *
 * </pre>
 * @license under the Apache License, Version 2.0
 */

//import * as Spinner from '../../Spinner.js';
import * as Spinner from '../../../commonNodeJS/master/Spinner.js';
import WebGPUClient from './webGPUClient.js'
import { dat } from '../../../commonNodeJS/master/dat/dat.module.js';

//const sWebGPUTA = 'WebGPUTA';


// ============================================================================
// 2. WEBGPU-ОЦЕНЩИК (tiled reduction)
// ============================================================================

class WebGPUTA extends WebGPUClient {

	/**
	 * Analysis the iterative process known as [Thomson problem]{@link https://en.wikipedia.org/wiki/Thomson_problem} in which, at each step, all vertices gradually move toward a position in which the vertices are at the maximum distance from each other on the hypersphere.
	 * You can see results of Analysis in the console of the web page and on a small graph in the rigth top corner of the canvas.
	 */
	constructor(classSettings, textController, timeIdController, createLabel, sTimeID) {
		super();
		const marks = classSettings.settings.options.playerOptions.marks;
		this.webGPUPage = () => { return '<a href="../webGPUTA.html" target="_blank" style="color: blue;">Thomson Analysis Engine</a>'; }
		this.pageType = () => { return 'mainThomsonAnalysis'; }
		this.name = () => { return ' Thomson Analysis' }
		this.onmessageString = (aTomsonAnalysisRes) => {
			// ==== Отладочный вывод aTomsonAnalysisRes построчно ====
			if (classSettings.debug && classSettings.debug.log) {
				console.log('=== aTomsonAnalysisRes (per timeId) ===');
				for (let t = 0; t < marks; t++) {
					console.log(`[timeId=${t}]`, aTomsonAnalysisRes[t]);
				}
				console.log('=== end aTomsonAnalysisRes ===');
			}
			// ====
			
			function getLiEl(controller) {
			
				var el = controller.domElement;
				while (el.tagName.toUpperCase() !== "LI") el = el.parentElement;
				return el;
			
			}
			
			//dislay element
			
			function dislayEl(controller, displayController) {
			
				if (controller === undefined)
					return;
				if (typeof displayController === "boolean")
					displayController = displayController ? 'block' : 'none';
				else if (displayController === undefined)
					displayController = 'none';
				else if (typeof displayController !== "string")
					displayController = 'block';
				getLiEl(controller).style.display = displayController;
			
			}
			const graphFolderControllers = [],//Этот массив нужен для скрытия и отображения графиков когода пользователь закрывает а затем снова открывает папку Tomson Analysis Graph
				graphFolderControllersDislay = (display) => {
					graphFolderControllers.forEach((controller) => {
						dislayEl(controller, display);
					})
				}

			if (textController) dislayEl(textController, 'none');
			if (timeIdController) dislayEl(timeIdController, 'none');

			let lang;
			const localization = (languageCode) => {
				if (lang) return lang;
				lang = {
					totalEnergyPercent:
			`Total energy is the cumulative potential electrostatic energy of a system of interacting charges (points). Calculated via Coulomb's law as the sum of reciprocal distances (1/d) between all pairs of vertices, it acts as the primary metric for algorithmic convergence, reaching its theoretical minimum when points achieve optimal, uniform distribution across the hypersphere.
Increasing from step to step:
	Error in the force signs (points attract instead of repel) or the integration step (dt) is too large.
TotalEnergy goes to infinity or is NaN:
	Error in the calculation code, causing two points to occupy exactly the same coordinates (division by zero).
	Check the random number generator or initialization.`,
					deviationPercent:
			`Variation coefficient (imbalance).
The variation coefficient (deviationPercent) is high (e.g., > 15-20%):
	The points are distributed randomly, and the lattice has not formed.
	Most likely, the repulsive forces are not receiving enough iterations, or the velocity damping coefficient (DAMPING) is damping the motion too early.
deviationPercent approaches 0% (e.g., < 2-5%):
	The algorithm is working perfectly, the structure is symmetrical, and the points are distributed as evenly as possible.`,
					meanD: `Average distance to nearest neighbor. Should gradually increase until it stabilizes.`,
					stdDev: `Standard Deviation (SD): With each step of the algorithm, the stdDev value should tend to zero.`,
					variance: `Variance (mean squared deviation). A measure of how widely the distances to neighbors of different points are "dispersed" relative to the calculated mean value (meanD)..`,
				};
				switch (languageCode) {
					case 'ru'://Russian language
						lang.totalEnergyPercent =
							`Общая энергия — это суммарная потенциальная электростатическая энергия системы взаимодействующих зарядов (точек), рассчитываемая по закону Кулона как сумма обратных расстояний (1/d) между всеми парами точек. Она служит главным показателем сходимости алгоритма: при оптимальном и равномерном распределении точек на гиперсфере значение общей энергии стремится к своему теоретическому минимуму
Растет от шага к шагу:
 	Ошибка в знаках сил (точки притягиваются вместо отталкивания) либо слишком большой шаг интегрирования (dt).
Энергия totalEnergy уходит в бесконечность или NaN:
 	Ошибка в коде вычислений, при которой две точки заняли абсолютно одинаковые координаты (деление на ноль).
 	Проверьте генератор случайных чисел или начальную инициализацию.`;
						lang.deviationPercent =
				`Коэффициент вариации (дисбаланс).
Коэффициент вариации (deviationPercent) высокий (например, > 15-20%):
 	Точки распределены хаотично, решетка не сформировалась.
 	Скорее всего, силам отталкивания не хватает итераций, либо коэффициент затухания скорости (DAMPING) гасит движение слишком рано.
deviationPercent стремится к 0% (например, < 2-5%):
 	Алгоритм работает отлично, структура симметрична, точки распределились максимально равномерно.`;
						lang.meanD = `Среднее расстояние до ближайшего соседа. Должно постепенно расти, пока не стабилизируется.`;
						lang.stdDev = `Среднеквадратичное отклонение (СКО): С каждым шагом алгоритма значение stdDev должно стремиться к нулю`;
						lang.variance = `Дисперсия(средний квадрат отклонения). Мера того, насколько сильно расстояния до соседей у разных точек "разбросаны" относительно вычисленного среднего значения meanD`;
						break;
				}
				return lang;
			}

			function getTotalEnergyPercent(currentVal) { return ` of ${totalEnergyMin.toFixed(4)} ${(((currentVal - totalEnergyMin) / totalEnergyMin) * 100).toFixed(1)}%` }
			
			const createGraphController = (displayProperty) => {
				if (displayProperty === 'totalEnergyPercent') return;//вместо этого используется totalEnergy
				if (createLabel) {
					const info = aTomsonAnalysisRes[aTomsonAnalysisRes.length - 1][displayProperty];
					const labelController = createLabel(sTimeID);
					const lang = localization(classSettings.settings.options.getLanguageCode());
					let title;
					switch (displayProperty) {
						case 'totalEnergy': title = lang.totalEnergyPercent; break;
						case 'deviationPercent': title = lang.deviationPercent; break;
						case 'meanD': title = lang.meanD; break;
						case 'stdDev': title = lang.stdDev; break;
						case 'variance': title = lang.variance; break;
						default: console.error(sThomsonAnalysisHSphere + ' createGraphController: Invalid displayProperty: ' + displayProperty);
					}
					dat.controllerNameAndTitle(labelController, displayProperty + ': ' + info.toFixed(4) + (displayProperty === 'totalEnergy' ? getTotalEnergyPercent(info) : ''), title);
				}
		
				// 1. Создаем пустой контроллер-контейнер (привязываем к пустой функции)
				const dummyObj = {};
				dummyObj[displayProperty] = function () { };
				const canvasController = folder.add(dummyObj, displayProperty);
				canvasController.name('');
		
				// Отключаем клики по самой строке GUI, чтобы не триггерить "кнопку"
				canvasController.domElement.style.pointerEvents = 'none';
		
				// Скрываем правую часть управления dat.gui
				const rightPart = canvasController.domElement.querySelector('.c') || canvasController.domElement.querySelector('.widget');
				if (rightPart) rightPart.style.display = 'none';
		
				// Растягиваем текстовый блок на 100% ширины папки
				const labelPart = canvasController.domElement.querySelector('div');
				if (labelPart) {
					labelPart.style.width = '100%';
					labelPart.style.float = 'none';
				}
		
				// 2. Создаем HTML-холст и встраиваем его внутрь контроллера
				const canvas = document.createElement('canvas');
		
				// 4. Настраиваем сам контейнер строки, чтобы холст встал ровно по левому краю
				canvasController.domElement.style.width = '100%';
				canvasController.domElement.style.padding = '0';
				canvasController.domElement.style.margin = '0';
		
				// 5. Вставляем холст напрямую в корневой элемент контроллера (вместо labelPart)
				canvasController.domElement.appendChild(canvas);
		
				// Убедимся, что у самого холста сброшены внешние отступы
				canvas.style.width = '100%';
				canvas.style.marginLeft = '0';
				canvas.style.padding = '0';
				canvas.style.display = 'block'; // Предотвращаем лишние нижние отступы (inline-gap)
				canvas.style.pointerEvents = 'auto'; // Возвращаем мышь холсту для интерактива
		
				// =========================================================================
				// 6. СОЗДАНИЕ ТУЛТИПА (ВСПЛЫВАЮЩЕГО ОКНА) ДЛЯ КУРСОРA
				// =========================================================================
				const tooltip = document.createElement('div');
				tooltip.style.position = 'fixed';
				tooltip.style.display = 'none';
				tooltip.style.padding = '4px 8px';
				tooltip.style.background = 'rgba(0, 0, 0, 0.85)';
				tooltip.style.color = '#fff';
				tooltip.style.border = '1px solid #555';
				tooltip.style.borderRadius = '4px';
				tooltip.style.fontFamily = 'sans-serif';
				tooltip.style.fontSize = '11px';
				tooltip.style.lineHeight = '1.3';
				tooltip.style.pointerEvents = 'none'; // Пропускаем клики сквозь тултип
				tooltip.style.zIndex = '10000';
				tooltip.style.boxShadow = '0px 2px 6px rgba(0,0,0,0.5)';
				document.body.appendChild(tooltip);
		
				canvas.addEventListener('mousemove', (e) => {
					if (!aTomsonAnalysisRes || aTomsonAnalysisRes.length === 0) return;
		
					const rect = canvas.getBoundingClientRect();
					const mouseX = e.clientX - rect.left;
		
					// Ограничения отрисовки из функции drawAnalysisGraph
					const paddingLeft = 15;
					const paddingRight = 25;
					const graphWidth = rect.width - (paddingLeft + paddingRight);
		
					if (graphWidth <= 0) return;
		
					// Вычисляем индекс timeId по X координате курсора
					let index = Math.round(((mouseX - paddingLeft) / graphWidth) * (aTomsonAnalysisRes.length - 1));
		
					// Ограничиваем индекс диапазоном массива [0, aTomsonAnalysisRes.length - 1]
					index = Math.max(0, Math.min(index, aTomsonAnalysisRes.length - 1));
		
					const itemData = aTomsonAnalysisRes[index];
					if (!itemData || itemData[displayProperty] === undefined) {
						tooltip.style.display = 'none';
						return;
					}
		
					// Формируем текст тултипа
					let text = `<b>timeId:</b> ${index}`;//<br/><b>${displayProperty}:</b> ${valStr}`;
		
					Object.keys(itemData).forEach(key => {
						if (key === 'totalEnergyPercent') return;
						const val = itemData[key];
						const valStr = typeof val === 'number' ? val.toFixed(4) : val;
						text += `<br/><b>${key}:</b> ${valStr}`;
						if (key === 'totalEnergy' && typeof val === 'number') {
							text += getTotalEnergyPercent(val);
						}
					});
		
					tooltip.innerHTML = text;
					tooltip.style.display = 'block';
		
					// ПОЗИЦИОНИРОВАНИЕ СЛЕВА ОТ МЫШКИ:
					const tooltipWidth = tooltip.offsetWidth;
					tooltip.style.left = (e.clientX - tooltipWidth - 12) + 'px';
					tooltip.style.top = (e.clientY + 12) + 'px';
				});
		
				canvas.addEventListener('mouseleave', () => {
					tooltip.style.display = 'none';
				});
				// =========================================================================
		
				// 4. ФУНКЦИЯ ИЗМЕНЕНИЯ ВЫСОТЫ ИЗ ПРОГРАММЫ
				let currentTargetHeight = 150;
		
				function setGraphHeight(newHeightPx) {
					currentTargetHeight = newHeightPx;
		
					const rowElement = canvasController.domElement.closest('li') || canvasController.domElement;
					if (rowElement) {
						rowElement.style.height = 'auto';
						rowElement.style.lineHeight = 'normal';
					}
		
					canvasController.domElement.style.height = currentTargetHeight + 'px';
					canvas.style.height = currentTargetHeight + 'px';
		
					drawAnalysisGraph(aTomsonAnalysisRes, displayProperty, canvas, false);
				}
		
				// 6. АВТОПДСТРОЙКА ПРИ РАСТЯГИВАНИИ МЫШКОЙ (ResizeObserver)
				const resizeObserver = new ResizeObserver((entries) => {
					for (let entry of entries) {
						const newWidth = entry.contentRect.width;
		
						if (newWidth > 0) {
							drawAnalysisGraph(aTomsonAnalysisRes, displayProperty, canvas, false);
						}
		
					}
				});
		
				// Запускаем отслеживание для контейнера нашего контроллера
				resizeObserver.observe(canvasController.domElement);
		
				// Задаем начальную высоту, например, 150px
				setGraphHeight(150);
		
				graphFolderControllers.push(canvasController);
			}
			Object.keys(aTomsonAnalysisRes[0]).forEach(key => {
				createGraphController(key);
			});
		}
		this.setElRow = () => {}
		this.createCProgress = () => {}
		this.setCurrentStep = () => {}
		this.sendData = () => {
			const rArray = new Float32Array(marks);
			
			for (let timeId = 0; timeId < marks; timeId++) {
				rArray[timeId] = classSettings.overriddenProperties.rTime(timeId);
			}
/*            
			for (let t = 0; t < marks; t++) {
				const r = rTimeResolver ? rTimeResolver(t) : 1;
				rArray[t] = (typeof r === 'number' && r > 0) ? r : 1;
			}
*/   
			this.sendBinary("RADS", rArray);
		}
	}
}
export default WebGPUTA;

/**
 * @module GPUThomsonEngine
 * @description Solving the [Thomson Problem]{@link https://en.wikipedia.org/wiki/Thomson_problem} for a [hypersphere]{@link https://en.wikipedia.org/wiki/N-sphere} on a graphics processing unit (GPU).
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

import GPUEngine from './GPUEngine.js'

class GPUThomsonEngine extends GPUEngine {
	constructor (){
		super();
		let count, currentStep, positionArray,
			radiusPrev, radiusStep, gpuParamsBuffer, gpuPositionsBuffer;
		this.onmessageStartCompute = () => {
			count = this.config.totalSteps * this.config.pointsPerStep;
			document.getElementById('pointsPerStep').innerText = this.config.pointsPerStep;
			document.getElementById('totalStepsDisplay').innerText = this.config.totalSteps;
			currentStep = 1;
		}
		this.onmessageBinaryData = (event) => {
			positionArray = new Float32Array(event.data);
		}
		this.mainDisconnected = () => {
			if (this.config) currentStep = this.config.totalSteps - 1;
		}
		this.dataType = (data) => {
			switch (data.type) {
				case "PROGRESS":
					progressStep(data.currentStep);
					break;
				default:
					const error = 'socket message: Invalid data.type: ' + type;
					this.setState(error, true);
			}
		}
/*
		this.onmessage = async (event) => {
			if (typeof event.data === 'string') {
				const data = JSON.parse(event.data);
				switch (data.type) {
					case "START_COMPUTE":
						this.config = data;
						count = this.config.totalSteps * this.config.pointsPerStep;
						document.getElementById('pointsPerStep').innerText = this.config.pointsPerStep;
						document.getElementById('totalStepsDisplay').innerText = this.config.totalSteps;
						this.elStatus.innerText = "CONFIG RECEIVED";
						const clientText = event.origin || "Localhost";
						this.elClient.innerText = clientText;
					
						const stateText = document.getElementById('stateText');
						stateText.innerHTML = 'Main page ' + clientText;
						stateText.style.color = "#00ffcc";
					
						currentStep = 1;
						this.log('Start compute. Source: ' + clientText);
						break;
					case "MAIN_DISCONNECTED":
						this.elStatus.innerText = "IDLE";
						if (this.config) currentStep = this.config.totalSteps - 1;
						this.log('Main page disconnected.');
						break;
					case "PROGRESS":
						progressStep(data.currentStep);
						break;
					default:
						const error = 'socket message: Invalid data.type: ' + data.type;
						this.setState(error, true);
				}
			} else {
				// Двоичные данные
				this.elStatus.innerText = "Binary data received";
				positionArray = new Float32Array(event.data);
				try {
					await this.runAuto();
				} catch (e) {
					this.elStatus.innerText = "ERROR";
					this.cleanupGpuResources();
					this.setState(this.sError + e.message, true);
				}
			}
		}
*/
		this.engineName = () => { return 'Thomson problen for hypersphere'; }
		this.type = () => { return 'gpu'; }
		this.addElements = () => { return `
			<div>PROGRESS: <span id="stepCounter">0</span> / <span id="totalStepsDisplay">0</span> | R: <span id="radVal">0.00</span> </div>
			<div>Points Per Step: <span id="pointsPerStep">---</span></div>
		`;
		}
		this.requiredPosBufSize = () => { return this.config.totalSteps * this.config.pointsPerStep * 16; }
		this.deviceError = () => {
			// Принудительно останавливаем циклы в runAuto (сбрасываем счетчик шагов)
/*не помню почему вставил это условие
			if (window.config) {
				currentStep = this.config.totalSteps;
			}
*/			
			currentStep = this.config.totalSteps;
		}
		this.createShaderCode = () => {
			//for random function in WebGPU

			let random_gpu, ramdom_param, ramdom_param2;
			switch (this.config.RANDOM_POINTS) {
				case 0:
					ramdom_param = ``;
					ramdom_param2 = ``;
					random_gpu = `
							fn random() -> f32 { return ${this.config.PSEUDO_RANDOM}; }`
					break;
				case 1:
					//Хеширование (Hashing). Простой генератор псевдослучайных чисел (PCG). Permuted Congruential Generator (Перемешанный конгруэнтный генератор).
					// Функция принимает указатель на состояние и обновляет его внутри
					ramdom_param = `seed: ptr < function, u32 >`;
					ramdom_param2 = `seed`;
					random_gpu =
						`
							fn random(${ramdom_param}) -> f32 {
								// 1. Извлекаем текущее значение, перемешиваем его
								var x = *seed;
								x = ((x >> 16u) ^ x) * 0x45d9f3bu;
								x = ((x >> 16u) ^ x) * 0x45d9f3bu;
								x = (x >> 16u) ^ x;

								// 2. Сохраняем обновленное состояние обратно
								*seed = x;

								// 3. Возвращаем нормализованное число 0.0 - 1.0
								return f32(x) / f32(0xffffffffu);
							}`
					break;
				case 2:
					ramdom_param = `pointIndex: u32, counter: ptr<function, u32>`;
					ramdom_param2 = `pointIndex, counter`;
					random_gpu = `
							fn random(${ramdom_param}) -> f32 {
								let poolSize = arrayLength(&randomPool);

								// 1. Берем текущее значение счетчика
								let currentOffset = *counter;

								// 2. Вычисляем индекс (смешиваем индекс точки, время и текущий offset)
								// Используем множители, чтобы "прыжки" по таблице были более хаотичными
								let idx = (pointIndex + uTime + currentOffset * 13u) % poolSize;

								// 3. Увеличиваем счетчик для следующего вызова
								*counter = currentOffset + 1u;
								return randomPool[idx];
							}`
					break;
				case 3:
					//Метод Weyl Sequence (последовательность Вейля) или просто линейным конгруэнтным методом поверх хеша.
					ramdom_param = `state: ptr<function, f32>`;
					ramdom_param2 = `state`;
					random_gpu = `
								// Качественный хеш для инициализации (выполняется 1 раз)
								fn hash_u32(n: u32) -> u32 {
									var x = n;
									x = ((x >> 16u) ^ x) * 0x45d9f3bu;
									x = ((x >> 16u) ^ x) * 0x45d9f3bu;
									x = (x >> 16u) ^ x;
									return x;
								}

								// Сверхбыстрая функция random (выполняется многократно)
								// Используем f32 для работы с дробной частью через fract
								fn random(${ramdom_param}) -> f32 {
									// Константа: иррациональное число (например, золотое сечение или корень из 2)
									// Это гарантирует, что дробная часть будет меняться максимально хаотично
									let phi: f32 = 0.61803398875;

									// Быстрая арифметика: прибавляем константу
									// Это и есть последовательность Вейля: x = fract(x + k)
									*state = fract(*state + phi);

									return *state;
								}`
					break;
				default: console.error('Invalid RANDOM_POINTS = ' + RANDOM_POINTS);
			}
			let hyperbola_gpu;
			const calculateHyperbola = (p) => {

				// Крайние случаи
				if (p === 0) {
					// Прямая линия: y = x (через точки (0,0) и (π,π))
					hyperbola_gpu = `
								fn hyperbola_gpu(arc: f32, i: u32) -> f32 {
									return arc;
								}`;
					return;// (arc) => { return arc; }
				}

				if (p === 1) {
					// Два отрезка: вертикальный и горизонтальный
					hyperbola_gpu = `
								fn hyperbola_gpu(arc: f32, i: u32) -> f32 {
									if (arc == 0) { return 0.0; }
									return PI;
								}`;
					return;
				}

				// Общий случай: гипербола вида y = a/(x - h) + k
				// У нас есть две точки: (0,0) и (π,π)
				// и дополнительное условие: при x = 0, y = 0
				// при x = π, y = π

				// Из точки (0,0): 0 = a/(0 - h) + k => k = a/h

				// Из точки (π,π): π = a/(π - h) + a/h

				// Вводим параметр p для контроля кривизны
				// Будем использовать p для определения положения асимптоты h
				// При p -> 0: h -> -∞ (гипербола вырождается в прямую)
				// При p -> 1: h -> 0 (гипербола вырождается в вертикальную линию)

				// Свяжем h с p: h = - (1-p)/p * C, где C некоторая константа
				// Чтобы при p=1, h=0; при p=0, h=-∞
				// Возьмем C = π/2 для хорошей визуализации

				const C = π / 2;

				// Избегаем деления на ноль при p=0 (уже обработано выше)
				let h;
				if (p < 0.001) {
					// Для очень малых p используем линейную аппроксимацию
					h = -C / p;
				} else {
					h = -C * (1 - p) / p;
				}

				// Вычисляем a из уравнения π = a/(π - h) + a/h
				// a = π / (1/(π - h) + 1/h) = π / ((h + π - h)/(h(π - h))) = π * h(π - h) / π = h(π - h)
				// Упростим: a = h * (PI - h)

				const a = h * (π - h);

				// Вычисляем к
				const k = a / h;
				hyperbola_gpu = `
							fn hyperbola_gpu(x: f32, i: u32) -> f32 {
								if (abs(x - (${h})) < 0.001) {
									messageBuffer.errorCode = 1u; // Код ошибки 1 = "hyperbola_gpu: Under construction"
									messageBuffer.i = i;
									messageBuffer.value = x;
									return PI;
								}
								return ${a} / (x - (${h})) + (${k});
							}`;
				return

			}
			calculateHyperbola(this.config.p);

			let bindingId = 0;

			// ГЕНЕРАЦИЯ ШЕЙДЕРА (МЕТАПРОГРАММИРОВАНИЕ)
			return `
					struct Params {
						eta : f32,
						beta : f32,
						rRatio : f32,
						nextR : f32,
						timeId : u32,
						positionBlockLength : u32,
					};

					@group(0) @binding(${bindingId++}) var<uniform> params : Params;
					@group(0) @binding(${bindingId++}) var<storage, read_write> positions : array<vec4<f32>>;
					@group(0) @binding(${bindingId++}) var<storage, read_write> velocities : array<vec4<f32>>;

					@compute @workgroup_size(64)
					fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
						let i = global_id.x;
						if (i >= params.positionBlockLength) {
							return;
						}

						// 1. Масштабирование скорости
						var v = velocities[i] * params.rRatio;

						// 2. Вычисление силы отталкивания
						let srcOffset = (params.timeId - 1u) * params.positionBlockLength + i;
						let pi = positions[srcOffset];
						var force = vec4<f32>(0.0, 0.0, 0.0, 0.0);

						for (var j : u32 = 0u; j < params.positionBlockLength; j = j + 1u) {
							if (i == j) {
								continue;
							}

							let jOffset = (params.timeId - 1u) * params.positionBlockLength + j;
							let pj = positions[jOffset];

							let d = pi - pj;
							let d2 = dot(d, d);
							let dist = sqrt(d2);

							if (dist > 0.0) {
								let m = 1.0 / (d2 * dist);
								force = force + d * m;
							}
						}

						// 3. Обновление скорости (Momentum)
						v = params.beta * v + params.eta * force;
						velocities[i] = v;

						// 4. Обновление позиции и проекция на гиперсферу
						let updated = pi + v;
						let mag = length(updated);

						let destOffset = params.timeId * params.positionBlockLength + i;
						positions[destOffset] = (updated / mag) * params.nextR;
					}
				`;
		}
		const paramsBufferSize = 32; // 8 x 4 bytes (aligned)
		this.createEntries = () => {
			const itemSize = 4; // 4D: x, y, z, w. и размер цвета

			// Буфер позиций
			gpuPositionsBuffer = this.device.createBuffer({
				size: positionArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
			});
			this.device.queue.writeBuffer(gpuPositionsBuffer, 0, positionArray);

			// Буфер скоростей
			const velocitiesArray = new Float32Array(this.config.pointsPerStep * itemSize);
			const gpuVelocitiesBuffer = this.device.createBuffer({
				size: velocitiesArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			});
			this.device.queue.writeBuffer(gpuVelocitiesBuffer, 0, velocitiesArray);

			// Uniform-буфер для параметров
			gpuParamsBuffer = this.device.createBuffer({
				size: paramsBufferSize,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			});

			// Создаем буфер для одного числа u32. Этот буфер используется для генератора случайных чисел в GPU.
			//timeBuffer = this.device.createBuffer({ size: 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });

			//Создание буфера случайных чисел, которые затем будут использоваться в WebGPU вместо герерации случайного числа в WebGPU

			// Функция проверки, является ли число простым
			function isPrime(n) {
				for (let i = 2, s = Math.sqrt(n); i <= s; i++) {
					if (n % i === 0) return false;
				}
				return n > 1;
			}

			// Находим ближайшее простое число к целевому значению
			function getNearestPrime(target) {
				let n = Math.floor(target);
				while (!isPrime(n)) { n++; }
				return n;
			}

			let randomBuffer;
			if (this.config.RANDOM_POINTS === 2) {
				// Подготовка данных LUT
				const totalPoints = this.config.pointsPerStep * this.config.totalSteps;; // Ваше текущее число точек
				// Размер буфера: 25% от количества точек, но не более 4096
				// Если totalPoints = 5000, то target = 1250. Ближайшее простое будет 1259.
				const lutSize = getNearestPrime(Math.min(totalPoints * 0.25, 4096));

				const randomData = new Float32Array(lutSize);
				for (let i = 0; i < lutSize; i++) {
					randomData[i] = Math.random();
				}

				// Создание буфера случайныз чисел на GPU
				randomBuffer = this.device.createBuffer({
					size: randomData.byteLength,
					usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
				});
				this.device.queue.writeBuffer(randomBuffer, 0, randomData);
			}
			let bindingId = 0;
			const entries = [
				{ binding: bindingId++, resource: { buffer: gpuParamsBuffer } },
				{ binding: bindingId++, resource: { buffer: gpuPositionsBuffer } },
				{ binding: bindingId++, resource: { buffer: gpuVelocitiesBuffer } },
			]
			this.bindGroup = this.device.createBindGroup({ layout: this.pipeline.getBindGroupLayout(0), entries: entries });
		}
		this.progressStepStart = async () => {
			radiusPrev = this.config.baseRadius;
			radiusStep = (this.config.radiusMax - this.config.baseRadius) / (this.config.totalSteps - 1);
			document.getElementById('totalStepsDisplay').innerText = this.config.totalSteps;
			progressStep();
		}
		const progressStep = async (currentStepNew) => {
			currentStep = currentStepNew != undefined ? currentStepNew : currentStep;
//			const _this = this;
			const updateDisplay = () => {
				document.getElementById('stepCounter').innerText = currentStep;
				document.getElementById('radVal').innerText = radiusPrev.toFixed(2);
				const progress = {
					type: 'PROGRESS',
					currentStep: currentStep,
					radiusPrev: radiusPrev,
				};
				this.socket.send(JSON.stringify(progress));

				this.elapsedTime.end();
			}

			if (currentStep < this.config.totalSteps) {

				//Для генератора случайных чисел
				//device.queue.writeBuffer(timeBuffer, 0, new Uint32Array([Math.floor(performance.now() * timeMultiplier)]));

				const newRadius = radiusPrev + radiusStep;

				const currentR = radiusPrev, timeId = currentStep, positionBlockLength = this.config.pointsPerStep;
				const nextR = newRadius;
				const rRatio = nextR / currentR;
				const eta = this.config.ETA_0 * Math.pow(currentR, 3);

				// Обновляем Uniforms
				const paramsArray = new ArrayBuffer(paramsBufferSize);
				const floatView = new Float32Array(paramsArray);
				const uintView = new Uint32Array(paramsArray);

				floatView[0] = eta;
				floatView[1] = this.config.BETA;
				floatView[2] = rRatio;
				floatView[3] = nextR;
				uintView[4] = timeId;
				uintView[5] = positionBlockLength;

				this.device.queue.writeBuffer(gpuParamsBuffer, 0, paramsArray);

				const encoder = this.device.createCommandEncoder();
				const pass = encoder.beginComputePass();
				pass.setPipeline(this.pipeline); pass.setBindGroup(0, this.bindGroup);
				pass.dispatchWorkgroups(Math.ceil(this.config.pointsPerStep / 64));
				pass.end();
				this.device.queue.submit([encoder.finish()]);
				updateDisplay();
				radiusPrev = newRadius;// currentStep++;
				return;
			}

			//await readMessageValue(currentStep);
			updateDisplay();
			const finalSyncGPU = async () => {

				// Чтение данных результатов из GPU
				const readBuffer = this.device.createBuffer({
					size: positionArray.byteLength,
					usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
				});

				const copyEncoder = this.device.createCommandEncoder();
				copyEncoder.copyBufferToBuffer(gpuPositionsBuffer, 0, readBuffer, 0, positionArray.byteLength);
				this.device.queue.submit([copyEncoder.finish()]);

				await readBuffer.mapAsync(GPUMapMode.READ);
				const resultBuffer = new Float32Array(readBuffer.getMappedRange().slice(0));
				this.socket.send(resultBuffer.buffer);
				readBuffer.unmap(); readBuffer.destroy();
				this.log('Data is ready.');

			}
			await finalSyncGPU();
		}
	}
}
export default GPUThomsonEngine
/**
 * @module GPUEngine
 * @description [WebGPU]{@link https://gpuweb.github.io/gpuweb/}. GPU Compute on the web.
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

class GPUEngine {
	constructor() {
//		const _this = this;
		this.engineStatusElement = () => { return `
	<div class="engine-status">
		<h3>ENGINE: ` + this.engineName() + `</h3>
		<div>VIDEO CARD: <select id="gpuSelect"><option value="-1">Search for video cards...</option></select></div>
		<div>STATUS: <span id="status">IDLE</span></div>
		<div>SOURCE: <span id="client">---</span></div>
		` + (this.addElements ? this.addElements() : '') + `
		<div>ELAPSE TIME: <span id="timeResult" class="timer">---</span></div>
		<div id="socket-status">
			<strong>Socket Status:</strong> <span id="stateText">Waiting for connection to server...</span><br>
		</div>
	</div>
	<div id="log"></div>
  `;
		}
		this.setState = (text, boError = false) => {
			const stateText = document.getElementById('stateText');
			stateText.innerHTML = text;
			stateText.style.color = boError ? "#ff4444" : "#00ffcc";
			if (!boError || !this.socket || this.socket.readyState != WebSocket.OPEN) return;
			const message = 'ENGINE: ' + text;
			this.socket.send(JSON.stringify({
				type: 'STATUS',
				code: 0,//error
				message: message
			}));
			if (boError) this.log('<span  style="color: red;">' + message + '</span>');
		}
	 
		let availableAdapters = [];
		this.sError = "WebGPU ERROR: ";
		this.socket;
		this.pipeline;
		this.bindGroup;
		this.config;

		this.elapsedTime = {
			start: 0,
			setStart() { this.start = performance.now(); },
			end() {
				const end = performance.now();
				const time = (end - this.start) / 1000;
				document.getElementById('timeResult').innerText = `${(time).toFixed(3)} sec.`;
			},
		}
		
		async function getSafeAdapterName(adapter, index) {
			if (!adapter) return `${index + 1}. Unknown device`;
			let name = "WebGPU Adapter";
			if (adapter.info) name = adapter.info.description || adapter.info.vendor || name;
			return `${index + 1}. ${name}`;
		}

		const findAdapters = async () => {
			availableAdapters.length = 0;
			const select = document.getElementById('gpuSelect');
			try {
				if (!navigator.gpu) {
					//for testing open this page on Google Chrome under Android
					throw new Error('WebGPU is not supported');
					return;
				}
				if (navigator.gpu.enumerateAdapters) availableAdapters = await navigator.gpu.enumerateAdapters();
				if (availableAdapters.length === 0) {

					//для устранения предупреждения
					//webGPUHUniverse.html:161 The powerPreference option is currently ignored when calling requestAdapter() on Windows. See https://crbug.com/369219127
					//из консоли:

					// 1. Проверяем, является ли операционная система Windows
					const isWindows = navigator.userAgentData
						? navigator.userAgentData.platform === "Windows"
						: navigator.userAgent.indexOf("Windows") !== -1;

					// 2. Формируем опции: на Windows оставляем объект пустым
					const adapterOptions = isWindows ? {} : { powerPreference: 'high-performance' };

					// 3. Вызываем метод без раздражающего предупреждения
					const high = await navigator.gpu.requestAdapter(adapterOptions);
	//					const high = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
					if (high) availableAdapters.push(high);
					else throw new Error('No available adapters');
				}
				select.innerHTML = '';
				for (let i = 0; i < availableAdapters.length; i++) {
					const displayName = await getSafeAdapterName(availableAdapters[i], i);
					const opt = document.createElement('option'); opt.value = i; opt.text = displayName; select.appendChild(opt);
				}
			} catch (e) {
				select.innerHTML = '<option value="-1">' + e.message + '</option>';
				this.setState(this.sError + e.message, true);
				return false;
			}
			return true;
		}
		
		let reconnectTimer = null; // Переменная для хранения таймера переподключения
		
		const connectToServer = async () => {
			// Если таймер уже запущен, очищаем его, чтобы избежать дублирования циклов
			if (reconnectTimer) {
				clearTimeout(reconnectTimer);
				reconnectTimer = null;
			}

			// Если прошлый сокет еще жив или закрывается — принудительно очищаем его
			if (this.socket) {
				this.socket.onerror = null;
				this.socket.onclose = null;
				this.socket.onopen = null;
				this.socket.onmessage = null;
				if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
					this.socket.close();
				}
				this.socket = null;
			}

			this.setState("Connecting to server...");

			this.socket = new WebSocket('ws://localhost:5000/ws?type=' + this.type());
			this.socket.binaryType = 'arraybuffer';

			// 1. Обработка ошибок (сервер недоступен)
			this.socket.onerror = (error) => {
				const failedUrl = error.target ? error.target.url : 'ws://localhost:5000/ws?type=gpu';
				this.setState("ERROR: Server unreachable at " + failedUrl, true);
				console.error("WebSocket Error:", error);
			};

			// 2. ОБРАБОТКА ЗАКРЫТИЯ СОКЕТА И ЦИКЛ ПЕРЕПОДКЛЮЧЕНИЯ
			this.socket.onclose = (event) => {
				console.log(`Close code: ${event.code}, reason: ${event.reason}, wasClean: ${event.wasClean}`);

				// КРИТИЧЕСКИЙ ЧЕК: Если код 4001, значит эта копия Engine уже запущена в другой вкладке.
				// Мы НЕ должны переподключаться, чтобы не спамить сервер.
				if (event.code === 4001) {
					this.setState(`Rejected by server: ${event.reason || "Duplicate Engine instance."}`, true);
					this.cleanupGpuResources();
					return;
				}

				// В любом другом случае (сервер упал, код 1006, плановый перезапуск и т.д.)
				let helpURL = '';
				if (event.code != 1006) {
					const rfcLink = '<a href="https://datatracker.ietf.org/doc/html/rfc6455#section-7.4.1" target="_blank">7.4.1.  Defined Status Codes</a>';
					const mozillaLink = '<a href="https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code" target="_blank">CloseEvent: code property</a>';
					helpURL = ` See RFC: ${ rfcLink }, mozilla: ${ mozillaLink }`
				}
				const errorDetail = event.reason ? `Reason: ${event.reason}` : `Code: ${event.code}${helpURL}`;
				this.setState(`Connection lost (${errorDetail}). Reconnecting in 5 seconds...`, true);

				// Сбрасываем ресурсы GPU перед новым циклом, чтобы предотвратить "adapter is consumed"
				this.cleanupGpuResources();

				// Запускаем цикл повторного соединения через 5 секунд
				reconnectTimer = setTimeout(() => {
					connectToServer();
				}, 5000);
			};

			// 3. Успешное соединение
			this.socket.onopen = (event) => {
				this.setState("Connection established. Ready for computation.");
				this.log("Connected to relay server successfully.");
			};

			// 4. Прием сообщений
			this.socket.onmessage = async (event) => {
				try {
//					this.onmessage(event);
					if (typeof event.data === 'string') {
						const data = JSON.parse(event.data);
						switch (data.type) {
							case "START_COMPUTE":
								this.config = data;
								if (this.onmessageStartCompute) this.onmessageStartCompute();
/*								
								count = config.totalSteps * config.pointsPerStep;
								document.getElementById('pointsPerStep').innerText = config.pointsPerStep;
								document.getElementById('totalStepsDisplay').innerText = config.totalSteps;
*/								
								this.elStatus.innerText = "CONFIG RECEIVED";
								const clientText = event.origin || "Localhost";
								this.elClient.innerText = clientText;
							
								const stateText = document.getElementById('stateText');
								stateText.innerHTML = 'Main page ' + clientText;
								stateText.style.color = "#00ffcc";
							
								this.log('Start compute. Source: ' + clientText);
								break;
							case "MAIN_DISCONNECTED":
								this.elStatus.innerText = "IDLE";
								if (this.mainDisconnected) this.mainDisconnected()
//								if (this.config) currentStep = this.config.totalSteps - 1;
								this.log('Main page disconnected.');
								break;
/*								
							case "PROGRESS":
								progressStep(data.currentStep);
								break;
*/								
							default: 
								if (this.dataType) this.dataType(data);
								else {
									const error = 'socket message: Invalid data.type: ' + data.type;
									this.setState(error, true);
								}
						}
					} else {
						// Двоичные данные
						this.elStatus.innerText = "Binary data received";
						if (this.onmessageBinaryData) this.onmessageBinaryData(event);
//						positionArray = new Float32Array(event.data);
						try {
							await this.runAuto();
						} catch (e) {
							this.elStatus.innerText = "ERROR";
							this.cleanupGpuResources();
							this.setState(sError + e.message, true);
						}
					}
				} catch (e) {
					this.setState(this.sError + e.message, true);
				}
			};
		}
		
		this.log = (m) => { document.getElementById('log').innerHTML += `<div>> ${m}</div>`; }
		
		this.start = async () => {
			this.elStatus = document.getElementById('status');
			this.elClient = document.getElementById('client');
			
			// Запуск первичного подключения при загрузке страницы GPU Engine
			if (await findAdapters()) {
				await connectToServer();
			}
		}
		// Безопасная функция для уничтожения буферов
		function destroyIfBuffer(buf) {
			if (!buf) return;
			try {
				if (typeof buf.destroy === 'function') {
					buf.destroy();
				}
			} catch (e) {
				// Некоторые ранние реализации могут выбрасывать — логируем, но продолжаем
				console.warn('Buffer destroy error (ignored):', e);
			}
		}
		// Удобная функция очистки всех используемых буферов/ресурсов
		this.cleanupGpuResources = () => {
//			destroyIfBuffer(velBuf);
//			destroyIfBuffer(debugBuf);
//			destroyIfBuffer(messageArray);
//			destroyIfBuffer(timeBuffer);

//			velBuf = debugBuf = messageArray = timeBuffer = null;
			this.bindGroup = this.pipeline = null;

			try {
				if (this.device) {
					if (typeof this.device.destroy === 'function') {
						this.device.destroy();
					}
				}
			} catch (e) {
				console.warn('Device destroy error:', e);
			}
			this.device = null; // Обязательно освобождаем ссылку!
		}
		this.runAuto = async () => {
			this.elapsedTime.setStart();
			//			start = performance.now();
			const idx = parseInt(document.getElementById('gpuSelect').value);
			if (idx === -1) {
				const message = "Select a video card";
				this.setState(message, true);
				return;
			}

			await this.initWebGPU(idx);

			//Сейчас использую универсальный перехватчик во время исполнения
			// 2. Извлекаем ошибку валидации
			const validationError = await this.device.popErrorScope();
			if (validationError) {
				// Если буфер превысил лимит, мы попадем сюда. Прерываем выполнение!
				recommendationThrow(validationError.message.replace(/\n/g, '<br>'));
			}
/*
			this.radiusPrev = this.config.baseRadius;
			this.radiusStep = (this.config.radiusMax - this.config.baseRadius) / (this.config.totalSteps - 1);
			document.getElementById('totalStepsDisplay').innerText = this.config.totalSteps;
*/			
			if (this.progressStepStart) this.progressStepStart();//currentStep);
		};
		const recommendationThrow = (recommendation) => {
			const reqMb = (requiredPosBufSize / (1024 * 1024)).toFixed(1);
			const maxMb = (currentDeviceLimit / (1024 * 1024)).toFixed(1);

			// Вычисляем коэффициент превышения
			//                const excessRatio = Math.ceil(requiredPosBufSize / currentDeviceLimit);

			// Формируем рекомендацию
			recommendation ||= `<br>Required buffer (${reqMb} MB) exceeds WebGPU Device limit (${maxMb} MB). `;
			const maxTotalSteps = parseInt(currentDeviceLimit / (config.pointsPerStep * 16)), maxPointsPerStep = parseInt(currentDeviceLimit / (this.config.totalSteps * 16));
			recommendation += `<br>To fix this, please decrease` +
				`<br>'classSettings.settings.object.geometry.angles.length' to ${maxPointsPerStep}` +
				`<br>or 'myThreeOptions.playerOptions.marks' to ${maxTotalSteps}.` +
				`<br>See <a href="../../jsdoc/module-HypersphericalUniverse-HypersphericalUniverse.html" target="_blank" style="color: blue;">HypersphericalUniverse</a>`;

			throw new Error(recommendation);
		}
		this.device;
		this.initWebGPU = async function (idx) {
			if (this.device) {
				this.cleanupGpuResources();
			}
			if (!await findAdapters()) return;
			const adapter = availableAdapters[idx];

			//Выделяем необходимый размер памяти
			// 1. Рассчитываем точный объем в байтах для самой тяжелой структуры (posBuf)
//			const requiredPosBufSize = this.config.totalSteps * this.config.pointsPerStep * 16;
			const requiredPosBufSize = this.requiredPosBufSize();

			// Базовые лимиты WebGPU по умолчанию
			const DEFAULT_MAX_BUFFER = 268435456;      // 256 MB
			const DEFAULT_MAX_BINDING = 134217728;     // 128 MB

			let deviceDescriptor = {};

			// 2. Если ТРЕБУЕТСЯ расширение ХОТЯ БЫ ОДНОГО из дефолтных лимитов
			if (requiredPosBufSize > DEFAULT_MAX_BUFFER || requiredPosBufSize > DEFAULT_MAX_BINDING) {
				//console.log(`Task requires ${requiredPosBufSize} bytes. Expanding WebGPU limits...`);

				// Проверяем аппаратные возможности видеокарты по обоим направлениям
				if (requiredPosBufSize > adapter.limits.maxBufferSize) {
					throw new Error(`Hardware limit exceeded! Your GPU maximum buffer size is ${(adapter.limits.maxBufferSize / (1024 * 1024)).toFixed(0)} MB, but task requires ${(requiredPosBufSize / (1024 * 1024)).toFixed(0)} MB.`);
				}
				if (requiredPosBufSize > adapter.limits.maxStorageBufferBindingSize) {
					throw new Error(`Hardware limit exceeded! Your GPU maximum storage binding size is ${(adapter.limits.maxStorageBufferBindingSize / (1024 * 1024)).toFixed(0)} MB, but task requires ${(requiredPosBufSize / (1024 * 1024)).toFixed(0)} MB.`);
				}

				// Динамически раздвигаем границы устройства под текущую задачу
				deviceDescriptor = {
					requiredLimits: {
						maxBufferSize: Math.max(requiredPosBufSize, adapter.limits.minBufferSize || DEFAULT_MAX_BUFFER),
						maxStorageBufferBindingSize: requiredPosBufSize
					}
				};
			}

			// 3. Создаем устройство с динамически рассчитанным дескриптором
			this.device = await adapter.requestDevice(deviceDescriptor);

			// НАЗНАЧАЕМ ГЛОБАЛЬНЫЙ ПЕРЕХВАТЧИК ОШИБОК СРАЗУ ПОСЛЕ СОЗДАНИЯ DEVICE
			this.device.onuncaughterror = (event) => {
				console.error("Uncaught WebGPU error:", event.error.message);

/*				
				// Принудительно останавливаем циклы в runAuto (сбрасываем счетчик шагов)
				if (window.config) {
					currentStep = this.config.totalSteps;
				}
*/
				this.deviceError();

				// Переводим текст ошибки, заменяя \n на <br> для вывода пользователю
				const formattedMessage = event.error.message.replace(/\n/g, '<br>');
				this.setState(`CRITICAL GPU ERROR:<br>${formattedMessage}`, true);

				// Освобождаем ресурсы, чтобы очистить видеокарту
				this.cleanupGpuResources();
			};

			// КРИТИЧЕСКИЙ ДОБАВОК: Перехватчик аппаратного краша / потери устройства
			this.device.lost.then((info) => {
				// ЕСЛИ УСТРОЙСТВО УНИЧТОЖЕНО ПЛАНОВО НАШИМ КОДОМ - ПРОСТО ВЫХОДИМ ИЗ ОБРАБОТЧИКА
				if (info.reason === 'destroyed') {
					console.log("WebGPU Device was intentionally destroyed for resource cleanup.");
					return;
				}

				console.warn(`WebGPU Device was lost! Reason: ${info.reason}, Message: ${info.message}`);

/*				
				// Принудительно останавливаем циклы в runAuto
				currentStep = this.config.totalSteps;
*/				
				this.deviceError();

				let userMessage = `CRITICAL ERROR: GPU Device Lost.`;
				userMessage += `<br>Reason: ${info.reason}.` +
					`<br>Message: ${info.message.replace(/\n/g, '<br>')}` +
					`<br><br><strong>Analysis:</strong> Your GPU hung up and was restarted by the OS (TDR). ` +
					`The current task size (${this.config.pointsPerStep} points) requires a quadratic O(N²) calculation path ` +
					`which is too heavy for a single compute pass.` +
					`<br>To fix this, please decrease` +
					`<br>'classSettings.settings.object.geometry.angles.length'` +
					`<br>or 'myThreeOptions.playerOptions.marks'` +
					`<br>See <a href="../../jsdoc/module-HypersphericalUniverse-HypersphericalUniverse.html" target="_blank" style="color: blue;">HypersphericalUniverse</a>`;
				if (info.message.includes("DXGI_ERROR_DEVICE_HUNG"))
					userMessage += `<br>When processing large-scale 4D math or dense point clouds in the Hypersphere Universe Engine, your GPU might take longer than 2 seconds to complete a single compute pass (dispatchWorkgroups).` +
						`<br>By default, Windows monitors the GPU response time. If a single GPU operation takes longer than 2 seconds, the operating system assumes the graphics card is frozen, forcibly restarts the display driver, and terminates the application context. In your browser console, this results in the following crash errors:` +
						`<br>DXGI_ERROR_DEVICE_HUNG (0x887A0006)` +
						`<br>CRITICAL ERROR: GPU Device Lost` +
						`<br>To solve this issue, please read <a href="https://github.com/anhr/universe/blob/main/hyperSphere/TDR_GUIDE.md" target="_blank" style="color: blue;">How to Increase or Disable the TDR (Timeout Detection and Recovery) Limit in Windows</a>`;

				// Выводим развернутый текст на страницу пользователя
				this.setState(userMessage, true);

				// Мягко очищаем локальные ссылки
				this.cleanupGpuResources();
			});
			const dynamicShaderCode = this.createShaderCode();
/*
			//for random function in WebGPU

			let random_gpu, ramdom_param, ramdom_param2;
			switch (config.RANDOM_POINTS) {
				case 0:
					ramdom_param = ``;
					ramdom_param2 = ``;
					random_gpu = `
							fn random() -> f32 { return ${config.PSEUDO_RANDOM}; }`
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
			calculateHyperbola(config.p);

			let bindingId = 0;

			// ГЕНЕРАЦИЯ ШЕЙДЕРА (МЕТАПРОГРАММИРОВАНИЕ)
			const dynamicShaderCode = `
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
*/
			this.pipeline = this.device.createComputePipeline({
				layout: 'auto', compute: { module: this.device.createShaderModule({ code: dynamicShaderCode }), entryPoint: 'main' }
			});

			// Рассчитываем необходимый размер для posBuf в байтах
			//const requiredPosBufSize = count * 16;

			// ПРОВЕРКА ЛИМИТОВ ТЕКУЩЕГО УСТРОЙСТВА (DEVICE, А НЕ ADAPTER)
			// Здесь гарантированно будет 268435456, если лимиты не расширялись
			const currentDeviceLimit = this.device.limits.maxBufferSize;

			if (requiredPosBufSize > currentDeviceLimit) {
				recommendationThrow();
			}

			//Сейчас использую универсальный перехватчик во время исполнения
			// 1. Включаем перехват ВАЛИДАЦИОННЫХ ошибок (превышение лимитов — это валидация)
			this.device.pushErrorScope('validation');
			this.createEntries();
/*
			// Буфер позиций
			gpuPositionsBuffer = device.createBuffer({
				size: positionArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
			});
			device.queue.writeBuffer(gpuPositionsBuffer, 0, positionArray);

			// Буфер скоростей
			const velocitiesArray = new Float32Array(config.pointsPerStep * itemSize);
			const gpuVelocitiesBuffer = device.createBuffer({
				size: velocitiesArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			});
			device.queue.writeBuffer(gpuVelocitiesBuffer, 0, velocitiesArray);

			// Uniform-буфер для параметров
			gpuParamsBuffer = device.createBuffer({
				size: paramsBufferSize,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			});

			// Создаем буфер для одного числа u32. Этот буфер используется для генератора случайных чисел в GPU.
			//timeBuffer = device.createBuffer({ size: 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });

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
			if (config.RANDOM_POINTS === 2) {
				// Подготовка данных LUT
				const totalPoints = config.pointsPerStep * config.totalSteps;; // Ваше текущее число точек
				// Размер буфера: 25% от количества точек, но не более 4096
				// Если totalPoints = 5000, то target = 1250. Ближайшее простое будет 1259.
				const lutSize = getNearestPrime(Math.min(totalPoints * 0.25, 4096));

				const randomData = new Float32Array(lutSize);
				for (let i = 0; i < lutSize; i++) {
					randomData[i] = Math.random();
				}

				// Создание буфера случайныз чисел на GPU
				randomBuffer = device.createBuffer({
					size: randomData.byteLength,
					usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
				});
				device.queue.writeBuffer(randomBuffer, 0, randomData);
			}
			bindingId = 0;
			const entries = [
				{ binding: bindingId++, resource: { buffer: gpuParamsBuffer } },
				{ binding: bindingId++, resource: { buffer: gpuPositionsBuffer } },
				{ binding: bindingId++, resource: { buffer: gpuVelocitiesBuffer } },
			]
			bindGroup = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: entries });
//			log("GPU Device Ready");
*/
			this.log("GPU Device Ready");
		}
		window.addEventListener('beforeunload', () => {
			this.cleanupGpuResources();
		});
	}
}
export default GPUEngine;
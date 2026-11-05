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

const sGPUEngine = 'GPUEngine';
class GPUEngine {
	constructor() {
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
				console.error(sGPUEngine + ": WebSocket Error: " + error);
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
					if (typeof event.data === 'string') {
						const data = JSON.parse(event.data);
						switch (data.type) {
							case "START_COMPUTE":
								this.config = data;
								if (this.onmessageStartCompute) this.onmessageStartCompute();
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
								this.log('Main page disconnected.');
								break;
							case "RUN":
								try {
									await this.runAuto(); // runAuto уже async
								} catch (e) {
									this.elStatus.innerText = "ERROR";
									this.cleanupGpuResources();
									this.setState(this.sError + e.message, true);
								}
							break;								
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
						const view = new DataView(event.data);
						const tag = new TextDecoder().decode(new Uint8Array(event.data, 0, 4));
						const payload = new Float32Array(event.data, 4); // offset 4 байта
						
						switch (tag) {
						  case "POSN":
						    this.positionArray = payload;
						    this.log(`Received positions: ${payload.length}`);
						    break;
						  case "RADS":
						    this.rArray = payload;
						    this.log(`Received radius array: ${payload.length}`);
						    break;
						  default:
						    this.setState(`ERROR: unknown binary tag "${tag}"`, true);
						    return;
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
			// временно отключено, чтобы проверить глобальный перехватчик
			const validationError = await this.device.popErrorScope();
			if (validationError) {
				// Если буфер превысил лимит, мы попадем сюда. Прерываем выполнение!
				recommendationThrow(validationError.message.replace(/\n/g, '<br>'));
			}
			this.gpuStart();//currentStep);
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
			const requiredPosBufSize = this.config.totalSteps * this.config.pointsPerStep * 16;

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
			this.device.addEventListener('uncapturederror', (event) => {
				console.error(sGPUEngine + ": Uncaught WebGPU error: " + event.error.message);

				this.deviceError();

				// Переводим текст ошибки, заменяя \n на <br> для вывода пользователю
				const formattedMessage = event.error.message.replace(/\n/g, '<br>');
				this.setState(`CRITICAL GPU ERROR:<br>${formattedMessage}`, true);

				// Освобождаем ресурсы, чтобы очистить видеокарту
				this.cleanupGpuResources();
			});

			/*
			// Временный тестовый код: намеренно создаём буфер, превышающий лимит устройства что бы сработал ГЛОБАЛЬНЫЙ ПЕРЕХВАТЧИК ОШИБОК
			// Еще надо временно закомментировать this.device.pushErrorScope('validation'); и const validationError = await this.device.popErrorScope();
			try {
				this.device.createBuffer({
					size: 999999999999, // невероятно большое число, вызовет ошибку валидации
					usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
				});
			} catch (e) {
				// Синхронные исключения не сработают, нужны асинхронные ошибки валидации
			}
			*/

			// КРИТИЧЕСКИЙ ДОБАВОК: Перехватчик аппаратного краша / потери устройства
			this.device.lost.then((info) => {
				// ЕСЛИ УСТРОЙСТВО УНИЧТОЖЕНО ПЛАНОВО НАШИМ КОДОМ - ПРОСТО ВЫХОДИМ ИЗ ОБРАБОТЧИКА
				if (info.reason === 'destroyed') {
					console.log("WebGPU Device was intentionally destroyed for resource cleanup.");
					return;
				}

				console.warn(`WebGPU Device was lost! Reason: ${info.reason}, Message: ${info.message}`);

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
			this.device.pushErrorScope('validation');// временно отключено, чтобы проверить глобальный перехватчик

			this.gpuBuffers = {};
			
			// Буфер позиций
			this.gpuBuffers.gpuPositionsBuffer = this.device.createBuffer({
				size: this.positionArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
			});
			this.device.queue.writeBuffer(this.gpuBuffers.gpuPositionsBuffer, 0, this.positionArray);
			
			// Uniform-буфер для параметров
			if(this.paramsBufferSize === undefined) console.error(sGPUEngine + '.initWebGPU: Invalid this.paramsBufferSize = ' + this.paramsBufferSize);
			this.gpuBuffers.gpuParamsBuffer = this.device.createBuffer({
				size: this.paramsBufferSize,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			});
			
			this.createEntries();
			this.log("GPU Device Ready");
		}
		window.addEventListener('beforeunload', () => {
			this.cleanupGpuResources();
		});
	}
}
export default GPUEngine;
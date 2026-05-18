/**
 * @module WebGPU
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

const sWebGPU = 'WebGPU';

class WebGPUHUniverse {

	constructor(/*onerror*/) {

		const serverAddress = 'ws://localhost:5000/ws?type=main';
		let socket;
/*		
		const socketStatus = {
			code: 0,//0 - start connection,
					//1 - Successful connection
					//2 - socket error
					//3 - Abnormal close connection.
					//4 - The connection was closed successfully.
			
			message: '',
			set: (codeNew, messageNew = '') => { socketStatus.code = codeNew; socketStatus.message = messageNew; }
		};
*/		
		this.compute = (computeCPU) => {
			if (!socket) {
				socket = new WebSocket(serverAddress);
				socket.binaryType = 'arraybuffer';

				// 1. Обработка ошибок (неверный адрес, отказ в соединении)
				socket.onerror = (error) => {
//					socketStatus.set(2, error.target.url + " ERROR: Server unreachable or incorrect address.");//error
					computeCPU();//Не удалось соедениться с сервером вычислений на GPU. Делаем вычисления на CPU.
				};

				// 2. Обработка закрытия соединения (сервер отключился в процессе)
				socket.onclose = (event) => {
					if (event.wasClean) {
//						socketStatus.set(4);//The connection was closed successfully.
						if (event.code === 4001) stateText.style.color = "#ff4444";  // Эта страница уже открыта
					} else {
						const rfcLink = "https://datatracker.ietf.org/doc/html/rfc6455#section-7.4.1";
						const mozillaLink = 'https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code'
						const errorDetail = event.reason ? `Reason: ${event.reason}` : `Error Code: ${event.code}`;
						const sError = event.target.url + ` The connection was closed. ${errorDetail}. See RFC: ${rfcLink}, mozilla: ${mozillaLink}`
						//				console.error(sWebGPU + ': ' + sError);

//						socketStatus.set(3, sError);//Abnormal close connection.
					}
					//			console.log(sWebGPU + `: Код закрытия: ${event.code}, причина: ${event.reason}`);
				};
				// 3. Успешное подключение
				socket.onopen = () => {
					const config = {
						type: 'START_COMPUTE',
						DEBUG_MODE: DEBUG_MODE,
						RANDOM_POINTS: RANDOM_POINTS,
						DAMPING: DAMPING,
						REPULSION_STRENGTH: REPULSION_STRENGTH,
						PSEUDO_RANDOM: PSEUDO_RANDOM,
						p: p,
						baseRadius: baseRadius,
						radiusMax: radiusMax,
						totalSteps: totalSteps,
						pointsPerStep: pointsPerStep
					};
					socket.send(JSON.stringify(config));

					const anglesItemSize = 4, initialAngles = new Float32Array(pointsPerStep * anglesItemSize);
					for (let i = 0; i < config.pointsPerStep; i++) {
						let index = i * anglesItemSize;
						initialAngles[index++] = angles[i].latitude; initialAngles[index++] = angles[i].longitude; initialAngles[index++] = angles[i].altitude;
					}
					socket.send(initialAngles.buffer);
				};
				socket.onmessage = (event) => {
					if (typeof event.data === 'string') {
						const data = JSON.parse(event.data);

						switch (data.type) {
							case "STATUS":
								const stateText = document.getElementById('stateText');
								stateText.innerText = data.message;

								// Используем 0 и 1 для управления цветом
								stateText.style.color = (data.code === 1) ? "#00ffcc" : "#ff4444";
								break;
							case "PROGRESS":
								currentStep = data.currentStep;
								radiusPrev = data.radiusPrev;
								updateDisplay();
								break;
							default: console.error(sWebGPU + ': socket message: Invalid data.type: ' + data.type);
						}
					} else if (typeof event.data === 'object') {
						//Vertices positions
						const posData = new Float32Array(event.data);
						for (let i = pointsPerStep; i < count; i++) {
							let index = i * 4;
							const itemAngles = cartesianToPolar({
								x: posData[index++],
								y: posData[index++],
								z: posData[index++],
								w: posData[index++],
							});
							const pointAngles = angles[i];
							pointAngles.latitude = itemAngles.latitude; pointAngles.longitude = itemAngles.longitude; pointAngles.altitude = itemAngles.altitude;
							//console.log('i = ' + i + ' angles: ' + JSON.stringify(pointAngles))
							const s = Math.floor(i / pointsPerStep);
							const r = baseRadius + s * radiusStep;
							setAttributes(pointAngles, r, i);
						}
						posAttr.needsUpdate = true; colorAttr.needsUpdate = true;
						document.getElementById('timeResult').innerText = `Итог (${mode}): ${((performance.now() - start) / 1000).toFixed(3)} сек.`;
					} else console.error(sWebGPU + ': socket message: Invalid event.data type: ' + (typeof event.data));
				};
				return;
			}
			switch(socket.readyState){
				case WebSocket.CLOSED://3 —  (Закрыто)
					computeCPU();//Не удалось соедениться с сервером вычислений на GPU. Делаем вычисления на CPU.
					break;
				case WebSocket.CONNECTING://0 —  (Подключение)
				case WebSocket.OPEN://1 —  (Открыто)
				case WebSocket.CLOSING://2 —  (Закрывается)
				default: console.error(sWebGPU + '.compute: Invalid socket.readyState = ' + socket.readyState);
			}
		}
/*		
		this.compute = () => {
			switch(socketStatus.code){
				case 0://start connection,
					break;
				default: console.error(sWebGPU + '.compute: Invalid socketStatus.code = ' + socketStatus.code)
			}
		}
		const socket = new WebSocket(serverAddress);
		socket.binaryType = 'arraybuffer';

		// 1. Обработка ошибок (неверный адрес, отказ в соединении)
		socket.onerror = (error) => {
			socketStatus.set(2, error.target.url + " ERROR: Server unreachable or incorrect address.");//error
		};

		// 2. Обработка закрытия соединения (сервер отключился в процессе)
		socket.onclose = (event) => {
			if (event.wasClean) {
				socketStatus.set(4);//The connection was closed successfully.
				if (event.code === 4001) stateText.style.color = "#ff4444";  // Эта страница уже открыта
			} else {
				const rfcLink = "https://datatracker.ietf.org/doc/html/rfc6455#section-7.4.1";
				const mozillaLink = 'https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code'
				const errorDetail = event.reason ? `Reason: ${event.reason}` : `Error Code: ${event.code}`;
				const sError = event.target.url + ` The connection was closed. ${errorDetail}. See RFC: ${rfcLink}, mozilla: ${mozillaLink}`
//				console.error(sError);

				socketStatus.set(3, sError);//Abnormal close connection.
			}
//			console.log(`Код закрытия: ${event.code}, причина: ${event.reason}`);
		};
		// 3. Успешное подключение
		socket.onopen = () => {
			stateText.innerText = "Связь установлена. Готов к работе.";
			stateText.style.color = "#00ffcc";

			const config = {
				type: 'START_COMPUTE',
				DEBUG_MODE: DEBUG_MODE,
				RANDOM_POINTS: RANDOM_POINTS,
				DAMPING: DAMPING,
				REPULSION_STRENGTH: REPULSION_STRENGTH,
				PSEUDO_RANDOM: PSEUDO_RANDOM,
				p: p,
				baseRadius: baseRadius,
				radiusMax: radiusMax,
				totalSteps: totalSteps,
				pointsPerStep: pointsPerStep
			};
			socket.send(JSON.stringify(config));

			const anglesItemSize = 4, initialAngles = new Float32Array(pointsPerStep * anglesItemSize);
			for (let i = 0; i < config.pointsPerStep; i++) {
				let index = i * anglesItemSize;
				initialAngles[index++] = angles[i].latitude; initialAngles[index++] = angles[i].longitude; initialAngles[index++] = angles[i].altitude;
			}
			socket.send(initialAngles.buffer);
		};
		socket.onmessage = (event) => {
			if (typeof event.data === 'string') {
				const data = JSON.parse(event.data);

				switch (data.type) {
					case "STATUS":
						const stateText = document.getElementById('stateText');
						stateText.innerText = data.message;

						// Используем 0 и 1 для управления цветом
						stateText.style.color = (data.code === 1) ? "#00ffcc" : "#ff4444";
						break;
					case "PROGRESS":
						currentStep = data.currentStep;
						radiusPrev = data.radiusPrev;
						updateDisplay();
						break;
					default: console.error('socket message: Invalid data.type: ' + data.type);
				}
			} else if (typeof event.data === 'object') {
				//Vertices positions
				const posData = new Float32Array(event.data);
				for (let i = pointsPerStep; i < count; i++) {
					let index = i * 4;
					const itemAngles = cartesianToPolar({
						x: posData[index++],
						y: posData[index++],
						z: posData[index++],
						w: posData[index++],
					});
					const pointAngles = angles[i];
					pointAngles.latitude = itemAngles.latitude; pointAngles.longitude = itemAngles.longitude; pointAngles.altitude = itemAngles.altitude;
					//console.log('i = ' + i + ' angles: ' + JSON.stringify(pointAngles))
					const s = Math.floor(i / pointsPerStep);
					const r = baseRadius + s * radiusStep;
					setAttributes(pointAngles, r, i);
				}
				posAttr.needsUpdate = true; colorAttr.needsUpdate = true;
				document.getElementById('timeResult').innerText = `Итог (${mode}): ${((performance.now() - start) / 1000).toFixed(3)} сек.`;
			} else console.error('socket message: Invalid event.data type: ' + (typeof event.data));
		};
*/		
	}
}

export default WebGPUHUniverse;

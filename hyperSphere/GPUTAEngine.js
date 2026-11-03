/**
 * @module GPUTAEngine
 * @description GPU (WebGPU) ускорение анализа распределения точек [Thomson Problem]{@link https://en.wikipedia.org/wiki/Thomson_problem} на S^3
 * на отдельной веб станице.
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
//import * as ThomsonAnalysisGPU from './TAGPU.js';

class GPUTAEngine extends GPUEngine {
	constructor (){
		super();
//		this.device = null;
		this.workgroupSize = 256;
		this.bind = null;
/*		
		this.tiledPipeline = null;
		this.initialized = false;
		this.initFailed = false;
		this.workgroupSize = 256;
*/		
		this.engineName = () => { return 'Thomson Analysis for hypersphere'; }
		this.type = () => { return 'gpuThomsonAnalysis'; }
		this.createShaderCode = () => {
//			return ThomsonAnalysisGPU.tiledShaderWGSL;
			return `
/**
 * Tiled reduction для Thomson problem.
 *
 * Воркгруппа из TILE=256 потоков обрабатывает TILE точек i в одном timeId t.
 * Проходим по всем j, используя shared memory.
 *
 * ВАЖНО: workgroupBarrier() требует uniform control flow — все потоки воркгруппы
 * должны дойти до него. Поэтому ранний 'return' убран; выравнивание делается
 * через безопасные индексы и защиту записи в конце.
 */

const TILE : u32 = 256u;

struct Params {
    N     : u32,//Количество точек для шага проигрывателя. offset 0,  size 4
    marks : u32,//Количество шагов проигрывателя. offset 4,  size 4
    //Итого занимает 8 байт. А нужно кратно paramsBufferSize = 16

    //В WGSL у структуры, используемой как uniform, размер должен быть кратен 16 байтам, а поле-структура выравнивается по 16-байтовой границе.
    //Это требование спецификации WebGPU (и в целом std140-подобное выравнивание).
    //_pad1 и _pad2 — это явный padding до 16 байт, требуемый правилами выравнивания uniform-буферов в WGSL/WebGPU.
    // Они не несут данных, но без них структура имела бы размер 8 байт
    _pad1 : f32,
    _pad2 : f32,
};

@group(0) @binding(0) var<storage, read>       position       : array<f32>; // marks*N*4
@group(0) @binding(1) var<storage, read>       rArray         : array<f32>; // marks
@group(0) @binding(2) var<storage, read_write> energyPerPoint : array<f32>; // marks*N
@group(0) @binding(3) var<storage, read_write> minD2PerPoint  : array<f32>; // marks*N
@group(0) @binding(4) var<uniform>             params         : Params;

var<workgroup> sh_jx : array<f32, TILE>;
var<workgroup> sh_jy : array<f32, TILE>;
var<workgroup> sh_jz : array<f32, TILE>;
var<workgroup> sh_jw : array<f32, TILE>;
var<workgroup> sh_r  : f32;

@compute @workgroup_size(256, 1, 1)
fn main(
    @builtin(local_invocation_id) lid : vec3<u32>,
    @builtin(workgroup_id)        wid : vec3<u32>,
) {

    let lane    = lid.x;
    let tileIdx = wid.x;
    let t       = wid.y;

    let i = tileIdx * TILE + lane;

    // НЕ делаем ранний return. Все потоки идут до конца.
    let tSafe = select(t, 0u, t >= params.marks);

    if (lane == 0u) {
        sh_r = rArray[tSafe];
    }
    workgroupBarrier();

    let r  = sh_r;
    let r2 = r * r;

    let iSafe = select(i, 0u, i >= params.N);
    let tPosSafe = select(t, 0u, t >= params.marks);

    let myBase = tPosSafe * params.N * 4u + iSafe * 4u;
    let myX = position[myBase + 0u];
    let myY = position[myBase + 1u];
    let myZ = position[myBase + 2u];
    let myW = position[myBase + 3u];

    var sumInvD : f32 = 0.0;
    var minD2   : f32 = 1e30;

    var jChunkStart : u32 = 0u;
    loop {
        if (jChunkStart >= params.N) { break; }

        let myJ = jChunkStart + lane;
        if (myJ < params.N) {
            let jBase = tPosSafe * params.N * 4u + myJ * 4u;
            sh_jx[lane] = position[jBase + 0u];
            sh_jy[lane] = position[jBase + 1u];
            sh_jz[lane] = position[jBase + 2u];
            sh_jw[lane] = position[jBase + 3u];
        } else {
            sh_jx[lane] = 1e30;
            sh_jy[lane] = 1e30;
            sh_jz[lane] = 1e30;
            sh_jw[lane] = 1e30;
        }

        workgroupBarrier();

        let chunkEnd = min(TILE, params.N - jChunkStart);
        for (var k : u32 = 0u; k < chunkEnd; k = k + 1u) {
            let j = jChunkStart + k;

            if (j == i) { continue; }

            let dx = myX - sh_jx[k];
            let dy = myY - sh_jy[k];
            let dz = myZ - sh_jz[k];
            let dw = myW - sh_jw[k];

            let d2raw = dx*dx + dy*dy + dz*dz + dw*dw;
            let d2    = d2raw / r2;
            let d     = sqrt(d2);

            sumInvD = sumInvD + select(0.0, 1.0 / d, d > 1e-12);
            if (d2 < minD2) { minD2 = d2; }
        }

        workgroupBarrier();

        jChunkStart = jChunkStart + TILE;
    }

    if (i < params.N && t < params.marks) {
        let outIdx = t * params.N + i;
        energyPerPoint[outIdx] = sumInvD;
        minD2PerPoint[outIdx]  = minD2;
    }
}
`;
		}
		this.paramsBufferSize = 16;//ThomsonAnalysisGPU.paramsBufferSize;
									//See struct Params in this.createShaderCode
		this.createEntries = () => {
//			ThomsonAnalysisGPU.createEntries(this);
			const device = this.device, gpuBuffers = this.gpuBuffers, WG = this.workgroupSize;
			gpuBuffers.rBuffer = device.createBuffer({
				size: this.rArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			});
			device.queue.writeBuffer(gpuBuffers.rBuffer, 0, this.rArray);
	
			const marks = this.config.totalSteps, N = this.config.pointsPerStep, perPointCount = marks * N;
			gpuBuffers.energyBuf = device.createBuffer({
				size: perPointCount * 4,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
			});
			
			gpuBuffers.minD2Buf = device.createBuffer({
				size: perPointCount * 4,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
			});
			{
				const buf = new ArrayBuffer(this.paramsBufferSize);
				new Uint32Array(buf, 0, 2).set([N, marks]);
				device.queue.writeBuffer(gpuBuffers.gpuParamsBuffer, 0, buf);
			}
	
			this.bind = device.createBindGroup({
				layout: this.pipeline.getBindGroupLayout(0),
				entries: [
					{ binding: 0, resource: { buffer: gpuBuffers.gpuPositionsBuffer } },
					{ binding: 1, resource: { buffer: gpuBuffers.rBuffer } },
					{ binding: 2, resource: { buffer: gpuBuffers.energyBuf } },
					{ binding: 3, resource: { buffer: gpuBuffers.minD2Buf } },
					{ binding: 4, resource: { buffer: gpuBuffers.gpuParamsBuffer } },
				],
			});
		}
		this.gpuStart = async () => {
			const device = this.device, WG = this.workgroupSize, gpuBuffers = this.gpuBuffers;
			const marks = this.config.totalSteps, N = this.config.pointsPerStep, perPointCount = marks * N;
			const encoder = device.createCommandEncoder();
			{
				const pass = encoder.beginComputePass();
				pass.setPipeline(this.pipeline);
				pass.setBindGroup(0, this.bind);
				pass.dispatchWorkgroups(Math.ceil(N / WG), marks, 1);
				pass.end();
			}
	
			const readEnergy = device.createBuffer({
				size: perPointCount * 4,
				usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
			});
			const readMinD2 = device.createBuffer({
				size: perPointCount * 4,
				usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
			});
			encoder.copyBufferToBuffer(gpuBuffers.energyBuf, 0, readEnergy, 0, perPointCount * 4);
			encoder.copyBufferToBuffer(gpuBuffers.minD2Buf, 0, readMinD2, 0, perPointCount * 4);
	
			device.queue.submit([encoder.finish()]);
	
			await readEnergy.mapAsync(GPUMapMode.READ);
			await readMinD2.mapAsync(GPUMapMode.READ);
	
			const energyArr = new Float32Array(readEnergy.getMappedRange().slice(0));
			const minD2Arr = new Float32Array(readMinD2.getMappedRange().slice(0));
	
			readEnergy.unmap();
			readMinD2.unmap();
	
			const results = new Array(marks);
	
			for (let t = 0; t < marks; t++) {
				const off = t * N;
	
				let totalEnergy = 0;
				let sumMinD = 0;
				const minDs = new Float64Array(N);
	
				for (let i = 0; i < N; i++) {
					totalEnergy += energyArr[off + i];
					const md = Math.sqrt(minD2Arr[off + i]);
					minDs[i] = md;
					sumMinD += md;
				}
				totalEnergy /= 2;
	
				const meanD = sumMinD / N;
	
				let variance = 0;
				for (let i = 0; i < N; i++) {
					const diff = minDs[i] - meanD;
					variance += diff * diff;
				}
				variance /= N;
	
				const stdDev = Math.sqrt(variance);
				const deviationPercent = meanD > 0 ? (stdDev / meanD) * 100 : 0;
	
				results[t] = { totalEnergy, meanD, variance, stdDev, deviationPercent };
			}

			Object.entries(gpuBuffers).forEach(b => b[1].destroy());
			[readEnergy, readMinD2].forEach(b => b.destroy());

			this.socket.send(JSON.stringify(results));
			this.log('Data is ready.');
		}
	}
}
export default GPUTAEngine
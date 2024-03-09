/**
 * @module Universe
 * @description Base class for n dimensional universe.
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

//import HuperSphere from '../../commonNodeJS/master/HuperSphere/huperSphere.js'

class Universe// extends HuperSphere
{

	constructor(huperSphere) {

		this.huperSphere = huperSphere;
		huperSphere.child = this;
		
	}
	arc(aAngleControls, lang, arcAngles) {

		const arcEdges = [];
		for (let i = 0; i < (aAngleControls.MAX_POINTS - 1); i++) arcEdges.push([i, i + 1]);
		aAngleControls.arc = this.huperSphere.line({
	
			cookieName: 'arc',//если не задать cookieName, то настройки дуги будут браться из настроек вселенной
			//edges: false,
			object : {
				
				name: lang.arc,
				geometry: {
	
					MAX_POINTS: aAngleControls.MAX_POINTS,
					angles: arcAngles,
					//opacity: 0.3,
					indices: {
	
						edges: arcEdges,
	
					}
					
				}
	
			},
			
		});
		
	}

}

export default Universe;


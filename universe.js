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

import HuperSphere from '../../commonNodeJS/master/HuperSphere/huperSphere.js'

class Universe extends HuperSphere
{

	/**
	 * Base class for n dimensional universe.
	 * @param {Options} options See <a href="../../../commonNodeJS/master/jsdoc/Options/Options.html" target="_blank">Options</a>.
	 * @param {object} [classSettings] <b>Universe</b> class settings.
	 * @param {object} [classSettings.intersection] Universe intersection.
	 * <pre>
	 *	For 1D universe intersector is line.
	 *	For 2D universe intersector is plane.
	 *	For 1D universe intersector is sphere.
	 * </pre>
	 * @param {float} [classSettings.intersection.position=0.0] Position of the intersector.
	 * <pre>
	 *	For 1D universe <b>position</b> is Y coordinate of the intersection line.
	 *	For 2D universe <b>position</b> is Z coordinate of the intersection plane.
	 *	For 3D universe <b>position</b> is radius of the intersection sphere.
	 * </pre>
	 * @param {number|string} [classSettings.intersection.color=0x0000FF] Color of the intersector. Example: 'red'.
	 * @param {object} [classSettings.projectParams] Parameters of project the universe onto the canvas.
	 * @param {THREE.Scene} classSettings.projectParams.scene [THREE.Scene]{@link https://threejs.org/docs/index.html?q=sce#api/en/scenes/Scene}
	 * @param {object} [classSettings.projectParams.params={}] The following parameters are available
	 * @param {object} [classSettings.projectParams.params.center={x: 0.0, y: 0.0, z: 0.0}] center of the universe
	 * @param {float} [classSettings.projectParams.params.center.x=0.0] X axis of the center
	 * @param {float} [classSettings.projectParams.params.center.y=0.0] Y axis of the center
	 * @param {float} [classSettings.projectParams.params.center.z=0.0] Y axis of the center
	 * @param {float} [classSettings.t=1.0] Universe start time. Time is the radius of the Universe.
	 * @param {boolean|object} [classSettings.edges={}] Universe edges
	 * <pre>
	 *	false - Doesn't create edges to reduce the creation time of the universe
	 * </pre>
	 * @param {boolean} [classSettings.edges.project=true] false - Doesn't project edges onto canvas
	 * @param {enum} [classSettings.edges.creationMethod=edgesCreationMethod.NearestVertice] method for creating edges. See <a href="./module-Universe-Universe.html#.edgesCreationMethod" target="_blank">edgesCreationMethod</a>
	 * @param {object} [classSettings.settings] The following settings are available
	 * @param {object} [classSettings.settings.object] Universe object.
	 * @param {String} [classSettings.settings.object.name] name of universe.
	 * @param {String|number} [classSettings.settings.object.color='lime'] color of edges or vertices.
	 * <pre>
	 * String - color name. See list of available color names in the <b>_colorKeywords</b> object in the [Color.js]{@link https://github.com/mrdoob/three.js/blob/dev/src/math/Color.js} file.
	 * number - color [Hex triplet]{@link https://en.wikipedia.org/wiki/Web_colors#Hex_triplet}. Example: 0x0000ff - blue color.
	 * <pre>
	 * @param {object} [classSettings.settings.object.geometry] Universe geometry.
	 * @param {array|object} [classSettings.settings.object.geometry.angles] n-dimensional universe vertice angles.
	 * <pre>
	 * array - array of vertex angles.
	 *	Every item of array is n-dimensional array of vertex angles.
	 *	
	 *	All the vertices of the <b><a href="module-Universe1D.html" target="_blank">Universe1D</a></b> form a circle.
	 *	For <b><a href="module-Universe1D.html" target="_blank">Universe1D</a></b> every vertice is array of one angle.
	 *		Vertex angle is the longitude of the circle of the universe in the range from <b>- π</b> to <b>π</b>.
	 *		Vertex angle is angle of rotation around of <b>Z</b> axis in 3D space.
	 *		Angle is begin from <b>X = 0, Y = 1</b>.
	 *		Every vertex is <b>[
				Math.cos(θ),//x
				Math.sin(θ)//y
			]</b> array. <b>θ</b> is vertex angle.
	 *		Example of 1D universe with three vertices is triangle:
	 *		<b>classSettings.settings.object.geometry.angles: angles: [
	 *			[],                 //vertice[0] = [0                   ,1]
	 *			[Math.PI * 2 / 3],  //vertice[1] = [0.8660254037844387	,-0.4999999999999998]
	 *			[- Math.PI * 2 / 3] //vertice[2] = [-0.8660254037844387	,-0.4999999999999998]
	 *		]</b>,
	 *		
	 *	All the vertices of the <b><a href="module-Universe2D.html" target="_blank">Universe2D</a></b> form a sphere.
	 *	For <b><a href="module-Universe2D.html" target="_blank">Universe2D</a></b> every vertice is array of two angles.
	 *		The first vertex angle is the latitude of the sphere of the universe in the range from <b>- π / 2</b> to <b>π / 2</b>.
	 *		Zero latitude is located at the equator.
	 *		
	 *		The second vertex angle is the longitude of the sphere of the universe in the range from <b>- π</b> to <b>π</b>.
	 *		The second vertex angle is angle of rotation of the cross section around of <b>Y</b> axis.
	 *		
	 *		Example of 2D universe with 4 vertices is pyramid:
	 *		<b>classSettings.settings.object.geometry.angles: [
	 *		
	 *			[ Math.PI / 2,  0                  ],//vertice[0] = [ 0                 , 1  , 0   ]
	 *			[-Math.PI / 6,  Math.PI * 2 * 0 / 3],//vertice[1] = [-0.8660254037844387,-0.5, 0   ]
	 *			[-Math.PI / 6,  Math.PI * 2 * 1 / 3],//vertice[2] = [ 0.4330127018922192,-0.5,-0.75]
	 *			[-Math.PI / 6, -Math.PI * 2 * 1 / 3,//vertice[3] = [ 0.4330127018922195,-0.5, 0.75]
	 *			
	 *		]</b>,
	 *		
	 *	All the vertices of the <a href="module-Universe3D.html" target="_blank">Universe3D</a></b> form a [hupersphere]{@link https://en.wikipedia.org/wiki/N-sphere}.
	 *	For <b><a href="module-Universe3D.html" target="_blank">Universe3D</a></b> every vertice is array of three angles.
	 *		The first vertex angle is the altitude of the hupersphere of the universe in the range from <b>0</b> to <b>π / 2</b>.
	 *		Zero altitude is located at the center of the hupersphere.
	 *		
	 *		The second vertex angle is the latitude of the hupersphere of the universe in the range from <b>- π / 2</b> to <b>π / 2</b>.
	 *		Zero latitude is located at the equator.
	 *		
	 *		The third vertex angle is the longitude of the hupersphere of the universe in the range from <b>- π</b> to <b>π</b>.
	 *		The third vertex angle is angle of rotation of the cross section around of <b>Y</b> axis.
	 *		
	 *		Example of 3D universe with 5 vertices is [pentahedroid]{@link https://en.wikipedia.org/wiki/5-cell}:
	 *		<b>classSettings.settings.object.geometry.angles: [
	 *			[],
	 *			[Math.PI / 2, Math.PI / 2],
	 *			[
	 *				  Math.PI / 2,//Altitude
	 *				- Math.PI / 6,//Latitude
	 *				  Math.PI * 0,//Longitude
	 *			],
	 *			[Math.PI / 2, - Math.PI / 6,   Math.PI * 2 * 1 / 3],
	 *			[Math.PI / 2, - Math.PI / 6, - Math.PI * 2 * 1 / 3],
			]</b>,
	 * object - see below:
	 * </pre>
	 * @param {number} [classSettings.settings.object.geometry.angles.count=3|4|5] Count of vertices with random position.
	 * <pre>
	 * Default values:
	 *	3 for <b><a href="module-Universe1D.html" target="_blank">Universe1D</a></b> - triangle.
	 *	4 for <b><a href="module-Universe2D.html" target="_blank">Universe2D</a></b> - pyramid.
	 *	5 for <b><a href="module-Universe3D.html" target="_blank">Universe3D</a></b> - [pentahedroid]{@link https://en.wikipedia.org/wiki/5-cell}.
	 * </pre>
	 * @param {array} [classSettings.settings.object.geometry.opacity] array of opacities of each vertice. Each item of array is float value in the range of 0.0 - 1.0 indicating how transparent the material is. A value of 0.0 indicates fully transparent, 1.0 is fully opaque.
	 * @param {object} [classSettings.settings.object.geometry.indices] Array of <b>indices</b> of edges of universe.
	 * @param {array|object} [classSettings.settings.object.geometry.indices.edges] Universe edges.
	 * <pre>
	 * array - array of edges.
	 *	Every edge is array of indices of vertices from
	 *	<b>classSettings.settings.object.geometry.position</b>
	 *	Example: <b>[[0,1], [1,2], [2,0]],//triangle</b>
	 * object - see below:
	 * </pre>
	 * @param {number} [classSettings.settings.object.geometry.indices.edges.count=3] edges count.
	 * @param {boolean|object} [classSettings.debug=false] Debug mode.
	 * <pre>
	 *	true - Diagnoses your code and display detected errors to console.
	 *	object - Diagnoses your code and display detected errors to console.
	 * </pre>
	 * @param {boolean|Array} [classSettings.debug.probabilityDensity=[]] Probability density of distribution of vertices over the surface of the universe.
	 * <pre>
	 *	false - do not calculate probability density.
	 *	[] - calculate probability density.
	 * </pre>
	 * @param {boolean} [classSettings.debug.testVertice=true]
	 * <pre>
	 * Test of converting of the vertice coordinates from Cartesian Coordinates to Polar Coordinates
	 * and Polar Coordinates to Cartesian Coordinates
	 * and display detected errors to console.
	 * </pre>
	 * @param {boolean} [classSettings.debug.middleVertice=true] Log middle vertice.
	 * @param {function} [classSettings.continue] Callback function that called after universe edges was created.
	 * @param {boolean} [classSettings.boRemove] false - do not delete the previous universe while projecting a new universe on scene.
	 * @param {boolean} [classSettings.boGui] false - do not include universe GUI.
	 **/
	constructor(options, classSettings={}) {

		super(options, classSettings);
		
	}

}

export default Universe;


/**
 * @module ND
 * @description N-dimensional graphics
 * @author [Andrej Hristoliubov]{@link https://github.com/anhr}
 *
 * @copyright 2011 Data Arts Team, Google Creative Lab
 *
 * @license under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * @see [4D Geometry Viewer]{@link https://github.com/anhr/humke-4d-geometry}
 * @see [Tesseract]{@link https://ciechanow.ski/tesseract/}
 * @see [4D-Shapes]{@link https://artemonigiri.github.io/4D-Shapes/}
 * @see [The Regular Polychora]{@link https://www.qfbox.info/4d/regular}
*/

/*
dimention	geometry	points	edges	faces	bodyes	4D objects
1			line		2		0
2			triangle	3		3		1
3			tetrahedron	4		6		4		1
4			pentatope	5		10		10		5		1
*/

class ND {

	/**
	 * N-dimensional graphics.
	 * Creates an N-dimensional graphic object,
	 * checks for a collision between an n-dimensional plane and an n-dimensional graphics object and returns the (n-1)-dimensional intersection geometry if a collision was occurs.
	 * @param {number} n space dimension of the graphical object.
	 * @param {object} [settings={}] The following settings are available
	 * @param {object} [settings.object] geometry, position and rotation of the n-dimensional graphical object.
	 * @param {String} [settings.object.name] name of n-dimensional graphical object.
	 * @param {number|String|object} [settings.object.color='lime'] color of N-dimensional graphic object.
	 * <pre>
	 * number - [Hex triplet]{@link https://en.wikipedia.org/wiki/Web_colors#Hex_triplet} color. Example: 0xffffff - white color
	 * String - color name. See list of available color names in the <b>_colorKeywords</b> object in the [Color.js]{@link https://github.com/mrdoob/three.js/blob/dev/src/math/Color.js} file.
	 * object - Sets the color separately for each vertice.
	 *	You can choose one way for setting of the vertice color from two available:
	 *	
	 *	1. Set the fourth <b>w</b> coordinate of each vertex in a range from
	 *		<b>settings.options.scales.w.min</b> to
	 *		<b>settings.options.scales.w.max</b>
	 *		
	 *		<b>w</b> coordinate is index of palette color. See <a href="../../colorpicker/jsdoc/module-ColorPicker-ColorPicker.html#toColor" target="_blank">toColor</a> method from <b>ColorPicker</b> class.
	 *		Example:
	 *		settings.object.geometry.position: [
	 *			//pyramid
	 *			[0,-0.9428090415820634,0.33333333333333326, 1],
	 *			[0.8164965662730563,0.4714045207910317,0.33333333333333326, 0.5],
	 *			[-0.8164965662730563,0.4714045207910317,0.33333333333333326, 0],
	 *			[7.32733549761259e-9,4.230438555019589e-9,-1.0, -1.0],
	 *		],
	 *	
	 *	2. Set a <b>settings.object.geometry.colors</b> array. 
	 * Have effect only if <b>settings.object.geometry.colors</b> are not defined.
	 * </pre>
	 * @param {boolean|object} [settings.object.faces] true or object - display the n-dimensional graphical object faces instead of edges.
	 * @param {float} [settings.object.faces.opacity=0.5] color Float in the range of 0.0 - 1.0 indicating how transparent the material is.
	 * A value of 0.0 indicates fully transparent, 1.0 is fully opaque.
	 * If the <b>transparent</b> property is not set to true, the material will remain fully opaque and this value will only affect its color.
	 * See [Material.opacity]{@link https://threejs.org/docs/#api/en/materials/Material.opacity}.
	 * @param {boolean} [settings.object.faces.transparent= true] Defines whether this material is transparent.
	 * This has an effect on rendering as transparent objects need special treatment and are rendered after non-transparent objects.
	 * When set to true, the extent to which the material is transparent is controlled by setting its <b>opacity</b> property.
	 * See [Material.transparent]{@link https://threejs.org/docs/#api/en/materials/Material.transparent}.
	 * @param {Array|Object} [settings.object.geometry] Array of vertices and indices of the n-dimensional graphical object.
	 * <pre>
	 * Every item of array is n-dimensional vector of vertice of object.
	 * Or Object. See object's keys below.
	 * </pre>
	 * @param {Array} [settings.object.geometry.position] Array of vertices of the n-dimensional graphical object.
	 * <pre>
	 * Every item of array is n-dimensional vector of vertice of object.
	 * For example, if you want to create a tetrahedron, then you need to create an array of 4 vertices.
	 * <b>settings.object.geometry.position: [
	 * 	[-0.6, 0.1, 0.8],//0
	 * 	[0.7, 0.5, 0.9],//1
	 * 	[0, -0.4, 0.8],//2
	 * 	[0, 0, -0.6]//3
	 * ]</b>,
	 * </pre>
	 * @param {Array} [settings.object.geometry.colors] Array of colors for the each vertex.
	 * <pre>
	 * Every vertex is associated with 3 values of the <b>colors</b> array.
	 * Each value of the <b>colors</b> array is red or green or blue color of the particular vertex in range from 0 to 1.
	 * 
	 * 0 is no color.
	 * 1 is full color.
	 * 
	 * For example:
	 * settings.object.geometry.colors: [
	 * 	1, 0, 0,//red color of the <b>position[0]</b> vertex.
	 * 	0, 1, 0,//green color of the <b>position[1]</b> vertex.
	 * 	0, 0, 1,//blue color of the <b>position[2]</b> vertex.
	 * 	1, 1, 1,//white color of the <b>position[3]</b> vertex.
	 * ],
	 * Have effect only if <b>settings.object.geometry.position</b> points are not <b>THREE.Vector4</b> type.
	 * See <b>arrayFuncs</b> parametr of the <a href="../../player/jsdoc/module-Player-Player.getPoints.html" target="_blank">Player.getPoints(...)</a> for details.
	 * </pre>
	 * @param {array} [settings.object.geometry.opacity] array of opacities for the each vertex. Each item of array is float value in the range of 0.0 - 1.0 indicating how transparent the material is. A value of 0.0 indicates fully transparent, 1.0 is fully opaque.
	 * @param {Array} [settings.object.geometry.boRememberPosition=true] true - Remember vertex positions for higher performance. As result, new vertex positions have no effect.
	 * @param {Array} [settings.object.geometry.indices] Array of <b>indices</b> of vertices of the n-dimensional graphical object.
	 * Allows for vertices to be re-used across multiple segments.
	 * <pre>
	 * <b>Indices</b> is divided to segments:
	 * 
	 * <b>indices[0]</b> is edges. Every edge is two indexes of the edge's vertices. Used in 1D objects and higher.
	 * <b>indices[1]</b> is faces. Every face is three indexes of the edges from <b>indices[0]</b>. Used in 3D objects and higher.
	 * <b>indices[2]</b> is bodies. Every bodie is four face indexes from <b>indices[1]</b>. Used in 4D objects and higher.
	 * For example:
	 * 
	 * <b>n</b> = 1 line.
	 * <b>settings.object.geometry.position</b> = [
	 *	[-0.5, 1],//0
	 *	[0.5]//1
	 *]
	 * <b>settings.object.geometry.indices</b> = [
	 *	[
	 *		0,//index of the settings.object.geometry.position[0] = [-0.5, 1]
	 *		1,//index of the settings.object.geometry.position[1] = [0.5]
	 *	]//0
	 *]//0
	 *
	 * <b>n</b> = 2 triangle
	 * <b>settings.object.geometry.position</b> = [
	 *	[-0.7, 0.2],//0
	 *	[0.8, 0.6],//1
	 *	[0.1, -0.5]//2
	 *],
	 * //edges
	 * <b>settings.object.geometry.indices[0]</b> = [
	 *	[0, 1],//0 index of the settings.object.geometry.positions [-0.7, 0.2] and [0.8, 0.6]
	 *	[0, 2],//1 index of the settings.object.geometry.positions [-0.7, 0.2] and [0.1, -0.5]
	 *	[1, 2] //2 index of the settings.object.geometry.positions [0.8, 0.6] and [0.1, -0.5]
	 *]
	 *
	 * <b>n</b> = 3 tetrahedron.
	 * <b>settings.object.geometry.position</b> = [
	 *	[0.8, -0.6, 0.1],//0
	 * 	[0.9, 0.7, 0.5],//1
	 * 	[0.8, 0, -0.4],//2
	 * 	[-0.6, 0.1, 0.1]//3
	 * ],
	 * //edges
	 * <b>settings.object.geometry.indices[0]</b> = [
	 *	[0, 1]//0 index of the settings.object.geometry.positions [0.8, -0.6, 0.1] and [0.9, 0.7, 0.5]
	 *	[0, 2]//1 index of the settings.object.geometry.positions [0.8, -0.6, 0.1] and [0.8, 0, -0.4]
	 *	[0, 3]//2 index of the settings.object.geometry.positions [0.8, -0.6, 0.1] and [-0.6, 0.1, 0.1]
	 *	[1, 2]//3 index of the settings.object.geometry.positions [0.9, 0.7, 0.5] and [0.8, 0, -0.4]
	 *	[1, 3]//4 index of the settings.object.geometry.positions [0.9, 0.7, 0.5] and [-0.6, 0.1, 0.1]
	 *	[2, 3]//5 index of the settings.object.geometry.positions [0.8, 0, -0.4] and [-0.6, 0.1, 0.1]
	 *]
	 * //faces. Indices of the edges <b>settings.object.geometry.indices[0]</b>
	 * <b>settings.object.geometry.indices[1]</b> = [
	 *	[0, 1, 3]//tetrahedron's face 0
	 *	[0, 2, 4]//tetrahedron's face 1
	 *	[3, 4, 5]//tetrahedron's face 2
	 *	[1, 2, 5]//tetrahedron's face 3
	 *]
	 *
	 * <b>n</b> = 4 pentachoron [5-cell]{@link https://en.wikipedia.org/wiki/5-cell}.
	 * <b>settings.object.geometry.position</b> = [
	 *	[0.8, -0.6, 0.1, -0.85],//0
	 *	[0.9, 0.7, 0.5, -0.55],//1
	 *	[0.8, 0, -0.4, 0],//2
	 *	[-0.6, 0.1, -0.3, 0.55],//3
	 *	[-0.5, 0.2, 0.3, 0.85],//4
	 * ],
	 * //edges
	 * <b>settings.object.geometry.indices[0]</b> = [
	 *	[0, 1]//0 index of the settings.object.geometry.positions [0.8, -0.6, 0.1, -0.85] and [0.9, 0.7, 0.5, -0.55]
	 *	[0, 2]//1 index of the settings.object.geometry.positions [0.8, -0.6, 0.1, -0.85] and [0.8, 0, -0.4, 0]
	 *	[0, 3]//2 index of the settings.object.geometry.positions [0.8, -0.6, 0.1, -0.85] and [-0.6, 0.1, -0.3, 0.55]
	 *	[0, 4]//3 index of the settings.object.geometry.positions [0.8, -0.6, 0.1, -0.85] and [-0.5, 0.2, 0.3, 0.85]
	 *	[1, 2]//4 index of the settings.object.geometry.positions [0.9, 0.7, 0.5, -0.55] and [0.8, 0, -0.4, 0]
	 *	[1, 3]//5 index of the settings.object.geometry.positions [0.9, 0.7, 0.5, -0.55] and [-0.6, 0.1, -0.3, 0.55]
	 *	[1, 4]//6 index of the settings.object.geometry.positions [0.9, 0.7, 0.5, -0.55] and [-0.5, 0.2, 0.3, 0.85]
	 *	[2, 3]//7 index of the settings.object.geometry.positions [0.8, 0, -0.4, 0] and [-0.6, 0.1, -0.3, 0.55]
	 *	[2, 4]//8 index of the settings.object.geometry.positions [0.8, 0, -0.4, 0] and [-0.5, 0.2, 0.3, 0.85]
	 *	[3, 4]//9 index of the settings.object.geometry.positions [-0.6, 0.1, 0.1, 0.55] and [-0.5, 0.2, 0.3, 0.85]
	 *]
	 * //faces. Indices of the edges <b>settings.object.geometry.indices[0]</b>
	 * <b>settings.object.geometry.indices[1]</b> = [
	 *	[7, 8, 9],//0 no 0, 1 vertices
	 *	[5, 6, 9],//1 no 0, 2 vertices
	 *	[4, 6, 8],//2 no 0, 3 vertices
	 *	[4, 5, 7],//3 no 0, 4 vertices
	 *	[2, 3, 9],//4 no 1, 2 vertices
	 *	[1, 3, 8],//5 no 1, 3 vertices
	 *	[1, 2, 7],//6 no 1, 4 vertices
	 *	[0, 3, 6],//7 no 2, 3 vertices
	 *	[0, 2, 5],//8 no 2, 4 vertices
	 *	[0, 1, 4],//9 no 3, 4 vertices
	 *]
	 * //bodies. Indices of the faces <b>settings.object.geometry.indices[1]</b>
	 * <b>settings.object.geometry.indices[2]</b> = [
	 * [2, 1, 3, 0],//0 no 0 vertice
	 * [5, 6, 4, 0],//1 no 1 vertice
	 * [8, 7, 1, 4],//2 no 2 vertice
	 * [9, 7, 2, 5],//3 no 3 vertice
	 * [9, 8, 3, 6],//4 no 4 vertice
	 *]
	 * </pre>
	 * @param {Array|number} [settings.object.position] Array - position of the n-dimensional graphical object in n-dimensional coordinates.
	 * <pre>
	 * number - position of the 0 coordinate of the n-dimensional graphical object.
	 * <pre>
	 * @param {Array|number} [settings.object.rotation] Array - rotation in radians of the n-dimensional graphical object in n-dimensional coordinates.
	 * <table>
		 <tr><td><b>n</b> space dimension</td><td>Array index</td><td>Axis of rotation</td><td>Axis type</td><td>Note</td></tr>
		 <tr><td>0</td><td></td><td></td><td></td><td>no rotation</td></tr>
		 <tr><td>1</td><td></td><td></td><td></td><td>no rotation</td></tr>
		 <tr><td>2</td><td>0</td><td></td><td></td><td>No effect for 2-dimensional space</td></tr>
		 <tr><td></td><td>1</td><td></td><td></td><td>No effect for 2-dimensional space</td></tr>
		 <tr><td></td><td>2</td><td>2(z)</td><td>point</td><td></td></tr>
		 <tr><td>3</td><td>0</td><td>0(x)</td><td>line</td><td></td></tr>
		 <tr><td></td><td>1</td><td>1(y)</td><td></td><td></td></tr>
		 <tr><td></td><td>2</td><td>2(z)</td><td></td><td></td></tr>
		 <tr><td>4</td><td>0</td><td>0, 1(xy)</td><td>plane</td><td></td></tr>
		 <tr><td></td><td>1</td><td>0, 2(xz)</td><td></td><td></td></tr>
		 <tr><td></td><td>2</td><td>0, 3(xw)</td><td></td><td></td></tr>
		 <tr><td></td><td>3</td><td>1, 2(yz)</td><td></td><td></td></tr>
		 <tr><td></td><td>4</td><td>1, 3(yw)</td><td></td><td></td></tr>
		 <tr><td></td><td>5</td><td>2, 3(zw)</td><td></td><td></td></tr>
		 <tr><td>5</td><td>0</td><td>0, 1, 2(xyz)</td><td>3D space</td><td></td></tr>
		 <tr><td></td><td>1</td><td>0, 1, 3(xyw)</td><td></td><td></td></tr>
		 <tr><td></td><td>2</td><td>0, 1, 4(xy4)</td><td></td><td></td></tr>
		 <tr><td></td><td>3</td><td>0, 2, 3(xzw)</td><td></td><td></td></tr>
		 <tr><td></td><td>4</td><td>0, 2, 4(xz4)</td><td></td><td></td></tr>
		 <tr><td></td><td>5</td><td>0, 3, 4(xw4)</td><td></td><td></td></tr>
		 <tr><td></td><td>6</td><td>1, 2, 3(yzw)</td><td></td><td></td></tr>
		 <tr><td></td><td>7</td><td>1, 2, 4(yz4)</td><td></td><td></td></tr>
		 <tr><td></td><td>8</td><td>1, 3, 4(yw4)</td><td></td><td></td></tr>
		 <tr><td></td><td>9</td><td>2, 3, 4(zw4)</td><td></td><td></td></tr>
		</table>
	 * <pre>
	 * number - rotation in radians around axis 0 or rotation around axis 2 for 2D objects i.e. space dimension n = 2.
	 * See [Can rotations in 4D be given an explicit matrix form?]{@link https://math.stackexchange.com/questions/1402362/can-rotations-in-4d-be-given-an-explicit-matrix-form}, [Rotation matrix]{@link https://en.wikipedia.org/wiki/Rotation_matrix}.
	 * Examples:
	 * <b>n = 4</b>, <b>rotation = [Math.PI / 5, 1, 2, 3, 4, 5]</b>
	 * rotation around 0, 1(xy) plane is Math.PI / 5 radians.
	 * rotation around 0, 2(xz) plane is 1 radian.
	 * etc.
	 *
	 * <b>n = 4</b>, <b>rotation = Math.PI / 5</b>
	 * rotation around 0, 1(xy) plane is Math.PI / 5 radians.
	 *
	 * <b>n = 2</b>, <b>rotation = [0, 0, Math.PI / 4]</b>
	 * rotation around 2(z) point is Math.PI / 4 radians.
	 *
	 * <b>n = 2</b>, <b>rotation = Math.PI / 5</b>
	 * rotation around 2(z) point is Math.PI / 5 radians.
	 * <pre>
	 * @param {Array} [settings.object.geometry.iAxes] array of indices of the axes.
	 * For example if <b>iAxes</b> is [1,2], then axis 1 interpret as axis 0 and axis 2 interpret as axis 1.
	 * As result, you can rotate axes around another axis to 90 degrees.
	 * In example above you have rotated axis 1 and 2 around axis 0 to 90 degrees.
	 * @param {Boolean} [settings.plane=false] true - create <b>vectorPlane</b>. See <b>settings.vectorPlane</b> below.
	 * @param {Array} [settings.vectorPlane] n-dimensional position of the panel
	 * intersecting with the <b>settings.object.geometry</b> n-dimensional graphical object. Available only if <b>settings.plane</b> is true.
	 * @param {THREE.Scene} [settings.scene] [THREE.Scene]{@link https://threejs.org/docs/index.html?q=sce#api/en/scenes/Scene}.
	 * Define <b>scene</b> if you want visualise n-dimensional plane and n-dimensional object to 3-D space of the <b>scene</b>.
	 * @param {Options} [settings.options] See <a href="../../jsdoc/Options/Options.html" target="_blank">Options</a>.
	 * Uses only if <b>scene</b> is defined.
	 * @param {Event} [settings.onIntersection] Plane and object intersection event.
	 * The <b>onIntersection</b> function parameter is the (n-1)-dimensional geometry of the intersection if a collision occurred, or undefined if a collision did not occur.
	 * @see [4D Geometry Viewer]{@link https://github.com/anhr/humke-4d-geometry}
	 * @see [Tesseract]{@link https://ciechanow.ski/tesseract/}
	 * @see [4D-Shapes]{@link https://artemonigiri.github.io/4D-Shapes/}
	 * @see [The Regular Polychora]{@link https://www.qfbox.info/4d/regular}
	 */
	constructor( n, settings ) {


	}
	get defaultColor() { return 'lime'; }

}
export default ND;


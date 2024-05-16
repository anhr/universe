/**
 * @module SphericalUniverse
 * @description Spherical universe.
 * All the vertices of the SphericalUniverse form a sphere.
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

import fs from 'fs';
import path from 'path';
import resolve from 'rollup-plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';

const banner = fs.readFileSync(path.join(__dirname, 'licenseBanner.txt'));
const sBuild = 'build';
fs.mkdirSync( path.join( __dirname, sBuild ), { recursive: true, force: true } );

function callback(err) {
//    if (err) throw err;
    if (err) console.error(err);
    //    console.log( 'colorpicker.css was copied' );
}
const sCommonNodeJS = '..\\..\\..\\commonNodeJS\\master';
fs.copyFile(path.join(__dirname, sCommonNodeJS + '\\colorpicker\\colorpicker.css'), sBuild + '\\colorpicker.css', callback);

const sGetShaderMaterialPoints = '\\getShaderMaterialPoints', sGetShaderMaterialPointsDest = sBuild + sGetShaderMaterialPoints;
fs.mkdirSync(path.join(__dirname, sGetShaderMaterialPointsDest), { recursive: true, force: true });
const sGetShaderMaterialPointsSrc = sCommonNodeJS + sGetShaderMaterialPoints + sGetShaderMaterialPoints;
fs.copyFile(path.join(__dirname, sGetShaderMaterialPointsSrc + '\\vertex.c'), sGetShaderMaterialPointsDest + '\\vertex.c', callback);
fs.copyFile(path.join(__dirname, sGetShaderMaterialPointsSrc + '\\fragment.c'), sGetShaderMaterialPointsDest + '\\fragment.c', callback);

const textures = 'textures', sPointPng = 'point.png';
fs.mkdirSync(path.join(__dirname, sBuild + '\\' + textures), { recursive: true, force: true });
fs.copyFile(path.join(__dirname, sCommonNodeJS + sGetShaderMaterialPoints + '\\' + textures + '\\' + sPointPng), sBuild + '\\' + textures + '\\' + sPointPng, callback);
export default {

    input: 'sphericalUniverse.js',

  output: [{
    // TODO: Remove default exports, and this line, in v0.8.0.
    exports: 'named',
      file: './build/sphericalUniverse.js',
      format: 'es',
      name: 'SphericalUniverse',
    sourcemap: true,
    banner: banner
  }, {
      file: './build/sphericalUniverse.module.js',
    format: 'es',
    sourcemap: true,
    banner: banner
  }],
  watch: {
    include: 'src/**'
  },
  plugins: [
      resolve(),
    cleanup()
  ]
};

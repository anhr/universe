/**
 * @module CircularUniverse
 * @description All vertices of the Universe form a circle.
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
/*
const styles = 'styles';
//fs.rmdirSync( path.join( __dirname, styles ), { recursive: true, force: true } );
fs.mkdirSync(path.join(__dirname, styles), { recursive: true, force: true });
const DropdownMenu = 'DropdownMenu';
fs.copyFile(path.join(__dirname, '..\\' + DropdownMenu + '\\' + styles + '\\menu.css'), styles + '\\menu.css', callback);
fs.copyFile(path.join(__dirname, '..\\' + DropdownMenu + '\\' + styles + '\\gui.css'), styles + '\\gui.css', callback);
const Decorations = 'Decorations';
fs.mkdirSync(path.join(__dirname, styles + '\\' + Decorations), { recursive: true, force: true });
fs.copyFile(path.join(__dirname, '..\\' + DropdownMenu + '\\' + styles + '\\' + Decorations + '\\transparent.css'), styles + '\\' + Decorations + '\\transparent.css', callback);
fs.copyFile(path.join(__dirname, '..\\' + DropdownMenu + '\\' + styles + '\\' + Decorations + '\\gradient.css'), styles + '\\' + Decorations + '\\gradient.css', callback);
fs.mkdirSync(path.join(__dirname, DropdownMenu), { recursive: true, force: true });
fs.mkdirSync(path.join(__dirname, DropdownMenu + '\\' + styles), { recursive: true, force: true });
fs.copyFile(path.join(__dirname, '..\\' + DropdownMenu + '\\' + styles + '\\gui.css'), DropdownMenu + '\\' + styles + '\\gui.css', callback);
fs.copyFile(path.join(__dirname, '..\\' + DropdownMenu + '\\' + styles + '\\menu.css'), DropdownMenu + '\\' + styles + '\\menu.css', callback);
fs.mkdirSync(path.join(__dirname, 'build\\frustumPoints'), { recursive: true, force: true });
fs.copyFile(path.join(__dirname, '..\\frustumPoints\\frustumPoints\\vertex.c'), 'build\\frustumPoints\\vertex.c', callback);
fs.copyFile(path.join(__dirname, '..\\frustumPoints\\frustumPoints\\fragment.c'), 'build\\frustumPoints\\fragment.c', callback);
*/
export default {

    input: 'circularUniverse.js',

  output: [{
    // TODO: Remove default exports, and this line, in v0.8.0.
    exports: 'named',
      file: './build/circularUniverse.js',
    format: 'umd',
      name: 'CircularUniverse',
    sourcemap: true,
    banner: banner
  }, {
      file: './build/circularUniverse.module.js',
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

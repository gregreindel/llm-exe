import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';


export default {
  input: 'dist/index.js',
  output: {
    file: 'build/bundle.js', // the output bundled file
    format: 'cjs', // commonjs format, you can choose other formats like 'esm', 'iife', etc.
    sourcemap: false, // Include sourcemap,
    inlineDynamicImports: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    // typescript({
    //   tsconfig: './tsconfig.json',
    //   declaration: false, // Prevent Rollup TypeScript plugin from emitting declaration files
    //   outDir: null, // Override outDir setting
    //  }),
    json(), // include the JSON plugin
    terser(), // minify the bundle
    nodeResolve({
      browser: true,
    }),
    replace({
      values:{
        'process.browser': true,
      },
    }),
  ],
};
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';
import { typescriptPaths } from 'rollup-plugin-typescript-paths';

import pkg from './package.json' with { type: 'json' };


const external = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies)];

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.mjs',
        format: 'es',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
    ],
    plugins: [
      // Resolve TypeScript path aliases first - must be before typescript plugin
      typescriptPaths({
        tsConfigPath: './tsconfig.json',
        preserveExtensions: true,
      }),
      // Resolve node_modules
      resolve({
        preferBuiltins: true,
        browser: true,
      }),
      // Handle CommonJS modules
      commonjs(),
      // Compile TypeScript
      typescript({
        tsconfig: './tsconfig.json',
        // Declarations are bundled by the dts config below
        declaration: false,
        declarationMap: false,
        incremental: false,
        sourceMap: true,
        outputToFilesystem: false,
        include: ['src/**/*.ts'],
        // Override module to ES for ESM output (Rollup will handle the format)
        compilerOptions: {
          module: 'ESNext',
          moduleResolution: 'bundler',
        },
      }),
    ],
    external,
  },
  {
    // Bundle declarations into a single file, resolving TypeScript path aliases
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [
      dts({
        tsconfig: './tsconfig.json',
        compilerOptions: {
          incremental: false,
        },
      }),
    ],
    external,
  },
];

import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { typescriptPaths } from 'rollup-plugin-typescript-paths';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: 'dist/frenfit-sdk.umd.cjs',
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
      browser: false,
    }),
    // Handle CommonJS modules
    commonjs(),
    // Compile TypeScript
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false, // We'll generate declarations separately with tsc
      declarationMap: false,
      sourceMap: true,
      exclude: ['**/*.test.ts', '**/*.spec.ts', 'test/**/*'],
      // Override module to ES for ESM output (Rollup will handle the format)
      compilerOptions: {
        module: 'ESNext',
        moduleResolution: 'bundler',
      },
    }),
  ],
  external: [
    // Mark dependencies as external so they're not bundled
    'entities',
    'node-localstorage',
    'store2',
  ],
};


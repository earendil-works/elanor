import swc from '@rollup/plugin-swc';
import autoprefixer from 'autoprefixer';
import {defineConfig} from 'rollup';
import postcss from 'rollup-plugin-postcss';

import manifest from './package.json' with {type: 'json'};

const external = Object.keys({...manifest.dependencies, ...manifest.peerDependencies});

export default defineConfig({
  input: 'src/index.ts',
  external: (id) => external.some((name) => id === name || id.startsWith(`${name}/`)),
  output: {
    dir: 'dist',
    format: 'es',
    preserveModules: true,
    preserveModulesRoot: 'src',
    entryFileNames: '[name].js',
  },
  plugins: [
    swc({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      swc: {
        jsc: {
          target: 'es2022',
          transform: {react: {runtime: 'automatic'}},
        },
      },
    }),
    postcss({
      config: false,
      modules: true,
      plugins: [
        // This package's `browserslist`, explicitly, so environment or stray configs can't change it.
        autoprefixer({overrideBrowserslist: manifest.browserslist}),
      ],
      extract: 'elanor.min.css',
      inject: false,
      minimize: true,
      sourceMap: false,
    }),
  ],
});

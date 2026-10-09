import {defineConfig} from 'vite';

import manifest from './package.json' with {type: 'json'};

const external = Object.keys({...manifest.dependencies, ...manifest.peerDependencies});

export default defineConfig({
  css: {transformer: 'lightningcss'},
  build: {
    target: 'es2022',
    minify: false,
    cssMinify: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      cssFileName: 'elanor.min',
    },
    rolldownOptions: {
      external: (id) => external.some((name) => id === name || id.startsWith(`${name}/`)),
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
});

import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';

import {build} from 'esbuild';

const result = await build({
  entryPoints: ['consumer.tsx', 'styles.css'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  platform: 'browser',
  minify: true,
  metafile: true,
  loader: {'.woff2': 'file'},
});
assert.ok(Object.keys(result.metafile.outputs).some((path) => path.endsWith('.woff2')));

for (const entry of ['mallos-serif', 'commit-mono', 'departure-mono']) {
  const url = import.meta.resolve(`@earendil-works/elanor-fonts/${entry}.css`);
  for (const [, path] of readFileSync(new URL(url), 'utf8').matchAll(
    /url\(['"]?([^'")]+)['"]?\)/g,
  )) {
    assert.ok(existsSync(new URL(path, url)), `Missing font: ${path}`);
  }
}
for (const brand of ['radius', 'pi', 'earendil', 'lefos', 'elanor']) {
  const url = import.meta.resolve(`@earendil-works/design-tokens/${brand}.catalog.json`);
  assert.equal(JSON.parse(readFileSync(new URL(url), 'utf8')).schemaVersion, 2);
}

for (const name of ['elanor-icons-react', 'elanor-icons-boiled-react']) {
  for (const subpath of ['', '/search']) {
    const icons = await build({
      stdin: {
        contents: `export {SearchIcon} from '@earendil-works/${name}${subpath}';`,
        resolveDir: process.cwd(),
      },
      bundle: true,
      write: false,
      format: 'esm',
      external: ['react', 'react/*'],
      metafile: true,
      minify: true,
    });
    const retained = Object.values(icons.metafile.outputs).flatMap(({inputs}) =>
      Object.entries(inputs)
        .filter(
          ([path, {bytesInOutput}]) =>
            path.includes(`/${name}/dist/`) &&
            bytesInOutput > 0 &&
            !/\/(index|create-icon)\.js$/.test(path),
        )
        .map(([path]) => path),
    );
    assert.equal(retained.length, 1);
    assert.ok(retained[0].endsWith('/search.js'));
  }
}
// Bundle dependencies to test tree-shaking, not externalization.
const behaviors = await build({
  stdin: {
    contents: `export {
      enhance, createCopyButton, createLinkedHeading, createCollapsible,
      createScrollArea, createPopover, createModal, createSideNavigation,
      createTableOfContents, createTableOfContentsMenu, createSearchDialog,
      createTopNavigationMenu,
    } from '@earendil-works/elanor-react';`,
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'browser',
  minify: true,
  metafile: true,
});
for (const output of Object.values(behaviors.metafile.outputs)) {
  assert.equal(output.imports.length, 0, 'Behavior bundle must be self-contained');
  for (const [path, {bytesInOutput}] of Object.entries(output.inputs)) {
    if (bytesInOutput > 0 && path !== '<stdin>') {
      assert.ok(
        path.includes('/@earendil-works/elanor-react/dist/'),
        `Unexpected behavior runtime: ${path}`,
      );
    }
  }
}

console.log(
  'Packed consumer passed: types, React-free behaviors, production JS/CSS/fonts, and both icon variants.',
);

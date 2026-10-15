// Generates the per-icon modules from the built SVGs of @earendil-works/elanor-icons.
// The component they use, src/create-icon.tsx, is compiled by tsc afterwards.
import {copyFile, mkdir, readdir, readFile, rm, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const packageDirectory = import.meta.dirname;
const iconsDirectory = resolve(packageDirectory, '..');
const outputDirectory = resolve(packageDirectory, 'dist');
const svgPattern = /<svg [^>]*viewBox="([^"]+)"><path d="([^"]+)"\/><\/svg>/;

// The boiled icons at the package root, the unboiled ones under unboiled/.
const variants = [
  {svgDirectory: resolve(iconsDirectory, 'dist/svg'), directory: outputDirectory, root: '.'},
  {
    svgDirectory: resolve(iconsDirectory, 'dist/unboiled/svg'),
    directory: resolve(outputDirectory, 'unboiled'),
    root: '..',
  },
];

await rm(outputDirectory, {recursive: true, force: true});
for (const {directory} of variants) await mkdir(directory, {recursive: true});
await Promise.all([
  copyFile(resolve(iconsDirectory, 'LICENSE'), resolve(outputDirectory, 'LICENSE')),
  copyFile(resolve(iconsDirectory, 'NOTICE'), resolve(outputDirectory, 'NOTICE')),
]);

for (const {svgDirectory, directory, root} of variants) {
  const svgFiles = (await readdir(svgDirectory).catch(() => []))
    .filter((name) => name.endsWith('.svg'))
    .sort();
  if (svgFiles.length === 0)
    throw new Error(`No SVGs in ${svgDirectory}; build @earendil-works/elanor-icons first`);

  const exports: string[] = [];
  const componentNames = new Set<string>();
  for (const file of svgFiles) {
    const name = file.slice(0, -'.svg'.length);
    const match = svgPattern.exec(await readFile(resolve(svgDirectory, file), 'utf8'));
    if (!match) throw new Error(`${file}: unexpected SVG format`);
    const componentName = toComponentName(name);
    if (componentNames.has(componentName))
      throw new Error(`Component name collision: ${componentName}`);
    componentNames.add(componentName);

    await Promise.all([
      writeFile(
        resolve(directory, `${name}.js`),
        `/*! @license Apache-2.0\n * Modified by Elanor from Google Material Symbols; see LICENSE and NOTICE.\n */\nimport {createIcon} from "${root}/create-icon.js";\n\nexport const ${componentName} = /*#__PURE__*/ createIcon(${JSON.stringify(componentName)}, ${JSON.stringify(match[1])}, ${JSON.stringify(match[2])});\n`,
      ),
      writeFile(
        resolve(directory, `${name}.d.ts`),
        `import type {IconComponent} from "${root}/create-icon.js";\nexport declare const ${componentName}: IconComponent;\n`,
      ),
    ]);
    exports.push(`export {${componentName}} from "./${name}.js";`);
  }

  await Promise.all([
    writeFile(resolve(directory, 'index.js'), `${exports.join('\n')}\n`),
    writeFile(resolve(directory, 'index.d.ts'), `${exports.join('\n')}\n`),
  ]);
  console.log(`Built ${svgFiles.length} React icons in ${directory}.`);
}

function toComponentName(name: string): string {
  const body = name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  return `${/^\d/.test(body) ? 'Number' : ''}${body}Icon`;
}

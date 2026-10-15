// Generates the per-icon modules from the built SVGs of an icon package:
// @earendil-works/elanor-icons by default, or the package directory given as the
// first argument (@earendil-works/elanor-icons-boiled for the boiled icons). The
// output goes to dist/ in the package that runs the build. The component the
// modules use, src/create-icon.tsx, is compiled by tsc afterwards.
import {copyFile, mkdir, readdir, readFile, rm, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const iconsDirectory = resolve(process.argv[2] ?? resolve(import.meta.dirname, '..'));
const svgDirectory = resolve(iconsDirectory, 'dist/svg');
const outputDirectory = resolve(process.cwd(), 'dist');
const svgPattern = /^<!-- (.+) -->\n<svg [^>]*viewBox="([^"]+)"><path d="([^"]+)"\/><\/svg>/;

await rm(outputDirectory, {recursive: true, force: true});
await mkdir(outputDirectory, {recursive: true});
await Promise.all([
  copyFile(resolve(iconsDirectory, 'LICENSE'), resolve(outputDirectory, 'LICENSE')),
  copyFile(resolve(iconsDirectory, 'NOTICE'), resolve(outputDirectory, 'NOTICE')),
]);

const svgFiles = (await readdir(svgDirectory).catch(() => []))
  .filter((name) => name.endsWith('.svg'))
  .sort();
if (svgFiles.length === 0)
  throw new Error(`No SVGs in ${svgDirectory}; build the icon package first`);

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
      resolve(outputDirectory, `${name}.js`),
      `/*! @license Apache-2.0\n * ${match[1]}\n */\nimport {createIcon} from "./create-icon.js";\n\nexport const ${componentName} = /*#__PURE__*/ createIcon(${JSON.stringify(componentName)}, ${JSON.stringify(match[2])}, ${JSON.stringify(match[3])});\n`,
    ),
    writeFile(
      resolve(outputDirectory, `${name}.d.ts`),
      `import type {IconComponent} from "./create-icon.js";\nexport declare const ${componentName}: IconComponent;\n`,
    ),
  ]);
  exports.push(`export {${componentName}} from "./${name}.js";`);
}

await Promise.all([
  writeFile(resolve(outputDirectory, 'index.js'), `${exports.join('\n')}\n`),
  writeFile(resolve(outputDirectory, 'index.d.ts'), `${exports.join('\n')}\n`),
]);
console.log(`Built ${svgFiles.length} React icons from ${iconsDirectory}.`);

function toComponentName(name: string): string {
  const body = name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  return `${/^\d/.test(body) ? 'Number' : ''}${body}Icon`;
}

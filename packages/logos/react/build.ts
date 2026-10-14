// Generates per-brand and per-variant modules from @earendil-works/elanor-logos artwork.
// The component they use, src/create-logo.tsx, is compiled by tsc afterwards.
import {mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

interface Path {
  token: string;
  d: string;
  fillRule?: 'evenodd';
}
interface Artwork {
  width: number;
  height: number;
  paths: Path[];
}
interface ArtworkFile {
  /** The token that paints every shape of a monochrome logo. */
  monochromeToken: string;
  /** Per brand: the colors of the tokens its artwork links to, and its artwork per kind. Lockup kinds name their lockup. */
  brands: Record<
    string,
    {
      colors: Record<string, {light: string; dark: string}>;
      kinds: Record<string, {lockup?: string; color: Artwork; monochrome: Artwork}>;
    }
  >;
}

const packageDirectory = import.meta.dirname;
const outputDirectory = resolve(packageDirectory, 'dist');
const artworkFile = resolve(packageDirectory, '../dist/artwork.json');
const manifestFile = resolve(packageDirectory, '../dist/manifest.json');

const source = await readFile(artworkFile, 'utf8').catch((error: NodeJS.ErrnoException) => {
  throw error.code === 'ENOENT'
    ? new Error(`Missing ${artworkFile}; build @earendil-works/elanor-logos first`)
    : error;
});
const {monochromeToken, brands} = JSON.parse(source) as ArtworkFile;
const names = Object.fromEntries(
  (
    JSON.parse(await readFile(manifestFile, 'utf8')) as {brands: Array<{id: string; name: string}>}
  ).brands.map(({id, name}) => [id, name]),
);

await rm(outputDirectory, {recursive: true, force: true});
await mkdir(outputDirectory, {recursive: true});

const exports: string[] = [];
for (const [brand, {colors, kinds}] of Object.entries(brands)) {
  const prefix = `${brand.charAt(0).toUpperCase()}${brand.slice(1)}`;
  const componentName = `${prefix}Logo`;
  const brandName = JSON.stringify(names[brand] ?? brand);
  const imports: string[] = [];
  const kindEntries: string[] = [];
  await mkdir(resolve(outputDirectory, brand), {recursive: true});

  for (const {lockup, color, monochrome} of Object.values(kinds)) {
    const variant = lockup ? `lockup-${lockup}` : 'symbol';
    const suffix = lockup ? `Lockup${lockup.charAt(0).toUpperCase()}${lockup.slice(1)}` : 'Symbol';
    for (const [treatment, artwork] of Object.entries({color, monochrome})) {
      const isMonochrome = treatment === 'monochrome';
      const subpath = `${variant}${isMonochrome ? '-monochrome' : ''}`;
      const exportName = `${prefix}${suffix}${isMonochrome ? 'Monochrome' : ''}`;
      const paths = artwork.paths.map((path) => ({
        ...path,
        token: isMonochrome ? monochromeToken : path.token,
      }));
      const data = {
        colors: Object.fromEntries(
          [...new Set(paths.map(({token}) => token))].map((token) => {
            const color = colors[token];
            if (!color) throw new Error(`${brand}/${subpath} has no color for ${token}`);
            return [token, color];
          }),
        ),
        artwork: {...artwork, paths},
      };
      const stem = resolve(outputDirectory, brand, subpath);
      await writeFile(`${stem}.artwork.js`, `export const data = ${JSON.stringify(data)};\n`);
      await writeFile(
        `${stem}.artwork.d.ts`,
        'import type {LogoVariantData} from "../create-logo.js";\nexport declare const data: LogoVariantData;\n',
      );
      await writeFile(
        `${stem}.js`,
        `import {createLogoVariant} from "../create-logo.js";\nimport {data} from "./${subpath}.artwork.js";\n\nexport const ${exportName} = /*#__PURE__*/ createLogoVariant(${JSON.stringify(exportName)}, ${brandName}, data);\n`,
      );
      await writeFile(
        `${stem}.d.ts`,
        `import type {LogoVariantComponent} from "../create-logo.js";\nexport declare const ${exportName}: LogoVariantComponent;\n`,
      );
      imports.push(
        `import {data as ${suffix}${treatment}} from "./${brand}/${subpath}.artwork.js";`,
      );
    }
    kindEntries.push(
      `${JSON.stringify(lockup ?? 'logo')}: {color: ${suffix}color, monochrome: ${suffix}monochrome}`,
    );
  }
  await writeFile(
    resolve(outputDirectory, `${brand}.js`),
    `import {createLogo} from "./create-logo.js";\n${imports.join('\n')}\n\nexport const ${componentName} = /*#__PURE__*/ createLogo(${JSON.stringify(componentName)}, ${brandName}, {kinds: {${kindEntries.join(',')}}});\n`,
  );
  await writeFile(
    resolve(outputDirectory, `${brand}.d.ts`),
    `import type {LogoComponent} from "./create-logo.js";\nexport declare const ${componentName}: LogoComponent;\n`,
  );
  exports.push(`export {${componentName}} from "./${brand}.js";`);
}
await writeFile(resolve(outputDirectory, 'index.js'), `${exports.join('\n')}\n`);
await writeFile(resolve(outputDirectory, 'index.d.ts'), `${exports.join('\n')}\n`);
console.log(`Built ${exports.length} React logos.`);

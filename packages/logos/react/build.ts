// Generates the per-brand logo modules from the artwork built by @earendil-works/elanor-logos.
// The component they use, src/create-logo.tsx, is compiled by tsc afterwards.
import {mkdir, readFile, rm, writeFile} from "node:fs/promises";
import {resolve} from "node:path";

interface Path {
  token: string;
  d: string;
  fillRule?: "evenodd";
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
    {colors: Record<string, {light: string; dark: string}>; kinds: Record<string, {lockup?: string; color: Artwork; monochrome: Artwork}>}
  >;
}

const packageDirectory = import.meta.dirname;
const outputDirectory = resolve(packageDirectory, "dist");
const artworkFile = resolve(packageDirectory, "../dist/artwork.json");
const manifestFile = resolve(packageDirectory, "../dist/manifest.json");

const source = await readFile(artworkFile, "utf8").catch((error: NodeJS.ErrnoException) => {
  throw error.code === "ENOENT" ? new Error(`Missing ${artworkFile}; build @earendil-works/elanor-logos first`) : error;
});
const {monochromeToken, brands} = JSON.parse(source) as ArtworkFile;
const names = Object.fromEntries(
  (JSON.parse(await readFile(manifestFile, "utf8")) as {brands: Array<{id: string; name: string}>}).brands.map(
    ({id, name}) => [id, name],
  ),
);

await rm(outputDirectory, {recursive: true, force: true});
await mkdir(outputDirectory, {recursive: true});

const exports: string[] = [];
for (const [brand, {colors, kinds}] of Object.entries(brands)) {
  const componentName = `${brand.charAt(0).toUpperCase()}${brand.slice(1)}Logo`;
  const data = {
    colors,
    monochrome: colors[monochromeToken],
    // Keyed by the `lockup` prop; the symbol alone is "logo".
    kinds: Object.fromEntries(
      Object.values(kinds).map(({lockup, color, monochrome}) => [lockup ?? "logo", {color, monochrome}]),
    ),
  };
  await writeFile(
    resolve(outputDirectory, `${brand}.js`),
    `import {createLogo} from "./create-logo.js";\n\nexport const ${componentName} = /*#__PURE__*/ createLogo(${JSON.stringify(componentName)}, ${JSON.stringify(names[brand] ?? brand)}, ${JSON.stringify(data)});\n`,
  );
  await writeFile(
    resolve(outputDirectory, `${brand}.d.ts`),
    `import type {LogoComponent} from "./create-logo.js";\nexport declare const ${componentName}: LogoComponent;\n`,
  );
  exports.push(`export {${componentName}} from "./${brand}.js";`);
}
await writeFile(resolve(outputDirectory, "index.js"), `${exports.join("\n")}\n`);
await writeFile(resolve(outputDirectory, "index.d.ts"), `${exports.join("\n")}\n`);
console.log(`Built ${exports.length} React logos.`);


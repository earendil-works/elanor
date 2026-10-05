// Runs every export in exports.config.ts after `scripts/build.ts`.
import {mkdir, readFile, rm, writeFile} from "node:fs/promises";
import {dirname, resolve} from "node:path";
import {type BrandId, brands, treatments} from "../config.js";
import {exportDefinitions} from "../exports.config.js";
import {colorArtwork, composeArtwork, kinds, loadTokens, packageDirectory} from "./lib/compose.js";
import {type Asset, type ExportContext, exporters} from "./lib/exporters.js";

const distDirectory = resolve(packageDirectory, "dist");
const manifestPath = resolve(distDirectory, "manifest.json");

await Promise.all([
  rm(resolve(distDirectory, "kits"), {recursive: true, force: true}),
  rm(resolve(distDirectory, "press-kits"), {recursive: true, force: true}),
]);

const assets: Asset[] = [];
for (const brand of Object.keys(brands) as BrandId[]) {
  for (const kind of kinds) {
    for (const treatment of treatments) {
      const source = await composeArtwork(brand, kind, treatment.monochrome);
      assets.push({
        id: `${brand}-${kind}-${treatment.id}`,
        brand,
        kind,
        treatment,
        source,
        colored: colorArtwork(source, treatment, await loadTokens(brand)),
      });
    }
  }
}

const context: ExportContext = {
  assets,
  manifest: JSON.parse(await readFile(manifestPath, "utf8")) as ExportContext["manifest"],
  async write(path, data) {
    const file = resolve(distDirectory, path);
    await mkdir(dirname(file), {recursive: true});
    await writeFile(file, data);
    return path;
  },
};

for (const definition of exportDefinitions) {
  const started = performance.now();
  await (exporters[definition.type] as (definition: unknown, context: ExportContext) => Promise<void>)(definition, context);
  console.log(`Exported ${definition.type} in ${Math.round(performance.now() - started)} ms.`);
}

await writeFile(manifestPath, `${JSON.stringify(context.manifest, null, 2)}\n`);

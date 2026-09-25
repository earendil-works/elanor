import {mkdir, rm, writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {type BrandId, brands, gridUnit, treatments} from "../config.js";
import {
  colorArtwork,
  composeArtwork,
  kinds,
  loadTokens,
  monochromeToken,
  packageDirectory,
  serializeSvg,
  tokenHex,
  type Artwork,
} from "./lib/compose.js";

const outputDirectory = resolve(packageDirectory, "dist");
const tokens = await loadTokens();

await rm(outputDirectory, {recursive: true, force: true});

const manifest = {gridUnit, clearSpace: gridUnit, brands: [] as unknown[]};
const artwork: Record<string, Record<string, {color: Artwork; monochrome: Artwork}>> = {};
const usedTokens = new Set<string>([monochromeToken]);

for (const brand of Object.keys(brands) as BrandId[]) {
  const assets: unknown[] = [];
  artwork[brand] = {};
  await mkdir(resolve(outputDirectory, "svg", brand), {recursive: true});

  for (const kind of kinds) {
    const color = await composeArtwork(brand, kind, false);
    const monochrome = await composeArtwork(brand, kind, true);
    artwork[brand][kind] = {color, monochrome};
    for (const path of color.paths) usedTokens.add(path.token);

    for (const treatment of treatments) {
      const id = `${brand}-${kind}-${treatment.id}`;
      const file = `svg/${brand}/${id}.svg`;
      const colored = colorArtwork(treatment.monochrome ? monochrome : color, treatment, tokens);
      await writeFile(resolve(outputDirectory, file), serializeSvg(colored));
      assets.push({
        id,
        kind,
        treatment: treatment.id,
        scheme: treatment.scheme,
        monochrome: treatment.monochrome,
        width: colored.width,
        height: colored.height,
        files: {svg: file},
      });
    }
  }
  manifest.brands.push({id: brand, name: brands[brand].name, assets});
}

// Token colors per scheme, so consumers of artwork.json need no token build.
const colors = Object.fromEntries(
  [...usedTokens].sort().map((token) => [token, {light: tokenHex(tokens, token, "light"), dark: tokenHex(tokens, token, "dark")}]),
);

await writeFile(resolve(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(resolve(outputDirectory, "artwork.json"), `${JSON.stringify({colors, brands: artwork})}\n`);
console.log(`Built ${manifest.brands.length} brands.`);

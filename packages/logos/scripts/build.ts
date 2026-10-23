import {mkdir, rm, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

import {
  type BrandConfig,
  type BrandId,
  brands,
  clearSpace,
  gridUnit,
  type LockupName,
  logoTokens,
} from '../config.js';
import {
  type Artwork,
  brandBackground,
  brandTreatments,
  colorArtwork,
  composeArtwork,
  kinds,
  loadTokens,
  lockupOf,
  packageDirectory,
  serializeSvg,
  tokenHex,
} from './lib/compose.js';

const outputDirectory = resolve(packageDirectory, 'dist');

await rm(outputDirectory, {recursive: true, force: true});

const manifest = {gridUnit, clearSpace, brands: [] as unknown[]};
const artwork: Record<
  string,
  {
    colors: Record<string, {light: string; dark: string}>;
    kinds: Record<string, {lockup?: LockupName; color: Artwork; monochrome: Artwork}>;
  }
> = {};

for (const brand of Object.keys(brands) as BrandId[]) {
  const brandConfig: BrandConfig = brands[brand];
  const tokens = await loadTokens(brand);
  const assets: unknown[] = [];
  const artworkKinds: (typeof artwork)[string]['kinds'] = {};
  const usedTokens = new Set<string>([logoTokens.monochrome]);
  await mkdir(resolve(outputDirectory, 'svg', brand), {recursive: true});

  for (const kind of kinds) {
    const color = await composeArtwork(brand, kind, false);
    const monochrome = brandConfig.painting ? color : await composeArtwork(brand, kind, true);
    const lockup = lockupOf(kind);
    artworkKinds[kind] = {...(lockup ? {lockup} : {}), color, monochrome};
    for (const path of color.paths) if (path.token) usedTokens.add(path.token);

    for (const treatment of brandTreatments(brand)) {
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
  const backgrounds = {
    light: await brandBackground(brand, 'light'),
    dark: await brandBackground(brand, 'dark'),
  };
  manifest.brands.push({id: brand, name: brands[brand].name, backgrounds, assets});

  // The brand's token colors per scheme, so consumers of artwork.json need no token build.
  const colors = Object.fromEntries(
    [...usedTokens]
      .sort()
      .map((token) => [
        token,
        {light: tokenHex(tokens, token, 'light'), dark: tokenHex(tokens, token, 'dark')},
      ]),
  );
  // Paintings get no React components: their artwork is too large for a component.
  if (!brandConfig.painting) artwork[brand] = {colors, kinds: artworkKinds};
}

await writeFile(
  resolve(outputDirectory, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
await writeFile(
  resolve(outputDirectory, 'artwork.json'),
  `${JSON.stringify({monochromeToken: logoTokens.monochrome, brands: artwork})}\n`,
);
console.log(`Built ${manifest.brands.length} brands.`);

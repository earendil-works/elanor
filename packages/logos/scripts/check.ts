// Validates that every source is clean and links only to existing logo tokens.
import {readdir, readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {type BrandId, brands, logoTokens, type PartName, parts} from "../config.js";
import {loadTokens, sourceDirectory} from "./lib/compose.js";
import {translatePath} from "./lib/path-data.js";
import {parseSource} from "./lib/svg.js";

const partNames = Object.keys(parts) as PartName[];
const tokens = await loadTokens();
let count = 0;

for (const brand of await readdir(sourceDirectory)) {
  if (!(brand in brands)) throw new Error(`sources/${brand}: unknown brand; add it to config.ts`);
  for (const file of await readdir(resolve(sourceDirectory, brand))) {
    if (!partNames.some((part) => file === `${part}.svg`)) throw new Error(`sources/${brand}/${file}: unexpected file`);
    const artwork = parseSource(await readFile(resolve(sourceDirectory, brand, file), "utf8"), `${brand}/${file}`);
    for (const path of artwork.paths) {
      if (!path.token.startsWith(`${logoTokens.group}.`) || !tokens.tokens[path.token]) {
        throw new Error(`sources/${brand}/${file}: fill links to unknown logo token ${path.token}`);
      }
      translatePath(path.d, 1, 1); // throws on unsupported path data
    }
    count += 1;
  }
}

for (const brand of Object.keys(brands) as BrandId[]) {
  for (const part of partNames.filter((name) => parts[name].required)) {
    await readFile(resolve(sourceDirectory, brand, `${part}.svg`)).catch(() => {
      throw new Error(`sources/${brand}/${part}.svg is missing`);
    });
  }
}

console.log(`Checked ${count} logo sources.`);

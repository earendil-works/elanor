// Runs the export plugins listed in exports.config.ts after `scripts/build.ts`.
import {readFile, rm, writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {exportPlugins} from "../exports.config.js";
import {packageDirectory} from "./lib/compose.js";
import {createExportContext, type Manifest} from "./exports/plugin.js";

const distDirectory = resolve(packageDirectory, "dist");
const manifestPath = resolve(distDirectory, "manifest.json");

await Promise.all(
  ["kits", "guidelines", "press-kits"].map((directory) => rm(resolve(distDirectory, directory), {recursive: true, force: true})),
);

const context = await createExportContext(distDirectory, JSON.parse(await readFile(manifestPath, "utf8")) as Manifest, exportPlugins);

for (const plugin of exportPlugins) {
  const started = performance.now();
  await plugin.run(context);
  console.log(`Exported ${plugin.name} in ${Math.round(performance.now() - started)} ms.`);
}

await writeFile(manifestPath, `${JSON.stringify(context.manifest, null, 2)}\n`);

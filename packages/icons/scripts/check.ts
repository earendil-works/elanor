import {readdir, readFile} from "node:fs/promises";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {parseSvg} from "./lib/svg.js";

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = resolve(packageDirectory, "sources");
const files = (await readdir(sourceDirectory)).filter((name) => name.endsWith(".svg")).sort();
if (files.length === 0) throw new Error("sources/ is empty");

const publicNames = new Set<string>();
for (const file of files) {
  if (!/^[a-z0-9_]+\.svg$/.test(file)) throw new Error(`Invalid source filename: ${file}`);
  const publicName = file.replaceAll("_", "-");
  if (publicNames.has(publicName)) throw new Error(`Public filename collision: ${publicName}`);
  publicNames.add(publicName);
  parseSvg(await readFile(resolve(sourceDirectory, file), "utf8"), file);
}

const provenance = JSON.parse(
  await readFile(resolve(packageDirectory, "provenance.json"), "utf8"),
) as {revision?: unknown; opticalSize?: unknown; weight?: unknown; fill?: unknown};
if (
  typeof provenance.revision !== "string" ||
  !/^[0-9a-f]{40}$/.test(provenance.revision) ||
  provenance.opticalSize !== 20 ||
  provenance.weight !== 400 ||
  provenance.fill !== 0
) {
  throw new Error("provenance.json does not describe a pinned regular, unfilled 20px source");
}

console.log(`Checked ${files.length} vendored SVGs.`);

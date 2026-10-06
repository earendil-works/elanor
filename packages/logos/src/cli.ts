#!/usr/bin/env node
import {writeFile} from "node:fs/promises";
import {parseArgs} from "node:util";
import {copyFavicons, faviconHead} from "./favicons.js";

const usage = `Usage: elanor-logos favicons <brand> --out <dir> [--base <path>] [--head <file>]

Copies a brand's favicon files into <dir>, the folder your site serves at --base (default /),
and prints the <head> tags, or writes them to --head.`;

async function main(): Promise<void> {
  const {positionals, values} = parseArgs({
    allowPositionals: true,
    options: {out: {type: "string"}, base: {type: "string"}, head: {type: "string"}, help: {type: "boolean", short: "h"}},
  });
  if (values.help) {
    console.log(usage);
    return;
  }
  const [command, brand] = positionals;
  if (command !== "favicons" || !brand || positionals.length !== 2 || !values.out) throw new UsageError();

  const copied = await copyFavicons(brand, values.out);
  const tags = await faviconHead(brand, values.base === undefined ? {} : {base: values.base});
  if (values.head) {
    await writeFile(values.head, tags);
    console.log(`Copied ${copied.length} favicon files to ${values.out} and wrote the <head> tags to ${values.head}.`);
  } else {
    console.log(`Copied ${copied.length} favicon files to ${values.out}. Add these tags to your <head>:\n\n${tags}`);
  }
}

class UsageError extends Error {}

// The command line is the boundary: report failures as a message and exit code instead of a stack trace.
main().catch((error: unknown) => {
  console.error(error instanceof UsageError ? usage : `elanor-logos: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});

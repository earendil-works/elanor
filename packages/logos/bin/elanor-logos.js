#!/usr/bin/env node
// Committed so package managers can link the command at install time; the CLI itself is compiled to
// lib/ by the package build, which also produces the assets it installs.
import {existsSync} from "node:fs";

const cli = new URL("../lib/cli.js", import.meta.url);
if (!existsSync(cli)) {
  console.error("elanor-logos: the package is not built yet; run pnpm --filter @earendil-works/elanor-logos build first.");
  process.exit(1);
}
await import(cli.href);

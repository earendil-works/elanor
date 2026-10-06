import {execFile} from "node:child_process";
import {mkdtemp, readdir, readFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join, resolve} from "node:path";
import {promisify} from "node:util";
import {describe, expect, test} from "vitest";
import {copyFavicons, faviconHead, faviconTags} from "../src/favicons.js";

const run = promisify(execFile);
const cli = resolve(import.meta.dirname, "../lib/cli.js");
const {version} = JSON.parse(await readFile(resolve(import.meta.dirname, "../package.json"), "utf8")) as {version: string};
const files = {ico: "favicon.ico", svg: "favicon.svg", appleTouchIcon: "apple-touch-icon.png", webmanifest: "site.webmanifest"};

describe("favicon tags", () => {
  test("link every file from the base path with the version", () => {
    expect(faviconTags(files, "1.2.3")).toContain('<link rel="icon" href="/favicon.svg?v=1.2.3" type="image/svg+xml">');
    for (const base of ["/docs", "/docs/"]) {
      expect(faviconTags(files, "1.2.3", {base})).toContain('<link rel="manifest" href="/docs/site.webmanifest?v=1.2.3">');
    }
  });

  test("match the head snippet in the build", async () => {
    expect(await faviconHead("pi")).toBe(await readFile(resolve(import.meta.dirname, "../dist/favicons/pi/head.html"), "utf8"));
  });
});

describe("copyFavicons", () => {
  test("copies the files a site serves, with versioned manifest icons", async () => {
    const directory = join(await mkdtemp(join(tmpdir(), "favicons-")), "public");
    const copied = await copyFavicons("radius", directory);
    expect((await readdir(directory)).sort()).toEqual([...copied].sort());
    expect(copied).toEqual(expect.arrayContaining(["favicon.ico", "favicon.svg", "apple-touch-icon.png", "site.webmanifest"]));
    expect(copied).not.toContain("head.html");
    const manifest = JSON.parse(await readFile(join(directory, "site.webmanifest"), "utf8")) as {icons: Array<{src: string}>};
    for (const icon of manifest.icons) expect(icon.src).toMatch(new RegExp(`\\?v=${version.replaceAll(".", "\\.")}$`));
  });

  test("rejects unknown brands", async () => {
    await expect(copyFavicons("nope", tmpdir())).rejects.toThrow(/Unknown brand "nope"\. Available brands: earendil, pi, radius, lefos/);
  });
});

describe("elanor-logos CLI", () => {
  test("copies the favicons and prints the tags", async () => {
    const directory = join(await mkdtemp(join(tmpdir(), "favicons-cli-")), "public");
    const {stdout} = await run("node", [cli, "favicons", "pi", "--out", directory, "--base", "/app"]);
    expect(stdout).toContain(`Copied 7 favicon files to ${directory}`);
    expect(stdout).toContain(`<link rel="apple-touch-icon" href="/app/apple-touch-icon.png?v=${version}">`);
  });

  test.each([
    [["favicons", "pi"], /Usage: elanor-logos favicons/],
    [["favicons", "nope", "--out", "x"], /Unknown brand "nope"/],
    [["icons", "pi", "--out", "x"], /Usage: elanor-logos favicons/],
  ])("fails with a message for %j", async (args, message) => {
    const failure = await run("node", [cli, ...args]).then(
      () => undefined,
      (error: {code: number; stderr: string}) => error,
    );
    expect(failure?.code).toBe(1);
    expect(failure?.stderr).toMatch(message);
  });
});

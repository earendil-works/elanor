import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {build} from "esbuild";
import {createElement, type ComponentType, type SVGProps} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {describe, expect, test} from "vitest";

type IconProps = SVGProps<SVGSVGElement> & {size?: number | string};

const packageDirectory = resolve(import.meta.dirname, "..");

async function load(name: string): Promise<ComponentType<IconProps>> {
  const module = (await import(resolve(packageDirectory, `dist/${name}.js`))) as Record<string, ComponentType<IconProps>>;
  return Object.values(module)[0]!;
}

describe("React icons", () => {
  test.each(["search", "home", "settings-suggest"])("%s renders the same geometry as the SVG", async (name) => {
    const svg = await readFile(resolve(packageDirectory, `../dist/svg/${name}.svg`), "utf8");
    const markup = renderToStaticMarkup(createElement(await load(name)));
    const pick = (source: string) => ({
      viewBox: /viewBox="([^"]+)"/.exec(source)?.[1],
      d: /<path d="([^"]+)"/.exec(source)?.[1],
    });
    expect(pick(markup)).toEqual(pick(svg));
    expect(pick(markup).d).toBeTruthy();
  });

  test("icons are decorative by default, accessible when named, and sized", async () => {
    const SearchIcon = await load("search");
    const decorative = renderToStaticMarkup(createElement(SearchIcon));
    expect(decorative).toContain('aria-hidden="true"');
    expect(decorative).not.toContain('role="img"');

    const named = renderToStaticMarkup(createElement(SearchIcon, {size: 24, "aria-label": "Search"}));
    expect(named).toContain('width="24"');
    expect(named).toContain('height="24"');
    expect(named).toContain('role="img"');
    expect(named).not.toContain("aria-hidden");
    expect(SearchIcon).toHaveProperty("$$typeof");
  });

  test("the barrel tree-shakes to the imported icon", async () => {
    const result = await build({
      stdin: {
        contents: 'import {SearchIcon} from "./dist/index.js"; console.log(SearchIcon);',
        resolveDir: packageDirectory,
      },
      bundle: true,
      external: ["react"],
      format: "esm",
      minify: true,
      write: false,
    });
    const output = result.outputFiles[0]?.text ?? "";
    expect(output).toContain("SearchIcon");
    expect(output).not.toContain("HomeIcon");
    expect(output.length).toBeLessThan(10_000);
  });
});

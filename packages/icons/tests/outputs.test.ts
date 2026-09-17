import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {build} from "esbuild";
import {XMLParser} from "fast-xml-parser";
import {createElement} from "react";
import type {ComponentType, SVGProps} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {describe, expect, test} from "vitest";
import {parseSvg, viewBoxString} from "../scripts/lib/svg.js";

const packageDirectory = resolve(import.meta.dirname, "..");
const parser = new XMLParser({attributeNamePrefix: "", ignoreAttributes: false});

describe("published outputs", () => {
  test.each(["search", "home", "settings"])("%s React and SVG geometry is identical", async (name) => {
    const svg = parseSvg(
      await readFile(resolve(packageDirectory, `dist/svg/${name}.svg`), "utf8"),
      name,
    );
    const module = (await import(`../dist/react/${name}.js`)) as Record<string, unknown>;
    const Component = Object.values(module)[0] as ComponentType<
      SVGProps<SVGSVGElement> & {size?: number | string}
    >;
    const markup = renderToStaticMarkup(createElement(Component));
    const rendered = parser.parse(markup).svg as {
      viewBox: string;
      path: {d: string; "fill-rule": string} | Array<{d: string; "fill-rule": string}>;
    };
    const paths = Array.isArray(rendered.path) ? rendered.path : [rendered.path];

    expect(rendered.viewBox).toBe(viewBoxString(svg.viewBox));
    expect(paths.map(({d, "fill-rule": fillRule}) => ({d, fillRule}))).toEqual(svg.paths);
  });

  test("components are decorative by default, accessible when named, sized, and ref-capable", async () => {
    const {SearchIcon} = (await import(resolve(packageDirectory, "dist/react/search.js"))) as {
      SearchIcon: ComponentType<SVGProps<SVGSVGElement> & {size?: number | string}>;
    };
    const decorative = renderToStaticMarkup(createElement(SearchIcon));
    expect(decorative).toContain('aria-hidden="true"');
    expect(decorative).not.toContain('role="img"');

    const named = renderToStaticMarkup(
      createElement(SearchIcon, {size: 24, "aria-label": "Search"}),
    );
    expect(named).toContain('width="24"');
    expect(named).toContain('height="24"');
    expect(named).toContain('aria-label="Search"');
    expect(named).toContain('role="img"');
    expect(named).not.toContain("aria-hidden");
    expect(SearchIcon).toHaveProperty("$$typeof");
  });

  test("the named barrel tree-shakes to the imported icon", async () => {
    const result = await build({
      stdin: {
        contents: 'import {SearchIcon} from "./dist/react/index.js"; console.log(SearchIcon);',
        resolveDir: packageDirectory,
      },
      bundle: true,
      external: ["react"],
      format: "esm",
      minify: true,
      treeShaking: true,
      write: false,
    });
    const output = result.outputFiles[0]?.text ?? "";
    expect(output).toContain("SearchIcon");
    expect(output).not.toContain("HomeIcon");
    expect(output.length).toBeLessThan(20_000);
  });
});

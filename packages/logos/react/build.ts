// Generates React logo components from the artwork built by @earendil-works/elanor-logos.
import {mkdir, readFile, rm, writeFile} from "node:fs/promises";
import {resolve} from "node:path";

interface Path {
  token: string;
  d: string;
  fillRule?: "evenodd";
}
interface Artwork {
  width: number;
  height: number;
  paths: Path[];
}
interface ArtworkFile {
  colors: Record<string, {light: string; dark: string}>;
  brands: Record<string, Record<string, {color: Artwork; monochrome: Artwork}>>;
}

const packageDirectory = import.meta.dirname;
const outputDirectory = resolve(packageDirectory, "dist");
const artworkFile = resolve(packageDirectory, "../dist/artwork.json");
const manifestFile = resolve(packageDirectory, "../dist/manifest.json");

const source = await readFile(artworkFile, "utf8").catch(() => {
  throw new Error(`Missing ${artworkFile}; build @earendil-works/elanor-logos first`);
});
const {colors, brands} = JSON.parse(source) as ArtworkFile;
const names = Object.fromEntries(
  (JSON.parse(await readFile(manifestFile, "utf8")) as {brands: Array<{id: string; name: string}>}).brands.map(
    ({id, name}) => [id, name],
  ),
);

await rm(outputDirectory, {recursive: true, force: true});
await mkdir(outputDirectory, {recursive: true});
await writeFile(resolve(outputDirectory, "create-logo.js"), runtime());
await writeFile(resolve(outputDirectory, "create-logo.d.ts"), runtimeTypes());

const exports: string[] = [];
for (const [brand, kinds] of Object.entries(brands)) {
  const componentName = `${brand.charAt(0).toUpperCase()}${brand.slice(1)}Logo`;
  const used = new Set<string>();
  for (const {color, monochrome} of Object.values(kinds)) {
    for (const path of [...color.paths, ...monochrome.paths]) used.add(path.token);
  }
  used.add("semantic.color.logo.monochrome");
  const data = {
    colors: Object.fromEntries([...used].sort().map((token) => [token, colors[token]])),
    kinds: Object.fromEntries(
      Object.entries(kinds).map(([kind, variants]) => [kind.replace("logo-wordmark-", "") || kind, variants]),
    ),
  };
  await writeFile(
    resolve(outputDirectory, `${brand}.js`),
    `import {createLogo} from "./create-logo.js";\n\nexport const ${componentName} = /*#__PURE__*/ createLogo(${JSON.stringify(componentName)}, ${JSON.stringify(names[brand] ?? brand)}, ${JSON.stringify(data)});\n`,
  );
  await writeFile(
    resolve(outputDirectory, `${brand}.d.ts`),
    `import type {LogoComponent} from "./create-logo.js";\nexport declare const ${componentName}: LogoComponent;\n`,
  );
  exports.push(`export {${componentName}} from "./${brand}.js";`);
}
await writeFile(resolve(outputDirectory, "index.js"), `${exports.join("\n")}\n`);
await writeFile(resolve(outputDirectory, "index.d.ts"), `${exports.join("\n")}\n`);
console.log(`Built ${exports.length} React logos.`);

function runtime(): string {
  return `import {createElement, forwardRef} from "react";

const MONOCHROME = "semantic.color.logo.monochrome";

export function createLogo(displayName, brandName, data) {
  const Logo = forwardRef(function ElanorLogo(
    {lockup, monochrome = false, scheme = "auto", height = 32, style, ...props},
    ref,
  ) {
    const kind = data.kinds[lockup ?? "logo"];
    if (!kind) throw new Error(\`\${displayName} has no \${lockup} lockup\`);
    const artwork = monochrome ? kind.monochrome : kind.color;
    const numeric = typeof height === "number";
    const named = props["aria-hidden"] == null || props["aria-hidden"] === false || props["aria-hidden"] === "false";
    const paths = artwork.paths.map(({token, d, fillRule}, index) => {
      const color = data.colors[monochrome ? MONOCHROME : token];
      const auto = scheme === "auto" && color.light !== color.dark;
      return createElement("path", {
        key: index,
        d,
        fillRule,
        fill: auto ? undefined : color[scheme === "dark" ? "dark" : "light"],
        style: auto ? {fill: \`light-dark(\${color.light}, \${color.dark})\`} : undefined,
      });
    });
    return createElement(
      "svg",
      {
        role: named ? "img" : undefined,
        "aria-label": named ? brandName : undefined,
        ...props,
        ref,
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: \`0 0 \${artwork.width} \${artwork.height}\`,
        height,
        width: numeric ? (height * artwork.width) / artwork.height : undefined,
        style: numeric ? style : {aspectRatio: \`\${artwork.width} / \${artwork.height}\`, width: "auto", ...style},
      },
      paths,
    );
  });
  Logo.displayName = displayName;
  return Logo;
}
`;
}

function runtimeTypes(): string {
  return `import type {ForwardRefExoticComponent, RefAttributes, SVGProps} from "react";
export interface LogoProps extends Omit<SVGProps<SVGSVGElement>, "children" | "height" | "width"> {
  /** Symbol and wordmark lockup. Omit for the symbol alone. */
  lockup?: "horizontal" | "stacked";
  /** One-color version, for layouts that require it. */
  monochrome?: boolean;
  /** "auto" follows the page's color-scheme via CSS light-dark(). */
  scheme?: "auto" | "light" | "dark";
  /** Rendered height; the width follows the artwork's aspect ratio. Defaults to 32. */
  height?: number | string;
}
export type LogoComponent = ForwardRefExoticComponent<LogoProps & RefAttributes<SVGSVGElement>>;
export declare function createLogo(displayName: string, brandName: string, data: unknown): LogoComponent;
`;
}

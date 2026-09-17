import {mkdir, readdir, readFile, rm, writeFile} from "node:fs/promises";
import {basename, dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {pipelineConfig} from "../config.js";
import {processSvg} from "./lib/pipeline.js";
import type {Artwork} from "./lib/types.js";

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = resolve(packageDirectory, "sources");
const outputDirectory = resolve(packageDirectory, "dist");
const svgDirectory = resolve(outputDirectory, "svg");
const reactDirectory = resolve(outputDirectory, "react");

const sourceFiles = (await readdir(sourceDirectory))
  .filter((name) => name.endsWith(".svg"))
  .sort((left, right) => left.localeCompare(right, "en"));
if (sourceFiles.length === 0) throw new Error("No vendored SVGs found in sources/");

await rm(outputDirectory, {recursive: true, force: true});
await Promise.all([
  mkdir(svgDirectory, {recursive: true}),
  mkdir(reactDirectory, {recursive: true}),
]);
await Promise.all([
  writeFile(resolve(reactDirectory, "create-icon.js"), reactRuntime()),
  writeFile(resolve(reactDirectory, "create-icon.d.ts"), reactTypes()),
  writeFile(resolve(outputDirectory, "svg.d.ts"), "declare const url: string;\nexport default url;\n"),
]);

const exports: string[] = [];
const componentNames = new Set<string>();
for (const [index, sourceFile] of sourceFiles.entries()) {
  const sourceName = basename(sourceFile, ".svg");
  const publicName = sourceName.replaceAll("_", "-");
  const componentName = toComponentName(sourceName);
  if (componentNames.has(componentName)) {
    throw new Error(`Component name collision: ${componentName}`);
  }
  componentNames.add(componentName);

  const source = await readFile(resolve(sourceDirectory, sourceFile), "utf8");
  const result = processSvg(source, pipelineConfig, sourceFile);
  await Promise.all([
    writeFile(resolve(svgDirectory, `${publicName}.svg`), result.svg),
    writeFile(resolve(reactDirectory, `${publicName}.js`), reactModule(componentName, result.artwork)),
    writeFile(resolve(reactDirectory, `${publicName}.d.ts`), reactDeclaration(componentName)),
  ]);
  exports.push(`export {${componentName}} from "./${publicName}.js";`);

  if ((index + 1) % 250 === 0) {
    process.stdout.write(`Built ${index + 1}/${sourceFiles.length}\r`);
  }
}

await Promise.all([
  writeFile(resolve(reactDirectory, "index.js"), `${exports.join("\n")}\n`),
  writeFile(resolve(reactDirectory, "index.d.ts"), `${exports.join("\n")}\n`),
]);
console.log(`Built ${sourceFiles.length} icons.                    `);

export function toComponentName(sourceName: string): string {
  const words = sourceName.split(/[_-]+/).filter(Boolean);
  const body = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  return `${/^\d/.test(body) ? "Number" : ""}${body}Icon`;
}

function reactModule(componentName: string, artwork: Artwork): string {
  const paths = artwork.paths.map(({d, fillRule}) => ({d, fillRule}));
  const viewBox = [
    artwork.viewBox.minX,
    artwork.viewBox.minY,
    artwork.viewBox.width,
    artwork.viewBox.height,
  ].join(" ");
  return `/*! @license Apache-2.0\n * Modified by Elanor from Google Material Symbols; see the package LICENSE and NOTICE.\n */\nimport {createIcon} from "./create-icon.js";\n\nexport const ${componentName} = /*#__PURE__*/ createIcon(${JSON.stringify(componentName)}, ${JSON.stringify(viewBox)}, ${JSON.stringify(paths)});\n`;
}

function reactDeclaration(componentName: string): string {
  return `import type {IconComponent} from "./create-icon.js";\nexport declare const ${componentName}: IconComponent;\n`;
}

function reactRuntime(): string {
  return `/*! @license Apache-2.0 */
import {createElement, forwardRef} from "react";

export function createIcon(displayName, viewBox, paths) {
  const Icon = forwardRef(function ElanorIcon({size = 16, ...props}, ref) {
    const named = props["aria-label"] != null || props["aria-labelledby"] != null;
    return createElement(
      "svg",
      {
        ...props,
        ref,
        xmlns: "http://www.w3.org/2000/svg",
        width: props.width ?? size,
        height: props.height ?? size,
        viewBox,
        fill: "currentColor",
        role: props.role ?? (named ? "img" : undefined),
        "aria-hidden": props["aria-hidden"] ?? (named ? undefined : true),
        focusable: props.focusable ?? "false",
      },
      paths.map((path, index) => createElement("path", {...path, key: index})),
    );
  });
  Icon.displayName = displayName;
  return Icon;
}
`;
}

function reactTypes(): string {
  return `import type {ForwardRefExoticComponent, RefAttributes, SVGProps} from "react";
export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
export type IconComponent = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
export declare function createIcon(displayName: string, viewBox: string, paths: ReadonlyArray<{d: string; fillRule: "nonzero" | "evenodd"}>): IconComponent;
`;
}

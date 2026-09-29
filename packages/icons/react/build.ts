// Generates React components from the built SVGs of @earendil-works/elanor-icons.
import {copyFile, mkdir, readdir, readFile, rm, writeFile} from "node:fs/promises";
import {resolve} from "node:path";

const packageDirectory = import.meta.dirname;
const iconsDirectory = resolve(packageDirectory, "..");
const svgDirectory = resolve(iconsDirectory, "dist/svg");
const outputDirectory = resolve(packageDirectory, "dist");
const svgPattern = /<svg [^>]*viewBox="([^"]+)"><path d="([^"]+)"\/><\/svg>/;

const svgFiles = (await readdir(svgDirectory).catch(() => [])).filter((name) => name.endsWith(".svg")).sort();
if (svgFiles.length === 0) throw new Error(`No SVGs in ${svgDirectory}; build @earendil-works/elanor-icons first`);

await rm(outputDirectory, {recursive: true, force: true});
await mkdir(outputDirectory, {recursive: true});
await Promise.all([
  writeFile(resolve(outputDirectory, "create-icon.js"), runtime()),
  writeFile(resolve(outputDirectory, "create-icon.d.ts"), runtimeTypes()),
  copyFile(resolve(iconsDirectory, "LICENSE"), resolve(outputDirectory, "LICENSE")),
  copyFile(resolve(iconsDirectory, "NOTICE"), resolve(outputDirectory, "NOTICE")),
]);

const exports: string[] = [];
const componentNames = new Set<string>();
for (const file of svgFiles) {
  const name = file.slice(0, -".svg".length);
  const match = svgPattern.exec(await readFile(resolve(svgDirectory, file), "utf8"));
  if (!match) throw new Error(`${file}: unexpected SVG format`);
  const componentName = toComponentName(name);
  if (componentNames.has(componentName)) throw new Error(`Component name collision: ${componentName}`);
  componentNames.add(componentName);

  await Promise.all([
    writeFile(
      resolve(outputDirectory, `${name}.js`),
      `/*! @license Apache-2.0\n * Modified by Elanor from Google Material Symbols; see LICENSE and NOTICE.\n */\nimport {createIcon} from "./create-icon.js";\n\nexport const ${componentName} = /*#__PURE__*/ createIcon(${JSON.stringify(componentName)}, ${JSON.stringify(match[1])}, ${JSON.stringify(match[2])});\n`,
    ),
    writeFile(
      resolve(outputDirectory, `${name}.d.ts`),
      `import type {IconComponent} from "./create-icon.js";\nexport declare const ${componentName}: IconComponent;\n`,
    ),
  ]);
  exports.push(`export {${componentName}} from "./${name}.js";`);
}

await Promise.all([
  writeFile(resolve(outputDirectory, "index.js"), `${exports.join("\n")}\n`),
  writeFile(resolve(outputDirectory, "index.d.ts"), `${exports.join("\n")}\n`),
]);
console.log(`Built ${svgFiles.length} React icons.`);

function toComponentName(name: string): string {
  const body = name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  return `${/^\d/.test(body) ? "Number" : ""}${body}Icon`;
}

function runtime(): string {
  return `/*! @license Apache-2.0 */
import {createElement, forwardRef} from "react";

export function createIcon(displayName, viewBox, d) {
  const Icon = forwardRef(function ElanorIcon({size = 16, children, ...props}, ref) {
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
      createElement("path", {d}),
      children,
    );
  });
  Icon.displayName = displayName;
  return Icon;
}
`;
}

function runtimeTypes(): string {
  return `import type {ForwardRefExoticComponent, RefAttributes, SVGProps} from "react";
export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
export type IconComponent = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
export declare function createIcon(displayName: string, viewBox: string, d: string): IconComponent;
`;
}

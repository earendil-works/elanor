import {XMLParser, XMLValidator} from "fast-xml-parser";
import type {Artwork, ViewBox} from "./types.js";

const parser = new XMLParser({
  attributeNamePrefix: "",
  ignoreAttributes: false,
  parseAttributeValue: false,
  parseTagValue: false,
  processEntities: false,
});

interface XmlElement {
  [key: string]: unknown;
}

export function parseSvg(source: string, fileName = "SVG"): Artwork {
  const validation = XMLValidator.validate(source);
  if (validation !== true) {
    throw new Error(`${fileName}: invalid XML: ${validation.err.msg}`);
  }

  const document = parser.parse(source) as XmlElement;
  const svg = document.svg;
  if (!isRecord(svg)) throw new Error(`${fileName}: expected one <svg> root`);

  const unsupported = Object.keys(svg).filter(
    (key) => !["xmlns", "width", "height", "viewBox", "path"].includes(key),
  );
  if (unsupported.length > 0) {
    throw new Error(`${fileName}: unsupported SVG content: ${unsupported.join(", ")}`);
  }

  const rawPaths = Array.isArray(svg.path) ? svg.path : [svg.path];
  if (rawPaths.length === 0 || rawPaths[0] === undefined) {
    throw new Error(`${fileName}: expected at least one <path>`);
  }

  const paths = rawPaths.map((rawPath, index) => {
    if (!isRecord(rawPath) || typeof rawPath.d !== "string") {
      throw new Error(`${fileName}: path ${index + 1} has no path data`);
    }
    const unsupportedPathAttributes = Object.keys(rawPath).filter(
      (key) => !["d", "fill-rule", "fill"].includes(key),
    );
    if (unsupportedPathAttributes.length > 0) {
      throw new Error(
        `${fileName}: unsupported path attributes: ${unsupportedPathAttributes.join(", ")}`,
      );
    }
    if (rawPath.fill !== undefined && rawPath.fill !== "#000000" && rawPath.fill !== "black") {
      throw new Error(`${fileName}: only black/default filled paths are supported`);
    }
    const rawFillRule = rawPath["fill-rule"] ?? "nonzero";
    if (rawFillRule !== "nonzero" && rawFillRule !== "evenodd") {
      throw new Error(`${fileName}: unsupported fill-rule ${String(rawFillRule)}`);
    }
    const fillRule: "nonzero" | "evenodd" = rawFillRule;
    return {d: rawPath.d, fillRule};
  });

  return {viewBox: parseViewBox(svg, fileName), paths};
}

function parseViewBox(svg: XmlElement, fileName: string): ViewBox {
  const value = typeof svg.viewBox === "string" ? svg.viewBox : undefined;
  const numbers = value?.trim().split(/[\s,]+/).map(Number);
  if (numbers?.length === 4 && numbers.every(Number.isFinite)) {
    const [minX, minY, width, height] = numbers;
    if (minX !== undefined && minY !== undefined && width !== undefined && height !== undefined && width > 0 && height > 0) {
      return {minX, minY, width, height};
    }
  }

  const width = Number.parseFloat(String(svg.width ?? ""));
  const height = Number.parseFloat(String(svg.height ?? ""));
  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    return {minX: 0, minY: 0, width, height};
  }
  throw new Error(`${fileName}: expected a positive viewBox or numeric width and height`);
}

function isRecord(value: unknown): value is XmlElement {
  return typeof value === "object" && value !== null;
}

export function viewBoxString(viewBox: ViewBox): string {
  return [viewBox.minX, viewBox.minY, viewBox.width, viewBox.height].join(" ");
}

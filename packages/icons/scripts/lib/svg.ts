import type {Artwork, ViewBox} from './types.js';

// Material Symbols sources are a single path in a bare <svg>. Anything else is
// rejected so that an upstream format change fails loudly.
const documentPattern = /^<svg((?:\s+[A-Za-z]+="[^"]*")*)\s*><path d="([^"]+)"\s*\/><\/svg>\s*$/;
const attributePattern = /\s+([A-Za-z]+)="([^"]*)"/g;
const allowedAttributes = new Set(['xmlns', 'width', 'height', 'viewBox']);

export function parseSvg(source: string, fileName = 'SVG'): Artwork {
  const match = documentPattern.exec(source);
  if (!match) throw new Error(`${fileName}: expected <svg><path d="…"/></svg>`);

  const attributes = new Map<string, string>();
  for (const [, name, value] of match[1]!.matchAll(attributePattern)) {
    if (!allowedAttributes.has(name!))
      throw new Error(`${fileName}: unsupported attribute ${name}`);
    attributes.set(name!, value!);
  }
  if (attributes.get('xmlns') !== 'http://www.w3.org/2000/svg') {
    throw new Error(`${fileName}: missing SVG namespace`);
  }

  return {viewBox: parseViewBox(attributes, fileName), d: match[2]!};
}

function parseViewBox(attributes: Map<string, string>, fileName: string): ViewBox {
  const viewBox = attributes.get('viewBox');
  if (viewBox !== undefined) {
    const [minX, minY, width, height, ...rest] = viewBox
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (
      rest.length === 0 &&
      [minX, minY, width, height].every(Number.isFinite) &&
      width! > 0 &&
      height! > 0
    ) {
      return {minX: minX!, minY: minY!, width: width!, height: height!};
    }
    throw new Error(`${fileName}: invalid viewBox`);
  }

  const width = Number(attributes.get('width'));
  const height = Number(attributes.get('height'));
  if (width > 0 && height > 0) return {minX: 0, minY: 0, width, height};
  throw new Error(`${fileName}: expected a viewBox or numeric width and height`);
}

export function viewBoxString(viewBox: ViewBox): string {
  return [viewBox.minX, viewBox.minY, viewBox.width, viewBox.height].join(' ');
}

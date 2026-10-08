/**
 * Minimal vector PDF writer for print logos: filled paths in DeviceCMYK.
 *
 * The output names its intended press condition in an output intent but does
 * not embed an ICC profile, so it is not a certified PDF/X file.
 */

import {roles, tokenizePath} from './path-data.js';

export interface CmykPath {
  d: string;
  cmyk: [number, number, number, number];
  fillRule?: 'evenodd';
}

export interface PrintArtwork {
  width: number;
  height: number;
  paths: CmykPath[];
}

const POINTS_PER_MILLIMETER = 72 / 25.4;

export function createPdf(
  artwork: PrintArtwork,
  options: {millimetersPerUnit: number; title: string; outputCondition: string},
): Buffer {
  const scale = options.millimetersPerUnit * POINTS_PER_MILLIMETER;
  const pageWidth = format(artwork.width * scale);
  const pageHeight = format(artwork.height * scale);

  // Flip the y axis so SVG coordinates can be used directly.
  const content = [
    `${format(scale)} 0 0 ${format(-scale)} 0 ${pageHeight} cm`,
    ...artwork.paths.map(({d, cmyk, fillRule}) => {
      const color = cmyk.map((value) => format(value / 100)).join(' ');
      return `${color} k\n${pathOperators(d)}\n${fillRule === 'evenodd' ? 'f*' : 'f'}`;
    }),
  ].join('\n');

  const objects = [
    `<< /Type /Catalog /Pages 2 0 R /OutputIntents [<< /Type /OutputIntent /S /GTS_PDFX /OutputConditionIdentifier (${escape(options.outputCondition)}) /RegistryName (http://www.color.org) >>] >>`,
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /TrimBox [0 0 ${pageWidth} ${pageHeight}] /Resources << >> /Contents 4 0 R >>`,
    `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
    `<< /Title (${escape(options.title)}) /Producer (@earendil-works/elanor-logos) >>`,
  ];

  let body = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(body, 'latin1'));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(body, 'latin1');
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  body += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(body, 'latin1');
}

/** The path commands PDF output supports, absolute or relative. */
const pdfCommands = new Set(['M', 'L', 'H', 'V', 'C', 'Z']);

/** Converts SVG path data (M, L, H, V, C, Z, absolute or relative) into PDF path operators. */
export function pathOperators(d: string): string {
  const tokens = tokenizePath(d);
  const output: string[] = [];
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  let command = '';
  let index = 0;

  const isCommand = (token: string) => /[A-Za-z]/.test(token);

  while (index < tokens.length) {
    if (isCommand(tokens[index]!)) {
      command = tokens[index]!;
      index += 1;
    } else if (command === '' || command.toUpperCase() === 'Z') {
      // Numbers may only repeat the previous command's parameters.
      throw new Error(`Path data has a number without a command: ${d}`);
    }
    const type = command.toUpperCase();
    if (!pdfCommands.has(type))
      throw new Error(`Unsupported path command ${command} for PDF output`);
    const count = roles[type]!.length;
    const relative = command !== type;
    const parameters = tokens.slice(index, index + count);
    if (parameters.length < count || parameters.some(isCommand)) {
      throw new Error(`Path command ${command} needs ${count} numbers: ${d}`);
    }
    const values = parameters.map(Number);
    index += count;
    const px = (value: number) => (relative ? x + value : value);
    const py = (value: number) => (relative ? y + value : value);

    switch (type) {
      case 'M':
        x = px(values[0]!);
        y = py(values[1]!);
        startX = x;
        startY = y;
        output.push(`${format(x)} ${format(y)} m`);
        command = relative ? 'l' : 'L';
        break;
      case 'L':
        x = px(values[0]!);
        y = py(values[1]!);
        output.push(`${format(x)} ${format(y)} l`);
        break;
      case 'H':
        x = px(values[0]!);
        output.push(`${format(x)} ${format(y)} l`);
        break;
      case 'V':
        y = py(values[0]!);
        output.push(`${format(x)} ${format(y)} l`);
        break;
      case 'C': {
        const points = [
          px(values[0]!),
          py(values[1]!),
          px(values[2]!),
          py(values[3]!),
          px(values[4]!),
          py(values[5]!),
        ];
        x = points[4]!;
        y = points[5]!;
        output.push(`${points.map(format).join(' ')} c`);
        break;
      }
      case 'Z':
        x = startX;
        y = startY;
        output.push('h');
        break;
    }
  }
  return output.join('\n');
}

/** Full-precision numbers; PDF has no exponent notation. */
function format(value: number): string {
  const text = String(value);
  return /e/i.test(text) ? value.toFixed(12).replace(/\.?0+$/, '') : text;
}

function escape(text: string): string {
  return text.replace(/[\\()]/g, (character) => `\\${character}`);
}

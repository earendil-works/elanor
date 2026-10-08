import {type BrandId, gridUnit} from './config.js';
import {
  avatars,
  type ExportPlugin,
  favicons,
  guidelines,
  logoFiles,
  pngHeights,
  pressKits,
  print,
} from './scripts/exports/index.js';

/** Press kits, and the brands each one covers. The Earendil kit is the company kit with every brand. */
const kits = {
  earendil: ['earendil', 'pi', 'radius', 'lefos'],
  pi: ['pi'],
  radius: ['radius'],
  lefos: ['lefos'],
} satisfies Partial<Record<BrandId, BrandId[]>>;

/**
 * Everything the logo build exports besides the plain SVGs, as export plugins
 * from scripts/exports/. Plugins run in this order; press kits come last
 * because they bundle what the others write. To add a kind of output, add a
 * plugin and list it here.
 */
export const exportPlugins: ExportPlugin[] = [
  logoFiles({formats: ['svg', 'png'], png: {scale: 2, maxDimension: 4096}}),
  pngHeights({
    name: 'email-signature',
    select: {kinds: ['logo-wordmark-horizontal'], treatments: ['on-light']},
    heights: [32, 64],
  }),
  print({
    // White prints no ink, so on dark backgrounds it knocks out to the paper.
    profiles: {psoCoatedV3: 'FOGRA51', psoUncoatedV3: 'FOGRA52'},
    // The 560-unit symbol frame prints 40 mm wide by default; the PDFs are vectors and scale freely.
    millimetersPerUnit: 40 / 560,
  }),
  favicons({
    treatments: {light: 'monochrome-on-light', dark: 'monochrome-on-dark'},
    svgSize: 32,
    icoSizes: [16, 32, 48],
    appleTouchSize: 180,
    iconSizes: [192, 512],
    maskableSize: 512,
    padding: gridUnit,
    safeZone: 0.8,
  }),
  avatars({sizes: [400, 800], treatments: ['on-light', 'on-dark'], safeZone: 0.8}),
  guidelines({
    documents: kits,
    clearSpace: {
      kinds: ['logo', 'logo-wordmark-horizontal'],
      treatment: 'on-light',
      colors: {area: 'primitive.color.coralRed.100', grid: 'primitive.color.coralRed.500'},
      width: 1600,
    },
  }),
  pressKits({kits, include: ['guidelines/{kit}']}),
];

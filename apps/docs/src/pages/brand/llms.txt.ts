import type {APIRoute} from 'astro';
import {guidelinesMarkdown, loadLogos, text} from '../../lib/api.ts';

const kindLabels: Record<string, string> = {
  logo: 'Symbol',
  'logo-wordmark-horizontal': 'Horizontal lockup (symbol + wordmark)',
  'logo-wordmark-stacked': 'Stacked lockup (symbol + wordmark)',
};

export const GET: APIRoute = async () => {
  const manifest = await loadLogos();
  const brands = manifest.brands
    .map((brand) => {
      const assets = brand.assets
        .map((asset) => {
          const pdfs = Object.entries(asset.files.pdf ?? {}).map(([profile, url]) => `[PDF ${profile}](${url})`);
          const files = [`[SVG](${asset.files.svg})`, ...(asset.files.png ? [`[PNG](${asset.files.png})`] : []), ...pdfs];
          return `- ${kindLabels[asset.kind]}, ${asset.treatment} (${asset.width}×${asset.height}): ${files.join(', ')}`;
        })
        .join('\n');
      const favicons = Object.entries(brand.favicons ?? {})
        .map(([name, url]) => `[${name}](${url})`)
        .join(', ');
      const avatars = (brand.avatars ?? []).map((avatar) => `[${avatar.treatment} ${avatar.size}px](${avatar.path})`).join(', ');
      const pressKit = manifest.pressKits?.[brand.id];
      return `### ${brand.name}

Backgrounds: light \`${brand.backgrounds.light}\`, dark \`${brand.backgrounds.dark}\`.${pressKit ? ` [Press kit](${pressKit}).` : ''}

${assets}
- Favicons and web app icons: ${favicons}
- Avatars: ${avatars}`;
    })
    .join('\n\n');

  return text(`# Earendil brand: logos and guidelines

> How to choose, size, and place the Earendil, Pi, Radius, and Lefos logos, with a link to every file. Use only these files. Never redraw, recolor, stretch, or rearrange them.

## Choosing an asset

1. **Brand:** use the Earendil logo for the company and the product logo for a product.
2. **Kind:** a lockup (symbol + wordmark) when the name must be clear; the symbol alone in small or square spaces such as avatars and favicons. Use the stacked lockup where the horizontal one does not fit.
3. **Treatment:** \`on-light\` on light backgrounds and \`on-dark\` on dark ones. Use \`monochrome-on-light\` or \`monochrome-on-dark\` only when a single color is required.
4. **Format:** SVG for screens and anything that scales; PNG where SVG is not supported; the CMYK PDFs for print (\`psoCoatedV3\` for coated paper, \`psoUncoatedV3\` for uncoated). White monochrome logos have no print file: print them as unprinted paper or white ink.
5. **Clear space:** leave at least one grid unit around the whole asset. One grid unit is a quarter of the symbol frame; at a rendered height of *h* pixels it is *h* × ${manifest.gridUnit} / asset height (asset heights are listed below).
6. **Custom sizes or backgrounds:** scale the SVG; to place a logo on a solid background, use the brand's background color for the treatment and keep the clear space.

## Files

${brands}

## Brand guidelines

${(await guidelinesMarkdown()).replace(/^# .*\n+/, '').replace(/^## /gm, '### ')}`);
};

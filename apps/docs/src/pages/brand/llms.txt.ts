import type {APIRoute} from 'astro';
import {guidelinesMarkdown, loadLogos, text} from '../../lib/api.ts';

const kindLabels: Record<string, string> = {
  logo: 'Symbol',
  'logo-wordmark-horizontal': 'Horizontal lockup (symbol + wordmark)',
  'logo-wordmark-vertical': 'Vertical lockup (symbol + wordmark)',
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

  const names = manifest.brands.map((brand) => brand.name);
  return text(`# Brand: logos and guidelines

> Every logo file for ${names.slice(0, -1).join(', ')}, and ${names.at(-1)}, followed by the brand guidelines, which explain how to choose, size, and place them. Use only these files.

## Files

${brands}

## Brand guidelines

${(await guidelinesMarkdown()).replace(/^# .*\n+/, '').replace(/^## /gm, '### ')}`);
};

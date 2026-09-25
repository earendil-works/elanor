# `@earendil-works/elanor-logos`

Earendil, Pi, Radius, and Lefos logos as SVG files, built from clean sources and the logo color tokens. React components live in [`@earendil-works/elanor-logos-react`](./react/README.md).

## Sources

`sources/<brand>/` holds each brand's `mark`, optional `mark-monochrome` (brands without one use their mark), `wordmark`, and `wordmark-small`, transferred from the Figma logo components. A source contains only paths; each fill links to a logo token, for example `fill="{semantic.color.logo.symbol.1}"`. The build replaces the links with color values, so outputs are plain SVGs.

[`config.ts`](./config.ts) defines the source parts, brands, color treatments, logo tokens, clear space, and lockup rules. Lockups are composed like the Figma auto layout, and each lockup rule adds a `logo-wordmark-<lockup>` asset kind. Paths are only moved into place, with exact decimal arithmetic, so geometry is unchanged.

## Exports

[`exports.config.ts`](./exports.config.ts) lists everything else the build produces: PNGs, CMYK print PDFs, favicons and web app icons, avatars, email-signature images, and per-brand press kits with the [brand guidelines](./guidelines/BRAND-GUIDELINES.md). Each entry is handled by the exporter for its `type` in `scripts/lib/exporters.ts`.

```sh
pnpm build   # SVGs, manifest.json, artwork.json, kits/<brand>/…, press-kits/*.zip
pnpm check   # sources are clean and link to existing logo tokens
pnpm test
```

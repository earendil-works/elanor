# `@earendil-works/elanor-logos`

Earendil, Pi, Radius, and Lefos logos as SVG files, built from clean sources and the logo color tokens. React components live in [`@earendil-works/elanor-logos-react`](./react/README.md).

## Sources

`sources/<brand>/` holds each brand's `mark`, optional `mark-monochrome` (brands without one use their mark), `wordmark`, and `wordmark-small`, transferred from the Figma logo components. A source contains only paths; each fill links to a logo token, for example `fill="{semantic.color.logo.symbol.1}"`. The build replaces the links with color values, so outputs are plain SVGs.

[`config.ts`](./config.ts) defines the source parts, brands, color treatments, logo tokens, clear space, and lockup rules. Lockups are composed like the Figma auto layout, and each lockup rule adds a `logo-wordmark-<lockup>` asset kind. Paths are only moved into place, with exact decimal arithmetic, so geometry is unchanged.

## Exports

[`exports.config.ts`](./exports.config.ts) lists everything else the build produces as export plugins with their options: PNGs, CMYK print PDFs, favicons and web app icons, avatars, email-signature images, brand guidelines, and press kits. Each plugin lives in [`scripts/exports/`](./scripts/exports/) and receives a shared context with the composed assets, per-brand tokens, and the manifest. Plugins run in the listed order, so press kits come last and bundle what the others wrote. To add a kind of output, add a plugin and list it in the config.

Brand guidelines are generated per press kit from [`guidelines/template.md`](./guidelines/template.md) and a short description of each brand in [`guidelines/brands/`](./guidelines/brands/). Product kits get their own guidelines; the Earendil kit gets a company document covering every brand. Each document comes with a clear-space illustration drawn from the built artwork and the grid in `config.ts`, so it stays current when logos or tokens change.

```sh
pnpm build   # SVGs, manifest.json, artwork.json, kits/<brand>/…, guidelines/<kit>/…, press-kits/*.zip
pnpm check   # sources are clean and link to existing logo tokens
pnpm test
```

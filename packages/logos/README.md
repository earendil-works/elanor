# `@earendil-works/elanor-logos`

Earendil, Pi, Radius, and Lefos logos as SVG files, built from clean sources and the logo color tokens. React components live in [`@earendil-works/elanor-logos-react`](./react/README.md).

## Sources

`sources/<brand>/` holds each brand's `mark`, optional `mark-monochrome`, `wordmark`, and `wordmark-small`, transferred from the Figma logo components. A source contains only paths; each fill links to a token, for example `fill="{semantic.color.logo.symbol.1}"`. The build replaces the links with color values, so outputs are plain SVGs.

Lockups are composed like the Figma auto layout, using the rules in [`config.ts`](./config.ts). Paths are only moved into place, with exact decimal arithmetic, so geometry is unchanged.

```sh
pnpm build   # dist/svg/<brand>/<brand>-<kind>-<treatment>.svg, manifest.json, artwork.json
pnpm check   # sources are clean and link to existing logo tokens
pnpm test
```

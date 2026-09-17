# `@earendil-works/elanor-icons`

Deterministically hand-drawn Material Symbols, published as standalone SVG files and tree-shakeable React components. The package has no runtime processing or icon registry.

## Use

```tsx
import {SearchIcon} from "@earendil-works/elanor-icons/react";
// Or import only its module:
import {SearchIcon} from "@earendil-works/elanor-icons/react/search";

<SearchIcon size={24} aria-label="Search" />;
```

Components forward refs, accept standard SVG props, use `currentColor`, and default to 16px. An unnamed icon is decorative (`aria-hidden`); `aria-label` or `aria-labelledby` gives it `role="img"`.

```ts
import searchUrl from "@earendil-works/elanor-icons/svg/search.svg";
```

SVGs have explicit black fills and ordinary paths, so they work in `<img>`, CSS masks, and Figma imports. React and SVG outputs are generated from the same final path data and viewBox.

## Artwork and pipeline

`sources/*.svg` is the sole inventory. It contains unchanged Google Material Symbols Outlined masters at weight 400, fill 0, grade 0, and 20px optical size. Builds are offline; provenance is pinned in [`provenance.json`](./provenance.json). See [`LICENSE`](./LICENSE) and [`NOTICE`](./NOTICE).

[`config.ts`](./config.ts) is the single typed configuration file. Each stage is independently disableable:

1. Parse the deliberately narrow vendored SVG subset with `fast-xml-parser` and parse/sample paths with `svg-pathdata` and `svg-path-properties`.
2. Sample in display-pixel units and bake seeded, coherent multi-octave Perlin displacement into path points.
3. Apply Ramer-Douglas-Peucker simplification with a point-to-segment error bound. Closed contours are simplified independently; collapsed or winding-reversed results are rejected. This is not described as generally topology-preserving.
4. Run a conservative SVGO `convertPathData` pass once, then generate both formats from that final geometry.

The default simplification tolerance is 0.01px at 16px, equivalent to 0.07px at 112px.

## Commands

```sh
pnpm build   # generate dist/svg and dist/react
pnpm check   # type-check and validate the vendored subset
pnpm test    # build, then run focused tests
```

Only `dist`, this README, and the license/provenance files are published. Sources, scripts, configuration, and processing dependencies are development-only.

## Refresh sources

Refresh the pinned revision from the network:

```sh
pnpm refresh
```

Or use an already checked-out upstream repository (its HEAD must equal the requested revision):

```sh
MATERIAL_ICONS_REPO=/path/to/material-design-icons pnpm refresh
```

To intentionally move upstream, pass a full commit hash:

```sh
pnpm refresh -- 0123456789abcdef0123456789abcdef01234567
```

The script replaces `sources/`, copies the upstream license, and updates the one provenance record. Review upstream notices, this package's `NOTICE`, and the resulting inventory before committing.

## Collection size

Gzip numbers are the sum of compressing each SVG independently at level 9, **not** one archive.

| SVG collection | Raw | Gzipped, individual-file total |
| --- | ---: | ---: |
| Vendored source input | 2,271,663 B (2.17 MiB) | 1,378,985 B (1.32 MiB) |
| Boiled sampled paths, before simplification/SVGO | 92,471,843 B (88.19 MiB) | 42,978,149 B (40.99 MiB) |
| Final, after simplification and SVGO | 18,150,836 B (17.31 MiB) | 9,176,638 B (8.75 MiB) |

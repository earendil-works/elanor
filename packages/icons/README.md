# `@earendil-works/elanor-icons`

Material Symbols Outlined (20px, weight 400) as SVG files. React components are published separately as [`@earendil-works/elanor-icons-react`](./react/README.md).

```ts
import searchUrl from '@earendil-works/elanor-icons/svg/search.svg';
import metadata from '@earendil-works/elanor-icons/metadata.json'; // search tags keyed by public icon name
```

Icons are 20px, Material's own size, including its margin around the glyph.

## Plain or boiled

[`@earendil-works/elanor-icons-boiled`](../icons-boiled/README.md) has the same icons with a hand-drawn “boil”, and [`@earendil-works/elanor-icons-boiled-react`](../icons-boiled/react/README.md) their React components. The packages have the same exports, so switching is a matter of the package name. To switch the icons inside `@earendil-works/elanor-react` too, redirect the dependency in your application, for example with pnpm:

```json
{
  "pnpm": {
    "overrides": {
      "@earendil-works/elanor-icons-react": "npm:@earendil-works/elanor-icons-boiled-react@^0.1.0"
    }
  }
}
```

npm uses `overrides` and Yarn `resolutions` the same way. A bundler alias (such as Vite's `resolve.alias`) works too if it points at the boiled package's files, since `@earendil-works/elanor-react` cannot resolve the boiled package by name.

## Development

```sh
pnpm build    # sources/ -> dist/svg and metadata.json (requires tags for every icon)
pnpm check    # validate SVGs and complete, nonempty search tags
pnpm test     # pipeline, geometry, and metadata tests
pnpm refresh  # re-vendor sources/ from the revision in provenance.json
```

This package holds the build for both icon packages; `@earendil-works/elanor-icons-boiled` runs it with the boil. Pipeline settings live in [`config.ts`](./config.ts). See [`LICENSE`](./LICENSE) and [`NOTICE`](./NOTICE).

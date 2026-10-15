# `@earendil-works/elanor-icons`

Material Symbols Outlined (20px, weight 400) with a hand-drawn “boil”, as SVG files. React components are published separately as [`@earendil-works/elanor-icons-react`](./react/README.md).

```ts
import searchUrl from '@earendil-works/elanor-icons/svg/search.svg';
import unboiledSearchUrl from '@earendil-works/elanor-icons/unboiled/svg/search.svg'; // without the boil
import metadata from '@earendil-works/elanor-icons/metadata.json'; // search tags keyed by public icon name
```

Icons are 20px, Material's own size, including its margin around the glyph.

## Development

```sh
pnpm build    # sources/ -> dist/svg and metadata.json (requires tags for every icon)
pnpm check    # validate SVGs and complete, nonempty search tags
pnpm test     # pipeline, geometry, and metadata tests
pnpm refresh  # re-vendor sources/ from the revision in provenance.json
```

Pipeline settings live in [`config.ts`](./config.ts). See [`LICENSE`](./LICENSE) and [`NOTICE`](./NOTICE).

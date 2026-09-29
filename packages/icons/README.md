# `@earendil-works/elanor-icons`

Material Symbols Outlined (20px, weight 400) with a hand-drawn “boil”, as SVG files. React components are published separately as [`@earendil-works/elanor-icons-react`](./react/README.md).

```ts
import searchUrl from '@earendil-works/elanor-icons/svg/search.svg';
```

## Development

```sh
pnpm build    # sources/ -> dist/svg
pnpm test
pnpm refresh  # re-vendor sources/ from the revision in provenance.json
```

Pipeline settings live in [`config.ts`](./config.ts). See [`LICENSE`](./LICENSE) and [`NOTICE`](./NOTICE).

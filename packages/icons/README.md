# `@earendil-works/elanor-icons`

Material Symbols Outlined (20px, weight 400) with a hand-drawn “boil”, as SVG files and React components.

```tsx
import {SearchIcon} from '@earendil-works/elanor-icons/react/search';
import searchUrl from '@earendil-works/elanor-icons/svg/search.svg';

<SearchIcon aria-label="Search" />;
```

React icons use `currentColor`. They're decorative unless labelled.

## Development

```sh
pnpm build    # sources/ -> dist/
pnpm test
pnpm refresh  # re-vendor sources/ from the revision in provenance.json
```

Pipeline settings live in [`config.ts`](./config.ts). See [`LICENSE`](./LICENSE) and [`NOTICE`](./NOTICE).

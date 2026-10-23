# `@earendil-works/elanor-fonts`

Self-hosted Earendil, Commit Mono, and DepartureMono fonts with `@font-face` CSS.

```sh
pnpm add @earendil-works/elanor-fonts
```

Import once at the application entry:

```ts
import '@earendil-works/elanor-fonts/earendil.css';
import '@earendil-works/elanor-fonts/commit-mono.css';
```

| Export               | CSS family      | Weights       | Styles         |
| -------------------- | --------------- | ------------- | -------------- |
| `earendil.css`       | `Earendil`      | 400, 700      | normal, italic |
| `commit-mono.css`    | `Commit Mono`   | 300, 400, 700 | normal         |
| `departure-mono.css` | `DepartureMono` | 400           | normal         |

DepartureMono is the Lefos mono font. Import it only in apps that use the Lefos tokens. It has one weight, so browsers synthesize bold.

CSS uses relative URLs and `font-display: swap`. Without a bundler, serve the CSS and `files/` directory together.

For preloading or custom CSS, import `@earendil-works/elanor-fonts/files/<filename>`. Commit Mono also ships its original `.otf` files for desktop installs; the CSS uses WOFF2.

All families use SIL OFL 1.1. Include the matching file from `licenses/` when redistributing them.

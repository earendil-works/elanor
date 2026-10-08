# `@earendil-works/elanor-fonts`

Self-hosted font files and `@font-face` declarations. No JavaScript, tokens or global typography rules.

```sh
pnpm add @earendil-works/elanor-fonts
```

Import the required families once at the application entry:

```ts
import '@earendil-works/elanor-fonts/earendil.css';
import '@earendil-works/elanor-fonts/commit-mono.css';
```

| Export            | CSS family    | Weights       | Styles         |
| ----------------- | ------------- | ------------- | -------------- |
| `earendil.css`    | `Earendil`    | 400, 700      | normal, italic |
| `commit-mono.css` | `Commit Mono` | 300, 400, 700 | normal         |

CSS uses relative URLs and `font-display: swap`. Bundlers must support CSS asset URLs. Without a bundler, serve the CSS and adjacent `files/` directory together.

Raw assets are exported as `@earendil-works/elanor-fonts/files/<filename>` for custom loading or preloading. No conversion or build step is required; the existing WOFF2 and OpenType files are preserved.

Both families use SIL OFL 1.1. Copyright notices and complete licenses are in `licenses/earendil.txt` and `licenses/commit-mono.txt`; include them when redistributing the fonts.

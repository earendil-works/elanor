# `@earendil-works/elanor-fonts`

Self-hosted Earendil, Commit Mono and Source Sans 3 fonts with `@font-face` CSS.

```sh
pnpm add @earendil-works/elanor-fonts
```

Import once at the application entry:

```ts
import '@earendil-works/elanor-fonts/earendil.css';
import '@earendil-works/elanor-fonts/commit-mono.css';
import '@earendil-works/elanor-fonts/source-sans.css';
```

| Export            | CSS family      | Weights            | Styles         |
| ----------------- | --------------- | ------------------ | -------------- |
| `earendil.css`    | `Earendil`      | 400, 700           | normal, italic |
| `commit-mono.css` | `Commit Mono`   | 300, 400, 700      | normal         |
| `source-sans.css` | `Source Sans 3` | 200–900 (variable) | normal, italic |

CSS uses relative URLs and `font-display: swap`. Without a bundler, serve the CSS and `files/` directory together.

For preloading or custom CSS, import `@earendil-works/elanor-fonts/files/<filename>`.

All families use SIL OFL 1.1. Include `licenses/earendil.txt`, `licenses/commit-mono.txt` and `licenses/source-sans.txt` when redistributing them.

Source Sans 3 is Adobe's humanist sans, version 3.052, from Google Fonts (`google/fonts`, `ofl/sourcesans3`): the variable TrueType fonts converted to WOFF2 without other changes.

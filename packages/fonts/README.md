# `@earendil-works/elanor-fonts`

Self-hosted Earendil, Commit Mono and Elanor Sans fonts with `@font-face` CSS.

```sh
pnpm add @earendil-works/elanor-fonts
```

Import once at the application entry:

```ts
import '@earendil-works/elanor-fonts/earendil.css';
import '@earendil-works/elanor-fonts/commit-mono.css';
import '@earendil-works/elanor-fonts/elanor-sans.css';
```

| Export            | CSS family    | Weights            | Styles         |
| ----------------- | ------------- | ------------------ | -------------- |
| `earendil.css`    | `Earendil`    | 400, 700           | normal, italic |
| `commit-mono.css` | `Commit Mono` | 300, 400, 700      | normal         |
| `elanor-sans.css` | `Elanor Sans` | 200–900 (variable) | normal, italic |

CSS uses relative URLs and `font-display: swap`. Without a bundler, serve the CSS and `files/` directory together.

For preloading or custom CSS, import `@earendil-works/elanor-fonts/files/<filename>`.

All families use SIL OFL 1.1. Include `licenses/earendil.txt`, `licenses/commit-mono.txt` and `licenses/elanor-sans.txt` when redistributing them.

Elanor Sans is Source Sans 3 (Adobe's humanist sans, version 3.052, from Google Fonts: `google/fonts`,
`ofl/sourcesans3`) with a shorter natural line height: ascent 937 and descent 313 instead of 1024 and 400 (1.25
instead of 1.424). Safari does not lay out a text input's line shorter than the font's natural line height, so with
Source Sans 3 an Input came out taller than a Button beside it. The baseline does not move (ascent minus descent is
unchanged), and every Latin glyph still fits. `scripts/elanor-sans.py` derives it (Python, `pip install fonttools
brotli`). The license reserves the name "Source", hence the new name.

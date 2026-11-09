# `@earendil-works/elanor-fonts`

Self-hosted Simbelle Serif, Simbelle Sans, Simbelle Mono, and DepartureMono fonts with `@font-face` CSS.

```sh
npm install @earendil-works/elanor-fonts
```

Import once at the application entry:

```ts
import '@earendil-works/elanor-fonts/simbelle-serif.css';
import '@earendil-works/elanor-fonts/simbelle-sans.css';
import '@earendil-works/elanor-fonts/simbelle-mono.css';
```

| Export               | CSS family       | Weights | Styles         |
| -------------------- | ---------------- | ------- | -------------- |
| `simbelle-serif.css` | `Simbelle Serif` | 400–700 | normal, italic |
| `simbelle-sans.css`  | `Simbelle Sans`  | 100–900 | normal, italic |
| `simbelle-mono.css`  | `Simbelle Mono`  | 200–700 | normal, italic |
| `departure-mono.css` | `DepartureMono`  | 400     | normal         |

Simbelle Serif and Simbelle Mono are variable fonts: one file per style covers every weight. Simbelle Sans has one file per weight (100, 200, … 900); a weight in between uses the nearest file (550 uses 600). They are built in the [Simbelle repository](https://github.com/earendil-works/simbelle) (`fonts/web`, copied here unchanged), which also keeps the original files they are made from. Simbelle Sans is an interim stand-in for our own sans, made from Lato; Simbelle Mono is Commit Mono, adjusted to sit evenly in Simbelle Serif text. Both match Simbelle Serif's x-height.

All Simbelle fonts have the same line metrics: their natural line height is 1.3, with capitals centred in the line, so mixed text and boxes line up.

Both families also cover Greek, Cyrillic, Vietnamese, and Arabic with extra files, made from open-source fonts to match them (EB Garamond and Noto Naskh Arabic for Simbelle Serif, Noto Sans Arabic for Simbelle Sans). Each file has a `unicode-range`, so the browser downloads it only when a page uses its characters; an English page loads the Latin files only.

`simbelle-serif.css` also defines `Simbelle Serif Fallback`: Georgia from the device, resized to Simbelle Serif's line length and line height, so text doesn't move when Simbelle Serif arrives. Put it right after `Simbelle Serif` in a font stack, as the design tokens do.

DepartureMono is the Lefos mono font. Import it only in apps that use the Lefos tokens. It has one weight, so browsers synthesize bold.

CSS uses relative URLs and `font-display: swap`. Without a bundler, serve the CSS and `files/` directory together.

For preloading or custom CSS, import `@earendil-works/elanor-fonts/files/<filename>`.

All families use SIL OFL 1.1. Include the matching file from `licenses/` when redistributing them.

# `@earendil-works/elanor-fonts`

Self-hosted Mallos Serif, Mallos Sans, Mallos Mono, and DepartureMono fonts with `@font-face` CSS.

```sh
npm install @earendil-works/elanor-fonts
```

Import once at the application entry:

```ts
import '@earendil-works/elanor-fonts/mallos-serif.css';
import '@earendil-works/elanor-fonts/mallos-sans.css';
import '@earendil-works/elanor-fonts/mallos-mono.css';
```

| Export               | CSS family      | Weights | Styles         |
| -------------------- | --------------- | ------- | -------------- |
| `mallos-serif.css`   | `Mallos Serif`  | 400–700 | normal, italic |
| `mallos-sans.css`    | `Mallos Sans`   | 100–900 | normal, italic |
| `mallos-mono.css`    | `Mallos Mono`   | 200–700 | normal, italic |
| `departure-mono.css` | `DepartureMono` | 400     | normal         |

Mallos Serif and Mallos Mono are variable fonts: one file per style covers every weight. Mallos Sans has one file per weight (100, 200, … 900); a weight in between uses the nearest file (550 uses 600). They are built in the [Mallos repository](https://github.com/earendil-works/mallos) (`fonts/web`, copied here unchanged), which also keeps the original files they are made from. Mallos Sans is an interim stand-in for our own sans, made from Lato; Mallos Mono is Commit Mono, adjusted to sit evenly in Mallos Serif text. Both match Mallos Serif's x-height.

All Mallos fonts have the same line metrics: their natural line height is 1.3, with capitals centred in the line, so mixed text and boxes line up.

Both families also cover Greek, Cyrillic, Vietnamese, and Arabic with extra files, made from open-source fonts to match them (EB Garamond and Noto Naskh Arabic for Mallos Serif, Noto Sans Arabic for Mallos Sans). Each file has a `unicode-range`, so the browser downloads it only when a page uses its characters; an English page loads the Latin files only.

`mallos-serif.css` also defines `Mallos Serif Fallback`: Georgia from the device, resized to Mallos Serif's line length and line height, so text doesn't move when Mallos Serif arrives. Put it right after `Mallos Serif` in a font stack, as the design tokens do.

DepartureMono is the Lefos mono font. Import it only in apps that use the Lefos tokens. It has one weight, so browsers synthesize bold.

CSS uses relative URLs and `font-display: swap`. Without a bundler, serve the CSS and `files/` directory together.

For preloading or custom CSS, import `@earendil-works/elanor-fonts/files/<filename>`.

All families use SIL OFL 1.1. Include the matching file from `licenses/` when redistributing them.

# `@earendil-works/elanor-strokes`

Brush stroke outlines as CSS and vector masks, for brands whose look uses them. Each style is built per brand; import the brand's build after its design tokens:

```css
@import '@earendil-works/design-tokens/radius.css';
@import '@earendil-works/elanor-strokes/pencil/radius.css';
```

Strokes implement the outline contract the Elanor components follow, so components need no stroke-specific code:

```html
<button data-outline="box-small">Save</button>
<hr data-outline="line">
```

- **Shapes:** generated from the brand's tokens: `box-<radius>` (small, medium, large), `pill-<height>` (x-small, small, medium, large; the element must be that height), `circle-<size>` (x-small, small), `line`, and `line-vertical`.
- **Inside the edge:** a stroke lies within a band inside the element's edge (the border-width tokens: `default` normally, `large` while focused), so the element's size, which follows the pixel grid, includes it. A shape's rough brush edge faces out and wobbles within the band; its smooth edge faces in and always reaches past the band by an overlap (`overlap` in the config), over the element's background, with a solid core under the stroke, so no seam shows between the two.
- **Border band:** a shape owns a border as wide as the band. In stroke mode the border is transparent and the background stops at it (`--outline-background-clip: padding-box`), so a stroke in the background's color still draws the edge; its padding subtracts the band. Outlines that only ever show focus, like text links, opt out with `data-outline-band="none"`.
- **Color:** set `--outline-color` (default `--semantic-color-border-primary`), for example on `:hover`. Focus uses `--outline-focus-color` and the wider band.
- **Edges:** `data-outline-edge="block-start"`/`"block-end"` (or `"inline-start"`/`"inline-end"` for `line-vertical`) puts a line inside one edge of a larger element.
- **Focus:** a wrapper shows focus when its direct child is focused, and an outlined element shows it when its parent is focused. `data-outline-focus="none"` opts out, for elements like popups that receive focus without showing it.
- **Plain look:** components paint their plain border and separator fill in the colors `--outline-plain-border` and `--outline-plain-fill`, and their focus ring with `--outline-plain-focus`; a stroke style turns them off.
- **Marks:** the style also draws marks inside controls, a check, a dash, and a dot (radio dots, switch knobs), as inline masks in `--mark-check`, `--mark-dash`, and `--mark-dot`. Components paint a mark in a color and mask it with `mask-image: var(--mark-check, <their plain check>)`, so without a style their plain mark shows.
- **Variants:** siblings cycle through the variants; `data-stroke-variant="0"`–`"3"` picks one.
- **Scoped:** `<style>/<brand>.scoped.css` applies only inside `[data-strokes="<style>"]`, for switching styles on a page.

## Development

[`config.ts`](./config.ts) defines brushes and styles: the source brush and how it is evened out, the brands a style is built for, the bands and their overlap with the background, variants, seed, pressure variation, which tokens size each shape, and the marks.

```sh
pnpm build   # dist/<style>/<brand>.css, .scoped.css, .json, and dist/<style>/<brand>/*.svg
pnpm test
```

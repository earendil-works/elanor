# `@earendil-works/elanor-strokes`

Brush stroke outlines as CSS and vector masks. Import a style after the design tokens:

```css
@import '@earendil-works/design-tokens/radius.css';
@import '@earendil-works/elanor-strokes/pencil.css';
```

```html
<button data-stroke="box-small">Save</button>
<hr data-stroke="line">
```

Shapes are generated from the brand's tokens: `box-<radius>` (small, medium, large), `pill-<height>` (small, medium, large; the element must be that height), `circle-<size>` (x-small, small), `line`, and `line-vertical`. The stroke is centered on the element's edge on an `::after` layer, so layout and padding don't change and the fill ends beneath it.

- **Color:** set `--stroke-color` (default `--semantic-color-border-primary`), for example on `:hover`. Focus uses `--stroke-focus-color` and a thicker stroke in the same position.
- **Variants:** siblings cycle through the variants; `data-stroke-variant="0"`–`"3"` picks one.

## Development

[`config.ts`](./config.ts) defines brushes and styles: the source brush and how it is evened out, stroke widths, variants, seed, pressure variation, and which tokens size each shape.

```sh
pnpm build   # dist/<style>.css, dist/<style>.json, dist/<style>/*.svg
pnpm test
```

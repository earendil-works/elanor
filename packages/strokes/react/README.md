# `@earendil-works/elanor-strokes-react`

Optional Radius pencil styling for Elanor components. Imports the required CSS and references its SVG masks.

## Usage

```tsx
import '@earendil-works/design-tokens/radius.css';
import {AppearanceProvider, Button} from '@earendil-works/elanor-react';
import {PencilAppearance, PencilStrokeOutline} from '@earendil-works/elanor-strokes-react';

<PencilAppearance>
  <Button>Save</Button>
  <AppearanceProvider>
    <Button>Plain</Button>
  </AppearanceProvider>
</PencilAppearance>

<PencilStrokeOutline radius="medium" variant={2}>
  <p>A pencil panel</p>
</PencilStrokeOutline>
```

## Behavior

- `PencilAppearance` styles supported component parts and default indicators without adding a DOM wrapper. Nested `AppearanceProvider` restores plain rendering.
- Scope follows React ancestry through portals. Separate roots need their own providers; fonts, tokens and color scheme must cover the portal destination.
- `PencilStrokeOutline` renders a `div` with HTML props/ref support. It owns its fill and border, participates in layout, and does not style descendants. Radius: `small | medium | large`; variant: `0 | 1 | 2 | 3`.
- Custom indicator children or `render` own their glyph. Class/style/ref customization retains default glyphs. For pencil surfaces with ordinary indicators, pass the exported `pencilSurfaceClassName` to `AppearanceProvider` without an indicator class.
- Opted-in surfaces reserve `::after`. Generated masks require matching Radius sizes, radii and border widths; rebuild geometry for different tokens.
- Pencil boxes use mask-based focus; lines, forced colors and unsupported browsers retain ordinary focus.

## Assets

Ship the CSS and SVG masks together and permit their URLs in CSP. Missing masks can remove pencil borders and focus; there is no runtime availability fallback.

Do not combine this adapter with `radius.css` or `radius.scoped.css` from the strokes package: their global/ancestor selectors bypass provider scope.

# Application setup

## Fonts and tokens

Install `@earendil-works/elanor-fonts` alongside the brand tokens. Import the font faces and one brand stylesheet at the application entry:

```ts
import '@earendil-works/elanor-fonts/earendil.css';
import '@earendil-works/elanor-fonts/commit-mono.css';
import '@earendil-works/design-tokens/radius.css';
```

## Portals

Follow [Base UI's portal setup](https://base-ui.com/react/overview/quick-start):

```css
body {
  position: relative;
}

.appRoot {
  isolation: isolate;
}
```

`Layout.Root` already provides isolation without clipping. Keep portals outside the isolated root;
custom containers and stacking order are application-owned. Scoped themes must
also cover the portal container.

## Page composition

Use `Layout.Root` with optional `Header`, `Body`, `Aside`, `Main`, and `Footer`
children. A header/main/footer page does not need `Body`. Supply exactly one
main landmark per document; use `Layout.Main render={<div />}` for embedded
previews inside an existing main. `Page` remains a non-landmark content group.

Place `Container` inside Main to center content in the space left after any
asides. Its default content cap is 1216px plus 16px gutters on each side;
`width="full"` removes the cap while retaining gutters. Content Grid belongs
inside Container, not around the sidebar. Recipes live on the Layout and
Container documentation pages rather than in exported app-specific components.

Layout keeps document scrolling and does not clip its root. At the shared
`semantic.dimension.breakpoint.medium` viewport threshold, Body becomes a row
and Aside becomes sticky with a viewport-height scroll limit. Below it, regions
stack in source order. Keep navigation visible until a mobile navigation
pattern is explicitly supplied by the application.

Header is non-sticky by default. Opt in through ordinary styling and, if an
Aside is also sticky, set its `insetBlockStart` and `maxBlockSize` to account for
the actual header size. The Layout recipe demonstrates a fixed-size header
using an existing semantic size token and responsive CSS. No layout measurement
or private custom property is required. Leave dynamically sized headers in
normal flow rather than guessing their height. Avoid overflow/containment on
ancestors that unintentionally change the sticky scrollport.

## RTL

Set `<html dir="rtl">` and wrap the application:

```tsx
import {DirectionProvider} from '@earendil-works/elanor-react';

<DirectionProvider direction="rtl">
  <App />
</DirectionProvider>;
```

The provider controls keyboard and positioning behavior; DOM direction controls
CSS layout. For mixed-direction regions, set `dir` on portaled popups too.

## Server components

Elanor does not declare client boundaries. In React Server Components apps,
import interactive components from an application-owned client component.

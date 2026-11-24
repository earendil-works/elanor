# Application setup

## Styles, fonts and tokens

Import the component stylesheet, font faces and one brand stylesheet once, in your app's entry module, such as `main.tsx` or the root layout:

```ts
import '@earendil-works/elanor-fonts/mallos-serif.css';
import '@earendil-works/elanor-fonts/commit-mono.css';
import '@earendil-works/design-tokens/radius.css';
import '@earendil-works/elanor-react/elanor.min.css';
```

`elanor.min.css` contains all component styles. Component JavaScript does not load CSS; fonts and tokens remain separate.

### Cascade layers

Component styles live in the `elanor` cascade layer: `elanor.components`, then `elanor.prose`, so long-form spacing wins over the components' own resets. Unlayered CSS always wins over layered CSS, so your unlayered styles override Elanor's regardless of selector specificity or load order, and a `className` on a component needs no extra specificity.

If you use cascade layers too, name Elanor's layer in your order statement before your own, for example:

```css
@layer reset, elanor, app;
```

A broad unlayered rule such as `* { margin: 0 }` or `p { margin-block: 1em }` also wins over Elanor; scope global rules or put them in a layer before `elanor`.

## Portals

Popups render in a portal at the end of `body`. Follow [Base UI's portal setup](https://base-ui.com/react/overview/quick-start): give `body` `position: relative`, so backdrops cover the whole viewport in iOS Safari, and isolate the element that wraps your app, so popups stack above everything in it:

```tsx
<body>
  <div className="appRoot">{children}</div>
</body>
```

```css
body {
  position: relative;
}

.appRoot {
  isolation: isolate;
}
```

When `Layout.Root` is the element that wraps your app, leave out `.appRoot`: Layout.Root is already isolated, without clipping. Keep `body { position: relative }` either way. Elanor doesn't set up custom portal containers or stacking order; if you pass a `container` to a Portal, keep it outside the isolated element. Scoped themes must also cover the portal container.

## Page composition

Use `Layout.Root` with optional `Header`, `Body`, `Aside`, `Main`, and `Footer`. Supply one main landmark per document; use `Layout.Main render={<div />}` inside an existing main. `Page` is a non-landmark content group.

Place `Container` inside Main and content Grid inside Container, separate from sidebars. Container caps content at `semantic.dimension.size.maxWidth.content.large` (1216px) with 16px inline gutters; `width="full"` removes the cap, not the gutters.

Layout uses document scrolling. From `semantic.dimension.breakpoint.medium` (64rem), asides are sticky; below it, regions stack in source order. On small screens, keep navigation visible or offer it in a Drawer ([responsive navigation](/components/top-navigation.md#responsive-navigation)). For composition and sticky-header offsets, see [Layout](/components/layout.md).

## RTL

Set `<html dir="rtl">` and wrap your root component:

```tsx
import {DirectionProvider} from '@earendil-works/elanor-react';

<DirectionProvider direction="rtl">
  <App />
</DirectionProvider>;
```

The provider controls keyboard and positioning behavior; DOM direction controls CSS layout. For mixed-direction regions, set `dir` on portaled popups too.

## Server components

Elanor does not declare client boundaries. With React Server Components, import interactive components from your own `'use client'` module.

## Static pages

A static page is rendered on the server and runs no React in the browser. Components that work there have a behavior, such as `createModal`, and many have static parts, such as `Modal.StaticRoot`. Render the static parts, or the component where it has none, on the server; then bind the behaviors with `enhance` once the page has loaded. Each component's "Static pages" section lists its parts and behaviors:

```ts
import {createModal, enhance} from '@earendil-works/elanor-react';

enhance({modal: createModal});
```

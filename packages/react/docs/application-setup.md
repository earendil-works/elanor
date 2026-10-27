# Application setup

## Styles, fonts and tokens

Import the component stylesheet, font faces and one brand stylesheet once at the application entry:

```ts
import '@earendil-works/elanor-fonts/mallos-serif.css';
import '@earendil-works/elanor-fonts/commit-mono.css';
import '@earendil-works/design-tokens/radius.css';
import '@earendil-works/elanor-react/elanor.min.css';
```

`elanor.min.css` contains all component styles. Component JavaScript does not load CSS; fonts and tokens remain separate.

### Cascade layers

Component styles live in the `elanor` cascade layer: `elanor.components`, then `elanor.prose`, so long-form spacing wins over the components' own resets. Unlayered CSS always wins over layered CSS, so your application's styles override Elanor's regardless of selector specificity or load order, and a `className` on a component needs no extra specificity.

If your application uses layers too, name Elanor's layer in your order statement before your own, for example:

```css
@layer reset, elanor, app;
```

A broad unlayered rule such as `* { margin: 0 }` or `p { margin-block: 1em }` also wins over Elanor; scope global rules or put them in a layer before `elanor`.

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

Use `Layout.Root` with optional `Header`, `Body`, `Aside`, `Main`, and `Footer`.
Supply one main landmark per document; use `Layout.Main render={<div />}` inside
an existing main. `Page` is a non-landmark content group.

Place `Container` inside Main and content Grid inside Container, separate from
sidebars. Container caps content at `semantic.dimension.size.maxWidth.content.large`
(1216px) with 16px inline gutters; `width="full"` removes the cap, not the gutters.

Layout uses document scrolling. From `semantic.dimension.breakpoint.medium` (64rem),
asides are sticky; below it, regions stack in source order. Keep navigation visible unless the application
provides a mobile alternative. For composition and sticky-header offsets, see
the [Layout recipes](../src/layout/layout.mdx).

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

# `@earendil-works/elanor-react`

React components built with Base UI 1.8 and CSS Modules.

## Install

```sh
pnpm add @earendil-works/elanor-react react react-dom
```

React and React DOM are peers; Base UI is included. The consumer's bundler must support CSS Modules in dependencies.

Install `@earendil-works/design-tokens` through the internal package source and import one brand stylesheet:

```ts
import '@earendil-works/design-tokens/radius.css';
```

Components inherit semantic tokens; they do not import a brand. Component CSS loads through the JavaScript imports.

## Application setup

### Portals

Follow [Base UI's portal setup](https://base-ui.com/react/overview/quick-start):

```css
body {
  position: relative;
}

.appRoot {
  isolation: isolate;
}
```

`AppLayout.Root` already provides isolation. Keep portals outside the isolated root; popups stack in portal order. Custom portal containers and z-index require application-level stacking management.

For scoped tokens, choose a themed portal `container` outside the isolated app root.

### Client boundaries

In React Server Components applications, compose interactive Elanor components inside an application-owned client component. Elanor does not declare client boundaries. See [Next.js client boundaries](https://nextjs.org/docs/app/getting-started/server-and-client-components).

### RTL

Set `<html dir="rtl">` and wrap the application:

```tsx
import {DirectionProvider} from '@earendil-works/elanor-react';

<DirectionProvider direction="rtl"><App /></DirectionProvider>
```

For mixed-direction regions, set `dir` on their portaled popups too. The provider controls keyboard and positioning behavior; DOM direction controls CSS layout.

## Components and types

```tsx
import {Button} from '@earendil-works/elanor-react';

<Button>Continue</Button>
```

See [`src/index.ts`](./src/index.ts) for exports and [elanor-ui-samples](https://github.com/earendil-works/elanor-ui-samples) for examples.

Use named types such as `ButtonProps`, `ModalRootProps`, and `DropdownRootProps`, not component type namespaces. Base UI-backed parts support composition, state-aware styling, events, and refs as defined by their exported types. For buttons rendered as links, use `nativeButton={false}`; see [Base UI composition](https://base-ui.com/react/handbook/composition).

## Interaction notes

- `IconButton`, standalone checkbox/radio/switch controls, and tabs use minimum target sizes of 24px, or 48px for coarse pointers, through shared tokens. `SelectionControlAndLabel` provides a clickable label.
- Popups use Base UI's available-size variables to constrain overflow. Kept-mounted selection indicators reserve space while hiding inactive marks.

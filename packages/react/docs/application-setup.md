# Application setup

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

`AppLayout.Root` already provides isolation. Keep portals outside the isolated root;
custom containers and stacking order are application-owned. Scoped themes must
also cover the portal container.

## RTL

Set `<html dir="rtl">` and wrap the application:

```tsx
import {DirectionProvider} from '@earendil-works/elanor-react';

<DirectionProvider direction="rtl"><App /></DirectionProvider>
```

The provider controls keyboard and positioning behavior; DOM direction controls
CSS layout. For mixed-direction regions, set `dir` on portaled popups too.

## Server components

Elanor does not declare client boundaries. In React Server Components apps,
import interactive components from an application-owned client component.

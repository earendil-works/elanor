# `@earendil-works/elanor-logos-react`

## Exports

Paths are relative to `@earendil-works/elanor-logos-react`.
Replace `radius` / `Radius` with `earendil` / `Earendil`, `pi` / `Pi`, or `lefos` / `Lefos`.

| Subpath                                | Export                                              |
| -------------------------------------- | --------------------------------------------------- |
| `/radius/symbol`                       | `RadiusSymbol`                                      |
| `/radius/symbol-monochrome`            | `RadiusSymbolMonochrome`                            |
| `/radius/lockup-horizontal`            | `RadiusLockupHorizontal`                            |
| `/radius/lockup-horizontal-monochrome` | `RadiusLockupHorizontalMonochrome`                  |
| `/radius/lockup-vertical`              | `RadiusLockupVertical`                              |
| `/radius/lockup-vertical-monochrome`   | `RadiusLockupVerticalMonochrome`                    |
| `/radius`                              | `RadiusLogo`                                        |
| Package root                           | `EarendilLogo`, `PiLogo`, `RadiusLogo`, `LefosLogo` |

## Fixed variants

Import a specific variant when the logo does not need to change. Only that variant’s artwork is included.

```tsx
import {RadiusSymbol} from '@earendil-works/elanor-logos-react/radius/symbol';

<RadiusSymbol height={24} aria-hidden="true" focusable="false" />;
```

## Configurable logos

Use the brand component to change the variant through props. It includes all artwork variants for that brand.

```tsx
import {RadiusLogo} from '@earendil-works/elanor-logos-react/radius';

<RadiusLogo lockup={lockup} monochrome={monochrome} />;
```

## Props

All components accept SVG attributes and refs, plus:

- `height`: defaults to `32`. Width follows the artwork’s aspect ratio.
- `scheme`: `light`, `dark`, or `auto` (default). The `auto` scheme follows the page’s `color-scheme` using CSS `light-dark()`.

Configurable logos also accept:

- `lockup`: `horizontal` or `vertical`. Omit it to render the symbol.
- `monochrome`: defaults to `false`.

Logos use the brand name as their accessible label unless `aria-hidden="true"` is set.

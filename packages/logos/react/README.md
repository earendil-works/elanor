# `@earendil-works/elanor-logos-react`

React components for the [Elanor logos](../README.md).

## Exports

Subpaths are relative to `@earendil-works/elanor-logos-react`. For other brands, replace `radius`/`Radius` with `earendil`/`Earendil`, `pi`/`Pi`, or `lefos`/`Lefos`, e.g. `/pi/symbol` exports `PiSymbol`.

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

Import one variant to include only its artwork:

```tsx
import {RadiusSymbol} from '@earendil-works/elanor-logos-react/radius/symbol';

<RadiusSymbol height={24} aria-hidden="true" focusable="false" />;
```

## Configurable logos

The brand component accepts variant props and includes all of the brand's artwork:

```tsx
import {RadiusLogo} from '@earendil-works/elanor-logos-react/radius';

<RadiusLogo lockup={lockup} monochrome={monochrome} />;
```

## Props

All components accept SVG attributes and refs, plus:

- `height`: defaults to `32`. Width follows the artwork's aspect ratio.
- `scheme`: `light`, `dark`, or `auto` (default). The `auto` scheme follows the page's `color-scheme` using CSS `light-dark()`.

Configurable logos also accept:

- `lockup`: `horizontal` or `vertical`. Omit it to render the symbol.
- `monochrome`: defaults to `false`.

The accessible label defaults to the brand name. Use `aria-hidden="true"` for decorative logos.

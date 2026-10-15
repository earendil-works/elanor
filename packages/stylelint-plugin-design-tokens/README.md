# Stylelint Design Tokens Plugin

Requires Stylelint 17. Checks CSS against a generated token catalogue; no custom-property prefix is assumed.

## Setup

Build the selected brand's tokens, then configure Stylelint:

```js
import {createStrictConfig} from '@earendil-works/stylelint-plugin-design-tokens';

export default [
  createStrictConfig({
    catalogue: new URL('./packages/design-tokens/dist/radius/tokens.catalog.json', import.meta.url)
      .pathname,
    foundationFiles: ['**/tokens.css', '**/foundation/**'],
    ignoreFiles: ['**/tests/fixtures/**'],
    allowCustomProperties: [], // Third-party variables only, e.g. '--vendor-*'.
  }),
];
```

Choose `radius`, `pi`, `earendil`, or `lefos`. Variables from other brands are unknown unless the selected catalogue also contains them.

## Rules

| Rule                             | Checks                                                                                                                                                           |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `no-non-token-custom-properties` | Declarations, `var()` references, and `@property` names must exist in the catalogue or `allowCustomProperties`. Local proxies such as `--card-gap` are rejected. |
| `no-hardcoded-token-values`      | Tokenizable literals must use tokens. Checks shorthands, functions, gradients, shadows, and fallbacks; no autofix.                                               |
| `token-property-compatibility`   | Token types and roles must match the CSS property. `propertyTypes` and `semanticRoles` entries replace the defaults for the properties they name.                |
| `transition-type-compatibility`  | Each transitioned property uses the transition type it needs; `all` is rejected. See [Transitions](#transitions).                                                |
| `prefer-semantic-token`          | Primitive tokens are allowed only in `foundationFiles`.                                                                                                          |

Rule names use the `design-tokens/` prefix. CSS and CSS Modules follow the same rules.

### Values

Checks cover paint, borders, outlines, spacing, sizing, radii, typography, opacity, shadows, grid tracks, transforms, translations, scales, flex bases, stacking, aspect ratios, and transition and animation timing. Only categories present in the catalogue are enforced.

- Structural values are allowed: `auto`, `none`, border styles, `currentColor`, `transparent`, percentages, `fr`, viewport/container units, and CSS-wide keywords. Unitless zero is allowed unless `allowUnitlessZero: false`, except for `opacity`, whose transparent end is `opacity.hidden`.
- Numeric multipliers and divisors in token-based `calc()` are allowed, including sign inversion. Literal dimensions, fallbacks, standalone numbers (`z-index: 10`), and scales (`scale(1.1)`) remain checked.
- Durations (including `0s`) and easings (`ease*`, `linear`, `cubic-bezier()`, `linear()`) in `transition` and `animation` properties are checked; `steps()`, `step-start`, and `step-end` are structural. Disable a transition with `transition: none`.
- Media-query conditions are not checked. Breakpoint tokens are exported, but no custom-media transform is provided.

### Compatible roles

- `color`: text or icon colors; SVG paint: icon colors.
- Backgrounds: background or border colors, including separators and indicators.
- Borders: border, fill/background, or focus colors.
- Transitions and animations, including their longhands and composite parts such as `-duration`: `semantic.transition` tokens.
- `scale` and scale factors inside `transform`: `semantic.number.scale`; `translate` and distances inside `transform` translations: `semantic.dimension.travel`. Other tokens in those functions, such as a number multiplying a distance, follow the property. A configured `transform` role in `semanticRoles` replaces these function roles too.
- Spacing, radii, layers, and opacity keep their own roles. A matching value alone does not make a token compatible.
- Padding also accepts top-level `calc(var(--padding-token) - var(--border-width-token))` for border compensation, without fallbacks.

### Transitions

| Transitioned property                                                                                                           | Needs                          |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `transform`, `translate`, `scale`, `rotate`, insets, `top`/`right`/`bottom`/`left`, sizes, margins, paddings, `grid-template-*` | `semantic.transition.movement` |
| `opacity`                                                                                                                       | `semantic.transition.fade`     |
| `color`, backgrounds, border and outline colors, `box-shadow`, `text-decoration-color`, `fill`, `stroke`                        | `semantic.transition.feedback` |
| `visibility`, `display`, `overlay`, `content-visibility`                                                                        | any `semantic.transition`      |

Movement becomes instant when the reader prefers reduced motion, so anything that moves must use it. Each shorthand layer is checked, and `transition-property` is paired with the duration, delay, and easing lists by position. A layer without a property transitions `all` and is rejected. Other properties, including registered custom properties, are not checked.

### Exceptions

Default ignores cover `**/dist/**`, `**/vendor/**`, reset files, and `**/*.generated.css`. `ignoreFiles` adds globs to these defaults; ignored files are skipped before parsing.

For an exceptional declaration, use a scoped disable with a reason. Needless disables, invalid scopes, and missing descriptions are reported.

```css
/* stylelint-disable-next-line design-tokens/prefer-semantic-token -- third-party API requires its primitive value */
color: var(--primitive-color-black);
```

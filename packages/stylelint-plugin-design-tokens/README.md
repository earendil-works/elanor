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
| `prefer-semantic-token`          | Primitive tokens are allowed only in `foundationFiles`.                                                                                                          |

Rule names use the `design-tokens/` prefix. CSS and CSS Modules follow the same rules.

### Values

Checks cover paint, borders, outlines, spacing, sizing, radii, typography, opacity, shadows, grid tracks, transforms, flex bases, stacking, and aspect ratios. Only categories present in the catalogue are enforced.

- Structural values are allowed: `auto`, `none`, border styles, `currentColor`, `transparent`, percentages, `fr`, viewport/container units, and CSS-wide keywords. Unitless zero is allowed unless `allowUnitlessZero: false`.
- Numeric multipliers and divisors in token-based `calc()` are allowed, including sign inversion. Literal dimensions, fallbacks, standalone numbers (`z-index: 10`), and scales (`scale(1.1)`) remain checked.
- Media-query conditions are not checked. Breakpoint tokens are exported, but no custom-media transform is provided.

### Compatible roles

- `color`: text or icon colors; SVG paint: icon colors.
- Backgrounds: background or border colors, including separators and indicators.
- Borders: border, fill/background, or focus colors.
- Spacing, radii, layers, and opacity keep their own roles. A matching value alone does not make a token compatible.
- Padding also accepts top-level `calc(var(--padding-token) - var(--border-width-token))` for border compensation, without fallbacks.

### Exceptions

Default ignores cover `**/dist/**`, `**/vendor/**`, reset files, and `**/*.generated.css`. `ignoreFiles` adds globs to these defaults; ignored files are skipped before parsing.

For an exceptional declaration, use a scoped disable with a reason. Needless disables, invalid scopes, and missing descriptions are reported.

```css
/* stylelint-disable-next-line design-tokens/prefer-semantic-token -- third-party API requires its primitive value */
color: var(--primitive-color-black);
```

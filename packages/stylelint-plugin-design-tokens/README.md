# Stylelint Design Tokens Plugin

Stylelint rules for consuming a generated design-token catalogue. The plugin does not assume a custom-property prefix: the selected catalogue is the complete allowlist.

## Policy

The strict configuration enforces the following contract for application CSS and CSS Modules:

- `color`, backgrounds, borders, outlines, SVG paint, spacing, gaps, sizing, radii, font properties, line height, letter spacing, opacity, and tokenizable parts of shadows must use represented token categories.
- Literal colors, `px`/`rem` dimensions, font families, font weights, and supported unitless numbers are tokenizable. Enforced layout values include outline offsets, scroll spacing, grid track dimensions, transform lengths and unitless values, flex bases, stacking indices, and aspect ratios. The value parser checks shorthands, multiline values, nested functions, `calc()`, gradients, shadows, and `var()` fallbacks.
- Structural values remain valid, including `auto`, `none`, border styles, `currentColor`, `transparent`, percentages, `fr`, viewport/container-relative units, and CSS-wide keywords. Unitless zero is allowed by default.
- Numeric multipliers and divisors in a token-based `calc()` are structural geometry, including sign inversion. Literal dimensions, fallback values, standalone numbers such as `z-index: 10`, and literal scales such as `scale(1.1)` remain checked. Logical `inline-size` and `block-size` properties are checked just like physical width and height.
- Categories absent from the catalogue are not enforced. For example, durations are not rejected until duration tokens exist.
- Every custom-property declaration, `var()` reference, and `@property` registration must be in the selected catalogue. Consumer-defined proxies such as `--card-gap` are disallowed. Exceptional third-party properties require an explicit `allowCustomProperties` entry.
- Primitive tokens are rejected in application styles. They are allowed only in files matching `foundationFiles`.
- Media-query parameters are intentionally not checked. Breakpoint tokens remain generated CSS variables and catalogue entries, but the plugin does not prescribe or validate their use in media queries.
- Generated, vendor, and reset CSS is ignored by default. Add project-specific generated/test globs through `ignoreFiles`.
- Plain CSS and CSS Modules are parsed identically; selectors do not affect token checks.

Default file ignores are `**/dist/**`, `**/vendor/**`, reset files, and `**/*.generated.css`. `createStrictConfig` emits these as Stylelint-level `ignoreFiles`, so ignored files are excluded before CSS parsing as well as skipped by the plugin rules.

## Setup

Build the selected brand so its catalogue exists, then use the configuration factory:

```js
import { createStrictConfig } from "@earendil-works/stylelint-plugin-design-tokens";

export default [
  createStrictConfig({
    catalogue: new URL(
      "./packages/design-tokens/dist/radius/tokens.catalog.json",
      import.meta.url,
    ).pathname,
    foundationFiles: ["**/tokens.css", "**/foundation/**"],
    ignoreFiles: ["**/tests/fixtures/**"],
    // Keep empty unless an integration has a documented requirement.
    allowCustomProperties: [],
  }),
];
```

Choose `radius`, `pi`, `earendil`, or `lefos` by changing the catalogue path. A variable emitted only by another brand is unknown under the selected catalogue.

The shared config enables Stylelint reporting for needless disables, invalid disable scopes, and descriptionless disables. A deliberate exception should be narrow and explained:

```css
/* stylelint-disable-next-line design-tokens/prefer-semantic-token -- third-party API requires its primitive value */
color: var(--primitive-color-black);
```

## Rules

### `design-tokens/no-non-token-custom-properties`

Rejects custom-property declarations and references absent from the catalogue. `allowCustomProperties` accepts narrowly scoped glob patterns such as `--vendor-*`. Media-query parameters are not inspected.

### `design-tokens/no-hardcoded-token-values`

Finds tokenizable literals using a PostCSS-compatible value AST. It does not autofix because an equal value does not identify the correct semantic role.

### `design-tokens/token-property-compatibility`

Checks DTCG types and semantic roles. Defaults include text or icon colors for `color` (supporting `currentColor` inheritance), background or border colors for backgrounds (supporting separators and indicators), and border, fill/background, or focus colors for borders. SVG paint uses icon colors, while spacing and radius properties retain their distinct roles. A property's paint mechanism does not require a duplicate token for the same design decision. Extend or override maps with `propertyTypes` and `semanticRoles` when a product needs a different contract.

These allowances do not make roles interchangeable: text colors used for backgrounds, radii used as padding, opacity tokens used as stacking levels, unknown variables, primitive tokens, and type mismatches still fail. `z-index` uses layer roles and `opacity` uses opacity roles. Choose tokens by purpose; the linter cannot infer the meaning of a selector. Use a narrowly scoped, explained disable for a truly exceptional declaration rather than weakening the complete rule.

### `design-tokens/prefer-semantic-token`

Rejects primitive variables outside `foundationFiles` and asks the author to choose a semantic token without guessing a replacement.

## Breakpoints and media queries

Breakpoint tokens continue to be emitted as CSS variables and catalogue entries. This package does not generate custom-media CSS, require a media-query transform, or lint media-query conditions. A media-query consumption strategy can be added later when consumer requirements are clear.

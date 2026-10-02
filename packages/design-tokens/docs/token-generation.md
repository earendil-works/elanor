# Primitive Token Generation

Primitive token files are compiled from recipes.

```text
Recipe JSON -> TypeScript generator -> DTCG token files by type -> Terrazzo
```

## Purpose

Primitive scales follow repeatable rules. Calculating them in code keeps every value aligned with its rule. It also avoids copying calculated values into token files by hand.

Recipes contain scale-specific design choices. `packages/design-tokens/generation/config.json` contains repository-wide generation settings. Generators contain calculation rules. Generated files use the standard DTCG format required by resolvers, validation, Terrazzo, and other token tools.

This structure provides:

* repeatable values
* small and reviewable configuration changes
* reusable calculation logic
* automatic recipe validation
* checks for stale generated output

## Parts

`packages/design-tokens/generation/config.json` contains global design inputs shared by every recipe. Its `pixelsPerRem` value is the single baseline used whenever a generator converts pixels to rem.

`packages/design-tokens/generation/recipes/` contains scale-specific design inputs.

`packages/design-tokens/generation/schemas/` contains schemas for the global configuration and recipes.

`packages/design-tokens/generation/src/generators/` contains calculation rules.

Recipe paths mirror the token tree. For example, `packages/design-tokens/generation/recipes/shared/primitive/dimension.json` generates into `packages/design-tokens/tokens/shared/primitive/dimension.tokens.json`. The runner derives output files from the recipe path plus each patch's DTCG type, so no manifest registration is needed.

Generated DTCG tokens are written under `packages/design-tokens/tokens/**/primitive/`. Edit a recipe or generator to change a generator-owned token. Other token leaves in the same files may be authored manually.

## Output files by DTCG type

Generators return typed patches. Each patch identifies its DTCG type, destination path, and generated token subtree. The generation runner declares that type as a `$type` on the group named after the DTCG type (for example `primitive.dimension`), stamps every generated token with its recipe source, and applies the patch to `<type>.tokens.json` in the mirrored output directory derived from the recipe path. The document root never carries a `$type`: resolver sources merge into shared group trees where a root type would clash with sibling files, and the last merged source would silently win. If two recipes produce identical or structurally overlapping token leaf paths, or a group already declares a conflicting type, generation fails instead of silently overriding one of them.

For example, the typography generator writes:

- font size dimensions to `primitive.dimension.fontSize` in `dimension.tokens.json`
- line height numbers to `primitive.number.lineHeight` in `number.tokens.json`

This rule applies to every generator, so both token namespaces and output files describe DTCG types rather than the recipe or design category that produced them.

## Generated and manual tokens

The generation runner reads an existing type file before applying generated patches. It recursively merges group structures, adds new generated token leaves, and replaces a token wholesale when the generator emits the same path again. Existing paths that are absent from the incoming patch remain in place until the ownership sweep. A token/group structural collision is rejected rather than deleting descendants implicitly.

Every generated token carries source-only ownership metadata:

```json
"100": {
  "$value": { "value": 0.5, "unit": "rem" },
  "$extensions": {
    "com.earendil-works.generation": {
      "source": "recipes/shared/primitive/dimension.json"
    }
  }
}
```

`source` is the recipe path relative to `packages/design-tokens/generation/`. The runner, rather than individual generators, adds this marker.

During generation, the runner records every token leaf emitted by each recipe into each output file. It then reconciles all token files and deletes a marked leaf when its source and path were not emitted in the current run. This removes steps omitted from a recipe as well as output left behind by a moved or deleted recipe. Unmarked manual tokens are preserved.

The generators currently emit leaves under these paths:

- typography font sizes: `primitive.dimension.fontSize.<step>`
- typography line heights: `primitive.number.lineHeight.<step>`
- dimensions: `primitive.dimension.<step>`
- breakpoints: `primitive.dimension.breakpoint.<step>`
- border widths: `primitive.dimension.borderWidth.<step>`
- border radii: `primitive.dimension.radius.<step>` and `primitive.dimension.radius.full`
- opacity: `primitive.number.opacity.<step>`
- colors: `primitive.color.<name>` for key colors (the group's `$root` when the color also has a scale) and `primitive.color.<name>.<step>`

Ownership is attached to token leaves, not whole parent groups. A generated leaf must be changed through its recipe or generator because the next run replaces it. An unmarked manual token can coexist in the same groups as generated tokens as long as it does not use a generated path. For example, `primitive.dimension.spacing` can remain beside generated dimension steps and typography font sizes.

When copying a generated token to create a manual token, remove `com.earendil-works.generation` from the copy; otherwise the runner will continue treating it as generated and may replace or remove it.

## Typographic scale

The typography generator implements the classical scale with these fixed rules:

```text
f0 = 12px
r = 2
n = 5
fi = f0 * r^(i / n)
```

The formula is inspired by Spencer Mortensen's [typographic scale](https://spencermortensen.com/articles/typographic-scale/).

Token `100` represents scale index `-1`. Every increase of `100` advances one note. This makes token `100` round to `10px`. Token `1700` is index `15`, which equals `96px`.

The recipe selects which scale steps to output. Omitting a step does not change the position or value of any other step.

```json
{
  "path": ["primitive"],
  "steps": [100, 200, 300, 400],
  "lineHeight": {
    "multiplier": 1.2,
    "gridTiers": [
      { "minFontSizePx": 0, "gridPx": 4 },
      { "minFontSizePx": 24, "gridPx": 8 }
    ]
  }
}
```

Font sizes are rounded to whole pixels and converted to rem. Line heights begin with the rounded font size multiplied by `lineHeight.multiplier`, then snap to the nearest multiple of the grid selected from `lineHeight.gridTiers`. Tiers must start at `0px` and be ordered by `minFontSizePx`; the highest matching tier is used. The snapped line height is never allowed to be smaller than the font size.

### Why line heights snap to a grid

The system's primary layout grid is 8px. Snapping line boxes to that grid gives text a predictable vertical rhythm and helps text blocks align with surrounding elements whose dimensions and spacing also follow the 8px grid. Grid snapping turns an otherwise fractional result such as `28.8px` into an intentional layout value such as `32px`.

An 8px interval is too coarse for small type: moving a small line box to the next 8px boundary can add or remove too much leading relative to its font size. Font sizes below `24px` therefore use a 4px half-grid, which provides finer typographic control while remaining related to the main 8px grid. Starting at `24px`, line boxes use the full 8px grid, where the larger type can accommodate the coarser interval and each generated line height aligns directly with the layout grid.

The snapped pixel value is divided by the font size to produce a unitless DTCG number ratio, rounded to six decimal places. This allows the token to be referenced by a DTCG typography composite while preserving the intended pixel-grid relationship at the globally configured `pixelsPerRem` base. Grid-aligned line height supports vertical alignment, but a complete component must also account for padding, borders, and other dimensions.

## Dimension scale

The dimension generator implements a linear 8px scale with these fixed rules:

```text
base = 8px
px = step / 200 * base
```

Token `200` represents the `8px` base. Every increase of `200` adds another `8px`, so token `400` is `16px` and token `3200` is `128px`. Steps are integer multiples of `25`, so each step lands on a whole pixel: token `25` is `1px` and token `200` is `8px`.

The recipe selects which scale steps to output. Omitting a step does not change the position or value of any other step.

```json
{
  "path": ["primitive"],
  "steps": [0, 25, 50, 100, 150, 200, 300, 400, 600, 800, 1000, 1200, 1400, 1600, 2000, 2400, 3200]
}
```

Pixel sizes are converted to rem using the global `pixelsPerRem` value in `packages/design-tokens/generation/config.json`. With the configured value of `16`, every whole-pixel step becomes an exact multiple of `0.0625rem`; this scale's 1px minimum interval is `0.0625rem`.

## Breakpoint scale

The breakpoint generator implements a linear 16rem scale with these fixed rules:

```text
base = 16rem
rem = step / 100 * base
```

Token `100` represents `16rem`, and every increase of `100` adds another `16rem`. Intermediate steps follow the same formula, so token `250` is `40rem`. The recipe selects only the positions used by the shared breakpoint scale:

```json
{
  "path": ["primitive"],
  "steps": [250, 300, 400, 500, 600]
}
```

Those steps produce `40rem`, `48rem`, `64rem`, `80rem`, and `96rem`, matching Tailwind's default breakpoint values. Breakpoints remain in rem so viewport thresholds respond to the user's configured default font size. The generated primitive values live under `primitive.dimension.breakpoint`; semantic aliases provide the consumer-facing T-shirt names.

## Border width scale

The border-width generator implements a doubling scale with these fixed rules:

```text
base = 1px
px = base * 2^((step - 100) / 100)
```

Token `100` is `1px`, token `200` is `2px`, and token `300` is `4px`. The recipe selects steps in ascending increments of `100`, so omitting a step does not change another step's value:

```json
{
  "path": ["primitive"],
  "steps": [100, 200, 300]
}
```

Border widths remain in pixel units because each value represents an intentional stroke width rather than a layout dimension.

## Border radius scale

The radius generator implements a doubling scale with these fixed rules:

```text
base = 3px
px = base * 2^((step - 100) / 100)
```

Token `100` is `3px`, token `200` is `6px`, and token `300` is `12px`. The recipe selects numeric steps in ascending increments of `100`, so omitting a step does not change another step's value:

```json
{
  "path": ["primitive"],
  "steps": [100, 200, 300]
}
```

The calculated pixel sizes are converted to rem using the global `pixelsPerRem` value. With the configured 16px base, tokens `100`, `200`, and `300` are emitted as `0.1875rem`, `0.375rem`, and `0.75rem`.

The generator also always emits `primitive.dimension.radius.full` as `100rem`. This intentionally large, whole-rem value produces pills for rectangular elements and circles for typical UI elements without depending on a particular component size.

## Opacity scale

The opacity generator implements a normalized 0–1000 scale with this fixed rule:

```text
value = step / 1000
```

Token `0` is fully transparent, token `1000` is fully opaque, token `150` is 15% opacity with a DTCG number value of `0.15`, and token `400` is 40% opacity with a value of `0.4`. The recipe selects only the opacity steps needed by semantic tokens:

```json
{
  "path": ["primitive"],
  "steps": [150, 400]
}
```

Generated values live under `primitive.number.opacity` in `number.tokens.json`. Add a required step to the opacity recipe rather than editing the generated token file, and do not populate unused opacity values speculatively.

## Color scale

The color generator implements OKHSL color scales with these fixed rules:

```text
lightness = 1 - step / 1000
saturation = min + (max - min) * bellCurve(step / 1000)
```

Token `0` maps to white and token `1000` to black. Lightness decreases linearly along the scale, so token `500` has OKHSL lightness `0.5`. Core palette steps are multiples of `100`, with optional `25` and `50` near-white steps for subtle structural backgrounds. All other intermediate color steps are reserved for interactive states and are derived from configured core positions; resting semantic colors must not reference them.

Steps `0` and `1000` are the pure white and pure black ends of the calculation, but they are not emitted; recipes should omit them. The brand `black` and `white` are ordinary key colors in the recipe. The generator always emits `transparent`, a constant rather than a design choice, so its name is reserved. It uses black components with zero alpha.

Saturation follows a Gaussian bell curve centered on the middle of the scale. The curve is normalized so it reaches exactly `max` at step `500` and exactly `min` at both ends. This keeps near-white and near-black steps close to neutral while mid-tones carry the most saturation.

Each color in the recipe has a name and a key color, and optionally a scale:

- `key` is the color's defining value, in the same shape as a DTCG color value: `{ "colorSpace": "oklch", "components": [lightness, chroma, hue] }`. It must lie within sRGB. The generator emits it exactly as `primitive.color.<name>`, deriving only the hex fallback. When the color has a scale, the key becomes the scale group's `$root`.
- `saturation` holds the `min` and `max` of the bell curve and turns the color into a scale. The scale keeps the key's hue throughout, because OKLCH and OKHSL share hue angles.
- `print` holds CMYK builds of the key per print profile, emitted in the key token's `com.earendil-works.print` extension.

```json
{
  "path": ["primitive"],
  "steps": [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
  "interactiveSteps": {
    "distance": 40,
    "states": ["hover", "active"],
    "lighterFrom": [400, 500, 800, 1000],
    "darkerFrom": [0, 100, 500, 600]
  },
  "colors": [
    {
      "name": "cerulianBlue",
      "key": { "colorSpace": "oklch", "components": [0.6523, 0.0938, 231.49] },
      "saturation": { "min": 0.1, "max": 0.68 }
    },
    {
      "name": "white",
      "key": { "colorSpace": "oklch", "components": [0.9731, 0, 0] }
    }
  ]
}
```

Interaction steps are generated for every configured color family. `lighterFrom` subtracts the configured distance from each source position, while `darkerFrom` adds it. Hover uses one distance and active uses two, so a distance of `40` derives `360` and `320` toward the lighter end from core step `400`. Source positions `0` and `1000` may be used as scale ends even though they are not emitted. Derived values must remain strictly between them. Interaction names are recipe-only generation inputs: output remains part of the ordinary numeric primitive scale, and semantic aliases assign hover or active intent.

Colors are calculated in OKHSL with colorjs.io and emitted as DTCG color tokens with `colorSpace` `oklch`. Lightness and chroma components are rounded to four decimal places and hue to two. Achromatic colors have a powerless hue; the generator retains their rounded input hue as a numeric compatibility value because Terrazzo 2.4's Color.js adapter does not translate the otherwise-valid DTCG `none` keyword before gamut conversion. The numeric hue does not affect colors with zero chroma. Every token also carries a 6-digit `hex` fallback derived from the rounded OKLCH components, so the fallback always describes the same color. OKHSL maps onto the sRGB gamut by construction, so the fallback never requires gamut mapping.

## Commands

Generate all configured primitive files:

```bash
pnpm tokens:generate
```

Check that committed files match their recipes:

```bash
pnpm tokens:generate:check
```

Run these commands from the Elanor UI repository root. `pnpm tokens:check` runs the generation check before DTCG and Terrazzo validation; `pnpm check` includes these checks alongside the other workspace packages.

## Adding a brand scale

Add a brand recipe under the mirrored path in `packages/design-tokens/generation/recipes/`, for example:

```text
packages/design-tokens/generation/recipes/radius/primitive/typography.json
```

That recipe will generate into the matching brand primitive token files under `packages/design-tokens/tokens/radius/primitive/`, such as `dimension.tokens.json` and `number.tokens.json`.

Register the generated token files after their shared equivalents in the brand resolver. Matching token paths will override the shared scale.

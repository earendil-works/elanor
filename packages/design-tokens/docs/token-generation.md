# Primitive Token Generation

```text
Recipe JSON -> TypeScript generator -> DTCG token files by type -> Terrazzo
```

Edit recipes for design choices and generators for calculation rules, not generated values. Recipes are validated; checks detect stale output.

## Parts

Paths below are relative to `packages/design-tokens/`:

| Path                         | Purpose                                                      |
| ---------------------------- | ------------------------------------------------------------ |
| `generation/config.json`     | Shared settings; `pixelsPerRem` is the pixel-to-rem baseline |
| `generation/recipes/`        | Scale-specific inputs                                        |
| `generation/schemas/`        | Config and recipe schemas                                    |
| `generation/src/generators/` | Calculation rules                                            |
| `tokens/**/primitive/`       | Generated output, alongside manual leaves                    |

Recipe paths mirror the token tree: `generation/recipes/shared/primitive/dimension.json` writes to `tokens/shared/primitive/dimension.tokens.json`. Output paths follow the recipe directory and each patch's DTCG type; no manifest registration is needed.

## Output files by DTCG type

Generators return patches containing a DTCG type, destination path, and token subtree. The runner writes each patch to `<type>.tokens.json`, declaring `$type` on the typed group (for example `primitive.dimension`), never the document root. Root types would collide when resolver sources merge, with the last source silently winning.

Namespaces and files follow DTCG types, not recipe categories. Typography therefore writes:

- `primitive.dimension.fontSize` to `dimension.tokens.json`
- `primitive.number.lineHeight` to `number.tokens.json`

Identical or structurally overlapping generated paths, token/group collisions, and conflicting group types fail generation.

## Generated and manual tokens

The runner merges existing groups, adds generated leaves, and replaces matching generated leaves wholesale. It marks each generated leaf with source-only ownership metadata:

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

`source` is relative to `generation/`. The runner, not the generator, adds it. After applying patches, the runner sweeps all token files: marked leaves whose source/path was not emitted are deleted, including output from moved or deleted recipes. Unmarked manual leaves survive.

Ownership applies to leaves, not groups. Manual tokens may share a group but not a generated path. Remove `com.earendil-works.generation` when copying a generated token into a manual one, or the runner may replace or remove it.

Generated paths:

| Scale        | Path                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| Font size    | `primitive.dimension.fontSize.<step>`                                                |
| Line height  | `primitive.number.lineHeight.<step>`                                                 |
| Dimension    | `primitive.dimension.<step>`                                                         |
| Breakpoint   | `primitive.dimension.breakpoint.<step>`                                              |
| Border width | `primitive.dimension.borderWidth.<step>`                                             |
| Radius       | `primitive.dimension.radius.<step>`, `primitive.dimension.radius.full`               |
| Opacity      | `primitive.number.opacity.<step>`                                                    |
| Layer        | `primitive.number.layer.<step>`, `primitive.number.layer.below`                      |
| Color        | `primitive.color.<name>` (key; `$root` when scaled), `primitive.color.<name>.<step>` |

Recipes select steps; omitting one never shifts another step's position or value.

## Typographic scale

Based on Spencer Mortensen's [typographic scale](https://spencermortensen.com/articles/typographic-scale/):

```text
f0 = 12px
r = 2
n = 5
fi = f0 * r^(i / n)
```

Token `100` is index `-1` (rounded to `10px`); each `100` advances one note. Token `1700` is index `15` (`96px`).

```json
{
  "path": ["primitive"],
  "steps": [100, 200, 300, 400],
  "lineHeight": {
    "multiplier": 1.2,
    "gridTiers": [
      {"minFontSizePx": 0, "gridPx": 4},
      {"minFontSizePx": 24, "gridPx": 8}
    ]
  }
}
```

Font sizes round to whole pixels, then convert to rem. Line heights multiply the rounded size by `lineHeight.multiplier` and snap to the nearest grid multiple, never below the font size. `gridTiers` must start at `0px`, ordered by `minFontSizePx`; the highest matching tier wins.

### Why line heights snap to a grid

Grid-aligned line boxes support the layout's 8px vertical rhythm. Below `24px`, a 4px half-grid avoids excessive changes in leading; larger type uses the full 8px grid (for example, `28.8px` snaps to `32px`).

The snapped height divided by font size becomes a unitless DTCG ratio, rounded to six decimals, for typography composites. Alignment assumes the configured `pixelsPerRem` base; components must still account for padding and borders.

## Dimension scale

```text
base = 8px
px = step / 200 * base
```

Steps must be integer multiples of `25` (one pixel). Token `200` is `8px`, `400` is `16px`, and `3200` is `128px`.

```json
{
  "path": ["primitive"],
  "steps": [0, 25, 50, 100, 150, 200, 300, 400, 600, 800, 1000, 1200, 1400, 1600, 2000, 2400, 3200]
}
```

Values convert to rem using `pixelsPerRem`; at the configured `16`, each pixel is exactly `0.0625rem`.

## Breakpoint scale

```text
base = 16rem
rem = step / 100 * base
```

```json
{
  "path": ["primitive"],
  "steps": [250, 300, 400, 500, 600]
}
```

These produce `40rem`, `48rem`, `64rem`, `80rem`, and `96rem`, matching Tailwind defaults. Rem thresholds respond to the user's default font size. Semantic aliases supply T-shirt names.

## Border width scale

```text
base = 1px
px = base * 2^((step - 100) / 100)
```

```json
{
  "path": ["primitive"],
  "steps": [100, 200, 300]
}
```

Steps ascend in increments of `100`, producing `1px`, `2px`, and `4px`. Widths stay in pixels as intentional stroke sizes, not layout dimensions.

## Border radius scale

```text
base = 3px
px = base * 2^((step - 100) / 100)
```

```json
{
  "path": ["primitive"],
  "steps": [100, 200, 300]
}
```

Steps ascend in increments of `100`, producing `3px`, `6px`, and `12px`. At `pixelsPerRem: 16`, these emit as `0.1875rem`, `0.375rem`, and `0.75rem`.

The generator always emits `primitive.dimension.radius.full` as `100rem`: oversized for pills and typical UI circles without tying the value to a component size.

## Opacity scale

```text
value = step / 1000
```

`0` is transparent, `1000` opaque, `150` is `0.15`, and `400` is `0.4`. Add only steps needed by semantic tokens:

```json
{
  "path": ["primitive"],
  "steps": [150, 400]
}
```

## Layer scale

```text
value = step
below = -1
```

Each step is its own z-index value, like opacity's direct mapping. Factor-of-ten steps leave room for new levels between existing ones:

```json
{
  "path": ["primitive"],
  "steps": [1, 10, 100, 1000]
}
```

The generator always emits `primitive.number.layer.below` (`-1`) for content behind its siblings.

## Color scale

```text
lightness = 1 - step / 1000
saturation = min + (max - min) * bellCurve(step / 1000)
```

OKHSL lightness falls linearly from pure white (`0`) to pure black (`1000`). These endpoints are not emitted; omit them from `steps`. Brand `black` and `white` are separate key colors. The reserved name `transparent` is always emitted with black components and zero alpha.

Core steps are multiples of `100`, plus optional near-white `25` and `50` for structural backgrounds. Other intermediate steps are generated for interactions only; resting semantic colors must not reference them.

The normalized Gaussian saturation curve reaches `max` at `500` and `min` at both endpoints, keeping extremes quieter than mid-tones.

Each recipe color has a `name` and:

- `key`: an in-sRGB DTCG OKLCH value, emitted unchanged as `primitive.color.<name>` with a derived hex fallback. For scaled colors, it becomes the group's `$root`.
- Optional `saturation`: `min` and `max` enable a scale that keeps the key's hue (shared by OKLCH and OKHSL).
- Optional `print`: CMYK builds by profile, emitted in `com.earendil-works.print` on the key token.

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
      "key": {"colorSpace": "oklch", "components": [0.6523, 0.0938, 231.49]},
      "saturation": {"min": 0.1, "max": 0.68}
    },
    {
      "name": "white",
      "key": {"colorSpace": "oklch", "components": [0.9731, 0, 0]}
    }
  ]
}
```

For each color family, `lighterFrom` subtracts distance and `darkerFrom` adds it: once for hover, twice for active. Distance `40` from `400` yields `360` and `320` toward lighter values. Sources may include `0` and `1000`, but derived steps must remain strictly between them. Output names stay numeric; semantic aliases assign interaction intent.

colorjs.io calculates OKHSL and emits DTCG `oklch`, rounding lightness/chroma to four decimals and hue to two. Achromatic colors retain numeric input hue because Terrazzo 2.4's Color.js adapter cannot convert DTCG `none`; hue has no effect at zero chroma. Six-digit `hex` fallbacks derive from rounded components. OKHSL stays within sRGB, so no gamut mapping is needed.

## Commands

From the repository root:

```bash
pnpm tokens:generate       # Generate primitive files
pnpm tokens:generate:check # Check committed output against recipes
```

`pnpm tokens:check` runs generation checks before DTCG and Terrazzo validation. Root `pnpm check` includes them.

## Adding a brand scale

Add a mirrored recipe, for example `generation/recipes/radius/primitive/typography.json`. It generates `dimension.tokens.json` and `number.tokens.json` under `tokens/radius/primitive/`.

Register generated files after their shared equivalents in the brand resolver; matching paths override the shared scale.

# Token Naming

All token names use an adapted **CTI+** taxonomy. A name is a compressed sentence that identifies what a token is and, where applicable, how it is used.

## Pattern

```text
<layer>.<category+>[.<type>][.<item>][.<variant...>][.<subitem...>][.<state...>][.<context>]
```

Parts follow this order:

```text
layer → category → type → item → variant → subitem → state → context
```

Every token name contains at least `layer`, `category`, and one additional meaningful part. The build target supplies the CTI+ **domain** (`radius`, `pi`, `earendil`, or `lefos`), so shared source names do not repeat it.

## Parts and repeatability

Repeatability means that a grammatical role may occupy several consecutive name parts. It does not mean repeating the same word without adding meaning.

| Part | Cardinality | Meaning | Vocabulary |
|---|---:|---|---|
| `layer` | exactly 1 | Level of abstraction. It cannot repeat. | `primitive`, `semantic` |
| `category` | 1 or more | What the token is and, optionally, broader classifications. The first category matches the DTCG `$type`; additional categories may narrow the design area. | See the closed list below. |
| `type` | 0 or 1 for primitives; exactly 1 for semantics | How the token is grouped or used. It cannot repeat. | See the closed lists below. |
| `item` | 0 or 1 | Element, component, or documented relational role, such as `link`, `button`, `canvas`, or `onPrimaryFill`. It cannot repeat; use `subitem` for nested parts. | Open; normally use a singular noun. |
| `variant` | 0 or more | Successive distinctions such as `primary` and `strong`. It may repeat to make a variant more specific. | Open. |
| `subitem` | 0 or more | Successive parts of an item, such as `trigger` and `icon`. It may repeat for nested parts. | Open. |
| `state` | 0 or more | Scale step, documented primitive derivation, size, interaction, or UI state. It may repeat for compound states such as `selected.hover`. | A numeric primitive step; a derived-color operation documented below; a semantic heading level (`1`–`6`); a T-shirt size (`xxxSmall`, `xxSmall`, `xSmall`, `small`, `medium`, `large`, `xLarge`, `xxLarge`, `xxxLarge`, `xxxxLarge`); or `none`, `default`, `full`, `hover`, `focus`, `active`, `selected`, `checked`, `disabled`, `visited`. `none` is reserved for explicit zero spacing and `full` for radius tokens. |
| `context` | 0 or 1 | Behavior relative to its surroundings. It cannot repeat because the contexts are mutually exclusive. | `onLight`, `onDark` |

For example:

```text
semantic.color.typography.text.heading.primary.strong.hover.onDark
```

parses as:

```text
layer:      semantic
categories: color, typography
type:       text
item:       heading
variants:   primary, strong
state:      hover
context:    onDark
```

Here `color` is the token's DTCG type and `typography` narrows the design area. `primary` and `strong` are two consecutive variant parts.

## Controlled vocabulary

Allowed `category` values are the DTCG token types:

```text
color, dimension, fontFamily, fontWeight, duration, cubicBezier, number,
strokeStyle, border, transition, shadow, gradient, typography
```

Allowed `type` values are layer- and category-specific. When categories repeat, the first category selects the type vocabulary.

| Layer | First category | Allowed types |
|---|---|---|
| `primitive` | `dimension` | `borderWidth`, `breakpoint`, `fontSize`, `letterSpacing` |
| `primitive` | `number` | `lineHeight`, `opacity` |
| `semantic` | `color` | `background`, `border`, `focusRing`, `icon`, `text` |
| `semantic` | `dimension` | `borderWidth`, `breakpoint`, `radius`, `size`, `space` |
| `semantic` | `number` | `opacity`, `layer` |
| `semantic` | `fontFamily` | `prose`, `ui`, `code` |
| `semantic` | `fontWeight` | `ui` |
| `semantic` | `typography` | `code`, `heading`, `prose`, `ui` |

Primitive categories omitted from this table currently have no `type`; continue directly with the next applicable part. Define new controlled values here before introducing them in tokens. Do not create synonyms such as both `background` and `surface` as types.

## Background surface roles

Use `semantic.color.background.canvas` as the foundational page or application background. Use `semantic.color.background.surface` for standard structural containers such as cards, panels, and content sections. Surface tokens describe purpose rather than nesting depth: repeated or nested containers may reuse `surface` and rely on borders, spacing, or shadows for separation. Add elevation- or context-specific surface variants only when a demonstrated design requirement cannot be met by those mechanisms.

## Border color roles

Use `semantic.color.border.primary` for default boundaries and dividers that need clear separation. Use `semantic.color.border.secondary` for subtle decorative boundaries; do not use the secondary role when a boundary is the only visual cue that identifies a control. Status variants `information`, `warning`, `negative`, and `positive` communicate the meaning of the bounded element rather than a level of border emphasis.

## Focus ring color roles

Use `semantic.color.focusRing` for the visible keyboard-focus indicator around an element. A focus ring is a temporary accessibility indicator rather than the element's normal boundary, so its colors do not belong under `semantic.color.border`, regardless of whether a platform implements the ring with an outline, shadow, or border-like stroke.

The default focus-ring token is stored as `focusRing.$root` so status variants such as `focusRing.warning`, `focusRing.negative`, and `focusRing.positive` can coexist beneath the same group. `$root` is not part of the logical token name.

## Color fill roles

A **fill** is the background color of a bounded visual shape such as a filled button, chip, badge, selected option, or similar element. It is distinct from a structural surface such as a page, card, panel, sheet, or dialog. Structural regions use purpose-specific background items such as `canvas` or `surface`; bounded filled elements use `background.fill`.

`primary` identifies a high-prominence fill and `secondary` a lower-prominence fill. Text and icons placed on those fills use the complete relational items `onPrimaryFill` and `onSecondaryFill`:

```text
semantic.color.background.fill.primary
semantic.color.background.fill.primary.neutral
semantic.color.background.fill.primary.information
semantic.color.background.fill.primary.negative
semantic.color.background.fill.primary.positive
semantic.color.background.fill.ghost
semantic.color.background.fill.ghost.neutral
semantic.color.background.fill.ghost.information
semantic.color.background.fill.ghost.negative
semantic.color.background.fill.ghost.positive
semantic.color.background.fill.selected
semantic.color.text.onPrimaryFill
semantic.color.icon.onPrimaryFill

semantic.color.background.fill.secondary
semantic.color.background.fill.secondary.information
semantic.color.background.fill.secondary.warning
semantic.color.background.fill.secondary.negative
semantic.color.background.fill.secondary.positive
semantic.color.text.onSecondaryFill
semantic.color.icon.onSecondaryFill
```

Interactive fills append `hover` or `active` to the affected background role. Compound states follow their persistent status or selection state:

```text
semantic.color.background.fill.primary.hover
semantic.color.background.fill.primary.negative.active
semantic.color.background.fill.secondary.information.hover
semantic.color.background.fill.ghost.active
semantic.color.background.fill.ghost.negative.active
semantic.color.background.fill.selected.hover
```

The base primary fill provides the default brand-colored high-prominence treatment. Its `neutral`, `information`, `negative`, and `positive` variants provide equivalent treatments for explicit neutral, informational, destructive, and favorable intent. The base and `information` currently share Cerulian Blue values, but remain separate because default brand intent and informational intent may diverge later. They continue using the generic `onPrimaryFill` text and icon roles when the contrasting content color does not change.

Use `background.fill.ghost` when a bounded element intentionally has no visible fill and should reveal its parent background. Its base and the bases of its `neutral`, `information`, `negative`, and `positive` variants all alias the generated transparent primitive. Their hover and active states use Cerulian Blue, Graphite, Cerulian Blue, Coral Red, and Turquoise Green respectively, mirroring the default and variant structure of the primary fill. The base and informational ghost treatments currently share values while retaining distinct intent. Use `background.fill.selected` for selected controls and progress indicators that require a distinct accent fill; indicators displayed on that fill use `icon.onSelectedFill`. A corresponding text token is not defined because the current selected components do not place text inside this fill.

Secondary fills may communicate a status while retaining their lower-prominence treatment. Append the status as a variant and keep background, text, and icon paths parallel:

```text
semantic.color.background.fill.secondary.information
semantic.color.background.fill.secondary.warning
semantic.color.background.fill.secondary.negative
semantic.color.background.fill.secondary.positive

semantic.color.text.onSecondaryFill.information
semantic.color.text.onSecondaryFill.warning
semantic.color.text.onSecondaryFill.negative
semantic.color.text.onSecondaryFill.positive

semantic.color.icon.onSecondaryFill.information
semantic.color.icon.onSecondaryFill.warning
semantic.color.icon.onSecondaryFill.negative
semantic.color.icon.onSecondaryFill.positive
```

Because `fill.primary`, `fill.secondary`, and `onSecondaryFill` each have a base token and child variants, their base values are stored as `$root`; `$root` is not part of the logical token name.

Each background and corresponding content role forms a contrast pair whose values must be selected and reviewed together in each color scheme. Icon fill-content tokens should alias their corresponding text tokens when both content types use the same color. Add interaction states only to properties whose values actually change; a background hover change does not require duplicate text or icon hover tokens when their content color remains constant.

`onPrimaryFill` and `onSecondaryFill` describe the relationship between content and the fill beneath it rather than naming components. Do not use them for text or icons placed directly on the normal canvas or structural surfaces, and do not use `fill` merely because every rendered background is technically painted as a fill.

Slider, checkbox, radio, and switch tokens name component parts that are not fully described by the generic fill roles:

```text
semantic.color.background.slider.progress
semantic.color.background.slider.track
semantic.color.background.slider.track.endstop

semantic.color.background.checkbox
semantic.color.background.checkbox.selected
semantic.color.icon.checkbox.indicator

semantic.color.background.radio
semantic.color.background.radio.selected
semantic.color.icon.radio.indicator

semantic.color.background.switch
semantic.color.background.switch.selected
semantic.color.background.switch.knob
```

The unselected checkbox and radio base tokens alias `fill.ghost.neutral`; their selected variants and slider progress alias `fill.selected`. Slider track aliases the neutral secondary fill, while its endstop aliases the primary border. The base switch token represents its off track, `switch.selected` its on track, and `switch.knob` the movable knob. Base checkbox, radio, switch, and slider-track values use `$root` where child tokens coexist. Interaction tokens append `hover` or `active` where the value changes, for example `background.checkbox.hover` and `background.radio.selected.hover`. Switch tracks and the selected checkbox fill have no interaction-state variants.

## Scale naming

Most scales use one of two naming styles: numeric **magic-number scales** for primitives and **T-shirt-size scales** for semantics. Heading levels and ordinal intent scales are documented exceptions because their established names communicate purpose more clearly than relative size.

### Magic-number scales

Use numeric scale steps for primitive tokens that occupy a defined value scale. Most are produced by a formula or generator; an authoritative imported brand palette may instead place exact source values at the corresponding scale positions as documented below. Steps are normally ordinal identifiers, not literal values or units. They deliberately say where a token sits in the primitive scale without implying where it should be used. The opacity scale documented below is a narrow exception whose step maps directly to a normalized value.

Steps are usually in hundreds (`100`, `200`, `300`) so the order is obvious and there is room between primary steps. `0` may represent absence, and generated scales may add intermediate steps such as `25`, `50`, `150`, or `250`. Do not invent an intermediate step manually; define it in the scale's recipe.

The numeric step occupies one CTI+ `state` part and does not combine with another state:

| Token | Layer | Category | Type | Variant | State |
|---|---|---|---|---|---|
| `primitive.dimension.100` | `primitive` | `dimension` | — | — | `100` |
| `primitive.dimension.fontSize.400` | `primitive` | `dimension` | `fontSize` | — | `400` |
| `primitive.dimension.breakpoint.250` | `primitive` | `dimension` | `breakpoint` | — | `250` |
| `primitive.color.graphite.500` | `primitive` | `color` | — | `graphite` | `500` |
| `primitive.color.dataViz.100` | `primitive` | `color` | — | `dataViz` | `100` |
| `primitive.number.lineHeight.300` | `primitive` | `number` | `lineHeight` | — | `300` |
| `primitive.number.opacity.150` | `primitive` | `number` | `opacity` | — | `150` |

### Imported exact color scales

An authoritative brand palette may use a sparse numeric primitive scale when no generated shared token resolves to the exact source value. Preserve each source value and assign its step from the same positional model as the repository's generated scale rather than copying a legacy source suffix. For a light-to-dark color scale, estimate the position as `(1 - OKHSL lightness) × 1000`, choose the nearest available core step, and use step `50` for a near-white source anchor. Numeric positions remain ordinal identifiers; they do not claim that an imported swatch was generated from the shared recipe.

The imported Lefos neutral palettes therefore use these positions:

| Source swatch | Primitive token |
|---|---|
| `warm-white` | `primitive.color.warm.50` |
| `warm-10` | `primitive.color.warm.100` |
| `warm-20` | `primitive.color.warm.300` |
| `warm-30` | `primitive.color.warm.400` |
| `warm-40` | `primitive.color.warm.600` |
| `warm-50` | `primitive.color.warm.800` |
| `warm-black` | `primitive.color.warm.900` |
| `cool-white` | `primitive.color.cool.50` |
| `cool-10` | `primitive.color.cool.100` |
| `cool-20` | `primitive.color.cool.300` |
| `cool-30` | `primitive.color.cool.500` |
| `cool-40` | `primitive.color.cool.700` |
| `cool-50` | `primitive.color.cool.800` |
| `cool-black` | `primitive.color.cool.900` |

Leave unoccupied positions absent. Do not invent interpolated swatches merely to complete a scale, and do not substitute an approximate generated color for an exact brand value. Consumers still choose semantic tokens; the numeric primitive position does not encode usage.

### Derived primitive colors

A manually authored derived color appends its operation after the complete named source token path. Use `tint` for a white mix, `shade` for a black mix, and `<partner>Mix` for a mix with another named source color. Examples include `terracotta.tint`, `sage.shade`, and `tidalBlue.midnightMix`.

These operation names are repository conventions rather than DTCG keywords. The token value must contain the complete resolved DTCG color because DTCG does not define a portable expression that applies a mix operation to another color token.

For a contextual alpha treatment, keep the source primitive opaque and compose the consuming semantic color with property-level JSON Pointer references. Reference the primitive's `colorSpace`, `components`, and optional `hex`, then set `alpha` directly or reference a number token. Alpha values are normalized from `0` to `1`, so 50% opacity is `0.5`. Do not add a one-off alpha sibling to a primitive color scale solely to express one semantic use.

### Opacity scale

The generated primitive opacity scale uses thousandths so its token step maps directly to the normalized number required by DTCG color alpha values:

```text
value = step / 1000
```

Token `0` is fully transparent, token `1000` is fully opaque, token `150` is 15% opacity with a value of `0.15`, and token `400` is 40% opacity with a value of `0.4`. Add only opacity steps required by a semantic token; do not populate unused values speculatively.

### Ordered categorical color scale

`primitive.color.dataViz` is an ordered categorical palette rather than a light-to-dark scale. Its `100` through `1000` steps encode the recommended series order; they do not indicate lightness or prominence. Preserve this order when assigning colors to categories.

### T-shirt-size scales

Use T-shirt sizes for semantic scales because they communicate relative intended size without exposing the primitive step. The controlled order is:

```text
xxxSmall → xxSmall → xSmall → small → medium → large → xLarge → xxLarge → xxxLarge → xxxxLarge
```

The T-shirt size also occupies the CTI+ `state` part:

```text
semantic.dimension.size.small
semantic.dimension.space.gap.medium
semantic.dimension.space.padding.xLarge
semantic.dimension.space.control.padding.inline.large
```

Generic padding uses the extended `xxxSmall` through `xxxxLarge` range because container insets need both hairline and expansive options. Other purpose-specific scales use contiguous subsets when the omitted extremes are not useful. For example, general sizing uses `xxSmall` through `xLarge`, breakpoints use `xSmall` through `xLarge`, generic gap uses `xxSmall` through `xLarge`, control block padding and gap use `small` through `large`, and control inline padding uses `xSmall` through `large`. `semantic.dimension.space.padding.none` is a narrow named exception that represents an intentional zero value below the T-shirt scale.

Each semantic token aliases a primitive magic-number token. The mapping does not need to be numerically adjacent and may change by brand, density, or future design decisions without changing the semantic token consumed by a component. For example, `small`, `medium`, and `large` could map to primitive steps `100`, `200`, and `400`.

Use a magic-number scale when defining generated raw values. Use a T-shirt-size scale when consumers need a relative size choice. Do not expose primitive numbers through semantic names, and do not force T-shirt sizing onto a token whose name already expresses a specific purpose rather than a relative size.

The semantic radius scale uses the contiguous `small`, `medium`, and `large` subset. `semantic.dimension.radius.default` is the preferred general-purpose token; consumers should select a T-shirt size only when a component has a specific shape requirement. `semantic.dimension.radius.full` is a narrow named exception for pills and circles because complete roundness is an extent, not a relative T-shirt size. Its primitive source follows the same exception as `primitive.dimension.radius.full` rather than exposing the oversized implementation value in the name.

### Heading-level scale exception

Semantic heading scales use levels `1` through `6` because they follow the familiar document heading hierarchy rather than exposing primitive scale steps. Level `1` has the highest heading prominence and level `6` the lowest. The number occupies one CTI+ `state` part:

```text
semantic.typography.heading.marketing.1
semantic.typography.heading.marketing.6
semantic.typography.heading.app.1
semantic.typography.heading.app.6
```

A marketing display style sits above level `1` but remains part of the marketing heading family. It uses the `display` variant before the numeric heading states:

```text
semantic.typography.heading.marketing.display
semantic.typography.heading.marketing.1
```

This is a narrow exception for `semantic.typography.heading`; do not use single-digit numbers for other semantic scales. Use T-shirt sizes when the choice represents relative physical size without a conventional document level.

### Ordinal intent scales

Use `primary`, `secondary`, and `tertiary` when parallel semantic choices are ranked by purpose, prominence, or priority rather than by a measurable size:

```text
semantic.typography.prose.primary
semantic.typography.prose.secondary
semantic.typography.ui.primary
semantic.typography.ui.secondary
semantic.typography.ui.tertiary
```

`primary` is the principal or default choice, `secondary` supports it, and `tertiary` provides a lower-emphasis option. These names occupy the CTI+ `variant` part, not the `state` part. They allow the underlying primitive size, weight, or color mapping to change without renaming the semantic role.

Use this scale for role-based hierarchies such as prose styles, general UI text, action emphasis, or text colors. Do not use it for document headings, interaction states, or choices that merely mean physically smaller or larger. Physical control dimensions therefore use `small`, `medium`, and `large`, not `primary`, `secondary`, and `tertiary`. Extend it with `quaternary`, `quinary`, and later ordinal names only when the product has stable, documented roles for those levels; do not add levels speculatively.

## Base values with `$root`

When a base token also has child variants or states, store the base value in the DTCG `$root` token instead of adding a `default` child:

```json
"selected": {
  "$root": { "$value": "{primitive.color.cerulianBlue.500}" },
  "hover": { "$value": "{primitive.color.cerulianBlue.600}" }
}
```

The logical token names are `semantic.color.background.fill.selected` and `semantic.color.background.fill.selected.hover`; `$root` is DTCG storage syntax and is not another CTI+ name part. Use `default` only when it has a specific domain meaning rather than merely identifying the base value.

## Rules

- Use lower camel case for every name part: `fontSize`, `borderWidth`, `sansSerif`, `extraBold`, `iconButton`, and `onDark`. Numeric scale steps and the reserved DTCG `$root` name are exceptions.
- Controlled values must match their documented spelling exactly.
- `primitive.dimension.100` is a valid token; `primitive.dimension` is only a group.
- Keep repeated parts consecutive and preserve the CTI+ order.
- Omit parts that add no meaning. `none` is allowed only when it is a documented semantic choice for an explicit zero value, such as no padding; never use it as a structural placeholder.
- Primitive names describe a value family or scale, never usage: `primitive.color.graphite.500`.
- Semantic names describe intent, never appearance or primitive value: prefer `semantic.color.text.primary` over `semantic.color.text.gray900`.
- Do not encode a theme (`light` or `dark`) in a name. Resolver modifiers provide themes. `onLight` and `onDark` describe contrast context, not the active theme.

## Examples

```text
primitive.color.graphite.500
primitive.color.dataViz.100
primitive.color.transparent
primitive.dimension.100
primitive.dimension.fontSize.400
primitive.dimension.breakpoint.250
primitive.dimension.radius.100
primitive.dimension.radius.full
primitive.number.lineHeight.400
primitive.number.opacity.150
primitive.fontFamily.sansSerif
primitive.fontWeight.extraBold

semantic.color.background.canvas
semantic.color.border.primary
semantic.color.border.negative
semantic.color.focusRing
semantic.color.focusRing.warning
semantic.color.background.fill.primary
semantic.color.text.onPrimaryFill
semantic.color.icon.onPrimaryFill
semantic.color.text.onSecondaryFill.information
semantic.color.icon.onSecondaryFill.information
semantic.color.background.button.primary.strong.hover
semantic.color.background.option.selected.hover
semantic.color.background.menu.primary.trigger.icon.hover
semantic.color.text.link
semantic.dimension.breakpoint.medium
semantic.number.opacity.disabled
semantic.dimension.radius.default
semantic.dimension.radius.small
semantic.dimension.radius.full
semantic.dimension.radius.button
semantic.dimension.size.medium
semantic.dimension.space.gap.medium
semantic.dimension.space.padding.none
semantic.dimension.space.padding.medium
semantic.dimension.space.control.padding.block.medium
semantic.dimension.space.control.padding.inline.medium
semantic.dimension.space.control.gap.medium
semantic.fontFamily.prose
semantic.typography.heading.marketing.display
semantic.typography.heading.marketing.1
semantic.typography.heading.app.6
semantic.typography.prose.primary
semantic.typography.ui.secondary
semantic.typography.code.primary
```

Adapted from Kevin Muldoon's CTI+ approach in [“How to Name Tokens in a Design System”](https://app.hopin.com/events/medium-day-2023/replay/Um91bmR0YWJsZVJlY29yZGluZ0FyY2hpdmU6MTkzODcy).

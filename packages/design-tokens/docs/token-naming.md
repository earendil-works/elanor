# Token Naming

Names use an adapted **CTI+** taxonomy:

```text
<layer>.<category+>[.<type>][.<item>][.<variant...>][.<subitem...>][.<state...>][.<context>]
```

Keep this order. Every name needs `layer`, `category`, and at least one more meaningful part. The build target supplies the domain (`radius`, `pi`, `earendil`, or `lefos`); do not repeat it in shared names.

## Parts and repeatability

Repeated roles occupy consecutive parts and must add meaning.

| Part       | Cardinality               | Meaning / vocabulary                                                                                |
| ---------- | ------------------------- | --------------------------------------------------------------------------------------------------- |
| `layer`    | 1                         | `primitive` or `semantic`                                                                           |
| `category` | 1+                        | First matches DTCG `$type`; later categories narrow the design area                                 |
| `type`     | 0–1 primitive; 1 semantic | Group or usage; controlled below                                                                    |
| `item`     | 0–1                       | Element, component, or relational role (`link`, `canvas`, `onPrimaryFill`); usually a singular noun |
| `variant`  | 0+                        | Successive distinctions, such as `primary.strong`                                                   |
| `subitem`  | 0+                        | Nested parts, such as `trigger.icon`                                                                |
| `state`    | 0+                        | Scale step, derivation, size, or UI state; compound states may use `selected.hover`                 |
| `context`  | 0–1                       | `onLight` or `onDark`; mutually exclusive surroundings, not themes                                  |

State vocabulary:

- Numeric primitive steps or [derived-color operations](#derived-primitive-colors).
- Semantic heading levels `1`–`6`.
- T-shirt sizes: `xxxSmall`, `xxSmall`, `xSmall`, `small`, `medium`, `large`, `xLarge`, `xxLarge`, `xxxLarge`, `xxxxLarge`.
- `none`, `default`, `full`, `rest`, `hidden`, `visible`, `pulse`, `hover`, `focus`, `active`, `selected`, `checked`, `disabled`, `visited`. Reserve `none` for explicit zero spacing and `full` for radii. `rest` is the value when nothing moves (`scale.rest`, `travel.rest`); `hidden` and `visible` are the ends of a fade; `pulse` is the far end of a repeating loading pulse.

Examples:

```text
semantic.color.typography.text.heading.primary.strong.hover.onDark

layer:      semantic
categories: color, typography
type:       text
item:       heading
variants:   primary, strong
state:      hover
context:    onDark
```

```text
primitive.color.graphite.500

layer:    primitive
category: color
variant:  graphite
state:    500
```

Primitive color families such as `graphite` and `dataViz` are `variant` parts.

## Controlled vocabulary

Categories are DTCG types:

```text
color, dimension, fontFamily, fontWeight, duration, cubicBezier, number,
strokeStyle, border, transition, shadow, gradient, typography
```

The first category selects the type vocabulary:

| Layer       | First category | Allowed types                                                    |
| ----------- | -------------- | ---------------------------------------------------------------- |
| `primitive` | `dimension`    | `borderWidth`, `breakpoint`, `fontSize`, `letterSpacing`         |
| `primitive` | `number`       | `layer`, `lineHeight`, `opacity`, `scale`                        |
| `semantic`  | `color`        | `background`, `border`, `focusRing`, `icon`, `text`              |
| `semantic`  | `dimension`    | `borderWidth`, `breakpoint`, `radius`, `size`, `space`, `travel` |
| `semantic`  | `number`       | `opacity`, `layer`, `scale`                                      |
| `semantic`  | `fontFamily`   | `prose`, `ui`, `code`                                            |
| `semantic`  | `fontWeight`   | `emphasis`, `ui`                                                 |
| `semantic`  | `typography`   | `code`, `heading`, `primary`, `prose`, `secondary`, `ui`         |
| `semantic`  | `transition`   | `feedback`, `fade`, `movement`, `pulse`                          |

Context-neutral tokens stand directly under their category because they apply in any text context: `semantic.fontWeight.emphasis`, and `semantic.typography.primary` and `.secondary`, which the `textContext` modifier resolves to the UI styles in interfaces and the prose styles in long-form content. `fontWeight.ui.*` and `typography.ui.*` are for interface text only.

Omitted primitive categories have no `type`; continue with the next applicable part. Document new controlled values here before use. Do not add synonyms such as both `background` and `surface` as types.

## Background surface roles

`semantic.color.background.canvas` is the page/application background; `background.surface` is for cards, panels, and sections. Surfaces express purpose, not nesting depth. Reuse them with borders, spacing, or shadows; add elevation/context variants only when those cannot meet a demonstrated need.

## Border color roles

`semantic.color.border.primary` provides clear boundaries and dividers. `border.secondary` is decorative: never use it as the only cue identifying a control. Status variants `information`, `warning`, `negative`, and `positive` describe meaning, not emphasis.

## Focus ring color roles

`semantic.color.focusRing` is the keyboard-focus indicator, distinct from normal borders regardless of implementation (outline, shadow, or stroke). Variants include `warning`, `negative`, and `positive`.

## Color fill roles

Use `background.fill` for bounded shapes (buttons, chips, badges, selected options), not structural pages, panels, or dialogs. Primary fills have high prominence; secondary fills have lower prominence. Pair them with relational content roles:

```text
semantic.color.background.fill.primary
semantic.color.text.onPrimaryFill
semantic.color.icon.onPrimaryFill

semantic.color.background.fill.secondary.information
semantic.color.text.onSecondaryFill.information
semantic.color.icon.onSecondaryFill.information
```

- **Primary:** base brand treatment plus `neutral`, `information`, `negative`, and `positive`. Base and information currently share Cerulian Blue but retain distinct intent. All primary variants use the shared `text.onPrimaryFill` and `icon.onPrimaryFill`; add a variant-specific content token only when its color must differ.
- **Secondary:** base plus `information`, `warning`, `negative`, and `positive`. Keep background, text, and icon status paths parallel, as above.
- **Ghost:** base plus the primary variants. Resting values are transparent, so the parent shows through. Hover/active use Cerulian Blue (base/information), Graphite (neutral), Coral Red (negative), or Turquoise Green (positive).
- **Selected:** `background.fill.selected` is an accent for selected controls and progress indicators. Use `icon.onSelectedFill` for indicators; no text role exists because current components put no text inside this fill.
- **Data visualization:** `background.fill.dataViz.100` through `.1000` alias the ordered `primitive.color.dataViz` palette for chart series and meter indicators. They are categorical, not status colors; assign them in series order. No content roles exist.
- **Media:** `background.media` is the stage of full-screen media, such as an image viewer, and `background.fill.media` the controls laid over it; with `text.onMedia` and `icon.onMedia` they stay dark and light in both color schemes, so pictures read as they are.
- **Participants:** `background.fill.participant.1` through `.6` tell a conversation's participants apart: each person's bubble takes one, with their name in `text.onParticipantFill.<n>` and icons in `icon.onParticipantFill.<n>`. Steps are identities, not status colors; assign them in order or by a stable hash of the participant's id. Message text on them is `text.primary`; names also meet text contrast on the page.

Append interaction states after intent or selection:

```text
semantic.color.background.fill.primary.hover
semantic.color.background.fill.primary.negative.active
semantic.color.background.fill.secondary.information.hover
semantic.color.background.fill.ghost.negative.active
semantic.color.background.fill.selected.hover
```

Review each background/content contrast pair together in every scheme. Icons should alias matching text colors; add hover/active tokens only where values change.

Do not use `onPrimaryFill` or `onSecondaryFill` on canvas or structural surfaces. They describe content-to-fill relationships, not components.

Component parts not fully described by generic fills have their own paths:

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
semantic.color.background.skeleton
```

Checkbox/radio bases alias `fill.ghost.neutral`; selected variants and slider progress alias `fill.selected`. Slider track aliases the neutral secondary fill; its endstop aliases the primary border. Switch base is its off track, `selected` its on track, and `knob` its movable part. `skeleton` is a loading placeholder, visible on canvas and surfaces in both schemes; it pulses between `opacity.visible` and `opacity.pulse` over `transition.pulse`.

Append `hover`/`active` only for changes, such as `background.checkbox.hover` or `background.radio.selected.hover`. Switch tracks and selected checkbox fills have no interaction variants.

## Code text roles

Syntax highlighting uses `semantic.color.text.code`. Its `$root` colors plain source code; child roles name syntax categories, not hues:

```text
semantic.color.text.code
semantic.color.text.code.comment
semantic.color.text.code.punctuation
semantic.color.text.code.keyword
semantic.color.text.code.function
semantic.color.text.code.variable
semantic.color.text.code.string
semantic.color.text.code.number
semantic.color.text.code.type
```

`punctuation` also covers operators, `keyword` tag names, `variable` parameters, properties, and attribute names, `number` literals such as `true`, `false`, and `null`, and `type` classes and built-ins. Code sits on the secondary fill used by code snippets and inline code, so every role must meet text contrast against it in both color schemes.

## Motion roles

Transitions are DTCG `transition` composites. Each references one primitive duration, `primitive.duration.0` as its delay, and one primitive easing, so a role is a single token. The type says what changes, which also decides what happens when the reader prefers reduced motion:

| Type       | Use for                                                                | Reduced motion |
| ---------- | ---------------------------------------------------------------------- | -------------- |
| `feedback` | Color, background, border, and shadow changes, such as hover and press | Unchanged      |
| `fade`     | Opacity when something appears or disappears                           | Unchanged      |
| `movement` | Position, size, scale, rotation, and height                            | Instant        |
| `pulse`    | A repeating opacity pulse while content loads, such as a skeleton      | Unchanged      |

```text
semantic.transition.feedback
semantic.transition.fade
semantic.transition.pulse
semantic.transition.movement.popup
semantic.transition.movement.disclosure
semantic.transition.movement.indicator
semantic.transition.movement.drawer
```

Items under `movement` name a purpose (`popup`, `disclosure`, `indicator`) or, as component tokens, a component (`drawer`, `navigationMenu`, `tableOfContents.indicator`). Add a component item only when no shared purpose fits. How far something moves uses the same item names in its own category: `semantic.number.scale.popup` and `semantic.dimension.travel.popup`, with `rest` for the value when nothing moves. Direction is a sign in the component, and rotation stays structural (DTCG has no angle type).

Primitive easings are named by shape, never by use: `primitive.cubicBezier.<direction>[.<curve>]`. Directions are `linear`, `easeIn`, `easeOut`, and `easeInOut`; `$root` is the CSS keyword curve; curve families from gentle to strong are `quad`, `cubic`, `quart`, `quint`, and `expo`, and `back` overshoots. Add only standard curves.

## Scale naming

### Magic-number scales

Primitive numeric steps identify positions, not usage or literal units. Usually spaced by `100`, they leave room for intermediate steps; `0` may mean absence. Define generated intermediate steps in recipes, never by hand. Opacity, layer, scale, and duration are the direct-value exceptions below.

A numeric step occupies one `state` part and cannot combine with another state:

```text
primitive.dimension.100
primitive.dimension.fontSize.400
primitive.dimension.breakpoint.250
primitive.color.graphite.500
primitive.number.lineHeight.300
primitive.number.opacity.150
```

### Imported exact color scales

When no generated token exactly matches an authoritative brand value, preserve that value in a sparse numeric scale. Estimate its position as `(1 - OKHSL lightness) × 1000`, select the nearest available core step, and use `50` for a near-white anchor. Do not copy legacy suffixes or imply the swatch was generated.

Lefos mappings:

| Source swatch | Primitive token            |
| ------------- | -------------------------- |
| `warm-white`  | `primitive.color.warm.50`  |
| `warm-10`     | `primitive.color.warm.100` |
| `warm-20`     | `primitive.color.warm.300` |
| `warm-30`     | `primitive.color.warm.400` |
| `warm-40`     | `primitive.color.warm.600` |
| `warm-50`     | `primitive.color.warm.800` |
| `warm-black`  | `primitive.color.warm.900` |
| `cool-white`  | `primitive.color.cool.50`  |
| `cool-10`     | `primitive.color.cool.100` |
| `cool-20`     | `primitive.color.cool.300` |
| `cool-30`     | `primitive.color.cool.500` |
| `cool-40`     | `primitive.color.cool.700` |
| `cool-50`     | `primitive.color.cool.800` |
| `cool-black`  | `primitive.color.cool.900` |

Leave gaps; do not interpolate missing swatches or substitute approximate generated colors. Consumers still use semantic tokens.

### Derived primitive colors

Append operations after the complete named source path: `tint` for white mixes, `shade` for black, `<partner>Mix` for another named color (`terracotta.tint`, `sage.shade`, `tidalBlue.midnightMix`). These are repository conventions, not DTCG expressions; store the complete resolved DTCG color.

For contextual alpha, keep the primitive opaque. Compose the semantic color using property-level JSON Pointer references to its `colorSpace`, `components`, and optional `hex`, then set `alpha` or reference a number token. Alpha is normalized `0`–`1` (`0.5` = 50%). Do not add one-off alpha siblings to primitive scales.

### Opacity scale

`primitive.number.opacity.<step>` maps directly to a normalized value (`150` is `0.15`); see the [formula](token-generation.md#opacity-scale). Add only steps required by semantic tokens.

### Duration and transform scale

`primitive.duration.<step>` is its value in milliseconds (`150` is `150ms`, `0` is instant). `primitive.number.scale.<step>` maps like opacity, with `1000` as an element's own size (`980` is `0.98`). See the [formulas](token-generation.md#duration-scale).

### Layer scale

`primitive.number.layer.<step>` is its own z-index value (`100` stacks at `100`); see the [formula](token-generation.md#layer-scale). `primitive.number.layer.below` is `-1`: a negative step cannot be a name, because CSS custom property names drop the minus sign, so `-1` and `1` would collide.

### Ordered categorical color scale

`primitive.color.dataViz.100` through `.1000` encode recommended series order, not lightness or prominence. Preserve that order when assigning categories.

### T-shirt-size scales

Semantic relative sizes use the controlled T-shirt order listed above, in the `state` part:

```text
semantic.dimension.size.small
semantic.dimension.space.gap.medium
semantic.dimension.space.flow.small
semantic.dimension.space.padding.xLarge
semantic.dimension.space.control.padding.inline.large
```

Use contiguous subsets:

| Scale                                      | Range                  |
| ------------------------------------------ | ---------------------- |
| Generic padding                            | `xxxSmall`–`xxxxLarge` |
| General size                               | `xxxSmall`–`xLarge`    |
| Generic gap                                | `xxSmall`–`xLarge`     |
| Breakpoints, flow spacing                  | `xSmall`–`xLarge`      |
| Control block padding, control gap, radius | `small`–`large`        |
| Control inline padding                     | `xSmall`–`large`       |

`semantic.dimension.space.padding.none` is intentional zero below the size scale. Each size aliases a primitive; mappings may skip steps and change by brand or density without renaming consumers (`small`/`medium`/`large` might map to `100`/`200`/`400`). Never expose primitive steps in semantic names or force relative sizing onto purpose-specific roles.

Prefer `semantic.dimension.radius.default`; choose a size only for a specific shape requirement. `semantic.dimension.radius.full` and `primitive.dimension.radius.full` are exceptions for pills/circles: complete roundness is an extent, not a relative size.

### Heading-level scale exception

Only `semantic.typography.heading` uses numeric levels `1`–`6`, highest to lowest prominence, in the `state` part:

```text
semantic.typography.heading.marketing.1
semantic.typography.heading.marketing.6
semantic.typography.heading.app.1
semantic.typography.heading.app.6
```

`semantic.typography.heading.marketing.display` sits above level `1`; `display` is a variant before numeric heading states. Do not use single-digit levels for other semantic scales; physical size uses T-shirt names.

### Ordinal intent scales

Use `primary`, `secondary`, and `tertiary` for principal, supporting, and lower-emphasis roles. These are `variant` parts, not states:

```text
semantic.typography.prose.primary
semantic.typography.prose.secondary
semantic.typography.ui.primary
semantic.typography.ui.secondary
semantic.typography.ui.tertiary
```

Use ordinals for prose/UI styles, action emphasis, or text colors—not headings, interactions, or physical sizes. Add `quaternary`, `quinary`, or later levels only for stable, documented roles.

## Base values with `$root`

Store a base with child variants/states in `$root`, not a `default` child:

```json
"selected": {
  "$root": { "$value": "{primitive.color.cerulianBlue.500}" },
  "hover": { "$value": "{primitive.color.cerulianBlue.600}" }
}
```

Logical names are `semantic.color.background.fill.selected` and `semantic.color.background.fill.selected.hover`. `$root` is storage syntax, not a name part. This applies to every base with children, including `focusRing`, `fill.primary`, `fill.secondary`, `onSecondaryFill`, and the checkbox, radio, switch, and slider-track bases. Use `default` only for a specific domain meaning.

Reference a base as `{semantic.color.focusRing.$root}`. Inside a composite part, use a JSON Pointer instead, such as `"timingFunction": {"$ref": "#/primitive/cubicBezier/easeOut/$root/$value"}`: the DTCG schema rejects `$root` in curly-brace references there.

## Rules

- Use lower camel case (`fontSize`, `extraBold`, `iconButton`, `onDark`), except numeric steps and reserved `$root`.
- Match controlled spelling exactly; preserve CTI+ order and keep repeated roles consecutive.
- Omit meaningless parts; never use `none` as a placeholder.
- `primitive.dimension.100` is a token; `primitive.dimension` is only a group.
- Primitives name value families/scales; semantics name intent. Prefer `semantic.color.text.primary`, not `semantic.color.text.gray900`.
- Do not encode themes (`light`/`dark`) in names; resolver modifiers supply them. `onLight`/`onDark` describe contrast context.

## Examples

Additional name shapes:

```text
primitive.color.transparent
primitive.fontFamily.sansSerif
primitive.fontWeight.extraBold
semantic.color.background.button.primary.strong.hover
semantic.color.background.option.selected.hover
semantic.color.background.menu.primary.trigger.icon.hover
semantic.color.text.link
semantic.dimension.radius.button
semantic.fontFamily.prose
semantic.typography.code.primary
```

Adapted from Kevin Muldoon's CTI+ approach in [“How to Name Tokens in a Design System”](https://app.hopin.com/events/medium-day-2023/replay/Um91bmR0YWJsZVJlY29yZGluZ0FyY2hpdmU6MTkzODcy).

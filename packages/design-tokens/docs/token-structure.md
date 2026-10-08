# Token File Structure

## Top-level layout

```text
packages/design-tokens/tokens/
├── shared/                         # Tokens common to all brands
│   ├── primitive/                  # Raw design values
│   │   ├── color.tokens.json
│   │   ├── dimension.tokens.json
│   │   ├── fontFamily.tokens.json
│   │   ├── fontWeight.tokens.json
│   │   └── number.tokens.json
│   └── semantic/                   # Purpose-driven and component tokens
│       ├── color/
│       │   ├── light.tokens.json
│       │   └── dark.tokens.json
│       ├── dimension.tokens.json
│       ├── number.tokens.json
│       ├── fontFamily.tokens.json
│       └── typography.tokens.json
├── radius/                         # Radius brand overrides
├── pi/                             # Pi brand overrides
├── earendil/                       # Earendil brand overrides
├── lefos/                          # Lefos brand overrides
├── radius.resolver.json            # Resolver for Radius
├── pi.resolver.json                # Resolver for Pi
├── earendil.resolver.json          # Resolver for Earendil
└── lefos.resolver.json             # Resolver for Lefos
```

Empty semantic files are placeholders until their token types are implemented. Each placeholder contains only top-level DTCG metadata, including `$schema` and `$type`, and is not registered in a resolver yet. The root `$type` is forward-declared intent only; when the file is populated and registered as a resolver source, the type must move to the file's typed group as described in [File organization](#file-organization).

### How it works

Each brand resolver loads `shared/` as its base. Brand folders start empty; when a brand needs to deviate from the shared defaults, add an override file and register it as the final layer in that brand's resolver. Anything in that layer takes precedence over the shared equivalent.

The resolvers currently load the populated shared primitive color, dimension, number, font family, and font weight files, followed by the shared semantic dimension, number, font family, and typography files and the selected light or dark semantic color context. Register any future placeholder files as resolver sources when they are populated.

---

## Token layers

Inside `shared/` and any brand folder, tokens are split into two layers:

```text
shared/
├── primitive/   # Raw design values
└── semantic/    # Purpose-driven tokens (semantic and component)
```

All tokens in both layers follow the CTI+ conventions in
[`token-naming.md`](token-naming.md).

### Primitive tokens

Primitive tokens capture **raw, unopinionated values**. They include color palettes, spacing scales, font families, and more. They are the single source of truth for atomic design decisions.

**Rules:**

- Primitive tokens must **never be used directly** in components or layouts.
- Their `$value` is always a raw literal, never an alias referencing another token.
- They exist to be referenced by semantic and component tokens.
- Generator-owned token paths must be changed through their recipe or generator. Generated tokens carry a `com.earendil-works.generation` `$extensions` marker; unmarked paths in the same type file may be authored manually.

Examples: `primitive.color.cerulianBlue.500`, `primitive.color.dataViz.100`, `primitive.dimension.100`, `primitive.dimension.fontSize.400`, `primitive.fontFamily.sansSerif`

The color generator creates OKHSL color scales as DTCG `oklch` color tokens with `hex` fallbacks at `primitive.color` in `color.tokens.json`, alongside standalone `white`, `black`, and zero-alpha `transparent` tokens. The manually authored `primitive.color.dataViz` group contains the ordered categorical palette used by data visualizations. The dimension generator creates a linear 8px dimension scale directly under `primitive.dimension` in `dimension.tokens.json`, with token `25` equal to `1px`, token `200` equal to `8px`, and values output in `rem`. The breakpoint generator creates a linear 16rem scale under `primitive.dimension.breakpoint`; its selected `250`, `300`, `400`, `500`, and `600` steps produce the shared `40rem`, `48rem`, `64rem`, `80rem`, and `96rem` viewport thresholds. The border-width generator creates a doubling `1px`, `2px`, and `4px` scale under `primitive.dimension.borderWidth`. The radius generator creates the rem equivalents of `3px`, `6px`, and `12px` under `primitive.dimension.radius`, plus an oversized rem-based `full` token for pills and circles. The opacity generator creates normalized number tokens under `primitive.number.opacity`, with token `0` fully transparent and token `1000` fully opaque. The typography generator currently creates mathematical font size and line height scales. Font sizes are DTCG dimension tokens in `rem` units at `primitive.dimension.fontSize` and are written to `dimension.tokens.json`. Line heights are unitless DTCG number ratios at `primitive.number.lineHeight` and are written to `number.tokens.json`. Their ratios are calculated from pixel-grid-snapped line heights so they can be referenced by DTCG typography composite tokens. Line heights below the `24px` font-size tier use a 4px half-grid for finer control; line heights from `24px` upward use the primary 8px layout grid so text blocks can share the system's vertical rhythm. The manually authored foundations add `primitive.dimension.letterSpacing.normal`, named OpenType weights under `primitive.fontWeight`, and example fallback stacks under `primitive.fontFamily`. See [`token-generation.md`](token-generation.md#why-line-heights-snap-to-a-grid) for the rationale and limitations.

See [`token-generation.md`](token-generation.md) for the scale formula, recipe format, and generation commands.

### Semantic and component tokens

Semantic and component tokens both live under the `semantic/` folder. They assign **purpose and meaning** to primitive values.

**Semantic tokens** describe intent across the system:

- `color.text.primary` can reference a dark Graphite step in light mode or a light Graphite step in dark mode.
- `semantic.dimension.space.gap.medium` references `{primitive.dimension.400}`.
- `semantic.dimension.breakpoint.medium` references `{primitive.dimension.breakpoint.400}`.
- `semantic.number.opacity.disabled` references `{primitive.number.opacity.400}`.
- `semantic.dimension.space.padding.xxxSmall` references `{primitive.dimension.25}`.
- `semantic.dimension.space.control.padding.inline.medium` references `{primitive.dimension.300}`.
- A prose typography token can reference `{primitive.dimension.fontSize.300}`.

**Component tokens** target specific UI elements:

- `button.background.color` references `color.action.primary`.
- `card.border.radius` references `dimension.radius.control`.

**Rules:**

- Their `$value` is an alias such as `{primitive.color.cerulianBlue.500}` for brandable design values. The narrow exception is `semantic.number.layer`: structural stacking constants may be literal numbers. Do not create a duplicate primitive solely to alias a layer constant.
- They should be the **only tokens used** in components and layouts.
- This indirection allows theme switching and brand overrides without changing components.

Layer tokens describe a stacking relationship, not an ever-increasing global z-index scale. `background` places decoration behind content within an isolated stacking context. `overlay` is available when a host application needs an explicit overlay layer; do not assign it to individual parts of an otherwise document-ordered portal family. Base UI popups use portal order above an isolated application root, including popups nested inside a modal.

Semantic roles describe design intent rather than a single CSS property. An icon token may be assigned to `color` for `currentColor` inheritance, a border token may paint a separator background, and a filled-control border may share its fill token. These do not need duplicate aliases. Conversely, do not choose a spacing token to size an unrelated element just because its current value matches. Use size roles for dimensions and derive dependent geometry with CSS calculations; arithmetic signs and ratios are structural, not additional tokens.

---

## File organization

### Inside `primitive/`

Use one file per DTCG token type, without modifier folders. Declare that type once as a `$type` on the file's typed group (for example `primitive.dimension`); every token below the group inherits it. Never set `$type` at the document root: resolver sources merge into one shared group tree, so root-level `$type` and `$description` clash across files and the last source silently wins, mis-typing every token in the merged namespace:

```text
primitive/
├── color.tokens.json
├── dimension.tokens.json
├── fontFamily.tokens.json
├── fontWeight.tokens.json
└── number.tokens.json
```

Common DTCG types include `color`, `dimension`, `typography`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, and `number`. A token's conceptual category does not determine its file or type namespace. For example, the typography scale's font sizes belong under `primitive.dimension` in `dimension.tokens.json`, while its line heights belong under `primitive.number` in `number.tokens.json`.

Generators return typed patches. The generation runner declares each patch's type as a `$type` on the corresponding type group, stamps generated token leaves with source-only ownership metadata, and applies the patch to `<type>.tokens.json` in the output directory mirrored from the recipe path. It deep-merges groups, replaces generated leaves at matching paths, sweeps marked leaves that recipes no longer emit, and preserves unmarked manual leaves. Identical or structurally overlapping generated token paths and conflicting group types are rejected. Placeholder files remain metadata-only until their token type is implemented.

### Inside `semantic/`

Organization depends on whether the category has **modifiers**. Modifiers select context-dependent token values such as color scheme or density. A breakpoint threshold is not itself a modifier: it is a static dimension token that defines where a viewport-responsive context begins.

If a category has no modifiers, use one flat file:

```text
semantic/
├── dimension.tokens.json     # Spacing and radii; the same in light and dark
├── number.tokens.json        # Unitless role values such as state opacity
├── fontFamily.tokens.json    # Purpose-driven font stacks; the same across themes
└── typography.tokens.json    # Type styles; the same across themes
```

If a category has one modifier, use a folder named after the category. Inside it, add one file per modifier context:

```text
semantic/
└── color/                    # Color values change per color scheme
    ├── light.tokens.json
    └── dark.tokens.json
```

If a category has multiple modifiers, nest folders further, for example `color/light/high-contrast.tokens.json`.

Static breakpoint aliases remain in `semantic/dimension.tokens.json` alongside other mode-independent dimensions. CSS custom properties cannot be used in media-query conditions, so CSS tooling must resolve and inline their values at build time rather than emitting `var(--semantic-dimension-breakpoint-*)` inside an `@media` condition.

Common modifiers:

| Modifier      | Example contexts                                       | Applies to                             |
| ------------- | ------------------------------------------------------ | -------------------------------------- |
| `colorScheme` | `light`, `dark`                                        | `color`                                |
| `viewport`    | `base`, `xSmall`, `small`, `medium`, `large`, `xLarge` | Token values with responsive overrides |
| `density`     | `comfortable`, `compact`                               | `dimension`                            |

A `viewport` modifier is appropriate only when token values vary by available viewport width and the build pipeline explicitly maps each context to a breakpoint threshold. Configure modifier names and contexts in the resolver's `modifiers` section.

---

## Resolver files

Each brand has a resolver at `packages/design-tokens/tokens/<brand>.resolver.json`. As token categories are populated, the resolver should:

1. Load shared primitive tokens as the foundation.
2. Load shared mode-independent semantic tokens.
3. Apply modifiers such as light or dark color scheme.
4. Apply brand-specific overrides from `packages/design-tokens/tokens/<brand>/`.

The intended resolution order is shared primitives, shared semantics, modifiers, and then brand overrides. Sources are combined in array order. When two sources define the same token path, the later source wins.

To add a shared token file, register it in the appropriate resolver `set` or `modifier` and include that entry in `resolutionOrder`.

To add a brand override, add the token file under the brand folder, register it as a source after its shared equivalent, and ensure its set appears after the shared layers in `resolutionOrder`.

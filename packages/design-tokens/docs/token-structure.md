# Token File Structure

## Top-level layout

```text
packages/design-tokens/tokens/
├── shared/
│   ├── primitive/                  # Raw values
│   │   ├── color.tokens.json
│   │   ├── dimension.tokens.json
│   │   ├── fontFamily.tokens.json
│   │   ├── fontWeight.tokens.json
│   │   └── number.tokens.json
│   └── semantic/                   # Purpose and component roles
│       ├── color/
│       │   ├── light.tokens.json
│       │   └── dark.tokens.json
│       ├── dimension.tokens.json
│       ├── number.tokens.json
│       ├── fontFamily.tokens.json
│       └── typography.tokens.json
├── radius/                         # Brand overrides
├── pi/
├── earendil/
├── lefos/
├── radius.resolver.json
├── pi.resolver.json
├── earendil.resolver.json
└── lefos.resolver.json
```

Empty semantic files are unregistered placeholders containing only metadata (`$schema`, `$type`). Before populating and registering one, move its root `$type` to the typed group; see [File organization](#file-organization).

## Token layers

Both layers follow [CTI+ naming](token-naming.md).

### Primitive tokens

Primitives hold raw literals, never aliases. Components and layouts must not use them directly; semantic tokens reference them.

Examples: `primitive.color.cerulianBlue.500`, `primitive.dimension.100`, `primitive.fontFamily.sansSerif`.

Change generator-owned leaves through their recipe or generator. They carry a `com.earendil-works.generation` extension; unmarked manual leaves may coexist at other paths. See [generation rules, formulas, and commands](token-generation.md), including [line-height grid rationale](token-generation.md#why-line-heights-snap-to-a-grid).

Manual foundations include the ordered `primitive.color.dataViz` palette, `primitive.dimension.letterSpacing.normal`, named OpenType font weights, and font-family fallback stacks.

### Semantic and component tokens

Both live under `semantic/` and are the only tokens components and layouts should consume. Semantic tokens describe shared intent; component tokens name specific parts.

Examples:

- `semantic.dimension.space.gap.medium` aliases `{primitive.dimension.400}`.
- `semantic.dimension.breakpoint.medium` aliases `{primitive.dimension.breakpoint.400}`.
- `semantic.number.opacity.disabled` aliases `{primitive.number.opacity.400}`.
- `semantic.color.background.slider.track` names a component part.

Brandable values use aliases, allowing theme and brand changes without component changes.

Layer tokens express stacking relationships, not an ever-increasing z-index scale. They alias `primitive.number.layer`. In ascending order: `background` puts decoration behind content in an isolated stacking context; `raised` lifts an element above its siblings; `floating` is for panels anchored in the page that scroll with it; `sticky` is for sticky or fixed page chrome that content scrolls under. Native popovers and dialogs use the browser's top layer and get no layer token. Use `overlay` only when the host needs an explicit overlay layer, not on individual parts of a document-ordered portal family. Base UI popups use portal order above an isolated application root, including popups inside modals.

Roles describe intent, not a single CSS property: icons may use `color`/`currentColor`, borders may paint separator backgrounds, and filled-control borders may use fill tokens. Do not duplicate aliases for these uses. Do not use spacing to size an unrelated element just because values match; use size roles and CSS calculations for dependent geometry. Arithmetic signs and ratios are structural, not tokens.

## File organization

### Inside `primitive/`

Use one `<type>.tokens.json` file per DTCG type, with no modifier folders. Declare `$type` on the typed group (such as `primitive.dimension`), never the document root. Root `$type` and `$description` collide during source merging; the last source wins and can mis-type the merged tree.

File and namespace follow DTCG type, not conceptual category: typography font sizes belong in `dimension.tokens.json` under `primitive.dimension.fontSize`; line-height ratios belong in `number.tokens.json` under `primitive.number.lineHeight`.

The runner applies typed patches, merges groups, replaces generated leaves, removes stale owned leaves, and preserves manual leaves. Overlapping generated paths, token/group collisions, and conflicting group types fail generation. See [ownership details](token-generation.md#generated-and-manual-tokens).

### Inside `semantic/`

Modifiers select context-dependent values, such as color scheme or density:

- No modifiers: one flat file, such as `dimension.tokens.json`, `number.tokens.json`, `fontFamily.tokens.json`, or `typography.tokens.json`.
- One modifier: a category folder with one file per context, such as `color/light.tokens.json` and `color/dark.tokens.json`.
- Multiple modifiers: nested folders, such as `color/light/high-contrast.tokens.json`.

Static breakpoints remain in `semantic/dimension.tokens.json`; a threshold is not a modifier. CSS custom properties cannot appear in media-query conditions: tooling must resolve and inline breakpoint values at build time, not emit `var(--semantic-dimension-breakpoint-*)` there.

| Modifier      | Example contexts                                       | Applies to             |
| ------------- | ------------------------------------------------------ | ---------------------- |
| `colorScheme` | `light`, `dark`                                        | `color`                |
| `motion`      | `default`, `reduced`                                   | `movement` transitions |
| `viewport`    | `base`, `xSmall`, `small`, `medium`, `large`, `xLarge` | Responsive overrides   |
| `density`     | `comfortable`, `compact`                               | `dimension`            |

Use `viewport` only when values vary by viewport width and the build explicitly maps contexts to thresholds. Configure modifier names and contexts in the resolver's `modifiers` section.

Give each context a complete file when the contexts are equal alternatives, like `light` and `dark`. When a context is an exception that changes only a few values, keep the values in a flat file, leave the default context empty, and load an override file in the exception context, like the resolver spec's `debug` example. All transitions live in `semantic/transition.tokens.json`; the `motion` modifier's `default` context is empty, and `reduced` loads `semantic/transition/reduced.tokens.json`, which restates every `movement` transition with `primitive.duration.0`. The CSS build emits it under `@media (prefers-reduced-motion: reduce)`, so components need no reduced-motion queries. `pnpm tokens:check` verifies that the reduced file holds exactly the movement transitions, each instant and otherwise unchanged. Transitions are emitted as one custom property per part (`-duration`, `-delay`, `-timing-function`) plus the shorthand.

## Resolver files

Each `tokens/<brand>.resolver.json` loads sources in this order; later definitions of the same token path win:

1. Shared primitives.
2. Shared mode-independent semantics.
3. Modifiers, such as light/dark semantic colors.
4. Brand overrides from `tokens/<brand>/`.

Register new shared files in the appropriate resolver `set` or `modifier` and include the entry in `resolutionOrder`. Register a placeholder only once it contains tokens.

## Brand overrides

Only Lefos currently has overrides; Radius, Pi, and Earendil use the shared baseline unchanged. Every brand still has its own resolver and CSS entry point, so a brand can diverge later without changing consumers.

For an override, add only values that differ under `tokens/<brand>/`, register the source after its shared equivalent, and place its set after shared layers in `resolutionOrder`. Do not copy shared defaults into brand files; copies drift.

# Design Tokens

`@earendil-works/design-tokens` provides shared and brand-specific W3C DTCG design tokens for Earendil products, built with Terrazzo.

## Requirements

- Node.js 24 or newer
- pnpm 11.13.1

## Generate primitive tokens

The generator turns JSON recipes into primitive DTCG tokens, calculating consistent scales for colors, dimensions, and typography. Edit recipes rather than hand-calculating generated values.

```bash
pnpm tokens:generate
```

Recipes and generator code live under [`generation/`](generation), with shared settings in [`generation/config.json`](generation/config.json). Recipe paths mirror their output under `tokens/`.

See [`docs/token-generation.md`](docs/token-generation.md) for details and [`docs/color-palette.md`](docs/color-palette.md) for the palette rationale and contrast audit.

## Validate tokens

```bash
pnpm tokens:check
```

This type-checks the TypeScript tooling, checks generated token sources, validates every token and resolver against the vendored DTCG 2025.10 schemas, checks all required resting-state semantic color contrast pairs, and runs Terrazzo's cross-file checks for every brand. Run the contrast check alone with `pnpm tokens:check:contrast`. The root `pnpm check` runs these checks alongside the other workspace packages.

The official schemas are committed under [`schemas/dtcg/2025.10/`](schemas/dtcg/2025.10), so regular checks are deterministic and offline. To refresh them explicitly:

```bash
pnpm tokens:schemas:update
```

Review and commit the schema and checksum manifest changes together. See [`schemas/dtcg/NOTICE.md`](schemas/dtcg/NOTICE.md) for provenance and licensing.

## Build tokens

```bash
pnpm tokens:build
```

This builds all token brands; `pnpm build` builds the entire workspace. Brand-specific builds are also available as `pnpm tokens:build:radius`, `pnpm tokens:build:pi`, `pnpm tokens:build:earendil`, and `pnpm tokens:build:lefos`.

Consumers import exactly one brand stylesheet through the package export:

```css
@import '@earendil-works/design-tokens/radius.css';
```

Equivalent entry points exist for `pi.css`, `earendil.css`, and `lefos.css`. Package names and CSS entry points are unchanged by the repository migration.

Generated files are written to `packages/design-tokens/dist/<brand>/` for Radius, Pi, Earendil, and Lefos. Each brand output contains:

- `tokens.css`
- `tokens.catalog.json`, a versioned catalogue used by linting
- `tokens.resolved.json`, every token's resolved DTCG value per color scheme, including exact brand colors and print extensions (exported as `@earendil-works/design-tokens/<brand>.resolved.json`)
- Figma-compatible JSON files from `terrazzo-plugin-figma-json`

In `tokens.css`, primitive tokens, mode-independent semantic tokens, and the default light semantic colors are emitted under `:root`, which declares `color-scheme: light dark`. Only dark `semantic.color.*` overrides are emitted inside the `prefers-color-scheme: dark` media query, preventing invariant tokens from being duplicated for each mode.

## Lint token consumers

The reusable Stylelint plugin lives in [`../stylelint-plugin-design-tokens`](../stylelint-plugin-design-tokens). It validates a consumer against the generated catalogue for the selected `radius`, `pi`, `earendil`, or `lefos` brand, rejects hardcoded tokenizable values and unknown custom properties, checks token type and semantic-role compatibility, and prefers semantic tokens in application CSS.

```bash
pnpm stylelint:test
pnpm stylelint:build
```

See the [plugin policy and setup guide](../stylelint-plugin-design-tokens/README.md), including exclusions, integration allowlists, and CSS Modules behavior.

## Source structure

```text
tokens/
├── shared/
│   ├── primitive/
│   │   ├── color.tokens.json
│   │   ├── dimension.tokens.json
│   │   ├── fontFamily.tokens.json
│   │   ├── fontWeight.tokens.json
│   │   └── number.tokens.json
│   └── semantic/
│       ├── color/
│       │   ├── light.tokens.json
│       │   └── dark.tokens.json
│       ├── dimension.tokens.json
│       ├── number.tokens.json
│       ├── fontFamily.tokens.json
│       └── typography.tokens.json
├── radius/
├── pi/
├── earendil/
├── lefos/
├── radius.resolver.json
├── pi.resolver.json
├── earendil.resolver.json
└── lefos.resolver.json
```

Each brand resolver loads the shared primitive and mode-independent semantic files, followed by the light or dark semantic color context. Radius currently uses this shared baseline unchanged; its resolver and CSS entry point remain the stable brand boundary. Add a brand override only when its value actually differs, then load it after the shared source. Do not copy shared values into brand files: identical overrides create two editable definitions of the same decision and can silently drift. Branding changes stay in this package without changing component CSS.

See [`docs/token-structure.md`](docs/token-structure.md) for organization and overrides, [`docs/token-naming.md`](docs/token-naming.md) for naming, and [`docs/token-descriptions.md`](docs/token-descriptions.md) for description guidance.

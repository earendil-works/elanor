# Design Tokens

`@earendil-works/design-tokens` provides shared and brand-specific W3C DTCG tokens, built with Terrazzo.

## Use

Import exactly one brand stylesheet:

```css
@import '@earendil-works/design-tokens/radius.css';
```

Other entry points: `pi.css`, `earendil.css`, `lefos.css`.

Light semantic colors are the default. Dark overrides apply automatically through `prefers-color-scheme: dark`.

To check your CSS against the tokens, use the [Stylelint plugin](../stylelint-plugin-design-tokens/README.md). It rejects hardcoded values and unknown custom properties, checks that tokens suit their CSS properties, and requires semantic tokens outside foundation files.

## Develop

Run commands from the repository root.

```bash
pnpm tokens:generate       # Compile recipes into primitive tokens
pnpm tokens:check          # Type-check tooling, check generation, validate tokens
pnpm tokens:check:contrast # Check semantic color contrast only
pnpm tokens:build          # Build all brands
```

For one brand, use `pnpm tokens:build:radius`, `pnpm tokens:build:pi`, `pnpm tokens:build:earendil`, or `pnpm tokens:build:lefos`.

Edit [recipes](generation/recipes), not generated values. Shared settings live in [`generation/config.json`](generation/config.json); recipe paths mirror their output under `tokens/`.

`tokens:check` checks for stale generated sources, validates tokens and resolvers against DTCG 2025.10, checks required resting-state contrast pairs, and runs Terrazzo's cross-file checks for every brand. The root `pnpm check` includes these checks.

Validation uses the vendored [DTCG schemas](schemas/dtcg/2025.10/) offline. To refresh them, run `pnpm tokens:schemas:update`, then review and commit the schemas and checksum manifest together. See the [schema notice](schemas/dtcg/NOTICE.md) for provenance and licensing.

### Output

Each `dist/<brand>/` contains:

- `tokens.css`: primitives, mode-independent semantics, and light semantic colors under `:root` with `color-scheme: light dark`; dark `semantic.color.*` overrides in `prefers-color-scheme: dark`.
- `tokens.catalog.json`: CSS custom properties with resolved CSS/DTCG values and alias targets with every modifier at its default context, the values that differ per modifier context (such as `contexts.colorScheme.dark`), each modifier's contexts and how the CSS switches them on, and `$extensions` (including print builds). Exported as `@earendil-works/design-tokens/<brand>.catalog.json` for linting and build tools.
- Figma-compatible JSON from `terrazzo-plugin-figma-json`.

### Guides

- [File structure and brand overrides](docs/token-structure.md)
- [Naming](docs/token-naming.md)
- [Descriptions](docs/token-descriptions.md)
- [Generation](docs/token-generation.md)
- [Color palette and contrast](docs/color-palette.md)

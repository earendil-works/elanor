# Elanor

The design system monorepo for Earendil products, containing shared UI components, design tokens, token tooling, and documentation.

## Apps

- [`apps/docs`](./apps/docs): Astro documentation site for the React components.

## Packages

- [`packages/react`](./packages/react/README.md): `@earendil-works/elanor-react`, built with Base UI and CSS Modules.
- [`packages/icons`](./packages/icons/README.md): `@earendil-works/elanor-icons`, boiled Material Symbols as SVG files and React components.
- [`packages/design-tokens`](./packages/design-tokens/README.md): `@earendil-works/design-tokens`, shared and brand-specific DTCG tokens, generation tooling, and CSS exports.
- [`packages/stylelint-plugin-design-tokens`](./packages/stylelint-plugin-design-tokens/README.md): `@earendil-works/stylelint-plugin-design-tokens`, rules for consuming the generated token catalogues.

Products provide application state, routing, and lifecycle, and select a brand stylesheet from the token package.

## Development

Requirements: Node.js 24 or newer and pnpm 11.13.1.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

- `pnpm check` validates the tokens, type-checks all packages, and lints React and documentation styles.
- `pnpm test` runs package tests, including the icon pipeline/render checks and Stylelint plugin rules.
- `pnpm build` builds every package, including all four token brands.

# Elanor

The design system monorepo for Earendil products, containing shared UI components, design tokens, token tooling, and documentation.

## Apps

- [`apps/docs`](./apps/docs): Astro documentation site for the React components.

## Packages

- [`packages/react`](./packages/react/README.md): `@earendil-works/elanor-react`, built with Base UI and CSS Modules.
- [`packages/icons`](./packages/icons/README.md): `@earendil-works/elanor-icons` and `@earendil-works/elanor-icons-react`, boiled Material Symbols as SVG files and React components.
- [`packages/logos`](./packages/logos/README.md): `@earendil-works/elanor-logos` and `@earendil-works/elanor-logos-react`, brand logos as SVG files and React components.
- [`packages/design-tokens`](./packages/design-tokens/README.md): `@earendil-works/design-tokens`, shared and brand-specific DTCG tokens, generation tooling, and CSS exports.
- [`packages/stylelint-plugin-design-tokens`](./packages/stylelint-plugin-design-tokens/README.md): `@earendil-works/stylelint-plugin-design-tokens`, rules for consuming the generated token catalogues.

Products provide application state, routing, and lifecycle, and select a brand stylesheet from the token package.

## Development

Requirements: Node.js 24 or newer and pnpm 12.8.2.

The docs use Astro 7 and Vite 8. Library and tooling packages use TypeScript 7;
the docs keep TypeScript 6 because `@astrojs/check` does not yet support TypeScript 7.

Package releases must be at least seven days old, enforced by `pnpm-workspace.yaml`.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

- `pnpm lint` runs all linters; `pnpm lint:oxlint` and `pnpm lint:stylelint` run each tool separately.
- `pnpm check` validates the tokens, type-checks all packages, and runs JavaScript/TypeScript and style linting.
- `pnpm test` runs package tests.
- `pnpm build` builds every package, including all four token brands.

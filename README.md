# Elanor UI

Shared UI components for Earendil products.

- [`packages/react`](./packages/react/README.md): `@earendil-works/elanor-react`, built with Base UI and CSS Modules.

Products provide application state, routing, lifecycle, and brand tokens. Tokens are maintained in the separate `design-tokens` repository.

## Development

Use the pnpm version declared in `package.json`:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
```

Build output: `packages/react/dist`.

# Elanor

Earendil's design system. It provides UI building blocks; applications supply routing, state, and their brand stylesheet.

| Package                                                                 | npm name                                                                                                                                                 | Contents                                                         |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [React](./packages/react/README.md)                                     | `@earendil-works/elanor-react`                                                                                                                           | Components built with Base UI and CSS Modules                    |
| [Fonts](./packages/fonts/README.md)                                     | `@earendil-works/elanor-fonts`                                                                                                                           | Earendil and Commit Mono                                         |
| [Icons](./packages/icons/README.md)                                     | `@earendil-works/elanor-icons`, `@earendil-works/elanor-icons-react`, `@earendil-works/elanor-icons-boiled`, `@earendil-works/elanor-icons-boiled-react` | Material Symbols, plain or with a hand-drawn boil, SVG and React |
| [Logos](./packages/logos/README.md)                                     | `@earendil-works/elanor-logos`, `@earendil-works/elanor-logos-react`                                                                                     | Brand artwork, SVG and React                                     |
| [Design tokens](./packages/design-tokens/README.md)                     | `@earendil-works/design-tokens`                                                                                                                          | Shared and brand-specific tokens, CSS exports                    |
| [Stylelint plugin](./packages/stylelint-plugin-design-tokens/README.md) | `@earendil-works/stylelint-plugin-design-tokens`                                                                                                         | Token usage rules                                                |

The [docs app](./apps/docs) runs on Astro.

## Development

Requires Node.js ≥24.22.1 <25 and pnpm 12.8.2. pnpm only installs dependency versions published at least seven days ago (`pnpm-workspace.yaml`).

```sh
pnpm install --frozen-lockfile
pnpm check  # formatting, lint, types, tokens
pnpm test
pnpm build  # packages and docs
pnpm dev    # docs dev server
```

Use `pnpm format` to format files, or `pnpm lint` to run only linters.

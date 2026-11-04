# Elanor

Earendil's design system. It provides UI building blocks; applications supply routing, state, and their brand stylesheet.

| Package                                                                 | npm name                                                                                                                                                 | Contents                                                         |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [React](./packages/react/README.md)                                     | `@earendil-works/elanor-react`                                                                                                                           | Components built with Base UI and CSS Modules                    |
| [Fonts](./packages/fonts/README.md)                                     | `@earendil-works/elanor-fonts`                                                                                                                           | Mallos Serif, Commit Mono, and DepartureMono                     |
| [Icons](./packages/icons/README.md)                                     | `@earendil-works/elanor-icons`, `@earendil-works/elanor-icons-react`, `@earendil-works/elanor-icons-boiled`, `@earendil-works/elanor-icons-boiled-react` | Material Symbols, plain or with a hand-drawn boil, SVG and React |
| [Logos](./packages/logos/README.md)                                     | `@earendil-works/elanor-logos`, `@earendil-works/elanor-logos-react`                                                                                     | Brand artwork, SVG and React                                     |
| [Design tokens](./packages/design-tokens/README.md)                     | `@earendil-works/design-tokens`                                                                                                                          | Shared and brand-specific tokens, CSS exports                    |
| [Stylelint plugin](./packages/stylelint-plugin-design-tokens/README.md) | `@earendil-works/stylelint-plugin-design-tokens`                                                                                                         | Token usage rules                                                |

The [docs app](./apps/docs) runs on Astro.

## Preview packages

Successful main builds are published to [pkg.earendil.com](https://pkg.earendil.com), including raw SVG packages and the Shiki theme.

`@main` points to the newest build. Builds expire after 30 days unless kept: versioned releases get a permanent `vX.Y.Z` label, and maintainers can keep a main build as `main-<first 12 SHA characters>` by running **Preview packages** with the commit SHA within 30 days.

Elanor dependencies use builds from the same commit. In lockfiles, pin a full SHA for short-term use, or a `main-…` or `vX.Y.Z` label for longer. Avoid `@main`: its contents change.

To add a package, update `scripts/release/packages.mjs` and Elanor’s entry in `earendil-works/pkg/src/config.ts`.

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

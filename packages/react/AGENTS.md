# React package

## Base UI

For Base UI changes, consult [the documentation index](https://base-ui.com/llms.txt) and the relevant linked pages. Prefer those contracts over assumptions; check compatibility with the pinned `@base-ui/react` version in `package.json`.

## Structure

- Give each independent component its own kebab-case directory: `heading/heading.tsx`, `text/text.tsx`.
- Related component families may share a directory when they share presentation or implementation.
- Co-locate CSS Modules. Components without their own styles do not need an empty stylesheet.
- Keep compound parts together, such as `Modal.Root` and `Modal.Popup` in `modal/`.
- Put non-component helpers in `utils/` with descriptive filenames, such as `class-names.ts`.

## Imports and exports

- Import implementation files directly, such as `../button/button.tsx`. Never import through the root entry point internally.
- Keep one public entry point, `src/index.ts`, with explicit value and type exports. No `export *` or per-directory barrels.
- Keep internal paths out of the package export map.

## Composition

- Prefer children and compound parts over configuration-heavy props. Avoid boolean layout modes; normal state props such as `disabled` and `open` are fine.
- Keep product stores, routing, and data fetching out of shared components. Reuse Base UI state rather than maintaining a second copy.

## Component contracts and accessibility

- Preserve supported refs, event details, and controlled/uncontrolled behavior when wrapping Base UI.
- Use semantic elements and preserve accessible names, label associations, keyboard behavior, and focus management. Don't replace native or Base UI behavior with custom handlers unnecessarily.

## CSS

- Use semantic tokens and preserve focus, disabled, invalid, and forced-colors states.
- Use CSS Modules composition for shared component styles.
- Prefer logical properties and flexible layouts. Handle narrow containers, RTL, and long content without hiding meaningful content.
- Keep selectors scoped; avoid global overrides and specificity escalation.
- When adding motion, respect reduced-motion preferences and list transitioned properties explicitly—no `transition: all`.
- When linting, use the design-token plugin's strict configuration for the target brand. Allow only these Base UI runtime variables through `allowCustomProperties`:

```ts
[
  '--anchor-width', '--available-width', '--available-height',
  '--active-tab-left', '--active-tab-top', '--active-tab-width', '--active-tab-height',
  '--toast-swipe-movement-x', '--toast-swipe-movement-y',
]
```

## Validation

- Run `pnpm check` and `pnpm build` after TypeScript or CSS changes.

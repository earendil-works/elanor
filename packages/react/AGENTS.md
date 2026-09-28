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

- Within library implementations, import files directly, such as `../button/button.tsx`. Never import through the public entry point. Examples and documentation are exempt.
- Keep one public entry point, `src/index.ts`, with explicit value and type exports. No `export *` or per-directory barrels.
- Keep internal paths out of the package export map.
- Give implemented public components and parts named props types and use those types in their declarations. Derive Base UI-backed types rather than copying contracts.
- Export supporting types for retained public APIs; don't mirror upstream internals or export empty state aliases.

## Composition

- Prefer children and compound parts over configuration-heavy props. Avoid boolean layout modes; normal state props such as `disabled` and `open` are fine.
- Keep product stores, routing, and data fetching out of shared components. Reuse Base UI state rather than maintaining a second copy.

## Component contracts and accessibility

- Preserve supported refs, event details, and controlled/uncontrolled behavior when wrapping Base UI.
- Restrict an upstream capability only for a concrete Elanor requirement, with matching types and runtime handling.
- Use semantic elements and preserve accessible names, label associations, keyboard behavior, and focus management. Don't replace native or Base UI behavior with custom handlers unnecessarily.

## CSS

- Use semantic tokens and preserve focus, disabled, invalid, and forced-colors states.
- Keep every CSS Module self-contained: no `composes` or imports of other stylesheets. Share semantic tokens, not other components' private CSS classes.
- Prefer logical properties and flexible layouts. Handle narrow containers, RTL, and long content without hiding meaningful content.
- Keep selectors scoped; avoid global overrides and specificity escalation.
- When adding motion, respect reduced-motion preferences and list transitioned properties explicitly—no `transition: all`.
- When linting, use the design-token plugin's strict configuration for the target brand. Allow only these Base UI runtime variables and the stroke contract through `allowCustomProperties`:

```ts
[
  '--anchor-width', '--available-width', '--available-height',
  '--active-tab-left', '--active-tab-top', '--active-tab-width', '--active-tab-height',
  '--stroke-*',
]
```

## Strokes

Borders, focus rings, and separators follow one contract so a stroke style from `@earendil-works/elanor-strokes` can replace them:

- Render `data-stroke` (`box-small`, `pill-x-small`, `circle-x-small`, `line`, …) on the element that shows the outline, before `{...props}` so callers can override it. Use `data-stroke-edge` for a line on one edge.
- Set `--stroke-color` for every state. Paint the plain look through the switches: `box-shadow: var(--stroke-plain-shadow, inset …)` for borders, `outline: var(--stroke-plain-outline, …)` for focus, and `background: var(--stroke-plain-fill, …)` for separators.
- Strokes are paint, never layout: no real `border` widths on stroked elements. Focus sits in the border position (`outline-offset` of minus half its width).
- `::after` on a stroked element is reserved for the stroke layer. Native inputs, and controls whose visible box is smaller than their target, carry the stroke on a frame or inner element. Scrolling popups scroll an inner body, so the popup itself can carry the stroke.

## Validation

- Run `pnpm check` and `pnpm build` after TypeScript or CSS changes.

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
- Keep every CSS Module self-contained: no `composes` or imports of other stylesheets. Share semantic tokens, not other components' private CSS classes. The one shared class is `outline` from `utils/outline.module.css` (see Outlines).
- Prefer logical properties and flexible layouts. Handle narrow containers, RTL, and long content without hiding meaningful content.
- Keep selectors scoped; avoid global overrides and specificity escalation.
- When adding motion, respect reduced-motion preferences and list transitioned properties explicitly—no `transition: all`.
- When linting, use the design-token plugin's strict configuration for the target brand. Allow only these Base UI runtime variables and the outline contract through `allowCustomProperties`:

```ts
[
  '--anchor-width', '--available-width', '--available-height',
  '--active-tab-left', '--active-tab-top', '--active-tab-width', '--active-tab-height',
  '--outline-*',
]
```

## Outlines

Borders, focus rings, and separators follow one outline contract. Components paint a plain look by default; a brand's stylesheet, such as a stroke style from `@earendil-works/elanor-strokes`, can replace it without component changes.

- Render `data-outline` (`box-small`, `pill-x-small`, `circle-x-small`, `line`, …) on the element that shows the outline, before `{...props}` so callers can override it. Use `data-outline-edge` for a line on one edge, and `data-outline-focus="none"` on elements that receive focus without showing it.
- The role sets the shape and the band: add the `outline` class from `utils/outline.module.css` to boxes, pills, and circles. It takes the corner radius from the role and gives the element a border band of the `default` border width, painted in `--outline-plain-border` or `--outline-color`. A stroke style stops the background at the band through `--outline-background-clip`, so an outline in the background's color still draws the edge. Don't set `border-radius` or `border` on outlined elements yourself.
- The band is inside the element's size, which follows the pixel grid: subtract it from the padding, `calc(var(--…-padding-…) - var(--semantic-dimension-border-width-default))`, including in inner bodies and fields that sit inside the band. Outlines that only ever show focus, like text links and tabs, add `data-outline-band="none"` instead, keeping their padding.
- Set `--outline-color` for every state; in forced colors set it to a system color. Paint the rest of the plain look through the switches: `box-shadow: inset 0 … var(--outline-plain-border, var(--outline-color))` for edge lines, `outline: var(--outline-plain-focus, …)` for focus, and `background: var(--outline-plain-fill, …)` for separators.
- Nothing paints outside the element's box. Focus uses the `large` border width with an `outline-offset` of minus that width.
- `::after` on an outlined element is reserved for the outline layer. Native inputs, and controls whose visible box is smaller than their target, carry the outline on a frame or inner element. Scrolling popups scroll an inner body, so the popup itself can carry the outline.


## Marks

Checks, dashes, and dots inside controls (checkbox ticks, radio dots, switch knobs, dropdown indicators) follow the mark contract, so a brand's stylesheet can draw them too.

- A mark is its own element, which the component sizes and paints with a `background-color`. Add the `check`, `dash`, or `dot` class from `utils/mark.module.css`, which masks it with `var(--mark-<name>, <plain mark>)`. Pick the class by state in TSX, and only when the caller passes no content of its own.
- Don't draw marks with borders, pseudo-elements, or transforms.

## Validation

- Run `pnpm check` and `pnpm build` after TypeScript or CSS changes.

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
- Keep CSS Modules self-contained: no `composes` or imports of other stylesheets. Share semantic tokens and the ordinary default indicator utility, not another component's private styles.
- Prefer logical properties and flexible layouts. Handle narrow containers, RTL, and long content without hiding meaningful content.
- Keep selectors scoped; avoid global overrides and specificity escalation.
- When adding motion, respect reduced-motion preferences and list transitioned properties explicitly—no `transition: all`.
- Use the design-token plugin's strict configuration for the target brand. Allow only these Base UI runtime variables and public surface colors through `allowCustomProperties`:

```ts
[
  '--anchor-width', '--available-width', '--available-height',
  '--active-tab-left', '--active-tab-top', '--active-tab-width', '--active-tab-height',
  '--outline-color', '--outline-focus-color',
]
```

## Consumer-owned appearance

- Shared components own complete ordinary borders, backgrounds, dimensions, focus and accessibility. They never import the strokes package or depend on inherited paint-suppression variables.
- `AppearanceProvider` supplies optional `surfaceClassName` and `indicatorClassName`; omitted/null values restore plain parts. Nested providers replace both selections. Hooks apply these classes to existing visible parts, not arbitrary descendants or hit-target wrappers.
- Use `data-outline` for the visible geometry (box/pill/circle/line). Preserve the component's ordinary border/radius/layout independently. `data-outline-band="none"` describes an existing borderless focus-only surface, not a layout switch.
- Initialize `--outline-color` and `--outline-focus-color` locally; component states update these generic colors. Keep the existing outline metadata/color names, but do not restore inherited paint-suppression switches such as `--outline-plain-*` or `--mark-*`.
- Explicit focus targets: `data-outline-focus="self"`, `"control"` (direct `data-surface-control` child), `"parent"` (direct focused hit target), or `"none"`. Line surfaces keep ordinary focus; nested controls must not focus-paint a surrounding popup.
- `data-outline-edge` describes a line painted along an edge; standalone lines paint their own fill. Plain components do not reserve a universal pseudo-element. Optional skins document which paint properties/parts they replace.
- Default checks/dashes/dots use ordinary `utils/mark.module.css` classes. Apply `useIndicatorClassName()` only to default glyphs, tagged `data-indicator="check|dash|dot"`. Checkbox's `data-indeterminate` selects its dash. Custom indicator children or `render` own their glyph and must not acquire builtin mark/skin classes. Class/style/ref customization alone retains the default glyph.
- Expose existing frame/body customization props where applicable without redirecting native/popup refs or class/style targets. Preserve Base UI state and render/ref merging contracts.
- Context follows React ancestry through portals, not arbitrary detached triggers or separate roots. Brand tokens/fonts/direction/portal environment remain consumer-owned.
- Preserve existing plain sizing/focus during this architectural migration. Changes to PR18's inward focus, field frames or popup bodies require separate review against the pre-PR18 supplement.

## Validation

- Run `pnpm check` and `pnpm build` after TypeScript or CSS changes. Build workspace dependencies first when changing exported types.

# React package

## Base UI

For Base UI changes, consult [the documentation index](https://base-ui.com/llms.txt) and the relevant linked pages. Prefer those contracts over assumptions; check compatibility with the pinned `@base-ui/react` version in `package.json`.

## Structure

- Give each independent component its own kebab-case directory: `heading/heading.tsx`, `text/text.tsx`.
- Related component families may share a directory when they share presentation or implementation.
- Co-locate CSS Modules. Components without their own styles do not need an empty stylesheet.
- Keep compound parts together, such as `Modal.Root` and `Modal.Popup` in `modal/`.
- Put non-component helpers in `utils/` with descriptive filenames, such as `class-names.ts`.

## Docs pages

Each component directory has a `<component>.mdx` page and an `examples/` directory. The docs site renders the page at `/components/<component>/` and as Markdown for agents at `/components/<component>.md`.

- Start with an H1 (the directory name in sentence case) and a one-paragraph description: what it is and when to use it, with alternatives.
- Then a hero demo (`examples/demo.tsx`), `## Usage` with the import and a minimal snippet or anatomy, and one `##` section per variant or state. Add notes only where needed.
- Don't write an API section. It's generated from the props types; document props with JSDoc on Elanor's declarations, and parts with JSDoc on the component.
- Write live previews as `<Demo example="./examples/<name>.tsx" />` on one line. MDX contains no other JSX or imports; use code fences for code that can't render on a page.
- Each example file default-exports one component and imports from `@earendil-works/elanor-react`, like application code. Show one concept per demo. Local imports, such as a CSS Module, appear in the demo's code panel.
- Demo links use `href="#"`. Headings inside demos use `level={2}` in the hero and `level={3}` under a `##` section.

## Imports and exports

- Within a component, import implementation files directly, never its own barrel. Across components, use their local entry point when present, otherwise a direct file. Never import the package-wide entry point from library implementations. Examples and documentation are exempt.
- Keep runtime dependencies between components acyclic.
- Expose JavaScript and types through the package root (`src/index.ts`); keep component subpaths private.
- Use explicit value and type exports. For compounds, export named parts from a local `index.ts` barrel and re-export it with `export * as Name` from the package root. Do not use wildcard re-exports (`export * from`) or assemble runtime compound objects.
- Expose compound parts only through their namespace, not prefixed component aliases at the package root. Keep public prop and event types as named type exports.
- Preserve native ESM namespaces in build output. Member-level tree-shaking depends on the consumer's bundler.
- Mark side-effect-free module-level context creation calls with `/* @__PURE__ */` and preserve these annotations in build output.
- Give implemented public components and parts named props types and use those types in their declarations. Derive Base UI-backed types rather than copying contracts.
- Export supporting types for retained public APIs; don't mirror upstream internals or export empty state aliases.

## Composition

- Prefer children and compound parts over configuration-heavy props. Avoid boolean layout modes; normal state props such as `disabled` and `open` are fine.
- Keep product stores, routing, and data fetching out of shared components. Reuse Base UI state rather than maintaining a second copy.

## Component contracts and accessibility

- Target React 19. For components that support refs, accept `ref` as a prop with the underlying element or component's ref type; don't introduce `forwardRef` wrappers.
- Preserve supported refs, event details, and controlled/uncontrolled behavior when wrapping Base UI.
- Restrict an upstream capability only for a concrete Elanor requirement, with matching types and runtime handling.
- Use semantic elements and preserve accessible names, label associations, keyboard behavior, and focus management. Don't replace native or Base UI behavior with custom handlers unnecessarily.

## CSS

- Use semantic tokens and preserve focus, disabled, invalid, and forced-colors states.
- Keep every CSS Module self-contained: no `composes` or imports of other stylesheets. Share semantic tokens, not other components' private CSS classes.
- Wrap all rules of a component stylesheet in `@layer elanor.components { … }` (Prose uses `elanor.prose`), so unlayered application CSS always overrides Elanor. Example stylesheets are application code and stay unlayered.
- Size controls that contain text by their block padding and line height, without a fixed or minimum block size, so they grow with larger type and stay aligned with buttons. Fixed block sizes are only for icon-only parts such as icon buttons and checkbox boxes, and touch sizes under `@media (pointer: coarse)`.
- Prefer logical properties and flexible layouts. Handle narrow containers, RTL, and long content without hiding meaningful content.
- Keep selectors scoped; avoid global overrides and specificity escalation.
- For motion, use `semantic.transition` tokens: `movement.*` for anything that moves, scales, rotates, or resizes, `fade` for opacity, and `feedback` for color changes. Movement becomes instant when the reader prefers reduced motion, so add no reduced-motion queries. List transitioned properties explicitly - no `transition: all`.
- Use the design-token plugin's strict configuration for the target brand. `stylelint.config.mjs` defines allowed Base UI runtime variables.

## Validation

- Run `pnpm check` and `pnpm build` after TypeScript or CSS changes.

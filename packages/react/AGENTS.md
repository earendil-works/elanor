# React package

## Base UI

For Base UI changes, consult [the documentation index](https://base-ui.com/llms.txt) and the relevant linked pages. Prefer those contracts over assumptions; check compatibility with the pinned `@base-ui/react` version in `package.json`.

- Import Base UI's undocumented internals (`@base-ui/react/internals/*`) only through `src/utils/base-ui-internals.ts`, and add each one there with what it's for and what fails if it changes. Re-check that file on every Base UI upgrade.

## Structure

- Give each independent component its own kebab-case directory: `heading/heading.tsx`, `text/text.tsx`.
- Related component families may share a directory when they share presentation or implementation.
- Co-locate CSS Modules. Components without their own styles do not need an empty stylesheet.
- Keep compound parts together, such as `Modal.Root` and `Modal.Popup` in `modal/`.
- Put non-component helpers in `utils/` with descriptive filenames, such as `class-names.ts`.

## Docs pages

Each component directory has a `<component>.mdx` page and an `examples/` directory. The docs site renders the page at `/components/<component>/` and as Markdown for agents at `/components/<component>.md`.

- Start with front matter that sets `category`, one of the categories in `apps/docs/src/lib/component-categories.ts`. The docs group the sidebar and the components overview by it.
- Then an H1 (the directory name in sentence case) and a first paragraph that stands alone: what it is, when to use it, and the alternative ("For X, use Y.").
- Then a hero demo (`examples/demo.tsx`), `## Usage` with the import and a minimal snippet or anatomy, and one `##` section per variant or state. Add notes only where needed.
- Don't write an API section. It's generated from the props types; document props with JSDoc on Elanor's declarations, and parts with JSDoc on the component.
- Write live previews as `<Demo example="./examples/<name>.tsx" />` on one line. MDX contains no other JSX or imports; use code fences for code that can't render on a page.
- Each example file default-exports one component and imports from `@earendil-works/elanor-react`, as code using the package does. Show one concept per focused demo. Local imports, such as a CSS Module or a part of a full example, appear in the demo's code panel.
- A complex component gets one full example; sections quote it in fences such as ` ```tsx from="./examples/demo.tsx" `, which the docs build checks against the file. Add a focused demo only for a concept the full example can't show (a state, a width, a field in a form).
- Demo links use `href="#"`. Headings inside demos use `level={2}` in the hero and `level={3}` under a `##` section.

## Writing docs

Agents read each page as `/components/<id>.md`; its first paragraph is the `llms.txt` line. These rules cover MDX and JSDoc.

- Address the developer as "you", in imperatives. Say "your code", "your router", "your state".
- When a component leaves a job to you, say so: "X doesn't do Y; do Y with Z."
- When a prop common elsewhere doesn't exist (`loading`, `asChild`), say so and show the Elanor way, because agents assume other libraries' APIs.
- State requirements the types don't enforce, such as an accessible name, where they come up.
- Use one term per concept, matching the part and prop names.
- End users are "people" or "a person".
- "The page" is the browser document.
- "App" names only the kind of product, API values and titles: "app UI", `variant="app"`, "your app's entry module". Not your code: write "filter the data yourself", not "the app filters the data".
- Write `examples/` files that run as-is: complete, with realistic data and no `...`.
- Start demo-only comments with `Demo only:` and say what to do instead.
- Name headings after the variant, state or task (`## Disabled`), not a claim.
- `pnpm check` runs `apps/docs/scripts/check-wording.ts`: no stand-ins for the developer, no curly quotes, and first paragraphs of at most two sentences and 35 words.
- Before finishing, run `pnpm dev` and read `/components/<id>.md` and its line in `/llms.txt` on their own.

## Imports and exports

- Within a component, import implementation files directly, never its own barrel. Across components, use their local entry point when present, otherwise a direct file. Never import the package-wide entry point from library implementations. Examples and documentation are exempt.
- Keep runtime dependencies between components acyclic.
- Expose JavaScript and types through the package root (`src/index.ts`); keep component subpaths private.
- Use explicit value and type exports. For compounds, export named parts from a local `index.ts` barrel and re-export it with `export * as Name` from the package root. Do not use wildcard re-exports (`export * from`) or assemble runtime compound objects.
- Expose compound parts only through their namespace, not prefixed component aliases at the package root. Keep public prop and event types as named type exports.
- Preserve native ESM namespaces in build output. Member-level tree-shaking depends on the bundler of the code that imports the package.
- Mark side-effect-free module-level context creation calls with `/* @__PURE__ */` and preserve these annotations in build output.
- Give implemented public components and parts named props types and use those types in their declarations. Derive Base UI-backed types rather than copying contracts.
- Give each component its own literal prop types (`ButtonDensity`, `ChipDensity`) rather than reusing another component's; parts of one family in one directory, such as Dropdown and SearchableDropdown, share them with `import type`.
- Export supporting types for retained public APIs; don't mirror upstream internals or export empty state aliases.

## Composition

- Prefer children and compound parts over configuration-heavy props. Avoid boolean layout modes; normal state props such as `disabled` and `open` are fine.
- Keep product stores, routing, and data fetching out of shared components. Reuse Base UI state rather than maintaining a second copy.

## Component contracts and accessibility

- Target React 19. For components that support refs, accept `ref` as a prop with the underlying element or component's ref type; don't introduce `forwardRef` wrappers.
- Preserve supported refs, event details, and controlled/uncontrolled behavior when wrapping Base UI.
- Restrict an upstream capability only for a concrete Elanor requirement, with matching types and runtime handling.
- Use semantic elements and preserve accessible names, label associations, keyboard behavior, and focus management. Don't replace native or Base UI behavior with custom handlers unnecessarily.

## Behaviors

Behaviors make components work on static pages: rendered on the server, without React in the browser.

- Put a component's behavior next to it as `<component>.behavior.ts`, a factory `create<Component>(element)` that returns `{destroy()}`, and export it from `src/index.ts`. `utils/enhance.ts` binds behaviors to elements by `data-elanor`.
- Behaviors import no React, Base UI, icons, or `.tsx` files (lint enforces it), so a page's bundler leaves React out when it imports only behaviors from the package root.
- Components and static parts take a `data-elanor` prop and add the `data-elanor` names they're given after their own, so other behaviors can attach to the same element.
- The behavior gets everything from the markup, and the component does not import its behavior. Labels and options travel as attributes; timing comes from tokens, read from the element's computed style.
- The component renders the behavior's markup contract: `data-elanor="<behavior>"`, options as `data-elanor-*` attributes, and states in the attributes the component already renders, such as `data-copy-state`. Document the contract in the factory's JSDoc. Class names are hashed, so behaviors never select by class.
- Render the behavior's name and options only on the server (`useSyncExternalStore` with a server snapshot of `true`), so hydrated and client-rendered components drop them and their behavior stands down instead of handling events React already handles.
- Render every state the stylesheet needs without React, such as both icons of a toggle, so CSS can switch them by attribute.

## CSS

- Use semantic tokens and preserve focus, disabled, invalid, and forced-colors states.
- Keep every CSS Module self-contained: no `composes` or imports of other stylesheets. Share semantic tokens, not other components' private CSS classes.
- Wrap all rules of a component stylesheet in `@layer elanor.components { … }` (Prose uses `elanor.prose`), so an app's unlayered CSS always overrides Elanor. Example stylesheets stand for app code and stay unlayered.
- Size controls that contain text by their block padding and line height, without a fixed or minimum block size, so they grow with larger type and stay aligned with buttons.
- Give fixed sizes only to icon-only parts, such as icon buttons and checkbox boxes.
- Keep every control's mouse size on touch screens. Only menu items, table of contents links and file tree rows get a minimum height of `semantic.dimension.size.medium` under `@media (pointer: coarse)`.
- Prefer logical properties and flexible layouts. Handle narrow containers, RTL, and long content without hiding meaningful content.
- Keep selectors scoped; avoid global overrides and specificity escalation.
- When a container styles another component's part, the part renders a marker, `data-<component>[-<part>]` (`data-icon-button`), documented in its JSDoc. Containers select the marker, never another component's classes.
- For motion, use `semantic.transition` tokens: `movement.*` for anything that moves, scales, rotates, or resizes, `fade` for opacity, and `feedback` for color changes. Movement becomes instant when a person prefers reduced motion, so add no reduced-motion queries. List transitioned properties explicitly - no `transition: all`.
- Use the design-token plugin's strict configuration for the target brand. `stylelint.config.mjs` defines allowed Base UI runtime variables.

## Validation

- Run `pnpm check` and `pnpm build` after TypeScript or CSS changes.

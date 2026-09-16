# Brush borders

A build-time SVG pipeline, not a runtime drawing library. `noir.svg` is the active
asset. It is derived from the **Figma Noir** path in the MIT-licensed `svg-brush`
[project](https://github.com/Citizen-Codex/svg-brush); `noir-original.svg` preserves that source. No `svg-brush` dependency or
sibling checkout is required to build or consume Elanor.

## Change the brush

1. Add a straight SVG here and point `preset.json` → `source` at it.
2. Set `centerline` and `sourceThickness` in SVG units. `thickness` is the target
   outline width in canonical pixels. Keep preset geometry matched to the UI's
   radius/size tokens (16 canonical pixels = 1rem).
3. Run `pnpm --filter @earendil-works/elanor-react brushes:generate`.
4. Inspect `/brushes/` in the Astro docs, then run `test:brushes`, `pnpm check`,
   `pnpm build`, and `test:browser`. Commit the source, preset and generated bank.

Input contract: a `viewBox`, horizontal backbone, **closed filled paths**, baked
transforms, even-odd holes, and no strokes, clipping, images, filters, or external
references. The outer silhouette must span the viewBox's entire x range; its end
cross-sections must match, with no taper or holes across the join. SVG paint color
is ignored: only geometry/alpha is used. A new brush may need normalization; the
Noir-specific normalizer is not a universal brush converter.

`brushes:normalize` rebuilds `noir.svg` from its preserved original. It crops the
caps, smooths the width envelope, recenters it, and matches the two end profiles.
It removes large-scale taper without flattening the small edge irregularities or
internal holes. Don't run it over a different hand-edited source.

## Geometry and variation

Each seed shifts the source around one **closed, arc-length-parameterized rounded
backbone**, reverses/mirrors texture, and adds small periodic pressure changes.
The perimeter is then clipped on shared planes into eight SVG masks: the classic
nine-slice border with an empty center. Whole sets vary; individual corners are
never independently randomized. Fixed corners contain the actual rounded brush
geometry; CSS `border-radius` is not expected to bend an image.

Only edge length stretches. The perpendicular dimension remains fixed, so a long
button doesn't have a thinner border. Source width and path length are separate
quantities; multiplying thickness by an inverse length would be incorrect.
Straight separators use **one** stretched mask. Small circles use one fixed-size
closed mask, rather than collapsing a rectangular border's edges and joining
unrelated texture. Pills use a height-matched nine-slice preset with empty side
middles.

The asset bank is imported once as a stylesheet from `use-brush-variant.ts`.
Its selectors are scoped to `data-brush-variant`; importing it through CSS Modules
composition instead would duplicate the bank and can break relative asset URLs.
The package build copies SVGs beside CSS; consumer bundlers handle URL resolution.

## Component integration

- Compose `outline` from `src/brush-border/brush-border.module.css`.
- Set `data-brush-variant={useBrushVariant()}` on the decorated element. Caller
  data attributes go after this default, so an explicit variant can override it.
- Keep native border **width and color**, using `border-width`, `border-style`
  and `border-color` longhands. A transparent border image hides only its paint;
  the masked pseudo-element inherits its state-dependent color. Do not use the
  `border` shorthand here: it resets `border-image` and restores solid paint.
- Use `background-color`, not `background` shorthand, so state rules retain the
  shared `background-clip: padding-box`.
- For a borderless component, set `border-color: transparent`, `--brush-inset: 0`
  and `--brush-color` explicitly. Its mask uses background paint instead of an
  inherited border. Supply a visible solid-border forced-colors fallback too.
- Native inputs/textareas use a neutral wrapper. Refs, `className`, `style`, events,
  labels and validation attributes remain on the actual control. Use
  `rootClassName` for the wrapper's layout (e.g. sizing in a flex/grid parent).
- Compose `line` only on standalone line elements, never on containers with text.
  Use `bottomLine` / `startLine` for a container's decorative edge.
- The generated small preset expects the small radius token (3px at a 16px root),
  the circle/pill presets expect a 16px visible control. Changing radius/thickness
  independently requires a corresponding preset, not scaling the whole SVG.
- Minimum small-outline size is twice the corner slice (12px). Don't use this
  preset on smaller adornments. Focus rings remain native and unmasked.

`Button`, `Input`, `TextArea`, `Search`, and `Separator` accept `brushVariant={0…5}`.
Other decorated roots support the standard `data-brush-variant="0"` attribute.
Automatic variation uses React 18+'s SSR-safe `useId`, never random values or a
module counter. React 17 uses deterministic variant zero; use explicit variants
for variety there. Tests should use explicit variants, not depend on React's
internal ID format.

## First rollout

Buttons, icon/social buttons, card surfaces, input/field/textarea/search controls,
dropdown/searchable-dropdown triggers and separators, checkbox/radio/switch
controls, segmented controls, separators, section/disclosure edges and tabs.
Layout/text components deliberately receive no decoration.

Scrollable popup shells (modal/popover/menu/toast) and collapsed-table borders are
not migrated yet. They need a separate non-scrolling decoration host; placing an
absolute outline inside `overflow: auto` makes it scroll or clip. This first pass
keeps their existing native borders rather than introducing that regression.

## Validation

`test:brushes` verifies normalization, closure/tangents, shared clipping planes,
variant completeness and reproducible generated files. `test:browser` uses the
built Astro preview in local Chrome, Firefox and WebKit, checking hydration, loaded assets, state
colors, refs, input behavior, forced colors, dark/RTL rendering, and seam coverage
at DPR 1/2 and fractional widths. Screenshot attachments permit visual review;
there is no brittle font/platform-specific screenshot baseline. Install the two
bundled engines once with `pnpm --filter @earendil-works/elanor-react exec playwright
install firefox webkit`; the Chrome project uses the installed Chrome channel.

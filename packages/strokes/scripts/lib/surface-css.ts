interface SurfaceShape {
  name: string;
  kind: 'box' | 'circle' | 'line';
}

/** The optional skin paints explicit surfaces; it does not configure their layout. */
export function surfaceCss(band: string, shapes: SurfaceShape[]): {wrapper: string; paint: string} {
  const selector = (items: SurfaceShape[]) => `.elanor-pencil-surface:is(${items.map(shape => `[data-outline="${shape.name}"]`).join(', ')})`;
  const surface = selector(shapes);
  const solid = selector(shapes.filter(shape => shape.kind !== 'line'));
  const line = selector(shapes.filter(shape => shape.kind === 'line'));
  const focused = [
    `${solid}[data-outline-focus="self"]:focus-visible`,
    `${solid}[data-outline-focus="control"]:has(> [data-surface-control]:focus-visible)`,
    `:focus-visible > ${solid}[data-outline-focus="parent"]`,
  ];
  return {wrapper: `/* Consumer-owned wrapper. It owns its background, not its children's backgrounds. */
.elanor-pencil-wrapper {
  position: relative;
  box-sizing: border-box;
  border: var(--semantic-dimension-border-width-default) solid var(--outline-color);
  --outline-color: var(--semantic-color-border-primary);
  --outline-focus-color: var(--semantic-color-focus-ring);
  background-color: var(--semantic-color-background-canvas);
}
.elanor-pencil-wrapper[data-outline="box-small"] { border-radius: var(--semantic-dimension-radius-small); }
.elanor-pencil-wrapper[data-outline="box-medium"] { border-radius: var(--semantic-dimension-radius-medium); }
.elanor-pencil-wrapper[data-outline="box-large"] { border-radius: var(--semantic-dimension-radius-large); }
`, paint: `/* No content/padding/size changes. Components retain ordinary border space. */
/* A default only: opting in must not override consumer absolute/fixed positioning. */
:where(${surface}) { position: relative; }
${solid} {
  border-color: transparent;
  background-clip: padding-box;
}
/* Edged lines replace a border/shadow; standalone lines replace a fill. */
${line}[data-outline-edge] {
  border-color: transparent;
  box-shadow: none;
}
${line}:not([data-outline-edge]) { background-color: transparent; }
${surface}::after {
  --stroke-inset: calc(-1 * ${band});
  content: "";
  position: absolute;
  inset: var(--stroke-inset);
  pointer-events: none;
  background-color: var(--outline-color);
  mask-image: var(--stroke-images);
  mask-position: var(--stroke-mask-position);
  mask-size: var(--stroke-mask-size);
  mask-repeat: no-repeat;
}
${solid}[data-outline-band="none"]::after { --stroke-inset: 0; }

/* Focus target is explicit. Line surfaces keep their ordinary focus ring. */
${focused.join(',\n')} {
  outline: none;
}
${focused.map(selector => `${selector}::after`).join(',\n')} {
  background-color: var(--outline-focus-color);
  mask-image: var(--stroke-focus-images);
  mask-size: var(--stroke-focus-mask-size);
}
`};
}

/** Normal rendering remains intact if masking/:has is unsupported or forced colors is active. */
export function enhanceSurfaces(base: ReturnType<typeof surfaceCss>, geometry: string[], indicators: string[]): string {
  return `${base.wrapper}\n@supports (mask-image: none) and selector(:has(> input:focus-visible)) {\n@media not (forced-colors: active) {\n${base.paint}\n${geometry.join('\n\n')}\n${indicators.join('\n')}\n}\n}\n`;
}

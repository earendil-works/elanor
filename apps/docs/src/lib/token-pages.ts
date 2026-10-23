import {type ApiToken, type ApiTokenValue, loadTokens, tokenBrands} from './api.ts';

/*
 * Data for the token pages: each area's tokens in sections and groups, with every value resolved at build
 * time into the text and preview a page shows. Values are literal values from each brand's catalogue, so a
 * brand's page never needs that brand's stylesheet.
 */

/** The brand the docs themselves use, and the base other brands are compared with. */
export const defaultTokenBrand = 'radius';

const brandLabels: Readonly<Record<string, string>> = {
  radius: 'Radius',
  pi: 'Pi',
  earendil: 'Earendil',
  lefos: 'Lefos',
};

export function tokenBrandLabel(brand: string): string {
  return brandLabels[brand] ?? brand.charAt(0).toUpperCase() + brand.slice(1);
}

// Structure

interface GroupSpec {
  readonly id: string;
  readonly label: string;
  /**
   * Tokens at or below these paths belong to the group; across all groups, the longest matching prefix
   * wins. Entries follow the order of the prefixes.
   */
  readonly prefixes: readonly string[];
  /** Draw every length on the shared scale; otherwise each is drawn at true size if it fits. */
  readonly scaled?: boolean;
}

interface SectionSpec {
  readonly id: string;
  readonly label: string;
  readonly groups: readonly GroupSpec[];
}

interface AreaSpec {
  readonly id: string;
  readonly label: string;
  readonly summary: string;
  readonly tier: 'semantic' | 'primitive';
  readonly sections: readonly SectionSpec[];
}

const group = (id: string, label: string, ...prefixes: string[]): GroupSpec => ({
  id,
  label,
  prefixes,
});
/** A group whose lengths all use the shared scale, so they compare with each other. */
const scaledGroup = (id: string, label: string, ...prefixes: string[]): GroupSpec => ({
  ...group(id, label, ...prefixes),
  scaled: true,
});
const section = (id: string, label: string, ...groups: GroupSpec[]): SectionSpec => ({
  id,
  label,
  groups,
});

const color = (path: string) => `semantic.color.${path}`;
const statuses = ['information', 'positive', 'negative', 'warning'] as const;

/** Every token in one status color: content first, then fills, then content on the secondary fill. */
const statusGroup = (status: (typeof statuses)[number]) =>
  group(
    status,
    status.charAt(0).toUpperCase() + status.slice(1),
    color(`text.${status}`),
    color(`icon.${status}`),
    color(`border.${status}`),
    color(`focusRing.${status}`),
    color(`background.fill.primary.${status}`),
    color(`background.fill.secondary.${status}`),
    color(`text.onSecondaryFill.${status}`),
    color(`icon.onSecondaryFill.${status}`),
    color(`background.fill.ghost.${status}`),
  );

/** Areas in page order. Every token must belong to a group; the build fails otherwise. */
const areaSpecs: readonly AreaSpec[] = [
  {
    id: 'color',
    label: 'Color',
    summary: 'Colors for surfaces, content, fills, and status, in light and dark.',
    tier: 'semantic',
    sections: [
      section(
        'surfaces-and-content',
        'Surfaces & content',
        group(
          'surfaces',
          'Surfaces',
          color('background.canvas'),
          color('background.surface'),
          color('background.backdrop'),
          color('background.skeleton'),
          color('background'),
        ),
        group(
          'text',
          'Text',
          color('text.primary'),
          color('text.secondary'),
          color('text.link'),
          color('text'),
        ),
        group(
          'icons',
          'Icons',
          color('icon.primary'),
          color('icon.secondary'),
          color('icon.link'),
          color('icon'),
        ),
        group(
          'borders',
          'Borders',
          color('border.primary'),
          color('border.secondary'),
          color('border'),
        ),
        group('focus-ring', 'Focus ring', color('focusRing')),
      ),
      section(
        'fills',
        'Fills',
        group(
          'fill-primary',
          'Primary',
          color('background.fill.primary'),
          color('text.onPrimaryFill'),
          color('icon.onPrimaryFill'),
        ),
        group(
          'fill-secondary',
          'Secondary',
          color('background.fill.secondary'),
          color('text.onSecondaryFill'),
          color('icon.onSecondaryFill'),
        ),
        group('fill-ghost', 'Ghost', color('background.fill.ghost')),
        group(
          'fill-selected',
          'Selected',
          color('background.fill.selected'),
          color('icon.onSelectedFill'),
        ),
      ),
      section('status', 'Status', ...statuses.map(statusGroup)),
      section(
        'controls',
        'Controls',
        group('checkbox', 'Checkbox', color('background.checkbox'), color('icon.checkbox')),
        group('radio', 'Radio', color('background.radio'), color('icon.radio')),
        group('switch', 'Switch', color('background.switch')),
        group('slider', 'Slider', color('background.slider')),
      ),
      section(
        'special-purpose',
        'Special purpose',
        group('code', 'Code syntax', color('text.code')),
        group('data-viz', 'Data visualization', color('background.fill.dataViz')),
        group('logos', 'Logos', color('logo')),
      ),
    ],
  },
  {
    id: 'typography',
    label: 'Typography',
    summary: 'Text styles, headings, font families, and font weights.',
    tier: 'semantic',
    sections: [
      section(
        'text-styles',
        'Text styles',
        group(
          'body',
          'Body',
          'semantic.typography.primary',
          'semantic.typography.secondary',
          'semantic.typography.prose',
        ),
        group(
          'interface',
          'Interface',
          'semantic.typography.ui.primary',
          'semantic.typography.ui.secondary',
          'semantic.typography.ui.tertiary',
          'semantic.typography.ui',
        ),
        group('code', 'Code', 'semantic.typography.code'),
      ),
      section(
        'headings',
        'Headings',
        group('heading-app', 'App', 'semantic.typography.heading.app'),
        group(
          'heading-marketing',
          'Marketing',
          'semantic.typography.heading.marketing.display',
          'semantic.typography.heading.marketing',
        ),
      ),
      section(
        'fonts',
        'Fonts',
        group('families', 'Families', 'semantic.fontFamily'),
        group('weights', 'Weights', 'semantic.fontWeight'),
      ),
    ],
  },
  {
    id: 'space-and-size',
    label: 'Space & size',
    summary: 'Padding, gaps, sizes, and breakpoints.',
    tier: 'semantic',
    sections: [
      section(
        'space',
        'Space',
        group('padding', 'Padding', 'semantic.dimension.space.padding'),
        group('gaps', 'Gaps', 'semantic.dimension.space.gap'),
        group('flow', 'Flow', 'semantic.dimension.space.flow'),
        group(
          'controls',
          'Controls',
          'semantic.dimension.space.control.gap',
          'semantic.dimension.space.control.padding.block',
          'semantic.dimension.space.control.padding.inline',
          'semantic.dimension.space.control',
        ),
      ),
      section(
        'size',
        'Size & layout',
        group('controls-and-icons', 'Controls & icons', 'semantic.dimension.size'),
        scaledGroup(
          'layout',
          'Layout',
          'semantic.dimension.size.sidebar',
          'semantic.dimension.size.topNavigation',
        ),
        scaledGroup(
          'maximum-sizes',
          'Maximum sizes',
          'semantic.dimension.size.maxWidth',
          'semantic.dimension.size.maxHeight',
        ),
        scaledGroup('breakpoints', 'Breakpoints', 'semantic.dimension.breakpoint'),
      ),
    ],
  },
  {
    id: 'shape-and-depth',
    label: 'Shape & depth',
    summary: 'Corner radius, border width, scale, shadows, layers, and opacity.',
    tier: 'semantic',
    sections: [
      section(
        'shape',
        'Shape',
        group('radius', 'Corner radius', 'semantic.dimension.radius'),
        group('border-width', 'Border width', 'semantic.dimension.borderWidth'),
        group('scale', 'Scale', 'semantic.number.scale'),
      ),
      section(
        'depth',
        'Depth',
        group('shadows', 'Shadows', 'semantic.shadow'),
        group('layers', 'Layers', 'semantic.number.layer'),
        group('opacity', 'Opacity', 'semantic.number.opacity'),
      ),
    ],
  },
  {
    id: 'motion',
    label: 'Motion',
    summary: 'Transitions, and how far things move.',
    tier: 'semantic',
    sections: [
      // One section: the page shows its groups without a section heading.
      section(
        'motion',
        'Motion',
        group('movement', 'Movement', 'semantic.transition.movement'),
        group('state', 'Fades & state changes', 'semantic.transition'),
        group('travel', 'Travel', 'semantic.dimension.travel'),
      ),
    ],
  },
  {
    id: 'primitives',
    label: 'Primitives',
    summary: 'The raw palette and scales that semantic tokens point to.',
    tier: 'primitive',
    sections: [
      // Each palette gets a group per brand; see primitiveSections.
      section('colors', 'Colors', group('base-colors', 'Base colors', 'primitive.color')),
      section(
        'space-and-size',
        'Space & size',
        group('dimension', 'Dimension scale', 'primitive.dimension'),
        scaledGroup('breakpoints', 'Breakpoints', 'primitive.dimension.breakpoint'),
      ),
      section(
        'type',
        'Type',
        group('families', 'Families', 'primitive.fontFamily'),
        group('sizes', 'Sizes', 'primitive.dimension.fontSize'),
        group('weights', 'Weights', 'primitive.fontWeight'),
        group('line-heights', 'Line heights', 'primitive.number.lineHeight'),
        group('letter-spacing', 'Letter spacing', 'primitive.dimension.letterSpacing'),
      ),
      section(
        'shape-and-depth',
        'Shape & depth',
        group('radius', 'Radius', 'primitive.dimension.radius'),
        group('border-width', 'Border width', 'primitive.dimension.borderWidth'),
        group('scale', 'Scale', 'primitive.number.scale'),
        group('layers', 'Layers', 'primitive.number.layer'),
        group('opacity', 'Opacity', 'primitive.number.opacity'),
      ),
      section(
        'motion',
        'Motion',
        group('durations', 'Durations', 'primitive.duration'),
        group('easing', 'Easing', 'primitive.cubicBezier'),
      ),
    ],
  },
];

export interface TokenArea {
  readonly id: string;
  readonly label: string;
  readonly summary: string;
}

export const tokenAreas: readonly TokenArea[] = areaSpecs.map(({id, label, summary}) => ({
  id,
  label,
  summary,
}));

export const tokenAreaHref = (brand: string, area: string) => `/tokens/${brand}/${area}/`;

/** Short notes about a brand's area, shown above its tokens. */
const brandNotes: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  lefos: {typography: 'DepartureMono has one weight, so browsers synthesize bold.'},
};

// Page data

export interface TokenLink {
  readonly name: string;
  readonly href: string;
}

export interface TokenValueLine {
  readonly label: string;
  readonly value: string;
  readonly alias?: TokenLink | undefined;
}

export type MotionRole = 'slide' | 'fade' | 'feedback' | 'pulse' | 'stale';

export interface MotionTiming {
  /** In milliseconds. */
  readonly duration: number;
  readonly delay: number;
  readonly easing: string;
}
type Bezier = readonly [number, number, number, number];

/**
 * Lengths at true size: a bar, a square, content inset by padding, or two blocks apart. Scaled ones show
 * a share of the full width. `width` is the column width in rem the preview needs.
 */
export type LengthPreview =
  | {readonly kind: 'bar'; readonly size: string; readonly width: number}
  | {readonly kind: 'square'; readonly size: string; readonly width: number}
  | {
      readonly kind: 'inset';
      readonly size: string;
      readonly axis: 'all' | 'block' | 'inline';
      readonly width: number;
    }
  | {
      readonly kind: 'gap';
      readonly size: string;
      readonly direction: 'row' | 'column';
      readonly width: number;
    }
  | {readonly kind: 'scaled'; readonly size: string; readonly width: number};

const lengthKinds: ReadonlySet<string> = new Set(['bar', 'square', 'inset', 'gap', 'scaled']);
const isLengthPreview = (preview: TokenPreview): preview is LengthPreview =>
  lengthKinds.has(preview.kind);

export type TokenPreview =
  | {
      readonly kind: 'color';
      readonly light: string;
      readonly dark: string;
      readonly canvasLight: string;
      readonly canvasDark: string;
    }
  | {readonly kind: 'typography'; readonly font: string; readonly letterSpacing: string}
  | {readonly kind: 'font-family'; readonly family: string}
  | {readonly kind: 'font-weight'; readonly weight: string; readonly family: string}
  | LengthPreview
  | {readonly kind: 'radius'; readonly radius: string}
  | {readonly kind: 'border-width'; readonly width: string}
  | {
      readonly kind: 'shadow';
      readonly light: string;
      readonly dark: string;
      readonly canvasLight: string;
      readonly canvasDark: string;
      readonly surfaceLight: string;
      readonly surfaceDark: string;
    }
  | {readonly kind: 'opacity'; readonly opacity: string}
  | {
      readonly kind: 'motion-value';
      /** Travel slides by a distance; scale grows from a size. */
      readonly change: 'travel' | 'scale';
      /** A block, a key cap that presses down, or a popup that also fades in. */
      readonly sample: 'block' | 'key' | 'popup';
      /** Where the sample rests in the static preview: a `translate` or `scale` value. */
      readonly from: string;
      /** Room around the sample for its travel. */
      readonly room: string;
      /** How it plays; undefined for values at rest. */
      readonly timing: MotionTiming | undefined;
      /** How popups fade in. */
      readonly fade: MotionTiming | undefined;
    }
  | {readonly kind: 'easing'; readonly bezier: Bezier}
  | {
      readonly kind: 'motion';
      readonly role: MotionRole;
      readonly duration: number;
      readonly delay: number;
      readonly easing: string;
      readonly bezier: Bezier;
      /** The opacity a pulse or stale preview fades to. */
      readonly opacity: string;
    }
  | {readonly kind: 'none'};

/** One token. In a row with states, one state of the row's base token. */
export interface TokenState {
  /** The CSS variable without its dashes; also the anchor. */
  readonly id: string;
  /** `Rest`, `Hover`, `Selected hover`, …; empty for rows without states. */
  readonly label: string;
  readonly path: string;
  readonly cssVariable: string;
  readonly values: readonly TokenValueLine[];
  readonly preview: TokenPreview;
}

/** A token with its state variants, such as hover and active. */
export interface TokenEntry {
  readonly id: string;
  /** The base token's path without its tier, e.g. `color.text.primary`. */
  readonly name: string;
  readonly description: string;
  /** Some state differs from the default brand's, or the default brand lacks it. */
  readonly brandSpecific: boolean;
  /** For palette swatches: the step within the palette, e.g. `500`. */
  readonly step: string;
  /** The base token first. */
  readonly states: readonly TokenState[];
}

export interface TokenGroup {
  readonly id: string;
  readonly label: string;
  /** Palettes show as a grid of swatches; everything else as rows. */
  readonly layout: 'rows' | 'swatches';
  /** For color groups, each entry's base color in light and dark, for the summary. */
  readonly strip: ReadonlyArray<{readonly light: string; readonly dark: string}>;
  /** Tokens, counting each state. */
  readonly count: number;
  /** The preview column, when the group's previews need more than the default. */
  readonly previewSize?: string | undefined;
  /** A note shown above the tokens, such as the scale of the previews. */
  readonly caption?: string | undefined;
  readonly entries: readonly TokenEntry[];
}

export interface TokenSection {
  readonly id: string;
  readonly label: string;
  readonly groups: readonly TokenGroup[];
}

export interface TokenAreaPage {
  readonly area: TokenArea;
  readonly brand: string;
  readonly note?: string | undefined;
  readonly sections: readonly TokenSection[];
  readonly total: number;
}

// Loading

const tokenCache = new Map<string, Promise<ApiToken[]>>();
function brandTokens(brand: string): Promise<ApiToken[]> {
  let tokens = tokenCache.get(brand);
  if (!tokens) {
    tokens = loadTokens(brand);
    tokenCache.set(brand, tokens);
  }
  return tokens;
}

const signature = (token: ApiToken) => JSON.stringify([token.css, token.contexts ?? null]);

export interface TokenBrandOption {
  readonly id: string;
  readonly label: string;
  /** Only brands whose tokens differ from the default brand get pages. */
  readonly enabled: boolean;
}

/** Every brand, the default first; brands identical to the default are disabled. */
export async function tokenBrandOptions(): Promise<TokenBrandOption[]> {
  const base = new Map((await brandTokens(defaultTokenBrand)).map((t) => [t.path, signature(t)]));
  const brands = (await tokenBrands()).sort((a, b) =>
    a === defaultTokenBrand ? -1 : b === defaultTokenBrand ? 1 : a.localeCompare(b),
  );
  return Promise.all(
    brands.map(async (brand) => {
      const tokens = await brandTokens(brand);
      const same =
        tokens.length === base.size && tokens.every((t) => base.get(t.path) === signature(t));
      return {
        id: brand,
        label: tokenBrandLabel(brand),
        enabled: brand === defaultTokenBrand || !same,
      };
    }),
  );
}

const within = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}.`);
const tierOf = (path: string): AreaSpec['tier'] =>
  path.startsWith('primitive.') ? 'primitive' : 'semantic';
const displayName = (path: string) => path.slice(path.indexOf('.') + 1);
const paletteLabels: Readonly<Record<string, string>> = {dataViz: 'Data visualization'};
const titleCase = (name: string) =>
  name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());

/** The primitive sections for a brand, with a group per color palette before the base colors. */
function primitiveSections(tokens: readonly ApiToken[]): readonly SectionSpec[] {
  const counts = new Map<string, number>();
  for (const token of tokens) {
    const [, kind, palette] = token.path.split('.');
    if (kind === 'color' && palette) counts.set(palette, (counts.get(palette) ?? 0) + 1);
  }
  const palettes = [...counts]
    .filter(([, count]) => count > 1)
    .map(([palette]) =>
      group(
        `palette-${palette}`,
        paletteLabels[palette] ?? titleCase(palette),
        `primitive.color.${palette}`,
      ),
    );
  const [colors, ...rest] = areaSpecs.find((area) => area.tier === 'primitive')!.sections;
  return [{...colors!, groups: [...palettes, ...colors!.groups]}, ...rest];
}

interface Placement {
  readonly area: string;
  readonly section: string;
  readonly group: string;
  /** Index of the matching prefix within the group, for ordering. */
  readonly order: number;
}

const placementKey = (placement: {area: string; section: string; group: string}) =>
  `${placement.area}/${placement.section}/${placement.group}`;

function sectionsOf(area: AreaSpec, tokens: readonly ApiToken[]): readonly SectionSpec[] {
  return area.tier === 'primitive' ? primitiveSections(tokens) : area.sections;
}

/** Places every token in an area, section, and group by the longest matching prefix. */
function placeTokens(brand: string, tokens: readonly ApiToken[]): Map<string, Placement> {
  const candidates = areaSpecs.flatMap((area) =>
    sectionsOf(area, tokens).flatMap((spec) =>
      spec.groups.flatMap((groupSpec) =>
        groupSpec.prefixes.map((prefix, order) => ({
          prefix,
          tier: area.tier,
          placement: {area: area.id, section: spec.id, group: groupSpec.id, order},
        })),
      ),
    ),
  );
  const placements = new Map<string, Placement>();
  for (const token of tokens) {
    let best: (typeof candidates)[number] | undefined;
    for (const candidate of candidates) {
      if (
        candidate.tier === tierOf(token.path) &&
        within(token.path, candidate.prefix) &&
        candidate.prefix.length > (best?.prefix.length ?? -1)
      )
        best = candidate;
    }
    if (!best)
      throw new Error(`${brand}: ${token.path} has no token page group; add one in token-pages.ts`);
    placements.set(token.path, best.placement);
  }
  return placements;
}

// Values

interface Dimension {
  value: number;
  unit: string;
}

const isDimension = (value: unknown): value is Dimension =>
  typeof value === 'object' && value !== null && 'value' in value && 'unit' in value;

/** `1rem · 16px` for rem values, the CSS value otherwise. */
function dimensionText(value: unknown, css: string): string {
  if (isDimension(value) && value.unit === 'rem' && value.value !== 0)
    return `${css} · ${Math.round(value.value * 16 * 100) / 100}px`;
  return css;
}

/** A length in rem; undefined for units without a fixed size, such as `%` or `vw`. */
function remOf(value: unknown): number | undefined {
  if (!isDimension(value)) return undefined;
  if (value.unit === 'rem') return value.value;
  if (value.unit === 'px') return value.value / 16;
  return undefined;
}

const remText = (rem: number) => `${Math.round(rem * 1000) / 1000}rem`;

const isDimensionKind = (path: string, kind: string) =>
  within(path, `semantic.dimension.${kind}`) || within(path, `primitive.dimension.${kind}`);

/** Dimensions drawn as lengths; radius, border width, font size, and letter spacing have their own. */
const isLength = (token: ApiToken) =>
  token.type === 'dimension' &&
  !['radius', 'borderWidth', 'fontSize', 'letterSpacing'].some((kind) =>
    isDimensionKind(token.path, kind),
  );

/** What length previews are drawn in, in rem, from the brand's tokens. */
interface LengthFrame {
  /** The default preview column: `calc(size-x-large * 2)` in token-area.module.css. */
  readonly column: number;
  /** The widest a group's preview column grows to fit its previews at true size. */
  readonly widest: number;
  /** The blocks in inset and gap previews: `size-x-small`. */
  readonly block: number;
  /** The outline of inset previews: `border-width-small`. */
  readonly border: number;
  /** The full width of scaled previews: the brand's largest length. */
  readonly full: number;
}

function lengthFrame(tokens: readonly ApiToken[]): LengthFrame {
  const at = (path: string, fallback: number) =>
    remOf(tokens.find((token) => token.path === path)?.value) ?? fallback;
  const lengths = tokens.flatMap((token) => (isLength(token) ? (remOf(token.value) ?? []) : []));
  const column = at('semantic.dimension.size.xLarge', 3) * 2;
  return {
    column,
    widest: column * 1.5,
    block: at('semantic.dimension.size.xSmall', 1),
    border: at('semantic.dimension.borderWidth.small', 1 / 16),
    full: Math.max(1, ...lengths),
  };
}

/**
 * A length's preview: what the token is for at true size, a bar if that doesn't fit, and the shared scale
 * if the bar doesn't either. Units without a fixed size get no preview.
 */
function lengthPreview(frame: LengthFrame, token: ApiToken, scaled: boolean): TokenPreview {
  const rem = remOf(token.value);
  if (rem === undefined) return {kind: 'none'};
  const size = token.css;
  const fits = (width: number, height: number) => width <= frame.widest && height <= frame.widest;
  if (!scaled) {
    const role = rolePreview(frame, token.path, size, rem);
    if (role && fits(role.preview.width, role.height)) return role.preview;
    if (fits(rem, 0)) return {kind: 'bar', size, width: rem};
  }
  const share = Math.min(Math.max(rem / frame.full, 0), 1);
  return {kind: 'scaled', size: `${Math.round(share * 1000) / 10}%`, width: 0};
}

/** The preview for what a length is for, with the space it takes. */
function rolePreview(
  frame: LengthFrame,
  path: string,
  size: string,
  rem: number,
): {preview: LengthPreview; height: number} | undefined {
  const space = (kind: string) => within(path, `semantic.dimension.space.${kind}`);
  const inset = 2 * rem + frame.block + 2 * frame.border;
  const box = frame.block + 2 * frame.border;
  const apart = 2 * frame.block + rem;
  if (space('control.padding.block'))
    return {preview: {kind: 'inset', size, axis: 'block', width: box}, height: inset};
  if (space('control.padding.inline'))
    return {preview: {kind: 'inset', size, axis: 'inline', width: inset}, height: box};
  if (space('padding'))
    return {preview: {kind: 'inset', size, axis: 'all', width: inset}, height: inset};
  if (space('gap') || space('control.gap'))
    return {preview: {kind: 'gap', size, direction: 'row', width: apart}, height: frame.block};
  // Flow blocks stretch across the column.
  if (space('flow'))
    return {preview: {kind: 'gap', size, direction: 'column', width: 0}, height: apart};
  if (within(path, 'semantic.dimension.size'))
    return {preview: {kind: 'square', size, width: rem}, height: rem};
  return undefined;
}

/** A number to sort dimensions, durations, numbers, and weights by; undefined for other values. */
function magnitude(token: ApiToken): number | undefined {
  const value = token.value;
  if (typeof value === 'number') return value;
  if (isDimension(value)) return value.unit === 'rem' ? value.value * 16 : value.value;
  return undefined;
}

const bezierOf = (value: unknown): Bezier => {
  const [x1 = 0, y1 = 0, x2 = 1, y2 = 1] = Array.isArray(value) ? (value as number[]) : [];
  return [x1, y1, x2, y2];
};

const firstFamily = (family: unknown) =>
  Array.isArray(family) ? String(family[0]) : String(family ?? '');

function motionRole(path: string): MotionRole {
  if (within(path, 'semantic.transition.movement')) return 'slide';
  if (within(path, 'semantic.transition.feedback')) return 'feedback';
  if (within(path, 'semantic.transition.pulse')) return 'pulse';
  if (within(path, 'semantic.transition.stale')) return 'stale';
  return 'fade';
}

function timingOf(token: ApiToken | undefined): MotionTiming | undefined {
  if (token?.type !== 'transition') return undefined;
  const value = token.value as {duration: Dimension; delay: Dimension; timingFunction: unknown};
  return {
    duration: value.duration.value,
    delay: value.delay.value,
    easing: `cubic-bezier(${bezierOf(value.timingFunction).join(', ')})`,
  };
}

/** How a motion value plays when no transition shares its name; tokens don't say how they move. */
const neutralTiming: MotionTiming = {duration: 300, delay: 0, easing: 'ease-out'};
/** Keys press instantly; the preview holds the key down for a moment. */
const keyPressTiming: MotionTiming = {duration: 600, delay: 0, easing: 'linear'};

interface BuildContext {
  readonly brand: string;
  readonly byPath: ReadonlyMap<string, ApiToken>;
  readonly placements: ReadonlyMap<string, Placement>;
  readonly base: ReadonlyMap<string, string> | undefined;
  readonly frame: LengthFrame;
}

function link(context: BuildContext, path: string | undefined): TokenLink | undefined {
  if (!path) return undefined;
  const placement = context.placements.get(path);
  const target = context.byPath.get(path);
  if (!placement || !target) return undefined;
  return {
    name: displayName(path),
    href: `${tokenAreaHref(context.brand, placement.area)}#${target.cssVariable.slice(2)}`,
  };
}

function cssOf(context: BuildContext, path: string, scheme?: 'dark'): string {
  const token = context.byPath.get(path);
  if (!token) return '';
  return (scheme ? token.contexts?.['colorScheme']?.[scheme]?.css : undefined) ?? token.css;
}

/**
 * A travel or scale value as a motion preview. It plays with the movement transition of the same name,
 * such as `travel.popup` with `transition.movement.popup`, or a neutral timing.
 */
function motionValue(
  context: BuildContext,
  token: ApiToken,
  change: 'travel' | 'scale',
  from: string,
  room: string,
  moving: boolean,
): {line: TokenValueLine | undefined; preview: TokenPreview} {
  const name = token.path.slice(token.path.lastIndexOf('.') + 1);
  const pairedPath = `semantic.transition.movement.${name}`;
  const paired = timingOf(context.byPath.get(pairedPath));
  const sample =
    change === 'travel' && name === 'keyboardKey' ? 'key' : name === 'popup' ? 'popup' : 'block';
  const timing = moving
    ? (paired ?? (sample === 'key' ? keyPressTiming : neutralTiming))
    : undefined;
  const fade =
    sample === 'popup' && timing
      ? (timingOf(context.byPath.get('semantic.transition.fade')) ?? timing)
      : undefined;
  return {
    line:
      paired && moving
        ? {label: 'Plays with', value: displayName(pairedPath), alias: link(context, pairedPath)}
        : undefined,
    preview: {kind: 'motion-value', change, sample, from, room, timing, fade},
  };
}

function describe(
  context: BuildContext,
  token: ApiToken,
  /** Draw lengths on the shared scale. */
  scaled: boolean,
): {values: TokenValueLine[]; preview: TokenPreview} {
  const alias = link(context, token.aliasOf);
  const dark: ApiTokenValue | undefined = token.contexts?.['colorScheme']?.['dark'];
  const reduced: ApiTokenValue | undefined = token.contexts?.['motion']?.['reduced'];
  const prose: ApiTokenValue | undefined = token.contexts?.['textContext']?.['prose'];
  const semantic = tierOf(token.path) === 'semantic';

  switch (token.type) {
    case 'color': {
      const values: TokenValueLine[] = semantic
        ? dark
          ? [
              {label: 'Light', value: token.css, alias},
              {label: 'Dark', value: dark.css, alias: link(context, dark.aliasOf)},
            ]
          : [{label: 'Light and dark', value: token.css, alias}]
        : [{label: 'Value', value: token.css}];
      const hex = (token.value as {hex?: string}).hex;
      if (!semantic && hex) values.push({label: 'Hex', value: hex});
      return {
        values,
        preview: {
          kind: 'color',
          light: token.css,
          dark: dark?.css ?? token.css,
          canvasLight: cssOf(context, 'semantic.color.background.canvas'),
          canvasDark: cssOf(context, 'semantic.color.background.canvas', 'dark'),
        },
      };
    }
    case 'typography': {
      const value = token.value as {
        fontFamily: unknown;
        fontSize: Dimension;
        fontWeight: number;
        lineHeight: number;
        letterSpacing?: Dimension;
      };
      const size = `${value.fontSize.value}${value.fontSize.unit}`;
      const letterSpacing = value.letterSpacing
        ? `${value.letterSpacing.value}${value.letterSpacing.unit}`
        : '0rem';
      const values: TokenValueLine[] = [
        {label: 'Size', value: dimensionText(value.fontSize, size)},
        {label: 'Line height', value: String(value.lineHeight)},
        {label: 'Weight', value: String(value.fontWeight)},
        {label: 'Family', value: firstFamily(value.fontFamily)},
      ];
      if (value.letterSpacing?.value) values.push({label: 'Letter spacing', value: letterSpacing});
      if (alias) values.push({label: 'Alias of', value: alias.name, alias});
      if (prose) values.push({label: 'In prose', value: prose.css.split(' "')[0] ?? prose.css});
      return {values, preview: {kind: 'typography', font: token.css, letterSpacing}};
    }
    case 'fontFamily':
      return {
        values: [{label: 'Stack', value: token.css, alias}],
        preview: {kind: 'font-family', family: token.css},
      };
    case 'fontWeight':
      return {
        values: [{label: 'Weight', value: token.css, alias}],
        preview: {
          kind: 'font-weight',
          weight: token.css,
          family: cssOf(context, 'semantic.fontFamily.ui'),
        },
      };
    case 'dimension': {
      const values = [{label: 'Value', value: dimensionText(token.value, token.css), alias}];
      const is = (kind: string) => isDimensionKind(token.path, kind);
      if (is('radius')) return {values, preview: {kind: 'radius', radius: token.css}};
      if (is('borderWidth')) return {values, preview: {kind: 'border-width', width: token.css}};
      if (is('fontSize'))
        return {
          values,
          preview: {
            kind: 'typography',
            font: `400 ${token.css}/1.2 ${cssOf(context, 'semantic.fontFamily.ui')}`,
            letterSpacing: '0rem',
          },
        };
      if (is('letterSpacing')) return {values, preview: {kind: 'none'}};
      const rem = remOf(token.value);
      // Travel that isn't a length, or too long to show, is drawn like other lengths.
      if (is('travel') && rem !== undefined && Math.abs(rem) <= context.frame.block) {
        const offset = within(token.path, 'semantic.dimension.travel.keyboardKey') ? rem : -rem;
        const {line, preview} = motionValue(
          context,
          token,
          'travel',
          `0 ${offset}rem`,
          `${Math.abs(rem)}rem`,
          rem !== 0,
        );
        return {values: line ? [...values, line] : values, preview};
      }
      return {values, preview: lengthPreview(context.frame, token, scaled)};
    }
    case 'shadow':
      return {
        values: dark
          ? [
              {label: 'Light', value: token.css},
              {label: 'Dark', value: dark.css},
            ]
          : [{label: 'Value', value: token.css}],
        preview: {
          kind: 'shadow',
          light: token.css,
          dark: dark?.css ?? token.css,
          canvasLight: cssOf(context, 'semantic.color.background.canvas'),
          canvasDark: cssOf(context, 'semantic.color.background.canvas', 'dark'),
          surfaceLight: cssOf(context, 'semantic.color.background.surface'),
          surfaceDark: cssOf(context, 'semantic.color.background.surface', 'dark'),
        },
      };
    case 'number': {
      const values = [{label: 'Value', value: token.css, alias}];
      const is = (kind: string) =>
        within(token.path, `semantic.number.${kind}`) ||
        within(token.path, `primitive.number.${kind}`);
      if (is('opacity')) return {values, preview: {kind: 'opacity', opacity: token.css}};
      const scale = Number(token.value);
      // Scales outside 0–1 would draw beyond the outline; they show the value only.
      if (is('scale') && scale >= 0 && scale <= 1) {
        const {line, preview} = motionValue(
          context,
          token,
          'scale',
          String(scale),
          '0rem',
          scale !== 1,
        );
        return {values: line ? [...values, line] : values, preview};
      }
      return {values, preview: {kind: 'none'}};
    }
    case 'transition': {
      const value = token.value as {duration: Dimension; delay: Dimension; timingFunction: unknown};
      const bezier = bezierOf(value.timingFunction);
      const easing = `cubic-bezier(${bezier.join(', ')})`;
      const values: TokenValueLine[] = [
        {label: 'Duration', value: `${value.duration.value}${value.duration.unit}`},
      ];
      if (value.delay.value)
        values.push({label: 'Delay', value: `${value.delay.value}${value.delay.unit}`});
      values.push({label: 'Easing', value: easing});
      if (reduced) {
        const reducedValue = reduced.value as {duration: Dimension};
        values.push({
          label: 'Reduced motion',
          value: `${reducedValue.duration.value}${reducedValue.duration.unit}`,
        });
      }
      const role = motionRole(token.path);
      return {
        values,
        preview: {
          kind: 'motion',
          role,
          duration: value.duration.value,
          delay: value.delay.value,
          easing,
          bezier,
          opacity: cssOf(
            context,
            role === 'pulse' ? 'semantic.number.opacity.pulse' : 'semantic.number.opacity.stale',
          ),
        },
      };
    }
    case 'cubicBezier':
      return {
        values: [{label: 'Value', value: token.css}],
        preview: {kind: 'easing', bezier: bezierOf(token.value)},
      };
    default:
      return {values: [{label: 'Value', value: token.css, alias}], preview: {kind: 'none'}};
  }
}

/** Path segments that name an interaction state of the token before them. */
const stateNames = new Set(['hover', 'active', 'selected']);

/**
 * The token a state variant belongs to, and the state's label: `radio.selected.hover` belongs to `radio`
 * as `Selected hover`. Only tokens whose base is in the same group are merged.
 */
function stateBase(path: string, inGroup: ReadonlySet<string>): {base: string; label: string} {
  let base = path;
  const states: string[] = [];
  for (;;) {
    const cut = base.lastIndexOf('.');
    const last = base.slice(cut + 1);
    const parent = base.slice(0, cut);
    if (!stateNames.has(last) || !inGroup.has(parent)) break;
    states.unshift(last);
    base = parent;
  }
  const label = states.join(' ');
  return {base, label: label ? label.charAt(0).toUpperCase() + label.slice(1) : 'Rest'};
}

/**
 * Orders tokens that matched the same prefix: numeric steps by number (`dimension.200` before
 * `dimension.1000`), named scales by value (`gap.xSmall` before `gap.large`), others by path.
 */
function compareWithinPrefix(prefix: string, a: ApiToken, b: ApiToken): number {
  const step = (token: ApiToken) => token.path.slice(prefix.length + 1).split('.')[0] ?? '';
  const [sa, sb] = [step(a), step(b)];
  if (!sa || !sb) return sa ? 1 : sb ? -1 : 0;
  const [na, nb] = [Number(sa), Number(sb)];
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb || a.path.localeCompare(b.path);
  const [ma, mb] = [magnitude(a), magnitude(b)];
  if (ma !== undefined && mb !== undefined) return ma - mb || a.path.localeCompare(b.path);
  return a.path.localeCompare(b.path);
}

/** A wider preview column, so every length in the group fits at true size. */
function previewSize(frame: LengthFrame, states: readonly TokenState[]): string | undefined {
  const widest = Math.max(
    0,
    ...states.map((state) => (isLengthPreview(state.preview) ? state.preview.width : 0)),
  );
  return widest > frame.column ? remText(widest) : undefined;
}

/** Says how scaled previews are drawn, if a group has any. */
function scaleCaption(frame: LengthFrame, states: readonly TokenState[]): string | undefined {
  const scaled = states.filter((state) => state.preview.kind === 'scaled').length;
  if (scaled === 0) return undefined;
  const lengths = states.filter((state) => isLengthPreview(state.preview)).length;
  const which = scaled === lengths ? 'Scaled' : `Lengths over ${remText(frame.widest)} are scaled`;
  return `${which}: full width is ${remText(frame.full)} (${Math.round(frame.full * 16)}px)`;
}

function buildGroup(
  context: BuildContext,
  area: string,
  sectionId: string,
  spec: GroupSpec,
  tokens: readonly ApiToken[],
): TokenGroup {
  const key = placementKey({area, section: sectionId, group: spec.id});
  const members = tokens
    .filter((token) => {
      const placement = context.placements.get(token.path);
      return placement && placementKey(placement) === key;
    })
    .sort((a, b) => {
      const [pa, pb] = [context.placements.get(a.path)!, context.placements.get(b.path)!];
      return pa.order - pb.order || compareWithinPrefix(spec.prefixes[pa.order]!, a, b);
    });

  const described = members.map((token): TokenState => ({
    id: token.cssVariable.slice(2),
    label: '',
    path: token.path,
    cssVariable: token.cssVariable,
    ...describe(context, token, spec.scaled ?? false),
  }));
  const byPath = new Map(described.map((state) => [state.path, state]));

  const paths = new Set(members.map((token) => token.path));
  const entries = new Map<string, {token: ApiToken; states: TokenState[]; specific: boolean}>();
  for (const token of members) {
    const {base, label} = stateBase(token.path, paths);
    const state = {...byPath.get(token.path)!, label};
    const specific = context.base ? context.base.get(token.path) !== signature(token) : false;
    const entry = entries.get(base);
    if (entry) {
      entry.states.push(state);
      entry.specific ||= specific;
    } else {
      entries.set(base, {token, states: [state], specific});
    }
  }

  const stateRank = (label: string) =>
    ['Rest', 'Hover', 'Active', 'Selected', 'Selected hover', 'Selected active'].indexOf(label);
  for (const entry of entries.values())
    entry.states.sort((a, b) => stateRank(a.label) - stateRank(b.label));

  const prefix = spec.prefixes[0]!;
  const list = [...entries.values()].map(({token, states, specific}): TokenEntry => ({
    id: token.cssVariable.slice(2),
    name: displayName(token.path),
    description: token.description,
    brandSpecific: specific,
    step: token.path.slice(prefix.length + 1) || 'base',
    // A single token has no state to name.
    states: states.length > 1 ? states : states.map((state) => ({...state, label: ''})),
  }));

  return {
    id: spec.id,
    label: spec.label,
    layout: spec.id.startsWith('palette-') ? 'swatches' : 'rows',
    strip: list.flatMap((entry) => {
      const preview = entry.states[0]?.preview;
      return preview?.kind === 'color' ? [{light: preview.light, dark: preview.dark}] : [];
    }),
    count: members.length,
    previewSize: previewSize(context.frame, described),
    caption: scaleCaption(context.frame, described),
    entries: list,
  };
}

/** One brand's tokens for one area, in sections and groups, with display values and previews. */
export async function tokenAreaPage(brand: string, areaId: string): Promise<TokenAreaPage> {
  const area = areaSpecs.find((spec) => spec.id === areaId);
  if (!area) throw new Error(`Unknown token area ${areaId}`);
  const tokens = await brandTokens(brand);
  const context: BuildContext = {
    brand,
    byPath: new Map(tokens.map((token) => [token.path, token])),
    placements: placeTokens(brand, tokens),
    frame: lengthFrame(tokens),
    base:
      brand === defaultTokenBrand
        ? undefined
        : new Map((await brandTokens(defaultTokenBrand)).map((t) => [t.path, signature(t)])),
  };

  const sections = sectionsOf(area, tokens)
    .map((spec): TokenSection => ({
      id: spec.id,
      label: spec.label,
      groups: spec.groups
        .map((groupSpec) => buildGroup(context, area.id, spec.id, groupSpec, tokens))
        .filter((built) => built.count > 0),
    }))
    .filter((built) => built.groups.length > 0);

  return {
    area: {id: area.id, label: area.label, summary: area.summary},
    brand,
    note: brandNotes[brand]?.[area.id],
    sections,
    total: sections.reduce(
      (sum, built) => sum + built.groups.reduce((count, item) => count + item.count, 0),
      0,
    ),
  };
}

/** The number of tokens in each area, for the overview. */
export async function tokenAreaCounts(brand: string): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (const area of areaSpecs) counts.set(area.id, (await tokenAreaPage(brand, area.id)).total);
  return counts;
}

/** Every page: each enabled brand with each area. */
export async function tokenAreaPaths(): Promise<Array<{brand: string; area: string}>> {
  const brands = (await tokenBrandOptions()).filter((brand) => brand.enabled);
  return brands.flatMap((brand) => areaSpecs.map((area) => ({brand: brand.id, area: area.id})));
}

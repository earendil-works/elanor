import {useRender} from '@base-ui/react/use-render';
import {createContext, useContext} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './grid.module.css';

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type GridSpan = GridColumns | 'full';
export type GridBreakpoint = 'base' | 'xSmall' | 'small' | 'medium' | 'large' | 'xLarge';
export type GridResponsiveSpan = GridSpan | Partial<Record<GridBreakpoint, GridSpan>>;
export type GridStart = GridColumns | 'auto' | 'end';
export type GridResponsiveStart = GridStart | Partial<Record<GridBreakpoint, GridStart>>;
export type GridGap = 'xxSmall' | 'xSmall' | 'small' | 'medium' | 'large' | 'xLarge';

const breakpoints = ['base', 'xSmall', 'small', 'medium', 'large', 'xLarge'] as const;
type TrackCounts = Record<GridBreakpoint, GridColumns>;
// Only track counts travel through context. CSS owns all width-dependent layout.
const GridContext = /* @__PURE__ */ createContext<TrackCounts | null>(null);

function useTrackCounts(): TrackCounts {
  const counts = useContext(GridContext);
  if (!counts) throw new Error('Grid.Item and Grid.Subgrid must be inside Grid.Root.');
  return counts;
}

function resolveSpans(span: GridResponsiveSpan, counts: TrackCounts) {
  let current: GridSpan = typeof span === 'object' ? 'full' : span;
  const spans = {} as Record<GridBreakpoint, GridSpan>;
  const tracks = {} as TrackCounts;
  for (const breakpoint of breakpoints) {
    if (typeof span === 'object') current = span[breakpoint] ?? current;
    if (current !== 'full' && (!Number.isInteger(current) || current < 1 || current > 12)) {
      throw new RangeError('Grid spans must be an integer from 1 to 12, or "full".');
    }
    tracks[breakpoint] =
      current === 'full'
        ? counts[breakpoint]
        : (Math.min(current, counts[breakpoint]) as GridColumns);
    spans[breakpoint] = current === 'full' ? 'full' : tracks[breakpoint];
  }
  return {spans, tracks};
}

// Span rules set `grid-column-start: span N`, so a start is written as the end line; `-1` is the
// row's end.
function resolveEnds(
  start: GridResponsiveStart,
  spans: Record<GridBreakpoint, GridSpan>,
  tracks: TrackCounts,
  counts: TrackCounts,
) {
  let current: GridStart = typeof start === 'object' ? 'auto' : start;
  // SAFETY: the loop below assigns every breakpoint before the record is read.
  const ends = {} as Record<GridBreakpoint, number | undefined>;
  for (const breakpoint of breakpoints) {
    if (typeof start === 'object') current = start[breakpoint] ?? current;
    if (
      current !== 'auto' &&
      current !== 'end' &&
      (!Number.isInteger(current) || current < 1 || current > 12)
    ) {
      throw new RangeError('Grid starts must be an integer from 1 to 12, "auto", or "end".');
    }
    if (current === 'auto' || spans[breakpoint] === 'full') {
      ends[breakpoint] = undefined;
      continue;
    }
    const end = current === 'end' ? -1 : current + tracks[breakpoint];
    // Starts that would overflow the row move back until the item ends on its last line.
    ends[breakpoint] = end > counts[breakpoint] ? -1 : end;
  }
  return ends;
}

function endAttributes(ends: Record<GridBreakpoint, number | undefined>) {
  return {
    'data-end-base': ends.base,
    'data-end-x-small': ends.xSmall,
    'data-end-small': ends.small,
    'data-end-medium': ends.medium,
    'data-end-large': ends.large,
    'data-end-x-large': ends.xLarge,
  };
}

function spanAttributes(spans: Record<GridBreakpoint, GridSpan>) {
  return {
    'data-span-base': spans.base,
    'data-span-x-small': spans.xSmall,
    'data-span-small': spans.small,
    'data-span-medium': spans.medium,
    'data-span-large': spans.large,
    'data-span-x-large': spans.xLarge,
  };
}

export interface GridRootProps extends useRender.ComponentProps<'div'> {
  /** Number of equal tracks. */
  readonly columns?: GridColumns;
  /** Space between tracks. */
  readonly gap?: GridGap;
}

export function GridRoot({
  ref,
  columns = 12,
  gap = 'medium',
  render,
  className,
  ...props
}: GridRootProps) {
  if (!Number.isInteger(columns) || columns < 1 || columns > 12) {
    throw new RangeError('Grid columns must be an integer from 1 to 12.');
  }
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...props,
      className: classes(styles.root, className),
      'data-columns': columns,
      'data-gap': gap,
    },
  });
  const counts: TrackCounts = {
    base: columns,
    xSmall: columns,
    small: columns,
    medium: columns,
    large: columns,
    xLarge: columns,
  };
  return <GridContext.Provider value={counts}>{element}</GridContext.Provider>;
}

export interface GridItemProps extends useRender.ComponentProps<'div'> {
  /**
   * Tracks to span, or `full` for a full row. Key by container breakpoint, such as
   * `{base: 'full', small: 6}`; each value applies until the next key.
   */
  readonly span?: GridResponsiveSpan;
  /** Track to start on, or `end` for the row's end. Keyed like `span`; full rows ignore it. */
  readonly start?: GridResponsiveStart;
}

export function GridItem({
  ref,
  span = 'full',
  start = 'auto',
  render,
  className,
  ...props
}: GridItemProps) {
  const counts = useTrackCounts();
  const {spans, tracks} = resolveSpans(span, counts);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...props,
      ...spanAttributes(spans),
      ...endAttributes(resolveEnds(start, spans, tracks, counts)),
      className: classes(styles.item, className),
    },
  });
}

export interface GridSubgridProps extends GridItemProps {}

export function GridSubgrid({
  ref,
  span = 'full',
  start = 'auto',
  render,
  className,
  ...props
}: GridSubgridProps) {
  const counts = useTrackCounts();
  const {spans, tracks} = resolveSpans(span, counts);
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...props,
      ...spanAttributes(spans),
      ...endAttributes(resolveEnds(start, spans, tracks, counts)),
      className: classes(styles.item, styles.subgrid, className),
    },
  });
  return <GridContext.Provider value={tracks}>{element}</GridContext.Provider>;
}

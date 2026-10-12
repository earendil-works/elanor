import {useRender} from '@base-ui/react/use-render';
import {createContext, useContext} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './grid.module.css';

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type GridSpan = GridColumns | 'full';
export type GridBreakpoint = 'base' | 'xSmall' | 'small' | 'medium' | 'large' | 'xLarge';
export type GridResponsiveSpan = GridSpan | Partial<Record<GridBreakpoint, GridSpan>>;
export type GridGap = 'xxSmall' | 'xSmall' | 'small' | 'medium' | 'large' | 'xLarge';

const breakpoints = ['base', 'xSmall', 'small', 'medium', 'large', 'xLarge'] as const;
type TrackCounts = Record<GridBreakpoint, GridColumns>;
// Only track counts travel through context. CSS owns all width-dependent layout.
const GridContext = createContext<TrackCounts | null>(null);

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
  readonly columns?: GridColumns;
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
  readonly span?: GridResponsiveSpan;
}

export function GridItem({ref, span = 'full', render, className, ...props}: GridItemProps) {
  const {spans} = resolveSpans(span, useTrackCounts());
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {...props, ...spanAttributes(spans), className: classes(styles.item, className)},
  });
}

export interface GridSubgridProps extends GridItemProps {}

export function GridSubgrid({ref, span = 'full', render, className, ...props}: GridSubgridProps) {
  const {spans, tracks} = resolveSpans(span, useTrackCounts());
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...props,
      ...spanAttributes(spans),
      className: classes(styles.item, styles.subgrid, className),
    },
  });
  return <GridContext.Provider value={tracks}>{element}</GridContext.Provider>;
}

export const Grid = {Root: GridRoot, Item: GridItem, Subgrid: GridSubgrid} as const;

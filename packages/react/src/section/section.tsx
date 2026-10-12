import type {HTMLAttributes, Ref} from 'react';

import {Grid, type GridItemProps} from '../grid/grid.tsx';
import {Separator, type SeparatorProps} from '../separator/separator.tsx';
import {classes, mergeClassName} from '../utils/class-names.ts';

import styles from './section.module.css';

export interface SectionRootProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement> | undefined;
}

export function SectionRoot({ref, className, ...props}: SectionRootProps) {
  return <section {...props} ref={ref} className={classes(styles.section, className)} />;
}

export interface SectionContentProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function SectionContent({ref, className, ...props}: SectionContentProps) {
  return <div {...props} ref={ref} className={classes(styles.content, className)} />;
}

export interface SectionSeparatorProps extends Omit<SeparatorProps, 'orientation'> {
  readonly span?: GridItemProps['span'];
  readonly orientation?: 'horizontal';
}

export function SectionSeparator({ref, span = 'full', ...props}: SectionSeparatorProps) {
  // Resolve stateful classes in Separator, not in Grid's render-element prop merge.
  return (
    <Grid.Root>
      <Grid.Item
        span={span}
        ref={ref}
        render={(gridProps) => (
          <Separator
            {...gridProps}
            {...props}
            orientation="horizontal"
            className={mergeClassName(gridProps.className, props.className)}
          />
        )}
      />
    </Grid.Root>
  );
}

export const Section = {
  Root: SectionRoot,
  Content: SectionContent,
  Separator: SectionSeparator,
} as const;

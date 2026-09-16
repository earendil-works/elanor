import {forwardRef, type HTMLAttributes} from 'react';
import styles from './section.module.css';
import {useBrushVariant} from '../brush-border/use-brush-variant.ts';
import {classes} from '../utils/class-names.ts';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  readonly separated?: boolean;
}

export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  {separated = true, className, ...props}, ref,
) {
  return (
    <section
      data-brush-variant={useBrushVariant()}
      {...props}
      ref={ref}
      className={classes(styles.section, separated && styles.separated, className)}
    />
  );
});

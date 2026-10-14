import {forwardRef, type HTMLAttributes} from 'react';
import styles from './section.module.css';
import {useSurfaceClassName} from '../appearance/appearance.tsx';
import {classes} from '../utils/class-names.ts';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  readonly separated?: boolean;
}

export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  {separated = true, className, ...props}, ref,
) {
  const surfaceClassName = useSurfaceClassName();
  return (
    <section
      data-outline={separated ? 'line' : undefined}
      data-outline-focus="self"
      data-outline-edge={separated ? 'block-end' : undefined}
      {...props}
      ref={ref}
      className={classes(styles.section, surfaceClassName, separated && styles.separated, className)}
    />
  );
});

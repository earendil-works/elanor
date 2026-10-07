import {forwardRef, type HTMLAttributes} from 'react';
import styles from './page.module.css';
import {classes} from '../utils/class-names.ts';

export interface PageProps extends HTMLAttributes<HTMLDivElement> {}

// Layout.Main owns the main landmark; Page groups content inside it.
export const Page = forwardRef<HTMLDivElement, PageProps>(function Page(
  {className, ...props}, ref,
) {
  return <div {...props} ref={ref} className={classes(styles.page, className)} />;
});

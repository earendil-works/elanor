import type {HTMLAttributes, Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './page.module.css';

export interface PageProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

// Layout.Main owns the main landmark; Page groups content inside it.
export function Page({ref, className, ...props}: PageProps) {
  return <div {...props} ref={ref} className={classes(styles.page, className)} />;
}

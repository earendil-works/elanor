import type {HTMLAttributes, Ref} from 'react';

import {Heading, type HeadingProps} from '../heading/heading.tsx';
import {Text} from '../text/text.tsx';
import {classes} from '../utils/class-names.ts';

import styles from './page-header.module.css';

export interface PageHeaderRootProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement> | undefined;
}

export function PageHeaderRoot({ref, className, ...props}: PageHeaderRootProps) {
  return <header {...props} ref={ref} className={classes(styles.header, className)} />;
}

export interface PageHeaderRowProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function PageHeaderRow({ref, className, ...props}: PageHeaderRowProps) {
  return <div {...props} ref={ref} className={classes(styles.headerRow, className)} />;
}

export type PageHeaderTitleProps = Omit<HeadingProps, 'size'>;

export function PageHeaderTitle({ref, className, ...props}: PageHeaderTitleProps) {
  return <Heading {...props} ref={ref} size={1} className={classes(styles.title, className)} />;
}

export interface PageHeaderDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  readonly ref?: Ref<HTMLParagraphElement> | undefined;
}

export function PageHeaderDescription({ref, ...props}: PageHeaderDescriptionProps) {
  return <Text {...props} as="p" ref={ref} />;
}

export interface PageHeaderActionsProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function PageHeaderActions({ref, className, ...props}: PageHeaderActionsProps) {
  return <div {...props} ref={ref} className={classes(styles.actions, className)} />;
}

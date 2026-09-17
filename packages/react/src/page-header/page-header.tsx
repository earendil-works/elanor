import {createElement, forwardRef, type HTMLAttributes} from 'react';
import type {HeadingLevel} from '../heading/heading.tsx';
import styles from './page-header.module.css';
import {classes} from '../utils/class-names.ts';

export interface PageHeaderProps extends HTMLAttributes<HTMLElement> {}

export const PageHeaderRoot = forwardRef<HTMLElement, PageHeaderProps>(
  function PageHeaderRoot({className, ...props}, ref) {
    return <header {...props} ref={ref} className={classes(styles.header, className)} />;
  },
);

export interface PageHeaderRowProps extends HTMLAttributes<HTMLDivElement> {}

export const PageHeaderRow = forwardRef<HTMLDivElement, PageHeaderRowProps>(
  function PageHeaderRow({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.headerRow, className)} />;
  },
);

export interface PageHeaderTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  readonly level: HeadingLevel;
}

export const PageHeaderTitle = forwardRef<HTMLHeadingElement, PageHeaderTitleProps>(
  function PageHeaderTitle({level, className, ...props}, ref) {
    return createElement(`h${level}`, {...props, ref, className: classes(styles.title, className)});
  },
);

export interface PageHeaderDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const PageHeaderDescription = forwardRef<HTMLParagraphElement, PageHeaderDescriptionProps>(
  function PageHeaderDescription({className, ...props}, ref) {
    return <p {...props} ref={ref} className={classes(styles.description, className)} />;
  },
);

export interface PageHeaderActionsProps extends HTMLAttributes<HTMLDivElement> {}

export const PageHeaderActions = forwardRef<HTMLDivElement, PageHeaderActionsProps>(
  function PageHeaderActions({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.actions, className)} />;
  },
);

export const PageHeader = {
  Root: PageHeaderRoot,
  Row: PageHeaderRow,
  Title: PageHeaderTitle,
  Description: PageHeaderDescription,
  Actions: PageHeaderActions,
} as const;

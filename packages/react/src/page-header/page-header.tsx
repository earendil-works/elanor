import {forwardRef, type HTMLAttributes} from 'react';

import {Heading, type HeadingProps} from '../heading/heading.tsx';
import {Text} from '../text/text.tsx';
import {classes} from '../utils/class-names.ts';

import styles from './page-header.module.css';

export interface PageHeaderProps extends HTMLAttributes<HTMLElement> {}

export const PageHeaderRoot = forwardRef<HTMLElement, PageHeaderProps>(function PageHeaderRoot(
  {className, ...props},
  ref,
) {
  return <header {...props} ref={ref} className={classes(styles.header, className)} />;
});

export interface PageHeaderRowProps extends HTMLAttributes<HTMLDivElement> {}

export const PageHeaderRow = forwardRef<HTMLDivElement, PageHeaderRowProps>(function PageHeaderRow(
  {className, ...props},
  ref,
) {
  return <div {...props} ref={ref} className={classes(styles.headerRow, className)} />;
});

export type PageHeaderTitleProps = Omit<HeadingProps, 'size'>;

export const PageHeaderTitle = forwardRef<HTMLHeadingElement, PageHeaderTitleProps>(
  function PageHeaderTitle({className, ...props}, ref) {
    return <Heading {...props} ref={ref} size={1} className={classes(styles.title, className)} />;
  },
);

export interface PageHeaderDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const PageHeaderDescription = forwardRef<HTMLParagraphElement, PageHeaderDescriptionProps>(
  function PageHeaderDescription(props, ref) {
    return <Text {...props} as="p" ref={ref} />;
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

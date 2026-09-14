import {createElement, forwardRef, type HTMLAttributes} from 'react';
import type {HeadingLevel} from '../heading/heading.tsx';
import styles from './empty-state.module.css';
import {classes} from '../utils/class-names.ts';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {}

export const EmptyStateRoot = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyStateRoot({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.root, className)} />;
  },
);

export const EmptyStateIllustration = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function EmptyStateIllustration({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.illustration, className)} />;
  },
);

export const EmptyStateBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function EmptyStateBody({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.body, className)} />;
  },
);

export const EmptyStateCopy = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function EmptyStateCopy({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.copy, className)} />;
  },
);

export interface EmptyStateTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  readonly level: HeadingLevel;
}

export const EmptyStateTitle = forwardRef<HTMLHeadingElement, EmptyStateTitleProps>(
  function EmptyStateTitle({level, className, ...props}, ref) {
    return createElement(`h${level}`, {...props, ref, className: classes(styles.title, className)});
  },
);

export const EmptyStateDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function EmptyStateDescription({className, ...props}, ref) {
    return <p {...props} ref={ref} className={classes(styles.description, className)} />;
  },
);

export const EmptyStateActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function EmptyStateActions({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.actions, className)} />;
  },
);

export const EmptyState = {
  Root: EmptyStateRoot,
  Illustration: EmptyStateIllustration,
  Body: EmptyStateBody,
  Copy: EmptyStateCopy,
  Title: EmptyStateTitle,
  Description: EmptyStateDescription,
  Actions: EmptyStateActions,
} as const;

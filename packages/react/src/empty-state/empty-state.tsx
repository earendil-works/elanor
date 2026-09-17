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

export interface EmptyStateIllustrationProps extends HTMLAttributes<HTMLDivElement> {}

export const EmptyStateIllustration = forwardRef<HTMLDivElement, EmptyStateIllustrationProps>(
  function EmptyStateIllustration({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.illustration, className)} />;
  },
);

export interface EmptyStateBodyProps extends HTMLAttributes<HTMLDivElement> {}

export const EmptyStateBody = forwardRef<HTMLDivElement, EmptyStateBodyProps>(
  function EmptyStateBody({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.body, className)} />;
  },
);

export interface EmptyStateCopyProps extends HTMLAttributes<HTMLDivElement> {}

export const EmptyStateCopy = forwardRef<HTMLDivElement, EmptyStateCopyProps>(
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

export interface EmptyStateDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const EmptyStateDescription = forwardRef<HTMLParagraphElement, EmptyStateDescriptionProps>(
  function EmptyStateDescription({className, ...props}, ref) {
    return <p {...props} ref={ref} className={classes(styles.description, className)} />;
  },
);

export interface EmptyStateActionsProps extends HTMLAttributes<HTMLDivElement> {}

export const EmptyStateActions = forwardRef<HTMLDivElement, EmptyStateActionsProps>(
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

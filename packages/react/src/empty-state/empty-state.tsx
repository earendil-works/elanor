import {createElement, type HTMLAttributes, type Ref} from 'react';

import type {HeadingLevel} from '../heading/heading.tsx';
import {classes} from '../utils/class-names.ts';

import styles from './empty-state.module.css';

export interface EmptyStateRootProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function EmptyStateRoot({ref, className, ...props}: EmptyStateRootProps) {
  return <div {...props} ref={ref} className={classes(styles.root, className)} />;
}

export interface EmptyStateIllustrationProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function EmptyStateIllustration({ref, className, ...props}: EmptyStateIllustrationProps) {
  return <div {...props} ref={ref} className={classes(styles.illustration, className)} />;
}

export interface EmptyStateBodyProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function EmptyStateBody({ref, className, ...props}: EmptyStateBodyProps) {
  return <div {...props} ref={ref} className={classes(styles.body, className)} />;
}

export interface EmptyStateCopyProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function EmptyStateCopy({ref, className, ...props}: EmptyStateCopyProps) {
  return <div {...props} ref={ref} className={classes(styles.copy, className)} />;
}

export interface EmptyStateTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  readonly ref?: Ref<HTMLHeadingElement> | undefined;
  /** Heading level. Follow the page outline. */
  readonly level: HeadingLevel;
}

export function EmptyStateTitle({ref, level, className, ...props}: EmptyStateTitleProps) {
  return createElement(`h${level}`, {...props, ref, className: classes(styles.title, className)});
}

export interface EmptyStateDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  readonly ref?: Ref<HTMLParagraphElement> | undefined;
}

export function EmptyStateDescription({ref, className, ...props}: EmptyStateDescriptionProps) {
  return <p {...props} ref={ref} className={classes(styles.description, className)} />;
}

export interface EmptyStateActionsProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function EmptyStateActions({ref, className, ...props}: EmptyStateActionsProps) {
  return <div {...props} ref={ref} className={classes(styles.actions, className)} />;
}

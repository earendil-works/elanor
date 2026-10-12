import type {HTMLAttributes, Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './top-navigation.module.css';

export interface TopNavigationRootProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement> | undefined;
}

export function TopNavigationRoot({ref, className, ...props}: TopNavigationRootProps) {
  return <header {...props} ref={ref} className={classes(styles.root, className)} />;
}

export interface TopNavigationIdentityProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function TopNavigationIdentity({ref, className, ...props}: TopNavigationIdentityProps) {
  return <div {...props} ref={ref} className={classes(styles.identity, className)} />;
}

export interface TopNavigationNavigationProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function TopNavigationNavigation({ref, className, ...props}: TopNavigationNavigationProps) {
  return <div {...props} ref={ref} className={classes(styles.navigation, className)} />;
}

export interface TopNavigationActionsProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function TopNavigationActions({ref, className, ...props}: TopNavigationActionsProps) {
  return <div {...props} ref={ref} className={classes(styles.actions, className)} />;
}

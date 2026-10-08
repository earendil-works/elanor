import {forwardRef, type HTMLAttributes} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './top-navigation.module.css';

export interface TopNavigationProps extends HTMLAttributes<HTMLElement> {}

export const TopNavigationRoot = forwardRef<HTMLElement, TopNavigationProps>(
  function TopNavigationRoot({className, ...props}, ref) {
    return <header {...props} ref={ref} className={classes(styles.root, className)} />;
  },
);

export interface TopNavigationIdentityProps extends HTMLAttributes<HTMLDivElement> {}

export const TopNavigationIdentity = forwardRef<HTMLDivElement, TopNavigationIdentityProps>(
  function TopNavigationIdentity({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.identity, className)} />;
  },
);

export interface TopNavigationNavigationProps extends HTMLAttributes<HTMLDivElement> {}

export const TopNavigationNavigation = forwardRef<HTMLDivElement, TopNavigationNavigationProps>(
  function TopNavigationNavigation({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.navigation, className)} />;
  },
);

export interface TopNavigationActionsProps extends HTMLAttributes<HTMLDivElement> {}

export const TopNavigationActions = forwardRef<HTMLDivElement, TopNavigationActionsProps>(
  function TopNavigationActions({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.actions, className)} />;
  },
);

export const TopNavigation = {
  Root: TopNavigationRoot,
  Identity: TopNavigationIdentity,
  Navigation: TopNavigationNavigation,
  Actions: TopNavigationActions,
} as const;

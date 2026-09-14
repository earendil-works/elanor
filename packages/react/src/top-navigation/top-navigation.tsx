import {forwardRef, type HTMLAttributes} from 'react';
import styles from './top-navigation.module.css';
import {classes} from '../utils/class-names.ts';

export type TopNavigationVariant = 'marketing' | 'login' | 'app';

export interface TopNavigationProps extends HTMLAttributes<HTMLElement> {
  readonly variant?: TopNavigationVariant;
}

export const TopNavigationRoot = forwardRef<HTMLElement, TopNavigationProps>(
  function TopNavigationRoot({variant = 'app', className, ...props}, ref) {
    return (
      <header {...props} ref={ref} data-variant={variant} className={classes(styles.root, className)} />
    );
  },
);

export const TopNavigationIdentity = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function TopNavigationIdentity({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.identity, className)} />;
  },
);

export const TopNavigationNavigation = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function TopNavigationNavigation({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.navigation, className)} />;
  },
);

export const TopNavigationActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
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

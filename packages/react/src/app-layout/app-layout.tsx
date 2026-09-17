import {forwardRef, type HTMLAttributes} from 'react';
import styles from './app-layout.module.css';
import {classes} from '../utils/class-names.ts';

export interface AppLayoutProps extends HTMLAttributes<HTMLDivElement> {}

export const AppLayoutRoot = forwardRef<HTMLDivElement, AppLayoutProps>(function AppLayoutRoot(
  {className, ...props}, ref,
) {
  return <div {...props} ref={ref} className={classes(styles.root, className)} />;
});

export interface AppLayoutBackgroundProps extends HTMLAttributes<HTMLDivElement> {}

export const AppLayoutBackground = forwardRef<HTMLDivElement, AppLayoutBackgroundProps>(
  function AppLayoutBackground({className, ...props}, ref) {
    return <div aria-hidden="true" {...props} ref={ref} className={classes(styles.background, className)} />;
  },
);

export interface AppLayoutHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const AppLayoutHeader = forwardRef<HTMLDivElement, AppLayoutHeaderProps>(
  function AppLayoutHeader({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.header, className)} />;
  },
);

export interface AppLayoutBodyProps extends HTMLAttributes<HTMLDivElement> {}

export const AppLayoutBody = forwardRef<HTMLDivElement, AppLayoutBodyProps>(
  function AppLayoutBody({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.body, className)} />;
  },
);

export interface AppLayoutSidebarProps extends HTMLAttributes<HTMLElement> {}

export const AppLayoutSidebar = forwardRef<HTMLElement, AppLayoutSidebarProps>(
  function AppLayoutSidebar({className, ...props}, ref) {
    return <aside {...props} ref={ref} className={classes(styles.sidebar, className)} />;
  },
);

export interface AppLayoutContentProps extends HTMLAttributes<HTMLElement> {}

export const AppLayoutContent = forwardRef<HTMLElement, AppLayoutContentProps>(
  function AppLayoutContent({className, ...props}, ref) {
    return <main {...props} ref={ref} className={classes(styles.content, className)} />;
  },
);

export const AppLayout = {
  Root: AppLayoutRoot,
  Background: AppLayoutBackground,
  Header: AppLayoutHeader,
  Body: AppLayoutBody,
  Sidebar: AppLayoutSidebar,
  Content: AppLayoutContent,
} as const;

import {forwardRef, type HTMLAttributes} from 'react';
import styles from './app-layout.module.css';
import {classes} from '../utils/class-names.ts';

export interface AppLayoutProps extends HTMLAttributes<HTMLDivElement> {}

export const AppLayoutRoot = forwardRef<HTMLDivElement, AppLayoutProps>(function AppLayoutRoot(
  {className, ...props}, ref,
) {
  return <div {...props} ref={ref} className={classes(styles.root, className)} />;
});

export const AppLayoutBackground = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function AppLayoutBackground({className, ...props}, ref) {
    return <div aria-hidden="true" {...props} ref={ref} className={classes(styles.background, className)} />;
  },
);

export const AppLayoutHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function AppLayoutHeader({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.header, className)} />;
  },
);

export const AppLayoutBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function AppLayoutBody({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.body, className)} />;
  },
);

export const AppLayoutSidebar = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function AppLayoutSidebar({className, ...props}, ref) {
    return <aside {...props} ref={ref} className={classes(styles.sidebar, className)} />;
  },
);

export const AppLayoutContent = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
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

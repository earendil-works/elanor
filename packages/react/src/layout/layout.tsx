import {forwardRef} from 'react';
import {useRender} from '@base-ui/react/use-render';
import {mergeProps} from '@base-ui/react/merge-props';
import styles from './layout.module.css';

export interface LayoutRootProps extends useRender.ComponentProps<'div'> {}

export const LayoutRoot = forwardRef<HTMLDivElement, LayoutRootProps>(function LayoutRoot(
  {render, ...props}, ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: styles.root}, props),
  });
});

export interface LayoutHeaderProps extends useRender.ComponentProps<'header'> {}

export const LayoutHeader = forwardRef<HTMLElement, LayoutHeaderProps>(function LayoutHeader(
  {render, ...props}, ref,
) {
  return useRender({
    defaultTagName: 'header',
    render,
    ref,
    props: mergeProps<'header'>({className: styles.header}, props),
  });
});

export interface LayoutBodyProps extends useRender.ComponentProps<'div'> {}

export const LayoutBody = forwardRef<HTMLDivElement, LayoutBodyProps>(function LayoutBody(
  {render, ...props}, ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: styles.body}, props),
  });
});

export interface LayoutAsideProps extends useRender.ComponentProps<'aside'> {}

export const LayoutAside = forwardRef<HTMLElement, LayoutAsideProps>(function LayoutAside(
  {render, ...props}, ref,
) {
  return useRender({
    defaultTagName: 'aside',
    render,
    ref,
    props: mergeProps<'aside'>({className: styles.aside}, props),
  });
});

export interface LayoutMainProps extends useRender.ComponentProps<'main'> {}

export const LayoutMain = forwardRef<HTMLElement, LayoutMainProps>(function LayoutMain(
  {render, ...props}, ref,
) {
  return useRender({
    defaultTagName: 'main',
    render,
    ref,
    props: mergeProps<'main'>({className: styles.main}, props),
  });
});

export interface LayoutFooterProps extends useRender.ComponentProps<'footer'> {}

export const LayoutFooter = forwardRef<HTMLElement, LayoutFooterProps>(function LayoutFooter(
  {render, ...props}, ref,
) {
  return useRender({
    defaultTagName: 'footer',
    render,
    ref,
    props: mergeProps<'footer'>({className: styles.footer}, props),
  });
});

export const Layout = {
  Root: LayoutRoot,
  Header: LayoutHeader,
  Body: LayoutBody,
  Aside: LayoutAside,
  Main: LayoutMain,
  Footer: LayoutFooter,
} as const;

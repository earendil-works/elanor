import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';

import styles from './layout.module.css';

export interface LayoutRootProps extends useRender.ComponentProps<'div'> {}

export function LayoutRoot({ref, render, ...props}: LayoutRootProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: styles.root}, props),
  });
}

export interface LayoutHeaderProps extends useRender.ComponentProps<'header'> {}

export function LayoutHeader({ref, render, ...props}: LayoutHeaderProps) {
  return useRender({
    defaultTagName: 'header',
    render,
    ref,
    props: mergeProps<'header'>({className: styles.header}, props),
  });
}

export interface LayoutBodyProps extends useRender.ComponentProps<'div'> {}

export function LayoutBody({ref, render, ...props}: LayoutBodyProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: styles.body}, props),
  });
}

export interface LayoutAsideProps extends useRender.ComponentProps<'aside'> {}

export function LayoutAside({ref, render, ...props}: LayoutAsideProps) {
  return useRender({
    defaultTagName: 'aside',
    render,
    ref,
    props: mergeProps<'aside'>({className: styles.aside}, props),
  });
}

export interface LayoutMainProps extends useRender.ComponentProps<'main'> {}

export function LayoutMain({ref, render, ...props}: LayoutMainProps) {
  return useRender({
    defaultTagName: 'main',
    render,
    ref,
    props: mergeProps<'main'>({className: styles.main}, props),
  });
}

export interface LayoutFooterProps extends useRender.ComponentProps<'footer'> {}

export function LayoutFooter({ref, render, ...props}: LayoutFooterProps) {
  return useRender({
    defaultTagName: 'footer',
    render,
    ref,
    props: mergeProps<'footer'>({className: styles.footer}, props),
  });
}

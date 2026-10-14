import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';

import styles from './layout.module.css';

export interface LayoutRootProps extends useRender.ComponentProps<'div'> {}

/** The page frame. The document scrolls, not Root. */
export function LayoutRoot({ref, render, ...props}: LayoutRootProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: styles.root}, props),
  });
}

export interface LayoutHeaderProps extends useRender.ComponentProps<'header'> {}

/** Optional top region. Not sticky by default. */
export function LayoutHeader({ref, render, ...props}: LayoutHeaderProps) {
  return useRender({
    defaultTagName: 'header',
    render,
    ref,
    props: mergeProps<'header'>({className: styles.header}, props),
  });
}

export interface LayoutBodyProps extends useRender.ComponentProps<'div'> {}

/** Holds up to two asides and the main content; a row from the medium breakpoint. */
export function LayoutBody({ref, render, ...props}: LayoutBodyProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({className: styles.body}, props),
  });
}

export interface LayoutAsideProps extends useRender.ComponentProps<'aside'> {}

/** Side region, sticky and scrollable from the medium breakpoint. Name it with `aria-label`. */
export function LayoutAside({ref, render, ...props}: LayoutAsideProps) {
  return useRender({
    defaultTagName: 'aside',
    render,
    ref,
    props: mergeProps<'aside'>({className: styles.aside}, props),
  });
}

export interface LayoutMainProps extends useRender.ComponentProps<'main'> {}

/** The main landmark. Fills the remaining width, without a cap. */
export function LayoutMain({ref, render, ...props}: LayoutMainProps) {
  return useRender({
    defaultTagName: 'main',
    render,
    ref,
    props: mergeProps<'main'>({className: styles.main}, props),
  });
}

export interface LayoutFooterProps extends useRender.ComponentProps<'footer'> {}

/** Optional bottom region. */
export function LayoutFooter({ref, render, ...props}: LayoutFooterProps) {
  return useRender({
    defaultTagName: 'footer',
    render,
    ref,
    props: mergeProps<'footer'>({className: styles.footer}, props),
  });
}

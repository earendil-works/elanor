import {
  forwardRef,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import styles from './side-navigation.module.css';
import {classes} from './shared.ts';

export const SideNavigationRoot = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function SideNavigationRoot({className, ...props}, ref) {
    return <nav {...props} ref={ref} className={classes(styles.root, className)} />;
  },
);

export const SideNavigationGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SideNavigationGroup({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.group, className)} />;
  },
);

export const SideNavigationGroupLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SideNavigationGroupLabel({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.groupLabel, className)} />;
  },
);

export const SideNavigationList = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(
  function SideNavigationList({className, ...props}, ref) {
    return <ul {...props} ref={ref} className={classes(styles.list, className)} />;
  },
);

export const SideNavigationItem = forwardRef<HTMLLIElement, HTMLAttributes<HTMLLIElement>>(
  function SideNavigationItem({className, ...props}, ref) {
    return <li {...props} ref={ref} className={classes(styles.item, className)} />;
  },
);

export interface SideNavigationLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly active?: boolean;
  readonly iconStart?: ReactNode;
  readonly iconEnd?: ReactNode;
}

export const SideNavigationLink = forwardRef<HTMLAnchorElement, SideNavigationLinkProps>(
  function SideNavigationLink(
    {active = false, iconStart, iconEnd, children, className, ...props},
    ref,
  ) {
    return (
      <a
        {...props}
        ref={ref}
        aria-current={active ? 'page' : props['aria-current']}
        data-active={active ? '' : undefined}
        className={classes(styles.link, className)}
      >
        {iconStart ? <span className={styles.icon}>{iconStart}</span> : null}
        <span className={styles.label}>{children}</span>
        {iconEnd ? <span className={styles.icon}>{iconEnd}</span> : null}
      </a>
    );
  },
);

export const SideNavigation = {
  Root: SideNavigationRoot,
  Group: SideNavigationGroup,
  GroupLabel: SideNavigationGroupLabel,
  List: SideNavigationList,
  Item: SideNavigationItem,
  Link: SideNavigationLink,
} as const;

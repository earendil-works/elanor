import {
  createContext,
  forwardRef,
  useContext,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import {CompactTooltip} from '../sidebar/compact-tooltip.tsx';
import {classes} from '../utils/class-names.ts';

import styles from './side-navigation.module.css';

export type SideNavigationVariant = 'default' | 'compact';

export interface SideNavigationRootProps extends HTMLAttributes<HTMLElement> {
  readonly variant?: SideNavigationVariant;
}

const CompactContext = createContext(false);

export const SideNavigationRoot = forwardRef<HTMLElement, SideNavigationRootProps>(
  function SideNavigationRoot({variant = 'default', className, ...props}, ref) {
    return (
      <CompactContext.Provider value={variant === 'compact'}>
        <nav
          {...props}
          ref={ref}
          data-variant={variant}
          className={classes(styles.root, className)}
        />
      </CompactContext.Provider>
    );
  },
);

export interface SideNavigationGroupProps extends HTMLAttributes<HTMLDivElement> {}

export const SideNavigationGroup = forwardRef<HTMLDivElement, SideNavigationGroupProps>(
  function SideNavigationGroup({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.group, className)} />;
  },
);

export interface SideNavigationGroupLabelProps extends HTMLAttributes<HTMLDivElement> {}

export const SideNavigationGroupLabel = forwardRef<HTMLDivElement, SideNavigationGroupLabelProps>(
  function SideNavigationGroupLabel({className, ...props}, ref) {
    const compact = useContext(CompactContext);
    return (
      <div
        {...props}
        ref={ref}
        data-compact={compact ? '' : undefined}
        className={classes(styles.groupLabel, className)}
      />
    );
  },
);

export interface SideNavigationListProps extends HTMLAttributes<HTMLUListElement> {}

export const SideNavigationList = forwardRef<HTMLUListElement, SideNavigationListProps>(
  function SideNavigationList({className, ...props}, ref) {
    return <ul {...props} ref={ref} className={classes(styles.list, className)} />;
  },
);

export interface SideNavigationItemProps extends HTMLAttributes<HTMLLIElement> {}

export const SideNavigationItem = forwardRef<HTMLLIElement, SideNavigationItemProps>(
  function SideNavigationItem({className, ...props}, ref) {
    return <li {...props} ref={ref} className={classes(styles.item, className)} />;
  },
);

export interface SideNavigationLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly active?: boolean;
  readonly iconStart?: ReactNode;
  readonly iconEnd?: ReactNode;
  /** Decorative, non-interactive alternative to an icon in compact navigation. */
  readonly compactContent?: ReactNode;
}

export const SideNavigationLink = forwardRef<HTMLAnchorElement, SideNavigationLinkProps>(
  function SideNavigationLink(
    {active = false, iconStart, iconEnd, compactContent, children, className, ...props},
    ref,
  ) {
    const compact = useContext(CompactContext);
    const compactLabel =
      props['aria-label'] ??
      (typeof children === 'string' || typeof children === 'number' ? String(children) : undefined);
    const hasCompactContent =
      compactContent != null && typeof compactContent !== 'boolean' && compactContent !== '';
    if (compact && !(hasCompactContent || iconStart || iconEnd)) {
      throw new Error(
        'Compact SideNavigation.Link requires iconStart, iconEnd, or compactContent.',
      );
    }
    if (compact && !compactLabel?.trim()) {
      throw new Error(
        'Compact SideNavigation.Link requires text children or an explicit aria-label.',
      );
    }
    return (
      <CompactTooltip enabled={compact} label={compactLabel}>
        <a
          {...props}
          ref={ref}
          aria-label={compact ? compactLabel : props['aria-label']}
          aria-current={active ? 'page' : props['aria-current']}
          data-active={active ? '' : undefined}
          data-compact={compact ? '' : undefined}
          className={classes(styles.link, className)}
        >
          {iconStart ? (
            <span className={styles.icon} aria-hidden="true" hidden={compact && hasCompactContent}>
              {iconStart}
            </span>
          ) : null}
          <span className={styles.label}>{children}</span>
          {iconEnd ? (
            <span
              className={styles.icon}
              aria-hidden="true"
              hidden={compact && (hasCompactContent || Boolean(iconStart))}
            >
              {iconEnd}
            </span>
          ) : null}
          {hasCompactContent ? (
            <span className={styles.compactContent} aria-hidden="true" hidden={!compact}>
              {compactContent}
            </span>
          ) : null}
        </a>
      </CompactTooltip>
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

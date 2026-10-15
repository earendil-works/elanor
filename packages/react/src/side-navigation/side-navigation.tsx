import {KeyboardArrowDownIcon} from '@earendil-works/elanor-icons-react';
import {
  createContext,
  useContext,
  type AnchorHTMLAttributes,
  type DetailsHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';

import {CompactTooltip} from '../sidebar/compact-tooltip.tsx';
import {classes} from '../utils/class-names.ts';

import styles from './side-navigation.module.css';

export type SideNavigationVariant = 'default' | 'compact';

export interface SideNavigationRootProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement> | undefined;
  /**
   * `compact` shows only each link's icon or `compactContent`, with the label in a tooltip.
   * Every link then needs one of them.
   */
  readonly variant?: SideNavigationVariant;
}

const CompactContext = /* @__PURE__ */ createContext(false);

export function SideNavigationRoot({
  ref,
  variant = 'default',
  className,
  ...props
}: SideNavigationRootProps) {
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
}

export interface SideNavigationGroupProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function SideNavigationGroup({ref, className, ...props}: SideNavigationGroupProps) {
  return <div {...props} ref={ref} className={classes(styles.group, className)} />;
}

export interface SideNavigationGroupLabelProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function SideNavigationGroupLabel({
  ref,
  className,
  ...props
}: SideNavigationGroupLabelProps) {
  const compact = useContext(CompactContext);
  return (
    <div
      {...props}
      ref={ref}
      data-compact={compact ? '' : undefined}
      className={classes(styles.groupLabel, className)}
    />
  );
}

export interface SideNavigationListProps extends HTMLAttributes<HTMLUListElement> {
  readonly ref?: Ref<HTMLUListElement> | undefined;
}

export function SideNavigationList({ref, className, ...props}: SideNavigationListProps) {
  return <ul {...props} ref={ref} className={classes(styles.list, className)} />;
}

export interface SideNavigationItemProps extends HTMLAttributes<HTMLLIElement> {
  readonly ref?: Ref<HTMLLIElement> | undefined;
}

export function SideNavigationItem({ref, className, ...props}: SideNavigationItemProps) {
  return <li {...props} ref={ref} className={classes(styles.item, className)} />;
}

export interface SideNavigationLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly ref?: Ref<HTMLAnchorElement> | undefined;
  /** Marks the current page and sets `aria-current="page"`. */
  readonly active?: boolean;
  /** Decorative icon before the label. */
  readonly iconStart?: ReactNode;
  /** Decorative icon after the label. */
  readonly iconEnd?: ReactNode;
  /** Decorative content shown instead of the icon in compact navigation, such as initials. */
  readonly compactContent?: ReactNode;
}

export function SideNavigationLink({
  ref,
  active = false,
  iconStart,
  iconEnd,
  compactContent,
  children,
  className,
  ...props
}: SideNavigationLinkProps) {
  const compact = useContext(CompactContext);
  const compactLabel =
    props['aria-label'] ??
    (typeof children === 'string' || typeof children === 'number' ? String(children) : undefined);
  const hasCompactContent =
    compactContent != null && typeof compactContent !== 'boolean' && compactContent !== '';
  if (compact && !(hasCompactContent || iconStart || iconEnd)) {
    throw new Error('Compact SideNavigation.Link requires iconStart, iconEnd, or compactContent.');
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
}

export interface SideNavigationCollapsibleProps extends DetailsHTMLAttributes<HTMLDetailsElement> {
  readonly ref?: Ref<HTMLDetailsElement> | undefined;
}

/**
 * A section of links that opens and closes, on a native `details` element, so it works before
 * and without JavaScript. Put a `CollapsibleTrigger` and a `List` inside, in an `Item`. Pass
 * `open` for the section that contains the current page.
 */
export function SideNavigationCollapsible({
  ref,
  className,
  ...props
}: SideNavigationCollapsibleProps) {
  return <details {...props} ref={ref} className={classes(styles.collapsible, className)} />;
}

export interface SideNavigationCollapsibleTriggerProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement> | undefined;
}

/** The section's title, a `summary` styled like a link with a chevron at the end. */
export function SideNavigationCollapsibleTrigger({
  ref,
  children,
  className,
  ...props
}: SideNavigationCollapsibleTriggerProps) {
  return (
    <summary {...props} ref={ref} className={classes(styles.link, styles.trigger, className)}>
      <span className={styles.label}>{children}</span>
      <span className={classes(styles.icon, styles.chevron)} aria-hidden="true">
        <KeyboardArrowDownIcon />
      </span>
    </summary>
  );
}

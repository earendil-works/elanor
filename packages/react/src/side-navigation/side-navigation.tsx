import {Collapsible as BaseCollapsible} from '@base-ui/react/collapsible';
import {useRender} from '@base-ui/react/use-render';
import {KeyboardArrowDownIcon} from '@earendil-works/elanor-icons-react';
import {
  createContext,
  useContext,
  type AnchorHTMLAttributes,
  type ComponentPropsWithRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';

import {CompactTooltip} from '../sidebar/compact-tooltip.tsx';
import {classes, mergeClassName} from '../utils/class-names.ts';

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

export type SideNavigationCollapsibleProps = BaseCollapsible.Root.Props;

/**
 * A section of links that opens and closes. Put a `CollapsibleTrigger` and a `CollapsiblePanel`
 * with a `List` inside, in an `Item`. Pass `defaultOpen` to the section that contains the current
 * page, or control it with `open` and `onOpenChange`.
 */
export function SideNavigationCollapsible({
  ref,
  className,
  ...props
}: SideNavigationCollapsibleProps) {
  return (
    <BaseCollapsible.Root
      {...props}
      ref={ref}
      className={mergeClassName<BaseCollapsible.Root.State>(styles.collapsible, className)}
    />
  );
}

export type SideNavigationCollapsibleTriggerProps = BaseCollapsible.Trigger.Props;

/** The section's title, a button styled like a link with a chevron at the end. */
export function SideNavigationCollapsibleTrigger({
  ref,
  children,
  className,
  ...props
}: SideNavigationCollapsibleTriggerProps) {
  return (
    <BaseCollapsible.Trigger
      {...props}
      ref={ref}
      className={mergeClassName<BaseCollapsible.Trigger.State>(
        classes(styles.link, styles.trigger),
        className,
      )}
    >
      <span className={styles.label}>{children}</span>
      <span className={classes(styles.icon, styles.chevron)} aria-hidden="true">
        <KeyboardArrowDownIcon />
      </span>
    </BaseCollapsible.Trigger>
  );
}

export type SideNavigationCollapsiblePanelProps = BaseCollapsible.Panel.Props;

function PanelElement({
  elementProps,
  render,
  state,
}: {
  elementProps: ComponentPropsWithRef<'div'>;
  render: SideNavigationCollapsiblePanelProps['render'];
  state: BaseCollapsible.Panel.State;
}) {
  const style = elementProps.style as CSSProperties & {'--collapsible-panel-height'?: string};
  const height = style['--collapsible-panel-height'];
  return useRender({
    render: typeof render === 'function' ? (props) => render(props, state) : render,
    props: {
      ...elementProps,
      // Clip only while the height animates, so focus rings show at rest.
      'data-height-transition': height !== undefined && height !== 'auto' ? '' : undefined,
    },
  });
}

/**
 * The section's links. It grows and shrinks to its measured height. Closed panels stay in the
 * document by default (`keepMounted`), so their links are part of the page's HTML.
 */
export function SideNavigationCollapsiblePanel({
  ref,
  keepMounted = true,
  className,
  render,
  ...props
}: SideNavigationCollapsiblePanelProps) {
  return (
    <BaseCollapsible.Panel
      {...props}
      ref={ref}
      keepMounted={keepMounted}
      render={(elementProps, state) => (
        <PanelElement elementProps={elementProps} render={render} state={state} />
      )}
      className={mergeClassName<BaseCollapsible.Panel.State>(styles.panel, className)}
    />
  );
}

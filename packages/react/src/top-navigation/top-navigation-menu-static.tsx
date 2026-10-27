import {
  CloseIcon,
  KeyboardArrowDownIcon,
  KeyboardArrowLeftIcon,
  KeyboardArrowRightIcon,
  MenuIcon,
} from '@earendil-works/elanor-icons-react';
import {
  createContext,
  useContext,
  useId,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';

import type {
  CollapsibleStaticPanelProps,
  CollapsibleStaticRootProps,
  CollapsibleStaticTriggerProps,
} from '../collapsible/collapsible-static.tsx';
import * as Collapsible from '../collapsible/index.ts';
import {classes} from '../utils/class-names.ts';
import type {TopNavigationMenuPanelProps} from './top-navigation-menu.tsx';

import styles from './top-navigation-menu.module.css';

interface StaticMenuContextValue {
  readonly popupId: string;
  readonly defaultPanel: string;
}

const StaticMenuContext = /* @__PURE__ */ createContext<StaticMenuContextValue | null>(null);

function useStaticMenu(part: string): StaticMenuContextValue {
  const menu = useContext(StaticMenuContext);
  if (!menu) throw new Error(`TopNavigation.${part} must be inside TopNavigation.StaticMenu.`);
  return menu;
}

export interface TopNavigationStaticMenuProps {
  /** The panel shown each time the menu opens. */
  readonly defaultPanel: string;
  readonly children?: ReactNode;
}

/**
 * The top navigation's menu for pages without React in the browser;
 * `createTopNavigationMenu` makes it work. Renders no element.
 */
export function TopNavigationStaticMenu({defaultPanel, children}: TopNavigationStaticMenuProps) {
  const id = useId();
  return (
    <StaticMenuContext.Provider value={{popupId: `${id}-menu`, defaultPanel}}>
      {children}
    </StaticMenuContext.Provider>
  );
}

export interface TopNavigationStaticMenuTriggerProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  readonly ref?: Ref<HTMLButtonElement> | undefined;
  /** The accessible name, such as "Navigation menu". */
  readonly 'aria-label': string;
}

export function TopNavigationStaticMenuTrigger({
  ref,
  className,
  ...props
}: TopNavigationStaticMenuTriggerProps) {
  const {popupId} = useStaticMenu('StaticMenuTrigger');
  return (
    <button
      type="button"
      {...props}
      ref={ref}
      aria-haspopup="dialog"
      aria-expanded={false}
      popoverTarget={popupId}
      className={classes(styles.trigger, className)}
    >
      <MenuIcon className={styles.openIcon} />
      <CloseIcon className={styles.closeIcon} />
    </button>
  );
}

export interface TopNavigationStaticMenuPopupProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
  /** The accessible name, such as "Navigation menu". */
  readonly 'aria-label': string;
  /** A `nav` with the panels, named like the navigation it replaces. */
  readonly children?: ReactNode;
}

/** The open menu below the top navigation; a native popover. */
export function TopNavigationStaticMenuPopup({
  ref,
  className,
  ...props
}: TopNavigationStaticMenuPopupProps) {
  const {popupId, defaultPanel} = useStaticMenu('StaticMenuPopup');
  return (
    <div
      role="dialog"
      {...props}
      ref={ref}
      id={popupId}
      popover="auto"
      data-elanor="top-navigation-menu"
      data-elanor-default-panel={defaultPanel}
      className={classes(styles.popup, className)}
    />
  );
}

export type TopNavigationStaticMenuPanelProps = TopNavigationMenuPanelProps;

/** A panel of items. One level of nesting. */
export function TopNavigationStaticMenuPanel({
  ref,
  panel,
  parent,
  backLabel,
  className,
  children,
  ...props
}: TopNavigationStaticMenuPanelProps) {
  const {defaultPanel} = useStaticMenu('StaticMenuPanel');
  const current = defaultPanel === panel;
  const position = current ? 'current' : parent ? 'after' : 'before';
  return (
    <div
      {...props}
      ref={ref}
      data-position={position}
      data-elanor-panel={panel}
      data-elanor-parent={parent}
      inert={!current}
      className={classes(styles.panel, className)}
    >
      {parent ? (
        <button type="button" className={styles.back} data-elanor-back="">
          <span className={styles.icon} aria-hidden="true">
            <KeyboardArrowLeftIcon />
          </span>
          <span className={styles.label}>{backLabel}</span>
        </button>
      ) : null}
      {children}
    </div>
  );
}

export interface TopNavigationStaticMenuLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly ref?: Ref<HTMLAnchorElement> | undefined;
  /** Marks the current page with `aria-current="page"`. */
  readonly active?: boolean;
}

/** A link in the menu. Choosing it closes the menu. */
export function TopNavigationStaticMenuLink({
  ref,
  active = false,
  href,
  children,
  className,
  ...props
}: TopNavigationStaticMenuLinkProps) {
  return (
    <a
      {...props}
      ref={ref}
      href={href}
      aria-current={active ? 'page' : props['aria-current']}
      className={classes(styles.link, className)}
    >
      <span className={styles.label}>{children}</span>
    </a>
  );
}

export interface TopNavigationStaticMenuPanelTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly ref?: Ref<HTMLButtonElement> | undefined;
  /** The nested panel this item opens. */
  readonly panel: string;
  /** Marks the item as the section with the current page (`aria-current="true"`). */
  readonly active?: boolean;
}

/** An item that slides to a nested panel, marked with a chevron. */
export function TopNavigationStaticMenuPanelTrigger({
  ref,
  panel,
  active = false,
  className,
  children,
  ...props
}: TopNavigationStaticMenuPanelTriggerProps) {
  return (
    <button
      type="button"
      {...props}
      ref={ref}
      aria-current={active ? 'true' : props['aria-current']}
      data-elanor-panel-trigger={panel}
      className={classes(styles.link, className)}
    >
      <span className={styles.label}>{children}</span>
      <span className={styles.icon} aria-hidden="true">
        <KeyboardArrowRightIcon />
      </span>
    </button>
  );
}

export type TopNavigationStaticMenuCollapsibleProps = CollapsibleStaticRootProps;

export function TopNavigationStaticMenuCollapsible({
  className,
  ...props
}: TopNavigationStaticMenuCollapsibleProps) {
  return <Collapsible.StaticRoot {...props} className={classes(styles.collapsible, className)} />;
}

export type TopNavigationStaticMenuCollapsibleTriggerProps = CollapsibleStaticTriggerProps;

export function TopNavigationStaticMenuCollapsibleTrigger({
  className,
  children,
  ...props
}: TopNavigationStaticMenuCollapsibleTriggerProps) {
  return (
    <Collapsible.StaticTrigger
      {...props}
      className={classes(styles.link, styles.collapsibleTrigger, className)}
    >
      <span className={styles.label}>{children}</span>
      <span className={classes(styles.icon, styles.chevron)} aria-hidden="true">
        <KeyboardArrowDownIcon />
      </span>
    </Collapsible.StaticTrigger>
  );
}

export type TopNavigationStaticMenuCollapsiblePanelProps = CollapsibleStaticPanelProps;

export function TopNavigationStaticMenuCollapsiblePanel({
  className,
  ...props
}: TopNavigationStaticMenuCollapsiblePanelProps) {
  return (
    <Collapsible.StaticPanel {...props} className={classes(styles.collapsiblePanel, className)} />
  );
}

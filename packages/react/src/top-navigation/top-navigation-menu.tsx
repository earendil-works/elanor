import {Collapsible as BaseCollapsible} from '@base-ui/react/collapsible';
import {Dialog as BaseDialog} from '@base-ui/react/dialog';
import {
  CloseIcon,
  KeyboardArrowDownIcon,
  KeyboardArrowLeftIcon,
  KeyboardArrowRightIcon,
  MenuIcon,
} from '@earendil-works/elanor-icons-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';

import {classes, mergeClassName} from '../utils/class-names.ts';

import styles from './top-navigation-menu.module.css';

interface MenuContextValue {
  readonly id: string;
  readonly open: boolean;
  readonly panel: string;
  readonly showPanel: (panel: string) => void;
  /** Returns from a nested panel to its parent. */
  readonly goBack: (from: string, to: string) => void;
  /** The nested panel just returned from, whose trigger takes focus. */
  readonly returnedFrom: string | null;
  readonly close: () => void;
}

const MenuContext = /* @__PURE__ */ createContext<MenuContextValue | null>(null);

function useMenu(part: string): MenuContextValue {
  const menu = useContext(MenuContext);
  if (!menu) throw new Error(`TopNavigation.${part} must be inside TopNavigation.Menu.`);
  return menu;
}

function panelId(menuId: string, panel: string): string {
  return `${menuId}-${panel}`;
}

export interface TopNavigationMenuProps extends Omit<
  BaseDialog.Root.Props,
  'modal' | 'disablePointerDismissal' | 'actionsRef'
> {
  /** The panel shown each time the menu opens. */
  readonly defaultPanel: string;
}

/**
 * The top navigation's menu for narrow screens: a `MenuTrigger` in the bar opens a `MenuPopup`
 * below it, with `MenuPanel`s that slide to nested sections. Built on Base UI's Dialog, without
 * modality: the bar's other controls stay usable, and clicking them leaves the menu open.
 * Renders no element.
 */
export function TopNavigationMenu({defaultPanel, onOpenChange, ...props}: TopNavigationMenuProps) {
  const id = useId();
  const actionsRef = useRef<BaseDialog.Root.Actions>(null);
  const [open, setOpen] = useState(props.defaultOpen ?? false);
  const [panel, setPanel] = useState(defaultPanel);
  const [returnedFrom, setReturnedFrom] = useState<string | null>(null);
  const close = useCallback(() => actionsRef.current?.close(), []);
  const showPanel = useCallback((next: string) => {
    setReturnedFrom(null);
    setPanel(next);
  }, []);
  const goBack = useCallback((from: string, to: string) => {
    setReturnedFrom(from);
    setPanel(to);
  }, []);

  return (
    <MenuContext.Provider
      value={{id, open: props.open ?? open, panel, showPanel, goBack, returnedFrom, close}}
    >
      <BaseDialog.Root
        {...props}
        actionsRef={actionsRef}
        modal={false}
        disablePointerDismissal
        onOpenChange={(next, details) => {
          // Each opening starts at the default panel.
          if (next) showPanel(defaultPanel);
          setOpen(next);
          onOpenChange?.(next, details);
        }}
      />
    </MenuContext.Provider>
  );
}

export interface TopNavigationMenuTriggerProps extends Omit<BaseDialog.Trigger.Props, 'children'> {
  /** The accessible name, such as "Navigation menu". */
  readonly 'aria-label': string;
}

/** The menu button: the menu icon, which turns into the close icon while the menu is open. */
export function TopNavigationMenuTrigger({
  ref,
  className,
  ...props
}: TopNavigationMenuTriggerProps) {
  return (
    <BaseDialog.Trigger
      {...props}
      ref={ref}
      className={mergeClassName<BaseDialog.Trigger.State>(styles.trigger, className)}
    >
      <MenuIcon className={styles.openIcon} />
      <CloseIcon className={styles.closeIcon} />
    </BaseDialog.Trigger>
  );
}

export interface TopNavigationMenuPopupProps extends Omit<
  BaseDialog.Popup.Props,
  'children' | 'aria-label'
> {
  /** The accessible name, such as "Navigation menu". */
  readonly 'aria-label': string;
  /** Where the menu renders; the document body by default. */
  readonly container?: BaseDialog.Portal.Props['container'];
  readonly children?: ReactNode;
}

/**
 * The open menu: it fills the window below the top navigation (`size.topNavigation`) and holds
 * the panels, which share its space and slide sideways.
 */
export function TopNavigationMenuPopup({
  ref,
  container,
  className,
  ...props
}: TopNavigationMenuPopupProps) {
  return (
    <BaseDialog.Portal container={container}>
      <BaseDialog.Popup
        {...props}
        ref={ref}
        className={mergeClassName<BaseDialog.Popup.State>(styles.popup, className)}
      />
    </BaseDialog.Portal>
  );
}

export interface TopNavigationMenuPanelProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
  /** Identifies the panel for `MenuPanelTrigger`s and the menu's `defaultPanel`. */
  readonly panel: string;
  /** The panel this one is nested in; a nested panel starts with a back button. */
  readonly parent?: string;
  /** The back button's label, such as "Main menu". */
  readonly backLabel?: string;
}

/** A panel of items. One level of nesting. */
export function TopNavigationMenuPanel({
  ref,
  panel,
  parent,
  backLabel,
  className,
  children,
  ...props
}: TopNavigationMenuPanelProps) {
  const menu = useMenu('MenuPanel');
  const backRef = useRef<HTMLButtonElement>(null);
  const current = menu.panel === panel;
  // With one level of nesting, other nested panels wait at the end and top-level panels at the
  // start, where a nested panel's parent slides out to.
  const position = current ? 'current' : parent ? 'after' : 'before';

  // A nested panel that slides in takes focus on its back button; returning to a panel puts focus
  // on the item that opened the nested one. Neither scrolls the menu while the panel is outside.
  useEffect(() => {
    if (!current || !menu.open) return;
    if (parent && !menu.returnedFrom) backRef.current?.focus({preventScroll: true});
    if (menu.returnedFrom) {
      document
        .getElementById(panelId(menu.id, panel))
        ?.querySelector<HTMLElement>(`[aria-controls="${panelId(menu.id, menu.returnedFrom)}"]`)
        ?.focus({preventScroll: true});
    }
  }, [current, parent, panel, menu.open, menu.returnedFrom, menu.id]);

  return (
    <div
      {...props}
      ref={ref}
      id={panelId(menu.id, panel)}
      data-position={position}
      inert={!current}
      className={classes(styles.panel, className)}
    >
      {parent ? (
        <button
          ref={backRef}
          type="button"
          aria-controls={panelId(menu.id, parent)}
          className={styles.back}
          onClick={() => menu.goBack(panel, parent)}
        >
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

export interface TopNavigationMenuListProps extends HTMLAttributes<HTMLUListElement> {
  readonly ref?: Ref<HTMLUListElement> | undefined;
}

export function TopNavigationMenuList({ref, className, ...props}: TopNavigationMenuListProps) {
  return <ul {...props} ref={ref} className={classes(styles.list, className)} />;
}

export interface TopNavigationMenuItemProps extends HTMLAttributes<HTMLLIElement> {
  readonly ref?: Ref<HTMLLIElement> | undefined;
}

export function TopNavigationMenuItem({ref, className, ...props}: TopNavigationMenuItemProps) {
  return <li {...props} ref={ref} className={classes(styles.item, className)} />;
}

export interface TopNavigationMenuLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly ref?: Ref<HTMLAnchorElement> | undefined;
  /** Marks the current page and sets `aria-current="page"`. */
  readonly active?: boolean;
}

/** A link in the menu. Choosing it closes the menu. */
export function TopNavigationMenuLink({
  ref,
  active = false,
  href,
  children,
  className,
  onClick,
  ...props
}: TopNavigationMenuLinkProps) {
  const menu = useMenu('MenuLink');
  return (
    <a
      {...props}
      ref={ref}
      // Explicit, so the accessibility lint sees a link rather than a static element with a click
      // handler.
      href={href}
      aria-current={active ? 'page' : props['aria-current']}
      data-active={active ? '' : undefined}
      className={classes(styles.link, className)}
      onClick={(event) => {
        onClick?.(event);
        menu.close();
      }}
    >
      <span className={styles.label}>{children}</span>
    </a>
  );
}

export interface TopNavigationMenuPanelTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly ref?: Ref<HTMLButtonElement> | undefined;
  /** The nested panel this item opens. */
  readonly panel: string;
  /** Marks the item as the section with the current page. */
  readonly active?: boolean;
}

/** An item that slides to a nested panel, marked with a chevron. */
export function TopNavigationMenuPanelTrigger({
  ref,
  panel,
  active = false,
  className,
  children,
  onClick,
  ...props
}: TopNavigationMenuPanelTriggerProps) {
  const menu = useMenu('MenuPanelTrigger');
  return (
    <button
      type="button"
      {...props}
      ref={ref}
      aria-controls={panelId(menu.id, panel)}
      aria-current={active ? 'true' : undefined}
      data-active={active ? '' : undefined}
      className={classes(styles.link, className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) menu.showPanel(panel);
      }}
    >
      <span className={styles.label}>{children}</span>
      <span className={styles.icon} aria-hidden="true">
        <KeyboardArrowRightIcon />
      </span>
    </button>
  );
}

export type TopNavigationMenuCollapsibleProps = BaseCollapsible.Root.Props;

/**
 * A section of links in a panel that opens and closes in place. Put a `MenuCollapsibleTrigger`
 * and a `MenuCollapsiblePanel` with a `MenuList` inside, in a `MenuItem`.
 */
export function TopNavigationMenuCollapsible({
  ref,
  className,
  ...props
}: TopNavigationMenuCollapsibleProps) {
  return (
    <BaseCollapsible.Root
      {...props}
      ref={ref}
      className={mergeClassName<BaseCollapsible.Root.State>(styles.collapsible, className)}
    />
  );
}

export type TopNavigationMenuCollapsibleTriggerProps = BaseCollapsible.Trigger.Props;

/** The section's title, styled like a menu item with a chevron at the end. */
export function TopNavigationMenuCollapsibleTrigger({
  ref,
  children,
  className,
  ...props
}: TopNavigationMenuCollapsibleTriggerProps) {
  return (
    <BaseCollapsible.Trigger
      {...props}
      ref={ref}
      className={mergeClassName<BaseCollapsible.Trigger.State>(
        classes(styles.link, styles.collapsibleTrigger),
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

export type TopNavigationMenuCollapsiblePanelProps = BaseCollapsible.Panel.Props;

/**
 * The section's links. It grows and shrinks to its measured height. Closed panels stay in the
 * document by default (`keepMounted`), so their links are part of the page's HTML.
 */
export function TopNavigationMenuCollapsiblePanel({
  ref,
  keepMounted = true,
  className,
  ...props
}: TopNavigationMenuCollapsiblePanelProps) {
  return (
    <BaseCollapsible.Panel
      {...props}
      ref={ref}
      keepMounted={keepMounted}
      className={mergeClassName<BaseCollapsible.Panel.State>(styles.collapsiblePanel, className)}
    />
  );
}

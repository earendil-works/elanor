import {
  CloseIcon,
  KeyboardArrowLeftIcon,
  KeyboardArrowRightIcon,
  MenuIcon,
} from '@earendil-works/elanor-icons-react';
import {
  createContext,
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

import {classes} from '../utils/class-names.ts';

import styles from './top-navigation-menu.module.css';

interface MenuContextValue {
  readonly id: string;
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly panel: string;
  readonly showPanel: (panel: string) => void;
}

const MenuContext = /* @__PURE__ */ createContext<MenuContextValue | null>(null);

function useMenu(part: string): MenuContextValue {
  const menu = useContext(MenuContext);
  if (!menu) throw new Error(`TopNavigationMenu.${part} must be inside TopNavigationMenu.Root.`);
  return menu;
}

function panelId(menuId: string, panel: string): string {
  return `${menuId}-${panel}`;
}

export interface TopNavigationMenuRootProps {
  /** The panel shown each time the menu opens. */
  readonly defaultPanel: string;
  readonly children?: ReactNode;
}

/**
 * The top navigation's menu for narrow screens. Put a `Trigger` in the bar and a `Popup` with
 * `Panel`s anywhere inside Root; Root renders no element.
 */
export function TopNavigationMenuRoot({defaultPanel, children}: TopNavigationMenuRootProps) {
  const id = useId();
  const [open, setOpenState] = useState(false);
  const [panel, setPanel] = useState(defaultPanel);
  function setOpen(next: boolean): void {
    // Each opening starts at the default panel.
    if (next) setPanel(defaultPanel);
    setOpenState(next);
  }

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') setOpenState(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <MenuContext.Provider value={{id, open, setOpen, panel, showPanel: setPanel}}>
      {children}
    </MenuContext.Provider>
  );
}

export interface TopNavigationMenuTriggerProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  readonly ref?: Ref<HTMLButtonElement> | undefined;
  /** The accessible name, such as "Navigation menu". */
  readonly 'aria-label': string;
}

/** The menu button: the menu icon, which turns into the close icon while the menu is open. */
export function TopNavigationMenuTrigger({
  ref,
  className,
  onClick,
  ...props
}: TopNavigationMenuTriggerProps) {
  const menu = useMenu('Trigger');
  return (
    <button
      type="button"
      {...props}
      ref={ref}
      aria-expanded={menu.open}
      aria-controls={`${menu.id}-popup`}
      data-popup-open={menu.open ? '' : undefined}
      className={classes(styles.trigger, className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) menu.setOpen(!menu.open);
      }}
    >
      {menu.open ? <CloseIcon aria-hidden="true" /> : <MenuIcon aria-hidden="true" />}
    </button>
  );
}

export interface TopNavigationMenuPopupProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * The open menu: it fills the window below the top navigation (`size.topNavigation`) and holds
 * the panels, which share its space and slide sideways.
 */
export function TopNavigationMenuPopup({ref, className, ...props}: TopNavigationMenuPopupProps) {
  const menu = useMenu('Popup');
  return (
    <div
      {...props}
      ref={ref}
      id={`${menu.id}-popup`}
      hidden={!menu.open}
      className={classes(styles.popup, className)}
    />
  );
}

export interface TopNavigationMenuPanelProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
  /** Identifies the panel for `PanelTrigger`s and Root's `defaultPanel`. */
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
  const menu = useMenu('Panel');
  const backRef = useRef<HTMLButtonElement>(null);
  const current = menu.panel === panel;
  // With one level of nesting, other nested panels wait at the end and top-level panels at the
  // start, where a nested panel's parent slides out to.
  const position = current ? 'current' : parent ? 'after' : 'before';

  // A nested panel that slides in takes focus on its back button, without scrolling the menu to
  // it while it is still outside.
  useEffect(() => {
    if (current && parent && menu.open) backRef.current?.focus({preventScroll: true});
  }, [current, parent, menu.open]);

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
          onClick={() => menu.showPanel(parent)}
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

export function TopNavigationMenuLink({
  ref,
  active = false,
  href,
  children,
  className,
  ...props
}: TopNavigationMenuLinkProps) {
  return (
    <a
      {...props}
      ref={ref}
      href={href}
      aria-current={active ? 'page' : props['aria-current']}
      data-active={active ? '' : undefined}
      className={classes(styles.link, className)}
    >
      <span className={styles.label}>{children}</span>
    </a>
  );
}

export interface TopNavigationMenuPanelTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly ref?: Ref<HTMLButtonElement> | undefined;
  /** The nested panel this item opens. */
  readonly panel: string;
  /** Marks the item as the current section, like an active link. */
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
  const menu = useMenu('PanelTrigger');
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

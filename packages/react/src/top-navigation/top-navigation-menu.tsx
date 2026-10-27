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
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import {flushSync} from 'react-dom';

import {classes, mergeClassName} from '../utils/class-names.ts';

import styles from './top-navigation-menu.module.css';

interface MenuActions {
  readonly close: () => void;
  /** Slides to a nested panel and focuses its back button; going back focuses `opener` again. */
  readonly showPanel: (panel: string, opener: HTMLElement) => void;
  /**
   * Slides back from `from` to `parent` and focuses the opener, or, when the menu opened on
   * `from`, the item that leads to it.
   */
  readonly goBack: (parent: string, from: string) => void;
  /** Records the item that leads to `panel`. */
  readonly registerPanelTrigger: (panel: string, element: HTMLElement | null) => void;
  /** Attached to the current panel's back button. */
  readonly backButtonRef: RefObject<HTMLButtonElement | null>;
}

/** The current panel. */
const MenuPanelContext = /* @__PURE__ */ createContext<string | null>(null);
const MenuActionsContext = /* @__PURE__ */ createContext<MenuActions | null>(null);

function useMenuPanel(part: string): string {
  const panel = useContext(MenuPanelContext);
  if (panel === null) throw new Error(`TopNavigation.${part} must be inside TopNavigation.Menu.`);
  return panel;
}

function useMenuActions(part: string): MenuActions {
  const actions = useContext(MenuActionsContext);
  if (!actions) throw new Error(`TopNavigation.${part} must be inside TopNavigation.Menu.`);
  return actions;
}

export interface TopNavigationMenuProps extends Omit<
  BaseDialog.Root.Props,
  'modal' | 'disablePointerDismissal'
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
export function TopNavigationMenu({
  defaultPanel,
  actionsRef,
  onOpenChangeComplete,
  ...props
}: TopNavigationMenuProps) {
  const ownActionsRef = useRef<BaseDialog.Root.Actions>(null);
  const dialogActionsRef = actionsRef ?? ownActionsRef;
  const openerRef = useRef<HTMLElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const panelTriggersRef = useRef(new Map<string, HTMLElement>());
  // `null` until the reader slides, so each opening shows the current `defaultPanel`.
  const [panel, setPanel] = useState<string | null>(null);

  // Slides render synchronously, so the panel shown next is no longer inert when focus moves.
  const actions = useMemo<MenuActions>(
    () => ({
      close: () => dialogActionsRef.current?.close(),
      showPanel: (next, opener) => {
        openerRef.current = opener;
        flushSync(() => setPanel(next));
        backButtonRef.current?.focus({preventScroll: true});
      },
      goBack: (parent, from) => {
        flushSync(() => setPanel(parent));
        (openerRef.current ?? panelTriggersRef.current.get(from))?.focus({preventScroll: true});
      },
      registerPanelTrigger: (triggerPanel, element) => {
        if (element) panelTriggersRef.current.set(triggerPanel, element);
        else panelTriggersRef.current.delete(triggerPanel);
      },
      backButtonRef,
    }),
    [dialogActionsRef],
  );

  return (
    <MenuActionsContext.Provider value={actions}>
      <MenuPanelContext.Provider value={panel ?? defaultPanel}>
        <BaseDialog.Root
          {...props}
          actionsRef={dialogActionsRef}
          modal={false}
          disablePointerDismissal
          onOpenChangeComplete={(open) => {
            // Each opening starts at the default panel.
            if (!open) {
              setPanel(null);
              openerRef.current = null;
            }
            onOpenChangeComplete?.(open);
          }}
        />
      </MenuPanelContext.Provider>
    </MenuActionsContext.Provider>
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
  /** A `nav` with the panels, named like the navigation it replaces. */
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

type TopNavigationMenuPanelNesting =
  | {readonly parent?: never; readonly backLabel?: never}
  | {
      /** The panel this one is nested in; a nested panel starts with a back button. */
      readonly parent: string;
      /** The back button's label, such as "Main menu". */
      readonly backLabel: string;
    };

export type TopNavigationMenuPanelProps = HTMLAttributes<HTMLDivElement> &
  TopNavigationMenuPanelNesting & {
    readonly ref?: Ref<HTMLDivElement> | undefined;
    /** Identifies the panel for `MenuPanelTrigger`s and the menu's `defaultPanel`. */
    readonly panel: string;
  };

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
  const currentPanel = useMenuPanel('MenuPanel');
  const actions = useMenuActions('MenuPanel');
  const current = currentPanel === panel;
  // With one level of nesting, other nested panels wait at the end and top-level panels at the
  // start, where a nested panel's parent slides out to.
  const position = current ? 'current' : parent ? 'after' : 'before';

  return (
    <div
      {...props}
      ref={ref}
      data-position={position}
      inert={!current}
      className={classes(styles.panel, className)}
    >
      {parent ? (
        <button
          ref={current ? actions.backButtonRef : undefined}
          type="button"
          className={styles.back}
          onClick={() => actions.goBack(parent, panel)}
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

/** The id of the current group's label. */
const MenuGroupContext = /* @__PURE__ */ createContext<string | undefined>(undefined);

export interface TopNavigationMenuGroupProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/** Groups lists in a panel under a `MenuGroupLabel`, which names the group. */
export function TopNavigationMenuGroup({ref, className, ...props}: TopNavigationMenuGroupProps) {
  const labelId = useId();
  return (
    <MenuGroupContext.Provider value={labelId}>
      <div
        role="group"
        aria-labelledby={labelId}
        {...props}
        ref={ref}
        className={classes(styles.group, className)}
      />
    </MenuGroupContext.Provider>
  );
}

export interface TopNavigationMenuGroupLabelProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'id'
> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function TopNavigationMenuGroupLabel({
  ref,
  className,
  ...props
}: TopNavigationMenuGroupLabelProps) {
  const labelId = useContext(MenuGroupContext);
  return (
    <div {...props} ref={ref} id={labelId} className={classes(styles.groupLabel, className)} />
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
  /**
   * Marks the current page with `aria-current="page"`. Router links that set `aria-current`
   * themselves need no `active`.
   */
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
  const {close} = useMenuActions('MenuLink');
  return (
    <a
      {...props}
      ref={ref}
      // Explicit, so the accessibility lint sees a link rather than a static element with a click
      // handler.
      href={href}
      aria-current={active ? 'page' : props['aria-current']}
      className={classes(styles.link, className)}
      onClick={(event) => {
        onClick?.(event);
        close();
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
  /** Marks the item as the section with the current page (`aria-current="true"`). */
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
  const {showPanel, registerPanelTrigger} = useMenuActions('MenuPanelTrigger');
  return (
    <button
      type="button"
      {...props}
      ref={(element) => {
        registerPanelTrigger(panel, element);
        if (typeof ref === 'function') return ref(element);
        if (ref) ref.current = element;
        return undefined;
      }}
      aria-current={active ? 'true' : props['aria-current']}
      className={classes(styles.link, className)}
      onClick={(event) => {
        onClick?.(event);
        showPanel(panel, event.currentTarget);
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

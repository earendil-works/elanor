import {Popover as BasePopover} from '@base-ui/react/popover';
import {KeyboardArrowDownIcon} from '@earendil-works/elanor-icons-react';
import {
  createContext,
  useContext,
  useState,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';

import {classes, mergeClassName} from '../utils/class-names.ts';

import styles from './table-of-contents-menu.module.css';

const CloseContext = /* @__PURE__ */ createContext<() => void>(() => {});

export interface TableOfContentsMenuRootProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * A table of contents collapsed into a sticky bar with a dropdown, for layouts without room for
 * the full list. Put a `Trigger` and a `Popup` inside. The bar sticks to the top of its scroll
 * container; set `inset-block-start` to stick below a header.
 */
export function TableOfContentsMenuRoot({
  ref,
  className,
  children,
  ...props
}: TableOfContentsMenuRootProps) {
  const [open, setOpen] = useState(false);
  return (
    <div {...props} ref={ref} className={classes(styles.root, className)}>
      <BasePopover.Root open={open} onOpenChange={setOpen}>
        <CloseContext.Provider value={() => setOpen(false)}>{children}</CloseContext.Provider>
      </BasePopover.Root>
    </div>
  );
}

export interface TableOfContentsMenuTriggerProps extends Omit<
  BasePopover.Trigger.Props,
  'children'
> {
  /** The current section, shown in the trigger. */
  readonly children?: ReactNode;
  /** Prefix for assistive technology, read before the current section. */
  readonly label?: string;
}

/** Shows the current section and opens the list. */
export function TableOfContentsMenuTrigger({
  ref,
  label = 'Table of contents',
  children,
  className,
  ...props
}: TableOfContentsMenuTriggerProps) {
  return (
    <BasePopover.Trigger
      {...props}
      ref={ref}
      className={mergeClassName<BasePopover.Trigger.State>(styles.trigger, className)}
    >
      <span className={styles.visuallyHidden}>{label}: </span>
      <span className={styles.value}>{children}</span>
      <span className={styles.icon} aria-hidden="true">
        <KeyboardArrowDownIcon />
      </span>
    </BasePopover.Trigger>
  );
}

export interface TableOfContentsMenuPopupProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement> | undefined;
  /** Accessible name of the list's `nav`. */
  readonly label?: string;
}

/** The sections, in a `nav` under the trigger. Put a `List` of `Item`s inside. */
export function TableOfContentsMenuPopup({
  ref,
  label = 'Table of contents',
  children,
  className,
  ...props
}: TableOfContentsMenuPopupProps) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner align="start" className={styles.positioner}>
        <BasePopover.Popup className={styles.popup}>
          <nav {...props} ref={ref} aria-label={label} className={classes(styles.nav, className)}>
            {children}
          </nav>
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

export interface TableOfContentsMenuListProps extends HTMLAttributes<HTMLOListElement> {
  readonly ref?: Ref<HTMLOListElement> | undefined;
}

/** The ordered list of entries, at the top and nested inside an `Item` after its `Link`. */
export function TableOfContentsMenuList({ref, className, ...props}: TableOfContentsMenuListProps) {
  return <ol {...props} ref={ref} className={classes(styles.list, className)} />;
}

export interface TableOfContentsMenuItemProps extends HTMLAttributes<HTMLLIElement> {
  readonly ref?: Ref<HTMLLIElement> | undefined;
}

export function TableOfContentsMenuItem({ref, className, ...props}: TableOfContentsMenuItemProps) {
  return <li {...props} ref={ref} className={classes(styles.item, className)} />;
}

export interface TableOfContentsMenuLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly ref?: Ref<HTMLAnchorElement> | undefined;
  /** Marks the section in view and sets `aria-current="location"`. */
  readonly active?: boolean;
}

/** A link to a section. Choosing it closes the list. */
export function TableOfContentsMenuLink({
  ref,
  active = false,
  href,
  children,
  className,
  onClick,
  ...props
}: TableOfContentsMenuLinkProps) {
  const close = useContext(CloseContext);
  return (
    <a
      {...props}
      ref={ref}
      href={href}
      aria-current={active ? 'location' : props['aria-current']}
      data-active={active ? '' : undefined}
      className={classes(styles.link, className)}
      onClick={(event) => {
        onClick?.(event);
        close();
      }}
    >
      {children}
    </a>
  );
}

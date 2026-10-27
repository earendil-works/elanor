import {KeyboardArrowDownIcon} from '@earendil-works/elanor-icons-react';
import type {HTMLAttributes, ReactNode, Ref} from 'react';

import * as Popover from '../popover/index.ts';
import type {PopoverStaticTriggerProps} from '../popover/popover-static.tsx';
import {classes} from '../utils/class-names.ts';
import {TableOfContents, type TableOfContentsRootProps} from './table-of-contents.tsx';

import styles from './table-of-contents.module.css';

export type TableOfContentsStaticRootProps = TableOfContentsRootProps;

/**
 * A table of contents for pages without React in the browser; `createTableOfContents` marks the
 * section in view.
 */
export function TableOfContentsStaticRoot(props: TableOfContentsStaticRootProps) {
  return <TableOfContents {...props} data-elanor="table-of-contents" />;
}

export interface TableOfContentsStaticMenuProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * The table of contents as a menu in a sticky bar, for pages without React in the browser;
 * `createTableOfContentsMenu`, `createPopover`, and `createTableOfContents` make it work.
 */
export function TableOfContentsStaticMenu({
  ref,
  className,
  children,
  ...props
}: TableOfContentsStaticMenuProps) {
  return (
    <div
      {...props}
      ref={ref}
      className={classes(styles.menu, className)}
      data-elanor="table-of-contents-menu"
    >
      <Popover.StaticRoot>{children}</Popover.StaticRoot>
    </div>
  );
}

export interface TableOfContentsStaticMenuTriggerProps extends Omit<
  PopoverStaticTriggerProps,
  'children'
> {
  /** The current section, shown in the trigger. */
  readonly children?: ReactNode;
  /** Read before the current section by assistive technology. */
  readonly label?: string;
}

export function TableOfContentsStaticMenuTrigger({
  label = 'Table of contents',
  children,
  className,
  ...props
}: TableOfContentsStaticMenuTriggerProps) {
  return (
    <Popover.StaticTrigger {...props} className={classes(styles.menuTrigger, className)}>
      <span className={styles.visuallyHidden}>{label}: </span>
      <span className={styles.menuValue} data-elanor-table-of-contents-value="">
        {children}
      </span>
      <span className={styles.menuIcon} aria-hidden="true">
        <KeyboardArrowDownIcon />
      </span>
    </Popover.StaticTrigger>
  );
}

export interface TableOfContentsStaticMenuPopupProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement> | undefined;
  /** Accessible name of the popup and the list's `nav`. */
  readonly label?: string;
}

export function TableOfContentsStaticMenuPopup({
  ref,
  label = 'Table of contents',
  children,
  ...props
}: TableOfContentsStaticMenuPopupProps) {
  return (
    <Popover.StaticPositioner align="start" className={styles.menuPositioner}>
      <div
        role="dialog"
        tabIndex={-1}
        aria-label={label}
        data-closed=""
        className={styles.menuPopup}
      >
        <nav {...props} ref={ref} aria-label={label} data-elanor="table-of-contents">
          {children}
        </nav>
      </div>
    </Popover.StaticPositioner>
  );
}

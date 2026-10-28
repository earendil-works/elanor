import {KeyboardArrowDownIcon} from '@earendil-works/elanor-icons-react';

import type {
  CollapsibleStaticPanelProps,
  CollapsibleStaticRootProps,
  CollapsibleStaticTriggerProps,
} from '../collapsible/collapsible-static.tsx';
import * as Collapsible from '../collapsible/index.ts';
import {classes} from '../utils/class-names.ts';
import {SideNavigationRoot, type SideNavigationRootProps} from './side-navigation.tsx';

import styles from './side-navigation.module.css';

export interface SideNavigationStaticRootProps extends SideNavigationRootProps {
  /**
   * Keeps the navigation's scroll position and its sections' `persist`ed states across pages, in
   * session storage under this key.
   */
  readonly persist?: string;
  /** The page's own behaviors for this element, attached after the component's. */
  readonly 'data-elanor'?: string;
}

/**
 * A side navigation for pages without React in the browser; `createSideNavigation` restores it
 * and scrolls the current page into view.
 */
export function SideNavigationStaticRoot({
  persist,
  'data-elanor': pageBehaviors,
  ...props
}: SideNavigationStaticRootProps) {
  return (
    <SideNavigationRoot
      {...props}
      data-elanor={pageBehaviors ? `side-navigation ${pageBehaviors}` : 'side-navigation'}
      data-elanor-persist={persist}
    />
  );
}

export interface SideNavigationStaticCollapsibleProps extends CollapsibleStaticRootProps {
  /** Remembers whether the section is open under this name, with the root's `persist`. */
  readonly persist?: string;
}

export function SideNavigationStaticCollapsible({
  persist,
  className,
  ...props
}: SideNavigationStaticCollapsibleProps) {
  return (
    <Collapsible.StaticRoot
      {...props}
      data-elanor-section={persist}
      className={classes(styles.collapsible, className)}
    />
  );
}

export type SideNavigationStaticCollapsibleTriggerProps = CollapsibleStaticTriggerProps;

export function SideNavigationStaticCollapsibleTrigger({
  className,
  children,
  ...props
}: SideNavigationStaticCollapsibleTriggerProps) {
  return (
    <Collapsible.StaticTrigger
      {...props}
      className={classes(styles.link, styles.trigger, className)}
    >
      <span className={styles.label}>{children}</span>
      <span className={classes(styles.icon, styles.chevron)} aria-hidden="true">
        <KeyboardArrowDownIcon />
      </span>
    </Collapsible.StaticTrigger>
  );
}

export type SideNavigationStaticCollapsiblePanelProps = CollapsibleStaticPanelProps;

export function SideNavigationStaticCollapsiblePanel({
  className,
  ...props
}: SideNavigationStaticCollapsiblePanelProps) {
  return <Collapsible.StaticPanel {...props} className={classes(styles.panel, className)} />;
}

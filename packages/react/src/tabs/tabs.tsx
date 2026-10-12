import {Tabs as BaseTabs} from '@base-ui/react/tabs';
import type {ComponentPropsWithRef} from 'react';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './tabs.module.css';

export type {
  TabsRootState,
  TabsRootChangeEventReason,
  TabsRootChangeEventDetails,
  TabsIndicatorState,
  TabsTabState,
  TabsPanelState,
  TabsListState,
} from '@base-ui/react/tabs';

export interface TabsRootProps extends Omit<BaseTabs.Root.Props, 'orientation'> {
  readonly orientation?: 'horizontal';
}

export type TabsListProps = BaseTabs.List.Props;
export type TabsTabProps = ComponentPropsWithRef<typeof BaseTabs.Tab>;
export type TabsIndicatorProps = BaseTabs.Indicator.Props;
export type TabsPanelProps = BaseTabs.Panel.Props;

function TabsRoot({ref, ...props}: TabsRootProps) {
  return <BaseTabs.Root {...props} ref={ref} orientation="horizontal" />;
}

export function TabsList({ref, className, ...props}: TabsListProps) {
  return (
    <BaseTabs.List
      {...props}
      ref={ref}
      className={mergeClassName<BaseTabs.List.State>(styles.list, className)}
    />
  );
}

export function TabsTab({ref, className, ...props}: TabsTabProps) {
  return (
    <BaseTabs.Tab
      {...props}
      ref={ref}
      className={mergeClassName<BaseTabs.Tab.State>(styles.tab, className)}
    />
  );
}

export function TabsIndicator({ref, className, ...props}: TabsIndicatorProps) {
  return (
    <BaseTabs.Indicator
      {...props}
      ref={ref}
      className={mergeClassName<BaseTabs.Indicator.State>(styles.indicator, className)}
    />
  );
}

export function TabsPanel({ref, className, ...props}: TabsPanelProps) {
  return (
    <BaseTabs.Panel
      {...props}
      ref={ref}
      className={mergeClassName<BaseTabs.Panel.State>(styles.panel, className)}
    />
  );
}

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Tab: TabsTab,
  Indicator: TabsIndicator,
  Panel: TabsPanel,
} as const;

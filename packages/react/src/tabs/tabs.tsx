import {Tabs as BaseTabs} from '@base-ui/react/tabs';
import {forwardRef} from 'react';
import styles from './tabs.module.css';
import outline from '../utils/outline.module.css';
import {classes, mergeClassName} from '../utils/class-names.ts';

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
export type TabsTabProps = BaseTabs.Tab.Props;
export type TabsIndicatorProps = BaseTabs.Indicator.Props;
export type TabsPanelProps = BaseTabs.Panel.Props;

const TabsRoot = forwardRef<HTMLDivElement, TabsRootProps>(function TabsRoot(props, ref) {
  return <BaseTabs.Root {...props} ref={ref} orientation="horizontal" />;
});

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  function TabsList({className, ...props}, ref) {
    return (
      <BaseTabs.List
        data-outline="line"
        data-outline-edge="block-end"
        {...props}
        ref={ref}
        className={mergeClassName<BaseTabs.List.State>(styles.list, className)}
      />
    );
  },
);

export const TabsTab = forwardRef<HTMLElement, TabsTabProps>(
  function TabsTab({className, ...props}, ref) {
    return (
      <BaseTabs.Tab
        data-outline="box-small"
        data-outline-band="none"
        {...props}
        ref={ref}
        className={mergeClassName<BaseTabs.Tab.State>(classes(styles.tab, outline.outline), className)}
      />
    );
  },
);

export const TabsIndicator = forwardRef<HTMLSpanElement, TabsIndicatorProps>(
  function TabsIndicator({className, ...props}, ref) {
    return (
      <BaseTabs.Indicator
        data-outline="line"
        {...props}
        ref={ref}
        className={mergeClassName<BaseTabs.Indicator.State>(styles.indicator, className)}
      />
    );
  },
);

export const TabsPanel = forwardRef<HTMLDivElement, TabsPanelProps>(
  function TabsPanel({className, ...props}, ref) {
    return (
      <BaseTabs.Panel
        data-outline="box-small"
        data-outline-band="none"
        {...props}
        ref={ref}
        className={mergeClassName<BaseTabs.Panel.State>(classes(styles.panel, outline.outline), className)}
      />
    );
  },
);

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Tab: TabsTab,
  Indicator: TabsIndicator,
  Panel: TabsPanel,
} as const;

import {Tabs as BaseTabs} from '@base-ui/react/tabs';
import {forwardRef} from 'react';
import styles from './tabs.module.css';
import {useBrushVariant} from '../brush-border/use-brush-variant.ts';
import {mergeClassName} from '../utils/class-names.ts';

export type {
  TabsRootState,
  TabsRootProps,
  TabsRootChangeEventReason,
  TabsRootChangeEventDetails,
  TabsIndicatorState,
  TabsIndicatorProps,
  TabsTabState,
  TabsTabProps,
  TabsPanelState,
  TabsPanelProps,
  TabsListState,
  TabsListProps,
} from '@base-ui/react/tabs';

export const TabsList = forwardRef<HTMLDivElement, BaseTabs.List.Props>(
  function TabsList({className, ...props}, ref) {
    return (
      <BaseTabs.List
        data-brush-variant={useBrushVariant()}
        {...props}
        ref={ref}
        className={mergeClassName<BaseTabs.List.State>(styles.list, className)}
      />
    );
  },
);

export const TabsTab = forwardRef<HTMLElement, BaseTabs.Tab.Props>(
  function TabsTab({className, ...props}, ref) {
    return (
      <BaseTabs.Tab
        data-brush-variant={useBrushVariant()}
        {...props}
        ref={ref}
        className={mergeClassName<BaseTabs.Tab.State>(styles.tab, className)}
      />
    );
  },
);

export const TabsIndicator = forwardRef<HTMLSpanElement, BaseTabs.Indicator.Props>(
  function TabsIndicator({className, ...props}, ref) {
    return (
      <BaseTabs.Indicator
        data-brush-variant={useBrushVariant()}
        {...props}
        ref={ref}
        className={mergeClassName<BaseTabs.Indicator.State>(styles.indicator, className)}
      />
    );
  },
);

export const TabsPanel = forwardRef<HTMLDivElement, BaseTabs.Panel.Props>(
  function TabsPanel({className, ...props}, ref) {
    return (
      <BaseTabs.Panel
        {...props}
        ref={ref}
        className={mergeClassName<BaseTabs.Panel.State>(styles.panel, className)}
      />
    );
  },
);

export const Tabs = {
  Root: BaseTabs.Root,
  List: TabsList,
  Tab: TabsTab,
  Indicator: TabsIndicator,
  Panel: TabsPanel,
} as const;

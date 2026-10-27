import type {Collapsible as BaseCollapsible} from '@base-ui/react/collapsible';

export type {
  CollapsibleRootState,
  CollapsibleRootChangeEventReason,
  CollapsibleRootChangeEventDetails,
  CollapsibleTriggerState,
  CollapsiblePanelState,
} from '@base-ui/react/collapsible';

export type CollapsibleRootProps = BaseCollapsible.Root.Props;
export type CollapsibleTriggerProps = BaseCollapsible.Trigger.Props;
export type CollapsiblePanelProps = BaseCollapsible.Panel.Props;

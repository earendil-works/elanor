import {Collapsible as BaseCollapsible} from '@base-ui/react/collapsible';
import {forwardRef} from 'react';
import styles from './progressive-disclosure.module.css';
import {mergeClassName} from './shared.ts';

export type {
  CollapsibleRootState as ProgressiveDisclosureRootState,
  CollapsibleRootProps as ProgressiveDisclosureRootProps,
  CollapsibleRootChangeEventReason as ProgressiveDisclosureRootChangeEventReason,
  CollapsibleRootChangeEventDetails as ProgressiveDisclosureRootChangeEventDetails,
  CollapsibleTriggerState as ProgressiveDisclosureTriggerState,
  CollapsibleTriggerProps as ProgressiveDisclosureTriggerProps,
  CollapsiblePanelState as ProgressiveDisclosurePanelState,
  CollapsiblePanelProps as ProgressiveDisclosurePanelProps,
} from '@base-ui/react/collapsible';

export const ProgressiveDisclosureRoot = forwardRef<HTMLDivElement, BaseCollapsible.Root.Props>(
  function ProgressiveDisclosureRoot({className, ...props}, ref) {
    return (
      <BaseCollapsible.Root
        {...props}
        ref={ref}
        className={mergeClassName<BaseCollapsible.Root.State>(styles.root, className)}
      />
    );
  },
);

export const ProgressiveDisclosurePanel = forwardRef<HTMLDivElement, BaseCollapsible.Panel.Props>(
  function ProgressiveDisclosurePanel({className, ...props}, ref) {
    return (
      <BaseCollapsible.Panel
        {...props}
        ref={ref}
        className={mergeClassName<BaseCollapsible.Panel.State>(styles.panel, className)}
      />
    );
  },
);

export const ProgressiveDisclosure = {
  Root: ProgressiveDisclosureRoot,
  Trigger: BaseCollapsible.Trigger,
  Panel: ProgressiveDisclosurePanel,
} as const;

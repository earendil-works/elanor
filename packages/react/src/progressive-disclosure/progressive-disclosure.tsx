import {Collapsible as BaseCollapsible} from '@base-ui/react/collapsible';
import {forwardRef} from 'react';
import styles from './progressive-disclosure.module.css';
import {mergeClassName} from '../utils/class-names.ts';

export type {
  CollapsibleRootState as ProgressiveDisclosureRootState,
  CollapsibleRootChangeEventReason as ProgressiveDisclosureRootChangeEventReason,
  CollapsibleRootChangeEventDetails as ProgressiveDisclosureRootChangeEventDetails,
  CollapsibleTriggerState as ProgressiveDisclosureTriggerState,
  CollapsibleTriggerProps as ProgressiveDisclosureTriggerProps,
  CollapsiblePanelState as ProgressiveDisclosurePanelState,
} from '@base-ui/react/collapsible';

export type ProgressiveDisclosureRootProps = BaseCollapsible.Root.Props;
export type ProgressiveDisclosurePanelProps = BaseCollapsible.Panel.Props;

export const ProgressiveDisclosureRoot = forwardRef<HTMLDivElement, ProgressiveDisclosureRootProps>(
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

export const ProgressiveDisclosurePanel = forwardRef<HTMLDivElement, ProgressiveDisclosurePanelProps>(
  function ProgressiveDisclosurePanel({className, children, ...props}, ref) {
    return (
      <BaseCollapsible.Panel
        {...props}
        ref={ref}
        className={mergeClassName<BaseCollapsible.Panel.State>(styles.panel, className)}
      >
        <span className={styles.rule} data-stroke="line-vertical" aria-hidden="true" />
        {children}
      </BaseCollapsible.Panel>
    );
  },
);

export const ProgressiveDisclosure = {
  Root: ProgressiveDisclosureRoot,
  Trigger: BaseCollapsible.Trigger,
  Panel: ProgressiveDisclosurePanel,
} as const;

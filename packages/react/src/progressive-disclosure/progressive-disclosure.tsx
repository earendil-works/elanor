import {Collapsible as BaseCollapsible} from '@base-ui/react/collapsible';
import {useRender} from '@base-ui/react/use-render';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './progressive-disclosure.module.css';

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

export function ProgressiveDisclosureRoot({
  ref,
  className,
  ...props
}: ProgressiveDisclosureRootProps) {
  return (
    <BaseCollapsible.Root
      {...props}
      ref={ref}
      className={mergeClassName<BaseCollapsible.Root.State>(styles.root, className)}
    />
  );
}

function PanelElement({
  elementProps,
  render,
  state,
}: {
  elementProps: React.ComponentPropsWithRef<'div'>;
  render: ProgressiveDisclosurePanelProps['render'];
  state: BaseCollapsible.Panel.State;
}) {
  const style = elementProps.style as React.CSSProperties & {
    '--collapsible-panel-height'?: string;
  };
  const height = style['--collapsible-panel-height'];

  return useRender({
    render: typeof render === 'function' ? (props) => render(props, state) : render,
    props: {
      ...elementProps,
      'data-height-transition': height !== undefined && height !== 'auto' ? '' : undefined,
    },
  });
}

export function ProgressiveDisclosurePanel({
  ref,
  className,
  render,
  ...props
}: ProgressiveDisclosurePanelProps) {
  return (
    <BaseCollapsible.Panel
      {...props}
      render={(elementProps, state) => (
        <PanelElement elementProps={elementProps} render={render} state={state} />
      )}
      ref={ref}
      className={mergeClassName<BaseCollapsible.Panel.State>(styles.panel, className)}
    />
  );
}

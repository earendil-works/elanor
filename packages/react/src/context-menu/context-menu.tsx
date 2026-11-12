import {ContextMenu as BaseContextMenu} from '@base-ui/react/context-menu';
import type {BaseUIEvent} from '@base-ui/react/types';
import type {SyntheticEvent} from 'react';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './context-menu.module.css';

export type {
  ContextMenuRootProps,
  ContextMenuRootActions,
  ContextMenuRootChangeEventReason,
  ContextMenuRootChangeEventDetails,
  ContextMenuTriggerState,
  ContextMenuPortalProps,
  ContextMenuPositionerProps,
  ContextMenuPositionerState,
} from '@base-ui/react/context-menu';

export type ContextMenuTriggerProps = BaseContextMenu.Trigger.Props;

// React bubbles events from portaled descendants, such as the popup of a menu inside the trigger,
// through the trigger. Only presses on the trigger's own elements open the context menu.
function ignorePortaledTarget(event: BaseUIEvent<SyntheticEvent<HTMLDivElement>>) {
  if (!(event.target instanceof Node && event.currentTarget.contains(event.target))) {
    event.preventBaseUIHandler();
  }
}

/**
 * The area that opens the menu on right click or long press. On touch screens, a long press
 * opens the menu instead of selecting the area's text.
 */
export function ContextMenuTrigger({
  ref,
  className,
  onContextMenu,
  onTouchStart,
  ...props
}: ContextMenuTriggerProps) {
  return (
    <BaseContextMenu.Trigger
      {...props}
      ref={ref}
      className={mergeClassName<BaseContextMenu.Trigger.State>(styles.trigger, className)}
      onContextMenu={(event) => {
        onContextMenu?.(event);
        ignorePortaledTarget(event);
      }}
      onTouchStart={(event) => {
        onTouchStart?.(event);
        ignorePortaledTarget(event);
      }}
    />
  );
}

import {Tooltip} from '@base-ui/react/tooltip';
import type {ReactElement, ReactNode} from 'react';
import styles from './compact-tooltip.module.css';

// Private: keep the trigger mounted when enabling/disabling the visual hint.
export function CompactTooltip({children, label, enabled = true}: {
  readonly children: ReactElement;
  readonly label: ReactNode;
  readonly enabled?: boolean;
}) {
  return (
    <Tooltip.Root disabled={!enabled}>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner side="inline-end">
          <Tooltip.Popup className={styles.popup}>{label}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

import type {ReactElement, ReactNode} from 'react';

import * as Tooltip from '../tooltip/index.ts';

// Private: keep the trigger mounted when enabling/disabling the visual hint.
export function CompactTooltip({
  children,
  label,
  disabled = false,
}: {
  readonly children: ReactElement;
  readonly label: ReactNode;
  readonly disabled?: boolean;
}) {
  return (
    <Tooltip.Root disabled={disabled}>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner side="inline-end">
          <Tooltip.Popup>{label}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

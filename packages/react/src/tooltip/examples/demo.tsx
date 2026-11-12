import {LinkIcon} from '@earendil-works/elanor-icons-react';
import {IconButton, Tooltip} from '@earendil-works/elanor-react';

export default function TooltipDemo() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={<IconButton aria-label="Copy link" />}>
        <LinkIcon />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup>Copy link</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

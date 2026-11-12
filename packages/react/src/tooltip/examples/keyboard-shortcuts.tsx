import {FormatBoldIcon} from '@earendil-works/elanor-icons-react';
import {IconButton, KeyboardKey, KeyboardShortcut, Tooltip} from '@earendil-works/elanor-react';

export default function TooltipKeyboardShortcuts() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={<IconButton aria-label="Bold" aria-keyshortcuts="Control+B" />}>
        <FormatBoldIcon />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup>
            Bold{' '}
            <KeyboardShortcut>
              <KeyboardKey>Ctrl</KeyboardKey>+<KeyboardKey>B</KeyboardKey>
            </KeyboardShortcut>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

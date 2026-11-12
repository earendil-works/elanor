import {
  FormatBoldIcon,
  FormatItalicIcon,
  FormatUnderlinedIcon,
} from '@earendil-works/elanor-icons-react';
import {IconButton, Stack, Tooltip} from '@earendil-works/elanor-react';
import type {ReactNode} from 'react';

function FormatButton({label, icon}: {label: string; icon: ReactNode}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={<IconButton aria-label={label} />}>{icon}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup>{label}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export default function TooltipGroups() {
  return (
    <Tooltip.Provider>
      <Stack direction="row" gap="xSmall">
        <FormatButton label="Bold" icon={<FormatBoldIcon />} />
        <FormatButton label="Italic" icon={<FormatItalicIcon />} />
        <FormatButton label="Underline" icon={<FormatUnderlinedIcon />} />
      </Stack>
    </Tooltip.Provider>
  );
}

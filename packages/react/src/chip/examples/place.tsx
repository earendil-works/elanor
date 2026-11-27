import {
  ContentPasteIcon,
  DnsIcon,
  LaptopMacIcon,
  UploadIcon,
} from '@earendil-works/elanor-icons-react';
import {Chip, Stack} from '@earendil-works/elanor-react';
import type {ReactNode} from 'react';

const items: ReadonlyArray<{id: string; icon: ReactNode; place: string; name: string}> = [
  {id: 'build', icon: <DnsIcon />, place: 'devbox', name: 'build.mjs'},
  {id: 'screen', icon: <UploadIcon />, place: 'Upload', name: 'screen.png'},
  {id: 'notes', icon: <LaptopMacIcon />, place: 'MacBook', name: 'notes.md'},
  // A folder's name ends in a slash.
  {id: 'src', icon: <DnsIcon />, place: 'devbox', name: 'src/'},
  // A long pasted text: its name says how long it is.
  {id: 'pasted', icon: <ContentPasteIcon />, place: 'Pasted', name: '142 lines'},
];

export default function ChipPlace() {
  return (
    <Stack direction="row" align="center" gap="xSmall" wrap="wrap">
      {items.map(({id, icon, place, name}) => (
        <Chip.Root key={id} variant="soft" density="compact">
          <Chip.Icon>{icon}</Chip.Icon>
          <Chip.Label>{place}</Chip.Label>
          <Chip.Separator />
          <Chip.Label>{name}</Chip.Label>
        </Chip.Root>
      ))}
    </Stack>
  );
}

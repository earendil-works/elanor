import {DnsIcon, LaptopMacIcon, UploadIcon} from '@earendil-works/elanor-icons-react';
import {Chip, Text} from '@earendil-works/elanor-react';
import type {ReactNode} from 'react';

import styles from './chip.module.css';

function FileChip({icon, place, name}: {icon: ReactNode; place: string; name: string}) {
  return (
    <Chip.Root variant="soft" density="compact">
      <Chip.Icon>{icon}</Chip.Icon>
      <Chip.Label>{place}</Chip.Label>
      <Chip.Separator />
      <Chip.Label>{name}</Chip.Label>
    </Chip.Root>
  );
}

export default function ChipInText() {
  return (
    // Demo only: a narrow paragraph, so the chips wrap; your layout sets the width.
    <Text className={styles.narrow}>
      Compare <FileChip icon={<UploadIcon />} place="Upload" name="before.png" />{' '}
      <FileChip icon={<UploadIcon />} place="Upload" name="after.png" />{' '}
      <FileChip icon={<DnsIcon />} place="devbox" name="design.png" />{' '}
      <FileChip icon={<LaptopMacIcon />} place="MacBook" name="notes.md" /> and tell me what moved
    </Text>
  );
}

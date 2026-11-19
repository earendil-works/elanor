import {ArrowDownwardIcon, ArrowUpwardIcon, MicIcon} from '@earendil-works/elanor-icons-react';
import {IconButton, Stack} from '@earendil-works/elanor-react';

export default function IconButtonHierarchy() {
  return (
    <Stack direction="row" align="center" gap="small">
      <IconButton density="default" aria-label="Dictate">
        <MicIcon />
      </IconButton>
      <IconButton density="default" hierarchy="primary" aria-label="Send">
        <ArrowUpwardIcon />
      </IconButton>
      <IconButton density="default" hierarchy="secondary" aria-label="Scroll to latest message">
        <ArrowDownwardIcon />
      </IconButton>
    </Stack>
  );
}

import {AttachFileIcon} from '@earendil-works/elanor-icons-react';
import {IconButton, Stack} from '@earendil-works/elanor-react';

export default function IconButtonDensity() {
  return (
    <Stack direction="row" align="center" gap="small">
      <IconButton aria-label="Attach files">
        <AttachFileIcon />
      </IconButton>
      <IconButton density="default" aria-label="Attach files">
        <AttachFileIcon />
      </IconButton>
    </Stack>
  );
}

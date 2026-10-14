import {VisibilityIcon, VisibilityOffIcon} from '@earendil-works/elanor-icons-react';
import {IconButton, Stack, Text} from '@earendil-works/elanor-react';
import {useState} from 'react';

export default function IconButtonToggle() {
  const [visible, setVisible] = useState(false);

  return (
    <Stack direction="row" align="center" gap="small">
      <IconButton
        aria-label={visible ? 'Hide API key' : 'Show API key'}
        onClick={() => setVisible(!visible)}
      >
        {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
      </IconButton>
      <Text render={<span />}>{visible ? 'sk-live-2048' : '••••••••••••'}</Text>
    </Stack>
  );
}

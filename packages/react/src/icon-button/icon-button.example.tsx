import {VisibilityIcon, VisibilityOffIcon} from '@earendil-works/elanor-icons-react';
import {useState} from 'react';
import {IconButton, Stack, Text} from '@earendil-works/elanor-react';

export function IconButtonExample() {
  const [visible, setVisible] = useState(true);

  return (
    <Stack direction="row" align="center" gap="small">
      <IconButton
        aria-label={visible ? 'Hide tip' : 'Show tip'}
        aria-expanded={visible}
        aria-controls="workspace-tip"
        onClick={() => setVisible(!visible)}
      >
        {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
      </IconButton>
      <Text as="span" id="workspace-tip" hidden={!visible}>Tip: give each project a descriptive name.</Text>
    </Stack>
  );
}

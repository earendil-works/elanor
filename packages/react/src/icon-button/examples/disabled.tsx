import {SettingsIcon} from '@earendil-works/elanor-icons-react';
import {IconButton} from '@earendil-works/elanor-react';

export default function IconButtonDisabled() {
  return (
    <IconButton aria-label="Workspace settings" disabled>
      <SettingsIcon />
    </IconButton>
  );
}

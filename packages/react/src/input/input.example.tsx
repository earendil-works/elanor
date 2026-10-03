import {Input, Stack} from '@earendil-works/elanor-react';

export function InputExample() {
  return (
    <Stack gap="large">
      <Stack gap="small">
        <label htmlFor="input-email">Email</label>
        <Input id="input-email" name="email" type="email" autoComplete="email" placeholder="name@example.com" />
      </Stack>
      <Stack gap="small">
        <label htmlFor="input-workspace">Workspace ID (read-only)</label>
        <Input id="input-workspace" name="workspaceId" defaultValue="workspace-2048" readOnly />
      </Stack>
      <Stack gap="small">
        <label htmlFor="input-invite">Invitation code (disabled)</label>
        <Input id="input-invite" name="inviteCode" placeholder="Invitations are closed" disabled />
      </Stack>
    </Stack>
  );
}

import {Field, Input, Stack} from '@earendil-works/elanor-react';

export function InputExample() {
  return (
    <Stack gap="large">
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Input type="email" autoComplete="email" placeholder="name@example.com" />
      </Field.Root>
      <Field.Root name="workspaceId">
        <Field.Label>Workspace ID (read-only)</Field.Label>
        <Input defaultValue="workspace-2048" readOnly />
      </Field.Root>
      <Field.Root name="inviteCode" disabled>
        <Field.Label>Invitation code (disabled)</Field.Label>
        <Input placeholder="Invitations are closed" />
      </Field.Root>
    </Stack>
  );
}

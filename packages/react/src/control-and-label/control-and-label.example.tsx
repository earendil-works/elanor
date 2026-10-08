import {ControlAndLabel, Input, Stack} from '@earendil-works/elanor-react';

export function ControlAndLabelExample() {
  return (
    <Stack gap="large">
      <ControlAndLabel label="Display name" description="Shown to other workspace members.">
        <Input name="displayName" autoComplete="name" defaultValue="Alex Morgan" />
      </ControlAndLabel>
      <ControlAndLabel
        label="Workspace ID"
        description="Assigned when the workspace is created."
        disabled
      >
        <Input name="workspaceId" defaultValue="workspace-2048" />
      </ControlAndLabel>
    </Stack>
  );
}

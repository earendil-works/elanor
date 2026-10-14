import {ControlAndLabel, Input} from '@earendil-works/elanor-react';

export default function ControlAndLabelDisabled() {
  return (
    <ControlAndLabel
      label="Workspace ID"
      description="Assigned when the workspace is created."
      disabled
    >
      <Input name="workspaceId" defaultValue="workspace-2048" />
    </ControlAndLabel>
  );
}

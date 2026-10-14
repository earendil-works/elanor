import {Field, Input} from '@earendil-works/elanor-react';

export default function InputReadOnly() {
  return (
    <Field.Root name="workspaceId">
      <Field.Label>Workspace ID</Field.Label>
      <Input defaultValue="workspace-2048" readOnly />
    </Field.Root>
  );
}

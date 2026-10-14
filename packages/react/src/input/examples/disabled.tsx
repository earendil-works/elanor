import {Field, Input} from '@earendil-works/elanor-react';

export default function InputDisabled() {
  return (
    <Field.Root name="inviteCode" disabled>
      <Field.Label>Invitation code</Field.Label>
      <Input placeholder="Invitations are closed" />
    </Field.Root>
  );
}

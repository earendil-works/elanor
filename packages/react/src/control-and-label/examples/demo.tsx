import {ControlAndLabel, Input} from '@earendil-works/elanor-react';

export default function ControlAndLabelDemo() {
  return (
    <ControlAndLabel label="Display name" description="Shown to other workspace members.">
      <Input name="displayName" autoComplete="name" defaultValue="Alex Morgan" />
    </ControlAndLabel>
  );
}

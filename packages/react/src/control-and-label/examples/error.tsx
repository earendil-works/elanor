import {ControlAndLabel, Input} from '@earendil-works/elanor-react';

export default function ControlAndLabelError() {
  return (
    <ControlAndLabel label="Email" error="Enter a valid email address." validationMode="onBlur">
      <Input type="email" name="email" defaultValue="alex@" />
    </ControlAndLabel>
  );
}

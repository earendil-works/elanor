import {
  Button,
  Checkbox,
  Field,
  Fieldset,
  Form,
  SelectionControlAndLabel,
  Stack,
} from '@earendil-works/elanor-react';

const channels = ['Email', 'Slack', 'SMS'];

export default function FieldsetValidation() {
  return (
    <Form>
      <Stack gap="medium">
        <Field.Root
          name="channels"
          validate={(value) =>
            Array.isArray(value) && value.length > 0 ? null : 'Choose at least one channel.'
          }
        >
          <Fieldset.Root render={<Checkbox.Group defaultValue={[]} />}>
            <Fieldset.Legend>Alert channels</Fieldset.Legend>
            <Stack gap="small">
              {channels.map((channel) => (
                <SelectionControlAndLabel
                  key={channel}
                  control={
                    <Checkbox.Root value={channel}>
                      <Checkbox.Indicator />
                    </Checkbox.Root>
                  }
                >
                  {channel}
                </SelectionControlAndLabel>
              ))}
            </Stack>
          </Fieldset.Root>
          <Field.Error />
        </Field.Root>
        <Button type="submit">Save</Button>
      </Stack>
    </Form>
  );
}

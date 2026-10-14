import {Checkbox, Stack, SelectionControlAndLabel} from '@earendil-works/elanor-react';

export function SelectionControlLabelExample(): React.JSX.Element {
  return (
    <Stack gap="large">
      <SelectionControlAndLabel
        control={
          <Checkbox.Root defaultChecked>
            <Checkbox.Indicator />
          </Checkbox.Root>
        }
      >
        Email notifications
      </SelectionControlAndLabel>
      <SelectionControlAndLabel
        control={
          <Checkbox.Root defaultChecked>
            <Checkbox.Indicator />
          </Checkbox.Root>
        }
      >
        Send me a weekly summary of project activity,
        <br />
        including comments, assignments, and upcoming deadlines.
      </SelectionControlAndLabel>
    </Stack>
  );
}

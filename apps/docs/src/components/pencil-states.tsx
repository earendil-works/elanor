import {Checkbox, IconButton, Radio, Separator, Stack, Switch, TextArea} from '@earendil-works/elanor-react';

/** Shared BEFORE/AFTER fixture: no appearance-specific code or layout wrappers. */
export function PencilStates(): React.JSX.Element {
  return (
    <Stack gap="large">
      <h2>Selection controls</h2>
      <Stack direction="row" gap="medium">
        <Checkbox.Root aria-label="Unchecked"><Checkbox.Indicator /></Checkbox.Root>
        <Checkbox.Root aria-label="Checked" defaultChecked><Checkbox.Indicator /></Checkbox.Root>
        <Checkbox.Root aria-label="Indeterminate" indeterminate><Checkbox.Indicator /></Checkbox.Root>
        <Checkbox.Root aria-label="Disabled check" defaultChecked disabled><Checkbox.Indicator /></Checkbox.Root>
        <Checkbox.Root aria-label="Custom check" defaultChecked><Checkbox.Indicator><span>✓</span></Checkbox.Indicator></Checkbox.Root>
      </Stack>
      <Radio.Group defaultValue="selected" aria-label="Choices">
        <Stack direction="row" gap="medium">
          <Radio.Root value="selected" aria-label="Selected"><Radio.Indicator /></Radio.Root>
          <Radio.Root value="other" aria-label="Other"><Radio.Indicator /></Radio.Root>
          <Radio.Root value="disabled" aria-label="Disabled radio" disabled><Radio.Indicator /></Radio.Root>
        </Stack>
      </Radio.Group>
      <Stack direction="row" gap="medium">
        <Switch.Root aria-label="Off"><Switch.Thumb /></Switch.Root>
        <Switch.Root aria-label="On" defaultChecked><Switch.Thumb /></Switch.Root>
        <Switch.Root aria-label="Disabled switch" defaultChecked disabled><Switch.Thumb /></Switch.Root>
      </Stack>
      <Stack direction="row" gap="medium">
        <IconButton aria-label="Action">+</IconButton>
        <IconButton aria-label="Disabled action" disabled>+</IconButton>
      </Stack>
      <h2>Resizing and invalid content</h2>
      <TextArea aria-label="Notes" defaultValue={'Two lines\nof editable text'} />
      <TextArea aria-label="Invalid notes" aria-invalid="true" defaultValue="Invalid value" />
      <Separator />
      <Stack direction="row"><span>Before</span><Separator orientation="vertical" /><span>After</span></Stack>
    </Stack>
  );
}

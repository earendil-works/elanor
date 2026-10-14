import {Button, Input, Popover, Stack} from '@earendil-works/elanor-react';
import {DocsAppearance} from './docs-appearance.tsx';

/** Migration fixture: keep the example content stable while replacing its painting. */
export function PencilPilot(): React.JSX.Element {
  return (
    <DocsAppearance><Stack gap="large">
      <h1>Pencil surface pilot</h1>
      <section aria-label="Button variants" data-testid="buttons">
        <Stack gap="small">
          {(['primary', 'secondary', 'tertiary'] as const).map(hierarchy => (
            <Stack key={hierarchy} direction="row" gap="small">
              {(['neutral', 'positive', 'negative'] as const).map(semantic => (
                <Button key={semantic} hierarchy={hierarchy} semantic={semantic}>{hierarchy} {semantic}</Button>
              ))}
            </Stack>
          ))}
          <Stack direction="row" gap="small">
            <Button density="compact">Compact</Button>
            <Button disabled>Disabled</Button>
            <Button pending>Pending</Button>
            <Button render={<a href="#target" />} nativeButton={false}>Link button</Button>
          </Stack>
        </Stack>
      </section>
      <section aria-label="Input states" data-testid="inputs">
        <Stack gap="small">
          <label htmlFor="pilot-input">Editable</label>
          <Input id="pilot-input" defaultValue="Hello" />
          <Input aria-label="Invalid input" aria-invalid="true" defaultValue="Needs attention" />
          <Input aria-label="Read-only input" readOnly defaultValue="Read only" />
          <Input aria-label="Disabled input" disabled defaultValue="Disabled" />
        </Stack>
      </section>
      <Popover.Root>
        <Popover.Trigger render={<Button hierarchy="secondary" />}>Open pilot popup</Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Popup>
              <Popover.Title>Pilot popup</Popover.Title>
              <Popover.Description>A surface with independently scrolling content.</Popover.Description>
              <Input aria-label="Popup input" defaultValue="Inside a portal" />
              <Popover.Close render={<Button hierarchy="secondary" />}>Close pilot popup</Popover.Close>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </Stack></DocsAppearance>
  );
}

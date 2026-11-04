import {Dropdown, Grid} from '@earendil-works/elanor-react';

const statuses = [
  {value: 'active', label: 'Active'},
  {value: 'invited', label: 'Invited'},
  {value: 'suspended', label: 'Suspended'},
];

export default function DropdownClear() {
  return (
    <Grid.Root>
      <Grid.Item span={{base: 'full', xSmall: 4}}>
        <Dropdown.Root items={statuses} defaultValue="invited">
          <Dropdown.Control>
            <Dropdown.Trigger density="compact">
              <Dropdown.Prefix>Status</Dropdown.Prefix>
              <Dropdown.Value placeholder="All" />
              <Dropdown.Icon />
            </Dropdown.Trigger>
            <Dropdown.Clear aria-label="Clear Status filter" />
          </Dropdown.Control>
          <Dropdown.Portal>
            <Dropdown.Positioner>
              <Dropdown.Popup>
                <Dropdown.List>
                  {statuses.map((status) => (
                    <Dropdown.Item key={status.value} value={status.value}>
                      <Dropdown.ItemIndicator />
                      <Dropdown.ItemText>{status.label}</Dropdown.ItemText>
                    </Dropdown.Item>
                  ))}
                </Dropdown.List>
              </Dropdown.Popup>
            </Dropdown.Positioner>
          </Dropdown.Portal>
        </Dropdown.Root>
      </Grid.Item>
    </Grid.Root>
  );
}

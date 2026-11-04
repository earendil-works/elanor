import {Dropdown, Grid} from '@earendil-works/elanor-react';

const groups = ['developers', 'design', 'operations', 'support'];

export default function DropdownValueCount() {
  return (
    <Grid.Root>
      <Grid.Item span={{base: 'full', xSmall: 4}}>
        <Dropdown.Root multiple defaultValue={['developers', 'design', 'support']}>
          <Dropdown.Trigger density="compact">
            <Dropdown.Prefix>Groups</Dropdown.Prefix>
            <Dropdown.Value>{(values: string[]) => values[0] ?? 'All'}</Dropdown.Value>
            <Dropdown.ValueCount />
            <Dropdown.Icon />
          </Dropdown.Trigger>
          <Dropdown.Portal>
            <Dropdown.Positioner>
              <Dropdown.Popup>
                <Dropdown.List>
                  {groups.map((group) => (
                    <Dropdown.Item key={group} value={group}>
                      <Dropdown.ItemIndicator />
                      <Dropdown.ItemText>{group}</Dropdown.ItemText>
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

import {Dropdown, Grid} from '@earendil-works/elanor-react';
import {useState} from 'react';

const groups = ['developers', 'design', 'operations', 'support'];

export default function DropdownClearMultiple() {
  const [selected, setSelected] = useState(['developers', 'design', 'support']);

  return (
    <Grid.Root>
      <Grid.Item span={{base: 'full', xSmall: 4}}>
        <Dropdown.Root multiple value={selected} onValueChange={setSelected}>
          <Dropdown.Control>
            <Dropdown.Trigger density="compact">
              <Dropdown.Prefix>Groups:</Dropdown.Prefix>
              <Dropdown.Value>{(groups: string[]) => groups[0] ?? 'All'}</Dropdown.Value>
              {selected.length > 1 ? <Dropdown.ValueCount count={selected.length - 1} /> : null}
              <Dropdown.Icon />
            </Dropdown.Trigger>
            <Dropdown.Clear aria-label="Clear Groups filter" />
          </Dropdown.Control>
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

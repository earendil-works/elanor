import {Dropdown, Grid} from '@earendil-works/elanor-react';
import {useState} from 'react';

const statuses = [
  {value: 'active', label: 'Active'},
  {value: 'expired', label: 'Expired'},
  {value: 'revoked', label: 'Revoked'},
];
const defaultStatus = ['active'];

export default function DropdownClearDefault() {
  // Unchecking every status shows all keys; Clear goes back to the default.
  const [status, setStatus] = useState(defaultStatus);

  return (
    <Grid.Root>
      <Grid.Item span={{base: 'full', xSmall: 4}}>
        <Dropdown.Root
          multiple
          items={statuses}
          value={status}
          clearValue={defaultStatus}
          onValueChange={setStatus}
        >
          <Dropdown.Control>
            <Dropdown.Trigger density="compact">
              <Dropdown.Prefix>Status</Dropdown.Prefix>
              <Dropdown.Value placeholder="All" />
              <Dropdown.Icon />
            </Dropdown.Trigger>
            <Dropdown.Clear aria-label="Reset Status filter to Active" />
          </Dropdown.Control>
          <Dropdown.Portal>
            <Dropdown.Positioner>
              <Dropdown.Popup>
                <Dropdown.List>
                  {statuses.map((option) => (
                    <Dropdown.Item key={option.value} value={option.value}>
                      <Dropdown.ItemIndicator />
                      <Dropdown.ItemText>{option.label}</Dropdown.ItemText>
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

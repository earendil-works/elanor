import {Dropdown, Grid} from '@earendil-works/elanor-react';
import {useState} from 'react';

const statuses = [
  {value: 'active', label: 'Active'},
  {value: 'expired', label: 'Expired'},
  {value: 'revoked', label: 'Revoked'},
];
const defaultStatus = ['active'];

export default function DropdownClearDefault() {
  const [status, setStatus] = useState(defaultStatus);
  const isDefault = status.length === 1 && status[0] === 'active';

  return (
    <Grid.Root>
      <Grid.Item span={{base: 'full', xSmall: 4}}>
        <Dropdown.Root
          multiple
          items={statuses}
          value={status}
          onValueChange={(next, details) =>
            // Unchecking every status shows all keys; Clear goes back to the default.
            setStatus(details.reason === 'clear-press' ? defaultStatus : next)
          }
        >
          <Dropdown.Control>
            <Dropdown.Trigger density="compact">
              <Dropdown.Prefix>Status:</Dropdown.Prefix>
              <Dropdown.Value placeholder="All" />
              <Dropdown.Icon />
            </Dropdown.Trigger>
            <Dropdown.Clear visible={!isDefault} aria-label="Reset Status filter to Active" />
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

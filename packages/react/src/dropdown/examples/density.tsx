import {Dropdown, Stack} from '@earendil-works/elanor-react';

const ranges = [
  {value: 'week', label: 'Last 7 days'},
  {value: 'month', label: 'Last 30 days'},
  {value: 'quarter', label: 'Last 90 days'},
];

export default function DropdownDensity() {
  return (
    <Stack direction="row" gap="large" align="end" wrap="wrap">
      {(['default', 'compact'] as const).map((density) => (
        <Dropdown.Root key={density} items={ranges} defaultValue="month">
          <Stack gap="small">
            <Dropdown.Label>{density === 'default' ? 'Default' : 'Compact'}</Dropdown.Label>
            <Dropdown.Trigger density={density}>
              <Dropdown.Value />
              <Dropdown.Icon />
            </Dropdown.Trigger>
          </Stack>
          <Dropdown.Portal>
            <Dropdown.Positioner>
              <Dropdown.Popup>
                <Dropdown.List>
                  {ranges.map((range) => (
                    <Dropdown.Item key={range.value} value={range.value}>
                      <Dropdown.ItemIndicator />
                      <Dropdown.ItemText>{range.label}</Dropdown.ItemText>
                    </Dropdown.Item>
                  ))}
                </Dropdown.List>
              </Dropdown.Popup>
            </Dropdown.Positioner>
          </Dropdown.Portal>
        </Dropdown.Root>
      ))}
    </Stack>
  );
}

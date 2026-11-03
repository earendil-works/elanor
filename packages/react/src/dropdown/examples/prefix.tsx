import {Dropdown} from '@earendil-works/elanor-react';

const ranges = [
  {value: 'week', label: 'Last 7 days'},
  {value: 'month', label: 'Last 30 days'},
  {value: 'quarter', label: 'Last 90 days'},
];

export default function DropdownPrefix() {
  return (
    <Dropdown.Root items={ranges} defaultValue="month">
      <Dropdown.Trigger density="compact">
        <Dropdown.Prefix>Date range:</Dropdown.Prefix>
        <Dropdown.Value />
        <Dropdown.Icon />
      </Dropdown.Trigger>
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
  );
}

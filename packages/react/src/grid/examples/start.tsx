import {Dropdown, Grid, Heading} from '@earendil-works/elanor-react';

const ranges = [
  {value: 'week', label: 'Last 7 days'},
  {value: 'month', label: 'Last 30 days'},
  {value: 'quarter', label: 'Last 90 days'},
];

export default function GridStart() {
  return (
    <Grid.Root>
      <Grid.Item span={{base: 'full', xSmall: 6}}>
        <Heading level={3} size={4}>
          Usage
        </Heading>
      </Grid.Item>
      <Grid.Item span={{base: 'full', xSmall: 4}} start={{xSmall: 'end'}}>
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
      </Grid.Item>
    </Grid.Root>
  );
}

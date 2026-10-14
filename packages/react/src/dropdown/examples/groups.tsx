import {Dropdown, Stack} from '@earendil-works/elanor-react';

const regions = {
  Europe: ['Frankfurt', 'London'],
  'North America': ['Toronto', 'Virginia'],
};

export default function DropdownGroups() {
  return (
    <Dropdown.Root defaultValue="Frankfurt">
      <Stack gap="small">
        <Dropdown.Label>Region</Dropdown.Label>
        <Dropdown.Trigger>
          <Dropdown.Value />
          <Dropdown.Icon />
        </Dropdown.Trigger>
      </Stack>
      <Dropdown.Portal>
        <Dropdown.Positioner>
          <Dropdown.Popup>
            <Dropdown.List>
              {Object.entries(regions).map(([continent, cities], index) => (
                <Dropdown.Group key={continent}>
                  {index > 0 ? <Dropdown.Separator /> : null}
                  <Dropdown.GroupLabel>{continent}</Dropdown.GroupLabel>
                  {cities.map((city) => (
                    <Dropdown.Item key={city} value={city}>
                      {city}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Group>
              ))}
            </Dropdown.List>
          </Dropdown.Popup>
        </Dropdown.Positioner>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}

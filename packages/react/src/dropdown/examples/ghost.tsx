import {FilterListIcon, MoreHorizIcon} from '@earendil-works/elanor-icons-react';
import {Dropdown, Heading, IconButton, Stack} from '@earendil-works/elanor-react';

const sortOrders = [
  {value: 'updated', label: 'Last updated'},
  {value: 'created', label: 'Date created'},
  {value: 'name', label: 'Name'},
];

export default function DropdownGhost() {
  return (
    <Stack direction="row" align="center" gap="auto" wrap="wrap">
      <Heading level={3}>Documents</Heading>
      <Stack direction="row" align="center" gap="xxSmall">
        <Dropdown.Root items={sortOrders} defaultValue="updated">
          <Dropdown.Trigger variant="ghost">
            <Dropdown.Prefix>Sort</Dropdown.Prefix>
            <Dropdown.Value />
            <Dropdown.Icon />
          </Dropdown.Trigger>
          <Dropdown.Portal>
            <Dropdown.Positioner>
              <Dropdown.Popup>
                <Dropdown.List>
                  {sortOrders.map((order) => (
                    <Dropdown.Item key={order.value} value={order.value}>
                      <Dropdown.ItemIndicator />
                      <Dropdown.ItemText>{order.label}</Dropdown.ItemText>
                    </Dropdown.Item>
                  ))}
                </Dropdown.List>
              </Dropdown.Popup>
            </Dropdown.Positioner>
          </Dropdown.Portal>
        </Dropdown.Root>
        {/* Demo only: these buttons do nothing; pass onClick to open your filters and menu. */}
        <IconButton density="default" aria-label="Filter documents">
          <FilterListIcon />
        </IconButton>
        <IconButton density="default" aria-label="More actions">
          <MoreHorizIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
}

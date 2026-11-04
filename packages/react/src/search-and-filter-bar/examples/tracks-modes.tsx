import {
  Button,
  Drawer,
  ScrollArea,
  Search,
  SearchAndFilterBar,
  SegmentedControl,
  Stack,
} from '@earendil-works/elanor-react';
import {useState} from 'react';

import {MemberFilter} from './member-filter.tsx';

import styles from './tracks.module.css';

const widths = {
  'one row': styles.oneRow,
  'two rows': styles.twoRows,
  drawer: styles.drawer,
};
type Width = keyof typeof widths;

export default function SearchAndFilterBarTracksModes() {
  const [width, setWidth] = useState<Width>('one row');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [group, setGroup] = useState<string | null>(null);
  const activeFilters = [status, role, group].filter((value) => value !== null).length;

  return (
    <Stack align="stretch">
      <SegmentedControl.Root
        density="compact"
        aria-label="Bar width"
        value={[width]}
        onValueChange={(next: Width[]) => {
          const [value] = next;
          if (value) setWidth(value);
        }}
      >
        <SegmentedControl.Item value="one row">One row</SegmentedControl.Item>
        <SegmentedControl.Item value="two rows">Two rows</SegmentedControl.Item>
        <SegmentedControl.Item value="drawer">Drawer</SegmentedControl.Item>
      </SegmentedControl.Root>
      <ScrollArea.Root>
        <ScrollArea.Viewport role="region" aria-label="Member filters at the chosen width">
          <ScrollArea.Content className={widths[width]}>
            <SearchAndFilterBar.Root role="search" aria-label="Member search and filters">
              <SearchAndFilterBar.Search>
                <Search
                  density="compact"
                  aria-label="Search members"
                  placeholder="Search members"
                  value={query}
                  onValueChange={setQuery}
                />
              </SearchAndFilterBar.Search>
              <SearchAndFilterBar.Filters layout="tracks">
                <MemberFilter
                  label="Status"
                  value={status}
                  options={['Active', 'Invited', 'Suspended']}
                  onChange={setStatus}
                />
                <MemberFilter
                  label="Role"
                  value={role}
                  options={['Administrator', 'Member', 'Viewer']}
                  onChange={setRole}
                />
                <MemberFilter
                  label="Group"
                  value={group}
                  options={['Engineering', 'Design', 'Operations']}
                  onChange={setGroup}
                />
              </SearchAndFilterBar.Filters>
              <SearchAndFilterBar.FiltersTrigger density="compact">
                {activeFilters ? `Filters (${activeFilters})` : 'Filters'}
              </SearchAndFilterBar.FiltersTrigger>
              <SearchAndFilterBar.FiltersDrawer>
                <Drawer.Title>Filters</Drawer.Title>
                <SearchAndFilterBar.FiltersSlot />
                <SearchAndFilterBar.FiltersActions>
                  <Drawer.Close render={<Button />}>Show members</Drawer.Close>
                </SearchAndFilterBar.FiltersActions>
              </SearchAndFilterBar.FiltersDrawer>
            </SearchAndFilterBar.Root>
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="horizontal">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </Stack>
  );
}

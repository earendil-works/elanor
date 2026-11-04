import {
  Button,
  Drawer,
  Search,
  SearchAndFilterBar,
  Stack,
  Text,
} from '@earendil-works/elanor-react';
import {useState} from 'react';

import {MemberFilter} from './member-filter.tsx';

import styles from './narrow.module.css';

const members = [
  {name: 'Alex Morgan', status: 'Active', role: 'Admin'},
  {name: 'Sam Rivera', status: 'Active', role: 'Member'},
  {name: 'Jordan Lee', status: 'Invited', role: 'Member'},
  {name: 'Taylor Chen', status: 'Active', role: 'Viewer'},
  {name: 'Casey Patel', status: 'Suspended', role: 'Member'},
];

export default function SearchAndFilterBarNarrow() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const matching = members.filter(
    (member) =>
      member.name.toLowerCase().includes(query.trim().toLowerCase()) &&
      (status === null || member.status === status) &&
      (role === null || member.role === role),
  );
  const activeFilters = [status, role].filter((value) => value !== null).length;
  const results = `${matching.length} ${matching.length === 1 ? 'member' : 'members'}`;

  function clearFilters() {
    setStatus(null);
    setRole(null);
  }

  return (
    <Stack align="stretch" className={styles.frame}>
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
        <SearchAndFilterBar.Filters>
          <MemberFilter
            label="Status"
            value={status}
            options={['Active', 'Invited', 'Suspended']}
            onChange={setStatus}
          />
          <MemberFilter
            label="Role"
            value={role}
            options={['Admin', 'Member', 'Viewer']}
            onChange={setRole}
          />
        </SearchAndFilterBar.Filters>
        <SearchAndFilterBar.FiltersTrigger density="compact">
          {activeFilters ? `Filters (${activeFilters})` : 'Filters'}
        </SearchAndFilterBar.FiltersTrigger>
        <SearchAndFilterBar.FiltersDrawer>
          <Drawer.Title>Filters</Drawer.Title>
          <SearchAndFilterBar.FiltersSlot />
          <SearchAndFilterBar.FiltersStatus>{results}</SearchAndFilterBar.FiltersStatus>
          <SearchAndFilterBar.FiltersActions>
            <Button
              hierarchy="secondary"
              focusableWhenDisabled
              disabled={activeFilters === 0}
              onClick={clearFilters}
            >
              Clear all
            </Button>
            <Drawer.Close render={<Button />}>Show {results}</Drawer.Close>
          </SearchAndFilterBar.FiltersActions>
        </SearchAndFilterBar.FiltersDrawer>
      </SearchAndFilterBar.Root>
      <Text role="status">
        {matching.length} of {members.length} members
      </Text>
    </Stack>
  );
}

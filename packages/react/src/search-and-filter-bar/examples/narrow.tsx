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
  const [status, setStatus] = useState('All');
  const [role, setRole] = useState('All');
  const matching = members.filter(
    (member) =>
      member.name.toLowerCase().includes(query.trim().toLowerCase()) &&
      (status === 'All' || member.status === status) &&
      (role === 'All' || member.role === role),
  );
  const activeFilters = [status, role].filter((value) => value !== 'All').length;
  const results = `${matching.length} ${matching.length === 1 ? 'member' : 'members'}`;

  function clearFilters() {
    setStatus('All');
    setRole('All');
  }

  return (
    <Stack align="stretch" className={styles.frame}>
      <SearchAndFilterBar.Root role="search" aria-label="Member search and filters">
        <SearchAndFilterBar.Search>
          <Search
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
            options={['All', 'Active', 'Invited', 'Suspended']}
            onChange={setStatus}
          />
          <MemberFilter
            label="Role"
            value={role}
            options={['All', 'Admin', 'Member', 'Viewer']}
            onChange={setRole}
          />
        </SearchAndFilterBar.Filters>
        <SearchAndFilterBar.FiltersTrigger>
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

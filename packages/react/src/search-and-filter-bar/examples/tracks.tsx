import {
  Button,
  Drawer,
  ScrollArea,
  Search,
  SearchAndFilterBar,
  Stack,
} from '@earendil-works/elanor-react';
import {useState} from 'react';

import {MemberFilter} from './member-filter.tsx';

import styles from './tracks.module.css';

const filters = [
  {label: 'Status', options: ['Active', 'Invited', 'Suspended']},
  {label: 'Role', options: ['Administrator', 'Member', 'Viewer']},
  {label: 'Group', options: ['Engineering', 'Design', 'Operations']},
  {label: '2FA', options: ['Enabled', 'Disabled']},
];

function MembersBar({count}: {readonly count: number}) {
  const [query, setQuery] = useState('');
  const [values, setValues] = useState<ReadonlyArray<string | null>>(filters.map(() => null));

  return (
    <SearchAndFilterBar.Root
      role="search"
      aria-label={`Member search with ${count === 1 ? 'one filter' : `${count} filters`}`}
    >
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
        {filters.slice(0, count).map((filter, index) => (
          <MemberFilter
            key={filter.label}
            label={filter.label}
            value={values[index] ?? null}
            options={filter.options}
            onChange={(value) =>
              setValues((current) => current.map((item, at) => (at === index ? value : item)))
            }
          />
        ))}
      </SearchAndFilterBar.Filters>
      <SearchAndFilterBar.FiltersTrigger density="compact">
        Filters
      </SearchAndFilterBar.FiltersTrigger>
      <SearchAndFilterBar.FiltersDrawer>
        <Drawer.Title>Filters</Drawer.Title>
        <SearchAndFilterBar.FiltersSlot />
        <SearchAndFilterBar.FiltersActions>
          <Drawer.Close render={<Button />}>Show members</Drawer.Close>
        </SearchAndFilterBar.FiltersActions>
      </SearchAndFilterBar.FiltersDrawer>
    </SearchAndFilterBar.Root>
  );
}

export default function SearchAndFilterBarTracks() {
  return (
    <ScrollArea.Root>
      <ScrollArea.Viewport role="region" aria-label="Member filters at desktop width">
        <ScrollArea.Content className={styles.desktop}>
          <Stack align="stretch">
            {[1, 2, 3, 4].map((count) => (
              <MembersBar key={count} count={count} />
            ))}
          </Stack>
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="horizontal">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}

import {ScrollArea, Search, SearchAndFilterBar} from '@earendil-works/elanor-react';
import {useState} from 'react';

import {MemberFilter} from './member-filter.tsx';

import styles from './tracks.module.css';

export default function SearchAndFilterBarTracks() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>('Administrator');
  const [group, setGroup] = useState<string | null>(null);
  const [twoFactor, setTwoFactor] = useState<string | null>(null);
  const filtered = [status, role, group, twoFactor].some((value) => value !== null);

  function clearFilters() {
    setStatus(null);
    setRole(null);
    setGroup(null);
    setTwoFactor(null);
  }

  return (
    <ScrollArea.Root>
      <ScrollArea.Viewport role="region" aria-label="Member filters at desktop width">
        <ScrollArea.Content className={styles.desktop}>
          <SearchAndFilterBar.Root role="search" aria-label="Member search and filters">
            <SearchAndFilterBar.Search>
              <Search
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
              <MemberFilter
                label="2FA"
                value={twoFactor}
                options={['Enabled', 'Disabled']}
                onChange={setTwoFactor}
              />
              {filtered ? (
                <SearchAndFilterBar.ClearAll onClick={clearFilters}>
                  Clear filters
                </SearchAndFilterBar.ClearAll>
              ) : null}
            </SearchAndFilterBar.Filters>
          </SearchAndFilterBar.Root>
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="horizontal">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}

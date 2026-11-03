import {Search, SearchAndFilterBar, Stack, Text} from '@earendil-works/elanor-react';
import {useState} from 'react';

import {MemberFilter} from './member-filter.tsx';

const members = [
  {
    name: 'Alex Morgan',
    status: 'Active',
    role: 'Admin',
    group: 'Engineering',
    twoFactor: 'Enabled',
  },
  {name: 'Sam Rivera', status: 'Active', role: 'Member', group: 'Design', twoFactor: 'Enabled'},
  {
    name: 'Jordan Lee',
    status: 'Invited',
    role: 'Member',
    group: 'Engineering',
    twoFactor: 'Disabled',
  },
  {
    name: 'Taylor Chen',
    status: 'Active',
    role: 'Viewer',
    group: 'Operations',
    twoFactor: 'Disabled',
  },
  {
    name: 'Casey Patel',
    status: 'Suspended',
    role: 'Member',
    group: 'Operations',
    twoFactor: 'Enabled',
  },
  {name: 'Robin Ellis', status: 'Active', role: 'Admin', group: 'Design', twoFactor: 'Enabled'},
];

export default function SearchAndFilterBarDemo() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [group, setGroup] = useState<string | null>(null);
  const [twoFactor, setTwoFactor] = useState<string | null>(null);
  const matchingMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(query.trim().toLowerCase()) &&
      (status === null || member.status === status) &&
      (role === null || member.role === role) &&
      (group === null || member.group === group) &&
      (twoFactor === null || member.twoFactor === twoFactor),
  );
  const filtered = [status, role, group, twoFactor].some((value) => value !== null);

  function clearFilters() {
    setStatus(null);
    setRole(null);
    setGroup(null);
    setTwoFactor(null);
  }

  return (
    <Stack align="stretch">
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
            options={['Active', 'Invited', 'Suspended']}
            onChange={setStatus}
          />
          <MemberFilter
            label="Role"
            value={role}
            options={['Admin', 'Member', 'Viewer']}
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
      <Text role="status">
        {matchingMembers.length} of {members.length} members
      </Text>
      <ul
        aria-label="Matching members"
        style={{margin: 0, paddingInlineStart: 'var(--semantic-dimension-space-padding-x-large)'}}
      >
        {matchingMembers.map((member) => (
          <li key={member.name}>
            <Text render={<span />}>
              {member.name} - {member.role}
            </Text>
          </li>
        ))}
      </ul>
    </Stack>
  );
}

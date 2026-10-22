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
  const [status, setStatus] = useState('All');
  const [role, setRole] = useState('All');
  const [group, setGroup] = useState('All');
  const [twoFactor, setTwoFactor] = useState('All');
  const matchingMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(query.trim().toLowerCase()) &&
      (status === 'All' || member.status === status) &&
      (role === 'All' || member.role === role) &&
      (group === 'All' || member.group === group) &&
      (twoFactor === 'All' || member.twoFactor === twoFactor),
  );

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
            options={['All', 'Active', 'Invited', 'Suspended']}
            onChange={setStatus}
          />
          <MemberFilter
            label="Role"
            value={role}
            options={['All', 'Admin', 'Member', 'Viewer']}
            onChange={setRole}
          />
          <MemberFilter
            label="Group"
            value={group}
            options={['All', 'Engineering', 'Design', 'Operations']}
            onChange={setGroup}
          />
          <MemberFilter
            label="2FA"
            value={twoFactor}
            options={['All', 'Enabled', 'Disabled']}
            onChange={setTwoFactor}
          />
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

import {useState} from 'react';
import {Dropdown, Search, SearchAndFilterBar, Stack, Text} from '@earendil-works/elanor-react';

const members = [
  {name: 'Alex Morgan', status: 'Active', role: 'Admin', group: 'Engineering', twoFactor: 'Enabled'},
  {name: 'Sam Rivera', status: 'Active', role: 'Member', group: 'Design', twoFactor: 'Enabled'},
  {name: 'Jordan Lee', status: 'Invited', role: 'Member', group: 'Engineering', twoFactor: 'Disabled'},
  {name: 'Taylor Chen', status: 'Active', role: 'Viewer', group: 'Operations', twoFactor: 'Disabled'},
  {name: 'Casey Patel', status: 'Suspended', role: 'Member', group: 'Operations', twoFactor: 'Enabled'},
  {name: 'Robin Ellis', status: 'Active', role: 'Admin', group: 'Design', twoFactor: 'Enabled'},
];

export function SearchAndFilterBarExample(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [role, setRole] = useState('All');
  const [group, setGroup] = useState('All');
  const [twoFactor, setTwoFactor] = useState('All');
  const matchingMembers = members.filter((member) => (
    member.name.toLowerCase().includes(query.trim().toLowerCase())
    && (status === 'All' || member.status === status)
    && (role === 'All' || member.role === role)
    && (group === 'All' || member.group === group)
    && (twoFactor === 'All' || member.twoFactor === twoFactor)
  ));

  return (
    <Stack style={{inlineSize: '100%'}}>
      <SearchAndFilterBar
        role="search"
        aria-label="Member search and filters"
        search={<Search aria-label="Search members" placeholder="Search members" value={query} onValueChange={setQuery} />}
      >
        <MemberFilter label="Status" value={status} options={['All', 'Active', 'Invited', 'Suspended']} onChange={setStatus} />
        <MemberFilter label="Role" value={role} options={['All', 'Admin', 'Member', 'Viewer']} onChange={setRole} />
        <MemberFilter label="Group" value={group} options={['All', 'Engineering', 'Design', 'Operations']} onChange={setGroup} />
        <MemberFilter label="2FA" value={twoFactor} options={['All', 'Enabled', 'Disabled']} onChange={setTwoFactor} />
      </SearchAndFilterBar>
      <Text role="status">{matchingMembers.length} of {members.length} members</Text>
      <ul aria-label="Matching members" style={{margin: 0, paddingInlineStart: 'var(--semantic-dimension-space-padding-x-large)'}}>
        {matchingMembers.map((member) => <li key={member.name}><Text as="span">{member.name} — {member.role}</Text></li>)}
      </ul>
    </Stack>
  );
}

interface MemberFilterProps {
  readonly label: string;
  readonly value: string;
  readonly options: readonly string[];
  readonly onChange: (value: string) => void;
}

function MemberFilter({label, value, options, onChange}: MemberFilterProps): React.JSX.Element {
  return (
    <Dropdown.Root
      value={value}
      items={options.map((option) => ({value: option, label: option}))}
      onValueChange={(next) => onChange(next ?? 'All')}
    >
      <Dropdown.Trigger aria-label={`${label} filter`}>
        <span>{label}: <Dropdown.Value /></span>
        <Dropdown.Icon />
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Positioner alignItemWithTrigger={false}>
          <Dropdown.Popup>
            <Dropdown.List>
              {options.map((option) => (
                <Dropdown.Item key={option} value={option}>
                  <Dropdown.ItemIndicator />
                  <Dropdown.ItemText>{option}</Dropdown.ItemText>
                </Dropdown.Item>
              ))}
            </Dropdown.List>
          </Dropdown.Popup>
        </Dropdown.Positioner>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}

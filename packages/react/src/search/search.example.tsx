import {CloseIcon} from '@earendil-works/elanor-icons-react';
import {useRef, useState} from 'react';
import {IconButton, Search, Stack, Text} from '@earendil-works/elanor-react';

const projects = ['Website redesign', 'Design system', 'Release notes'];

export function SearchExample() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const matches = projects.filter((project) => project.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Stack gap="medium">
      <Search
        ref={inputRef}
        aria-label="Search projects"
        placeholder="Search projects"
        value={query}
        onValueChange={setQuery}
        endAdornment={query ? (
          <IconButton aria-label="Clear search" onClick={() => {
            setQuery('');
            inputRef.current?.focus();
          }}><CloseIcon /></IconButton>
        ) : null}
      />
      <Text role="status">{matches.length ? `${matches.length} matching ${matches.length === 1 ? 'project' : 'projects'}` : 'No matching projects.'}</Text>
      {matches.length > 0 ? <ul>{matches.map((project) => <li key={project}>{project}</li>)}</ul> : null}
    </Stack>
  );
}

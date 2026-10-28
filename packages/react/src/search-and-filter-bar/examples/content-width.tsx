import {Search, SearchAndFilterBar, SegmentedControl} from '@earendil-works/elanor-react';
import {useState} from 'react';

import {MemberFilter} from './member-filter.tsx';

const owners = ['All', 'alexandra.morgan-whitfield@example.com', 'sam.rivera@example.com'];

export default function SearchAndFilterBarContentWidth() {
  const [query, setQuery] = useState('');
  const [owner, setOwner] = useState(owners[1] ?? 'All');
  const [source, setSource] = useState(['all']);

  return (
    <SearchAndFilterBar.Root role="search" aria-label="Component search and filters">
      <SearchAndFilterBar.Search>
        <Search
          aria-label="Search components"
          placeholder="Search components"
          value={query}
          onValueChange={setQuery}
        />
      </SearchAndFilterBar.Search>
      <SearchAndFilterBar.Filters>
        <MemberFilter label="Owner" value={owner} options={owners} onChange={setOwner} />
        <SegmentedControl.Root
          aria-label="Source"
          value={source}
          onValueChange={(next) => {
            if (next.length > 0) setSource(next);
          }}
        >
          <SegmentedControl.Item value="all">All</SegmentedControl.Item>
          <SegmentedControl.Item value="built-in">Built-in</SegmentedControl.Item>
          <SegmentedControl.Item value="custom">Custom</SegmentedControl.Item>
        </SegmentedControl.Root>
      </SearchAndFilterBar.Filters>
    </SearchAndFilterBar.Root>
  );
}

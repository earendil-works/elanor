import {Grid, SearchableDropdown} from '@earendil-works/elanor-react';
import {useState} from 'react';

const groups = ['developers', 'design', 'operations', 'support', 'marketing', 'finance'];

export default function DropdownSearchableFilter() {
  const [selected, setSelected] = useState(['developers', 'operations']);

  return (
    <Grid.Root>
      <Grid.Item span={{base: 'full', xSmall: 4}}>
        <SearchableDropdown.Root
          items={groups}
          multiple
          value={selected}
          onValueChange={setSelected}
        >
          <SearchableDropdown.Control>
            <SearchableDropdown.Trigger density="compact">
              <SearchableDropdown.Prefix>Groups:</SearchableDropdown.Prefix>
              <span>
                <SearchableDropdown.Value>
                  {(groups: string[]) => groups[0] ?? 'All'}
                </SearchableDropdown.Value>
              </span>
              {selected.length > 1 ? (
                <SearchableDropdown.ValueCount>
                  +{selected.length - 1}
                </SearchableDropdown.ValueCount>
              ) : null}
              <SearchableDropdown.Icon />
            </SearchableDropdown.Trigger>
            <SearchableDropdown.Clear aria-label="Clear Groups filter" />
          </SearchableDropdown.Control>
          <SearchableDropdown.Portal>
            <SearchableDropdown.Positioner>
              <SearchableDropdown.Popup aria-label="Choose groups">
                <SearchableDropdown.InputGroup>
                  <SearchableDropdown.Input
                    aria-label="Search groups"
                    placeholder="Search groups"
                  />
                </SearchableDropdown.InputGroup>
                <SearchableDropdown.Empty>No matching groups.</SearchableDropdown.Empty>
                <SearchableDropdown.List>
                  {(group: string) => (
                    <SearchableDropdown.Item key={group} value={group}>
                      <SearchableDropdown.ItemIndicator />
                      {group}
                    </SearchableDropdown.Item>
                  )}
                </SearchableDropdown.List>
              </SearchableDropdown.Popup>
            </SearchableDropdown.Positioner>
          </SearchableDropdown.Portal>
        </SearchableDropdown.Root>
      </Grid.Item>
    </Grid.Root>
  );
}

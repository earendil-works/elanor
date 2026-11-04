import {useState} from 'react';
import {describe, expect, test} from 'vitest';
import {render} from 'vitest-browser-react';
import {userEvent} from 'vitest/browser';

import {Dropdown, SearchAndFilterBar} from '../src/index.ts';

interface FilterProps {
  readonly label: string;
  readonly value: string | null;
  readonly onChange: (value: string | null) => void;
}

function Filter({label, value, onChange}: FilterProps) {
  return (
    <Dropdown.Root items={[{value: 'on', label: 'On'}]} value={value} onValueChange={onChange}>
      <Dropdown.Control>
        <Dropdown.Trigger>
          <Dropdown.Prefix>{label}</Dropdown.Prefix>
          <Dropdown.Value placeholder="All" />
        </Dropdown.Trigger>
        <Dropdown.Clear aria-label={`Clear ${label} filter`} />
      </Dropdown.Control>
    </Dropdown.Root>
  );
}

function Bar() {
  const [status, setStatus] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>('on');
  return (
    <SearchAndFilterBar.Root role="search" aria-label="Filters">
      <SearchAndFilterBar.Filters>
        <Filter label="Status" value={status} onChange={setStatus} />
        <Filter label="Role" value={role} onChange={setRole} />
        {(status ?? role) ? (
          <SearchAndFilterBar.ClearAll
            onClick={() => {
              setStatus(null);
              setRole(null);
            }}
          >
            Clear filters
          </SearchAndFilterBar.ClearAll>
        ) : null}
      </SearchAndFilterBar.Filters>
    </SearchAndFilterBar.Root>
  );
}

describe('SearchAndFilterBar.ClearAll', () => {
  test('moves focus to the first filter as it goes away', async () => {
    const screen = await render(<Bar />);
    const clearAll = screen.getByRole('button', {name: 'Clear filters'});

    await userEvent.click(clearAll);

    await expect.element(clearAll).not.toBeInTheDocument();
    await expect
      .element(screen.getByRole('button', {name: 'Clear Role filter'}))
      .not.toBeInTheDocument();
    await expect.element(screen.getByRole('combobox', {name: 'Status'})).toHaveFocus();
  });
});

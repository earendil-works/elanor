import {describe, expect, test} from 'vitest';
import {render} from 'vitest-browser-react';
import {page, userEvent} from 'vitest/browser';

import {SearchableDropdown, type DropdownTriggerDensity} from '../src/index.ts';

const groups = ['developers', 'design'];

function GroupFilter({density}: {readonly density: DropdownTriggerDensity}) {
  return (
    <SearchableDropdown.Root items={groups} multiple defaultValue={['design']}>
      <SearchableDropdown.Trigger density={density}>
        <SearchableDropdown.Prefix>Groups</SearchableDropdown.Prefix>
        <span>
          <SearchableDropdown.Value />
        </span>
        <SearchableDropdown.Icon />
      </SearchableDropdown.Trigger>
      <SearchableDropdown.Portal>
        <SearchableDropdown.Positioner>
          <SearchableDropdown.Popup aria-label="Choose groups">
            <SearchableDropdown.InputGroup>
              <SearchableDropdown.Input aria-label="Search groups" />
            </SearchableDropdown.InputGroup>
            <SearchableDropdown.List>
              {(group: string) => (
                <SearchableDropdown.Item key={group} value={group}>
                  {group}
                </SearchableDropdown.Item>
              )}
            </SearchableDropdown.List>
          </SearchableDropdown.Popup>
        </SearchableDropdown.Positioner>
      </SearchableDropdown.Portal>
    </SearchableDropdown.Root>
  );
}

describe('SearchableDropdown.Prefix', () => {
  test('names the trigger, without the colon it shows', async () => {
    const screen = await render(<GroupFilter density="default" />);
    const trigger = screen.getByRole('combobox', {name: 'Groups', exact: true});

    await expect.element(trigger).toHaveAccessibleName('Groups');
    expect(trigger.element().getAttribute('aria-labelledby')).toBe(
      screen.getByText('Groups', {exact: true}).element().id,
    );
  });

  test.each<DropdownTriggerDensity>(['default', 'compact'])(
    'a held press on the prefix opens the popup (%s)',
    async (density) => {
      const screen = await render(<GroupFilter density={density} />);
      await userEvent.click(screen.getByText('Groups', {exact: true}), {delay: 150});

      await expect.element(page.getByRole('option', {name: 'developers'})).toBeVisible();
      await expect
        .element(screen.getByRole('combobox', {name: 'Groups'}))
        .toHaveAttribute('aria-expanded', 'true');
    },
  );
});

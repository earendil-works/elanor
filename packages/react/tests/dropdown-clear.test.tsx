import {useState} from 'react';
import {describe, expect, test, vi} from 'vitest';
import {render} from 'vitest-browser-react';
import {userEvent} from 'vitest/browser';

import {
  Dropdown,
  Field,
  type DropdownRootChangeEventDetails,
  type DropdownRootProps,
} from '../src/index.ts';

const statuses = [
  {value: 'active', label: 'Active'},
  {value: 'invited', label: 'Invited'},
  {value: 'revoked', label: 'Revoked'},
];

function StatusFilter<Multiple extends boolean | undefined = false>(
  props: DropdownRootProps<string, Multiple>,
) {
  return (
    <Dropdown.Root items={statuses} {...props}>
      <Dropdown.Control>
        <Dropdown.Trigger density="compact">
          <Dropdown.Prefix>Status</Dropdown.Prefix>
          <Dropdown.Value placeholder="All" />
          <Dropdown.ValueCount />
          <Dropdown.Icon />
        </Dropdown.Trigger>
        <Dropdown.Clear aria-label="Clear Status filter" />
      </Dropdown.Control>
      <Dropdown.Portal>
        <Dropdown.Positioner>
          <Dropdown.Popup>
            <Dropdown.List>
              {statuses.map((status) => (
                <Dropdown.Item key={status.value} value={status.value}>
                  <Dropdown.ItemText>{status.label}</Dropdown.ItemText>
                </Dropdown.Item>
              ))}
            </Dropdown.List>
          </Dropdown.Popup>
        </Dropdown.Positioner>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}

type OnValueChange = (
  value: string | string[] | null,
  details: DropdownRootChangeEventDetails,
) => void;

describe('Dropdown.Clear', () => {
  test('clears a controlled value to null and focuses the trigger', async () => {
    const onValueChange = vi.fn<OnValueChange>();
    function Controlled() {
      const [value, setValue] = useState<string | null>('invited');
      return (
        <StatusFilter
          value={value}
          onValueChange={(next, details) => {
            onValueChange(next, details);
            setValue(next);
          }}
        />
      );
    }
    const screen = await render(<Controlled />);
    const clear = screen.getByRole('button', {name: 'Clear Status filter'});

    await userEvent.click(clear);

    expect(onValueChange.mock.lastCall?.[0]).toBeNull();
    expect(onValueChange.mock.lastCall?.[1].reason).toBe('clear-press');
    await expect.element(screen.getByRole('combobox', {name: 'Status'})).toHaveFocus();
    await expect.poll(() => screen.getByRole('combobox').element().textContent).toContain('All');
    await expect.element(clear).not.toBeInTheDocument();
  });

  test('clears an uncontrolled multiple value to an empty array', async () => {
    const onValueChange = vi.fn<OnValueChange>();
    const screen = await render(
      <StatusFilter multiple defaultValue={['active', 'invited']} onValueChange={onValueChange} />,
    );

    await userEvent.click(screen.getByRole('button', {name: 'Clear Status filter'}));

    expect(onValueChange.mock.lastCall?.[0]).toEqual([]);
    expect(onValueChange.mock.lastCall?.[1].reason).toBe('clear-press');
    await expect.poll(() => screen.getByRole('combobox').element().textContent).toContain('All');
  });

  test('sets clearValue, and shows only while the value differs from it', async () => {
    const onValueChange = vi.fn<OnValueChange>();
    function Controlled() {
      const [value, setValue] = useState(['revoked']);
      return (
        <StatusFilter
          multiple
          value={value}
          clearValue={['active']}
          onValueChange={(next, details) => {
            onValueChange(next, details);
            setValue(next);
          }}
        />
      );
    }
    const screen = await render(<Controlled />);
    const clear = screen.getByRole('button', {name: 'Clear Status filter'});

    await userEvent.click(clear);

    expect(onValueChange.mock.lastCall?.[0]).toEqual(['active']);
    expect(onValueChange.mock.lastCall?.[1].reason).toBe('clear-press');
    await expect.poll(() => screen.getByRole('combobox').element().textContent).toContain('Active');
    await expect.element(clear).not.toBeInTheDocument();
  });

  test('keeps the value and focus when onValueChange cancels', async () => {
    const screen = await render(
      <StatusFilter
        defaultValue="invited"
        onValueChange={(_, details) => {
          if (details.reason === 'clear-press') details.cancel();
        }}
      />,
    );
    const clear = screen.getByRole('button', {name: 'Clear Status filter'});

    await userEvent.click(clear);

    await expect
      .poll(() => screen.getByRole('combobox').element().textContent)
      .toContain('Invited');
    await expect.element(clear).toHaveFocus();
  });

  test('is the next tab stop after the trigger', async () => {
    const screen = await render(
      <>
        <StatusFilter defaultValue="invited" />
        <button type="button">Next</button>
      </>,
    );

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{Escape}');
    await expect.element(screen.getByRole('combobox')).toHaveFocus();
    await userEvent.tab();
    await expect.element(screen.getByRole('button', {name: 'Clear Status filter'})).toHaveFocus();
    await userEvent.tab();
    await expect.element(screen.getByRole('button', {name: 'Next'})).toHaveFocus();
  });

  test('is disabled inside a disabled Field', async () => {
    const screen = await render(
      <Field.Root disabled>
        <StatusFilter defaultValue="invited" />
      </Field.Root>,
    );

    await expect.element(screen.getByRole('button', {name: 'Clear Status filter'})).toBeDisabled();
  });
});

describe('Dropdown.ValueCount', () => {
  test('counts the selected values after the first, read as "and 1 more"', async () => {
    const screen = await render(<StatusFilter multiple defaultValue={['active', 'invited']} />);
    const trigger = screen.getByRole('combobox', {name: 'Status'});

    await expect
      .element(trigger.getByText('+1', {exact: true}))
      .toHaveAttribute('aria-hidden', 'true');
    await expect.element(trigger.getByText('and 1 more', {exact: true})).toBeInTheDocument();
  });
});

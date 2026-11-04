import {describe, expect, test} from 'vitest';
import {render} from 'vitest-browser-react';
import {page, userEvent} from 'vitest/browser';

import {Dropdown, type DropdownTriggerDensity} from '../src/index.ts';

const ranges = [
  {value: 'week', label: 'Last 7 days'},
  {value: 'month', label: 'Last 30 days'},
];

function DateRange({density}: {readonly density: DropdownTriggerDensity}) {
  return (
    <Dropdown.Root items={ranges} defaultValue="month">
      <Dropdown.Trigger density={density}>
        <Dropdown.Prefix>Date range</Dropdown.Prefix>
        <Dropdown.Value />
        <Dropdown.Icon />
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Positioner>
          <Dropdown.Popup>
            <Dropdown.List>
              {ranges.map((range) => (
                <Dropdown.Item key={range.value} value={range.value}>
                  <Dropdown.ItemText>{range.label}</Dropdown.ItemText>
                </Dropdown.Item>
              ))}
            </Dropdown.List>
          </Dropdown.Popup>
        </Dropdown.Positioner>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}

describe('Dropdown.Prefix', () => {
  test('names the trigger, without the colon it shows', async () => {
    const screen = await render(<DateRange density="default" />);
    const trigger = screen.getByRole('combobox', {name: 'Date range', exact: true});
    const label = screen.getByText('Date range', {exact: true});

    await expect.element(trigger).toHaveAccessibleName('Date range');
    expect(trigger.element().getAttribute('aria-labelledby')).toBe(label.element().id);
  });

  // The default trigger leaves the prefix uncovered; the compact one covers it with its overlay.
  test.each<DropdownTriggerDensity>(['default', 'compact'])(
    'a held press on the prefix opens the popup (%s)',
    async (density) => {
      const screen = await render(<DateRange density={density} />);
      await userEvent.click(screen.getByText('Date range', {exact: true}), {delay: 150});

      await expect.element(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
      await expect.element(page.getByRole('option', {name: 'Last 7 days'})).toBeVisible();
    },
  );
});

describe('Dropdown.Trigger density="compact"', () => {
  test('is one line high and keeps a 28px touch target', async () => {
    // Room around the trigger for its overlay.
    const screen = await render(
      <div style={{padding: 16}}>
        <DateRange density="compact" />
      </div>,
    );
    const trigger = screen.getByRole('combobox').element();
    const {top, bottom, left, width, height} = trigger.getBoundingClientRect();
    const hits = (y: number) => trigger.contains(document.elementFromPoint(left + width / 2, y));

    // 24px; WebKit rounds the 19.99px line box down to 19px.
    expect(Math.abs(height - 24)).toBeLessThanOrEqual(1);
    expect([hits(top - 1), hits(bottom + 1)]).toEqual([true, true]);
    expect([hits(top - 3), hits(bottom + 3)]).toEqual([false, false]);
  });
});

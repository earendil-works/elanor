import {SegmentedControl, Stack} from '@earendil-works/elanor-react';

export default function SegmentedControlDensity() {
  return (
    <Stack direction="row" gap="large" wrap="wrap">
      {(['default', 'compact'] as const).map((density) => (
        <SegmentedControl.Root
          key={density}
          density={density}
          aria-label={density === 'default' ? 'Billing period, default' : 'Billing period, compact'}
          defaultValue={['monthly']}
        >
          <SegmentedControl.Item value="monthly">Monthly</SegmentedControl.Item>
          <SegmentedControl.Item value="yearly">Yearly</SegmentedControl.Item>
        </SegmentedControl.Root>
      ))}
    </Stack>
  );
}

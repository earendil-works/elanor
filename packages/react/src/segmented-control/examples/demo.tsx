import {Stack, Text, SegmentedControl} from '@earendil-works/elanor-react';
import {useState} from 'react';

export default function SegmentedControlDemo() {
  const [period, setPeriod] = useState(['monthly']);

  return (
    <Stack gap="small" align="start">
      <SegmentedControl.Root
        aria-label="Billing period"
        value={period}
        onValueChange={(next) => {
          if (next.length > 0) setPeriod(next);
        }}
      >
        <SegmentedControl.Item value="monthly">Monthly</SegmentedControl.Item>
        <SegmentedControl.Item value="yearly">Yearly</SegmentedControl.Item>
      </SegmentedControl.Root>
      <Text role="status">{period[0] === 'yearly' ? '$120 per year' : '$12 per month'}</Text>
    </Stack>
  );
}

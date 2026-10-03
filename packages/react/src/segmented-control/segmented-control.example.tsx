import {useState} from 'react';
import {Stack} from '../stack/stack.tsx';
import {Text} from '../text/text.tsx';
import {
  SegmentedControl,
  SegmentedControlItem,
} from './segmented-control.tsx';

export function SegmentedControlExample(): React.JSX.Element {
  const [period, setPeriod] = useState(['monthly']);

  return (
    <Stack gap="small" align="start">
      <SegmentedControl
        aria-label="Billing period"
        value={period}
        onValueChange={next => {
          if (next.length > 0) setPeriod(next);
        }}
      >
        <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
        <SegmentedControlItem value="yearly">Yearly</SegmentedControlItem>
      </SegmentedControl>
      <Text role="status">{period[0] === 'yearly' ? '$120 per year' : '$12 per month'}</Text>
    </Stack>
  );
}

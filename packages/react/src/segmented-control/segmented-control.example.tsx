import {
  SegmentedControl,
  SegmentedControlItem,
} from './segmented-control.tsx';

export function SegmentedControlExample(): React.JSX.Element {
  return (
    <SegmentedControl defaultValue={['overview']}>
      <SegmentedControlItem value="overview">Overview</SegmentedControlItem>
      <SegmentedControlItem value="activity">Activity</SegmentedControlItem>
    </SegmentedControl>
  );
}

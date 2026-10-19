import {Timeline} from '@earendil-works/elanor-react';

export default function TimelineDemo() {
  return (
    <Timeline.Root>
      <Timeline.Item title="Read package.json" description="42 lines" />
      <Timeline.Item title="Ran the tests" description="pnpm test" code />
      <Timeline.Item status="running" title="Fixing the failing test" />
    </Timeline.Root>
  );
}

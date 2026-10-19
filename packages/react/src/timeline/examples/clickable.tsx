import {Timeline} from '@earendil-works/elanor-react';

export default function TimelineClickable() {
  return (
    <Timeline.Root>
      <Timeline.Item title="Searched the docs" description="drawer swipe" onClick={() => {}} />
      <Timeline.Item title="Read drawer.tsx" description="227 lines" onClick={() => {}} />
      <Timeline.Item status="running" title="Writing the summary" onClick={() => {}} />
    </Timeline.Root>
  );
}

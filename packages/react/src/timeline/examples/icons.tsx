import {DescriptionIcon, EditIcon, TerminalIcon} from '@earendil-works/elanor-icons-react';
import {Timeline} from '@earendil-works/elanor-react';

export default function TimelineIcons() {
  return (
    <Timeline.Root>
      <Timeline.Item icon={<DescriptionIcon />} title="Read button.tsx" description="src/button" />
      <Timeline.Item icon={<EditIcon />} title="Edited button.tsx" description="+12 −3" />
      <Timeline.Item
        icon={<TerminalIcon />}
        status="error"
        title="Ran the build"
        description="error TS2322: Type 'string' is not assignable to type 'number'."
        code
      />
    </Timeline.Root>
  );
}

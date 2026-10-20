import {CheckIcon, DescriptionIcon, EditIcon} from '@earendil-works/elanor-icons-react';
import {Stack, Text, Ticker} from '@earendil-works/elanor-react';
import {useState} from 'react';

const STEPS = [
  {id: 'read', icon: <DescriptionIcon />, label: 'Read button.tsx'},
  {id: 'edit', icon: <EditIcon />, label: 'Edited button.tsx'},
  {id: 'done', icon: <CheckIcon />, label: 'Done in 42 seconds'},
];

export default function TickerActivate() {
  const [opened, setOpened] = useState('nothing yet');
  return (
    <Stack gap="medium" align="stretch">
      <Ticker.Root onActivate={(key) => setOpened(key ?? 'the newest item')}>
        {STEPS.map((step) => (
          <Ticker.Item key={step.id} label={step.label}>
            {step.icon}
            <span>{step.label}</span>
          </Ticker.Item>
        ))}
      </Ticker.Root>
      <Text>Opened: {opened}</Text>
    </Stack>
  );
}

import {Button, Stack, Timeline} from '@earendil-works/elanor-react';
import {useState} from 'react';

export default function TimelineLive() {
  const [steps, setSteps] = useState(['Planned the change']);
  return (
    <Stack gap="medium" align="start">
      <Timeline.Root>
        {steps.map((step, index) => (
          <Timeline.Item
            key={step}
            status={index === steps.length - 1 ? 'running' : 'done'}
            title={step}
          />
        ))}
      </Timeline.Root>
      <Button
        hierarchy="secondary"
        onClick={() => setSteps([...steps, `Step ${steps.length + 1}`])}
      >
        Add a step
      </Button>
    </Stack>
  );
}

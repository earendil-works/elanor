import {AddIcon, ArrowForwardIcon} from '@earendil-works/elanor-icons-react';
import {useState} from 'react';
import {Stack} from '../stack/stack.tsx';
import {Text} from '../text/text.tsx';
import {Button} from './button.tsx';

export function ButtonExample(): React.JSX.Element {
  const [taskCount, setTaskCount] = useState(0);

  return (
    <Stack gap="small" align="start">
      <Stack direction="row" gap="small" align="center" wrap="wrap">
        <Button iconStart={<AddIcon />} onClick={() => setTaskCount(count => count + 1)}>
          Add draft task
        </Button>
        <Button hierarchy="secondary" density="compact" disabled={taskCount === 0} onClick={() => setTaskCount(0)}>
          Reset
        </Button>
        <Button hierarchy="secondary" iconEnd={<ArrowForwardIcon />} render={<a href="/components/input" aria-label="Explore inputs" />} nativeButton={false}>
          Explore inputs
        </Button>
      </Stack>
      <Text role="status">Draft tasks: {taskCount}</Text>
    </Stack>
  );
}

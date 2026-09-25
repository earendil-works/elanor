import {AddIcon} from '@earendil-works/elanor-icons/react/add';
import {Button} from './button.tsx';
import {Heading} from '../heading/heading.tsx';
import { Stack } from '../stack/stack.tsx';

export function ButtonExample(): React.JSX.Element {
  return (
    <Stack gap="large" align="start">
      <Stack gap="small" align="start">
        <Heading level={2}>Default</Heading>
        <Stack direction="row" gap="small" align="center">
          <Button>Continue</Button>
          <Button iconStart={<AddIcon />}>Create</Button>
          <Button iconEnd={<AddIcon />}>Create</Button>
        </Stack>
      </Stack>
      <Stack gap="small" align="start">
        <Heading level={2}>Compact</Heading>
        <Stack direction="row" gap="small" align="center">
          <Button density="compact">Continue</Button>
          <Button density="compact" iconStart={<AddIcon />}>Create</Button>
          <Button density="compact" iconEnd={<AddIcon />}>Create</Button>
        </Stack>
      </Stack>
    </Stack>
  );
}

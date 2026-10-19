import {CheckIcon, ErrorIcon} from '@earendil-works/elanor-icons-react';
import {Button, Stack, Ticker} from '@earendil-works/elanor-react';
import {useState} from 'react';

export default function TickerNegative() {
  const [failed, setFailed] = useState(false);
  return (
    <Stack gap="medium" align="stretch">
      <Ticker.Root>
        <Ticker.Item key="tests" label="Ran the tests">
          <CheckIcon />
          <span>Ran the tests</span>
        </Ticker.Item>
        {failed && (
          <Ticker.Item key="build" label="The build failed" negative>
            <ErrorIcon />
            <span>The build failed</span>
          </Ticker.Item>
        )}
      </Ticker.Root>
      <Button hierarchy="secondary" onClick={() => setFailed(!failed)}>
        {failed ? 'Reset' : 'Run the build'}
      </Button>
    </Stack>
  );
}

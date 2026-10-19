import {CheckIcon, EditIcon} from '@earendil-works/elanor-icons-react';
import {Ticker} from '@earendil-works/elanor-react';

export default function TickerSettled() {
  return (
    <Ticker.Root settled>
      <Ticker.Item key="edit" label="Edited 3 files">
        <EditIcon />
        <span>Edited 3 files</span>
      </Ticker.Item>
      <Ticker.Item key="done" label="Done in 42 seconds">
        <CheckIcon />
        <span>Done in 42 seconds</span>
      </Ticker.Item>
    </Ticker.Root>
  );
}

import {Message} from '@earendil-works/elanor-react';

import {PICTURES} from './pictures.ts';

export default function MessageImages() {
  return (
    <Message.Root participant={1}>
      <Message.Bubble>
        <Message.Speaker>Ben</Message.Speaker>
        <Message.Images images={PICTURES.slice(0, 3)} />
        <Message.Text>Three views from the trip.</Message.Text>
      </Message.Bubble>
    </Message.Root>
  );
}

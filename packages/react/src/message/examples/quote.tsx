import {Message} from '@earendil-works/elanor-react';

export default function MessageQuoteDemo() {
  return (
    <Message.Root align="end">
      <Message.Bubble>
        <Message.Quote author="Anna">
          The image preview is cut off at the bottom on Android.
        </Message.Quote>
        <Message.Text>Good catch, I'll take a look.</Message.Text>
      </Message.Bubble>
    </Message.Root>
  );
}

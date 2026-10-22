import {SmartToyIcon} from '@earendil-works/elanor-icons-react';
import {Mention, Message, Stack} from '@earendil-works/elanor-react';

export default function MessageDemo() {
  return (
    <Stack gap="medium">
      <Message.Root participant={2}>
        <Message.Bubble>
          <Message.Speaker>Anna</Message.Speaker>
          <Message.Text>The image preview is cut off at the bottom on Android.</Message.Text>
        </Message.Bubble>
      </Message.Root>
      <Message.Root align="end">
        <Message.Bubble>
          <Message.Text>
            <Mention>@pi</Mention> can you fix it?
          </Message.Text>
        </Message.Bubble>
      </Message.Root>
      <Message.Root participant={5}>
        <Message.Bubble>
          <Message.Speaker render={(props) => <button type="button" {...props} />}>
            <SmartToyIcon />
            Docs site
          </Message.Speaker>
          <Message.Text>
            The docs site uses the same image component. Please keep it compatible.
          </Message.Text>
        </Message.Bubble>
      </Message.Root>
    </Stack>
  );
}

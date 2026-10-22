import {Message} from '@earendil-works/elanor-react';

export default function MessageFiles() {
  return (
    <Message.Root align="end">
      <Message.Bubble>
        <Message.Text>These two files are the ones that changed.</Message.Text>
        <Message.Files>
          <Message.File>src/web/people/people.css</Message.File>
          <Message.File>src/web/people/PersonMessage.tsx</Message.File>
        </Message.Files>
      </Message.Bubble>
      <Message.Note>Edited</Message.Note>
    </Message.Root>
  );
}

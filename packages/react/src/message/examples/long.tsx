import {Message} from '@earendil-works/elanor-react';

export default function MessageLong() {
  return (
    <Message.Root align="end">
      <Message.Bubble>
        <Message.Text lines={4}>
          The upload test is flaky on CI. It stores an upload and lists it right after, but the list
          is sometimes empty. store() resolves when the request ends, which can be before the file
          is written, so the listing races the write. Locally it fails about once in twenty runs, on
          CI more often, probably because the disk is slower there. Could we wait for the file
          stream to finish before resolving, or list with a retry?
        </Message.Text>
      </Message.Bubble>
    </Message.Root>
  );
}

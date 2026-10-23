import {InlineCode} from '@earendil-works/elanor-react';

/** Text with backtick-quoted parts as inline code, as written in token and component descriptions. */
export function CodeText({text}: {readonly text: string}): React.JSX.Element {
  return (
    <>
      {text
        .split('`')
        .map((part, index) =>
          index % 2 === 1 ? <InlineCode key={index}>{part}</InlineCode> : part,
        )}
    </>
  );
}

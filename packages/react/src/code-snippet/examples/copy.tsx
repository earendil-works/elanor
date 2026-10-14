import {CodeSnippet, CopyButton} from '@earendil-works/elanor-react';

const command = 'pnpm add @earendil-works/elanor-react';

export default function CodeSnippetCopy() {
  return (
    <CodeSnippet actions={<CopyButton value={command} aria-label="Copy command" />}>
      {command}
    </CodeSnippet>
  );
}

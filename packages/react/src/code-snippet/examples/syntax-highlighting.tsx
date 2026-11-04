import {
  CodeSnippet,
  CopyButton,
  HighlightedCode,
  useHighlightedCode,
} from '@earendil-works/elanor-react';

import {highlighter} from './highlighter.ts';

const code = `import {Button} from '@earendil-works/elanor-react';

export function Save({count}: {count: number}) {
  // Disabled until something changes.
  return <Button disabled={count === 0}>Save {count} changes</Button>;
}`;

export default function CodeSnippetSyntaxHighlighting() {
  const lines = useHighlightedCode(code, 'tsx', highlighter);
  return (
    <CodeSnippet actions={<CopyButton value={code} aria-label="Copy code" />}>
      {lines ? <HighlightedCode lines={lines} /> : code}
    </CodeSnippet>
  );
}

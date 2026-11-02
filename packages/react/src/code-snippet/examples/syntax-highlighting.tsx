import {CodeSnippet, CopyButton} from '@earendil-works/elanor-react';

const code = `import {Button} from '@earendil-works/elanor-react';

export function Save({count}: {count: number}) {
  // Disabled until something changes.
  return <Button disabled={count === 0}>Save {count} changes</Button>;
}`;

export default function CodeSnippetSyntaxHighlighting() {
  return (
    <CodeSnippet language="tsx" actions={<CopyButton value={code} aria-label="Copy code" />}>
      {code}
    </CodeSnippet>
  );
}

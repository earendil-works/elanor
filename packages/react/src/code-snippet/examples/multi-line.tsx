import {CodeSnippet, CopyButton} from '@earendil-works/elanor-react';

const code = `import {Button} from '@earendil-works/elanor-react';

export function Save() {
  return <Button>Save changes</Button>;
}`;

export default function CodeSnippetMultiLine() {
  return (
    <CodeSnippet actions={<CopyButton value={code} aria-label="Copy code" />}>{code}</CodeSnippet>
  );
}

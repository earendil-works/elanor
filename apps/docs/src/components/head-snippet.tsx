import {CodeSnippet, CopyButton} from '@earendil-works/elanor-react';

interface HeadSnippetProps {
  readonly code: string;
}

/** The favicon `<head>` tags, with a copy button. */
export function HeadSnippet({code}: HeadSnippetProps): React.JSX.Element {
  return (
    <CodeSnippet actions={<CopyButton value={code} aria-label="Copy the head tags" />}>
      {code}
    </CodeSnippet>
  );
}

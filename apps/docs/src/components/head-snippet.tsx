import {CodeSnippet, CopyButton} from '@earendil-works/elanor-react';

import {HighlightedCode} from './highlighted-code.tsx';

interface HeadSnippetProps {
  readonly code: string;
  /** `code`, highlighted. */
  readonly html: string;
}

/** The favicon `<head>` tags, with a copy button. */
export function HeadSnippet({code, html}: HeadSnippetProps): React.JSX.Element {
  return (
    <CodeSnippet actions={<CopyButton value={code} aria-label="Copy the head tags" />}>
      <HighlightedCode html={html} />
    </CodeSnippet>
  );
}

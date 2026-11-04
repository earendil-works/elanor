import {
  CodeSnippet,
  CopyButton,
  HighlightedCode,
  type HighlightedLines,
} from '@earendil-works/elanor-react';

interface HeadSnippetProps {
  readonly code: string;
  /** `code`, highlighted. */
  readonly lines: HighlightedLines;
}

/** The favicon `<head>` tags, with a copy button. */
export function HeadSnippet({code, lines}: HeadSnippetProps): React.JSX.Element {
  return (
    <CodeSnippet actions={<CopyButton value={code} aria-label="Copy the head tags" />}>
      <HighlightedCode lines={lines} />
    </CodeSnippet>
  );
}

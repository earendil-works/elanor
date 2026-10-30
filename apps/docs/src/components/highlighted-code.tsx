/** Lines highlighted by `lib/highlight.ts`, as the content of a `CodeSnippet`. */
export function HighlightedCode({html}: {readonly html: string}): React.JSX.Element {
  return <span dangerouslySetInnerHTML={{__html: html}} />;
}

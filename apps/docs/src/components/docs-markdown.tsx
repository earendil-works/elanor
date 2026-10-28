import {
  Blockquote,
  CodeSnippet,
  CopyButton,
  Emphasis,
  Heading,
  Image,
  InlineCode,
  Link,
  LinkedHeading,
  List,
  Separator,
  Strong,
  Table,
  Text,
} from '@earendil-works/elanor-react';
import type {ComponentProps, CSSProperties} from 'react';

import {childrenHtml, type InnerHtml} from '../lib/astro-children.ts';

/*
 * Markdown elements as Elanor components, for the `components` prop of MDX content. Each sets the
 * HTML of its rendered children as its inner HTML (see `lib/astro-children.ts`).
 */

function textOf(html: InnerHtml | undefined): string {
  return decodeEntities((html?.__html ?? '').replace(/<[^>]*>/g, ''));
}

function decodeEntities(text: string): string {
  return text.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (_, entity: string) => {
    const lower = entity.toLowerCase();
    if (lower.startsWith('#x')) return String.fromCodePoint(Number.parseInt(lower.slice(2), 16));
    if (lower.startsWith('#')) return String.fromCodePoint(Number.parseInt(lower.slice(1), 10));
    return {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0'}[lower] ?? '';
  });
}

/** Leaves out the content's H1, for pages that render the title themselves. */
export function OmittedTitle(): React.JSX.Element {
  // An element, not `null`, so Astro recognizes a React component.
  return <></>;
}

type HeadingLevel = 2 | 3 | 4 | 5 | 6;

function heading(level: HeadingLevel) {
  return function DocsHeading({children, id, ...props}: ComponentProps<'h2'>) {
    const html = childrenHtml(children);
    if (!id)
      return <Heading {...props} level={level} size={level} dangerouslySetInnerHTML={html} />;
    return (
      <LinkedHeading
        {...props}
        id={id}
        level={level}
        size={level}
        linkLabel={`Copy link to ${textOf(html)}`}
      >
        <span dangerouslySetInnerHTML={html} />
      </LinkedHeading>
    );
  };
}

/** Maps GFM column alignment, an inline `text-align`, to the table's logical alignment. */
function align(style: CSSProperties | string | undefined): 'start' | 'center' | 'end' {
  const value =
    typeof style === 'string' ? /text-align:\s*(\w+)/.exec(style)?.[1] : style?.textAlign;
  return value === 'center' ? 'center' : value === 'right' ? 'end' : 'start';
}

/**
 * A code block as a `CodeSnippet` with a copy button. The block's `code` element (rendered by
 * `InlineCode` like any other) is replaced by the snippet's own; its highlighted lines stay.
 */
function CodeBlock({
  children,
  'data-language': language,
}: ComponentProps<'pre'> & {'data-language'?: string}) {
  const code = childrenHtml(children);
  const lines = {__html: code?.__html.replace(/^<code\b[^>]*>|<\/code>$/g, '') ?? ''};
  return (
    <CodeSnippet
      data-language={language}
      actions={<CopyButton value={textOf(lines)} aria-label="Copy code" />}
    >
      <span dangerouslySetInnerHTML={lines} />
    </CodeSnippet>
  );
}

export const docsMarkdownComponents = {
  pre: CodeBlock,
  code: ({children, ...props}: ComponentProps<'code'>) => (
    <InlineCode {...props} dangerouslySetInnerHTML={childrenHtml(children)} />
  ),
  p: ({children, ...props}: ComponentProps<'p'>) => (
    <Text {...props} dangerouslySetInnerHTML={childrenHtml(children)} />
  ),
  ul: ({children, ...props}: ComponentProps<'ul'>) => (
    <List.Root {...props} dangerouslySetInnerHTML={childrenHtml(children)} />
  ),
  ol: ({children, ...props}: ComponentProps<'ol'>) => (
    <List.Root {...props} render={<ol />} dangerouslySetInnerHTML={childrenHtml(children)} />
  ),
  li: ({children, ...props}: ComponentProps<'li'>) => (
    <List.Item {...props} dangerouslySetInnerHTML={childrenHtml(children)} />
  ),
  a: ({children, ...props}: ComponentProps<'a'>) => (
    <Link {...props} dangerouslySetInnerHTML={childrenHtml(children)} />
  ),
  hr: () => <Separator />,
  strong: ({children, ...props}: ComponentProps<'strong'>) => (
    <Strong {...props} dangerouslySetInnerHTML={childrenHtml(children)} />
  ),
  em: ({children, ...props}: ComponentProps<'em'>) => (
    <Emphasis {...props} dangerouslySetInnerHTML={childrenHtml(children)} />
  ),
  blockquote: ({children, ...props}: ComponentProps<'blockquote'>) => (
    <Blockquote {...props} dangerouslySetInnerHTML={childrenHtml(children)} />
  ),
  img: ({alt = '', ...props}: ComponentProps<'img'>) => <Image {...props} alt={alt} />,
  table: ({children, ...props}: ComponentProps<'table'>) => (
    <Table.Container>
      <Table.Root {...props} dangerouslySetInnerHTML={childrenHtml(children)} />
    </Table.Container>
  ),
  thead: ({children, ...props}: ComponentProps<'thead'>) => (
    <Table.Head {...props} dangerouslySetInnerHTML={childrenHtml(children)} />
  ),
  tbody: ({children, ...props}: ComponentProps<'tbody'>) => (
    <Table.Body {...props} dangerouslySetInnerHTML={childrenHtml(children)} />
  ),
  tr: ({children, ...props}: ComponentProps<'tr'>) => (
    <Table.Row {...props} dangerouslySetInnerHTML={childrenHtml(children)} />
  ),
  th: ({children, style, ...props}: ComponentProps<'th'>) => (
    <Table.HeaderCell
      {...props}
      scope="col"
      align={align(style)}
      dangerouslySetInnerHTML={childrenHtml(children)}
    />
  ),
  td: ({children, style, ...props}: ComponentProps<'td'>) => (
    <Table.Cell {...props} align={align(style)} dangerouslySetInnerHTML={childrenHtml(children)} />
  ),
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  h5: heading(5),
  h6: heading(6),
};

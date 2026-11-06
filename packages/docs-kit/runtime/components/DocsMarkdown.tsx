/** @jsxImportSource react */
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
import type {Root} from 'hast';
import {toJsxRuntime, type Components} from 'hast-util-to-jsx-runtime';
import {isValidElement, type ComponentProps, type CSSProperties, type ReactNode} from 'react';
import {Fragment, jsx, jsxs} from 'react/jsx-runtime';

import type {AlertType} from '../content/markdown.ts';

/*
 * A page's Markdown (`content/markdown.ts`) as Elanor's components: headings with links to copy,
 * code in `CodeSnippet` with a copy button, tables in `Table`, and GitHub's alerts as quotes with
 * their label.
 */

type HeadingLevel = 2 | 3 | 4 | 5 | 6;

const alertLabels: Record<AlertType, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
};

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{children?: ReactNode}>(node)) return textOf(node.props.children);
  return '';
}

function heading(level: HeadingLevel) {
  return function DocsHeading({children, id, ...props}: ComponentProps<'h2'>) {
    if (!id) {
      return (
        <Heading {...props} level={level} size={level}>
          {children}
        </Heading>
      );
    }
    return (
      <LinkedHeading
        {...props}
        id={id}
        level={level}
        size={level}
        linkLabel={`Copy link to ${textOf(children)}`}
      >
        {children}
      </LinkedHeading>
    );
  };
}

/** Maps GFM column alignment, an inline `text-align`, to the table's logical alignment. */
function align(style: CSSProperties | undefined): 'start' | 'center' | 'end' {
  const value = style?.textAlign;
  return value === 'center' ? 'center' : value === 'right' ? 'end' : 'start';
}

/** A code block: Shiki's tokens in a `CodeSnippet`, with a button that copies the code. */
function CodeBlock({
  children,
  'data-language': language,
  'data-code': code,
}: ComponentProps<'pre'> & {'data-language'?: string; 'data-code'?: string}) {
  const highlighted = isValidElement<{children?: ReactNode}>(children)
    ? children.props.children
    : children;
  return (
    <CodeSnippet
      data-language={language}
      actions={code ? <CopyButton value={code} aria-label="Copy code" /> : undefined}
    >
      {highlighted}
    </CodeSnippet>
  );
}

/** A quote, or an alert: GitHub's (`> [!NOTE]`) or Python-Markdown's admonitions, with a title. */
function Quote({
  children,
  'data-alert': alert,
  'data-title': title,
  ...props
}: ComponentProps<'blockquote'> & {'data-alert'?: AlertType; 'data-title'?: string}) {
  if (!alert) return <Blockquote {...props}>{children}</Blockquote>;
  return (
    <Blockquote {...props} className="docs-alert" data-alert={alert}>
      {/* An admonition with an empty title (`!!! note ""`) has none. */}
      {title === '' ? null : (
        <Text className="docs-alert-label">
          <Strong>{title ?? alertLabels[alert]}</Strong>
        </Text>
      )}
      {children}
    </Blockquote>
  );
}

const components: Partial<Components> = {
  pre: CodeBlock as Components['pre'],
  code: ({children, ...props}) => <InlineCode {...props}>{children}</InlineCode>,
  p: ({children, ...props}) => <Text {...props}>{children}</Text>,
  ul: ({children, ...props}) => <List.Root {...props}>{children}</List.Root>,
  ol: ({children, ...props}) => (
    <List.Root {...props} render={<ol />}>
      {children}
    </List.Root>
  ),
  li: ({children, ...props}) => <List.Item {...props}>{children}</List.Item>,
  a: ({children, ...props}) =>
    props.href ? <Link {...props}>{children}</Link> : <a {...props}>{children}</a>,
  hr: () => <Separator />,
  strong: ({children, ...props}) => <Strong {...props}>{children}</Strong>,
  em: ({children, ...props}) => <Emphasis {...props}>{children}</Emphasis>,
  blockquote: Quote as Components['blockquote'],
  img: ({alt = '', ...props}) => <Image {...props} alt={alt} />,
  table: ({children, ...props}) => (
    <Table.Container>
      <Table.Root {...props}>{children}</Table.Root>
    </Table.Container>
  ),
  thead: ({children, ...props}) => <Table.Head {...props}>{children}</Table.Head>,
  tbody: ({children, ...props}) => <Table.Body {...props}>{children}</Table.Body>,
  tr: ({children, ...props}) => <Table.Row {...props}>{children}</Table.Row>,
  th: ({children, style, ...props}) => (
    <Table.HeaderCell {...props} scope="col" align={align(style)}>
      {children}
    </Table.HeaderCell>
  ),
  td: ({children, style, ...props}) => (
    <Table.Cell {...props} align={align(style)}>
      {children}
    </Table.Cell>
  ),
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  h5: heading(5),
  h6: heading(6),
};

export function DocsMarkdown({tree}: {readonly tree: Root}): React.JSX.Element {
  return toJsxRuntime(tree, {Fragment, jsx, jsxs, components}) as React.JSX.Element;
}

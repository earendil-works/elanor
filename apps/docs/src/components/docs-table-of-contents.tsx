import {TableOfContents} from '@earendil-works/elanor-react';

/*
 * A page's table of contents on Elanor's static parts: a column beside the article on wide
 * screens, and a sticky menu above it on narrower ones. Their behaviors mark the section in view.
 */

export interface DocsTocEntry {
  readonly depth: number;
  readonly id: string;
  readonly title: string;
}

interface DocsTocNode extends DocsTocEntry {
  readonly children: DocsTocNode[];
}

function nest(entries: readonly DocsTocEntry[]): DocsTocNode[] {
  const roots: DocsTocNode[] = [];
  const stack: DocsTocNode[] = [];
  for (const entry of entries) {
    const node: DocsTocNode = {...entry, children: []};
    while (stack.length && stack[stack.length - 1]!.depth >= node.depth) stack.pop();
    (stack[stack.length - 1]?.children ?? roots).push(node);
    stack.push(node);
  }
  return roots;
}

function Items({entries}: {readonly entries: readonly DocsTocNode[]}) {
  return entries.map((entry) => (
    <TableOfContents.Item key={entry.id}>
      <TableOfContents.Link href={`#${entry.id}`}>{entry.title}</TableOfContents.Link>
      {entry.children.length > 0 ? (
        <TableOfContents.List>
          <Items entries={entry.children} />
        </TableOfContents.List>
      ) : null}
    </TableOfContents.Item>
  ));
}

interface DocsTableOfContentsProps {
  readonly entries: readonly DocsTocEntry[];
}

/** The column beside the article. */
export function DocsTableOfContents({entries}: DocsTableOfContentsProps): React.JSX.Element {
  return (
    <div className="docs-toc-column">
      <TableOfContents.StaticRoot className="docs-toc">
        <TableOfContents.List>
          <Items entries={nest(entries)} />
        </TableOfContents.List>
        <TableOfContents.Indicator />
      </TableOfContents.StaticRoot>
    </div>
  );
}

/** The sticky menu above the article. */
export function DocsTableOfContentsMenu({entries}: DocsTableOfContentsProps): React.JSX.Element {
  return (
    <TableOfContents.StaticMenu className="docs-toc-menu">
      <TableOfContents.StaticMenuTrigger>{entries[0]?.title}</TableOfContents.StaticMenuTrigger>
      <TableOfContents.StaticMenuPopup>
        <TableOfContents.List>
          <Items entries={nest(entries)} />
        </TableOfContents.List>
      </TableOfContents.StaticMenuPopup>
    </TableOfContents.StaticMenu>
  );
}

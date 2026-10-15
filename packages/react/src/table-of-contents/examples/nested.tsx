import {TableOfContents} from '@earendil-works/elanor-react';

export default function TableOfContentsNested() {
  return (
    <TableOfContents.Root>
      <TableOfContents.Item>
        <TableOfContents.Link href="#usage">Usage</TableOfContents.Link>
      </TableOfContents.Item>
      <TableOfContents.Item>
        <TableOfContents.Link href="#current-section">Current section</TableOfContents.Link>
      </TableOfContents.Item>
      <TableOfContents.Item>
        <TableOfContents.Link href="#nested-sections">Nested sections</TableOfContents.Link>
        <TableOfContents.List>
          <TableOfContents.Item>
            <TableOfContents.Link href="#without-a-title" active>
              Without a title
            </TableOfContents.Link>
          </TableOfContents.Item>
        </TableOfContents.List>
      </TableOfContents.Item>
    </TableOfContents.Root>
  );
}

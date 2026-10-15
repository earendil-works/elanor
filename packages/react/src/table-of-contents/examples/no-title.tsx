import {TableOfContents} from '@earendil-works/elanor-react';

export default function TableOfContentsNoTitle() {
  return (
    <TableOfContents.Root title={null}>
      <TableOfContents.Item>
        <TableOfContents.Link href="#usage" active>
          Usage
        </TableOfContents.Link>
      </TableOfContents.Item>
      <TableOfContents.Item>
        <TableOfContents.Link href="#current-section">Current section</TableOfContents.Link>
      </TableOfContents.Item>
    </TableOfContents.Root>
  );
}

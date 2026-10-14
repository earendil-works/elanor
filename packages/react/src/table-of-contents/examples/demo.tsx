import {TableOfContents} from '@earendil-works/elanor-react';

export default function TableOfContentsDemo() {
  return (
    <TableOfContents.Root>
      <TableOfContents.Item>
        <TableOfContents.Link href="#usage">Usage</TableOfContents.Link>
      </TableOfContents.Item>
      <TableOfContents.Item>
        <TableOfContents.Link href="#current-section">Current section</TableOfContents.Link>
      </TableOfContents.Item>
      <TableOfContents.Item>
        <TableOfContents.Link href="#api">API</TableOfContents.Link>
      </TableOfContents.Item>
    </TableOfContents.Root>
  );
}

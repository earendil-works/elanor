import {TableOfContentsMenu} from '@earendil-works/elanor-react';

export default function TableOfContentsMenuDemo() {
  return (
    <TableOfContentsMenu.Root>
      <TableOfContentsMenu.Trigger>Usage</TableOfContentsMenu.Trigger>
      <TableOfContentsMenu.Popup>
        <TableOfContentsMenu.Item>
          <TableOfContentsMenu.Link href="#usage" active>
            Usage
          </TableOfContentsMenu.Link>
        </TableOfContentsMenu.Item>
        <TableOfContentsMenu.Item>
          <TableOfContentsMenu.Link href="#sticky-bar">Sticky bar</TableOfContentsMenu.Link>
          <TableOfContentsMenu.List>
            <TableOfContentsMenu.Item>
              <TableOfContentsMenu.Link href="#below-a-header">
                Below a header
              </TableOfContentsMenu.Link>
            </TableOfContentsMenu.Item>
          </TableOfContentsMenu.List>
        </TableOfContentsMenu.Item>
      </TableOfContentsMenu.Popup>
    </TableOfContentsMenu.Root>
  );
}

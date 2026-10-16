import {TableOfContents} from '@earendil-works/elanor-react';
import {useState} from 'react';

const sections = [
  {id: 'usage', title: 'Usage'},
  {id: 'current-section', title: 'Current section'},
  {id: 'nested-sections', title: 'Nested sections'},
  {id: 'menu', title: 'Menu'},
];

export default function TableOfContentsMenuDemo() {
  const [active, setActive] = useState('menu');
  const current = sections.find((section) => section.id === active);
  return (
    <TableOfContents.Menu>
      <TableOfContents.MenuTrigger>{current?.title}</TableOfContents.MenuTrigger>
      <TableOfContents.MenuPopup>
        <TableOfContents.List>
          {sections.map((section) => (
            <TableOfContents.Item key={section.id}>
              <TableOfContents.Link
                href={`#${section.id}`}
                active={section.id === active}
                onClick={() => setActive(section.id)}
              >
                {section.title}
              </TableOfContents.Link>
            </TableOfContents.Item>
          ))}
        </TableOfContents.List>
      </TableOfContents.MenuPopup>
    </TableOfContents.Menu>
  );
}

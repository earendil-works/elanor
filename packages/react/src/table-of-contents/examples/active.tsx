import {TableOfContents} from '@earendil-works/elanor-react';
import {useState} from 'react';

const sections = [
  {id: 'usage', title: 'Usage'},
  {id: 'current-section', title: 'Current section'},
  {id: 'nested-sections', title: 'Nested sections'},
  {id: 'api', title: 'API'},
];

export default function TableOfContentsActive() {
  const [active, setActive] = useState('current-section');
  return (
    <TableOfContents.Root>
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
    </TableOfContents.Root>
  );
}

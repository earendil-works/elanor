import {
  Button,
  FileTree,
  Stack,
  type FileTreeItemState,
  type FileTreeNode,
} from '@earendil-works/elanor-react';
import {useCallback, useState} from 'react';

const items: FileTreeNode[] = [
  {
    id: 'reports',
    name: 'reports',
    children: [
      {
        id: 'reports/2026',
        name: '2026',
        children: [
          {id: 'reports/2026/q1.pdf', name: 'q1.pdf'},
          {id: 'reports/2026/q2.pdf', name: 'q2.pdf'},
        ],
      },
      {id: 'reports/summary.md', name: 'summary.md'},
    ],
  },
  {
    id: 'data',
    name: 'data',
    children: [{id: 'data/results.csv', name: 'results.csv'}],
  },
];

const folderIds = ['reports', 'reports/2026', 'data'];

export default function FileTreeControlled() {
  const [expanded, setExpanded] = useState<string[]>(['reports']);
  const renderItem = useCallback(
    ({node}: FileTreeItemState) => (
      <FileTree.Item>
        <FileTree.ItemIcon />
        <FileTree.ItemLabel>{node.name}</FileTree.ItemLabel>
      </FileTree.Item>
    ),
    [],
  );
  return (
    <Stack gap="medium">
      <Stack direction="row" gap="small">
        <Button hierarchy="secondary" onClick={() => setExpanded(folderIds)}>
          Expand all
        </Button>
        <Button hierarchy="secondary" onClick={() => setExpanded([])}>
          Collapse all
        </Button>
      </Stack>
      <div style={{inlineSize: 260}}>
        <FileTree.Root
          aria-label="Files"
          items={items}
          expanded={expanded}
          onExpandedChange={setExpanded}
        >
          {renderItem}
        </FileTree.Root>
      </div>
    </Stack>
  );
}

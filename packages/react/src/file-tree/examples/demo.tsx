import {FileTree, type FileTreeItemState, type FileTreeNode} from '@earendil-works/elanor-react';
import {useCallback, useState, type MouseEvent} from 'react';

const items: FileTreeNode[] = [
  {
    id: 'docs',
    name: 'docs',
    children: [
      {
        id: 'docs/guides',
        name: 'guides',
        children: [{id: 'docs/guides/getting-started.md', name: 'getting-started.md'}],
      },
      {
        id: 'docs/a-very-long-file-name-that-does-not-fit-the-panel.md',
        name: 'a-very-long-file-name-that-does-not-fit-the-panel.md',
      },
    ],
  },
  {
    id: 'src',
    name: 'src',
    children: [
      {id: 'src/index.html', name: 'index.html'},
      {id: 'src/styles.css', name: 'styles.css'},
    ],
  },
  {id: 'README.md', name: 'README.md'},
];

export default function FileTreeDemo() {
  const [current, setCurrent] = useState('src/index.html');
  const renderItem = useCallback(({node, isFolder}: FileTreeItemState) => {
    const select = (event: MouseEvent) => {
      event.preventDefault();
      setCurrent(node.id);
    };
    return (
      <FileTree.Item render={isFolder ? undefined : <a href={`#${node.id}`} onClick={select} />}>
        <FileTree.ItemIcon />
        <FileTree.ItemLabel>{node.name}</FileTree.ItemLabel>
      </FileTree.Item>
    );
  }, []);
  return (
    <div style={{inlineSize: 260}}>
      <FileTree.Root aria-label="Files" items={items} currentId={current}>
        {renderItem}
      </FileTree.Root>
    </div>
  );
}

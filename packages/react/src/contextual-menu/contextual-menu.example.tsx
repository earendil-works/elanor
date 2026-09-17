import {ContextualMenu} from './contextual-menu.tsx';

export function ContextualMenuExample(): React.JSX.Element {
  return (
    <ContextualMenu.Root>
      <ContextualMenu.Trigger>Actions</ContextualMenu.Trigger>
      <ContextualMenu.Portal>
        <ContextualMenu.Positioner>
          <ContextualMenu.Popup>
            <ContextualMenu.Item>Rename</ContextualMenu.Item>
            <ContextualMenu.Item>Delete</ContextualMenu.Item>
          </ContextualMenu.Popup>
        </ContextualMenu.Positioner>
      </ContextualMenu.Portal>
    </ContextualMenu.Root>
  );
}

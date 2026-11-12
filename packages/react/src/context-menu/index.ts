import {ContextMenu as BaseContextMenu} from '@base-ui/react/context-menu';

export {ContextMenuTrigger as Trigger} from './context-menu.tsx';
export {Popup, Item, LinkItem, Group, GroupLabel, Separator} from '../menu/index.ts';

export const Root = BaseContextMenu.Root;
export const Portal = BaseContextMenu.Portal;
export const Positioner = BaseContextMenu.Positioner;

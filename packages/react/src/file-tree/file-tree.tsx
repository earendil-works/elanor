'use client';

import {useRender} from '@base-ui/react/use-render';
import {
  ChevronRightIcon,
  DescriptionIcon,
  FolderIcon,
  FolderOpenIcon,
} from '@earendil-works/elanor-icons-react';
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

import {classes} from '../utils/class-names.ts';
import {
  ancestorIds,
  createTabStopStore,
  flattenVisible,
  indexNodes,
  type FileTreeNode,
  type TabStopStore,
} from './file-tree-model.ts';
import {createOverflowTooltipStore, OverflowTooltip} from './file-tree-tooltip.tsx';

import styles from './file-tree.module.css';

export type {FileTreeNode} from './file-tree-model.ts';

const TYPEAHEAD_RESET_MS = 500;
const EMPTY: ReadonlyArray<string> = [];

export type FileTreeItemState<Node extends FileTreeNode = FileTreeNode> = {
  node: Node;
  /** 1-based depth. */
  level: number;
  isFolder: boolean;
  expanded: boolean;
  current: boolean;
};

interface RootContextValue {
  store: TabStopStore;
  register: (id: string, element: HTMLElement | null) => void;
}

type ItemContextValue = FileTreeItemState & {
  posInSet: number;
  setSize: number;
};

const RootContext = createContext<RootContextValue | null>(null);
const ItemContext = createContext<ItemContextValue | null>(null);

function useItemContext(part: string): ItemContextValue {
  const context = useContext(ItemContext);
  if (!context)
    throw new Error(`FileTree.${part} must be rendered inside FileTree.Root's children.`);
  return context;
}

export interface FileTreeRootProps<Node extends FileTreeNode = FileTreeNode> extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'role' | 'onKeyDown'
> {
  /** Nested tree data. Keep the reference stable between renders. */
  items: ReadonlyArray<Node>;
  /** Ids of open folders (controlled). */
  expanded?: ReadonlyArray<string> | undefined;
  /**
   * Ids of folders open on first render (uncontrolled).
   * @default []
   */
  defaultExpanded?: ReadonlyArray<string> | undefined;
  /** Called with the ids of open folders when a folder opens or closes. */
  onExpandedChange?: ((expanded: string[]) => void) | undefined;
  /**
   * Id of the current file. Its folders open when it changes, and it becomes the tree's Tab stop
   * while focus is elsewhere.
   */
  currentId?: string | null | undefined;
  /** Renders one row. Memoize it (`useCallback`) for large trees: rows re-render when it changes. */
  children: (state: FileTreeItemState<Node>) => ReactNode;
}

export function FileTreeRoot<Node extends FileTreeNode>({
  items,
  expanded: expandedProp,
  defaultExpanded,
  onExpandedChange,
  currentId = null,
  children: renderItem,
  className,
  ref,
  ...props
}: FileTreeRootProps<Node>) {
  const index = useMemo(() => indexNodes(items), [items]);
  // Open the current file's folders from the first render, so server output already shows it.
  const [uncontrolled, setUncontrolled] = useState(() => {
    const initial = defaultExpanded ?? EMPTY;
    return currentId === null
      ? initial
      : [...new Set([...initial, ...ancestorIds(index, currentId)])];
  });
  const expandedIds = expandedProp ?? uncontrolled;
  const expanded = useMemo(() => new Set(expandedIds), [expandedIds]);

  const rows = useMemo(() => flattenVisible(items, expanded), [items, expanded]);
  const rowIndex = useMemo(() => new Map(rows.map((row, i) => [row.node.id, i])), [rows]);

  const [store] = useState(() => createTabStopStore(currentId ?? items[0]?.id ?? null));
  const [elements] = useState(() => new Map<string, HTMLElement>());
  // One shared tooltip for cut-off names; showing it never re-renders the rows.
  const [tooltip] = useState(createOverflowTooltipStore);
  useEffect(() => tooltip.dispose, [tooltip]);
  const treeRef = useRef<HTMLDivElement | null>(null);
  const typeahead = useRef({query: '', timeout: 0});

  const latest = useRef({rows, rowIndex, index, expanded, expandedIds, onExpandedChange});
  useLayoutEffect(() => {
    latest.current = {rows, rowIndex, index, expanded, expandedIds, onExpandedChange};
  });

  const setExpandedIds = useCallback(
    (next: string[]) => {
      if (expandedProp === undefined) setUncontrolled(next);
      latest.current.onExpandedChange?.(next);
    },
    [expandedProp],
  );

  const setFolderOpen = useCallback(
    (id: string, open: boolean) => {
      const {expanded: current, expandedIds: ids} = latest.current;
      if (current.has(id) === open) return;
      setExpandedIds(open ? [...ids, id] : ids.filter((value) => value !== id));
    },
    [setExpandedIds],
  );

  const register = useCallback(
    (id: string, element: HTMLElement | null) => {
      if (element) elements.set(id, element);
      else elements.delete(id);
    },
    [elements],
  );
  const rootContext = useMemo(() => ({store, register}), [store, register]);

  // Reveal the current file: open its folders, keep what the user opened, then scroll to it.
  const pendingReveal = useRef(currentId);
  useEffect(() => {
    if (currentId === null) return;
    pendingReveal.current = currentId;
    const {index: nodes, expanded: open, expandedIds: ids} = latest.current;
    const closed = ancestorIds(nodes, currentId).filter((id) => !open.has(id));
    if (closed.length > 0) setExpandedIds([...ids, ...closed]);
    if (!treeRef.current?.contains(document.activeElement)) store.set(currentId);
  }, [currentId, setExpandedIds, store]);

  useLayoutEffect(() => {
    // A collapse can hide the Tab stop; move it to the nearest visible ancestor.
    let id = store.get();
    while (id !== null && !rowIndex.has(id)) id = index.get(id)?.parentId ?? null;
    store.set(id ?? rows[0]?.node.id ?? null);

    const reveal = pendingReveal.current;
    if (reveal !== null && rowIndex.has(reveal)) {
      pendingReveal.current = null;
      elements.get(reveal)?.scrollIntoView({block: 'nearest'});
    }
  }, [rows, rowIndex, index, store, elements]);

  const focusRow = (id: string | undefined) => {
    if (id === undefined) return;
    store.set(id);
    elements.get(id)?.focus();
  };

  const findByTypeahead = (key: string, fromIndex: number) => {
    const state = typeahead.current;
    window.clearTimeout(state.timeout);
    state.timeout = window.setTimeout(() => (state.query = ''), TYPEAHEAD_RESET_MS);
    // Repeating one letter cycles through matches; otherwise keep extending the query.
    const repeat = state.query.length > 0 && [...state.query].every((char) => char === key);
    state.query = repeat ? key : state.query + key;
    const query = state.query.toLocaleLowerCase();
    const {rows: visible} = latest.current;
    const start = repeat || state.query.length === 1 ? fromIndex + 1 : fromIndex;
    for (let offset = 0; offset < visible.length; offset++) {
      const row = visible[(start + offset) % visible.length]!;
      if (row.node.name.toLocaleLowerCase().startsWith(query)) return row.node.id;
    }
    return undefined;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && tooltip.hide('all')) {
      event.preventDefault();
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const id = (event.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]')?.dataset.id;
    if (id === undefined) return;
    const {rows: visible, rowIndex: positions, index: nodes} = latest.current;
    const position = positions.get(id);
    if (position === undefined) return;
    const row = visible[position]!;
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const key =
      rtl && event.key === 'ArrowLeft'
        ? 'ArrowRight'
        : rtl && event.key === 'ArrowRight'
          ? 'ArrowLeft'
          : event.key;

    switch (key) {
      case 'ArrowDown':
        focusRow(visible[position + 1]?.node.id);
        break;
      case 'ArrowUp':
        focusRow(visible[position - 1]?.node.id);
        break;
      case 'Home':
        focusRow(visible[0]?.node.id);
        break;
      case 'End':
        focusRow(visible.at(-1)?.node.id);
        break;
      case 'ArrowRight':
        if (!row.isFolder) break;
        if (row.expanded) focusRow(visible[position + 1]?.node.id);
        else setFolderOpen(id, true);
        break;
      case 'ArrowLeft':
        if (row.isFolder && row.expanded) setFolderOpen(id, false);
        else focusRow(nodes.get(id)?.parentId ?? undefined);
        break;
      case 'Enter':
      case ' ':
        // Files keep native activation (links navigate on Enter).
        if (!row.isFolder) return;
        setFolderOpen(id, !row.expanded);
        break;
      default:
        if (event.key.length !== 1 || event.key === ' ') return;
        focusRow(findByTypeahead(event.key, position));
    }
    event.preventDefault();
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    props.onClick?.(event);
    if (event.defaultPrevented) return;
    const id = (event.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]')?.dataset.id;
    if (id === undefined) return;
    store.set(id);
    const {rows: visible, rowIndex: positions} = latest.current;
    const row = visible[positions.get(id) ?? -1];
    if (row?.isFolder) setFolderOpen(id, !row.expanded);
  };

  const rowOf = (target: EventTarget | null) =>
    target instanceof Element ? target.closest<HTMLElement>('[role="treeitem"]') : null;

  const handlePointerOver = (event: PointerEvent<HTMLDivElement>) => {
    props.onPointerOver?.(event);
    if (event.pointerType !== 'mouse') return;
    const row = rowOf(event.target);
    // Ignore the gaps between rows, so the tooltip follows from row to row; leaving the tree hides it.
    if (row && row !== rowOf(event.relatedTarget)) tooltip.show(row, 'hover');
  };
  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    props.onPointerLeave?.(event);
    tooltip.hide('hover');
  };
  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    props.onFocus?.(event);
    const row = rowOf(event.target);
    if (row?.matches(':focus-visible')) tooltip.show(row, 'focus');
  };
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    props.onBlur?.(event);
    if (!event.currentTarget.contains(event.relatedTarget)) tooltip.hide('focus');
  };

  return (
    // oxlint-disable-next-line jsx-a11y/interactive-supports-focus -- Roving focus: the treeitems are the focus targets (WAI-ARIA tree pattern).
    <div
      {...props}
      ref={(element) => {
        treeRef.current = element;
        if (typeof ref === 'function') return ref(element);
        if (ref) ref.current = element;
      }}
      role="tree"
      className={classes(styles.root, className)}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <RootContext.Provider value={rootContext}>
        {rows.map((row) => (
          <FileTreeRow
            key={row.node.id}
            node={row.node}
            level={row.level}
            posInSet={row.posInSet}
            setSize={row.setSize}
            isFolder={row.isFolder}
            expanded={row.expanded}
            current={row.node.id === currentId}
            renderItem={renderItem as (state: FileTreeItemState) => ReactNode}
          />
        ))}
      </RootContext.Provider>
      <OverflowTooltip store={tooltip} />
    </div>
  );
}

type FileTreeRowProps = ItemContextValue & {
  renderItem: (state: FileTreeItemState) => ReactNode;
};

// Primitive props: expanding a folder re-renders only that row and the rows it reveals.
const FileTreeRow = memo(function FileTreeRow({renderItem, ...item}: FileTreeRowProps) {
  const {node, level, isFolder, expanded, current} = item;
  return (
    <ItemContext.Provider value={item}>
      {renderItem({node, level, isFolder, expanded, current})}
    </ItemContext.Provider>
  );
});

export interface FileTreeItemProps extends useRender.ComponentProps<'div', FileTreeItemState> {}

/** The row and treeitem. Pass `render={<a href />}` for files that navigate. */
export function FileTreeItem({render, className, style, ref, ...props}: FileTreeItemProps) {
  const item = useItemContext('Item');
  const root = useContext(RootContext)!;
  const id = item.node.id;
  const isTabStop = useSyncExternalStore(
    root.store.subscribe,
    () => root.store.get() === id,
    () => root.store.get() === id,
  );
  const register = useCallback(
    (element: HTMLDivElement | null) => {
      root.register(id, element);
      if (typeof ref === 'function') return ref(element);
      if (ref) ref.current = element;
    },
    [root, id, ref],
  );

  const {node, level, isFolder, expanded, current} = item;
  const state: FileTreeItemState = {node, level, isFolder, expanded, current};

  const resolvedClassName = classes(
    styles.item,
    typeof className === 'function'
      ? (className as (state: FileTreeItemState) => string)(state)
      : className,
  );
  const itemProps: Record<string, unknown> & ComponentPropsWithRef<'div'> = {
    ...props,
    role: 'treeitem',
    tabIndex: isTabStop ? 0 : -1,
    'data-id': id,
    'aria-level': item.level,
    'aria-posinset': item.posInSet,
    'aria-setsize': item.setSize,
    'aria-expanded': item.isFolder ? item.expanded : undefined,
    'aria-current': item.current ? 'page' : undefined,
    'data-folder': item.isFolder ? '' : undefined,
    'data-expanded': item.expanded ? '' : undefined,
    'data-current': item.current ? '' : undefined,
    className: resolvedClassName,
    style: {'--file-tree-level': item.level, ...style} as React.CSSProperties,
  };
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref: register,
    state,
    props: itemProps,
    // Rows without `render` skip Base UI's prop merging: it's a third of a row's script time.
    enabled: render !== undefined,
  });
  if (render !== undefined) return element;
  return <div {...itemProps} ref={register} />;
}

export interface FileTreeItemIconProps extends ComponentPropsWithRef<'span'> {}

/** Chevron and folder icon for folders, file icon for files. Pass children to replace the icon. */
export function FileTreeItemIcon({className, children, ...props}: FileTreeItemIconProps) {
  const {isFolder, expanded} = useItemContext('ItemIcon');
  const Icon = isFolder ? (expanded ? FolderOpenIcon : FolderIcon) : DescriptionIcon;
  return (
    <span {...props} aria-hidden className={classes(styles.icons, className)}>
      {isFolder ? <ChevronRightIcon className={styles.chevron} /> : null}
      {children ?? <Icon className={styles.icon} />}
    </span>
  );
}

export interface FileTreeItemLabelProps extends ComponentPropsWithRef<'span'> {}

/** The name. Truncates with an ellipsis; indentation stays intact. */
export function FileTreeItemLabel({className, ...props}: FileTreeItemLabelProps) {
  return <span {...props} className={classes(styles.label, className)} />;
}

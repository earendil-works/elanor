import {useRender} from '@base-ui/react/use-render';
import {FilterListIcon} from '@earendil-works/elanor-icons-react';
import {
  createContext,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import {createPortal} from 'react-dom';

import {Button} from '../button/button.tsx';
import type {DrawerPopupProps} from '../drawer/drawer.tsx';
import * as Drawer from '../drawer/index.ts';
import {classes} from '../utils/class-names.ts';

import styles from './search-and-filter-bar.module.css';

interface SearchAndFilterBarContextValue {
  readonly state: {
    /** Where Filters render while the drawer is mounted, or `null` to render inline. */
    readonly filtersSlot: HTMLElement | null;
  };
  readonly actions: {
    readonly setFiltersSlot: (slot: HTMLElement | null) => void;
  };
  readonly meta: {
    readonly triggerRef: RefObject<HTMLButtonElement | null>;
    readonly filtersRef: RefObject<HTMLDivElement | null>;
    /** Set when the drawer closed because the bar widened, so the inline filters take focus. */
    readonly focusInlineFiltersRef: RefObject<boolean>;
  };
}

const SearchAndFilterBarContext =
  /* @__PURE__ */ createContext<SearchAndFilterBarContextValue | null>(null);

function useSearchAndFilterBar(part: string): SearchAndFilterBarContextValue {
  const value = use(SearchAndFilterBarContext);
  if (!value) throw new Error(`SearchAndFilterBar.${part} must be inside SearchAndFilterBar.Root.`);
  return value;
}

export interface SearchAndFilterBarRootProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * Places a search input and filter controls in one row. Give it `role="search"` and an
 * `aria-label`.
 */
export function SearchAndFilterBarRoot({
  ref,
  className,
  children,
  ...props
}: SearchAndFilterBarRootProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filtersSlot, setFiltersSlot] = useState<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const focusInlineFiltersRef = useRef(false);

  // A container query decides between inline filters and the drawer. Close the drawer once the bar
  // grows past it and the Filters button disappears, rather than hiding an open drawer.
  useEffect(() => {
    const bar = barRef.current;
    if (!drawerOpen || !bar) return undefined;
    const observer = new ResizeObserver(() => {
      if (!isRendered(triggerRef.current)) setDrawerOpen(false);
    });
    observer.observe(bar);
    return () => observer.disconnect();
  }, [drawerOpen]);

  const context = useMemo<SearchAndFilterBarContextValue>(
    () => ({
      state: {filtersSlot},
      actions: {setFiltersSlot},
      meta: {triggerRef, filtersRef, focusInlineFiltersRef},
    }),
    [filtersSlot],
  );

  return useRender({
    defaultTagName: 'div',
    ref: ref ? [ref, barRef] : barRef,
    props: {
      ...props,
      className: classes(styles.bar, className),
      children: (
        <SearchAndFilterBarContext value={context}>
          <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
            <div className={styles.layout}>{children}</div>
          </Drawer.Root>
        </SearchAndFilterBarContext>
      ),
    },
  });
}

export interface SearchAndFilterBarSearchProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/** Holds the search input, usually a Search. */
export function SearchAndFilterBarSearch({
  ref,
  className,
  ...props
}: SearchAndFilterBarSearchProps) {
  return <div {...props} ref={ref} className={classes(styles.search, className)} />;
}

export interface SearchAndFilterBarFiltersProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * Holds the filter controls, such as Dropdowns. While the filters drawer is open, they render in
 * its FiltersSlot instead, so control their values from the application.
 */
export function SearchAndFilterBarFilters({
  ref,
  className,
  children,
  ...props
}: SearchAndFilterBarFiltersProps) {
  const {
    state: {filtersSlot},
    meta: {filtersRef, focusInlineFiltersRef},
  } = useSearchAndFilterBar('Filters');

  // Focus moves here after a resize, not a user event, and needs the remounted controls.
  useEffect(() => {
    if (filtersSlot || !focusInlineFiltersRef.current) return;
    focusInlineFiltersRef.current = false;
    focusFirst(filtersRef.current);
  }, [filtersSlot, filtersRef, focusInlineFiltersRef]);

  return useRender({
    defaultTagName: 'div',
    ref: ref ? [ref, filtersRef] : filtersRef,
    props: {
      ...props,
      className: classes(styles.filters, className),
      // One instance of the controls at a time keeps their IDs and label associations unique.
      children: filtersSlot ? createPortal(children, filtersSlot) : children,
    },
  });
}

export interface SearchAndFilterBarFiltersTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly ref?: Ref<HTMLButtonElement> | undefined;
}

/**
 * Opens the filters drawer. Bars narrower than 24rem with a FiltersTrigger show it in place of the
 * inline filters.
 */
export function SearchAndFilterBarFiltersTrigger({
  ref,
  ...props
}: SearchAndFilterBarFiltersTriggerProps) {
  const {
    meta: {triggerRef},
  } = useSearchAndFilterBar('FiltersTrigger');
  return (
    <div className={styles.trigger}>
      <Drawer.Trigger
        {...props}
        ref={ref}
        render={<Button ref={triggerRef} hierarchy="secondary" iconStart={<FilterListIcon />} />}
      />
    </div>
  );
}

export interface SearchAndFilterBarFiltersDrawerProps extends Omit<DrawerPopupProps, 'finalFocus'> {
  readonly children?: ReactNode;
}

/** The filters drawer. Compose a Drawer.Title, a FiltersSlot, and FiltersActions inside. */
export function SearchAndFilterBarFiltersDrawer({
  children,
  ...props
}: SearchAndFilterBarFiltersDrawerProps) {
  const {
    meta: {triggerRef, filtersRef, focusInlineFiltersRef},
  } = useSearchAndFilterBar('FiltersDrawer');

  function finalFocus(): HTMLElement | false {
    if (isRendered(triggerRef.current)) return triggerRef.current;
    const [control] = focusableIn(filtersRef.current);
    if (control) return control;
    // The bar widened: the controls return inline only after the drawer unmounts.
    focusInlineFiltersRef.current = true;
    return false;
  }

  return (
    <Drawer.VirtualKeyboardProvider>
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup {...props} finalFocus={finalFocus}>
            <Drawer.Content className={styles.drawerContent}>{children}</Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.VirtualKeyboardProvider>
  );
}

export interface SearchAndFilterBarFiltersSlotProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/** Where the Filters render inside the filters drawer. */
export function SearchAndFilterBarFiltersSlot({
  ref,
  className,
  ...props
}: SearchAndFilterBarFiltersSlotProps) {
  const {
    actions: {setFiltersSlot},
  } = useSearchAndFilterBar('FiltersSlot');
  return useRender({
    defaultTagName: 'div',
    ref: ref ? [ref, setFiltersSlot] : setFiltersSlot,
    props: {...props, className: classes(styles.filtersSlot, className)},
  });
}

export interface SearchAndFilterBarFiltersStatusProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * Announces the results while the filters drawer is open, such as “12 members”. The page behind
 * the drawer is inert, so its own status region is not announced.
 */
export function SearchAndFilterBarFiltersStatus({
  ref,
  className,
  ...props
}: SearchAndFilterBarFiltersStatusProps) {
  return (
    <div role="status" {...props} ref={ref} className={classes(styles.visuallyHidden, className)} />
  );
}

export interface SearchAndFilterBarFiltersActionsProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/** Stacks the drawer's buttons at full width. Put the primary action last, nearest the thumb. */
export function SearchAndFilterBarFiltersActions({
  ref,
  className,
  ...props
}: SearchAndFilterBarFiltersActionsProps) {
  return <div {...props} ref={ref} className={classes(styles.filtersActions, className)} />;
}

function isRendered(element: HTMLElement | null): element is HTMLElement {
  return Boolean(element?.getClientRects().length);
}

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]';

/** Visible, enabled elements in `root` that take focus in sequential keyboard navigation. */
function focusableIn(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) =>
      !element.matches(':disabled, [tabindex^="-"], [inert] *') &&
      isRendered(element) &&
      getComputedStyle(element).visibility !== 'hidden',
  );
}

function focusFirst(root: HTMLElement | null): void {
  for (const element of focusableIn(root)) {
    element.focus();
    if (element.ownerDocument.activeElement === element) return;
  }
}

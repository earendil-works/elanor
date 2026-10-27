import {CloseIcon, SearchIcon} from '@earendil-works/elanor-icons-react';
import {
  createContext,
  useContext,
  useId,
  type ButtonHTMLAttributes,
  type DialogHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';

import {IconButton, type IconButtonProps} from '../icon-button/icon-button.tsx';
import * as ScrollArea from '../scroll-area/index.ts';
import {classes} from '../utils/class-names.ts';

import styles from './search-dialog.module.css';

interface StaticSearchDialogContextValue {
  readonly dialogId: string;
  readonly listId: string;
}

const StaticSearchDialogContext =
  /* @__PURE__ */ createContext<StaticSearchDialogContextValue | null>(null);

function useStaticSearchDialog(part: string): StaticSearchDialogContextValue {
  const searchDialog = useContext(StaticSearchDialogContext);
  if (!searchDialog)
    throw new Error(`SearchDialog.${part} must be inside SearchDialog.StaticRoot.`);
  return searchDialog;
}

export interface SearchDialogStaticRootProps {
  readonly children?: ReactNode;
}

/**
 * A search dialog for pages without React in the browser; `createModal`, `createScrollArea`, and
 * `createSearchDialog` make it work. Renders no element.
 */
export function SearchDialogStaticRoot({children}: SearchDialogStaticRootProps) {
  const id = useId();
  return (
    <StaticSearchDialogContext.Provider value={{dialogId: `${id}-dialog`, listId: `${id}-list`}}>
      {children}
    </StaticSearchDialogContext.Provider>
  );
}

export interface SearchDialogStaticTriggerProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  readonly ref?: Ref<HTMLButtonElement> | undefined;
  /** The trigger's text, such as "Search documentation". */
  readonly children?: ReactNode;
  /** A keyboard shortcut shown at the end on devices that hover, such as a `KeyboardShortcut`. */
  readonly shortcut?: ReactNode;
}

export function SearchDialogStaticTrigger({
  ref,
  shortcut,
  children,
  className,
  ...props
}: SearchDialogStaticTriggerProps) {
  const {dialogId} = useStaticSearchDialog('StaticTrigger');
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      {...props}
      ref={ref}
      className={classes(styles.trigger, className)}
      {...{commandfor: dialogId, command: 'show-modal'}}
    >
      <span className={styles.icon} aria-hidden="true">
        <SearchIcon />
      </span>
      <span className={styles.triggerLabel}>{children}</span>
      {shortcut ? (
        <span className={styles.triggerShortcut} aria-hidden="true">
          {shortcut}
        </span>
      ) : null}
    </button>
  );
}

export interface SearchDialogStaticPopupProps extends DialogHTMLAttributes<HTMLDialogElement> {
  readonly ref?: Ref<HTMLDialogElement> | undefined;
  /** The accessible name, such as "Search documentation". */
  readonly 'aria-label': string;
}

export function SearchDialogStaticPopup({ref, className, ...props}: SearchDialogStaticPopupProps) {
  const {dialogId} = useStaticSearchDialog('StaticPopup');
  return (
    <dialog
      {...props}
      ref={ref}
      id={dialogId}
      data-elanor="modal search-dialog"
      data-closed=""
      className={classes(styles.popup, className)}
    />
  );
}

export interface SearchDialogStaticInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  readonly ref?: Ref<HTMLInputElement> | undefined;
}

export function SearchDialogStaticInput({ref, className, ...props}: SearchDialogStaticInputProps) {
  const {listId} = useStaticSearchDialog('StaticInput');
  return (
    <span className={styles.field}>
      <span className={styles.icon} aria-hidden="true">
        <SearchIcon />
      </span>
      <input
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        {...props}
        ref={ref}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={false}
        aria-controls={listId}
        className={classes(styles.input, className)}
      />
    </span>
  );
}

export interface SearchDialogStaticCloseProps extends Omit<IconButtonProps, 'children'> {
  /** The accessible name, such as "Close search". */
  readonly 'aria-label': string;
}

export function SearchDialogStaticClose(props: SearchDialogStaticCloseProps) {
  const {dialogId} = useStaticSearchDialog('StaticClose');
  return (
    <IconButton {...props} {...{commandfor: dialogId, command: 'close'}}>
      <CloseIcon />
    </IconButton>
  );
}

export interface SearchDialogStaticResultsProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/** The area below the form, for `StaticMessage`s, the `StaticList`, and a `StaticStatus`. */
export function SearchDialogStaticResults({
  className,
  children,
  ...props
}: SearchDialogStaticResultsProps) {
  return (
    <ScrollArea.StaticRoot {...props} className={classes(styles.results, className)}>
      <ScrollArea.StaticViewport className={styles.resultsViewport}>
        <ScrollArea.StaticContent className={styles.resultsContent}>
          {children}
        </ScrollArea.StaticContent>
      </ScrollArea.StaticViewport>
      <ScrollArea.StaticScrollbar>
        <ScrollArea.StaticThumb />
      </ScrollArea.StaticScrollbar>
    </ScrollArea.StaticRoot>
  );
}

export interface SearchDialogStaticStatusProps extends HTMLAttributes<HTMLSpanElement> {
  readonly ref?: Ref<HTMLSpanElement> | undefined;
}

/** Announces the result count to assistive technology. Visually hidden. */
export function SearchDialogStaticStatus({
  ref,
  className,
  ...props
}: SearchDialogStaticStatusProps) {
  return (
    <span
      role="status"
      {...props}
      ref={ref}
      data-elanor-search-status=""
      className={classes(styles.visuallyHidden, className)}
    />
  );
}

export type SearchDialogStaticMessageState = 'idle' | 'short' | 'loading' | 'empty' | 'error';

export interface SearchDialogStaticMessageProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
  /**
   * When it shows: no query yet, a query too short to search, while the source loads, no
   * results, or a source that failed to load.
   */
  readonly state: SearchDialogStaticMessageState;
}

export function SearchDialogStaticMessage({
  ref,
  state,
  className,
  ...props
}: SearchDialogStaticMessageProps) {
  return (
    <div
      {...props}
      ref={ref}
      hidden={state !== 'idle'}
      data-elanor-search-state={state}
      className={classes(styles.message, className)}
    />
  );
}

export interface SearchDialogStaticQueryProps extends HTMLAttributes<HTMLSpanElement> {
  readonly ref?: Ref<HTMLSpanElement> | undefined;
}

/** The query, inside a `StaticMessage`, such as “No results for …”. */
export function SearchDialogStaticQuery({ref, ...props}: SearchDialogStaticQueryProps) {
  return <span {...props} ref={ref} data-elanor-search-query="" />;
}

export interface SearchDialogStaticListProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
  /** The accessible name, such as "Results". */
  readonly 'aria-label': string;
}

/** The results, filled by the behavior: each has its context, title, and excerpt. */
export function SearchDialogStaticList({ref, className, ...props}: SearchDialogStaticListProps) {
  const {listId} = useStaticSearchDialog('StaticList');
  return (
    <>
      <div
        {...props}
        ref={ref}
        id={listId}
        role="listbox"
        className={classes(styles.list, className)}
      />
      <template data-elanor-search-template="">
        {/* oxlint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/control-has-associated-label -- The behavior sets each result's href and text. */}
        <a role="option" aria-selected={false} tabIndex={-1} className={styles.result}>
          <span className={styles.resultContext} data-elanor-search-field="context" />
          <span className={styles.resultTitle} data-elanor-search-field="title" />
          <span className={styles.resultExcerpt} data-elanor-search-field="excerpt" />
        </a>
      </template>
    </>
  );
}

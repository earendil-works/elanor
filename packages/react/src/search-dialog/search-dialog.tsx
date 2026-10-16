import {Autocomplete as BaseAutocomplete} from '@base-ui/react/autocomplete';
import {Dialog as BaseDialog} from '@base-ui/react/dialog';
import {CloseIcon, SearchIcon} from '@earendil-works/elanor-icons-react';
import {
  createContext,
  useContext,
  useRef,
  type FormHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';

import {IconButton} from '../icon-button/icon-button.tsx';
import * as ScrollArea from '../scroll-area/index.ts';
import type {ScrollAreaRootProps, ScrollAreaRootState} from '../scroll-area/scroll-area.tsx';
import {classes, mergeClassName} from '../utils/class-names.ts';

import styles from './search-dialog.module.css';

export type {
  DialogRootActions as SearchDialogRootActions,
  DialogRootChangeEventReason as SearchDialogRootChangeEventReason,
  DialogRootChangeEventDetails as SearchDialogRootChangeEventDetails,
} from '@base-ui/react/dialog';

export type SearchDialogHandle<Payload = unknown> = BaseDialog.Handle<Payload>;

const CloseContext = /* @__PURE__ */ createContext<() => void>(() => {});

export type SearchDialogRootProps<Payload = unknown> = BaseDialog.Root.Props<Payload>;

/**
 * A search that opens in a modal dialog. Put a `Trigger` and a `Popup` inside. To open it with a
 * keyboard shortcut, pass a `handle` from `createHandle()` and call `open()` from the application.
 */
export function SearchDialogRoot<Payload = unknown>({
  actionsRef: actionsRefProp,
  ...props
}: SearchDialogRootProps<Payload>) {
  // Choosing a result closes the dialog through Base UI's actions, in the application's ref when
  // it passes one.
  const ownActionsRef = useRef<BaseDialog.Root.Actions>(null);
  const actionsRef = actionsRefProp ?? ownActionsRef;
  const close = () => actionsRef.current?.close();

  return (
    <CloseContext.Provider value={close}>
      <BaseDialog.Root {...props} actionsRef={actionsRef} />
    </CloseContext.Provider>
  );
}

export interface SearchDialogTriggerProps extends Omit<BaseDialog.Trigger.Props, 'children'> {
  /** The trigger's text, such as "Search documentation". */
  readonly children?: ReactNode;
  /**
   * A keyboard shortcut shown at the end on devices that hover, such as a `KeyboardShortcut`. It
   * only shows the keys: the application listens for them, and names them in `aria-keyshortcuts`.
   */
  readonly shortcut?: ReactNode;
}

/** Opens the dialog. It looks like a search field, with its text as the placeholder. */
export function SearchDialogTrigger({
  ref,
  shortcut,
  children,
  className,
  ...props
}: SearchDialogTriggerProps) {
  return (
    <BaseDialog.Trigger
      {...props}
      ref={ref}
      className={mergeClassName<BaseDialog.Trigger.State>(styles.trigger, className)}
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
    </BaseDialog.Trigger>
  );
}

export interface SearchDialogPopupProps
  extends
    Omit<BaseDialog.Popup.Props, 'children'>,
    Pick<BaseAutocomplete.Root.Props<string>, 'value' | 'defaultValue' | 'onValueChange'> {
  /** The accessible name, such as "Search documentation". */
  readonly 'aria-label': string;
  readonly children?: ReactNode;
}

/**
 * The dialog, near the top of the window over a backdrop. Its parts are the `Form`, the
 * `Results`, and the `Footer`, in that order. The field is a combobox that controls the results;
 * the first result is selected as results arrive, and the arrow keys move the selection.
 */
export function SearchDialogPopup({
  ref,
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: SearchDialogPopupProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={styles.backdrop} />
      <BaseDialog.Popup
        {...props}
        ref={ref}
        className={mergeClassName<BaseDialog.Popup.State>(styles.popup, className)}
      >
        <BaseAutocomplete.Root
          inline
          open
          mode="none"
          autoHighlight="always"
          keepHighlight
          {...(value === undefined ? {} : {value})}
          {...(defaultValue === undefined ? {} : {defaultValue})}
          {...(onValueChange === undefined ? {} : {onValueChange})}
        >
          {children}
        </BaseAutocomplete.Root>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

export interface SearchDialogFormProps extends FormHTMLAttributes<HTMLFormElement> {
  readonly ref?: Ref<HTMLFormElement> | undefined;
}

/** The top row, a search form: holds the `Input` and a `Close`. Without results, Enter submits. */
export function SearchDialogForm({ref, className, ...props}: SearchDialogFormProps) {
  return <form role="search" {...props} ref={ref} className={classes(styles.form, className)} />;
}

export interface SearchDialogInputProps extends Omit<BaseAutocomplete.Input.Props, 'type'> {}

/**
 * The field: the search icon and the query, without a field's fill or border; the dialog is the
 * field. Focused when the dialog opens. Its type is `text`, because in a `search` field Escape
 * first clears the query and browsers add their own clear button.
 */
export function SearchDialogInput({ref, className, ...props}: SearchDialogInputProps) {
  return (
    <span className={styles.field}>
      <span className={styles.icon} aria-hidden="true">
        <SearchIcon />
      </span>
      <BaseAutocomplete.Input
        autoComplete="off"
        // Queries are names and terms, which touch keyboards would capitalize or "correct".
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        {...props}
        ref={ref}
        type="text"
        className={mergeClassName<BaseAutocomplete.Input.State>(styles.input, className)}
      />
    </span>
  );
}

export interface SearchDialogCloseProps extends Omit<BaseDialog.Close.Props, 'children'> {
  /** The accessible name, such as "Close search". */
  readonly 'aria-label': string;
}

/** Closes the dialog. */
export function SearchDialogClose({ref, ...props}: SearchDialogCloseProps) {
  return (
    <BaseDialog.Close {...props} ref={ref} render={<IconButton />}>
      <CloseIcon />
    </BaseDialog.Close>
  );
}

export interface SearchDialogResultsProps extends Omit<ScrollAreaRootProps, 'children'> {
  readonly children?: ReactNode;
}

/**
 * The area below the form, for `Message`s, the `List`, and a `Status`. It scrolls in a scroll
 * area, whose scrollbar overlays the results instead of narrowing them.
 */
export function SearchDialogResults({className, children, ...props}: SearchDialogResultsProps) {
  return (
    <ScrollArea.Root
      {...props}
      className={mergeClassName<ScrollAreaRootState>(styles.results, className)}
    >
      <ScrollArea.Viewport className={styles.resultsViewport}>
        <ScrollArea.Content className={styles.resultsContent}>{children}</ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar>
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}

export interface SearchDialogStatusProps extends BaseAutocomplete.Status.Props {}

/** Announces the results to assistive technology, such as "5 results". Visually hidden. */
export function SearchDialogStatus({ref, className, ...props}: SearchDialogStatusProps) {
  return (
    <BaseAutocomplete.Status
      {...props}
      ref={ref}
      className={mergeClassName<BaseAutocomplete.Status.State>(styles.visuallyHidden, className)}
    />
  );
}

export interface SearchDialogMessageProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/** What the results area shows instead of results, such as an `EmptyState`. */
export function SearchDialogMessage({ref, className, ...props}: SearchDialogMessageProps) {
  return <div {...props} ref={ref} className={classes(styles.message, className)} />;
}

export interface SearchDialogListProps extends BaseAutocomplete.List.Props {
  /** The accessible name, such as "Results". */
  readonly 'aria-label': string;
}

/** The results, a listbox the field controls. Put `Result`s inside. */
export function SearchDialogList({ref, className, ...props}: SearchDialogListProps) {
  return (
    <BaseAutocomplete.List
      {...props}
      ref={ref}
      className={mergeClassName<BaseAutocomplete.List.State>(styles.list, className)}
    />
  );
}

export interface SearchDialogResultProps extends BaseAutocomplete.Item.Props {
  /** The result's URL. Choosing the result follows it. */
  readonly href: string;
}

// Results are links by default; Base UI merges the item's props, including `href`, into them.
const renderResultLink: BaseAutocomplete.Item.Props['render'] = ({children, ...props}) => (
  <a {...props}>{children}</a>
);

// Modified clicks open the link elsewhere, such as in a new tab, and leave the search open.
function isPlainPrimaryClick(event: MouseEvent): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey
  );
}

/**
 * A result, a link: put a `ResultContext`, a `ResultTitle`, and a `ResultExcerpt` inside. The
 * selected one gets the active fill. Choosing it follows the link and closes the dialog. It
 * renders an `a`; for a router's link component, pass it as `render`, which receives `href`.
 */
export function SearchDialogResult({
  ref,
  href,
  value,
  className,
  onClick,
  render = renderResultLink,
  ...props
}: SearchDialogResultProps) {
  const close = useContext(CloseContext);
  return (
    <BaseAutocomplete.Item
      {...props}
      {...{href}}
      onClick={(event) => {
        onClick?.(event);
        if (isPlainPrimaryClick(event)) close();
      }}
      ref={ref}
      value={value ?? href}
      render={render}
      className={mergeClassName<BaseAutocomplete.Item.State>(styles.result, className)}
    />
  );
}

export interface SearchDialogResultContextProps extends HTMLAttributes<HTMLSpanElement> {
  readonly ref?: Ref<HTMLSpanElement> | undefined;
}

/** Where the result sits, such as its section. */
export function SearchDialogResultContext({
  ref,
  className,
  ...props
}: SearchDialogResultContextProps) {
  return <span {...props} ref={ref} className={classes(styles.resultContext, className)} />;
}

export interface SearchDialogResultTitleProps extends HTMLAttributes<HTMLSpanElement> {
  readonly ref?: Ref<HTMLSpanElement> | undefined;
}

export function SearchDialogResultTitle({ref, className, ...props}: SearchDialogResultTitleProps) {
  return <span {...props} ref={ref} className={classes(styles.resultTitle, className)} />;
}

export interface SearchDialogResultExcerptProps extends HTMLAttributes<HTMLSpanElement> {
  readonly ref?: Ref<HTMLSpanElement> | undefined;
}

/** Up to two lines of the matching text. */
export function SearchDialogResultExcerpt({
  ref,
  className,
  ...props
}: SearchDialogResultExcerptProps) {
  return <span {...props} ref={ref} className={classes(styles.resultExcerpt, className)} />;
}

export interface SearchDialogFooterProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/** The bottom row, for `Hint`s. Shown on devices that hover, which usually have keyboards. */
export function SearchDialogFooter({ref, className, ...props}: SearchDialogFooterProps) {
  return <div {...props} ref={ref} className={classes(styles.footer, className)} />;
}

export interface SearchDialogHintProps extends HTMLAttributes<HTMLSpanElement> {
  readonly ref?: Ref<HTMLSpanElement> | undefined;
}

/** A key hint, such as `KeyboardKey`s followed by what they do. */
export function SearchDialogHint({ref, className, ...props}: SearchDialogHintProps) {
  return <span {...props} ref={ref} className={classes(styles.hint, className)} />;
}

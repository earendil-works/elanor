import {Autocomplete as BaseAutocomplete} from '@base-ui/react/autocomplete';
import {Dialog as BaseDialog} from '@base-ui/react/dialog';
import {CloseIcon, SearchIcon} from '@earendil-works/elanor-icons-react';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type FormHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';

import {IconButton} from '../icon-button/icon-button.tsx';
import {classes, mergeClassName} from '../utils/class-names.ts';

import styles from './search-dialog.module.css';

const CloseContext = /* @__PURE__ */ createContext<() => void>(() => {});

export interface SearchDialogRootProps {
  /** Whether the dialog is open. Use with `onOpenChange` to control it. */
  readonly open?: boolean;
  /** Whether the dialog is open initially, when uncontrolled. */
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  /** Whether ⌘K or Ctrl+K, and `/` outside text fields, open the dialog. */
  readonly shortcuts?: boolean;
  readonly children?: ReactNode;
}

function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

/** A search that opens in a modal dialog. Put a `Trigger` and a `Popup` inside. */
export function SearchDialogRoot({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  shortcuts = true,
  children,
}: SearchDialogRootProps) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;

  function setOpen(next: boolean): void {
    if (openProp === undefined) setOpenState(next);
    onOpenChange?.(next);
  }

  useEffect(() => {
    if (!shortcuts) return;
    function onKeyDown(event: KeyboardEvent): void {
      const command = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      const slash = event.key === '/' && !isEditable(event.target);
      if (!command && !(slash && !open)) return;
      event.preventDefault();
      if (openProp === undefined) setOpenState(command ? (current) => !current : true);
      onOpenChange?.(command ? !open : true);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [shortcuts, open, openProp, onOpenChange]);

  return (
    <BaseDialog.Root open={open} onOpenChange={(next) => setOpen(next)}>
      <CloseContext.Provider value={() => setOpen(false)}>{children}</CloseContext.Provider>
    </BaseDialog.Root>
  );
}

export interface SearchDialogTriggerProps extends Omit<BaseDialog.Trigger.Props, 'children'> {
  /** The trigger's text, such as "Search documentation". */
  readonly children?: ReactNode;
  /** A keyboard shortcut shown at the end on devices that hover, such as a `KeyboardShortcut`. */
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

export interface SearchDialogPopupProps extends Omit<BaseDialog.Popup.Props, 'children'> {
  /** The accessible name, such as "Search documentation". */
  readonly 'aria-label': string;
  /** The query. Use with `onValueChange` to control it. */
  readonly value?: string;
  /** The initial query, when uncontrolled. */
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
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
          {...(value === undefined ? {} : {value})}
          {...(defaultValue === undefined ? {} : {defaultValue})}
          onValueChange={(next) => onValueChange?.(next)}
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

export interface SearchDialogResultsProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/** The scrolling area below the form, for `Message`s, the `List`, and a `Status`. */
export function SearchDialogResults({ref, className, ...props}: SearchDialogResultsProps) {
  return <div {...props} ref={ref} className={classes(styles.results, className)} />;
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

export interface SearchDialogResultProps extends Omit<BaseAutocomplete.Item.Props, 'render'> {
  /** The result's URL. Choosing the result follows it. */
  readonly href: string;
}

/**
 * A result, a link: put a `ResultContext`, a `ResultTitle`, and a `ResultExcerpt` inside. The
 * selected one gets the active fill. Choosing it follows the link and closes the dialog.
 */
export function SearchDialogResult({
  ref,
  href,
  value,
  className,
  onClick,
  ...props
}: SearchDialogResultProps) {
  const close = useContext(CloseContext);
  return (
    <BaseAutocomplete.Item
      {...props}
      onClick={(event) => {
        onClick?.(event);
        close();
      }}
      ref={ref}
      value={value ?? href}
      render={({children, ...itemProps}) => (
        <a {...itemProps} href={href}>
          {children}
        </a>
      )}
      className={mergeClassName<BaseAutocomplete.Item.State>(styles.result, className)}
    />
  );
}

export interface SearchDialogResultPartProps extends HTMLAttributes<HTMLSpanElement> {
  readonly ref?: Ref<HTMLSpanElement> | undefined;
}

/** Where the result sits, such as its section. */
export function SearchDialogResultContext({ref, className, ...props}: SearchDialogResultPartProps) {
  return <span {...props} ref={ref} className={classes(styles.resultContext, className)} />;
}

export function SearchDialogResultTitle({ref, className, ...props}: SearchDialogResultPartProps) {
  return <span {...props} ref={ref} className={classes(styles.resultTitle, className)} />;
}

/** Up to two lines of the matching text. */
export function SearchDialogResultExcerpt({ref, className, ...props}: SearchDialogResultPartProps) {
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

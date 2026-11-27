import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';
import {useEffect, useLayoutEffect, useRef, type CSSProperties, type RefObject} from 'react';

import * as ScrollArea from '../scroll-area/index.ts';
import {
  useFieldRootContext,
  useFormContext,
  useLabelableContext,
  useLabelableId,
  useRegisterFieldControl,
  useValueChanged,
} from '../utils/base-ui-internals.ts';
import {fieldValidityMapping} from '../utils/field-validity.ts';
import {useMergedRef} from '../utils/refs.ts';
import {
  useComposerMeta,
  useComposerSettings,
  useComposerState,
  useComposerText,
  type ComposerState,
} from './context.ts';
import {useStoreSelector} from './store.ts';

import styles from './composer.module.css';

export interface ComposerPromptState extends ComposerState {
  /** Nothing is written; the placeholder shows. */
  readonly empty: boolean;
  /** The field's validity, `null` before it is validated. */
  readonly valid: boolean | null;
  readonly touched: boolean;
  readonly dirty: boolean;
  readonly filled: boolean;
  readonly focused: boolean;
}

export interface ComposerPromptProps extends Omit<
  useRender.ComponentProps<'div', ComposerPromptState>,
  'children'
> {
  /** Shown while nothing is written. */
  readonly placeholder?: string | undefined;
  /** The most lines of text, a whole number, the prompt grows to before it scrolls. */
  readonly maxRows?: number | undefined;
}

const keep = () => {};

/** A whole number of lines, at least one; anything else falls back to one. */
const scrollStyle = (maxRows: number): CSSProperties & {'--composer-prompt-max-rows': number} => ({
  '--composer-prompt-max-rows': Math.max(1, Math.floor(maxRows) || 1),
});

/**
 * The text of the message, with chips in it. Grows from one line to `maxRows`, at most 40% of the
 * viewport, then scrolls. Name it with `aria-label` or a `Field.Label`. Its `onKeyDown` runs before
 * the composer's keys; call `preventDefault()` to handle a key yourself. Inside a `Field.Root` it
 * is the field's control, through a hidden form value that a form submits and validates. `render`,
 * `className` and `ref` go to the editable element, which renders `data-empty`, `data-disabled`,
 * `data-readonly` and the field's states. While `Composer.Suggestions` is mounted and the prompt
 * is editable, it has `aria-haspopup="listbox"`, and while the list is open, `aria-controls` and
 * `data-popup-open`.
 */
export function ComposerPrompt({
  ref,
  render,
  id: idProp,
  placeholder,
  maxRows = 10,
  ...props
}: ComposerPromptProps) {
  const meta = useComposerMeta('Composer.Prompt');
  const {required} = useComposerSettings('Composer.Prompt');
  const {empty, disabled, readOnly} = useComposerState('Composer.Prompt');
  const field = useFieldRootContext();
  const {labelId, getDescriptionProps} = useLabelableContext();
  const id = useLabelableId({id: idProp});
  const control = useRef<HTMLDivElement>(null);
  const popup = useStoreSelector(meta.popup, (state) => state);

  const editable = !disabled && !readOnly;
  // Suggestions never open in a prompt that isn't editable, so it announces no popup.
  const suggests = editable && popup !== null;
  const popupProps = {
    'aria-haspopup': suggests ? 'listbox' : undefined,
    'aria-autocomplete': suggests ? 'list' : undefined,
    'aria-controls': popup?.controls,
    'aria-activedescendant': popup?.active,
    'data-popup-open': popup?.controls === undefined ? undefined : '',
  } as const;
  const {valid, touched, dirty, filled, focused} = field.state;
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref: ref ? [ref, meta.editor.bind, control] : [meta.editor.bind, control],
    state: {empty, disabled, readOnly, valid, touched, dirty, filled, focused},
    stateAttributesMapping: fieldValidityMapping,
    props: mergeProps<'div'>(
      getDescriptionProps({}),
      popupProps,
      {
        id,
        className: styles.prompt,
        role: 'textbox',
        'aria-multiline': true,
        'aria-labelledby': labelId,
        'aria-placeholder': placeholder,
        'aria-disabled': disabled || undefined,
        'aria-readonly': readOnly || undefined,
        'aria-required': required || undefined,
        'aria-invalid': valid === false || undefined,
        // Read-only, it isn't editable, so a phone raises no keyboard; it can still be focused
        // and copied.
        contentEditable: editable,
        tabIndex: readOnly && !disabled ? 0 : undefined,
        suppressContentEditableWarning: true,
        spellCheck: true,
        // Page translation rewrites the text in `<font>` elements, which the value would take in.
        translate: 'no',
        onFocus: () => field.setFocused(true),
        onBlur: () => {
          field.setTouched(true);
          field.setFocused(false);
          if (field.validationMode === 'onBlur') {
            void field.validation.commit(meta.formValue.current?.value ?? '');
          }
        },
        onKeyDown: (event) => meta.editor.handleKeyDown(event.nativeEvent),
      },
      props,
    ),
  });

  return (
    <>
      <ScrollArea.Root className={styles.scroll} style={scrollStyle(maxRows)}>
        {/* Not a Tab stop of its own: the caret scrolls the text. */}
        <ScrollArea.Viewport tabIndex={-1}>
          {/* Base UI sizes the content to fit its widest line; long words wrap here instead. */}
          <ScrollArea.Content className={styles.scrollContent} style={{minWidth: 0}}>
            {element}
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        {/* Dragging the scrollbar keeps the focus in the text. */}
        <ScrollArea.Scrollbar visibility="always" onMouseDown={(event) => event.preventDefault()}>
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
      <FormValue control={control} id={id} />
    </>
  );
}

/**
 * What a form submits and validates: the value as `toText` gives it, in a hidden `<textarea>`,
 * which keeps its line breaks. The one part of the prompt that renders on every edit. A form that
 * wants it filled in focuses the text.
 */
function FormValue({
  control,
  id,
}: {
  readonly control: RefObject<HTMLDivElement | null>;
  readonly id: string | undefined;
}) {
  const meta = useComposerMeta('Composer.Prompt');
  const text = useComposerText('Composer.Prompt');
  const {disabled, readOnly, name, required, form} = useComposerSettings('Composer.Prompt');
  const field = useFieldRootContext();
  const {clearErrors} = useFormContext();
  const fieldName = field.name ?? name;
  const ref = useMergedRef<HTMLElement>(meta.formValue, field.validation.inputRef);

  useRegisterFieldControl(control, id, text, () => text, !disabled, name);
  const {setFilled} = field;
  useLayoutEffect(() => setFilled(text !== ''), [setFilled, text]);
  useValueChanged(text, () => {
    clearErrors(fieldName);
    field.setDirty(text !== (field.validityData.initialValue ?? ''));
    field.validation.change(text);
  });
  useEffect(() => {
    const owner = meta.formValue.current?.form;
    if (!owner) return;
    owner.addEventListener('reset', meta.reset);
    return () => owner.removeEventListener('reset', meta.reset);
  }, [meta, form]);

  return (
    <textarea
      {...field.validation.getValidationProps(disabled, {
        onFocus: () => meta.actions.focus({at: 'caret'}),
      })}
      ref={ref}
      className={styles.formValue}
      name={fieldName}
      form={form}
      required={required}
      disabled={disabled}
      // Read-only, it isn't validated, as native read-only fields aren't.
      readOnly={readOnly}
      value={text}
      onChange={keep}
      tabIndex={-1}
      aria-hidden
    />
  );
}

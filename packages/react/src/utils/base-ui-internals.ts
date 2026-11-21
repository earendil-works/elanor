// Base UI exports these from `@base-ui/react/internals/*` without documenting them, so any release
// can change them. Import them only here, and re-check each one on every Base UI upgrade.
//
// `Composer.Prompt` is a `contenteditable`, and Base UI's public `Field.Control` must be the
// `<input>` itself. These Field and Form hooks make the prompt a field control the way Base UI's
// own controls are; they have no public equivalent.
//
// A renamed or moved export fails the type check. A behaviour change shows on a prompt inside a
// `Field` and a `Form`: the label, `data-invalid` and `data-dirty`, `required`, and form reset.

/** Without it, the field doesn't validate the prompt and a `Form` leaves its value out. */
export {useRegisterFieldControl} from '@base-ui/react/internals/field-register-control';
/**
 * Field states (`data-dirty`, `data-touched`, `data-focused`), `required`, blur validation and
 * form reset all go through it.
 */
export {useFieldRootContext} from '@base-ui/react/internals/field-root-context';
/** Clears the field's server errors when the value changes. */
export {useFormContext} from '@base-ui/react/internals/form-context';
/** The prompt's accessible name and description inside a `Field`. */
export {useLabelableContext, useLabelableId} from '@base-ui/react/internals/labelable-provider';
/** Runs after the render that changed the value: dirty state and validation on change. */
export {useValueChanged} from '@base-ui/react/internals/useValueChanged';

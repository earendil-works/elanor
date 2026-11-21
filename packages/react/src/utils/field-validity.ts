import type {useRender} from '@base-ui/react/use-render';

type ValidityState = {readonly valid: boolean | null};

/**
 * Renders a field's `valid` state as Base UI's field controls do: `data-valid`, `data-invalid`, or
 * neither before validation.
 */
export const fieldValidityMapping = {
  valid: (valid) => (valid === null ? null : valid ? {'data-valid': ''} : {'data-invalid': ''}),
} satisfies NonNullable<
  useRender.Parameters<ValidityState, HTMLElement, undefined>['stateAttributesMapping']
>;

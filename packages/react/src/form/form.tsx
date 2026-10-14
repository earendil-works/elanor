import {Form as BaseForm} from '@base-ui/react/form';

export type {
  FormActions,
  FormProps,
  FormSubmitEventDetails,
  FormSubmitEventReason,
  FormValidationMode,
} from '@base-ui/react/form';

/** Validates its Fields together on submit and focuses the first invalid one. */
export const Form = BaseForm;

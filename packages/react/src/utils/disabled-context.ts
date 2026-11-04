import {createContext} from 'react';

/**
 * Whether an enclosing Field or Fieldset is disabled. Base UI disables its own controls through
 * its internal field context; this reaches Elanor's parts beside them, such as Dropdown.Clear.
 */
export const DisabledContext = /* @__PURE__ */ createContext(false);

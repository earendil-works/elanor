export type ContractPrimitive = 'boolean' | 'string';

export interface PropertyContract {
  readonly type: ContractPrimitive;
  readonly values?: readonly string[];
}

export interface ElementContract {
  readonly properties: Readonly<Record<string, PropertyContract>>;
  readonly attributes?: Readonly<Record<string, PropertyContract>>;
  readonly events?: readonly string[];
  readonly methods?: readonly string[];
  readonly slots?: readonly string[];
}

const string = (values?: readonly string[]): PropertyContract => values ? {type: 'string', values} : {type: 'string'};
const boolean = (): PropertyContract => ({type: 'boolean'});

export const elanorElementContracts = {
  'elnr-badge': {
    properties: {tone: string(['neutral', 'information', 'positive', 'warning', 'negative'])},
  },
  'elnr-box': {
    properties: {
      padding: string(['none', 'sm', 'md', 'lg']),
      surface: string(['transparent', 'primary', 'subdued']),
      border: boolean(),
    },
  },
  'elnr-button': {
    properties: {
      variant: string(['primary', 'secondary', 'ghost', 'danger']),
      size: string(['small', 'medium']),
      type: string(['button', 'submit', 'reset']),
      disabled: boolean(),
      pending: boolean(),
    },
    events: ['click'],
  },
  'elnr-choice': {
    properties: {},
    attributes: {value: string(), label: string(), disabled: boolean()},
  },
  'elnr-choice-list': {
    properties: {
      name: string(),
      label: string(),
      value: string(),
      defaultValue: string(),
      error: string(),
      required: boolean(),
      disabled: boolean(),
    },
    events: ['elnr-input'],
  },
  'elnr-dialog': {
    properties: {open: boolean(), heading: string()},
    events: ['elnr-close'],
    methods: ['show', 'close'],
    slots: ['actions'],
  },
  'elnr-heading': {
    properties: {level: string(['1', '2', '3', '4', '5', '6'])},
  },
  'elnr-stack': {
    properties: {
      direction: string(['row', 'column']),
      gap: string(['xs', 'sm', 'md', 'lg']),
      align: string(['start', 'center', 'end', 'stretch']),
      wrap: string(['wrap', 'nowrap']),
    },
  },
  'elnr-text': {
    properties: {
      tone: string(['primary', 'secondary', 'positive', 'negative']),
      variant: string(['body', 'small', 'code']),
      live: string(['off', 'polite', 'assertive']),
    },
  },
  'elnr-text-area': {
    properties: {
      name: string(),
      label: string(),
      value: string(),
      defaultValue: string(),
      placeholder: string(),
      autocomplete: string(['off', 'on', 'name', 'email']),
      helper: string(),
      error: string(),
      required: boolean(),
      disabled: boolean(),
    },
    events: ['elnr-input'],
    methods: ['focus'],
  },
  'elnr-text-field': {
    properties: {
      name: string(),
      label: string(),
      value: string(),
      defaultValue: string(),
      placeholder: string(),
      autocomplete: string(['off', 'on', 'name', 'email']),
      helper: string(),
      error: string(),
      required: boolean(),
      disabled: boolean(),
    },
    events: ['elnr-input'],
    methods: ['focus'],
  },
} as const satisfies Readonly<Record<string, ElementContract>>;

export type ElanorElementName = keyof typeof elanorElementContracts;

export function isElanorElementName(value: string): value is ElanorElementName {
  return Object.hasOwn(elanorElementContracts, value);
}

export function validateContractValue(contract: PropertyContract, value: unknown): boolean {
  if (value == null) return true;
  if (contract.type === 'boolean') return typeof value === 'boolean' || value === '';
  if (typeof value !== 'string') return false;
  return contract.values === undefined || contract.values.includes(value);
}

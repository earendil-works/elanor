import {Combobox as BaseCombobox} from '@base-ui/react/combobox';

export {
  SearchableDropdownRoot as Root,
  SearchableDropdownLabel as Label,
  SearchableDropdownTrigger as Trigger,
  SearchableDropdownIcon as Icon,
  SearchableDropdownPopup as Popup,
  SearchableDropdownInputGroup as InputGroup,
  SearchableDropdownInput as Input,
  SearchableDropdownList as List,
  SearchableDropdownItem as Item,
  SearchableDropdownItemIndicator as ItemIndicator,
  SearchableDropdownGroupLabel as GroupLabel,
  SearchableDropdownSeparator as Separator,
  SearchableDropdownEmpty as Empty,
  SearchableDropdownStatus as Status,
} from '../searchable-dropdown.tsx';

export const Value = BaseCombobox.Value;
export const Portal = BaseCombobox.Portal;
export const Positioner = BaseCombobox.Positioner;
export const Group = BaseCombobox.Group;
export const Collection = BaseCombobox.Collection;
export const useFilter = BaseCombobox.useFilter;
export const useFilteredItems = BaseCombobox.useFilteredItems;
export const createItems = BaseCombobox.createItems;

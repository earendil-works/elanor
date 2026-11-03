import {Select as BaseSelect} from '@base-ui/react/select';

export {
  DropdownRoot as Root,
  DropdownLabel as Label,
  DropdownPrefix as Prefix,
  DropdownTrigger as Trigger,
  DropdownValueCount as ValueCount,
  DropdownIcon as Icon,
  DropdownPositioner as Positioner,
  DropdownPopup as Popup,
  DropdownList as List,
  DropdownItem as Item,
  DropdownItemIndicator as ItemIndicator,
  DropdownGroupLabel as GroupLabel,
  DropdownSeparator as Separator,
} from './dropdown.tsx';
export {DropdownControl as Control, DropdownClear as Clear} from './dropdown-control.tsx';

export const Value = BaseSelect.Value;
export const Portal = BaseSelect.Portal;
export const ItemText = BaseSelect.ItemText;
export const Group = BaseSelect.Group;

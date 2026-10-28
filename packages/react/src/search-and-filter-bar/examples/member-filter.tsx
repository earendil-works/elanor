import {Dropdown} from '@earendil-works/elanor-react';

export interface MemberFilterProps {
  readonly label: string;
  readonly value: string;
  readonly options: readonly string[];
  readonly onChange: (value: string) => void;
}

export function MemberFilter({label, value, options, onChange}: MemberFilterProps) {
  return (
    <Dropdown.Root
      value={value}
      items={options.map((option) => ({value: option, label: option}))}
      onValueChange={(next) => onChange(next ?? 'All')}
    >
      <Dropdown.Trigger>
        <span>
          {label}: <Dropdown.Value />
        </span>
        <Dropdown.Icon />
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Positioner alignItemWithTrigger={false}>
          <Dropdown.Popup>
            <Dropdown.List>
              {options.map((option) => (
                <Dropdown.Item key={option} value={option}>
                  <Dropdown.ItemIndicator />
                  <Dropdown.ItemText>{option}</Dropdown.ItemText>
                </Dropdown.Item>
              ))}
            </Dropdown.List>
          </Dropdown.Popup>
        </Dropdown.Positioner>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}

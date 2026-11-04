import {Dropdown} from '@earendil-works/elanor-react';

export interface MemberFilterProps {
  readonly label: string;
  /** The selected option, or `null` for no filter. */
  readonly value: string | null;
  readonly options: readonly string[];
  readonly onChange: (value: string | null) => void;
}

export function MemberFilter({label, value, options, onChange}: MemberFilterProps) {
  return (
    <Dropdown.Root value={value} onValueChange={onChange}>
      <Dropdown.Control>
        <Dropdown.Trigger>
          <Dropdown.Prefix>{label}</Dropdown.Prefix>
          <Dropdown.Value placeholder="All" />
          <Dropdown.Icon />
        </Dropdown.Trigger>
        <Dropdown.Clear aria-label={`Clear ${label} filter`} />
      </Dropdown.Control>
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

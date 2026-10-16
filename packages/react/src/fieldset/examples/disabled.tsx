import {Fieldset, Radio, SelectionControlAndLabel, Stack} from '@earendil-works/elanor-react';

const regions = ['Frankfurt', 'Virginia', 'Singapore'];

export default function FieldsetDisabled() {
  return (
    <Fieldset.Root disabled render={<Radio.Group defaultValue="Frankfurt" />}>
      <Fieldset.Legend>Region</Fieldset.Legend>
      <Stack gap="small">
        {regions.map((region) => (
          <SelectionControlAndLabel
            key={region}
            control={
              <Radio.Root value={region}>
                <Radio.Indicator />
              </Radio.Root>
            }
          >
            {region}
          </SelectionControlAndLabel>
        ))}
      </Stack>
    </Fieldset.Root>
  );
}

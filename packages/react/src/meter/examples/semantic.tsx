import {Grid, Meter, Stack} from '@earendil-works/elanor-react';
import type {MeterSemantic} from '@earendil-works/elanor-react';

const meters: ReadonlyArray<{label: string; value: number; semantic: MeterSemantic}> = [
  {label: 'Neutral', value: 40, semantic: 'neutral'},
  {label: 'Warning', value: 85, semantic: 'warning'},
  {label: 'Negative', value: 100, semantic: 'negative'},
];

export default function MeterSemanticExample() {
  return (
    <Grid.Root>
      <Grid.Item span={{base: 'full', xSmall: 6, medium: 4}}>
        <Stack gap="large" align="stretch">
          {meters.map(({label, value, semantic}) => (
            <Meter.Root key={label} value={value} semantic={semantic}>
              <Stack gap="xSmall" align="stretch">
                <Stack direction="row" gap="auto">
                  <Meter.Label>{label}</Meter.Label>
                  <Meter.Value />
                </Stack>
                <Meter.Track>
                  <Meter.Indicator />
                </Meter.Track>
              </Stack>
            </Meter.Root>
          ))}
        </Stack>
      </Grid.Item>
    </Grid.Root>
  );
}

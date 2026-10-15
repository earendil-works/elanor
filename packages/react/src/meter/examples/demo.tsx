import {Grid, Meter, Stack} from '@earendil-works/elanor-react';

export default function MeterDemo() {
  return (
    <Grid.Root>
      <Grid.Item span={{base: 'full', xSmall: 6, medium: 4}}>
        <Meter.Root value={24}>
          <Stack gap="xSmall" align="stretch">
            <Stack direction="row" gap="auto">
              <Meter.Label>Storage used</Meter.Label>
              <Meter.Value />
            </Stack>
            <Meter.Track>
              <Meter.Indicator />
            </Meter.Track>
          </Stack>
        </Meter.Root>
      </Grid.Item>
    </Grid.Root>
  );
}

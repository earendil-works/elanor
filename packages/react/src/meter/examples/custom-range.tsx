import {Grid, Meter, Stack} from '@earendil-works/elanor-react';

const used = 40;
const limit = 50;
const format = {style: 'currency', currency: 'USD', maximumFractionDigits: 0} as const;
const limitText = new Intl.NumberFormat('en-US', format).format(limit);

export default function MeterCustomRange() {
  return (
    <Grid.Root>
      <Grid.Item span={{base: 'full', xSmall: 6, medium: 4}}>
        <Meter.Root
          value={used}
          max={limit}
          format={format}
          locale="en-US"
          getAriaValueText={(formatted) => `${formatted} of ${limitText}`}
        >
          <Stack gap="xSmall" align="stretch">
            <Stack direction="row" gap="auto">
              <Meter.Label>Monthly budget</Meter.Label>
              <Meter.Value>{(formatted) => `${formatted} of ${limitText}`}</Meter.Value>
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

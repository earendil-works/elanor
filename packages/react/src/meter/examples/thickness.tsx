import {Grid, Meter, Stack} from '@earendil-works/elanor-react';

import styles from './meter.module.css';

export default function MeterThickness() {
  return (
    <Grid.Root>
      <Grid.Item span={{base: 'full', xSmall: 6, medium: 4}}>
        <Meter.Root value={60}>
          <Stack gap="xSmall" align="stretch">
            <Stack direction="row" gap="auto">
              <Meter.Label>Seats used</Meter.Label>
              <Meter.Value />
            </Stack>
            <Meter.Track className={styles.thin}>
              <Meter.Indicator />
            </Meter.Track>
          </Stack>
        </Meter.Root>
      </Grid.Item>
    </Grid.Root>
  );
}

import {Meter, Stack} from '@earendil-works/elanor-react';

import styles from './meter.module.css';

export default function MeterInline() {
  return (
    <Meter.Root value={42}>
      <Stack direction="row" gap="small" align="center">
        <Meter.Label>Context</Meter.Label>
        <Meter.Track className={`${styles.thin} ${styles.short}`}>
          <Meter.Indicator />
        </Meter.Track>
        <Meter.Value />
      </Stack>
    </Meter.Root>
  );
}

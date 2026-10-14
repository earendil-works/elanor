import {Card, Grid} from '@earendil-works/elanor-react';

import styles from './grid.module.css';

export default function GridNested() {
  return (
    <Grid.Root>
      {([4, 8] as const).map((span) => (
        <Grid.Item key={span} span={{base: 'full', small: span}}>
          <Grid.Root columns={2} gap="small">
            <Grid.Item render={<Card className={styles.cell} />}>Nested in {span} tracks</Grid.Item>
            <Grid.Item span={{base: 'full', xSmall: 1}} render={<Card className={styles.cell} />}>
              First
            </Grid.Item>
            <Grid.Item span={{base: 'full', xSmall: 1}} render={<Card className={styles.cell} />}>
              Second
            </Grid.Item>
          </Grid.Root>
        </Grid.Item>
      ))}
    </Grid.Root>
  );
}

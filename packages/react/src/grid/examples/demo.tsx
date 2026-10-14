import {Card, Grid, Stack} from '@earendil-works/elanor-react';
import {useState} from 'react';

import styles from './grid.module.css';

const sections = ['Overview', 'Usage', 'Activity', 'Members', 'Settings', 'Billing'];

export default function GridDemo() {
  const [width, setWidth] = useState(100);

  return (
    <Stack gap="large" align="stretch">
      <label>
        Grid width: {width}%{' '}
        <input
          type="range"
          min={20}
          max={100}
          value={width}
          onChange={(event) => setWidth(event.currentTarget.valueAsNumber)}
        />
      </label>
      <div style={{inlineSize: `${width}%`}}>
        <Grid.Root>
          {sections.map((section) => (
            <Grid.Item
              key={section}
              span={{base: 'full', xSmall: 6, small: 4}}
              render={<Card className={styles.cell} />}
            >
              {section}
            </Grid.Item>
          ))}
        </Grid.Root>
      </div>
    </Stack>
  );
}

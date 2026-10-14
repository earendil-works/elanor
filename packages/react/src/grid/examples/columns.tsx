import {Card, Grid, Stack, type GridColumns} from '@earendil-works/elanor-react';
import {useState} from 'react';

import styles from './grid.module.css';

export default function GridColumnsExample() {
  const [columns, setColumns] = useState<GridColumns>(4);

  return (
    <Stack gap="large" align="stretch">
      <label>
        Columns{' '}
        <select
          value={columns}
          onChange={(event) => setColumns(Number(event.currentTarget.value) as GridColumns)}
        >
          {Array.from({length: 12}, (_, index) => (
            <option key={index}>{index + 1}</option>
          ))}
        </select>
      </label>
      <Grid.Root columns={columns}>
        {Array.from({length: columns}, (_, index) => (
          <Grid.Item key={index} span={1} render={<Card className={styles.cell} />}>
            {index + 1}
          </Grid.Item>
        ))}
        <Grid.Item render={<Card className={styles.cell} />}>No span: a full row</Grid.Item>
        <Grid.Item span={12} render={<Card className={styles.cell} />}>
          span=12: clamped to the column count
        </Grid.Item>
      </Grid.Root>
    </Stack>
  );
}

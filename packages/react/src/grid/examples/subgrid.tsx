import {Card, Grid} from '@earendil-works/elanor-react';

import styles from './grid.module.css';

const filters = ['Status', 'Owner', 'Region', 'Period'];

export default function GridSubgridExample() {
  return (
    <Grid.Root>
      <Grid.Item span={{base: 'full', xSmall: 4}} render={<Card className={styles.cell} />}>
        Search
      </Grid.Item>
      <Grid.Subgrid span={{base: 'full', xSmall: 8}}>
        {filters.map((filter) => (
          <Grid.Item
            key={filter}
            span={{base: 'full', xSmall: 2}}
            render={<Card className={styles.cell} />}
          >
            {filter}
          </Grid.Item>
        ))}
      </Grid.Subgrid>
    </Grid.Root>
  );
}

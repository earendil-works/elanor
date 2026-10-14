import {Grid} from '@earendil-works/elanor-react';

import styles from './grid.module.css';

const projects = [
  {name: 'Website redesign', status: 'In review', owner: 'Alex Morgan'},
  {name: 'Billing migration', status: 'Draft', owner: 'Sam Lee'},
];

export default function GridSubgridExample() {
  return (
    <Grid.Root columns={4}>
      <Grid.Item span={2}>Project</Grid.Item>
      <Grid.Item span={1}>Status</Grid.Item>
      <Grid.Item span={1}>Owner</Grid.Item>
      {projects.map((project) => (
        // Each row is one element with its own background; its cells still use the root's columns.
        <Grid.Subgrid key={project.name} className={styles.row}>
          <Grid.Item span={2}>{project.name}</Grid.Item>
          <Grid.Item span={1}>{project.status}</Grid.Item>
          <Grid.Item span={1}>{project.owner}</Grid.Item>
        </Grid.Subgrid>
      ))}
    </Grid.Root>
  );
}

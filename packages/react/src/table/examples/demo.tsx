import {Table} from '@earendil-works/elanor-react';

const projects = [
  {name: 'Website redesign', status: 'Active', tasks: 8},
  {name: 'Design system', status: 'Active', tasks: 14},
  {name: 'Release notes', status: 'Draft', tasks: 2},
];

export default function TableDemo() {
  return (
    <Table.Container>
      <Table.Root aria-label="Projects">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell scope="col">Name</Table.HeaderCell>
            <Table.HeaderCell scope="col">Status</Table.HeaderCell>
            <Table.HeaderCell scope="col" align="end">
              Open tasks
            </Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {projects.map((project) => (
            <Table.Row key={project.name}>
              <Table.Cell>{project.name}</Table.Cell>
              <Table.Cell>{project.status}</Table.Cell>
              <Table.Cell align="end">{project.tasks}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.Container>
  );
}

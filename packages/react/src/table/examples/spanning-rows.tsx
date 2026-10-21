import {Link, Table} from '@earendil-works/elanor-react';

const services = [
  {
    name: 'API',
    deployments: [
      {region: 'eu-central-1', status: 'Healthy'},
      {region: 'us-east-1', status: 'Deploying'},
    ],
  },
  {name: 'Worker', deployments: [{region: 'eu-central-1', status: 'Healthy'}]},
];

export default function TableSpanningRows() {
  return (
    <Table.Container>
      <Table.Root aria-label="Deployments">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell scope="col">Service</Table.HeaderCell>
            <Table.HeaderCell scope="col">Region</Table.HeaderCell>
            <Table.HeaderCell scope="col">Status</Table.HeaderCell>
            <Table.HeaderCell scope="col" align="end">
              Action
            </Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {services.flatMap(({name, deployments}) =>
            deployments.map(({region, status}, index) => (
              <Table.Row key={`${name}-${region}`} spannedEdges={index > 0 ? 'both' : undefined}>
                {index === 0 ? <Table.Cell rowSpan={deployments.length}>{name}</Table.Cell> : null}
                <Table.Cell>{region}</Table.Cell>
                <Table.Cell>{status}</Table.Cell>
                {index === 0 ? (
                  <Table.Cell rowSpan={deployments.length} align="end">
                    <Link href="#">Manage</Link>
                  </Table.Cell>
                ) : null}
              </Table.Row>
            )),
          )}
        </Table.Body>
      </Table.Root>
    </Table.Container>
  );
}

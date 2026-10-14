import {Table} from '@earendil-works/elanor-react';

export default function TableTwoLineCells() {
  return (
    <Table.Container>
      <Table.Root aria-label="Environments">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell scope="col">Environment</Table.HeaderCell>
            <Table.HeaderCell scope="col">Status</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <Table.CellPrimary>Production</Table.CellPrimary>
              <Table.CellSecondary>eu-central-1</Table.CellSecondary>
            </Table.Cell>
            <Table.Cell>Healthy</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <Table.CellPrimary>Staging</Table.CellPrimary>
              <Table.CellSecondary>us-east-1</Table.CellSecondary>
            </Table.Cell>
            <Table.Cell>Deploying</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </Table.Container>
  );
}

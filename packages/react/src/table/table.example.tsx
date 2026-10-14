import {
  Table,
  TableBody,
  TableCell,
  TableCellPrimary,
  TableCellSecondary,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@earendil-works/elanor-react';

export function TableExample(): React.JSX.Element {
  return (
    <TableContainer>
      <Table aria-label="Projects">
        <TableHead>
          <TableRow>
            <TableHeaderCell scope="col">Name</TableHeaderCell>
            <TableHeaderCell scope="col">Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              <TableCellPrimary>Project Alpha</TableCellPrimary>
              <TableCellSecondary>Production environment</TableCellSecondary>
            </TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Project Beta</TableCell>
            <TableCell>Draft</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

import {Pagination, Stack, Text} from '@earendil-works/elanor-react';
import {useState} from 'react';

const projects = [
  'Website redesign',
  'Design system',
  'Release notes',
  'Customer research',
  'Help center',
  'Mobile app',
];
const pageSize = 2;
const pageCount = Math.ceil(projects.length / pageSize);

export function PaginationExample() {
  const [page, setPage] = useState(1);
  const start = (page - 1) * pageSize;

  return (
    <Stack gap="medium">
      <Text role="status">
        Projects {start + 1}–{start + pageSize} of {projects.length}
      </Text>
      <ul>
        {projects.slice(start, start + pageSize).map((project) => (
          <li key={project}>{project}</li>
        ))}
      </ul>
      <Pagination.Root summary={`Page ${page} of ${pageCount}`} aria-label="Project pages">
        <Pagination.Link
          href="#"
          disabled={page === 1}
          onClick={(event) => {
            event.preventDefault();
            setPage((current) => current - 1);
          }}
        >
          Previous
        </Pagination.Link>
        <Pagination.Separator />
        <Pagination.Link
          href="#"
          disabled={page === pageCount}
          onClick={(event) => {
            event.preventDefault();
            setPage((current) => current + 1);
          }}
        >
          Next
        </Pagination.Link>
      </Pagination.Root>
    </Stack>
  );
}

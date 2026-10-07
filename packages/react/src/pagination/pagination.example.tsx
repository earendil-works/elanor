import {useState} from 'react';
import {Pagination, PaginationLink, PaginationSeparator, Stack, Text} from '@earendil-works/elanor-react';

const projects = ['Website redesign', 'Design system', 'Release notes', 'Customer research', 'Help center', 'Mobile app'];
const pageSize = 2;
const pageCount = Math.ceil(projects.length / pageSize);

export function PaginationExample() {
  const [page, setPage] = useState(1);
  const start = (page - 1) * pageSize;

  return (
    <Stack gap="medium">
      <Text role="status">Projects {start + 1}–{start + pageSize} of {projects.length}</Text>
      <ul>
        {projects.slice(start, start + pageSize).map((project) => <li key={project}>{project}</li>)}
      </ul>
      <Pagination summary={`Page ${page} of ${pageCount}`} aria-label="Project pages">
        <PaginationLink
          href="#"
          disabled={page === 1}
          onClick={(event) => {
            event.preventDefault();
            setPage(current => current - 1);
          }}
        >
          Previous
        </PaginationLink>
        <PaginationSeparator />
        <PaginationLink
          href="#"
          disabled={page === pageCount}
          onClick={(event) => {
            event.preventDefault();
            setPage(current => current + 1);
          }}
        >
          Next
        </PaginationLink>
      </Pagination>
    </Stack>
  );
}

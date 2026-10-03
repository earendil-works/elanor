import {useEffect, useState} from 'react';
import {Pagination, PaginationLink, PaginationSeparator, Stack, Text} from '@earendil-works/elanor-react';

const projects = ['Website redesign', 'Design system', 'Release notes', 'Customer research', 'Help center', 'Mobile app'];
const pageSize = 2;
const pageCount = Math.ceil(projects.length / pageSize);

export function PaginationExample() {
  const [page, setPage] = useState(1);
  const start = (page - 1) * pageSize;

  useEffect(() => {
    const requested = Number(new URL(window.location.href).searchParams.get('page'));
    if (Number.isInteger(requested) && requested >= 1 && requested <= pageCount) setPage(requested);
  }, []);

  return (
    <Stack gap="medium">
      <Text role="status">Projects {start + 1}–{start + pageSize} of {projects.length}</Text>
      <ul>
        {projects.slice(start, start + pageSize).map((project) => <li key={project}>{project}</li>)}
      </ul>
      <Pagination summary={`Page ${page} of ${pageCount}`} aria-label="Project pages">
        <PaginationLink href={`?page=${page - 1}`} data-astro-reload disabled={page === 1}>Previous</PaginationLink>
        <PaginationSeparator />
        <PaginationLink href={`?page=${page + 1}`} data-astro-reload disabled={page === pageCount}>Next</PaginationLink>
      </Pagination>
    </Stack>
  );
}

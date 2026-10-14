import {FolderOpenIcon} from '@earendil-works/elanor-icons-react';
import {EmptyState, Link} from '@earendil-works/elanor-react';

export function EmptyStateExample(): React.JSX.Element {
  return (
    <EmptyState.Root>
      <EmptyState.Illustration>
        <FolderOpenIcon size={64} aria-hidden="true" />
      </EmptyState.Illustration>
      <EmptyState.Body>
        <EmptyState.Copy>
          <EmptyState.Title level={2}>No saved views</EmptyState.Title>
          <EmptyState.Description>Use filters to find the members you need.</EmptyState.Description>
        </EmptyState.Copy>
        <EmptyState.Actions>
          <Link href="/components/search-and-filter-bar">Explore member filters</Link>
        </EmptyState.Actions>
      </EmptyState.Body>
    </EmptyState.Root>
  );
}
